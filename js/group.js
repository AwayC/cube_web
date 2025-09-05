/*
                                     ______________
                                    | 18   19   20 |
                                    |              |
                                    |  9   10   11 |
                                    |              |
                                    |  0    1    2 |
                    |===============|==============|===============|
                    |  18   9    0  |  0    1    2 |  2   11   20  |
                    |               |              |               |
                    |  21   12   3  |  3    4    5 |  5   14   23  |
                    |               |              |               |
                    |  24   15   6  |  6    7    8 |  8   17   26  |
                    |===============|==============|===============|
                                    |  6    7    8 |
                                    |              |
                                    | 15   16   17 |
                                    |              |
                                    | 24   25   26 |
                                    |              |
                                    |==============|
                                    | 24   25   26 |
                                    |              |
                                    | 21   22   23 |
                                    |              |
                                    | 18   19   20 |
                                    |==============|



*/


import * as THREE from 'three';

export const groupInfo = { 
    "front": {
        normal: new THREE.Vector3(0, 0, 1), 
        axis: 'z', 
        ids: [
            0, 1, 2, 
            3, 4, 5, 
            6, 7, 8
        ]
    }, 
    "standing": {
        normal: new THREE.Vector3(0, 0, 1),
        axis: 'z', 
        ids: [   
             9, 10, 11, 
            12, 13, 14,
            15, 16, 17,
        ]
    }, 
    "back": {
        normal: new THREE.Vector3(0, 0, -1),
        axis: 'z', 
        ids: [
            24, 25, 26,
            21, 22, 23,
            18, 19, 20,
        ]
    }, 
    "left": {
        normal: new THREE.Vector3(1, 0, 0),
        axis: 'x', 
        ids: [
            18,  9,  0, 
            21, 12,  3, 
            24, 15,  6,
        ]
    }, 
    "middle": { 
        normal: new THREE.Vector3(1, 0, 0),
        axis: 'x', 
        ids: [
             1,  4,  7, 
            10, 13, 16, 
            19, 22, 25,
        ]
    }, 
    "right": {
        normal: new THREE.Vector3(-1, 0, 0),
        axis: 'x', 
        ids: [
             2, 11, 20, 
             5, 14, 23,
             8, 17, 26,
        ]
    }, 
    "up": { 
        normal: new THREE.Vector3(0, 1, 0),
        axis: 'y', 
        ids: [
             18, 19, 20,
             9, 10, 11,
             0,  1,  2,
        ]
    }, 
    "equator": { 
        normal: new THREE.Vector3(0, -1, 0),
        axis: 'y', 
        ids: [
             3,  4,  5, 
            12, 13, 14, 
            21, 22, 23,
        ]
    }, 
    "down": { 
        normal: new THREE.Vector3(0, -1, 0),
        axis: 'y', 
        ids: [
            6,  7,  8, 
            15, 16, 17,
            24, 25, 26,
        ]
    },
    "corner": {
        ids: [
             0, 2, 6, 8,
            18, 20, 26, 24
        ]
    },
    "edge": {
        ids: [
            1, 3, 5, 7,
            9, 11, 15, 17,
            19, 23, 25, 21, 
        ]
    },
    "center": {
        ids: [
            4, 10, 12, 14, 16, 22, 
        ]
    }
}


export class Group { 
    constructor(name, cubelets) {
        this.name = name; 
        this.normal = groupInfo[name].normal;
        this.ids = groupInfo[name].ids;
        this.cubelets = []; 
        this.axis = groupInfo[name].axis;
        this.rotation = 0; 
        this.ids.forEach(id => {
            this.cubelets.push(cubelets[id]);
        });
    }

    getIds() { 
        return this.info.ids;  
    }
    

}