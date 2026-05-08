import os
import json
from groq import Groq

# Fallback generator if Groq API key is not present
def fallback_quiz_generator(topic: str, difficulty: str):
    return {
        "topic": topic,
        "difficulty": difficulty,
        "questions": [
            {
                "type": "mcq",
                "question": f"What is the primary purpose of {topic}?",
                "options": [
                    "To optimize backend database queries.",
                    "To structure learning correctly.",
                    f"A fundamental concept in {topic}.",
                    "A deprecated programming pattern."
                ],
                "correct_index": 2,
                "explanation": f"This is a placeholder explanation for {topic}."
            },
            {
                "type": "conceptual",
                "question": f"Explain how {topic} improves system design.",
                "rubric": "Look for keywords related to efficiency, scale, or logic."
            }
        ]
    }

def generate_quiz(topic: str, difficulty: str):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("Warning: GROQ_API_KEY not found. Using fallback template generator.")
        return fallback_quiz_generator(topic, difficulty)

    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""
        You are an expert technical interviewer and computer science professor.
        Generate a {difficulty} level quiz about '{topic}'.
        
        The quiz must strictly be in valid JSON format matching this schema:
        {{
            "topic": "{topic}",
            "difficulty": "{difficulty}",
            "questions": [
                {{
                    "type": "mcq",
                    "question": "string",
                    "options": ["string", "string", "string", "string"],
                    "correct_index": number (0-3),
                    "explanation": "string explaining why"
                }},
                {{
                    "type": "conceptual",
                    "question": "string",
                    "rubric": "string mentioning keywords to look for in the user's answer"
                }}
            ]
        }}
        
        Include 2 MCQ questions and 1 conceptual question. Make the questions challenging but fair for a {difficulty} level.
        Only return the JSON. Do not return markdown backticks or any other text.
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        response_text = chat_completion.choices[0].message.content
        return json.loads(response_text)
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return fallback_quiz_generator(topic, difficulty)
