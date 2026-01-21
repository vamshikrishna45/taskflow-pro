import os
from groq import Groq

def enhance_description(text: str) -> str:
    # Debug: Check if key exists
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY not found in environment!")
        return text
    
    print(f"✅ API Key loaded: {api_key[:10]}...")  # Print first 10 chars
    
    try:
        client = Groq(api_key=api_key)
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a text enhancement assistant. Rewrite text to fix grammar/spelling and improve clarity while keeping the original meaning. Return ONLY the rewritten text, no explanations."
                },
                {
                    "role": "user",
                    "content": f"Rewrite this professionally:\n\n{text}"
                }
            ],
            temperature=0.3,
            max_tokens=150
        )
        
        enhanced = response.choices[0].message.content.strip()
        
        if not enhanced or enhanced.lower() == text.lower():
            return text
            
        return enhanced
        
    except Exception as e:
        print(f"❌ Groq Error: {type(e).__name__}: {e}")
        return text