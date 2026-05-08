from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import nlp_engine
from quiz_engine import generate_quiz

app = FastAPI(title="MentorAI NLP Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "beginner"

class EmbedRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "MentorAI Python Service is running"}

@app.post("/generate-quiz")
async def api_generate_quiz(request: QuizRequest):
    quiz_data = generate_quiz(request.topic, request.difficulty)
    return quiz_data

@app.post("/generate-embedding")
async def api_generate_embedding(request: EmbedRequest):
    embedding = nlp_engine.get_embedding(request.text)
    return {"embedding": embedding}

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form("")
):
    file_bytes = await file.read()
    results = nlp_engine.run_resume_analysis(file_bytes, file.filename, job_description)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
