import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Get API key from environment
api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    print("❌ Error: OPENROUTER_API_KEY not found in environment variables")
    print("Please set it in your .env file or environment variables")
    exit(1)

print("✅ Found OpenRouter API key")

# Test API call
try:
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/shreyas250825/IIT-B-Finals/",
        },
        json={
            "model": "amazon/nova-2-lite-v1:free",
            "messages": [
                {"role": "user", "content": "Hello, can you tell me a short joke?"}
            ]
        },
        timeout=10
    )
    
    if response.status_code == 200:
        print("✅ Successfully connected to OpenRouter API")
        print("Response:", response.json())
    else:
        print(f"❌ Error: API request failed with status {response.status_code}")
        print("Response:", response.text)
        
except Exception as e:
    print(f"❌ Error making API request: {e}")
