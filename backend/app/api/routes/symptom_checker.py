import json

from fastapi import APIRouter, Depends, HTTPException, status
from google import genai

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.symptom import SymptomCheckRequest, SymptomCheckResponse


router = APIRouter(
    prefix="/symptom-check",
    tags=["symptom-checker"],
)


SYSTEM_PROMPT = """
You are a medical triage assistant for a healthcare application.

You are NOT a doctor and must not claim to provide a medical diagnosis.

Analyze the symptoms provided by the user and provide a cautious triage-oriented response.

Return ONLY valid JSON.

The JSON must exactly follow this schema:

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
- Do NOT use markdown.
- Do NOT use ```json.
- Do NOT include explanations outside the JSON.
- Do NOT omit quotation marks.
- Produce syntactically valid JSON.
- probability MUST be one of: High, Moderate, Low.
- urgency MUST be one of: routine, soon, urgent.
- emergency MUST be true or false.
- If symptoms could indicate a medical emergency, set emergency to true
  and use urgency "urgent".
- Do not claim certainty or provide a definitive diagnosis.
- Recommend appropriate medical specialists based on the symptoms.
"""


def get_gemini_client():
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured",
        )

    return genai.Client(
        api_key=settings.gemini_api_key
    )


async def ask_model(symptoms: list[str]):
    client = get_gemini_client()

    prompt = (
        SYSTEM_PROMPT
        + "\n\nSymptoms reported by the user:\n"
        + ", ".join(symptoms)
    )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config={
            "temperature": 0,
            "response_mime_type": "application/json",
        },
    )

    return response.text


@router.post(
    "",
    response_model=SymptomCheckResponse,
)
async def check_symptoms(
    payload: SymptomCheckRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one symptom is required",
        )

    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured",
        )

    print("\n" + "=" * 80)
    print("GEMINI MODEL:", settings.gemini_model)
    print("API KEY EXISTS:", bool(settings.gemini_api_key))
    print("=" * 80)

    try:
        content = await ask_model(payload.symptoms)

        print("\n" + "=" * 80)
        print("Gemini Response:")
        print(content)
        print("=" * 80 + "\n")

        if not content:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Gemini returned an empty response.",
            )

        content = content.strip()

        # Safety cleanup in case Gemini still returns markdown fences
        if content.startswith("```"):
            content = content.replace("```json", "")
            content = content.replace("```", "")
            content = content.strip()

        try:
            parsed = json.loads(content)

        except json.JSONDecodeError:

            print("\nINVALID JSON. RETRYING...\n")

            retry_prompt = (
                SYSTEM_PROMPT
                + "\n\nSymptoms reported by the user:\n"
                + ", ".join(payload.symptoms)
                + "\n\nYour previous response was invalid JSON."
                + "\nReturn ONLY valid JSON matching the required schema."
                + "\nDo not include markdown."
            )

            client = get_gemini_client()

            retry = client.models.generate_content(
                model=settings.gemini_model,
                contents=retry_prompt,
                config={
                    "temperature": 0,
                    "response_mime_type": "application/json",
                },
            )

            retry_content = retry.text.strip()

            if retry_content.startswith("```"):
                retry_content = retry_content.replace("```json", "")
                retry_content = retry_content.replace("```", "")
                retry_content = retry_content.strip()

            print("\nRETRY RESPONSE:\n")
            print(retry_content)

            parsed = json.loads(retry_content)

        return SymptomCheckResponse(**parsed)

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned invalid JSON twice.",
        )

    except HTTPException:
        raise

    except Exception as e:

        print("\nGEMINI ERROR")
        print(type(e).__name__)
        print(e)

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to process symptom check: {str(e)}",
        )