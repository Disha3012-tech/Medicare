import json
import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.symptom import SymptomCheckRequest, SymptomCheckResponse

router = APIRouter(prefix="/symptom-check", tags=["symptom-checker"])

SYSTEM_PROMPT = """
You are a medical triage assistant.

Return ONLY valid JSON.

Schema:

{
  "conditions": [
    {
      "name": "string",
      "probability": "High",
      "description": "string",
      "urgency": "routine"
    }
  ],
  "specialists": [
    "General Practice"
  ],
  "emergency": false
}

Rules:

- Output ONLY JSON.
- No markdown.
- No ```json.
- No explanation.
- Do not omit quotes.
- Produce syntactically valid JSON.
"""

API_URL = "https://api.featherless.ai/v1/chat/completions"


async def ask_model(messages):
    async with httpx.AsyncClient(timeout=60.0) as client:
        return await client.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {settings.featherless_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.featherless_model,
                "messages": messages,
                "temperature": 0,
                "max_tokens": 500,
                "response_format": {
                    "type": "json_object"
                },
            },
        )


@router.post("", response_model=SymptomCheckResponse)
async def check_symptoms(
    payload: SymptomCheckRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one symptom is required",
        )

    if not settings.featherless_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Featherless API key not configured",
        )

    print("\n" + "=" * 80)
    print("MODEL LOADED:", settings.featherless_model)
    print("API KEY EXISTS:", bool(settings.featherless_api_key))
    print("=" * 80)

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": "Symptoms: " + ", ".join(payload.symptoms),
        },
    ]

    try:

        response = await ask_model(messages)

        print("\n" + "=" * 80)
        print("Featherless Status Code:", response.status_code)
        print("Featherless Response:")
        print(response.text)
        print("=" * 80 + "\n")

        response.raise_for_status()

        data = response.json()

        content = data["choices"][0]["message"]["content"].strip()

        if content.startswith("```"):
            content = content.replace("```json", "")
            content = content.replace("```", "").strip()

        try:
            parsed = json.loads(content)

        except json.JSONDecodeError:

            print("\nINVALID JSON. RETRYING...\n")

            messages.append(
                {
                    "role": "assistant",
                    "content": content,
                }
            )

            messages.append(
                {
                    "role": "user",
                    "content": (
                        "Your previous response was invalid JSON. "
                        "Return ONLY valid JSON matching the schema. "
                        "Do not omit quotes. "
                        "Do not include markdown."
                    ),
                }
            )

            retry = await ask_model(messages)

            print("\nRETRY RESPONSE:\n")
            print(retry.text)

            retry.raise_for_status()

            retry_json = retry.json()

            content = retry_json["choices"][0]["message"]["content"].strip()

            if content.startswith("```"):
                content = content.replace("```json", "")
                content = content.replace("```", "").strip()

            parsed = json.loads(content)

        return SymptomCheckResponse(**parsed)

    except httpx.HTTPStatusError as e:

        print("\nHTTP ERROR")
        print(e.response.text)

        raise HTTPException(
            status_code=e.response.status_code,
            detail=e.response.text,
        )

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned invalid JSON twice.",
        )

    except httpx.RequestError as e:

        print("\nREQUEST ERROR")
        print(e)

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach Featherless API.",
        )

    except Exception as e:

        print("\nUNKNOWN ERROR")
        print(type(e).__name__)
        print(e)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )