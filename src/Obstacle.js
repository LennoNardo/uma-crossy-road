import * as THREE from 'three';

export class Obstacle {
    constructor(parentMesh, type, initialX, z, speed = 0, length = null) {
        this.parentMesh = parentMesh;
        this.type = type;
        this.initialX = initialX;
        this.z = z;
        this.speed = speed;
        this.length = length || (Math.random() * 1.5 + 2.5); // Default log length
        this.mesh = new THREE.Group();
        this.mesh.position.x = initialX;
        
        // Face the vehicle forward based on velocity vector natively mapping locally to Z axis.
        if (type === 'car' || type === 'train') {
            this.mesh.rotation.y = speed > 0 ? -Math.PI / 2 : Math.PI / 2;
        }
        this.parentMesh.add(this.mesh);
        
        this.createMesh();
        
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    createMesh() {
        if (this.type === 'tree') {
            const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 5);
            const trunkMat = new THREE.MeshStandardMaterial({color: 0xb86f32});
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 0.3;
            trunk.castShadow = true;
            
            const leavesGeo = new THREE.ConeGeometry(0.6, 1.2, 5);
            const leavesMat = new THREE.MeshStandardMaterial({color: 0x7cd936});
            const leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = 1.2;
            leaves.castShadow = true;
            this.mesh.add(trunk, leaves);
        } else if (this.type === 'car') {
            const isTruck = Math.random() < 0.3;
            const color = [0xff4444, 0x4444ff, 0xffff44, 0xffffff][Math.floor(Math.random()*4)];
            const group = new THREE.Group();
            
            // Modeled locally with +Z acting as the "front"
            const bodyLength = isTruck ? 1.8 : 1.2;
            const bodyGeo = new THREE.BoxGeometry(0.8, 0.4, bodyLength);
            const bodyMat = new THREE.MeshStandardMaterial({color: color});
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.4;
            body.castShadow = true;
            group.add(body);
            
            const cabinLength = isTruck ? 0.6 : 0.8;
            const cabinGeo = new THREE.BoxGeometry(0.7, 0.4, cabinLength);
            const cabinMat = new THREE.MeshStandardMaterial({color: 0xccffff});
            const cabin = new THREE.Mesh(cabinGeo, cabinMat);
            cabin.position.y = 0.8;
            cabin.position.z = isTruck ? 0.4 : 0;
            cabin.castShadow = true;
            group.add(cabin);

            // Headlights (+Z front)
            const hlGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
            const hlMat = new THREE.MeshStandardMaterial({color: 0xffffaa});
            const hl1 = new THREE.Mesh(hlGeo, hlMat); hl1.position.set(0.25, 0.4, bodyLength/2 + 0.05); group.add(hl1);
            const hl2 = new THREE.Mesh(hlGeo, hlMat); hl2.position.set(-0.25, 0.4, bodyLength/2 + 0.05); group.add(hl2);

            // Taillights (-Z back)
            const tlGeo = new THREE.BoxGeometry(0.2, 0.15, 0.1);
            const tlMat = new THREE.MeshStandardMaterial({color: 0xff0000});
            const tl1 = new THREE.Mesh(tlGeo, tlMat); tl1.position.set(0.25, 0.4, -bodyLength/2 - 0.05); group.add(tl1);
            const tl2 = new THREE.Mesh(tlGeo, tlMat); tl2.position.set(-0.25, 0.4, -bodyLength/2 - 0.05); group.add(tl2);
            
            const wheelGeo = new THREE.BoxGeometry(0.2, 0.3, 0.3);
            const wheelMat = new THREE.MeshStandardMaterial({color: 0x111111});
            const wPositions = [
                [0.4, 0.15, bodyLength/2 - 0.3], [-0.4, 0.15, bodyLength/2 - 0.3],
                [0.4, 0.15, -bodyLength/2 + 0.3], [-0.4, 0.15, -bodyLength/2 + 0.3]
            ];
            wPositions.forEach(pos => {
                const wheel = new THREE.Mesh(wheelGeo, wheelMat);
                wheel.position.set(...pos);
                wheel.castShadow = true;
                group.add(wheel);
            });
            this.mesh.add(group);
        } else if (this.type === 'log') {
            const geo = new THREE.BoxGeometry(this.length, 0.2, 0.8); // Much thinner flat-ish planks
            const mat = new THREE.MeshStandardMaterial({color: 0xb86f32});
            const log = new THREE.Mesh(geo, mat);
            log.position.y = 0.0; // Pushed down natively resting directly along water mappings instead of flying
            log.castShadow = true;
            
            // Add bark texture blocks dynamically mapped cleanly along the shortened profiles
            for(let i=0; i<3; i++) {
                const barkGeo = new THREE.BoxGeometry(this.length * 0.2, 0.05, 0.3);
                const barkMat = new THREE.MeshStandardMaterial({color: 0x6e421e});
                const bark = new THREE.Mesh(barkGeo, barkMat);
                bark.position.set(
                    (Math.random() - 0.5) * this.length * 0.7, 
                    0.125, // Safely atop the 0.2 log thickness center mapped height
                    (Math.random() - 0.5) * 0.4
                );
                log.add(bark);
            }
            
            this.mesh.add(log);
        } else if (this.type === 'lilypad') {
            const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 8);
            const mat = new THREE.MeshStandardMaterial({color: 0x4aa832});
            const pad = new THREE.Mesh(geo, mat);
            pad.position.y = 0.05;
            pad.castShadow = true;
            this.mesh.add(pad);
        } else if (this.type === 'rock') {
            const geo = new THREE.DodecahedronGeometry(0.45);
            const mat = new THREE.MeshStandardMaterial({color: 0x666666, roughness: 0.9});
            const rock = new THREE.Mesh(geo, mat);
            rock.position.y = 0.25;
            rock.castShadow = true;
            this.mesh.add(rock);
        } else if (this.type === 'train') {
            const group = new THREE.Group();
            
            // Engine main
            const engineGeo = new THREE.BoxGeometry(0.9, 1.2, 2.0);
            const engineMat = new THREE.MeshStandardMaterial({color: 0x222222});
            const engine = new THREE.Mesh(engineGeo, engineMat);
            engine.position.z = 5; // +Z front axis
            engine.position.y = 0.6;
            engine.castShadow = true;
            group.add(engine);

            // Cowcatcher
            const cowGeo = new THREE.BoxGeometry(1.0, 0.4, 0.4);
            const cowMat = new THREE.MeshStandardMaterial({color: 0x555555});
            const cow = new THREE.Mesh(cowGeo, cowMat);
            cow.position.set(0, 0.2, 6.1); 
            group.add(cow);

            // Chimney
            const chimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6);
            const chimMat = new THREE.MeshStandardMaterial({color: 0x111111});
            const chim = new THREE.Mesh(chimGeo, chimMat);
            chim.position.set(0, 1.5, 5.5);
            group.add(chim);
            
