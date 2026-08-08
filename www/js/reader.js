/* ==========================================================================
   READIFY BROADSHEET READER CONTROLLER — Hardened & Sanitized
   ========================================================================== */

class BroadsheetReader {
  constructor() {
    this.currentBook = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.pagesText = [];
    this.fontSize = 17; // px
    this.columnCount = 2;

    this.initDOMElements();
    this.bindEvents();
  }

  initDOMElements() {
    this.textArea = document.getElementById('broadsheet-text-area');
    this.pdfCanvasContainer = document.getElementById('pdf-canvas-container');
    this.titleElement = document.getElementById('reader-title');
    this.chapterElement = document.getElementById('reader-chapter');
    this.pageIndicator = document.getElementById('page-indicator');
    this.tocModal = document.getElementById('modal-toc');
    this.tocList = document.getElementById('toc-list-items');
  }

  bindEvents() {
    document.getElementById('btn-font-inc')?.addEventListener('click', () => this.adjustFontSize(1));
    document.getElementById('btn-font-dec')?.addEventListener('click', () => this.adjustFontSize(-1));
    document.getElementById('btn-columns-toggle')?.addEventListener('click', () => this.toggleColumns());
    document.getElementById('btn-prev-page')?.addEventListener('click', () => this.prevPage());
    document.getElementById('btn-next-page')?.addEventListener('click', () => this.nextPage());
    document.getElementById('btn-toc')?.addEventListener('click', () => this.openTOC());
    document.getElementById('btn-close-toc')?.addEventListener('click', () => this.closeTOC());
  }

  async loadBook(bookData) {
    this.currentBook = bookData;
    this.titleElement.textContent = bookData.title || 'Untitled Gazette';
    this.chapterElement.textContent = bookData.author || 'Literary Release';

    if (bookData.format === 'PDF' && window.pdfHandler) {
      this.pdfCanvasContainer.style.display = 'flex';
      this.textArea.style.display = 'none';
      await window.pdfHandler.loadPDF(bookData.content);
      this.totalPages = window.pdfHandler.numPages;
      this.currentPage = bookData.currentPage || 1;
      this.renderPDFPage();
      
      // Load text for TTS
      const pageText = await window.pdfHandler.getPageText(this.currentPage);
      window.ttsEngine.loadText(pageText);

    } else {
      this.pdfCanvasContainer.style.display = 'none';
      this.textArea.style.display = 'block';

      if (typeof bookData.content === 'string') {
        // Plain text, Markdown, HTML, or extracted EPUB text
        this.paginateRawText(bookData.content);
      } else if (bookData.pagesText) {
        this.pagesText = bookData.pagesText;
        this.totalPages = this.pagesText.length;
      }

      this.currentPage = Math.min(bookData.currentPage || 1, this.totalPages);
      this.renderTextPage();
    }

    this.updatePageIndicator();
    this.buildTOC();
  }

  paginateRawText(rawText) {
    const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim());
    const paragraphsPerPage = 6;
    this.pagesText = [];

    for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
      const pageParagraphs = paragraphs.slice(i, i + paragraphsPerPage);
      this.pagesText.push(pageParagraphs.join('\n\n'));
    }

    if (!this.pagesText.length) {
      this.pagesText = ['[Empty Document]'];
    }

    this.totalPages = this.pagesText.length;
  }

  renderTextPage() {
    if (!this.pagesText.length) return;
    const pageContent = this.pagesText[this.currentPage - 1] || '';

    // Convert paragraphs into broadsheet HTML with drop caps & security sanitization
    const formattedParagraphs = pageContent
      .split('\n\n')
      .map(p => `<p>${this.sanitizeHTML(p.trim())}</p>`)
      .join('');

    this.textArea.innerHTML = formattedParagraphs;
    this.textArea.style.fontSize = `${this.fontSize}px`;

    // Load page text into TTS engine
    window.ttsEngine.loadText(pageContent);
    
    // Save progress to library
    if (this.currentBook && window.readifyLibrary) {
      window.readifyLibrary.updateProgress(this.currentBook.id, this.currentPage, this.totalPages);
    }
  }

  async renderPDFPage() {
    if (window.pdfHandler && this.currentBook?.format === 'PDF') {
      await window.pdfHandler.renderPageToCanvas(this.currentPage, this.pdfCanvasContainer);
      const pageText = await window.pdfHandler.getPageText(this.currentPage);
      window.ttsEngine.loadText(pageText);

      if (this.currentBook && window.readifyLibrary) {
        window.readifyLibrary.updateProgress(this.currentBook.id, this.currentPage, this.totalPages);
      }
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageIndicator();
      if (this.currentBook?.format === 'PDF') this.renderPDFPage();
      else this.renderTextPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageIndicator();
      if (this.currentBook?.format === 'PDF') this.renderPDFPage();
      else this.renderTextPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updatePageIndicator() {
    this.pageIndicator.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
  }

  adjustFontSize(delta) {
    this.fontSize = Math.max(12, Math.min(32, this.fontSize + delta));
    this.textArea.style.fontSize = `${this.fontSize}px`;
  }

  toggleColumns() {
    this.columnCount = this.columnCount === 2 ? 1 : 2;
    this.textArea.style.columnCount = this.columnCount;
    window.showToast(`Broadsheet view set to ${this.columnCount} column(s)`);
  }

  highlightSentence(index, text) {
    const paragraphs = this.textArea.querySelectorAll('p');
    paragraphs.forEach(p => p.classList.remove('tts-reading-highlight'));

    if (paragraphs.length > 0) {
      const targetP = paragraphs[index % paragraphs.length] || paragraphs[0];
      targetP.classList.add('tts-reading-highlight');
      targetP.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  buildTOC() {
    this.tocList.innerHTML = '';
    
    if (this.currentBook?.toc && this.currentBook.toc.length) {
      this.currentBook.toc.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'toc-item';
        li.textContent = `${idx + 1}. ${this.escapeHTML(item.label || item.title || 'Chapter')}`;
        li.addEventListener('click', () => {
          this.closeTOC();
          this.currentPage = Math.min(idx + 1, this.totalPages);
          this.updatePageIndicator();
          if (this.currentBook.format === 'PDF') this.renderPDFPage();
          else this.renderTextPage();
        });
        this.tocList.appendChild(li);
      });
    } else {
      // Fallback section list
      for (let i = 1; i <= Math.min(this.totalPages, 15); i++) {
        const li = document.createElement('li');
        li.className = 'toc-item';
        li.textContent = `Section / Page ${i}`;
        li.addEventListener('click', () => {
          this.closeTOC();
          this.currentPage = i;
          this.updatePageIndicator();
          if (this.currentBook.format === 'PDF') this.renderPDFPage();
          else this.renderTextPage();
        });
        this.tocList.appendChild(li);
      }
    }
  }

  openTOC() { this.tocModal.classList.add('active'); }
  closeTOC() { this.tocModal.classList.remove('active'); }

  // Security Hardening: XSS & HTML Tag Sanitizer
  sanitizeHTML(rawStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawStr, 'text/html');
    
    // Strip malicious tags
    const dangerousElements = doc.querySelectorAll('script, iframe, object, embed, link, meta, style, applet');
    dangerousElements.forEach(el => el.remove());

    // Strip inline event attributes (e.g. onload, onerror, onclick) and javascript: URIs
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on') || attr.value.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  }

  escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

window.broadsheetReader = new BroadsheetReader();
