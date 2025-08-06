const db = require('../db/knex');

// Custom session store using PostgreSQL
class PostgresSessionStore {
  constructor() {
    this.tableName = 'sessions';
  }

  // Initialize the sessions table
  async init() {
    try {
      const tableExists = await db.schema.hasTable(this.tableName);
      if (!tableExists) {
        await db.schema.createTable(this.tableName, (table) => {
          table.string('sid').primary();
          table.json('sess').notNull();
          table.timestamp('expire').notNull();
        });
        console.log('✅ Sessions table created');
      }
    } catch (error) {
      console.error('❌ Error creating sessions table:', error);
    }
  }

  // Get session
  async get(sid, callback) {
    try {
      const session = await db(this.tableName)
        .where('sid', sid)
        .where('expire', '>', new Date())
        .first();
      
      if (session) {
        callback(null, session.sess);
      } else {
        callback(null, null);
      }
    } catch (error) {
      callback(error);
    }
  }

  // Set session
  async set(sid, session, callback) {
    try {
      const expire = new Date(Date.now() + (session.cookie?.maxAge || 24 * 60 * 60 * 1000));
      
      await db(this.tableName)
        .insert({
          sid,
          sess: session,
          expire
        })
        .onConflict('sid')
        .merge();
      
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  // Destroy session
  async destroy(sid, callback) {
    try {
      await db(this.tableName).where('sid', sid).del();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  // Clear expired sessions
  async clear() {
    try {
      await db(this.tableName).where('expire', '<', new Date()).del();
    } catch (error) {
      console.error('Error clearing expired sessions:', error);
    }
  }
}

module.exports = PostgresSessionStore; 