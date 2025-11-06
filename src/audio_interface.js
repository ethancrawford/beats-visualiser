class AudioInterface {
  constructor() {
    this.sonic = null;
    this.initialised = false;
  }

  async init() {
    if (this.initialised) return this.sonic;

    const { SuperSonic } = await import('../dist/supersonic.js');

    this.sonic = new SuperSonic({
      sampleBaseURL: "../dist/etc/samples/",
      synthdefBaseURL: "../dist/etc/synthdefs/"
    });

    await this.sonic.init();

    const samples = [
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
      "bd_zum.flac",
      "sn_dolf.flac",
      "sn_dub.flac",
      "sn_generic.flac",
      "sn_zome.flac",
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
      "hat_zild.flac",
      "glitch_bass_g.flac",
      "glitch_perc1.flac",
      "glitch_perc2.flac",
      "glitch_perc3.flac",
      "glitch_perc4.flac",
      "glitch_perc5.flac",
      "glitch_robot1.flac",
      "glitch_robot2.flac"
    ]
    await this.sonic.loadSynthDefs(["sonic-pi-basic_stereo_player"]);
    samples.forEach(async (sample, index) => await this.sonic.loadSample(index, sample));

    // this.setupReverb();

    this.initialised = true;
    console.log('[Audio] Initialized');
    return this.sonic;
  }

  // setupReverb() {
  //   this.sonic.send('/s_new', 'sonic-pi-fx_reverb', -1, 1, 0,
  //     'out_bus', 0,
  //     'room', 1,
  //     'amp', 0.3
  //   );
  // }

  playSample(params) {
    if (!this.initialised) return;

    // const { name, amp, pan } = params;

    this.sonic.send(
      "/s_new",
      "sonic-pi-basic_stereo_player",
      -1,
      0,
      0,
      "buf",
      id
    );
  }
}

export { AudioInterface };
