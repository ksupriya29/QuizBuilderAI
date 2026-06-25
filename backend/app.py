from flask import Flask, request, jsonify
from flask_cors import CORS
from pptx import Presentation
import requests, os, io, json
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

@app.route("/parse", methods=["POST"])
def parse_pptx():
    file = request.files["file"]
    prs = Presentation(io.BytesIO(file.read()))
    slides = []
    for i, slide in enumerate(prs.slides):
        text = " ".join(
            shape.text for shape in slide.shapes if hasattr(shape, "text")
        )
        if text.strip():
            slides.append({"slide": i + 1, "text": text.strip()})
    total_words = sum(len(s["text"].split()) for s in slides)
    return jsonify({
        "slide_count": len(prs.slides),
        "word_count": total_words,
        "slides": slides
    })

@app.route("/generate", methods=["POST"])
def generate_quiz():
    try:
        data = request.json
        slide_text = data["slide_text"]
        num_questions = data["num_questions"]
        difficulty = data["difficulty"]

        prompt = f"""You are a quiz generator. Given the slide content below, generate exactly {num_questions} MCQ questions at {difficulty} difficulty.

Rules:
- Each question has exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Distractors must be plausible
- Include explanation for each wrong option

Return ONLY valid JSON array (no markdown, no extra text):
[
  {{
    "question": "...",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "correct": "B",
    "explanations": {{
      "A": "Why A is wrong",
      "C": "Why C is wrong",
      "D": "Why D is wrong"
    }}
  }}
]

Slide Content:
{slide_text}"""

        if DEEPSEEK_API_KEY and DEEPSEEK_API_KEY.startswith("sk-or-"):
            api_url = "https://openrouter.ai/api/v1/chat/completions"
            model = "deepseek/deepseek-chat"
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            }
        else:
            api_url = "https://api.deepseek.com/chat/completions"
            model = "deepseek-chat"
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            }

        # Retry up to 2 times on empty/transient errors
        retries = 0
        max_retries = 2
        while retries <= max_retries:
            response = requests.post(api_url, headers=headers, json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            })

            if not response.ok:
                error_detail = response.text
                print(f"[ERROR] API returned {response.status_code}: {error_detail}")
                return jsonify({"error": f"API error {response.status_code}: {error_detail}"}), response.status_code

            raw = response.text.strip()
            if raw:
                break
            retries += 1
            print(f"[WARN] Empty API response, retry {retries}/{max_retries}")
        
        if not raw:
            return jsonify({"error": "AI API returned empty response after retries"}), 502

        # Try to parse the response - sometimes the API wrapper sends whitespace before JSON
        # or the content itself has escaped JSON that needs double-parsing
        print(f"[DEBUG] Raw response length: {len(raw)}, first 200: {raw[:200]}")
        
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        print(f"[DEBUG] Content from API (first 300): {content[:300]}")
        
        # Clean the content - remove markdown code fences if present
        content = content.replace("```json", "").replace("```", "").strip()
        
        # If content is empty, try direct content from raw response
        if not content:
            print(f"[WARN] Empty content field, trying raw response body")
            return jsonify({"error": "AI returned empty content"}), 502
        
        # Try to parse as JSON - if content is double-escaped (string inside string), handle it
        try:
            questions = json.loads(content)
        except json.JSONDecodeError:
            # Content might be double-escaped JSON string - try to extract
            print(f"[WARN] Direct parse failed, content starts with: {content[:100]}")
            # Try to find JSON array brackets in the content
            start = content.find('[')
            end = content.rfind(']')
            if start != -1 and end != -1:
                extracted = content[start:end+1]
                print(f"[DEBUG] Extracted JSON substring: {extracted[:200]}")
                questions = json.loads(extracted)
            else:
                raise
        
        return jsonify({"questions": questions})
    except Exception as e:
        print(f"[ERROR] Exception in generate_quiz: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)