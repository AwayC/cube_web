import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import * as THREE from 'three';

export function createTrackBallControls(camera, dom) { 
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


const twistKeyMap = [
    // middle layer
    "S", "s", 
    "M", "m", 
    "E", "e", 
    
    // faces
    "D", "d", 
    "U", "u", 
    "L", "l",
    "R", 'r', 
    "B", "b", 
    "F", "f",

    // whole cube
    "Z", "z",
    "X", "x", 
    "Y", "y", 
]

export class KeyController { 
    constructor(renderer, commander, Mcontrols) {
        this.renderer = renderer;
        this.Mcontrols = Mcontrols;
        this.twistKeyMap = twistKeyMap;
        this.commander = commander;
    }

    setup() { 
        document.addEventListener('keydown', (event) => {
            if(this.twistKeyMap.includes(event.key)) {
                console.log("twist" + event.key);
                this.commander.sendCommand(event.key + '\n', 'key');
            } else if(event.key === "q" || event.key == "p") { 
                this.commander.sendCommand(event.key + '\n', 'key');
            } else if(event.key === ' ') { 
                this.renderer.repositionCamera(true, this.Mcontrols);
            }

        }); 
    }
}