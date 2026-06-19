import json
import uuid

with open('client/src/data/vocabulary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

sql_statements = []
for unit, pages in data.items():
    for page, vocabs in pages.items():
        for vocab in vocabs:
            vocab_id = str(uuid.uuid4())
            english = vocab['english'].replace("'", "\\'")
            deutsch = vocab['deutsch'].replace("'", "\\'")
            sql = f"INSERT INTO admin_vocabulary (id, unit, page, english, deutsch, collection_id) VALUES ('{vocab_id}', '{unit}', '{page}', '{english}', '{deutsch}', 'collection-1');"
            sql_statements.append(sql)

# Write to file
with open('restore-vocab.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"✅ {len(sql_statements)} SQL INSERT statements created in restore-vocab.sql")
