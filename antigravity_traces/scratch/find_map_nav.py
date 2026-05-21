import os
import re

path = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\mobile\screens\MapScreen.tsx"
pattern = re.compile(r"navigate", re.IGNORECASE)

try:
    with open(path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            if pattern.search(line):
                print(f"{i} -> {line.strip()}")
except Exception as e:
    print(f"Error: {e}")
