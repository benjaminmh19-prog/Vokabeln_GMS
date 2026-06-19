import subprocess
import sys

# Read all SQL statements
with open('all-vocabs.sql', 'r') as f:
    lines = f.readlines()

# Split into batches of 50 statements
batch_size = 50
batches = []
current_batch = []

for line in lines:
    if line.strip():
        current_batch.append(line.strip())
        if len(current_batch) >= batch_size:
            batches.append(';'.join(current_batch))
            current_batch = []

if current_batch:
    batches.append(';'.join(current_batch))

print(f"Total batches: {len(batches)}")

# Execute each batch
for i, batch in enumerate(batches):
    print(f"\nExecuting batch {i+1}/{len(batches)}...")
    
    # Use webdev_execute_sql via manus-cli or direct API
    # For now, just print progress
    print(f"  Batch {i+1}: {len(batch.split(';'))} statements")

print(f"\n✅ Total statements to execute: {sum(len(b.split(';')) for b in batches)}")
