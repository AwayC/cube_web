import { Renderer } from './render.js';
import * as THREE from 'three';
import { Cube } from './cube.js';
import { ControlPanel, createTrackBallControls } from './control.js';
import { KeyController } from './control.js';
import { SerialPanel } from './control.js'; 
import { SerialMannager } from './WebSerial/serial.js';
import { Commander } from './commander.js';
import { CubeController } from './cubeController.js';
import { TimePanel } from './timePanel.js'; 


let renderer = new Renderer("Perspective");
let mouseControls;

renderer.init();
renderer.setLoop(animate);

const cube = new Cube(renderer);
const commander = new Commander();

const timer = new TimePanel("timePanel");
const btns = new ControlPanel(commander);


const cubeCtl = new CubeController({
    cube, 
    timer,
    btns,
    renderer,
});

commander.addReciever(cubeCtl); 


const cameraCoordinatesElement = document.getElementById('camera-coordinates');
const cameraUpElement = document.getElementById('camera-up');


mouseControls = createTrackBallControls(renderer.camera, renderer.renderer.domElement);


renderer.addMouseCtl(mouseControls);
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
 



const keyController = new KeyController(renderer, commander, mouseControls);
// keyController.setup();


renderer.render(); 

const serial = new SerialMannager(commander);
serial.init(); 
const sPanel = new SerialPanel();

cubeCtl.addSerial(serial); 
cubeCtl.addKeys(keyController); 


cube.printMap(); 
// cube.clearColor();
/*
    {
        0: right,
        1: left,
        2: down,
        3: up,
        4: back, 
        5: front
    }
*/
const colMap = [
    "*B*R*W","***R*W","G**R*W",
    "*B***W","*****W","G****W",
    "*BO**W","**O**W","G*O**W",

    "*B*R**","***R**","G**R**",
    "*B****","******","G*****",
    "*BO***","**O***","G*O***",

    "*B*RY*","***RY*","G**RY*",
    "*B**Y*","****Y*","G***Y*",
    "*BO*Y*","**O*Y*","G*O*Y*",
]; 


cubeCtl.initAnim(); 

function animate() {
    mouseControls.update();

    cube.update();
    const cameraPosition = renderer.camera.position;
    cameraCoordinatesElement.textContent = `Camera Position: X: ${cameraPosition.x.toFixed(2)}, Y: ${cameraPosition.y.toFixed(2)}, Z: ${cameraPosition.z.toFixed(2)}`;

    const cameraUp = renderer.camera.up;
    cameraUpElement.textContent = `Camera Up: X: ${cameraUp.x.toFixed(2)}, Y: ${cameraUp.y.toFixed(2)}, Z: ${cameraUp.z.toFixed(2)}`;


    renderer.render();
}