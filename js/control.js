import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import * as THREE from 'three';

export function createControls(camera, dom) { 
    const controls = new TrackballControls(camera, dom);
    
    controls.target.set(0, 0, 0); 
    controls.rotateSpeed = 3;
    controls.zoomSpeed = 0; 
    controls.panSpeed = 0.8;


    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,    
        MIDDLE: THREE.MOUSE.DOLLY,   
        RIGHT: THREE.MOUSE.PAN       
    };

    console.log("controls created");

    return controls;
}
