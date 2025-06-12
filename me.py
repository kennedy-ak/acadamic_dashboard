import requests
import json

# Your API key
API_KEY = "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"

def test_groq_api_key():
    print("Testing Groq API Key...")
    print(f"Key: {API_KEY[:15]}...")
    
    # Test 1: Check if we can list models
    print("\n1. Testing model listing...")
    try:
        response = requests.get(
            "https://api.groq.com/openai/v1/models",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            print("✅ API Key is valid - can access models")
            models = response.json()
            print(f"Available models: {len(models.get('data', []))}")
        else:
            print(f"❌ Failed to list models: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing models: {e}")
        return False
    
    # Test 2: Try a simple chat completion
    print("\n2. Testing chat completion...")
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "user", "content": "Say hello in one word"}
                ],
                "max_tokens": 10
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            message = result['choices'][0]['message']['content']
            print(f"✅ Chat completion works! Response: {message}")
            return True
        else:
            print(f"❌ Chat completion failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing chat: {e}")
        return False

if __name__ == "__main__":
    success = test_groq_api_key()
    if success:
        print("\n🎉 Your API key is working perfectly!")
    else:
        print("\n💥 Your API key has issues. Get a new one from https://console.groq.com/keys")