import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Player {
    constructor(scene, world, game) {
        this.scene = scene;
        this.world = world;
        this.game = game;

        this.characterType = 'mambo'; // Upgraded core starter class
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);

        // Grid properties
        this.targetPos = new THREE.Vector3(0, 0, 0);
        this.startPos = new THREE.Vector3(0, 0, 0);

        // Movement properties
        this.isMoving = false;
        this.moveDuration = 0.15; // Sec per hop
        this.moveTime = 0;

        // Score tracking
        this.maxZ = 0;

        this.setupMesh();

        // Control Binding
        this.onKeyDown = this.onKeyDown.bind(this);
        window.addEventListener('keydown', this.onKeyDown);

        // Mobile swipe logic natively bounds overrides strictly securely
        this.touchStartX = 0;
        this.touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        window.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(this.touchStartX, this.touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        if (!this.game.isRunning || this.isMoving) return;
        
        const diffX = endX - startX;
        const diffY = endY - startY;
        
        // Define a strict swipe threshold securely preventing accidental taps
        if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;
        
        let moveZ = 0;
        let moveX = 0;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe strictly cleanly parsing bounds natively
            if (diffX > 0) moveX = 1; else moveX = -1;
        } else {
            // Vertical swipe securely translating isometric orientation
            if (diffY > 0) moveZ = 1; else moveZ = -1;
        }
        
        this.executeMove(moveX, moveZ);
    }
    
    onKeyDown(e) {
        if (!this.game.isRunning || this.isMoving) return;

        let moveZ = 0;
        let moveX = 0;

        if (e.key === 'ArrowUp' || e.key === 'w') moveZ = -1;
        else if (e.key === 'ArrowDown' || e.key === 's') moveZ = 1;
        else if (e.key === 'ArrowLeft' || e.key === 'a') moveX = -1;
        else if (e.key === 'ArrowRight' || e.key === 'd') moveX = 1;

        if (moveZ !== 0 || moveX !== 0) {
            this.executeMove(moveX, moveZ);
        }
    }
    
    setCharacter(type) {
        this.characterType = type;
        this.setupMesh();
    }

    setupMesh() {
        // Clear existing models
        while (this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }

        const loader = new GLTFLoader();
        let modelPath = null;
        if (this.characterType === 'mambo') {
            modelPath = 'models/mambo_char.glb';
        } else if (this.characterType === 'teio') {
            modelPath = 'models/tokai-teio_char.glb';
        }

        if (modelPath) {
            loader.load(modelPath, (gltf) => {
                const model = gltf.scene;

                // Measure explicitly to construct uniform grid fit limits securely
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);

                // Safely constrict the model uniformly mapping maximum 0.8 bounding limits inside the voxel cells
                const targetScale = 0.8 / maxDim;
                model.scale.set(targetScale, targetScale, targetScale);

                model.position.y = 0.0; // Anchored strictly against the immediate ground surface 0.0

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        // Force explicit alpha testing natively mitigating z-fighting and texture washing on anime hair maps
                        if (child.material) {
                            child.material.transparent = true;
                            child.material.alphaTest = 0.5;
                            child.material.depthWrite = true;
                            child.material.side = THREE.DoubleSide;
                            child.material.needsUpdate = true;
                        }
                    }
                });

                this.mesh.add(model);
                this.boundingBox.setFromObject(this.mesh);
            }, undefined, (error) => {
                console.error("Error loading model", error);
                this.buildFallbackVoxel();
            });
        } else {
            this.buildFallbackVoxel();
        }

        this.boundingBox = new THREE.Box3();
    }

    buildFallbackVoxel() {
        const group = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const mat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.4;
        body.castShadow = true;
        group.add(body);

        // Coming Soon "?" Indicator
        const headGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
        const hMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        const head = new THREE.Mesh(headGeo, hMat);
        head.position.y = 0.9;
        group.add(head);

        this.mesh.add(group);
        this.boundingBox.setFromObject(this.mesh);
    }

    reset() {
        this.targetPos.set(0, 0, 0);
        this.mesh.position.set(0, 0, 0);
        this.mesh.visible = true;
        this.isMoving = false;
        this.maxZ = 0;
        this.boundingBox.setFromObject(this.mesh);
    }

    onKeyDown(e) {
        // Prevent action if not running or currently jumping
        if (!this.game.isRunning || this.isMoving) return;

        let moveZ = 0;
        let moveX = 0;

        // Map keys to directional step
        // Z is inverted in 3d (forward is -Z)
        if (e.key === 'ArrowUp' || e.key === 'w') moveZ = -1;
        else if (e.key === 'ArrowDown' || e.key === 's') moveZ = 1;
        else if (e.key === 'ArrowLeft' || e.key === 'a') moveX = -1;
        else if (e.key === 'ArrowRight' || e.key === 'd') moveX = 1;

        if (moveZ !== 0 || moveX !== 0) {
            this.executeMove(moveX, moveZ);
        }
    }

    executeMove(moveX, moveZ) {
        // Apply log-riding offset (X is no longer pure integer grid if on log)
        // But we always jump to nearest grid intersection laterally
        const targetX = Math.round(this.mesh.position.x + moveX);
        const targetZ = Math.round(this.mesh.position.z + moveZ);

        // Bounds check
        // We use natural 3D boundary collision mappings now instead of strict arbitrary invisible walls
        if (targetZ > 2) return; // Keep limiting immediate backward retreat excessively off-screen

        // Check world static collisions (Trees)
        if (this.world.isStaticObstacle(targetX, targetZ)) {
            return; // Block movement
        }

        // Calculate model orientation snappy angles locally mapping crossy mappings
        if (moveZ === -1) this.mesh.rotation.y = Math.PI;
        else if (moveZ === 1) this.mesh.rotation.y = 0;
        else if (moveX === -1) this.mesh.rotation.y = -Math.PI / 2;
        else if (moveX === 1) this.mesh.rotation.y = Math.PI / 2;

        // Fading out tutorials reliably once interaction successfully binds natively
        if (this.game.moves !== undefined) {
            this.game.moves++;
            if (this.game.moves >= 2) {
                const tut = document.getElementById('tutorial-keys');
                if (tut) tut.style.opacity = '0';
            }
        }

        // Valid jump, initiate attributes
        this.startPos.copy(this.mesh.position);
        this.targetPos.set(targetX, 0, targetZ);
        this.isMoving = true;
        this.moveTime = 0;

        // Audio execution triggering dynamically matching character limits
        const audioName = `move-${this.characterType === 'teio' ? 'teio' : 'mambo'}`;
        this.game.audio.playSound(audioName);

        // Compute score calculation (farthest lane forward)
        if (targetZ < this.maxZ) {
            this.maxZ = targetZ;
            this.game.addScore();
        }
    }

    update(delta) {
        if (this.isMoving) {
            this.moveTime += delta;
            let t = this.moveTime / this.moveDuration;

            if (t >= 1) {
                t = 1;
                this.isMoving = false;
            }

            // Lerp X, Z for smooth transition
            this.mesh.position.x = THREE.MathUtils.lerp(this.startPos.x, this.targetPos.x, t);
            this.mesh.position.z = THREE.MathUtils.lerp(this.startPos.z, this.targetPos.z, t);

            // Apply bounce ARC smoothly spanning pi scale, up to 0.5 height
            this.mesh.position.y = this.targetPos.y + Math.sin(t * Math.PI) * 0.5;
        }

        // Continually update precise bounding box locally
        this.boundingBox.setFromObject(this.mesh);

        // Shrink heavily for character to avoid unfair grazing collisions
        this.boundingBox.expandByScalar(-0.25);
    }
}
