import os
import re

search_dir = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\mobile"
pattern = re.compile(r"api/escrow/lock", re.IGNORECASE)

for root, dirs, files in os.walk(search_dir):
    if "node_modules" in root or ".expo" in root or ".git" in root:
        continue
    for file in files:
        if file.endswith((".ts", ".tsx", ".js", ".jsx")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for i, line in enumerate(f, 1):
                        if pattern.search(line):
                            print(f"{file}:{i} -> {line.strip()}")
            except Exception as e:
                pass
