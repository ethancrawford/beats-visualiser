class UI {
  constructor(sequencer, visualisation) {
    this.sequencer = sequencer;
    this.visualisation = visualisation;
    this.initGrid();
    this.initControls();
    this.initTheme();
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
        await this.sequencer.audioInterface.init();
        document.getElementById('loading').classList.add("hidden");
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
    playhead.style.left = `76px`;
    playhead.style.transform = `translateX(${progress * stepsWidth}px)`;
  }
}

export { UI };
