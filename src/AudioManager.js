import * as THREE from 'three';

export class AudioManager {
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        
        this.sounds = {};
        this.audioLoader = new THREE.AudioLoader();
        
        this.musicSource = new THREE.Audio(this.listener);
        this.ambientSource = new THREE.Audio(this.listener);
        
        this.loadAssets();
    }
    
    loadAssets() {
        const toLoad = [
            { name: 'home-song', path: 'sounds/home-song.mp3' },
            { name: 'traffic-ambient', path: 'sounds/traffic-ambient.mp3' },
            { name: 'move-mambo', path: 'sounds/move-mambo.mp3' },
            { name: 'move-teio', path: 'sounds/move-teio.mp3' },
            { name: 'die', path: 'sounds/die.mp3' },
            { name: 'get-hit', path: 'sounds/get-hit.mp3' },
            { name: 'water-drop', path: 'sounds/water-drop.mp3' },
            { name: 'train-pass', path: 'sounds/train-pass.mp3' },
            { name: 'eat', path: 'sounds/eat.mp3' }
        ];
        
        toLoad.forEach(item => {
            this.audioLoader.load(item.path, (buffer) => {
                this.sounds[item.name] = buffer;
            });
        });
    }

    playMusic(name) {
        if (!this.sounds[name]) return;
        if (this.musicSource.isPlaying) this.musicSource.stop();
        this.musicSource.setBuffer(this.sounds[name]);
        this.musicSource.setLoop(true);
        this.musicSource.setVolume(0.5);
        this.musicSource.play();
    }
    
    stopMusic() {
        if (this.musicSource.isPlaying) this.musicSource.stop();
    }

    playAmbient(name) {
        if (!this.sounds[name]) return;
        if (this.ambientSource.isPlaying) this.ambientSource.stop();
        this.ambientSource.setBuffer(this.sounds[name]);
        this.ambientSource.setLoop(true);
        this.ambientSource.setVolume(0.3);
        this.ambientSource.play();
    }
    
    stopAmbient() {
        if (this.ambientSource.isPlaying) this.ambientSource.stop();
    }
    
    playSound(name, vol = 1.0) {
        if (!this.sounds[name]) return;
        const sound = new THREE.Audio(this.listener);
        sound.setBuffer(this.sounds[name]);
        sound.setVolume(vol);
        sound.play(); // allows multiple instances per trigger natively
    }
}
