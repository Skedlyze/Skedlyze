const fs = require('fs');
const path = require('path');

// Simple file-based session store (fallback option)
class SimpleSessionStore {
  constructor() {
    this.sessionsDir = path.join(__dirname, '../sessions');
    this.ensureSessionsDir();
  }

  ensureSessionsDir() {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  getSessionPath(sid) {
    return path.join(this.sessionsDir, `${sid}.json`);
  }

  get(sid, callback) {
    try {
      const sessionPath = this.getSessionPath(sid);
      if (fs.existsSync(sessionPath)) {
        const data = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        if (data.expire > Date.now()) {
          callback(null, data.session);
        } else {
          // Session expired, delete it
          fs.unlinkSync(sessionPath);
          callback(null, null);
        }
      } else {
        callback(null, null);
      }
    } catch (error) {
      callback(error);
    }
  }

  set(sid, session, callback) {
    try {
      const sessionPath = this.getSessionPath(sid);
      const data = {
        session,
        expire: Date.now() + (session.cookie?.maxAge || 24 * 60 * 60 * 1000)
      };
      fs.writeFileSync(sessionPath, JSON.stringify(data));
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  destroy(sid, callback) {
    try {
      const sessionPath = this.getSessionPath(sid);
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
      }
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  clear() {
    try {
      const files = fs.readdirSync(this.sessionsDir);
      const now = Date.now();
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.sessionsDir, file);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (data.expire < now) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            // Delete corrupted files
            fs.unlinkSync(filePath);
          }
        }
      });
    } catch (error) {
      console.error('Error clearing expired sessions:', error);
    }
  }
}

module.exports = SimpleSessionStore; 