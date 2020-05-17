#!/usr/bin/node
const im = require('./lib.js');
const fs = require('fs');

im.genesis();
(async () => {
    //let file = fs.readFileSync(process.argv[2]);
    let img = im.load(process.argv[2]);
    let width = await img.get_width();
    let height = await img.get_height();
    console.log(`W: ${width} H: ${height}`);

    // img.liquid_rescale(width/1.2, height/1.2).liquid_rescale(width, height).coalesce().write(process.argv[3]);
    img.resize(200, 200).coalesce().layersOptimize().set_format("gif").get_blob().then((buf) => {
        console.log(buf);
        fs.writeFileSync("out.gif", buf);
    })
    im.terminus();
})();