import re
import io
import spacy
from sentence_transformers import SentenceTransformer, util
import pdfplumber
import docx

# Lazy load models to speed up startup, but for production you'd load these on init
_sentence_model = None
_spacy_model = None

def get_sentence_model():
    global _sentence_model
    if _sentence_model is None:
        _sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
    return _sentence_model

def get_spacy_model():
    global _spacy_model
    if _spacy_model is None:
        try:
            _spacy_model = spacy.load("en_core_web_sm")
        except OSError:
            from spacy.cli import download
            download("en_core_web_sm")
            _spacy_model = spacy.load("en_core_web_sm")
    return _spacy_model

def get_embedding(text: str) -> list:
    """Generate a 384-dimensional embedding vector for a given text string."""
    model = get_sentence_model()
    return model.encode(text, normalize_embeddings=True).tolist()

# Weak action verbs list
WEAK_VERBS = ["worked", "helped", "did", "made", "was", "handled", "assisted", "responsible"]
STRONG_VERBS = ["architected", "developed", "engineered", "designed", "spearheaded", "optimized", "implemented", "built"]

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    text = ""
    if filename.endswith(".pdf"):
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print("PDF Extraction Error:", e)
    elif filename.endswith(".docx"):
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print("DOCX Extraction Error:", e)
    else:
        text = file_bytes.decode('utf-8', errors='ignore')
    return text

def analyze_bullets(text: str):
    nlp = get_spacy_model()
    lines = text.split("\n")
    bullet_feedback = []
    
    for line in lines:
        line = line.strip()
        # Detect bullet-like sentences (start with -, *, •, or just are short standalone action sentences)
        if re.match(r"^[-*•]", line) or (len(line) > 20 and len(line) < 200 and not line.endswith(".")):
            # Normalize bullet
            clean_line = re.sub(r"^[-*•]\s*", "", line)
            if not clean_line: continue
            
            doc = nlp(clean_line)
            # Find the root verb
            root_verb = None
            for token in doc:
                if token.pos_ == "VERB" or token.dep_ == "ROOT":
                    root_verb = token.lemma_.lower()
                    break
            
            if root_verb in WEAK_VERBS:
                bullet_feedback.append({
                    "bullet": clean_line,
                    "issue": f"Weak action verb '{root_verb}'.",
                    "suggestion": f"Try replacing with stronger verbs like: {', '.join(STRONG_VERBS[:3])}."
                })
            elif root_verb and not any(char.isdigit() for char in clean_line):
                 # No metrics
                 bullet_feedback.append({
                    "bullet": clean_line,
                    "issue": "Missing measurable impact (numbers/metrics).",
                    "suggestion": "Add concrete metrics (e.g., 'improved X by Y%')."
                })

    return bullet_feedback[:5] # Return top 5 issues

def compare_to_job(resume_text: str, job_description: str):
    if not job_description.strip():
        return 0.0
    model = get_sentence_model()
    embeddings = model.encode([resume_text, job_description])
    sim = util.cos_sim(embeddings[0], embeddings[1])
    return round(float(sim[0][0]) * 100, 2)

def detect_skills(text: str, jd_skills: list = None):
    # Very basic static skill matching for MVP. 
    # In a full system, you would use an NER model trained on technical skills or a massive taxonomy.
    common_skills = {"python", "javascript", "react", "sql", "postgres", "fastapi", "docker", "aws", "kubernetes", "node", "typescript", "machine learning", "nlp", "llm"}
    text_lower = text.lower()
    
    found_skills = [s for s in common_skills if s in text_lower]
    
    gaps = []
    if jd_skills:
        jd_skills_lower = [s.lower() for s in jd_skills]
        gaps = [s for s in jd_skills_lower if s not in text_lower]
        
    return found_skills, gaps

def run_resume_analysis(file_bytes: bytes, filename: str, job_description: str = ""):
    text = extract_text_from_bytes(file_bytes, filename)
    
    bullet_feedback = analyze_bullets(text)
    match_score = compare_to_job(text, job_description)
    
    # Assume JD implicitly asks for these if none provided for MVP
    jd_skills = ["python", "react", "sql", "docker"] if not job_description else [] 
    
    found_skills, gaps = detect_skills(text, jd_skills)
    
    # Heuristic ATS score
    ats_score = 50 + min(len(found_skills) * 5, 20) - min(len(bullet_feedback) * 5, 20)
    if job_description:
        ats_score = (ats_score + match_score) / 2
        
    ats_score = max(0, min(100, round(ats_score)))

    return {
        "ats_score": ats_score,
        "match_percentage": match_score,
        "skill_gaps": gaps,
        "found_skills": found_skills,
        "bullet_feedback": bullet_feedback,
        "extracted_text_snippet": text[:200]
    }
