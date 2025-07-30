class OfflineStorage {
  constructor() {
    this.dbName = 'SkedlyzeOffline';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          taskStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('pendingOperations')) {
          const operationStore = db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
          operationStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async saveTask(task) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.add({
        ...task,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingTasks() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async savePendingOperation(operation) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
      const store = transaction.objectStore('pendingOperations');
      const request = store.add({
        ...operation,
        createdAt: new Date().toISOString()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingOperations'], 'readonly');
      const store = transaction.objectStore('pendingOperations');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingTask(taskId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.delete(taskId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingOperation(operationId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
      const store = transaction.objectStore('pendingOperations');
      const request = store.delete(operationId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllPendingData() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks', 'pendingOperations'], 'readwrite');
      const taskStore = transaction.objectStore('tasks');
      const operationStore = transaction.objectStore('pendingOperations');

      const taskRequest = taskStore.clear();
      const operationRequest = operationStore.clear();

      Promise.all([taskRequest, operationRequest])
        .then(() => resolve())
        .catch(reject);
    });
  }
}

export default new OfflineStorage(); 