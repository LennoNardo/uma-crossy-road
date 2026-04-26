import * as THREE from 'three';
import { Lane } from './Lane.js';

export class World {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.lanes = [];
        this.closestZ = 15; // Expanded initial positive bounds eliminating initial voids out back
        this.farthestZ = -30; // Pre-generating depth bounds
    }

    reset() {
        this.lanes.forEach(lane => lane.remove());
        this.lanes = [];
        this.closestZ = 15;
        this.farthestZ = -30;
        
        if (this.fence) {
            this.scene.remove(this.fence);
            this.fence = null;
        }
    }

    generateInitial() {
        // Sequentially create a block of initial layout
        for (let z = this.closestZ; z >= this.farthestZ; z--) {
            this.addLane(z);
        }
        
        this.createFence(2.5); // Accurately behind the immediate 2 limit bound restrictions
    }

    createFence(zPos) {
        this.fence = new THREE.Group();
        this.fence.position.z = zPos;
        
        const woodMat = new THREE.MeshStandardMaterial({color: 0x8B4513}); 
        
        // Vertical Posts
        for (let x = -10; x <= 10; x += 1.5) {
            const postGeo = new THREE.BoxGeometry(0.2, 1.0, 0.2);
            const post = new THREE.Mesh(postGeo, woodMat);
            post.position.set(x, 0.0, 0);
            post.castShadow = true;
            this.fence.add(post);
        }
        
        // Horizontal Rails
        const railGeo = new THREE.BoxGeometry(21, 0.15, 0.1);
        const topRail = new THREE.Mesh(railGeo, woodMat);
        topRail.position.set(0, 0.3, 0.05);
        topRail.castShadow = true;
        
        const midRail = new THREE.Mesh(railGeo, woodMat);
        midRail.position.set(0, -0.1, 0.05);
        midRail.castShadow = true;
        
        this.fence.add(topRail, midRail);
        this.scene.add(this.fence);
    }

    addLane(z) {
        // Safety bounds for starting environment
        let type = 'grass';
        if (z < -3) { // Provide generous solid grass padding at game start
            const r = Math.random();
            // Procedurally determine lane type distribution
            if (r < 0.3) type = 'grass';
            else if (r < 0.6) type = 'road';
            else if (r < 0.8) type = 'river';
            else type = 'railway';
        }
        
        const lane = new Lane(this.scene, type, z, this.game);
        this.lanes.push(lane);
    }

    update(delta, player) {
        // Infinite dynamic generation
        const thresholdZ = player.targetPos.z - 25; // Preload 25 lanes ahead
        while (this.farthestZ > thresholdZ) {
            this.farthestZ--;
            this.addLane(this.farthestZ);
        }

        // Garbage collect passed lanes to ensure stability / constant memory
        const playerZ = player.targetPos.z;
        this.lanes = this.lanes.filter(lane => {
            if (lane.z > playerZ + 18) {
                lane.remove();
                return false;
            }
            return true;
        });

        // Push updates to inner layers
        this.lanes.forEach(lane => lane.update(delta));

        // Enforce Physics / Win/Loss Conditions
        this.checkCollisions(player, delta);
    }

    isStaticObstacle(x, z) {
        // Enforce pure logical "Invisible Walls" bounding the map securely
        if (x < -5 || x > 5) return true;
        
        const lane = this.lanes.find(l => l.z === z);
        if (lane && lane.type === 'grass') {
            return lane.hasStaticObstacle(x);
        }
        return false;
    }

    checkCollisions(player, delta) {
        const playerZ = Math.round(player.targetPos.z);
        const lane = this.lanes.find(l => l.z === playerZ);
        
        if (!lane) return; // Bounds anomaly

        let onLog = false;
        let logSpeed = 0;

        // Broad-phase evaluation
        for (let obs of lane.obstacles) {
            if (obs.type === 'log' || obs.type === 'lilypad') {
                // Perform a reliable 2D bounds check purely against X axes eliminating jumping/Y-height inaccuracies
                const distanceX = Math.abs(player.targetPos.x - obs.mesh.position.x);
                const platformWidth = obs.type === 'log' ? obs.length / 2 : 0.4;
                
                // Allow a generous hit-box forgiveness radius (0.35) safely grabbing platform edges
                if (distanceX < platformWidth + 0.35) {
                    onLog = true;
                    logSpeed = obs.speed || 0;
                }
            } else if (player.boundingBox.intersectsBox(obs.boundingBox)) {
                if (obs.type === 'car' || obs.type === 'train') {
                    // Fatal blow
                    player.game.audio.playSound('get-hit');
                    player.game.gameOver();
                    return;
                }
            }
        }

        // Evaluated ground/fluid penalty
        if (lane.type === 'river' && !player.isMoving && !onLog) {
            // Traversed river block without support triggering the splash effect state
            player.game.audio.playSound('water-drop');
            player.mesh.visible = false;
            player.game.createSplash(player.mesh.position.x, player.mesh.position.y, player.mesh.position.z);
            return;
        }

        // Conveyor evaluation for active logs (drift rider effect)
        if (onLog && !player.isMoving) {
            player.targetPos.x += logSpeed * delta;
            player.mesh.position.x = player.targetPos.x;
            
            // Check out of bounds rider
            if (player.mesh.position.x < -5 || player.mesh.position.x > 5) { 
                player.game.audio.playSound('water-drop');
                player.game.gameOver();
            }
        }
        
        // Collectible execution
        for (let i = lane.carrots.length - 1; i >= 0; i--) {
            const carrot = lane.carrots[i];
            if (player.boundingBox.intersectsBox(carrot.boundingBox)) {
                lane.collectCarrot(carrot, i);
                player.game.addCarrot();
            }
        }
    }
}
