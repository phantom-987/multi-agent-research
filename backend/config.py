import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-4o"
MAX_TOKENS = 2048

# Tavily (web search)
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Qdrant (vector memory)
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_COLLECTION = "research_memory"

# Postgres
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://localhost:5432/research")

# App
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", 8000))
CORS_ORIGINS = ["http://localhost:3000"]