from fastapi import FastAPI, responses
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cv_review_route
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize FastAPI app
app = FastAPI(
    title="CV Reviewer",
    description="cv_ reviewer",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(cv_review_route.router, prefix="/review", tags=["CV Review"])

@app.get("/")
async def redirect_to_docs():
    """Redirects the root URL to the /docs endpoint."""
    try:
        logging.info("🔄 Redirecting to /docs")
        return responses.RedirectResponse(url="/docs")
    except Exception as e:
        logging.error(f"‼️ Error redirecting to /docs: {e}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    logging.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
