/* ==========================================================================
   READIFY TEXT-TO-SPEECH (TTS) AUDIOBOOK ENGINE
   ========================================================================== */

class TTSEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.sentences = [];
    this.currentIndex = 0;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.selectedVoice = null;
    this.voices = [];
    
    // Callbacks
    this.onSentenceStart = null;
    this.onComplete = null;
    this.onStateChange = null;

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  getAvailableVoices() {
    if (!this.voices.length && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  setVoice(voiceName) {
    this.selectedVoice = this.voices.find(v => v.name === voiceName) || null;
  }

  setRate(rate) {
    this.rate = parseFloat(rate) || 1.0;
    if (this.isPlaying && !this.isPaused) {
      // Restart current sentence with new rate
      this.speakCurrentSentence();
    }
  }

  loadText(rawText) {
    this.stop();
    if (!rawText) return;

    // Segment into sentences
    this.sentences = rawText
      .split(/(?<=[.!?])\s+|\n\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.currentIndex = 0;
  }

  play() {
    if (!this.synth || !this.sentences.length) return;

    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.notifyState('PLAYING');
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.speakCurrentSentence();
  }

  speakCurrentSentence() {
    if (!this.synth || this.currentIndex >= this.sentences.length) {
      this.stop();
      if (this.onComplete) this.onComplete();
      return;
    }

    this.synth.cancel(); // Stop any pending utterance

    const textToSpeak = this.sentences[this.currentIndex];
    this.utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.utterance.rate = this.rate;
    this.utterance.pitch = this.pitch;

    if (this.selectedVoice) {
      this.utterance.voice = this.selectedVoice;
    }

    this.utterance.onstart = () => {
      this.notifyState('PLAYING');
      if (this.onSentenceStart) {
        this.onSentenceStart(this.currentIndex, textToSpeak);
      }
    };

    this.utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        this.speakCurrentSentence();
      }
    };

    this.utterance.onerror = (e) => {
      console.warn('TTS Utterance Error:', e);
      if (this.isPlaying) {
        this.currentIndex++;
        this.speakCurrentSentence();
      }
    };

    this.synth.speak(this.utterance);
  }

  pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState('PAUSED');
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.notifyState('STOPPED');
  }

  nextSentence() {
    if (this.currentIndex < this.sentences.length - 1) {
      this.currentIndex++;
      if (this.isPlaying) {
        this.speakCurrentSentence();
      } else if (this.onSentenceStart) {
        this.onSentenceStart(this.currentIndex, this.sentences[this.currentIndex]);
      }
    }
  }

  previousSentence() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      if (this.isPlaying) {
        this.speakCurrentSentence();
      } else if (this.onSentenceStart) {
        this.onSentenceStart(this.currentIndex, this.sentences[this.currentIndex]);
      }
    }
  }

  notifyState(state) {
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }
}

window.ttsEngine = new TTSEngine();
