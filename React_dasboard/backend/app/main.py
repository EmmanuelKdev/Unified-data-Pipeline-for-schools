from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.config import settings
from app.db.database import Base, engine
from app.db.seed import seed_admin_user
from app.api import auth, overview, academics, attendance, finance, courses, students

# Initialize SQLAlchemy tables
Base.metadata.create_all(bind=engine)
seed_admin_user()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(overview.router, prefix=settings.API_V1_STR)
app.include_router(academics.router, prefix=settings.API_V1_STR)
app.include_router(attendance.router, prefix=settings.API_V1_STR)
app.include_router(finance.router, prefix=settings.API_V1_STR)
app.include_router(courses.router, prefix=settings.API_V1_STR)
app.include_router(students.router, prefix=settings.API_V1_STR)



@app.get("/")
def root():
    return {"message": "Welcome to School Analytics Platform API", "status": "online"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)