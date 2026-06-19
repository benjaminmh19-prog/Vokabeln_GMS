import subprocess
import os
import glob

# Get all SQL files
sql_files = sorted(glob.glob('restore-vocab-part-*'))
print(f"Found {len(sql_files)} SQL files to execute")

for i, sql_file in enumerate(sql_files, 1):
    print(f"[{i}/{len(sql_files)}] Executing {sql_file}...")
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Execute via webdev_execute_sql by writing to a temp file
    # For now, just count the statements
    statements = sql_content.strip().split('\n')
    print(f"  → {len(statements)} statements")

print(f"\n✅ Total: {len(sql_files)} files ready for batch import")
