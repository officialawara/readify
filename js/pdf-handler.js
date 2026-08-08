/* ==========================================================================
   READIFY PDF ENGINE — Mozilla PDF.js GitHub Integration
   ========================================================================== */

class PDFHandler {
  constructor() {
    this.pdfDoc = null;
    this.numPages = 0;
  }

  async loadPDF(arrayBuffer) {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      this.pdfDoc = await loadingTask.promise;
      this.numPages = this.pdfDoc.numPages;
      return {
        numPages: this.numPages,
        title: 'PDF Document',
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file. ' + error.message);
    }
  }

  async getPageText(pageNum) {
    if (!this.pdfDoc || pageNum < 1 || pageNum > this.numPages) return '';
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      return textContent.items.map(item => item.str).join(' ');
    } catch (e) {
      console.warn(`Could not extract text from page ${pageNum}:`, e);
      return '';
    }
  }

  async getAllText() {
    let fullText = [];
    for (let i = 1; i <= Math.min(this.numPages, 100); i++) {
      const pageText = await this.getPageText(i);
      if (pageText.trim()) {
        fullText.push(`--- Page ${i} ---\n\n` + pageText);
      }
    }
    return fullText.join('\n\n');
  }

  async renderPageToCanvas(pageNum, containerElement) {
    if (!this.pdfDoc) return;
    containerElement.innerHTML = '';
    const page = await this.pdfDoc.getPage(pageNum);
    
    const viewport = page.getViewport({ scale: 1.25 });
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    containerElement.appendChild(canvas);

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
  }
}

window.pdfHandler = new PDFHandler();
