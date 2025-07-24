import os, json, urllib.parse
from flask import Flask, request, Response
from flask_cors import CORS
import vertexai
from vertexai.generative_models import GenerativeModel

PROJECT_ID = os.environ.get("PROJECT_ID")
LOCATION = os.environ.get("LOCATION")
app = Flask(__name__)
CORS(app)
vertexai.init(project=PROJECT_ID, location=LOCATION)
model = GenerativeModel("gemini-2.5-flash")

CODE_PROMPT_TEMPLATE = """Your one and only job is to be a code generator. You MUST generate a complete, fully functional, and playable HTML game. YOU MUST obey these rules. There are no exceptions.
1. Your ENTIRE response MUST be ONLY the HTML code for the game.
2. Start the response IMMEDIATELY with <!DOCTYPE html>.
3. All text visible inside the game must be in Korean.
4. All necessary CSS and JavaScript must be included within the single HTML file.
The user's game request is: "{user_prompt}"
"""
TRIVIA_PROMPT_TEMPLATE = """The user wants to create a game based on the following request: "{user_prompt}"
Your job is to act as a game historian and provide detailed, interesting trivia and background about this game. Provide the information in Korean. Use relevant emojis (like 🕹️, 💡, 🌍, 🎮, 🏆). Structure your response into at least 2-3 distinct and informative paragraphs. Include details about its origin, creator, and cultural impact.
"""

@app.route("/generate-stream")
def handle_code_stream():
    prompt = request.args.get('prompt', '')
    def generate_events():
        try:
            req_text = urllib.parse.unquote(prompt)
            final_prompt = CODE_PROMPT_TEMPLATE.format(user_prompt=req_text)
            stream = model.generate_content(final_prompt, stream=True)
            for chunk in stream:
                if chunk.text: yield f"data: {json.dumps({'code_chunk': chunk.text})}\n\n"
            yield f"data: {json.dumps({'event': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Error: {str(e)}'})}\n\n"
    return Response(generate_events(), mimetype='text/event-stream')

@app.route("/generate-trivia-stream")
def handle_trivia_stream():
    prompt = request.args.get('prompt', '')
    def generate_events():
        try:
            req_text = urllib.parse.unquote(prompt)
            final_prompt = TRIVIA_PROMPT_TEMPLATE.format(user_prompt=req_text)
            stream = model.generate_content(final_prompt, stream=True)
            for chunk in stream:
                if chunk.text: yield f"data: {json.dumps({'trivia_chunk': chunk.text})}\n\n"
            yield f"data: {json.dumps({'event': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Error: {str(e)}'})}\n\n"
    return Response(generate_events(), mimetype='text/event-stream')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
