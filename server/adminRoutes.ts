import { Router } from 'express';
import { getAllVocabulary, getVocabularyById, createVocabulary, updateVocabulary, deleteVocabulary, getAllPlayers, deletePlayer } from './db';
import { nanoid } from 'nanoid';

const router = Router();

console.log('[AdminRoutes] Router initialized');

// Vocabulary endpoints
router.get('/vocabularies', async (req, res) => {
  console.log('[AdminRoutes] GET /vocabularies called');
  try {
    const vocabularies = await getAllVocabulary();
    res.json(vocabularies);
  } catch (error) {
    console.error('Error fetching vocabularies:', error);
    res.status(500).json({ error: 'Failed to fetch vocabularies' });
  }
});

router.get('/vocabularies/:id', async (req, res) => {
  try {
    const vocab = await getVocabularyById(req.params.id);
    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }
    res.json(vocab);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
});

router.post('/vocabularies', async (req, res) => {
  try {
    const { unit, page, english, deutsch } = req.body;
    
    if (!unit || !page || !english || !deutsch) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = nanoid();
    const vocab = await createVocabulary({
      id,
      collection_id: 'collection-1', // Default collection for Lernjahr 1
      unit,
      page,
      english,
      deutsch,
    });

    res.status(201).json(vocab);
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    res.status(500).json({ error: 'Failed to create vocabulary' });
  }
});

router.put('/vocabularies/:id', async (req, res) => {
  try {
    const { unit, page, english, deutsch } = req.body;
    
    const updates: any = {};
    if (unit !== undefined) updates.unit = unit;
    if (page !== undefined) updates.page = page;
    if (english !== undefined) updates.english = english;
    if (deutsch !== undefined) updates.deutsch = deutsch;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const vocab = await updateVocabulary(req.params.id, updates);
    if (!vocab) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }

    res.json(vocab);
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    res.status(500).json({ error: 'Failed to update vocabulary' });
  }
});

router.delete('/vocabularies/:id', async (req, res) => {
  try {
    await deleteVocabulary(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    res.status(500).json({ error: 'Failed to delete vocabulary' });
  }
});

// Players endpoints
router.get('/players', async (req, res) => {
  try {
    const players = await getAllPlayers();
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

router.delete('/players/:id', async (req, res) => {
  try {
    await deletePlayer(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router;
