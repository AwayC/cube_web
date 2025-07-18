/*

             ----------------------- 
           /   18      19      20  /|
          /                       / |
         /   9      10       11  / 20
        /                       /   |
       /   0       1       2   / 11 |
       -----------------------     23
      |                       |2    |
      |   0       1       2   |  14 |
      |                       |    26
      |                       |5    |
      |   3       4       5   |  17 /
      |                       |    /
      |                       |8  /
      |   6       7       8   |  /
      |                       | /
       ----------------------- 

*/

import * as THREE from 'three'; 
import {Cubelet} from './cubelet.js';
import {W, O, B, G, R, Y} from './color.js';
import {Group} from './group.js';
import { TaskQue } from './taskQue.js';
import { call } from 'three/tsl';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

export class Cube { 

    constructor(renderer) { 
        console.log("start cube constructor");
        this.cubeletSize = 20; 
        this.size = this.cubeletSize * 3;
        this.renderer = renderer;  
        
        this.threeObject = new THREE.Object3D(); 
        renderer.addMesh(this.threeObject); 

        this.cubelets = []; 

        let colorMap = [
            [  , B,  , R,  , W],    [  ,  ,  , R,  , W],    [ G,  ,  , R,  , W],//   0,  1,  2
            [  , B,  ,  ,  , W],    [  ,  ,  ,  ,  , W],    [ G,  ,  ,  ,  , W],//   3,  4,  5
            [  , B, O,  ,  , W],    [  ,  , O,  ,  , W],    [ G,  , O,  ,  , W],//   6,  7,  8


            //  Standing slice

            [  , B,  , R,  ,  ],    [  ,  ,  , R,  ,  ],    [ G,  ,  , R,  ,  ],//   9, 10, 11
            [  , B,  ,  ,  ,  ],    [  ,  ,  ,  ,  ,  ],    [ G,  ,  ,  ,  ,  ],//  12, XX, 14
            [  , B, O,  ,  ,  ],    [  ,  , O,  ,  ,  ],    [ G,  , O,  ,  ,  ],//  15, 16, 17


            //  Back slice

            [  , B,  , R, Y,  ],    [  ,  ,  , R, Y,  ],    [ G,  ,  , R, Y,  ],//  18, 19, 20
            [  , B,  ,  , Y,  ],    [  ,  ,  ,  , Y,  ],    [ G,  ,  ,  , Y,  ],//  21, 22, 23
            [  , B, O,  , Y,  ],    [  ,  , O,  , Y,  ],    [ G,  , O,  , Y,  ] //  24, 25, 26
        ]; 

        colorMap.forEach( (colormap, id) => { 
            this.cubelets.push(new Cubelet(this, id, colormap, this.renderer));
        }); 


        this.map(); 

        this.faces = [this.front, this.back, this.right, this.left, this.up, this.down]; 

        this.isTwisting = false; 
        this.isEngagedX = false; 
        this.isEngagedY = false; 
        this.isEngagedZ = false; 

        this.twistQue = new TaskQue(this.twist.bind(this)); 

        console.log("created cubelets"); 
    }

    map() { 
        this.front = new Group('front', this.cubelets); 
        this.standing = new Group('standing', this.cubelets); 
        this.back = new Group('back', this.cubelets); 
        this.left = new Group('left', this.cubelets); 
        this.middle = new Group('middle', this.cubelets); 
        this.right = new Group('right', this.cubelets); 
        this.up = new Group('up', this.cubelets); 
        this.equator = new Group('equator', this.cubelets); 
        this.down = new Group('down', this.cubelets);
    }

    update() { 
        // console.log(this.twistQue.length); 
        if(! this.isTwisting && this.twistQue.size()) { 
            this.twistQue.doTask();
        }
        TWEEN.update(); 
    }

