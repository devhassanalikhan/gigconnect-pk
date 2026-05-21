import json

path = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk\antigravity_traces\logs\transcript.jsonl"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in [128, 129, 130, 183, 184, 185]:
    if idx < len(lines):
        print(f"--- Line {idx + 1} ---")
        line_str = lines[idx]
        if len(line_str) > 500:
            print(line_str[:500] + "... [TRUNCATED]")
        else:
            print(line_str)
