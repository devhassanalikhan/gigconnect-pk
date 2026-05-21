import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

# Load env
os.chdir(r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\backend")
load_dotenv(".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("API KEY:", GEMINI_API_KEY)

genai.configure(api_key=GEMINI_API_KEY)
model_name = "gemini-1.5-flash" # Let's see if 1.5 works or 2.5-flash
# Let's list models
try:
    for m in genai.list_models():
        print(m.name)
except Exception as e:
    print("Error listing models:", e)

try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    res = model.generate_content("Hello, how are you?")
    print("2.5 flash response:", res.text)
except Exception as e:
    print("Error with 2.5-flash:", e)

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    res = model.generate_content("Hello, how are you?")
    print("1.5 flash response:", res.text)
except Exception as e:
    print("Error with 1.5-flash:", e)
