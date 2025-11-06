// import * as THREE from 'three';

async function loadExternalLibrary(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadLibraries() {
  if (!window.THREE) {
    await loadExternalLibrary('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
  }
}
  class Visualisation {
  constructor(container) {
    this.container = container;

    window.addEventListener('resize', () => this.onResize());
  }


  async init() {
    await loadLibraries();
    const THREE = window.THREE;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.z = 5;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const point = new THREE.PointLight(0xffffff, 1);
    point.position.set(0, 0, 10);
    this.scene.add(point);

    // Create spheres
    this.spheres = [];
    this.colors = [0x4CAF50, 0x2196F3, 0xFFC107, 0xE91E63]; // Kick, Snare, Hi-hat, Perc
    const radius = 2.5;
    const positions = [
      [0, radius, 0],      // top - Kick (green)
      [radius, 0, 0],      // right - Snare (blue)
      [0, -radius, 0],     // bottom - Hi-hat (yellow)
      [-radius, 0, 0]      // left - Perc (pink)
    ];

    positions.forEach((pos, i) => {
      const geometry = new THREE.SphereGeometry(0.15, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: this.colors[i],
        emissive: this.colors[i],
        emissiveIntensity: 0.2,
        metalness: 0.8,
        roughness: 0.2
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...pos);
      this.scene.add(sphere);
      this.spheres.push({
        mesh: sphere,
        baseEmissive: 0.2,
        targetEmissive: 0.2,
        currentEmissive: 0.2
      });
    });

    this.lasers = [];
    this.activeLasers = [];
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  triggerHit(trackIndex) {
    if (this.spheres[trackIndex]) {
      this.spheres[trackIndex].targetEmissive = 1.5;
    }
  }

  createLaser(indices) {
    if (indices.length < 2) return;

    const laserColor = 0x00FFFF;
    const lasers = [];

    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const start = this.spheres[indices[i]].mesh.position;
        const end = this.spheres[indices[j]].mesh.position;

        const points = [start.clone(), end.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: laserColor,
          transparent: true,
          opacity: 0.8
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        lasers.push({ line, opacity: 0.8, fadeRate: 0.03 });
      }
    }

    this.activeLasers.push(...lasers);
  }

  update() {
    // Update sphere emissive
    this.spheres.forEach(sphere => {
      sphere.currentEmissive += (sphere.targetEmissive - sphere.currentEmissive) * 0.2;
      sphere.mesh.material.emissiveIntensity = sphere.currentEmissive;
      sphere.targetEmissive += (sphere.baseEmissive - sphere.targetEmissive) * 0.1;
    });

    // Update lasers
    this.activeLasers = this.activeLasers.filter(laser => {
      laser.opacity -= laser.fadeRate;
      laser.line.material.opacity = Math.max(0, laser.opacity);

      if (laser.opacity <= 0) {
        this.scene.remove(laser.line);
        laser.line.geometry.dispose();
        laser.line.material.dispose();
        return false;
      }
      return true;
    });

    // Subtle rotation
    this.scene.rotation.y += 0.001;

    this.renderer.render(this.scene, this.camera);
  }

  updateTheme(isDark) {
    const bgColor = isDark ? 0x000000 : 0xf5f5f5;
    this.renderer.setClearColor(bgColor, 0);
  }
}

export { Visualisation };
