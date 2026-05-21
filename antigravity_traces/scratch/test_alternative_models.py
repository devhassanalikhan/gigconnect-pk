import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load env
os.chdir(r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\backend")
load_dotenv(".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

for model_name in ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-lite"]:
    try:
        model = genai.GenerativeModel(model_name)
        res = model.generate_content("Hello, how are you?")
        print(f"SUCCESS with {model_name}:", res.text)
    except Exception as e:
        print(f"Error with {model_name}:", e)
