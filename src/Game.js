import * as THREE from 'three';
import { Player } from './Player.js';
import { World } from './World.js';
import { UI } from './UI.js';
import { AudioManager } from './AudioManager.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        
        // 1. Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#87CEEB'); // Sky blue matched with CSS
        // Removed Fog to maintain crisp clear views for voxel rendering
        
        // 2. Camera Setup (Orthographic/Isometric view is critical for Crossy Road feel)
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
        this.updateCameraForScreen(); // Run initially reliably mapping dynamic limits properly
        this.camera.lookAt(0, 0, 0);

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Enables rich vibrant Hex rendering mappings 
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.setClearColor(0x87CEEB, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 4. Game Systems Initialization
        this.ui = new UI(this);
        this.world = new World(this.scene, this);
        this.player = new Player(this.scene, this.world, this);

        // 5. Game State
        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;
        this.carrots = 0;
        this.moves = 0; // Tracks early tutorial bindings explicitly
        this.particles = [];
        this.splashState = false;
        this.splashTimer = 0;
        
        this.setupLights();
        
        // Audio Bindings
        this.audio = new AudioManager(this.camera);
        
        // Resize handler
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);

        // 6. Start Loop
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.renderer.setAnimationLoop(this.animate);
    }

    setupLights() {
        // Soft ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);

        // Directional light simulating the sun with shadows on safely dimmed
        this.dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
        this.dirLight.position.set(5, 10, 5); // Shifted overhead closely mapped preventing stretching
        this.dirLight.castShadow = true;
        
        // Enhance shadow map properties for crisp but wide shadows mapped optimally
        this.dirLight.shadow.camera.near = 0.1;
        this.dirLight.shadow.camera.far = 50;
        this.dirLight.shadow.camera.left = -60;
        this.dirLight.shadow.camera.right = 60;
        this.dirLight.shadow.camera.top = 60;
        this.dirLight.shadow.camera.bottom = -60;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        
        this.dirLight.shadow.bias = -0.0001; // Critical map ensuring character shadows glue to the feet
        
        this.scene.add(this.dirLight);
        this.scene.add(this.dirLight.target);
    }

    updateCameraForScreen() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // Dynamic camera tracking accurately resolving mobile portrait cutoffs exclusively
        if (window.innerWidth < 768) {
            this.frustumSize = 12.0; 
            this.camera.position.set(25, 25, 25); 
        } else {
            this.frustumSize = 6.0; 
            this.camera.position.set(20, 20, 20); 
        }
        
        this.camera.left = -this.frustumSize * aspect / 2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize / 2;
        this.camera.bottom = -this.frustumSize / 2;
        this.camera.updateProjectionMatrix();
        
        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    onWindowResize() {
        this.updateCameraForScreen();
    }

    init() {
        this.isGameOver = false;
        // Initial silent generate for Home Screen background visualization
        this.world.generateInitial();
        this.player.reset();
        
        // Orient default preview position mapping correctly to user UI interactions natively
        this.player.mesh.rotation.y = Math.PI; 
        
        // Safely trigger Audio initialization immediately overriding the very first user interaction exclusively securely
        const initGame = () => {
            if (!this.musicStarted) {
                this.musicStarted = true;
                if (THREE.AudioContext.getContext().state === 'suspended') {
                    THREE.AudioContext.getContext().resume();
                }
                // Stop home song aggressively jumping gameplay specifically preventing races
                if (!this.isRunning) {
                    this.audio.playMusic('home-song');
                }
            }
        };
        document.body.addEventListener('click', initGame, { once: true });
        document.body.addEventListener('touchstart', initGame, { once: true });
        
        // Show home right securely letting them observe characters without interactions gracefully
        this.ui.showHome();
    }

    start() {
        // Reset state for new round
        this.isGameOver = false;
        
        this.score = 0;
        this.moves = 0;
        document.getElementById('tutorial-keys').style.opacity = '1';
        
        this.splashState = false;
        this.particles.forEach(p => this.scene.remove(p));
        this.particles = [];

        this.world.reset();
        this.player.reset();
        this.player.mesh.rotation.y = Math.PI; // Face forward actively
        this.world.generateInitial();
        
        this.ui.updateScore(this.score);
        this.ui.updateCarrots(this.carrots);
        this.ui.showHUD();
        
        // Force sync audio contexts locally 
        if (THREE.AudioContext.getContext().state === 'suspended') {
            THREE.AudioContext.getContext().resume();
        }
        
        this.audio.stopMusic();
        this.audio.playAmbient('traffic-ambient');
        
        this.isRunning = true;
    }
    
    returnToHome() {
        // Allow return if playing, splashing, or actively in Game Over!
        if (!this.isRunning && !this.splashState && !this.isGameOver) return;
        
        this.isRunning = false;
        this.isGameOver = false;
        this.splashState = false;
        this.audio.stopAmbient();
        
        this.score = 0;
        this.carrots = 0;
        this.moves = 0;
        
        this.particles.forEach(p => this.scene.remove(p));
        this.particles = [];
        
        this.world.reset();
        this.player.reset();
        this.player.mesh.rotation.y = Math.PI; // Face forward explicitly
        this.world.generateInitial();
        
        this.ui.updateScore(this.score);
        this.ui.updateCarrots(this.carrots);
        this.ui.showHome();
        
        this.audio.playMusic('home-song');
    }

    gameOver() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.isGameOver = true;
        
        this.audio.stopAmbient();
        this.audio.playSound('die');
        
        this.ui.showGameOver(this.score);
    }

    addScore() {
        this.score++;
        this.ui.updateScore(this.score);
    }

    addCarrot() {
        this.carrots++;
        this.ui.updateCarrots(this.carrots);
        this.audio.playSound('eat');
    }

    createSplash(x, y, z) {
        this.splashState = true;
        this.splashTimer = 0.5; // hold for 0.5s before game over screen
        
        for (let i = 0; i < 12; i++) {
            const size = Math.random() * 0.2 + 0.1;
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshStandardMaterial({color: 0x45c2ea, transparent: true, opacity: 0.8});
            const p = new THREE.Mesh(geo, mat);
            p.position.set(x, y + 0.2, z);
            
            // Random velocities
            p.userData.vx = (Math.random() - 0.5) * 8;
            p.userData.vy = Math.random() * 6 + 3;
            p.userData.vz = (Math.random() - 0.5) * 8;
            
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    animate() {
        const delta = this.clock.getDelta();
        
        if (this.isRunning && !this.splashState) {
            // Update systems
            this.player.update(delta);
            this.world.update(delta, this.player);
            
            // Smooth Camera Follow revealing more forward tracks
            const lookAheadOffset = new THREE.Vector3(0, 0, -3.5);
            const camDist = window.innerWidth < 768 ? 25 : 20;
            const targetCamPos = this.player.mesh.position.clone().add(lookAheadOffset).add(new THREE.Vector3(camDist, camDist, camDist));
            this.camera.position.lerp(targetCamPos, 8 * delta);
        } else if (!this.isRunning && !this.splashState && !this.isGameOver) {
            // Revert back cleanly to standard map rendering perspectives
            // Constrain camera optimally rendering the start chunk reliably seamlessly anchored
            const menuDist = window.innerWidth < 768 ? 20 : 15;
            const menuCamPos = new THREE.Vector3(menuDist, menuDist, menuDist);
            this.camera.position.lerp(menuCamPos, 4 * delta);
            this.camera.lookAt(0, 0, 0);
        }
        // If this.isGameOver is true, the camera simply holds its lingering position flawlessly displaying the death!

        // Particle physics integration
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.vy -= 15 * delta; // gravity
            p.position.x += p.userData.vx * delta;
            p.position.y += p.userData.vy * delta;
            p.position.z += p.userData.vz * delta;
            
            if (p.position.y < -2) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }
        
        // Splash timer state logic for dramatic game over delay
        if (this.splashState) {
            this.splashTimer -= delta;
            if (this.splashTimer <= 0) {
                this.splashState = false;
                this.gameOver();
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}
