const ffi = require("ffi-napi");
const ref = require("ref-napi");
const consts = require("./consts");

const wandPtr = ref.refType(ref.types.void);

const gm = ffi.Library("libMagickWand-7.Q16", {
  // Initialization and such
  MagickWandGenesis: ["void", []],
  MagickWandTerminus: ["void", []],
  NewMagickWand: [wandPtr, []],

  // IO
  MagickReadImage: ["bool", [wandPtr, "string"]],
  MagickReadImageBlob: ["bool", [wandPtr, "string", "int"]],
  MagickWriteImage: ["bool", [wandPtr, "string"]],
  MagickWriteImages: ["bool", [wandPtr, "string", "bool"]],

  // Iteration
  MagickGetNumberImages: ["int", [wandPtr]],
  MagickSetIteratorIndex: ["void", [wandPtr, "int"]],
  MagickResetIterator: ["void", [wandPtr]],

  // Image
  MagickResizeImage: ["bool", [wandPtr, "int", "int", "int"]],
  MagickGetImage: [wandPtr, [wandPtr]],
  MagickOptimizeImageLayers: [wandPtr, [wandPtr]],
  MagickAddImage: ["void", [wandPtr, wandPtr]],
  MagickCoalesceImages: [wandPtr, [wandPtr]],
  MagickLiquidRescaleImage: [
    "bool",
    [wandPtr, "int", "int", "double", "double"],
  ],
  MagickCompositeLayers: ["bool", [wandPtr, wandPtr, "int", "int", "int"]],
  MagickCompositeImage: [
    "bool",
    [wandPtr, wandPtr, "int", "bool", "int", "int"],
  ],

  // Properties
  MagickSetOption: ["bool", [wandPtr, "string", "string"]],
  MagickSetFilename: ["bool", [wandPtr, "string"]],
  MagickSetImageGravity: ["bool", [wandPtr, "int"]],
  MagickGetImageWidth: ["int", [wandPtr]],
  MagickGetImageHeight: ["int", [wandPtr]],
  MagickGetImagesBlob: ["uint8*", [wandPtr, ref.refType(ref.types.int)]],
  MagickSetImageFormat: ["bool", [wandPtr, "string"]],

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
module.exports = gm;
module.exports.genesis = gm.MagickWandGenesis;
module.exports.terminus = gm.MagickWandTerminus;

module.exports.load = (buf) => {
  return typeof buf === "string" ? new Image().readFile(buf) : new Image().read(buf);
};

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
    });
  }

  get_height() {
    return new Promise((resolve, reject) => {
      resolve(gm.MagickGetImageHeight(this.wand));
    });
  }

  get_blob() {
    return new Promise((resolve, reject) => {
      let len = ref.alloc("size_t", 0);
      gm.MagickResetIterator(this.wand);
      let out = gm.MagickGetImagesBlob(this.wand, len);
      let buf = Buffer.alloc(len.deref(), ref.reinterpret(out, len.deref()));
      resolve(buf);
    });
  }

  set_format(form) {
    gm.MagickSetImageFormat(this.wand, form);
    return this;
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

  readFile(file) {
    gm.MagickReadImage(this.wand, file);
    return this;
  }

  resize(w, h, filter) {
    gm.MagickResizeImage(this.wand, w, h, consts.FilterTypes[filter ? filter : "LanczosFilter"]);
    return this;
  }

  liquid_rescale(w, h, delta_x = 1, rigidity = 0) {
    gm.MagickLiquidRescaleImage(this.wand, w, h, delta_x, rigidity);
    return this;
  }

  coalesce() {
    this.wand = gm.MagickCoalesceImages(this.wand);
    return this;
  }

  layersComposite(wand, operator, x = 0, y = 0) {
    var result = gm.MagickCompositeLayers(this.wand, wand.wand, consts.CompositeOperators[operator ? operator + "CompositeOp" : "OverCompositeOp"], x, y);
    console.log(result);
    return this;
  }

  layersOptimize() {
    this.wand = gm.MagickOptimizeImageLayers(this.wand);
    return this;
  }

  setGravity(gravity) {
    gm.MagickSetImageGravity(this.wand, consts.GravityTypes[gravity ? gravity : "NorthWestGravity"]);
    return this;
  }

  write(file) {
    gm.MagickWriteImages(this.wand, file, true);
    return this;
  }
}
