import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'; 
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

export class Renderer { 
    constructor(args) {
        this.scene = new THREE.Scene();
        this.camera = null;

        const canvas = document.getElementById('cube');
        if (!canvas) {
            console.error("Canvas element with ID 'cube' not found!");
            return;
        }

        this.canvas = canvas;


        if(args === "Perspective"){ 
            this.camera = new THREE.PerspectiveCamera( 25, canvas.clientWidth / canvas.clientHeight, 0.1, 1000 );
            console.log("Using PerspectiveCamera");
        } else {
            const viewSize = 50; 
            const aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera = new THREE.OrthographicCamera( -viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 500 );
            console.log("Using OrthographicCamera");
        }

        
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.axesHelper = this.createAxes(); 
        
        console.log("Renderer created and initialized."); 
    }

    init() { 
        this.repositionCamera();
        
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );

        this.renderer.setClearColor(0x282828, 1); 

        this.addLighting();

        window.addEventListener( 'resize', () => this.onWindowResize(), false ); 
    }

    addLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 柔和的白光，强度0.5
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // 强度0.8
        directionalLight.position.set(100, 150, 100);

        this.scene.add(directionalLight);

    }

    createAxes() { 
        let axesHelper = []; 
        const origin = new THREE.Vector3(-40, -40, -40);

        const dirX = new THREE.Vector3(1, 0, 0); 
        const dirY = new THREE.Vector3(0, 1, 0); 
        const dirZ = new THREE.Vector3(0, 0, 1); 

        const lenght = 20; // 轴线长度
        const hex = [0xff0000, 0x00ff00, 0x0000ff]; // R, G, B

        axesHelper.push(new THREE.ArrowHelper(dirX, origin, lenght, hex[0]));
        axesHelper.push(new THREE.ArrowHelper(dirY, origin, lenght, hex[1]));
        axesHelper.push(new THREE.ArrowHelper(dirZ, origin, lenght, hex[2]));

        axesHelper.forEach(ax => {
            this.scene.add(ax);
        }); 

        return axesHelper; 
    }

    onWindowResize() { 
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // 更新相机宽高比或视锥体
        if (this.camera.isPerspectiveCamera) {
            this.camera.aspect = width / height;
        } else if (this.camera.isOrthographicCamera) {
            const viewSize = 50; 
            const aspect = width / height;
            this.camera.left = -viewSize * aspect;
            this.camera.right = viewSize * aspect;
            this.camera.top = viewSize;
            this.camera.bottom = -viewSize;
        }
        
        this.camera.updateProjectionMatrix(); 

        this.renderer.setSize(width, height); 
        this.renderer.setPixelRatio( window.devicePixelRatio ); 
        this.render();
    }

    repositionCamera(isAnimate = false, Mcontrols) { 
        if(isAnimate === false){
            this.camera.position.set(250, -250, -250); 
            this.camera.lookAt(0, 0, 0); 
            this.camera.up.set(-0.5, -0.5, 0.5); 
        }
        else { 
            Mcontrols.enabled = false;
            new TWEEN.Tween(this.camera.position)
            .to({ x: 250, y: -250, z: -250 }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

            new TWEEN.Tween(this.camera.up) 
            .to({ x: -0.5, y: -0.5, z: 0.5 }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
            .onComplete(() => {
                Mcontrols.enabled = true;
            }); 

        }
    }

    addMesh(mesh) { 
        this.scene.add(mesh);
    }

    render() { 
        this.renderer.render( this.scene, this.camera );
    }

    setLoop(loop) { 
        this.renderer.setAnimationLoop(loop);
    }

    moveCameraZ(z) { 
        this.camera.position.z = z;
        this.camera.updateProjectionMatrix(); 
        this.render();
    }

    moveCameraX(x) { 
        this.camera.position.x = x;
        this.camera.updateProjectionMatrix();
        this.render();
    }

    moveCameraY(y) { 
        this.camera.position.y = y;
        this.camera.updateProjectionMatrix();
        this.render();
    }
}