            const cabGeo = new THREE.BoxGeometry(0.9, 1.6, 0.8);
            const cabMat = new THREE.MeshStandardMaterial({color: 0x444444});
            const cab = new THREE.Mesh(cabGeo, cabMat);
            cab.position.z = 4.4;
            cab.position.y = 0.8;
            cab.castShadow = true;
            group.add(cab);

            // Connecting Carriages
            for(let i=0; i<3; i++) {
                const carrGroup = new THREE.Group();
                const carrZ = 1.5 - i * 3.2; // Spacing layout trailing -Z
                carrGroup.position.z = carrZ;
                
                const carrGeo = new THREE.BoxGeometry(0.9, 1.0, 2.8);
                const carrMat = new THREE.MeshStandardMaterial({color: [0xcc4444, 0x44cc44, 0x4444cc][i]});
                const carr = new THREE.Mesh(carrGeo, carrMat);
                carr.position.y = 0.5;
                carr.castShadow = true;
                carrGroup.add(carr);
                
                // Carriage windows matching
                const winGeo = new THREE.BoxGeometry(1.0, 0.4, 2.0); 
                const winMat = new THREE.MeshStandardMaterial({color: 0xccffff});
                const win = new THREE.Mesh(winGeo, winMat);
                win.position.y = 0.7;
                carrGroup.add(win);
                
                group.add(carrGroup);
                
                // Coupler tracking accurately
                const couplerGeo = new THREE.BoxGeometry(0.4, 0.2, 0.4);
                const couplerMat = new THREE.MeshStandardMaterial({color: 0x111111});
                const coupler = new THREE.Mesh(couplerGeo, couplerMat);
                coupler.position.z = carrZ + 1.6; 
                coupler.position.y = 0.3;
                group.add(coupler);
            }
            this.mesh.add(group);
        }
    }

    updateBoundingBox() {
        // Evaluate based on global bounds considering its a child grouping
        this.boundingBox.setFromObject(this.mesh);

        // Subtractive modification allows tight corner turning grace windows
        if (this.type !== 'log') {
            this.boundingBox.expandByScalar(-0.1);
        } else {
            // Logs require expanded stability platforms for riders so shrinkage could fall players out
        }
    }

    remove() {
        this.parentMesh.remove(this.mesh);
    }
}
