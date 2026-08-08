/* ==========================================================================
   READIFY LIBRARY MANAGER — IndexedDB & LocalStorage Book Persistence
   ========================================================================== */

class ReadifyLibrary {
  constructor() {
    this.dbName = 'ReadifyGazetteDB';
    this.dbVersion = 1;
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('books')) {
          const store = db.createObjectStore('books', { keyPath: 'id' });
          store.createIndex('addedAt', 'addedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB Error:', event.target.error);
        resolve(null); // Fallback gracefully if blocked
      };
    });
  }

  async saveBook(bookData) {
    await this.initPromise;
    if (!this.db) return this.saveToLocalStorage(bookData);

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      store.put(bookData);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }

  async getAllBooks() {
    await this.initPromise;
    if (!this.db) return this.getFromLocalStorage();

    return new Promise((resolve) => {
      const tx = this.db.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async getBook(id) {
    await this.initPromise;
    if (!this.db) {
      const books = this.getFromLocalStorage();
      return books.find(b => b.id === id) || null;
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async deleteBook(id) {
    await this.initPromise;
    if (!this.db) return this.deleteFromLocalStorage(id);

    return new Promise((resolve) => {
      const tx = this.db.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      store.delete(id);
      tx.oncomplete = () => resolve(true);
    });
  }

  async updateProgress(id, currentPage, totalPages) {
    const book = await this.getBook(id);
    if (book) {
      book.currentPage = currentPage;
      book.totalPages = totalPages;
      book.progress = Math.round((currentPage / totalPages) * 100);
      await this.saveBook(book);
    }
  }

  // LocalStorage Fallbacks
  saveToLocalStorage(bookData) {
    try {
      const books = this.getFromLocalStorage();
      const index = books.findIndex(b => b.id === bookData.id);
      if (index >= 0) books[index] = bookData;
      else books.push(bookData);
      localStorage.setItem('readify_books', JSON.stringify(books));
      return true;
    } catch (e) {
      console.warn('LocalStorage size limit exceeded:', e);
      return false;
    }
  }

  getFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('readify_books') || '[]');
    } catch (e) {
      return [];
    }
  }

  deleteFromLocalStorage(id) {
    const books = this.getFromLocalStorage().filter(b => b.id !== id);
    localStorage.setItem('readify_books', JSON.stringify(books));
    return true;
  }
}

window.readifyLibrary = new ReadifyLibrary();
