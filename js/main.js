import { Renderer } from './render.js';
import * as THREE from 'three';
import { Cube } from './cube.js';
import { createTrackBallControls } from './control.js';
import {KeyController} from './control.js';
import { SerialMannager } from './WebSerial/serial.js';
import { Commander } from './commander.js';
import { CubeController } from './cubeController.js';


let renderer = new Renderer("Perspective");
let mouseControls;

renderer.init();
renderer.setLoop(animate);

const cube = new Cube(renderer);

const cubeCtl = new CubeController(cube);


const cameraCoordinatesElement = document.getElementById('camera-coordinates');
const cameraUpElement = document.getElementById('camera-up');


mouseControls = createTrackBallControls(renderer.camera, renderer.renderer.domElement);

const tasks = [
    "S", "s", 
    "M", "m", 
    "E", "e", 
    "D", "d", 
    "U", "u", 
    "L", "l",
    "R", 'r', 
    "B", "b", 
    "F", "f",
    "Z", "z",
    "X", "x", 
    "Y", "y", 
]; 

// tasks.forEach((task) => {
//     cube.twistQue.push({ command: task , degree: 90}); 
// })

// console.log(cube.twistQue.size()); 
// cube.twistQue.printTask(); 
 

const commander = new Commander();
commander.addReciever(cubeCtl);

const keyController = new KeyController(renderer, commander, mouseControls);
keyController.setup();

renderer.render(); 

const serial = new SerialMannager(commander);
serial.init(); 

cube.printMap(); 
// cube.clearColor(); 


function animate() {
    mouseControls.update();

    cube.update();
    const cameraPosition = renderer.camera.position;
    cameraCoordinatesElement.textContent = `Camera Position: X: ${cameraPosition.x.toFixed(2)}, Y: ${cameraPosition.y.toFixed(2)}, Z: ${cameraPosition.z.toFixed(2)}`;

    const cameraUp = renderer.camera.up;
    cameraUpElement.textContent = `Camera Up: X: ${cameraUp.x.toFixed(2)}, Y: ${cameraUp.y.toFixed(2)}, Z: ${cameraUp.z.toFixed(2)}`;


    renderer.render();
}