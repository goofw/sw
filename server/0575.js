function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = (flag, argv) => {
        argv = argv || process.argv;
        const prefix = flag.startsWith("-") ? "" : 1 === flag.length ? "-" : "--", pos = argv.indexOf(prefix + flag), terminatorPos = argv.indexOf("--");
        return -1 !== pos && (-1 === terminatorPos || pos < terminatorPos);
    };
}
