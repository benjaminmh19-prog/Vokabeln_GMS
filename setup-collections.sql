-- Create default collection for "Lernjahr 1"
INSERT INTO collections (id, name, learning_year, description) 
VALUES ('collection-1', 'Collection 1', 1, 'Standard Vokabeln für Lernjahr 1');

-- Update all existing vocabularies to use this collection
UPDATE admin_vocabulary SET collection_id = 'collection-1' WHERE collection_id IS NULL OR collection_id = '';
