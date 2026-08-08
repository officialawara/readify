/* ==========================================================================
   READIFY EPUB ENGINE — Futurepress ePub.js GitHub Integration
   ========================================================================== */

class EPUBHandler {
  constructor() {
    this.book = null;
    this.toc = [];
    this.chapters = [];
  }

  async loadEPUB(arrayBuffer) {
    try {
      this.book = ePub(arrayBuffer);
      await this.book.opened;

      const metadata = await this.book.loaded.metadata;
      const navigation = await this.book.loaded.navigation;
      this.toc = navigation ? navigation.toc : [];

      // Extract spine chapters
      const spine = this.book.spine;
      this.chapters = [];
      
      for (const item of spine.items) {
        if (item.url) {
          this.chapters.push({
            id: item.idref,
            href: item.href,
            title: item.title || `Chapter ${this.chapters.length + 1}`
          });
        }
      }

      return {
        title: metadata.title || 'EPUB Book',
        author: metadata.creator || 'Unknown Author',
        chaptersCount: this.chapters.length,
        toc: this.toc
      };
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw new Error('Failed to parse EPUB archive. ' + error.message);
    }
  }

  async getChapterText(index) {
    if (!this.book || index < 0 || index >= this.chapters.length) return '';
    try {
      const chapterItem = this.chapters[index];
      const doc = await this.book.load(chapterItem.href);
      if (typeof doc === 'string') {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(doc, 'text/html');
        return htmlDoc.body ? htmlDoc.body.textContent : doc;
      } else if (doc && doc.textContent) {
        return doc.textContent;
      }
      return '';
    } catch (e) {
      console.warn(`Could not extract text from chapter ${index}:`, e);
      return '';
    }
  }
}

window.epubHandler = new EPUBHandler();
