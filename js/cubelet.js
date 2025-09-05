/*
                  Back
                   5
              -----------
            /    Up     /|
           /     1     / |
           -----------  Right
          |           |  2
    Left  |   Front   |  .
     4    |     0     | /
          |           |/
           -----------
               Down
                3

	
	The faces[] Array is mapped to names for convenience:

	  this.faces[ 0 ] === this.front
	  this.faces[ 1 ] === this.up
	  this.faces[ 2 ] === this.right
	  this.faces[ 3 ] === this.down
	  this.faces[ 4 ] === this.left
	  this.faces[ 5 ] === this.back
*/




import * as THREE from 'three';
import { COLORLESS } from './color.js';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'; 


function createRoundedRectGeometry(width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x, y + radius); 
    shape.lineTo(x, y + height - radius); 
    shape.quadraticCurveTo(x, y + height, x + radius, y + height); 
    shape.lineTo(x + width - radius, y + height); 
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius); 
    shape.lineTo(x + width, y + radius); 
    shape.quadraticCurveTo(x + width, y, x + width - radius, y); 
    shape.lineTo(x + radius, y); 
    shape.quadraticCurveTo(x, y, x, y + radius); 


    return new THREE.ShapeGeometry(shape);
}


export class Cubelet {
    constructor(cube, id, colormap, renderer) {
        this.cube = cube;
        this.id = id;

        this.setAddress(id);

        this.size = cube.cubeletSize || 6;

        this.radius = this.size; 

        this.X = (this.addX - 1) * this.size;
        this.Y = (this.addY - 1) * this.size;
        this.Z = (this.addZ - 1) * this.size;

        this.anchor = new THREE.Object3D();
        if(this.cube) this.cube.threeObject.add(this.anchor);
        else this.renderer.addMesh(this.anchor); 

        const borderGeometry = new THREE.BoxGeometry(this.size, this.size, this.size);

        const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x080808 }); // 深色作为边框

        this.mesh = new THREE.Mesh(borderGeometry, borderMaterial);
        this.mesh.position.set(this.X, this.Y, this.Z);
        
        this.anchor.add(this.mesh);

        const stickerWidth = this.size * 0.9; 
        const stickerHeight = this.size * 0.9; 
        const stickerRadius = this.size * 0.15;
        const stickerDepth = 0.3;       


        const fixedFaceDefinitions = [
            { id: 4, pos: new THREE.Vector3(0, 0, this.size / 2), rot: new THREE.Euler(0, 0, 0) },            // Front (colormap[0]) -> BoxGeometry index 4
            { id: 2, pos: new THREE.Vector3(0, this.size / 2, 0), rot: new THREE.Euler(-Math.PI / 2, 0, 0) }, // Up (colormap[1]) -> BoxGeometry index 2
            { id: 0, pos: new THREE.Vector3(this.size / 2, 0, 0), rot: new THREE.Euler(0, Math.PI / 2, 0) },   // Right (colormap[2]) -> BoxGeometry index 0
            { id: 3, pos: new THREE.Vector3(0, -this.size / 2, 0), rot: new THREE.Euler(Math.PI / 2, 0, 0) },  // Down (colormap[3]) -> BoxGeometry index 3
            { id: 1, pos: new THREE.Vector3(-this.size / 2, 0, 0), rot: new THREE.Euler(0, -Math.PI / 2, 0) },  // Left (colormap[4]) -> BoxGeometry index 1
            { id: 5, pos: new THREE.Vector3(0, 0, -this.size / 2), rot: new THREE.Euler(0, Math.PI, 0) }      // Back (colormap[5]) -> BoxGeometry index 5
        ];

        this.faces = []; 

        for (let i = 0; i < 6; i++) { 
            const col = colormap[i] || COLORLESS;
            this.faces[i] = { mesh: null, color: col }; 
            if (col === COLORLESS) {
                 continue;
            }


            const faceDef = fixedFaceDefinitions.find(def => def.id === i);
            if (!faceDef) continue; 


            const stickerGeometry = createRoundedRectGeometry(stickerWidth, stickerHeight, stickerRadius);
            const stickerMaterial = new THREE.MeshBasicMaterial({ color: col.hex, side: THREE.DoubleSide });

            const stickerMesh = new THREE.Mesh(stickerGeometry, stickerMaterial);


            const adjustedPos = faceDef.pos.clone().normalize().multiplyScalar(this.size / 2 + stickerDepth);
            stickerMesh.position.copy(adjustedPos);
            stickerMesh.rotation.copy(faceDef.rot);
            this.faces[i].mesh = stickerMesh; 

            this.mesh.add(stickerMesh); 
        }


        this.map(); 

        this.mesh.rotation.set(0, 0, 0); 

        this.x = 0; 
        this.y = 0; 
        this.z = 0; 
        
        this.previousX = 0; 
        this.previousY = 0; 
        this.previousZ = 0;

        this.isTwisting = false; 
    }

    map() { 
        this.front    =    this.faces[5]; 
        this.up       =    this.faces[3]; 
        this.right    =    this.faces[0]; 
        this.down     =    this.faces[2]; 
        this.left     =    this.faces[1]; 
        this.back     =    this.faces[4]; 
    }

    setAddress(address) {
        this.addX = (address % 3);     
        this.addY = (((address % 9) / 3) | 0);
        this.addZ = ((address / 9) | 0);
    }

    setRadius(radius, time, easeType) { 

        this.X = (this.addX - 1) * radius;
        this.Y = (this.addY - 1) * radius;
        this.Z = (this.addZ - 1) * radius;
        this.radius = radius; 

        // this.mesh.position.set(this.X, this.Y, this.Z);
        let easing = null; 
        if(easeType === "In") { 
            easing = TWEEN.Easing.Quadratic.In; 
        } else if(easeType === "Out") { 
            easing = TWEEN.Easing.Quadratic.Out; 
        } else { 
            easing = TWEEN.Easing.Quadratic.InOut; 
        }

        new TWEEN.Tween( this.mesh.position )
        .to({
            x: this.X,
            y: this.Y,
            z: this.Z
        }, time)
        .easing(easing)
        .start()
        .onComplete(() => {

        }); 
    }


    clearColor() { 
        const duration = 200; 
        const color = COLORLESS.r / 0xff; 

        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child !== this.mesh) {
                new TWEEN.Tween(child.material.color)
                        .to({r: color, g: color, b: color} , duration)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start()
                        .onComplete(() => {
                        });
            }
        });

        for(let i = 0;i < 6;i++) { 
            this.faces[i].color = COLORLESS; 
        }

        this.map();

    }

    fillColor(colors) { 
        const duration = 100; 

        for(let i = 0;i < 6;i ++) { 
            if(colors[i] !== COLORLESS) { 
                this.faces[i].color = colors[i];
                if(this.faces[i].mesh === null)  { 
                    console.log("error colorless"); 
                    continue; 
                }
                this.faces[i].mesh.material.color.set(colors[i].hex);
            }   
        }

        this.map(); 
    }

    immediateRotate(axis, degree) { 
        this.anchor.rotation.set(axis.x * degree, axis.y * degree, axis.z * degree);
    }

    rotate(rotation, degree, duration, callback) { 
        let targetX = 0, targetY = 0, targetZ = 0; 
        const delta = 0.01; 

        this.cube.isTwisting = true; 

        if(rotation == 'X') targetX = degree, this.cube.isEngagedX = true; 
        else if(rotation == 'x') targetX = -degree, this.cube.isEngagedX = true; 
        else if(rotation == 'Y') targetY = degree, this.cube.isEngagedY = true; 
        else if(rotation == 'y') targetY = -degree, this.cube.isEngagedY = true;  
        else if(rotation == 'Z') targetZ = degree, this.cube.isEngagedZ = true; 
        else if(rotation == 'z') targetZ = -degree, this.cube.isEngagedZ = true; 

        const tweenDurationScaled = Math.max((Math.abs(degree) / 90) * duration, 50); 

        this.previousX = this.x;
        this.previousY = this.y;
        this.previousZ = this.z;

        this.x += targetX;
        this.y += targetY;
        this.z += targetZ;

        // this.x %= 360; 
        // this.y %= 360; 
        // this.z %= 360; 

        new TWEEN.Tween( this.anchor.rotation )
        .to({
            x: -targetX * (Math.PI / 180),
            y: -targetY * (Math.PI / 180),
            z: -targetZ * (Math.PI / 180)
        }, tweenDurationScaled)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
        .onComplete(() => {

            this.cube.renderer.render();     

            this.mesh.applyMatrix4(this.anchor.matrix);

            this.anchor.rotation.set(0, 0, 0); 

            let XmapTimes = Math.abs( Math.floor(this.x / 90) -
                                        Math.floor(this.previousX / 90) );
            let YmapTimes = Math.abs( Math.floor(this.y / 90) -
                                        Math.floor(this.previousY / 90) );
            let ZmapTimes = Math.abs( Math.floor(this.z / 90) -
                                        Math.floor(this.previousZ / 90) );

            if(XmapTimes) { 
                while(XmapTimes --) {

                    if( targetX < 0 ) this.faces = [ 
                        this.right,
                        this.left,
                        this.front,
                        this.back,   
                        this.down,
                        this.up
                    ]; 
					else this.faces = [ 
                        this.right,
                        this.left,
                        this.back,
                        this.front,
                        this.up,
                        this.down,
                    ]; 
                    this.map(); 
                    if(callback) { 
                        callback(this.cube.cubelets.slice()); 
                        this.cube.map();
                    }
                }
                 
            }
            if(Math.abs(this.x % 90) < delta) { 
                this.x = Math.round(this.x / 90) * 90;  
                this.previousX = this.x;
                this.cube.isEngagedX = false; 
            }


            if(YmapTimes) { 
                while(YmapTimes --) {
                    if( targetY > 0 ) this.faces = [ 
                        this.front,
                        this.back,
                        this.down,
                        this.up,
                        this.right,
                        this.left
                    ]; 
                    else this.faces = [ 
                        this.back,
                        this.front,
                        this.down,
                        this.up,
                        this.left,
                        this.right
                    ]; 
                    this.map(); 
                    if(callback) {  
                        callback(this.cube.cubelets.slice()); 
                        this.cube.map();
                    }
                }

                 
            }
            if(Math.abs(this.y % 90) < delta) { 
                this.y = Math.round(this.y / 90) * 90; 
                this.previousY = this.y;
                this.cube.isEngagedY = false;  
            }


            if(ZmapTimes) { 
                while(ZmapTimes --) {

                    if( targetZ > 0 ) this.faces = [ 
                        this.down, 
                        this.up,
                        this.left,
                        this.right,
                        this.back,
                        this.front
                    ]; 
					else this.faces = [ 
                        this.up, 
                        this.down,
                        this.right,
                        this.left,
                        this.back,
                        this.front
                    ]; 
                    this.map(); 
                    if(callback) { 
                        callback(this.cube.cubelets.slice()); 
                        this.cube.map(); 
                    }
                }
                
            }
            if(Math.abs(this.z % 90) < delta) { 
                this.z = Math.round(this.z / 90) * 90; 
                this.previousZ = this.z; 
                this.cube.isEngagedZ = false; 
            } 
            
            if(callback) this.cube.isTwisting = false, this.cube.isDragging = false; 
        }); 
    }


}