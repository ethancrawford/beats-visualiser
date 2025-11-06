import { Sequencer } from "./sequencer.js";
import { Visualisation } from "./visualisation.js";
import { UI } from "./ui.js";

class App {
  constructor() {
    this.sequencer = new Sequencer(4, 16);
  }

  async init() {
    this.visualisation = new Visualisation(document.getElementById('canvas-container'));
    await this.visualisation.init();
    this.ui = new UI(this.sequencer, this.visualisation);
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const activeSteps = this.sequencer.update(performance.now());

    if (activeSteps) {
      const activeIndices = [];
      activeSteps.forEach((isActive, index) => {
        if (isActive) {
          this.visualisation.triggerHit(index);
          activeIndices.push(index);
        }
      });

      if (activeIndices.length > 1) {
        this.visualisation.createLaser(activeIndices);
      }
    }

    this.ui.updatePlayhead();
    this.visualisation.update();
  }
}

export { App };
