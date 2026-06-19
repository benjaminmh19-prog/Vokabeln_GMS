import subprocess
import sys

# Read all SQL lines
with open('restore-all-vocab.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Process in batches of 100
batch_size = 100
total_batches = (len(lines) + batch_size - 1) // batch_size

for batch_num in range(total_batches):
    start = batch_num * batch_size
    end = min(start + batch_size, len(lines))
    batch_lines = lines[start:end]
    batch_sql = ''.join(batch_lines)
    
    # Write batch to temp file
    temp_file = f'batch_{batch_num}.sql'
    with open(temp_file, 'w', encoding='utf-8') as f:
        f.write(batch_sql)
    
    print(f"[{batch_num + 1}/{total_batches}] Batch {batch_num}: {len(batch_lines)} statements ({start+1}-{end})")

print(f"\n✅ Created {total_batches} batch files")
