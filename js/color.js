export class Color { 
    constructor(name, hexStr, hex) { 
        this.name = name; 
        this.hexStr = hexStr; 
        this.hex = hex; 
    }
}

export const 
W = new Color(
    'white', 
    '#FFFFFF', 
    0xffffff
), 
O = new Color(
    'orange', 
    '#FF6600', 
    0xff6600
), 
B = new Color(
    'blue', 
    '#0000DD', 
    0x0000dd
), 
G = new Color(
    'green', 
    '#00AA00', 
    0x00aa00
), 
Y = new Color(
    'yellow', 
    '#FFEE00',
    0xffee00
), 
R = new Color(
    'red', 
    '#FF0000', 
    0xff0000
), 
COLORLESS = new Color(
    'NA', 
    '#DDDDDD',
    0x0f0f0f
); 

 
