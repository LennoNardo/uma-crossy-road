import * as THREE from 'three';
import { Obstacle } from './Obstacle.js';
import { Carrot } from './Carrot.js';

export class Lane {
    constructor(scene, type, z, game) {
        this.scene = scene;
        this.game = game;
        this.type = type; // 'grass', 'road', 'river', 'railway'
        this.z = z;
        this.obstacles = [];
        this.carrots = [];
        this.mesh = new THREE.Group();
        this.mesh.position.z = z;
        this.scene.add(this.mesh);
        
        // Setup initial kinetic parameters
        this.speed = (Math.random() * 2 + 3) * (Math.random() < 0.5 ? 1 : -1);
        if (this.type === 'railway') {
            // Trains are extremely fast, overriding typical limits to become high-threat obstacles
            this.speed = 28 * Math.sign(this.speed);
            this.warningActive = false;
            this.warningTimer = 0;
            this.trainTimer = Math.random() * 4 + 3;
        }

        this.createFloor();
        this.populate();
    }

    createFloor() {
        const geo = new THREE.BoxGeometry(100, 1, 1);
        let color = 0x88e040; // grass vibrant
        let transparent = false;
        let opacity = 1.0;
        if (this.type === 'road') color = 0x4a4a4a;
        if (this.type === 'river') {
            color = 0x45c2ea; // clear light blue
            transparent = true;
            opacity = 0.8;
        }
        if (this.type === 'railway') color = 0x665555;
        
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, transparent, opacity });
        const floor = new THREE.Mesh(geo, mat);
        floor.position.y = -0.5;
        floor.receiveShadow = true;
        this.mesh.add(floor);

        if (this.type === 'grass') {
            for (let i = 0; i < 40; i++) {
                const tuftGeo = new THREE.BoxGeometry(0.2, 0.4 + Math.random()*0.3, 0.2);
                const tuftMat = new THREE.MeshStandardMaterial({ color: 0x7cd936, roughness: 0.9 });
                const tuft = new THREE.Mesh(tuftGeo, tuftMat);
                tuft.position.set((Math.random() - 0.5) * 90, -0.2, (Math.random() - 0.5) * 0.8);
                tuft.receiveShadow = true;
                tuft.castShadow = true;
                this.mesh.add(tuft);
            }
        }
        
        // Road dashed line markings
        if (this.type === 'road') {
            for(let i= -48; i<=48; i+=4) {
                const markGeo = new THREE.BoxGeometry(2, 0.05, 0.2);
                const markMat = new THREE.MeshStandardMaterial({color: 0xffffff});
                const mark = new THREE.Mesh(markGeo, markMat);
                mark.position.set(i, 0.01, 0);
                this.mesh.add(mark);
            }
        }

        // Specialized railway visual indicators
        if (this.type === 'railway') {
            for(let i= -48; i<=48; i+=2) {
                const plankGeo = new THREE.BoxGeometry(0.8, 0.1, 0.2);
                const plankMat = new THREE.MeshStandardMaterial({color: 0x442211, roughness: 0.9});
                const plank = new THREE.Mesh(plankGeo, plankMat);
                plank.position.set(i, 0.05, 0);
                this.mesh.add(plank);
            }
            
            const trackGeo = new THREE.BoxGeometry(100, 0.1, 0.1);
            const trackMat = new THREE.MeshStandardMaterial({color: 0x888888, roughness: 0.6});
            const t1 = new THREE.Mesh(trackGeo, trackMat); t1.position.set(0, 0.1, -0.3);
            const t2 = new THREE.Mesh(trackGeo, trackMat); t2.position.set(0, 0.1, 0.3);
            this.mesh.add(t1, t2);
            
            this.lightMat = new THREE.MeshBasicMaterial({color: 0x330000}); // basic material to emulate a glow organically
            
            [-5.5, 5.5].forEach(x => {
                const signGroup = new THREE.Group();
                const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
                const poleMat = new THREE.MeshStandardMaterial({color: 0x888888});
                const pole = new THREE.Mesh(poleGeo, poleMat);
                pole.position.set(x, 0.1, 0); // Repositioned closely matching natural player bounds visibility
                
                const lightGeo = new THREE.BoxGeometry(0.5, 0.4, 0.2);
                const warningLight = new THREE.Mesh(lightGeo, this.lightMat); // Material bound instances synchronously toggle
                warningLight.position.set(0, 0.6, 0);
                pole.add(warningLight);
                
                signGroup.add(pole);
                signGroup.position.z = -0.5; // push slightly back
                this.mesh.add(signGroup);
            });
        }
    }

    populate() {
        if (this.type === 'grass') {
            const positions = new Set();
            const numTrees = Math.floor(Math.random() * 10) + 5; // More trees for wide background
            for (let i = 0; i < numTrees; i++) {
                let x = Math.floor(Math.random() * 49) - 24; // between -24 and 24 constraints
                
                // Exclude 0,0 grid (spawn coordinate immunity bounds) and keep central bounds clear optionally? We'll just exclude 0.
                if (!positions.has(x) && !(this.z === 0 && x === 0)) { 
                    positions.add(x);
                    const tree = new Obstacle(this.mesh, 'tree', x, this.z);
                    this.obstacles.push(tree);
                }
            }
            // Carrot distribution pass module
            if (Math.random() < 0.2) {
                let x = Math.floor(Math.random() * 9) - 4; // Keep carrots near playable area
                if (!positions.has(x) && !(this.z === 0 && x === 0)) {
                    positions.add(x);
                    const carrot = new Carrot(this.mesh, x, this.z);
                    this.carrots.push(carrot);
                }
            }
        } else if (this.type === 'road') {
            const numCars = Math.floor(Math.random() * 3) + 2; // 2 to 4 cars
            for (let i = 0; i < numCars; i++) {
                const x = -15 + i * 10;
                const car = new Obstacle(this.mesh, 'car', x, this.z, this.speed);
                this.obstacles.push(car);
            }
        } else if (this.type === 'river') {
            const isLilypad = Math.random() < 0.25; // 25% chance for purely Lilypad layout allowing stepping stones
            
            if (isLilypad) {
                this.speed = 0; // Completely STATIONARY stepping stones.
                let currentX = -24;
                while (currentX < 26) {
                    this.obstacles.push(new Obstacle(this.mesh, 'lilypad', currentX, this.z, this.speed));
                    currentX += Math.random() * 2 + 2.5; // Frequent spacing
                }
            } else {
                let currentX = -24 + (Math.abs(this.z) % 2) * 2; // Offset synchronization across varied adjacent lanes
                while (currentX < 26) {
                    const logLength = Math.random() * 1.5 + 2.5; // Ensuring easy capture ranges
                    this.obstacles.push(new Obstacle(this.mesh, 'log', currentX, this.z, this.speed, logLength));
                    const gap = Math.random() * 1.0 + 1.0; // Strictly safe horizontal transitions map boundaries
                    currentX += logLength + gap;
                }
            }
        }
        
        // Natural Map Boundaries (Physical vs Logical) - Fill far edges
        for (let x of [-6, -7, -8, 6, 7, 8]) {
            if (this.type === 'river') {
                this.obstacles.push(new Obstacle(this.mesh, 'rock', x, this.z)); // Edge Boulders
            } else if (this.type === 'grass') {
                this.obstacles.push(new Obstacle(this.mesh, 'tree', x, this.z)); // Dense edge trees
            }
            // Road and Railway intentionally skip rendering physical trees representing pure logic walls
        }
        // Train dynamic spawns map execution relies on timer loop instead
    }

    hasStaticObstacle(x) {
        return this.obstacles.some(obs => (obs.type === 'tree' || obs.type === 'rock') && obs.initialX === x);
    }

    update(delta) {
        // Continuous delta modifiers
        this.obstacles.forEach(obs => {
            if (obs.type === 'car' || obs.type === 'log' || obs.type === 'lilypad') {
                obs.mesh.position.x += this.speed * delta;
                
                // Wrap mechanism constraints looping continuously based on bound metrics
                if (this.speed > 0 && obs.mesh.position.x > 30) obs.mesh.position.x = -30;
                if (this.speed < 0 && obs.mesh.position.x < -30) obs.mesh.position.x = 30;
                
                obs.updateBoundingBox();
            } else if (obs.type === 'train') {
                // Trains rely strictly on linear execution termination loop bounds
                obs.mesh.position.x += this.speed * delta;
                obs.updateBoundingBox();
            }
        });

        // Event timeline validation sequences
        if (this.type === 'railway') {
            this.trainTimer -= delta;
            
            // Advance-trigger light indicator initialization checks pushing forward early alerts
            if (this.trainTimer <= 2.0 && !this.warningActive) {
                this.warningActive = true;
                this.lightMat.color.setHex(0xff0000); // Visual override trigger phase enable
                
                // Play environmental environment alert for high-speed train sequence gracefully
                if (this.game && this.game.audio) {
                    this.game.audio.playSound('train-pass');
                }
            }

            // Train projectile spawn sequences mapping
            if (this.trainTimer <= 0) {
                const startX = this.speed > 0 ? -30 : 30;
                const train = new Obstacle(this.mesh, 'train', startX, this.z, this.speed);
                this.obstacles.push(train);
                
                this.trainTimer = Math.random() * 5 + 4; // Refill delay longer sequence so traversing is an event
                this.warningActive = false;
                this.lightMat.color.setHex(0x330000); // Dark trigger reset maps bounds
            }

            // Cleanup routine triggers optimization layers checking
            this.obstacles = this.obstacles.filter(obs => {
                if (obs.type === 'train' && (obs.mesh.position.x > 50 || obs.mesh.position.x < -50)) {
                    obs.remove(); 
                    return false;
                }
                return true;
            });
        }

        // Apply idle rendering routines triggers overrides constraints
        this.carrots.forEach(carrot => carrot.update(delta));
    }

    collectCarrot(carrot, index) {
        carrot.remove();
        this.carrots.splice(index, 1);
    }

    remove() {
        this.obstacles.forEach(o => o.remove());
        this.carrots.forEach(c => c.remove());
        this.scene.remove(this.mesh);
    }
}
