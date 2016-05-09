import * as dotstar from 'dotstar';
import * as colorqueue from 'colorqueue';
import Firebase = require('firebase'); 
import SpiMock from './spimock';
const config = require('../config.json');

if(!config.firebaseUrl) {
  throw new Error(`Config file does not contain required property: firebaseUrl. This is needed to connect to your firebase account.`);
}

if(!config.length) {
  throw new Error(`Config file does not contain required property: length. This is needed to connect to  your firebase account.`);
}

let spi;
let ledStripLength = config.length;
let ledInterval;

/**
 * Over ride configuration values if running locally (on Windows) so we can test operations by looking at
 * buffer data logged to console instead of actually sending it to real LED strip.
 */
const isWindows = /^win/.test(process.platform);
if(isWindows) {
  spi = <dotstar.ISpi>(new SpiMock());
  ledStripLength = 2;
  ledInterval = 500;
  console.log(`Running on Windows! Using SpiMock`);
}
else {
  const SPI = require('pi-spi');
  spi = SPI.initialize('/dev/spidev0.0');
  ledInterval = 50;
}

const dotstar1 = new dotstar.Dotstar(spi, {
  length: ledStripLength
});
console.log(`Created DotStar with length: ${ledStripLength}`);

const colorqueue1 = new colorqueue.ColorQueue(dotstar1, ledInterval);
console.log(`Created ColorQueue.`);

const firebaseColorQueue = new Firebase(config.firebaseUrl);
const firebaseColors = firebaseColorQueue.child('colors');
console.log(`Connected to firebase: ${config.firebaseUrl}`);

firebaseColors.orderByChild('order').on('value', (dataSnapshot) => {
  const colorsHash = <{[key:string]: IColorTransition}>dataSnapshot.val();
  // const colors = Object.keys(colorsHash)
  //   .reduce((a, key) => {
  //     const color = colorsHash[key];
  //     a.push(color);
  //     return a;
  //   }, []);
    
  // console.log(`colorqueue1.set: ${JSON.stringify(colors)}`);
  // colorqueue1.set(colors);
  
  if(colorsHash === null) {
    colorqueue1.clear();
  }
});

firebaseColors.on('child_added', (dataSnapshot) => {
  const color = <colorqueue.IColorTransition>dataSnapshot.val();
  colorqueue1.add(color);
  console.log(`Color added: value: ${JSON.stringify(color)}`);
});

firebaseColors.on('child_removed', (dataSnapshot) => {
  const color = <colorqueue.IColorTransition>dataSnapshot.val();
  const key = dataSnapshot.key();
  colorqueue1.remove(color.order);
  console.log(`Color removed: key: ${key}, value: ${JSON.stringify(color)}`);
});

// Wait for all child colors to be added before starting.
setTimeout(() => {
  colorqueue1.start();
  console.log(`Start`);
}, 50);
