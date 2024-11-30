from flask import Flask, request, jsonify, Response, stream_with_context
import requests
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

@app.route("/")
def home():
    return "Welcome to the Study Planner Backend!"

@app.route("/study-plan", methods=["POST"])
def create_study_plan():
    user_data = request.json

    # Validate input
    if not user_data.get("topic") or not user_data.get("time_frame"):
        return jsonify({"error": "Missing required fields"}), 400

    # Prepare the LLMStudio prompt
    prompt = (
        f"Create a detailed study plan to master {user_data['topic']} in {user_data['time_frame']} days. "
        f"Consider the user's preferred learning style: {user_data.get('learning_style', 'none')}."
    )

    payload = {
        "model": "hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF",  
        "messages": [{"role": "user", "content": prompt}],
        "stream": True  
    }

    try:
        response = requests.post(
            "http://localhost:1234/v1/chat/completions",
            json=payload,
            stream=True 
        )
        response.raise_for_status()

        def generate():
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    decoded_line = line.strip()
                    if decoded_line.startswith('data: '):
                    
                        json_data = decoded_line[len('data: '):]

                        if json_data.strip() == '[DONE]':
                            break

                        try:
                            data = json.loads(json_data)
                            delta = data['choices'][0]['delta']
                            content = delta.get('content', '')
                            if content:
                                yield content
                        except json.JSONDecodeError as e:
                            print(f"JSONDecodeError: {e}")
                            continue
                    else:
                        continue

        headers = {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
        }

        return Response(stream_with_context(generate()), headers=headers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

chat_history = [] 

@app.route("/study-plan2", methods=["POST"])
def generate_study_plan_v2():
    user_message = request.json.get("message")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    chat_history.append({"role": "user", "content": user_message})

    messages = chat_history.copy()

    system_message = {
        "role": "system",
        "content": "Role: You are an expert on educational planning. You will help people create personalized plans based on their preferences."
    }
    messages.insert(0, system_message)

    payload = {
        "model": "hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF",  
        "messages": messages,
        "stream": True 
    }

    try:
        response = requests.post(
            "http://host.docker.internal:1234/v1/chat/completions",
            json=payload,
            stream=True
        )
        response.raise_for_status()

        def generate():
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    decoded_line = line.strip()
                    if decoded_line.startswith('data: '):
                    
                        json_data = decoded_line[len('data: '):]

                        if json_data.strip() == '[DONE]':
                            break

                        # Parse the JSON data
                        try:
                            data = json.loads(json_data)
                            # Extract the content delta
                            delta = data['choices'][0]['delta']
                            content = delta.get('content', '')

                            if content:
                                yield content

                        except json.JSONDecodeError as e:
                            print(f"JSONDecodeError: {e}")
                            continue 

        return Response(stream_with_context(generate()), content_type='text/plain')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
