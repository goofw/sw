function(module, exports, __webpack_require__) {
    var binary = __webpack_require__(241);
    module.exports = function(extraField, vars) {
        for (var extra; !extra && extraField && extraField.length; ) {
            var candidateExtra = binary.parse(extraField).word16lu("signature").word16lu("partsize").word64lu("uncompressedSize").word64lu("compressedSize").word64lu("offset").word64lu("disknum").vars;
            1 === candidateExtra.signature ? extra = candidateExtra : extraField = extraField.slice(candidateExtra.partsize + 4);
        }
        return extra = extra || {}, 4294967295 === vars.compressedSize && (vars.compressedSize = extra.compressedSize), 
        4294967295 === vars.uncompressedSize && (vars.uncompressedSize = extra.uncompressedSize), 
        4294967295 === vars.offsetToLocalFileHeader && (vars.offsetToLocalFileHeader = extra.offset), 
        extra;
    };
}
