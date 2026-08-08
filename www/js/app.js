/* ==========================================================================
   READIFY GAZETTE — Main Application Controller & UI Binder
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Global Toast Helper
  window.showToast = function(msg) {
    const toast = document.getElementById('toast-notice');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  };

  // 1. Theme Management
  const btnPaper = document.getElementById('btn-theme-paper');
  const btnSepia = document.getElementById('btn-theme-sepia');
  const btnNight = document.getElementById('btn-theme-night');

  btnPaper?.addEventListener('click', () => setTheme('paper'));
  btnSepia?.addEventListener('click', () => setTheme('sepia'));
  btnNight?.addEventListener('click', () => setTheme('night'));

  function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('readify_theme', theme);
    showToast(`Theme set to ${theme.toUpperCase()} edition`);
  }

  const savedTheme = localStorage.getItem('readify_theme') || 'paper';
  setTheme(savedTheme);

  // Set Date Stamp
  const dateStamp = document.getElementById('date-stamp');
  if (dateStamp) {
    const now = new Date();
    dateStamp.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }

  // 2. View Switcher (Library <-> Reader)
  const viewLibrary = document.getElementById('view-library');
  const viewReader = document.getElementById('view-reader');
  const btnBackLibrary = document.getElementById('btn-back-library');

  btnBackLibrary?.addEventListener('click', () => {
    if (window.ttsEngine) window.ttsEngine.stop();
    switchView('library');
  });

  function switchView(viewName) {
    if (viewName === 'reader') {
      viewLibrary.classList.remove('active');
      viewReader.classList.add('active');
    } else {
      viewReader.classList.remove('active');
      viewLibrary.classList.add('active');
      renderLibraryRack();
    }
  }

  // 3. Typography & Printing Press Settings Modal
  const btnSettingsModal = document.getElementById('btn-settings-modal');
  const modalSettings = document.getElementById('modal-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const settingFontFamily = document.getElementById('setting-font-family');
  const settingLineHeight = document.getElementById('setting-line-height');
  const settingTextAlign = document.getElementById('setting-text-align');

  btnSettingsModal?.addEventListener('click', () => modalSettings.classList.add('active'));
  btnCloseSettings?.addEventListener('click', () => modalSettings.classList.remove('active'));

  settingFontFamily?.addEventListener('change', (e) => {
    const broadsheetArea = document.getElementById('broadsheet-text-area');
    if (broadsheetArea) broadsheetArea.style.fontFamily = e.target.value;
    localStorage.setItem('readify_font_family', e.target.value);
    showToast('Font updated');
  });

  settingLineHeight?.addEventListener('change', (e) => {
    const broadsheetArea = document.getElementById('broadsheet-text-area');
    if (broadsheetArea) broadsheetArea.style.lineHeight = e.target.value;
    localStorage.setItem('readify_line_height', e.target.value);
    showToast('Line spacing updated');
  });

  settingTextAlign?.addEventListener('change', (e) => {
    const broadsheetArea = document.getElementById('broadsheet-text-area');
    if (broadsheetArea) broadsheetArea.style.textAlign = e.target.value;
    localStorage.setItem('readify_text_align', e.target.value);
    showToast('Text alignment updated');
  });

  // Restore Settings
  const savedFont = localStorage.getItem('readify_font_family');
  const savedLineHeight = localStorage.getItem('readify_line_height');
  const savedTextAlign = localStorage.getItem('readify_text_align');
  const broadsheetArea = document.getElementById('broadsheet-text-area');
  
  if (savedFont && broadsheetArea) broadsheetArea.style.fontFamily = savedFont;
  if (savedLineHeight && broadsheetArea) broadsheetArea.style.lineHeight = savedLineHeight;
  if (savedTextAlign && broadsheetArea) broadsheetArea.style.textAlign = savedTextAlign;

  // 4. File Drag & Drop Workbench
  const workbenchDropzone = document.getElementById('workbench-dropzone');
  const fileInput = document.getElementById('file-input');
  const btnOpenFile = document.getElementById('btn-open-file');

  btnOpenFile?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  workbenchDropzone?.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    workbenchDropzone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      workbenchDropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    workbenchDropzone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      workbenchDropzone.classList.remove('drag-over');
    });
  });

  workbenchDropzone?.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0]);
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
  });

  async function handleFileUpload(file) {
    showToast(`Typesetting "${file.name}"...`);
    const extension = file.name.split('.').pop().toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    let bookFormat = extension.toUpperCase();
    let title = file.name.replace(/\.[^/.]+$/, "");
    let author = 'Imported Volume';
    let parsedContent = null;
    let toc = [];

    try {
      if (extension === 'pdf' && window.pdfHandler) {
        bookFormat = 'PDF';
        const pdfMeta = await window.pdfHandler.loadPDF(arrayBuffer);
        parsedContent = arrayBuffer;
      } else if (extension === 'epub' && window.epubHandler) {
        bookFormat = 'EPUB';
        const epubMeta = await window.epubHandler.loadEPUB(arrayBuffer);
        title = epubMeta.title || title;
        author = epubMeta.author || author;
        toc = epubMeta.toc || [];
        
        let fullText = [];
        for (let i = 0; i < Math.min(epubMeta.chaptersCount, 25); i++) {
          const chText = await window.epubHandler.getChapterText(i);
          if (chText.trim()) fullText.push(chText);
        }
        parsedContent = fullText.join('\n\n');
      } else {
        const decoder = new TextDecoder('utf-8');
        parsedContent = decoder.decode(arrayBuffer);
      }

      const newBook = {
        id: 'book_' + Date.now(),
        title: title,
        author: author,
        format: bookFormat,
        content: parsedContent,
        toc: toc,
        currentPage: 1,
        totalPages: 1,
        progress: 0,
        addedAt: new Date().toISOString()
      };

      await window.readifyLibrary.saveBook(newBook);
      showToast(`" ${title} " added to Press Archives!`);
      
      openBookInReader(newBook);

    } catch (err) {
      console.error('File import error:', err);
      showToast(`Error opening file: ${err.message}`);
    }
  }

  // 5. Library Rack Renderer
  async function renderLibraryRack() {
    const grid = document.getElementById('library-grid');
    const emptyNotice = document.getElementById('empty-rack-notice');
    const countBadge = document.getElementById('library-count');

    let books = await window.readifyLibrary.getAllBooks();

    if (!books || books.length === 0) {
      books = getSampleClassics();
      for (const b of books) {
        await window.readifyLibrary.saveBook(b);
      }
    }

    countBadge.textContent = `${books.length} VOLUME${books.length === 1 ? '' : 'S'}`;
    grid.innerHTML = '';

    if (!books.length) {
      emptyNotice.style.display = 'block';
      return;
    }

    emptyNotice.style.display = 'none';

    books.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <span class="book-badge-format">${book.format}</span>
        <div>
          <h3 class="book-title">${escapeHTML(book.title)}</h3>
          <div class="book-author">${escapeHTML(book.author)}</div>
        </div>
        <div>
          <div class="book-meta">
            PROGRESS: ${book.progress || 0}%
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${book.progress || 0}%"></div>
            </div>
          </div>
          <div class="book-actions">
            <button class="press-btn press-btn-primary btn-read-book" data-id="${book.id}">📖 Read</button>
            <button class="press-btn btn-delete-book" data-id="${book.id}">🗑 Delete</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-read-book').addEventListener('click', async () => {
        const targetBook = await window.readifyLibrary.getBook(book.id);
        if (targetBook) openBookInReader(targetBook);
      });

      card.querySelector('.btn-delete-book').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Remove "${book.title}" from press archives?`)) {
          await window.readifyLibrary.deleteBook(book.id);
          showToast(`Volume deleted.`);
          renderLibraryRack();
        }
      });

      grid.appendChild(card);
    });
  }

  async function openBookInReader(book) {
    switchView('reader');
    await window.broadsheetReader.loadBook(book);
    bindAudioControls();
  }

  // 6. Audiobook TTS Controls Binding
  function bindAudioControls() {
    const btnPlay = document.getElementById('btn-tts-play');
    const btnPause = document.getElementById('btn-tts-pause');
    const btnStop = document.getElementById('btn-tts-stop');
    const btnPrev = document.getElementById('btn-tts-prev');
    const btnNext = document.getElementById('btn-tts-next');
    const voiceSelect = document.getElementById('tts-voice-select');
    const rateSelect = document.getElementById('tts-rate-select');
    const statusBadge = document.getElementById('tts-status-badge');

    const voices = window.ttsEngine.getAvailableVoices();
    voiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    voiceSelect?.addEventListener('change', (e) => {
      window.ttsEngine.setVoice(e.target.value);
    });

    rateSelect?.addEventListener('change', (e) => {
      window.ttsEngine.setRate(e.target.value);
    });

    btnPlay?.addEventListener('click', () => window.ttsEngine.play());
    btnPause?.addEventListener('click', () => window.ttsEngine.pause());
    btnStop?.addEventListener('click', () => window.ttsEngine.stop());
    btnPrev?.addEventListener('click', () => window.ttsEngine.previousSentence());
    btnNext?.addEventListener('click', () => window.ttsEngine.nextSentence());

    window.ttsEngine.onSentenceStart = (idx, text) => {
      window.broadsheetReader.highlightSentence(idx, text);
    };

    window.ttsEngine.onStateChange = (state) => {
      statusBadge.textContent = state;
      if (state === 'PLAYING') {
        btnPlay.style.display = 'none';
        btnPause.style.display = 'inline-flex';
      } else {
        btnPlay.style.display = 'inline-flex';
        btnPause.style.display = 'none';
      }
    };
  }

  // Sample Pre-loaded Broadsheet Classics
  function getSampleClassics() {
    return [
      {
        id: 'sample_sherlock',
        title: 'The Sherlock Holmes Gazette',
        author: 'Sir Arthur Conan Doyle',
        format: 'GAZETTE',
        content: `CHAPTER I. A STUDY IN SCARLET\n\nIn the year 1878 I took my degree of Doctor of Medicine at the University of London, and proceeded to Netley to go through the course prescribed for surgeons in the army. Having completed my studies there, I was duly attached to the Fifth Northumberland Fusiliers as Assistant Surgeon.\n\nThe regiment was stationed in India at the time, and before I could join it, the second Afghan war had broken out. On landing at Bombay, I learned that my corps had advanced through the passes, and was already deep in the enemy's country. I followed, however, with many other officers who were in the same situation, and succeeded in reaching Candahar in safety, where I found my regiment, and at once entered upon my new duties.\n\nThe campaign brought honours and promotion to many, but for me it had nothing but misfortune and disaster. I was removed from my brigade and attached to the Berkshires, with whom I served at the fatal battle of Maiwand. There I was struck on the shoulder by a Jezail bullet, which shattered the bone and grazed the subclavian artery.\n\nI should have fallen into the hands of the murderous Ghazis had it not been for the devotion and courage shown by Murray, my orderly, who threw me across a pack-horse, and succeeded in bringing me safely to the British lines.\n\nWorn with pain, and weak from the prolonged hardships which I had undergone, I was removed, with a great train of wounded sufferers, to the base hospital at Peshawur. Here I rallied, and had already improved so far as to be able to walk about the wards, and even to bask a little upon the verandah, when I was struck down by enteric fever, that curse of our Indian possessions. For months my life was despaired of, and when at last I came to myself and became convalescent, I was so weak and emaciated that a medical board determined that not a day should be lost in sending me back to England.`,
        currentPage: 1,
        totalPages: 1,
        progress: 0,
        addedAt: new Date().toISOString()
      },
      {
        id: 'sample_alice',
        title: 'Alice in Wonderland Gazette',
        author: 'Lewis Carroll',
        format: 'GAZETTE',
        content: `CHAPTER I. DOWN THE RABBIT-HOLE\n\nAlice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?'\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.\n\nThere was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she turned across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.`,
        currentPage: 1,
        totalPages: 1,
        progress: 0,
        addedAt: new Date().toISOString()
      }
    ];
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  renderLibraryRack();
});
