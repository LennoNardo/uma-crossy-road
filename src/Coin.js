import * as THREE from 'three';

export class Coin {
    constructor(parentMesh, x, z) {
        this.parentMesh = parentMesh;
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0.5, 0); // Local positioning bounded to Lane hierarchy
        this.parentMesh.add(this.mesh);
        
        // Geometry bindings
        const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const mat = new THREE.MeshLambertMaterial({color: 0xffd700});
        const coin = new THREE.Mesh(geo, mat);
        
        coin.rotation.x = Math.PI / 2;
        coin.castShadow = true;
        this.mesh.add(coin);
        
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    update(delta) {
        // Fast spin indicator
        this.mesh.rotation.y += delta * 3;
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        // Bounded global mapping
        this.boundingBox.setFromObject(this.mesh);
    }

    remove() {
        // Collectible dump trigger
        this.parentMesh.remove(this.mesh);
    }
}
