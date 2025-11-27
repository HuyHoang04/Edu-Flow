import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyD22QZ58fxYBS095eFxvvh-rCrxcEa2sEI'

import google.generativeai as genai

try:
    genai.configure(api_key=os.environ['GEMINI_API_KEY'])
    
    # List available models
    print("Available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - {m.name}")
    
    # Try generating
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello!")
    print("\nTest generation:")
    print(response.text)
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
