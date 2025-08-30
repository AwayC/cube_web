export class Color { 
    constructor(name, hexStr, hex, symbol) { 

        this.name = name; 
        this.hexStr = hexStr; 
        this.hex = hex; 
        this.r = (hex >> 16) & 0xff;
        this.g = (hex >> 8) & 0xff;
        this.b = hex & 0xff;
        this.symbol = symbol;

    }
}

export const 
W = new Color(
    'white', 
    '#EEEEEE', 
    0xeeeeee,
    "W", 
), 
O = new Color(
    'orange', 
    '#EE6600', 
    0xee6600, 
    "O", 

), 
B = new Color(
    'blue', 
    '#2255DD', 
    0x2255dd, 
    "B", 

), 
G = new Color(
    'green', 
    '#009922', 
    0x009922,
    "G", 

), 
Y = new Color(
    'yellow', 
    '#FFCC00',
    0xffcc00, 
    "Y", 

), 
R = new Color(
    'red', 
    '#CC0000', 
    0xcc0000, 
    "R", 

), 
COLORLESS = new Color(
    'NA', 
    '#DDDDDD',
    0x0f0f0f, 
    "*", 

); 

 
export const COLORSMAP = {
    "W": W,
    "O": O,
    "B": B,
    "G": G,
    "Y": Y,
    "R": R,
    "*": COLORLESS,
}