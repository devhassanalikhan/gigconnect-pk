import os
import sys
import asyncio
from dotenv import load_dotenv

# Reconfigure stdout/stderr to use utf-8 on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Load env
backend_path = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\backend"
sys.path.insert(0, backend_path)
os.chdir(backend_path)
load_dotenv(".env")

from orchestrator import classify_intent

async def main():
    test_cases = [
        "AC",
        "Plumber",
        "Electrician",
        "Painter",
        "Bijli",
        "Mistri",
        "Hello",
        "Assalam-o-Alaikum",
        "Kya haal hai",
        "Hi, I need an electrician",
    ]
    
    print("Testing Intent Classifier Rule Precedence:")
    print("=" * 60)
    for tc in test_cases:
        res = await classify_intent(tc)
        print(f"Input: {tc:<30} | Classified Intent: {res['intent']}")
    print("=" * 60)

asyncio.run(main())
