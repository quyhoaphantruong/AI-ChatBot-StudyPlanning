from flask import Flask, request, jsonify, Response, stream_with_context
import requests
import json
from flask_cors import CORS
from config import system_message_review_plan, system_message_study_plan


app = Flask(__name__)
url =  "http://host.docker.internal:1234/v1/chat/completions"
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

@app.route("/")
def home():
    return "Welcome to the Study Planner Backend!"


@app.route("/study-plan2", methods=["POST"])
def generate_study_plan_v2():
    user_message = request.json.get("message")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    
    messages = [
        system_message_study_plan
    ]
    for message in user_message:
        messages.append(message)

    payload = {
        "model": "hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF",  
        "messages": messages,
        "stream": True 
    }
    try:
        response = requests.post(
            url,
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
    

@app.route("/review-study-plan", methods=["POST"])
def review_study_plan():
    user_messages = request.json.get("message")

    if not user_messages:
        return jsonify({"error": "Missing message field"}), 400
    
    messages = [
        system_message_review_plan,
    ]
    for message in user_messages:
        messages.append(message)

    payload = {
        "model": "hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF",
        "messages": messages,
        "stream": False
    }
    try:
        response = requests.post(
            url,
            json=payload
        )
        response.raise_for_status()

        result = response.json()
        feedback = result['choices'][0]['message']['content']
        return jsonify({"feedback": feedback})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
