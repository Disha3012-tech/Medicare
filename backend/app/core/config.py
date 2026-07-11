from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "development"

    database_url: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    client_url: str = "http://localhost:5173"

    upload_dir: str = "uploads"
    max_file_size_mb: int = 10

    # Featherless API credentials (required for AI features)
    featherless_api_key: str = ""
    featherless_model: str = "google/gemma-2-9b-it"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()