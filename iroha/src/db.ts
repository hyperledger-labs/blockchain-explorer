import { createPool, sql } from 'slonik';
import config from './config';
import { IrohaDb } from './iroha-db';
import { logger } from './logger';

export const pool = createPool(config.postgres);
export const db = new IrohaDb(pool);

export async function connect() {
  try {
    await pool.query(sql`SELECT 1`);
  } catch (error) {
    logger.error('database connection failed');
    throw error;
  }
}
