from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_cloud_project: str = "demo-project"
    firestore_emulator_host: Optional[str] = None
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    quote_cache_ttl_minutes: int = 15

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
