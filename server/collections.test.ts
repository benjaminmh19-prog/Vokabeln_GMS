import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCollection, getCollectionById, getAllCollections, updateCollection, deleteCollection } from './db';
import { nanoid } from 'nanoid';

describe('Collections CRUD Operations', () => {
  let testCollectionId: string;
  const testCollection = {
    id: nanoid(),
    name: 'Test Collection',
    learning_year: 1,
    description: 'Test Description',
  };

  beforeAll(async () => {
    testCollectionId = testCollection.id;
  });

  afterAll(async () => {
    // Cleanup: delete test collection if it exists
    try {
      await deleteCollection(testCollectionId);
    } catch (error) {
      // Collection might not exist if test failed
    }
  });

  it('should create a collection', async () => {
    const result = await createCollection(testCollection);
    expect(result).toBeDefined();
    expect(result?.id).toBe(testCollectionId);
    expect(result?.name).toBe('Test Collection');
    expect(result?.learning_year).toBe(1);
  });

  it('should retrieve a collection by ID', async () => {
    const result = await getCollectionById(testCollectionId);
    expect(result).toBeDefined();
    expect(result?.id).toBe(testCollectionId);
    expect(result?.name).toBe('Test Collection');
  });

  it('should get all collections', async () => {
    const results = await getAllCollections();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    const foundCollection = results.find(c => c.id === testCollectionId);
    expect(foundCollection).toBeDefined();
    expect(foundCollection?.name).toBe('Test Collection');
  });

  it('should update a collection', async () => {
    const updatedData = {
      name: 'Updated Collection',
      description: 'Updated Description',
    };
    
    const result = await updateCollection(testCollectionId, updatedData);
    expect(result).toBeDefined();
    expect(result?.name).toBe('Updated Collection');
    expect(result?.description).toBe('Updated Description');
  });

  it('should delete a collection', async () => {
    // First, create a collection to delete
    const collectionToDelete = {
      id: nanoid(),
      name: 'Collection to Delete',
      learning_year: 2,
      description: 'Will be deleted',
    };
    
    await createCollection(collectionToDelete);
    
    // Then delete it
    const result = await deleteCollection(collectionToDelete.id);
    expect(result).toBeDefined();
    
    // Verify it's deleted
    const deleted = await getCollectionById(collectionToDelete.id);
    expect(deleted).toBeUndefined();
  });

  it('should handle learning year filtering', async () => {
    // Create collections for different learning years
    const year1Collection = {
      id: nanoid(),
      name: 'Year 1 Collection',
      learning_year: 1,
    };
    
    const year2Collection = {
      id: nanoid(),
      name: 'Year 2 Collection',
      learning_year: 2,
    };
    
    await createCollection(year1Collection);
    await createCollection(year2Collection);
    
    const allCollections = await getAllCollections();
    const year1Collections = allCollections.filter(c => c.learning_year === 1);
    const year2Collections = allCollections.filter(c => c.learning_year === 2);
    
    expect(year1Collections.length).toBeGreaterThan(0);
    expect(year2Collections.length).toBeGreaterThan(0);
    
    // Cleanup
    await deleteCollection(year1Collection.id);
    await deleteCollection(year2Collection.id);
  });
});
