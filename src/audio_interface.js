class AudioInterface {
  constructor() {
    this.sonic = null;
    this.initialised = false;
    this.sampleBuffers = {};
    this.currentSamples = {
      0: 0,  // Kick - defaults to first bd sample
      1: 0,  // Snare - defaults to first sn sample
      2: 0,  // Hi-hat - defaults to first hat sample
      3: 0   // Perc - defaults to first glitch sample
    };
  }

  getSampleCategories() {
    return {
      0: { // Kick
        prefix: 'bd_',
        samples: [
          "bd_808.flac",
          "bd_ada.flac",
          "bd_boom.flac",
          "bd_chip.flac",
          "bd_fat.flac",
          "bd_gas.flac",
          "bd_haus.flac",
          "bd_jazz.flac",
          "bd_klub.flac",
          "bd_mehackit.flac",
          "bd_pure.flac",
          "bd_sone.flac",
          "bd_tek.flac",
          "bd_zome.flac",
          "bd_zum.flac"
        ]
      },
      1: { // Snare
        prefix: 'sn_',
        samples: [
          "sn_dolf.flac",
          "sn_dub.flac",
          "sn_generic.flac",
          "sn_zome.flac"
        ]
      },
      2: { // Hi-hat
        prefix: 'hat_',
        samples: [
          "hat_bdu.flac",
          "hat_cab.flac",
          "hat_cats.flac",
          "hat_gem.flac",
          "hat_gnu.flac",
          "hat_gump.flac",
          "hat_hier.flac",
          "hat_len.flac",
          "hat_mess.flac",
          "hat_metal.flac",
          "hat_noiz.flac",
          "hat_psych.flac",
          "hat_raw.flac",
          "hat_sci.flac",
          "hat_snap.flac",
          "hat_star.flac",
          "hat_tap.flac",
          "hat_yosh.flac",
          "hat_zan.flac",
          "hat_zap.flac",
          "hat_zild.flac"
        ]
      },
      3: { // Perc
        prefix: 'glitch_',
        samples: [
          "glitch_bass_g.flac",
          "glitch_perc1.flac",
          "glitch_perc2.flac",
          "glitch_perc3.flac",
          "glitch_perc4.flac",
          "glitch_perc5.flac",
          "glitch_robot1.flac",
          "glitch_robot2.flac"
        ]
      }
    };
  }

  async init() {
    if (this.initialised) return this.sonic;

    const { SuperSonic } = await import('../dist/supersonic.js');

    this.sonic = new SuperSonic({
      sampleBaseURL: "../dist/etc/samples/",
      synthdefBaseURL: "../dist/etc/synthdefs/"
    });

    await this.sonic.init();

    // Load synthdef
    await this.sonic.loadSynthDefs(["sonic-pi-basic_stereo_player"]);

    // Load all samples and map them by name
    const categories = this.getSampleCategories();
    let bufferIndex = 0;

    for (const trackIndex in categories) {
      const category = categories[trackIndex];
      this.sampleBuffers[trackIndex] = {};

      for (let i = 0; i < category.samples.length; i++) {
        const sampleName = category.samples[i];
        await this.sonic.loadSample(bufferIndex, sampleName);
        this.sampleBuffers[trackIndex][i] = bufferIndex;
        bufferIndex++;
      }
    }

    this.initialised = true;
    console.log('[Audio] Initialized with', bufferIndex, 'samples');
    console.log('[Audio] Sample buffers:', this.sampleBuffers);
    console.log('[Audio] Current samples:', this.currentSamples);
    return this.sonic;
  }

  setSample(trackIndex, sampleIndex) {
    this.currentSamples[trackIndex] = sampleIndex;
  }

  playSample(trackIndex) {
    if (!this.initialised) return;

    const sampleIndex = this.currentSamples[trackIndex];
    const bufferIndex = this.sampleBuffers[trackIndex][sampleIndex];
    console.log(`[Audio] Track ${trackIndex}: currentSample=${sampleIndex}, bufferIndex=${bufferIndex}`);

    if (bufferIndex === undefined) {
      console.warn(`No buffer found for track ${trackIndex}, sample ${sampleIndex}`);
      return;
    }

    this.sonic.send(
      "/s_new",
      "sonic-pi-basic_stereo_player",
      -1,
      0,
      0,
      "buf",
      bufferIndex,
      "amp",
      1.0,
      "pan",
      0
    );
  }
}

export { AudioInterface };
