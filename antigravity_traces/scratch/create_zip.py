import os
import shutil
import zipfile

# Source directories
brain_dir = r"C:\Users\Dell\.gemini\antigravity\brain\37fa286c-59e7-4ff4-b361-ebd5209758a5"
repo_dir = r"c:\Users\Dell\freelance_projects\Ai-Seekho\gigconnect-pk"
target_traces_dir = os.path.join(repo_dir, "antigravity_traces")

# Create target directory
if os.path.exists(target_traces_dir):
    shutil.rmtree(target_traces_dir)
os.makedirs(target_traces_dir, exist_ok=True)

# Files to copy from brain root
files_to_copy = ["implementation_plan.md", "task.md", "walkthrough.md"]
for f in files_to_copy:
    src_path = os.path.join(brain_dir, f)
    if os.path.exists(src_path):
        shutil.copy2(src_path, target_traces_dir)
        print(f"Copied {f}")

# Copy scratch directory
src_scratch = os.path.join(brain_dir, "scratch")
dest_scratch = os.path.join(target_traces_dir, "scratch")
if os.path.exists(src_scratch):
    shutil.copytree(src_scratch, dest_scratch)
    print("Copied scratch directory")

# Copy logs (transcript.jsonl)
src_logs_dir = os.path.join(brain_dir, ".system_generated", "logs")
dest_logs_dir = os.path.join(target_traces_dir, "logs")
os.makedirs(dest_logs_dir, exist_ok=True)
src_transcript = os.path.join(src_logs_dir, "transcript.jsonl")
if os.path.exists(src_transcript):
    shutil.copy2(src_transcript, dest_transcript := os.path.join(dest_logs_dir, "transcript.jsonl"))
    print("Copied transcript.jsonl")

# Copy ANTIGRAVITY_WORKFLOW_LOGS.md from repo root
src_workflow_logs = os.path.join(repo_dir, "ANTIGRAVITY_WORKFLOW_LOGS.md")
if os.path.exists(src_workflow_logs):
    shutil.copy2(src_workflow_logs, target_traces_dir)
    print("Copied ANTIGRAVITY_WORKFLOW_LOGS.md")

# Create ZIP archive
zip_path = os.path.join(repo_dir, "antigravity_logs_kaamgraph.zip")
if os.path.exists(zip_path):
    os.remove(zip_path)

print(f"Creating ZIP archive at {zip_path}...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
    for root, dirs, files in os.walk(target_traces_dir):
        for file in files:
            file_path = os.path.join(root, file)
            # relative path inside zip
            arcname = os.path.relpath(file_path, target_traces_dir)
            # Prefix with 'antigravity_traces/' inside the zip to have a clean container directory
            zip_file.write(file_path, os.path.join("antigravity_traces", arcname))

print("ZIP archive created successfully!")