    twist(task, rev) { 
        console.log(this); 
        let command = task.command;
        let degree = task.degree; 
        if(this.isTwisting) return; 
        this.isTwisting = true; 
        if(rev === false) { 
            if(command === command.toUpperCase()) {
                command = command.toLowerCase();
            }
            else {
                command = command.toUpperCase();
            }
        }

        if(command == 'X' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets = [
                    origin[  6 ], origin[  7 ], origin[  8 ],
                    origin[ 15 ], origin[ 16 ], origin[ 17 ],
                    origin[ 24 ], origin[ 25 ], origin[ 26 ],

                    origin[  3 ], origin[  4 ], origin[  5 ],
                    origin[ 12 ], origin[ 13 ], origin[ 14 ],
                    origin[ 21 ], origin[ 22 ], origin[ 23 ],

                    origin[  0 ], origin[  1 ], origin[  2 ],
                    origin[  9 ], origin[ 10 ], origin[ 11 ],
                    origin[ 18 ], origin[ 19 ], origin[ 20 ]
                ]; 

                this.isTwisting = false; 
            }; 
            this.cubelets.forEach((cubelet, i) => {
                if(i === this.cubelets.length - 1) cubelet.rotate('X', degree, callback);
                else cubelet.rotate('X', degree, null);
            }); 

        }
        else if(command == 'x' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets = [
                    origin[ 18 ], origin[ 19 ], origin[ 20 ],
                    origin[  9 ], origin[ 10 ], origin[ 11 ],
                    origin[  0 ], origin[  1 ], origin[  2 ],
    
                    origin[ 21 ], origin[ 22 ], origin[ 23 ],
                    origin[ 12 ], origin[ 13 ], origin[ 14 ],
                    origin[  3 ], origin[  4 ], origin[  5 ],
    
                    origin[ 24 ], origin[ 25 ], origin[ 26 ],
                    origin[ 15 ], origin[ 16 ], origin[ 17 ],
                    origin[  6 ], origin[  7 ], origin[  8 ]
                ]; 

                this.isTwisting = false; 
            }
            this.cubelets.forEach((cubelet, i) => {
                if(i === this.cubelets.length - 1) cubelet.rotate('x', degree, callback);
                else cubelet.rotate('x', degree, null);
            }); 

        }
        else if(command == 'Y' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets = [
                    origin[  2 ], origin[ 11 ], origin[ 20 ],
                    origin[  5 ], origin[ 14 ], origin[ 23 ],
                    origin[  8 ], origin[ 17 ], origin[ 26 ],

                    origin[  1 ], origin[ 10 ], origin[ 19 ],
                    origin[  4 ], origin[ 13 ], origin[ 22 ],
                    origin[  7 ], origin[ 16 ], origin[ 25 ],

                    origin[  0 ], origin[  9 ], origin[ 18 ],
                    origin[  3 ], origin[ 12 ], origin[ 21 ],
                    origin[  6 ], origin[ 15 ], origin[ 24 ]
                ]; 

                this.isTwisting = false; 
            }
            this.cubelets.forEach((cubelet, i) => {
                if(i === this.cubelets.length - 1) cubelet.rotate('Y', degree, callback);
                else cubelet.rotate('Y', degree, null);
            }); 

        }
        else if(command == 'y' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets = [
                    origin[ 18 ], origin[  9 ], origin[  0 ],
                    origin[ 21 ], origin[ 12 ], origin[  3 ],
                    origin[ 24 ], origin[ 15 ], origin[  6 ],

                    origin[ 19 ], origin[ 10 ], origin[  1 ],
                    origin[ 22 ], origin[ 13 ], origin[  4 ],
                    origin[ 25 ], origin[ 16 ], origin[  7 ],

                    origin[ 20 ], origin[ 11 ], origin[  2 ],
                    origin[ 23 ], origin[ 14 ], origin[  5 ],
                    origin[ 26 ], origin[ 17 ], origin[  8 ]
                ]; 

                this.isTwisting = false; 
            }
            this.cubelets.forEach((cubelet, i) => {
                if(i === this.cubelets.length - 1) cubelet.rotate('y', degree, callback);
                else cubelet.rotate('y', degree, null);
            }); 

        }
        else if(command == 'Z' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets = [
                    origin[  6 ], origin[  3 ], origin[  0 ],
                    origin[  7 ], origin[  4 ], origin[  1 ],
                    origin[  8 ], origin[  5 ], origin[  2 ],

                    origin[ 15 ], origin[ 12 ], origin[  9 ],
                    origin[ 16 ], origin[ 13 ], origin[ 10 ],
                    origin[ 17 ], origin[ 14 ], origin[ 11 ],

                    origin[ 24 ], origin[ 21 ], origin[ 18 ],
                    origin[ 25 ], origin[ 22 ], origin[ 19 ],
                    origin[ 26 ], origin[ 23 ], origin[ 20 ]
                ]; 

                this.isTwisting = false; 
            }
            this.cubelets.forEach((cubelet, i) => {
                if(i === this.cubelets.length - 1) cubelet.rotate('Z', degree, callback);
                else cubelet.rotate('Z', degree, null);
            }); 

        }
        else if(command == 'z' && ! this.isEngagedY && ! this.isEngagedX) { 
            const callback = (origin) => { 
                this.cubelets = [
                    origin[  2 ], origin[  5 ], origin[  8 ],
                    origin[  1 ], origin[  4 ], origin[  7 ],
                    origin[  0 ], origin[  3 ], origin[  6 ],

                    origin[ 11 ], origin[ 14 ], origin[ 17 ],
                    origin[ 10 ], origin[ 13 ], origin[ 16 ],
                    origin[  9 ], origin[ 12 ], origin[ 15 ],

                    origin[ 20 ], origin[ 23 ], origin[ 26 ],
                    origin[ 19 ], origin[ 22 ], origin[ 25 ],
                    origin[ 18 ], origin[ 21 ], origin[ 24 ]
                ]; 

                this.isTwisting = false; 
            }
            this.cubelets.forEach((cubelet, i) => {
                if(i === this.cubelets.length - 1) cubelet.rotate('z', degree, callback);
                else cubelet.rotate('z', degree, null);
            }); 

        }
        else if(command == 'F' && ! this.isEngagedY && ! this.isEngagedX) { 
            const callback = (origin) => { 
                this.cubelets[  0 ] = origin[  6 ]; 
                this.cubelets[  1 ] = origin[  3 ]; 
                this.cubelets[  2 ] = origin[  0 ]; 

                this.cubelets[  3 ] = origin[  7 ];  
                this.cubelets[  5 ] = origin[  1 ]; 

                this.cubelets[  6 ] = origin[  8 ]; 
                this.cubelets[  7 ] = origin[  5 ]; 
                this.cubelets[  8 ] = origin[  2 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.front.cubelets.forEach((cubelet, i) => {
                if(i === this.front.cubelets.length - 1) cubelet.rotate('Z', degree, callback);
                else cubelet.rotate('Z', degree, null);
            }); 

        }
        else if(command == 'f' && ! this.isEngagedX && ! this.isEngagedY) { 
            const callback = (origin) => { 
                this.cubelets[  0 ] = origin[  2 ]; 
                this.cubelets[  1 ] = origin[  5 ]; 
                this.cubelets[  2 ] = origin[  8 ]; 
                
                this.cubelets[  3 ] = origin[  1 ]; 
                this.cubelets[  5 ] = origin[  7 ]; 

                this.cubelets[  6 ] = origin[  0 ]; 
                this.cubelets[  7 ] = origin[  3 ]; 
                this.cubelets[  8 ] = origin[  6 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.front.cubelets.forEach((cubelet, i) => {
                if(i === this.front.cubelets.length - 1) cubelet.rotate('z', degree, callback);
                else cubelet.rotate('z', degree, null);
            }); 

        }
        else if(command == 'B' && ! this.isEngagedY && ! this.isEngagedX) { 
            const callback = (origin) => { 
                this.cubelets[ 18 ] = origin[ 20 ]; 
                this.cubelets[ 19 ] = origin[ 23 ]; 
                this.cubelets[ 20 ] = origin[ 26 ]; 
                
                this.cubelets[ 21 ] = origin[ 19 ]; 
                this.cubelets[ 23 ] = origin[ 25 ]; 

                this.cubelets[ 24 ] = origin[ 18 ]; 
                this.cubelets[ 25 ] = origin[ 21 ]; 
                this.cubelets[ 26 ] = origin[ 24 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.back.cubelets.forEach((cubelet, i) => {
                if(i === this.back.cubelets.length - 1) cubelet.rotate('z', degree, callback);
                else cubelet.rotate('z', degree, null);
            }); 

        }
        else if(command == 'b' && ! this.isEngagedY && ! this.isEngagedX) { 
            const callback = (origin) => { 
                this.cubelets[ 18 ] = origin[ 24 ]; 
                this.cubelets[ 19 ] = origin[ 21 ]; 
                this.cubelets[ 20 ] = origin[ 18 ]; 
                
                this.cubelets[ 21 ] = origin[ 25 ]; 
                this.cubelets[ 23 ] = origin[ 19 ]; 

                this.cubelets[ 24 ] = origin[ 26 ]; 
                this.cubelets[ 25 ] = origin[ 23 ]; 
                this.cubelets[ 26 ] = origin[ 20 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.back.cubelets.forEach((cubelet, i) => {
                if(i === this.back.cubelets.length - 1) cubelet.rotate('Z', degree, callback);
                else cubelet.rotate('Z', degree, null);
            }); 

        }
        else if(command == 'R' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  2 ] = origin[  8 ]; 
                this.cubelets[ 11 ] = origin[  5 ]; 
                this.cubelets[ 20 ] = origin[  2 ]; 
                
                this.cubelets[  5 ] = origin[ 17 ]; 
                this.cubelets[ 23 ] = origin[ 11 ]; 

                this.cubelets[  8 ] = origin[ 26 ]; 
                this.cubelets[ 17 ] = origin[ 23 ]; 
                this.cubelets[ 26 ] = origin[ 20 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.right.cubelets.forEach((cubelet, i) => {
                if(i === this.right.cubelets.length - 1) cubelet.rotate('X', degree, callback);
                else cubelet.rotate('X', degree, null);
            }); 

        }
        else if(command == 'r' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  2 ] = origin[ 20 ]; 
                this.cubelets[ 11 ] = origin[ 23 ]; 
                this.cubelets[ 20 ] = origin[ 26 ]; 
                
                this.cubelets[  5 ] = origin[ 11 ]; 
                this.cubelets[ 23 ] = origin[ 17 ]; 

                this.cubelets[  8 ] = origin[  2 ]; 
                this.cubelets[ 17 ] = origin[  5 ]; 
                this.cubelets[ 26 ] = origin[  8 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.right.cubelets.forEach((cubelet, i) => {
                if(i === this.right.cubelets.length - 1) cubelet.rotate('x', degree, callback);
                else cubelet.rotate('x', degree, null);
            }); 

        }
        else if(command == 'L' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  0 ] = origin[ 18 ]; 
                this.cubelets[  9 ] = origin[ 21 ]; 
                this.cubelets[ 18 ] = origin[ 24 ]; 
                
                this.cubelets[  3 ] = origin[  9 ]; 
                this.cubelets[ 21 ] = origin[ 15 ]; 

                this.cubelets[  6 ] = origin[  0 ]; 
                this.cubelets[ 15 ] = origin[  3 ]; 
                this.cubelets[ 24 ] = origin[  6 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.left.cubelets.forEach((cubelet, i) => {
                if(i === this.left.cubelets.length - 1) cubelet.rotate('X', degree, callback);
                else cubelet.rotate('X', degree, null);
            }); 

        }
        else if(command == 'l' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  0 ] = origin[  6 ]; 
                this.cubelets[  9 ] = origin[  3 ]; 
                this.cubelets[ 18 ] = origin[  0 ]; 
                
                this.cubelets[  3 ] = origin[ 15 ]; 
                this.cubelets[ 21 ] = origin[  9 ]; 

                this.cubelets[  6 ] = origin[ 24 ]; 
                this.cubelets[ 15 ] = origin[ 21 ]; 
                this.cubelets[ 24 ] = origin[ 18 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.left.cubelets.forEach((cubelet, i) => {
                if(i === this.left.cubelets.length - 1) cubelet.rotate('x', degree, callback);
                else cubelet.rotate('x', degree, null);
            }); 

        }
        else if(command == 'U' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[ 18 ] = origin[  0 ]; 
                this.cubelets[ 19 ] = origin[  9 ]; 
                this.cubelets[ 20 ] = origin[ 18 ]; 
                
                this.cubelets[  9 ] = origin[  1 ]; 
                this.cubelets[ 11 ] = origin[ 19 ]; 

                this.cubelets[  0 ] = origin[  2 ]; 
                this.cubelets[  1 ] = origin[ 11 ]; 
                this.cubelets[  2 ] = origin[ 20 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.up.cubelets.forEach((cubelet, i) => {
                if(i === this.up.cubelets.length - 1) cubelet.rotate('Y', degree, callback);
                else cubelet.rotate('Y', degree, null);
            }); 

        }
        else if(command == 'u' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[ 18 ] = origin[ 20 ]; 
                this.cubelets[ 19 ] = origin[ 11 ]; 
                this.cubelets[ 20 ] = origin[  2 ]; 
                
                this.cubelets[  9 ] = origin[ 19 ]; 
                this.cubelets[ 11 ] = origin[  1 ]; 

                this.cubelets[  0 ] = origin[ 18 ]; 
                this.cubelets[  1 ] = origin[  9 ]; 
                this.cubelets[  2 ] = origin[  0 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.up.cubelets.forEach((cubelet, i) => {
                if(i === this.up.cubelets.length - 1) cubelet.rotate('y', degree, callback);
                else cubelet.rotate('y', degree, null);
            }); 

        }
        else if(command == 'D' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  6 ] = origin[ 24 ]; 
                this.cubelets[  7 ] = origin[ 15 ]; 
                this.cubelets[  8 ] = origin[  6 ]; 
                
                this.cubelets[ 15 ] = origin[ 25 ]; 
                this.cubelets[ 17 ] = origin[  7 ]; 

                this.cubelets[ 24 ] = origin[ 26 ]; 
                this.cubelets[ 25 ] = origin[ 17 ]; 
                this.cubelets[ 26 ] = origin[  8 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.down.cubelets.forEach((cubelet, i) => {
                if(i === this.down.cubelets.length - 1) cubelet.rotate('y', degree, callback);
                else cubelet.rotate('y', degree, null);
            }); 

        }
        else if(command == 'd' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  6 ] = origin[  8 ]; 
                this.cubelets[  7 ] = origin[ 17 ]; 
                this.cubelets[  8 ] = origin[ 26 ]; 
                
                this.cubelets[ 15 ] = origin[  7 ]; 
                this.cubelets[ 17 ] = origin[ 25 ]; 

                this.cubelets[ 24 ] = origin[  6 ]; 
                this.cubelets[ 25 ] = origin[ 15 ]; 
                this.cubelets[ 26 ] = origin[ 24 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.down.cubelets.forEach((cubelet, i) => {
                if(i === this.down.cubelets.length - 1) cubelet.rotate('Y', degree, callback);
                else cubelet.rotate('Y', degree, null);
            }); 

        }
        else if(command == 'E' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  3 ] = origin[ 21 ]; 
                this.cubelets[  4 ] = origin[ 12 ]; 
                this.cubelets[  5 ] = origin[  3 ]; 
                
                this.cubelets[ 12 ] = origin[ 22 ]; 
                this.cubelets[ 14 ] = origin[  4 ]; 

                this.cubelets[ 21 ] = origin[ 23 ]; 
                this.cubelets[ 22 ] = origin[ 14 ]; 
                this.cubelets[ 23 ] = origin[  5 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.equator.cubelets.forEach((cubelet, i) => {
                if(i === this.equator.cubelets.length - 1) cubelet.rotate('y', degree, callback);
                else cubelet.rotate('y', degree, null);
            }); 

        }
        else if(command == 'e' && ! this.isEngagedX && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  3 ] = origin[  5 ]; 
                this.cubelets[  4 ] = origin[ 14 ]; 
                this.cubelets[  5 ] = origin[ 23 ]; 
                
                this.cubelets[ 12 ] = origin[  4 ]; 
                this.cubelets[ 14 ] = origin[ 22 ]; 

                this.cubelets[ 21 ] = origin[  3 ]; 
                this.cubelets[ 22 ] = origin[ 12 ]; 
                this.cubelets[ 23 ] = origin[ 21 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.equator.cubelets.forEach((cubelet, i) => {
                if(i === this.equator.cubelets.length - 1) cubelet.rotate('Y', degree, callback);
                else cubelet.rotate('Y', degree, null);
            }); 

        }
        else if(command == 'M' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  1 ] = origin[ 19 ]; 
                this.cubelets[ 10 ] = origin[ 22 ]; 
                this.cubelets[ 19 ] = origin[ 25 ]; 
                
                this.cubelets[  4 ] = origin[ 10 ]; 
                this.cubelets[ 22 ] = origin[ 16 ]; 

                this.cubelets[  7 ] = origin[  1 ]; 
                this.cubelets[ 16 ] = origin[  4 ]; 
                this.cubelets[ 25 ] = origin[  7 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.middle.cubelets.forEach((cubelet, i) => {
                if(i === this.middle.cubelets.length - 1) cubelet.rotate('X', degree, callback);
                else cubelet.rotate('X', degree, null);
            }); 

        }
        else if(command == 'm' && ! this.isEngagedY && ! this.isEngagedZ) { 
            const callback = (origin) => { 
                this.cubelets[  1 ] = origin[  7 ]; 
                this.cubelets[ 10 ] = origin[  4 ]; 
                this.cubelets[ 19 ] = origin[  1 ]; 
                
                this.cubelets[  4 ] = origin[ 16 ]; 
                this.cubelets[ 22 ] = origin[ 10 ]; 

                this.cubelets[  7 ] = origin[ 25 ]; 
                this.cubelets[ 16 ] = origin[ 22 ]; 
                this.cubelets[ 25 ] = origin[ 19 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.middle.cubelets.forEach((cubelet, i) => {
                if(i === this.middle.cubelets.length - 1) cubelet.rotate('x', degree, callback);
                else cubelet.rotate('x', degree, null);
            }); 
        
        }
        else if(command == 'S' && ! this.isEngagedX && ! this.isEngagedY) { 
            const callback = (origin) => { 
                this.cubelets[  9 ] = origin[ 15 ]; 
                this.cubelets[ 10 ] = origin[ 12 ]; 
                this.cubelets[ 11 ] = origin[  9 ]; 
                
                this.cubelets[ 12 ] = origin[ 16 ]; 
                this.cubelets[ 14 ] = origin[ 10 ]; 

                this.cubelets[ 15 ] = origin[ 17 ]; 
                this.cubelets[ 16 ] = origin[ 14 ]; 
                this.cubelets[ 17 ] = origin[ 11 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.standing.cubelets.forEach((cubelet, i) => {
                if(i === this.standing.cubelets.length - 1) cubelet.rotate('Z', degree, callback);
                else cubelet.rotate('Z', degree, null);
            }); 
        
        }
        else if(command == 's' && ! this.isEngagedX && ! this.isEngagedY) { 
            const callback = (origin) => { 
                this.cubelets[  9 ] = origin[ 11 ]; 
                this.cubelets[ 10 ] = origin[ 14 ]; 
                this.cubelets[ 11 ] = origin[ 17 ]; 
                
                this.cubelets[ 12 ] = origin[ 10 ]; 
                this.cubelets[ 14 ] = origin[ 16 ]; 

                this.cubelets[ 15 ] = origin[  9 ]; 
                this.cubelets[ 16 ] = origin[ 12 ]; 
                this.cubelets[ 17 ] = origin[ 15 ]; 

                this.isTwisting = false; 
                console.log("done"); 
            }
            this.standing.cubelets.forEach((cubelet, i) => {
                if(i === this.standing.cubelets.length - 1) cubelet.rotate('z', degree, callback);
                else cubelet.rotate('z', degree, null);
            }); 
        
        }

    }
    

}