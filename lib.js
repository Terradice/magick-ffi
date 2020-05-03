#!/usr/bin/node
const ffi = require("ffi-napi");
const ref = require('ref-napi');

var wandPtr = ref.refType(ref.types.void);
var FilterTypes = Object.freeze({
    "UndefinedFilter":      0,
    "PointFilter":          1,
    "BoxFilter":            2,
    "TriangleFilter":       3,
    "HermiteFilter":        4,
    "HannFilter":           5,
    "HammingFilter":        6,
    "BlackmanFilter":       7,
    "GaussianFilter":       8,
    "QuadraticFilter":      9,
    "CubicFilter":          10,
    "CatromFilter":         11,
    "MitchellFilter":       12,
    "JincFilter":           13,
    "SincFilter":           14,
    "SincFastFilter":       15,
    "KaiserFilter":         16,
    "WelchFilter":          17,
    "ParzenFilter":         18,
    "BohmanFilter":         19,
    "BartlettFilter":       20,
    "LagrangeFilter":       21,
    "LanczosFilter":        22,
    "LanczosSharpFilter":   23,
    "Lanczos2Filter":       24,
    "Lanczos2SharpFilter":  25,
    "RobidouxFilter":       26,
    "RobidouxSharpFilter":  27,
    "CosineFilter":         28,
    "SplineFilter":         29,
    "LanczosRadiusFilter":  30,
    "CubicSplineFilter":    31,
    "SentinelFilter":       32
})

var gm = ffi.Library('libMagickWand-7.Q16HDRI', {
    // Initialization and such
    'MagickWandGenesis':    [ 'void',   [ ] ],
    'MagickWandTerminus':   [ 'void',   [ ] ],
    'NewMagickWand':        [ wandPtr,  [ ] ],
    
    // IO
    'MagickReadImage':      [ 'bool',   [ wandPtr, "string" ] ],
    'MagickReadImageBlob':  [ 'bool',   [ wandPtr, "string", "int" ] ],
    'MagickWriteImage':     [ 'bool',   [ wandPtr, "string" ] ],
    'MagickWriteImages':    [ 'bool',   [ wandPtr, "string", "bool" ] ],

    // Iteration
    'MagickGetNumberImages':    [ 'int',    [ wandPtr ] ],
    'MagickSetIteratorIndex':   [ 'void',   [ wandPtr, 'int' ] ],

    // Image
    'MagickResizeImage':    [ 'bool',   [ wandPtr, "int", "int", "int" ] ],
    'MagickGetImage':       [ wandPtr,  [ wandPtr ] ],
    'MagickAddImage':       [ 'void',   [ wandPtr, wandPtr ] ],
    'MagickCoalesceImages': [ wandPtr,  [ wandPtr ] ],
    'MagickLiquidRescaleImage': [ 'bool',   [ wandPtr, 'int', 'int', 'double', 'double' ] ],
    
    
    // Properties
    'MagickSetOption':      [ 'bool',   [ wandPtr, "string", "string" ] ],
    'MagickGetImageWidth':  [ 'int',    [ wandPtr ] ],
    'MagickGetImageHeight': [ 'int',    [ wandPtr ] ],
    'MagickGetImageBlob':   [ ref.refType(ref.types.void), [ wandPtr, ref.refType(ref.types.size_t) ] ]

    //unsigned char *MagickGetImageBlob(MagickWand *wand,size_t *length)
    
    // 'MagickDescribeImage':  [ 'string'  [ wandPtr ] ]
});


// for(let i = 0; i < gm.MagickGetNumberImages(wand) ; i++) {
//     gm.MagickSetIteratorIndex(wand, i);
//     let tmp = gm.MagickGetImage(wand);
//     // gm.MagickAddImage(wand, tmp);
//     gm.MagickResizeImage(wand, 100, 100, FilterTypes.LanczosFilter);
//     // DestroyMagickWand(tw);
// }

// gm.MagickResizeImage(wand, 100, 100, FilterTypes.LanczosFilter);
module.exports.genesis = gm.MagickWandGenesis;
module.exports.terminus = gm.MagickWandTerminus;


module.exports.load = (buf) => {
    return new Image().read(buf);
}

class Image {
    constructor() {
        this.wand = gm.NewMagickWand();
    }

    get_number_images() {
        return gm.MagickGetNumberImages(wand);
        
    }

    get_width() {
        return new Promise((resolve, reject) => {
            resolve(gm.MagickGetImageWidth(this.wand));
        })
    }

    get_height() {
        return new Promise((resolve, reject) => {
            resolve(gm.MagickGetImageHeight(this.wand));
        })
    }

    get_blob() {
        return new Promise((resolve, reject) => {
            let len = Buffer.alloc(4);
            len.type = ref.types.size_t;
            let buf = gm.MagickGetImageBlob(this.wand, len);  
            console.log(len.deref());
            console.log(buf.deref());
            
                                      
            resolve(buf);
        })
    }

    // describe() {
    //     return new Promise((resolve, reject) => {
    //         let data = gm.MagickDescribeImage(this.wand);
    //         resolve(data);
    //     })
    // }

    // get_size() {
    //     return new Promise((resolve, reject) => {
    //         this.get_height().then((h) => {
    //             this.get_width().then((w) => {
    //                 resolve([h, w]);
    //             })
    //         })
    //     })
    // }

    read(buf) {
        gm.MagickReadImageBlob(this.wand, buf, buf.length);
        return this;
    }

    resize(w, h) {
        gm.MagickResizeImage(this.wand, w, h, FilterTypes.LanczosFilter);
        return this;
    }

    liquid_rescale(w, h, delta_x=1, rigidity=0) {
        gm.MagickLiquidRescaleImage(this.wand, w, h, delta_x, rigidity);
        return this;
    }

    coalesce() {
        gm.MagickCoalesceImages(this.wand);        
        return this;
    }

    write(file) {
        gm.MagickWriteImages(this.wand, file, true);
    }
}