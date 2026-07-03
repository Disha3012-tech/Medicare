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

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()