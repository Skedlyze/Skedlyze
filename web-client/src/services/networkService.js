import offlineStorage from './offlineStorage';

class NetworkService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.listeners = [];
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline));
  }

  getOnlineStatus() {
    return this.isOnline;
  }

  async syncOfflineData() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('Starting offline data sync...');

    try {
      // Sync pending tasks
      const pendingTasks = await offlineStorage.getPendingTasks();
      for (const task of pendingTasks) {
        try {
          await this.syncTask(task);
          await offlineStorage.clearPendingTask(task.id);
        } catch (error) {
          console.error('Error syncing task:', error);
        }
      }

      // Sync pending operations
      const pendingOperations = await offlineStorage.getPendingOperations();
      for (const operation of pendingOperations) {
        try {
          await this.syncOperation(operation);
          await offlineStorage.clearPendingOperation(operation.id);
        } catch (error) {
          console.error('Error syncing operation:', error);
        }
      }

      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Error during offline data sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncTask(task) {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        category: task.category
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to sync task: ${response.status}`);
    }

    return response.json();
  }

  async syncOperation(operation) {
    const response = await fetch(operation.url, {
      method: operation.method,
      headers: operation.headers,
      body: operation.body
    });

    if (!response.ok) {
      throw new Error(`Failed to sync operation: ${response.status}`);
    }

    return response.json();
  }

  async saveOfflineTask(task) {
    if (this.isOnline) {
      // Try to save online first
      try {
        return await this.syncTask(task);
      } catch (error) {
        console.log('Online save failed, saving offline:', error);
      }
    }

    // Save offline
    return await offlineStorage.saveTask(task);
  }

  async saveOfflineOperation(operation) {
    if (this.isOnline) {
      // Try to execute online first
      try {
        return await this.syncOperation(operation);
      } catch (error) {
        console.log('Online operation failed, saving offline:', error);
      }
    }

    // Save offline
    return await offlineStorage.savePendingOperation(operation);
  }
}

export default new NetworkService(); 