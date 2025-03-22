function(module, exports, __webpack_require__) {
    "use strict";
    var silence, highPrefix = [ 33, 16, 5, 32, 164, 27 ], lowPrefix = [ 33, 65, 108, 84, 1, 2, 4, 8, 168, 2, 4, 8, 17, 191, 252 ], zeroFill = function(count) {
        for (var a = []; count--; ) a.push(0);
        return a;
    };
    module.exports = function() {
        if (!silence) {
            var coneOfSilence = {
                96e3: [ highPrefix, [ 227, 64 ], zeroFill(154), [ 56 ] ],
                88200: [ highPrefix, [ 231 ], zeroFill(170), [ 56 ] ],
                64e3: [ highPrefix, [ 248, 192 ], zeroFill(240), [ 56 ] ],
                48e3: [ highPrefix, [ 255, 192 ], zeroFill(268), [ 55, 148, 128 ], zeroFill(54), [ 112 ] ],
                44100: [ highPrefix, [ 255, 192 ], zeroFill(268), [ 55, 163, 128 ], zeroFill(84), [ 112 ] ],
                32e3: [ highPrefix, [ 255, 192 ], zeroFill(268), [ 55, 234 ], zeroFill(226), [ 112 ] ],
                24e3: [ highPrefix, [ 255, 192 ], zeroFill(268), [ 55, 255, 128 ], zeroFill(268), [ 111, 112 ], zeroFill(126), [ 224 ] ],
                16e3: [ highPrefix, [ 255, 192 ], zeroFill(268), [ 55, 255, 128 ], zeroFill(268), [ 111, 255 ], zeroFill(269), [ 223, 108 ], zeroFill(195), [ 1, 192 ] ],
                12e3: [ lowPrefix, zeroFill(268), [ 3, 127, 248 ], zeroFill(268), [ 6, 255, 240 ], zeroFill(268), [ 13, 255, 224 ], zeroFill(268), [ 27, 253, 128 ], zeroFill(259), [ 56 ] ],
                11025: [ lowPrefix, zeroFill(268), [ 3, 127, 248 ], zeroFill(268), [ 6, 255, 240 ], zeroFill(268), [ 13, 255, 224 ], zeroFill(268), [ 27, 255, 192 ], zeroFill(268), [ 55, 175, 128 ], zeroFill(108), [ 112 ] ],
                8e3: [ lowPrefix, zeroFill(268), [ 3, 121, 16 ], zeroFill(47), [ 7 ] ]
            };
            metaTable = coneOfSilence, silence = Object.keys(metaTable).reduce((function(obj, key) {
                return obj[key] = new Uint8Array(metaTable[key].reduce((function(arr, part) {
                    return arr.concat(part);
                }), [])), obj;
            }), {});
        }
        var metaTable;
        return silence;
    };
}
