// feed.ts
import { pool } from './dbConfig';

export interface Feed {
  id: number;
  name: string;
  url: string;
  description?: string;
}

export async function createFeed(feed: Feed): Promise<Feed> {
  const connection = await pool.getConnection();

  try {
    const query = 'INSERT INTO Feed (name, url, description) VALUES (?, ?, ?)';
    const values = [feed.name, feed.url, feed.description];
    const [result] = await connection.query(query, values);
    const insertedFeedId = result.insertId;
    return { ...feed, id: insertedFeedId };
  } finally {
    connection.release();
  }
}

export async function getFeedById(id: number): Promise<Feed | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query<Feed[]>('SELECT * FROM Feed WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    connection.release();
  }
}

// Add other feed-related operations as needed (e.g., getAllFeeds, updateFeed, deleteFeed, etc.)
