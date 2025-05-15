from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    groq_model: str = "llama-3.3-70b-versatile"
    temperature: float = 0.7
    max_tokens: int = 1500

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
