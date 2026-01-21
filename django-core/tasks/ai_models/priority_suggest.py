import requests
import os

HF_API_KEY = os.getenv("HF_API_KEY")

MODEL_URL = (
    "https://api-inference.huggingface.co/models/"
    "distilbert-base-uncased-finetuned-sst-2-english"
)

Headers = {
    "Authorization": f"Bearer {HF_API_KEY}"
}

def suggest_priority(title, description):
    text = f"{title} {description}".lower()

    # 🔴 STRONG RULE-BASED SIGNALS (FIRST)
    urgent_keywords = [
        "urgent", "asap", "immediately", "by tomorrow",
        "prod", "production", "blocked", "failure", "down"
    ]

    for word in urgent_keywords:
        if word in text:
            return "HIGH"

    # 🟡 AI FALLBACK (SENTIMENT MODEL)
    try:
        response = requests.post(
            MODEL_URL,
            headers=Headers,
            json={"inputs": text},
            timeout=10
        )

        if response.status_code != 200:
            return "MEDIUM"

        result = response.json()[0]
        label = result.get("label")

        if label == "NEGATIVE":
            return "HIGH"

    except Exception:
        pass

    return "MEDIUM"