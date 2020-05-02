#!/usr/bin/node
const gm = require('./lib.js');
const fs = require('fs');

// gm.genesis();

let data = fs.readFileSync(process.argv[2]);
let img = gm.load(data).liquid_rescale(400, 400).liquid_rescale(800, 800).coalesce().write("out.png");
console.log(img);

// gm.terminus();
// gm.load(data).resize(100, 100).coalesce().write(process.argv[3]);