import * as THREE from 'three';

export class Carrot {
    constructor(parentMesh, x, z) {
        this.parentMesh = parentMesh;
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0.5, 0); // Local positioning bounded to Lane hierarchy
        this.parentMesh.add(this.mesh);
        
        // Body: CylinderGeometry scaling natively tapering down representing voxel-lite styling
        const bodyGeo = new THREE.CylinderGeometry(0.15, 0.02, 0.5, 6);
        const bodyMat = new THREE.MeshStandardMaterial({color: 0xFFA500});
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.25; // Sits effectively atop its origin anchor mappings
        body.castShadow = true;
        this.mesh.add(body);
        
        // Detail Rings spanning the carrot thickness dynamically
        const ridgeMat = new THREE.MeshStandardMaterial({color: 0xD2691E});
        const ringDefs = [
            {y: 0.1, r: 0.11},
            {y: -0.05, r: 0.07},
            {y: -0.2, r: 0.03}
        ];
        ringDefs.forEach(def => {
            const ridgeGeo = new THREE.TorusGeometry(def.r, 0.015, 4, 6);
            const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
            ridge.position.y = def.y;
            ridge.rotation.x = Math.PI / 2;
            body.add(ridge);
        });
        
        // Leaves: Separated cones angling expansively outward securely
        const leafMat = new THREE.MeshStandardMaterial({color: 0x228B22});
        for (let i = 0; i < 3; i++) {
            const leafGeo = new THREE.ConeGeometry(0.04, 0.25, 4);
            // Re-anchor origins mapping rotation bounds from bottom
            leafGeo.translate(0, 0.125, 0);
            
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = 0.25; // Map strictly to the cylinder top bound
            
            // Calculate bush angles securely mapping array variants
            leaf.rotation.y = (i * 120) * (Math.PI / 180);
            leaf.rotation.z = Math.PI / 6; // Flare outward dynamically
            
            body.add(leaf);
        }
        
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    update(delta) {
        // Continuous spin on Y axis inside game loop with sine bouncing
        this.mesh.rotation.y += delta * 3;
        this.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    remove() {
        this.parentMesh.remove(this.mesh);
    }
}
