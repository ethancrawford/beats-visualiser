class UI {
  constructor(sequencer, visualisation) {
    this.sequencer = sequencer;
    this.visualisation = visualisation;
    this.initGrid();
    this.initControls();
    this.initTheme();
    this.initSampleSelectors();
  }

  initGrid() {
    const trackRows = document.querySelectorAll('.track-row');
    trackRows.forEach((row, trackIndex) => {
      const stepsContainer = row.querySelector('.steps');
      for (let i = 0; i < this.sequencer.numSteps; i++) {
        const step = document.createElement('div');
        step.className = 'step';
        step.dataset.step = i;
        // Set initial state based on pattern
        if (this.sequencer.pattern[trackIndex][i]) {
          step.classList.add('active');
        }
        step.addEventListener('click', () => {
          this.sequencer.toggleStep(trackIndex, i);
          step.classList.toggle('active');
        });
        stepsContainer.appendChild(step);
      }
    });
  }

  initSampleSelectors() {
    const categories = this.sequencer.audioInterface.getSampleCategories();
    const trackRows = document.querySelectorAll('.track-row');

    trackRows.forEach((row, trackIndex) => {
      const category = categories[trackIndex];
      const select = document.createElement('select');
      select.className = 'sample-selector';
      select.dataset.track = trackIndex;

      category.samples.forEach((sampleName, index) => {
        const option = document.createElement('option');
        option.value = index;
        // Clean up the sample name for display
        const displayName = sampleName
          .replace(category.prefix, '')
          .replace('.flac', '')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        option.textContent = displayName;
        select.appendChild(option);
      });

      select.addEventListener('change', (e) => {
        const sampleIndex = parseInt(e.target.value);
        this.sequencer.audioInterface.setSample(trackIndex, sampleIndex);
      });
      this.sequencer.audioInterface.setSample(trackIndex, 0);
      // Insert the select before the steps container
      const label = row.querySelector('.track-label');
      label.parentNode.insertBefore(select, label.nextSibling);
    });
  }

  initControls() {
    const playBtn = document.getElementById('play-pause');
    const rewindBtn = document.getElementById('rewind');
    const clearBtn = document.getElementById('clear');
    const tempoSlider = document.getElementById('tempo');
    const tempoDisplay = document.getElementById('tempo-display');
    const collapseBtn = document.getElementById('collapse-toggle');
    const panel = document.getElementById('sequencer-panel');

    collapseBtn.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
      collapseBtn.textContent = panel.classList.contains('collapsed') ? '▲' : '▼';
    });

    playBtn.addEventListener('click', async () => {
      if (!this.sequencer.audioInterface.initialised) {
        document.getElementById('loading').classList.remove("hidden");
        playBtn.disabled = true;
        playBtn.textContent = '⏳ Loading...';

        try {
          await this.sequencer.audioInterface.init();
          document.getElementById('loading').classList.add("hidden");
        } catch (error) {
          console.error('Failed to initialize audio:', error);
          alert('Failed to load audio. Please refresh and try again.');
          document.getElementById('loading').classList.add("hidden");
          playBtn.disabled = false;
          playBtn.textContent = '▶ Play';
          return;
        }

        playBtn.disabled = false;
      }

      if (this.sequencer.isPlaying) {
        this.sequencer.pause();
        playBtn.textContent = '▶ Play';
        playBtn.classList.remove('active');
      } else {
        this.sequencer.play();
        playBtn.textContent = '⏸ Pause';
        playBtn.classList.add('active');
      }
    });

    rewindBtn.addEventListener('click', () => {
      this.sequencer.rewind();
    });

    clearBtn.addEventListener('click', () => {
      this.sequencer.clear();
      document.querySelectorAll('.step.active').forEach(step => {
        step.classList.remove('active');
      });
    });

    tempoSlider.addEventListener('input', (e) => {
      const tempo = parseInt(e.target.value);
      this.sequencer.setTempo(tempo);
      tempoDisplay.textContent = `${tempo} BPM`;
    });
  }

  initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    let isDark = true;

    themeBtn.addEventListener('click', () => {
      isDark = !isDark;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      themeBtn.textContent = isDark ? '🌙' : '☀️';
      this.visualisation.updateTheme(isDark);
    });
  }

  updatePlayhead() {
    const progress = this.sequencer.getProgress();
    const playhead = document.getElementById('playhead');
    const stepsWidth = document.querySelector('.steps').offsetWidth;
    playhead.style.left = `155px`;
    playhead.style.transform = `translateX(${progress * stepsWidth}px)`;
  }
}

export { UI };
