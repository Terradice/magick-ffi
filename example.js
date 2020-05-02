#!/usr/bin/node
const gm = require('./lib.js');
const fs = require('fs');

let data = fs.readFileSync(process.argv[2]);
gm.load(data).resize(100, 100).coalesce().write(process.argv[3]);