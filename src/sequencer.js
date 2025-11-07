import { AudioInterface } from "./audio_interface.js";

class Sequencer {
  constructor(numTracks = 4, numSteps = 16) {
    this.numTracks = numTracks;
    this.numSteps = numSteps;
    this.pattern = Array(numTracks).fill(null).map(() => Array(numSteps).fill(false));
    this.isPlaying = false;
    this.currentStep = -1;
    this.tempo = 120;
    this.startTime = 0;
    this.loadDefaultPattern();
    this.audioInterface = new AudioInterface();
  }

  loadDefaultPattern() {
    // "Boots and cats" pattern
    // Kick (boots): on beats 1 and 3 (steps 0, 4, 8, 12)
    this.pattern[0] = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
    // Snare (and): on beats 2 and 4 (steps 4, 12)
    this.pattern[1] = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
    // Hi-hat (cats): on every 8th note (steps 2, 6, 10, 14)
    this.pattern[2] = [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false];
    // Perc: sparse accents
    this.pattern[3] = [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false];
  }

  toggleStep(track, step) {
    this.pattern[track][step] = !this.pattern[track][step];
  }

  getActiveStep(step) {
    return this.pattern.map(track => track[step]);
  }

  play() {
    this.isPlaying = true;
    this.startTime = performance.now();
  }

  pause() {
    this.isPlaying = false;
  }

  rewind() {
    this.currentStep = -1;
    this.startTime = performance.now();
  }

  clear() {
    this.pattern = Array(this.numTracks).fill(null).map(() => Array(this.numSteps).fill(false));
  }

  setTempo(bpm) {
    this.tempo = bpm;
  }

  update(time) {
    if (!this.isPlaying) return null;

    const beatDuration = (60 / this.tempo) * 1000;
    const stepDuration = beatDuration / 4;
    const elapsed = time - this.startTime;
    const newStep = Math.floor(elapsed / stepDuration) % this.numSteps;

    if (newStep !== this.currentStep) {
      this.currentStep = newStep;
      const activeSteps = this.getActiveStep(this.currentStep);
      // Trigger audio for active steps
      if (this.audioInterface.initialised) {
        activeSteps.forEach((isActive, trackIndex) => {
          if (isActive) {
            console.log(`Playing sample on track ${trackIndex} at time ${time}, current step ${this.currentStep}`)
            this.audioInterface.playSample(trackIndex);
          }
        });
      }

      return activeSteps;
    }

    return null;
  }

  getProgress() {
    if (!this.isPlaying) return 0;
    const beatDuration = (60 / this.tempo) * 1000;
    const stepDuration = beatDuration / 4;
    const elapsed = performance.now() - this.startTime;
    const stepProgress = (elapsed % stepDuration) / stepDuration;
    return (this.currentStep + stepProgress) / this.numSteps;
  }
}

export { Sequencer };
