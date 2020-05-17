#!/usr/bin/node
const gm = require('./lib.js');
const fs = require('fs');

gm.genesis();
(async () => {
    let file = fs.readFileSync(process.argv[2]);
    let img = gm.load(file);
    let width = await img.get_width();
    let height = await img.get_height();
    console.log(`W: ${width} H: ${height}`);

    // img.liquid_rescale(width/1.2, height/1.2).liquid_rescale(width, height).coalesce().write(process.argv[3]);
    img.resize(200, 200).coalesce().set_format("jpg").get_blob().then((buf) => {
        console.log(buf);
        fs.writeFileSync("out.jpg", buf);
    })
    // gm.terminus();
})();
// let img = gm.load(data).liquid_rescale(400, 400).liquid_rescale(800, 800).coalesce();
// console.log(img);

// gm.load(data).resize(100, 100).coalesce().write(process.argv[3]);