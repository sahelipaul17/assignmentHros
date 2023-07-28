import { Router, Request, Response } from 'express';
import { authMiddleware } from './authMiddleware';
import { Feed, sequelize } from '../db/dbConfig';

const feedRouter = Router();

feedRouter.get('/', async (req: Request, res: Response) => {
  try {
    const feeds = await Feed.findAll();
    return res.json(feeds);
  } catch (err) {
    console.error('Error getting feeds:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

feedRouter.get('/:id', async (req: Request, res: Response) => {
  const feedId = parseInt(req.params.id, 10);

  try {
    const feed = await Feed.findByPk(feedId);
    if (!feed) {
      return res.status(404).json({ message: 'Feed not found' });
    }
    return res.json(feed);
  } catch (err) {
    console.error('Error getting feed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

feedRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { name, url, description } = req.body;
  const { role } = req.user;

  if (role !== 'Super Admin' && role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to create feeds' });
  }

  try {
    const newFeed = await Feed.create({ name, url, description });
    return res.json(newFeed);
  } catch (err) {
    console.error('Error creating feed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

feedRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const feedId = parseInt(req.params.id, 10);
  const { role } = req.user;

  if (role !== 'Super Admin' && role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to update feeds' });
  }

  try {
    const updatedFeed = await Feed.update(req.body, {
      where: { id: feedId },
    });
    if (updatedFeed[0] === 0) {
      return res.status(404).json({ message: 'Feed not found' });
    }
    return res.json({ message: 'Feed updated successfully' });
  } catch (err) {
    console.error('Error updating feed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

feedRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const feedId = parseInt(req.params.id, 10);
  const { role } = req.user;

  if (role !== 'Super Admin' && role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to delete feeds' });
  }

  try {
    const deletedFeed = await Feed.destroy({
      where: { id: feedId },
    });
    if (!deletedFeed) {
      return res.status(404).json({ message: 'Feed not found' });
    }
    return res.json({ message: 'Feed deleted successfully' });
  } catch (err) {
    console.error('Error deleting feed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export { feedRouter };