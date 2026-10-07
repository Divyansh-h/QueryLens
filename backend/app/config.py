from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    backend_port: int = 8000
    secret_key: str = "super-secret-default"
    debug: bool = True
    database_url: str = "postgresql://querylens_ro:ro_pass@localhost:5432/querylens"
    admin_database_url: str = "postgresql://querylens_admin:admin_pass@localhost:5432/querylens"
    vite_api_base_url: str = "http://localhost:5173"
    allowed_origins: str = "*"

    model_config = SettingsConfigDict(
        # Attempt to load from both the backend directory and the project root
        env_file=["../.env", ".env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
