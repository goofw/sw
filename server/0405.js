function(module, exports, __webpack_require__) {
    const retrieveMatroskaSamples = __webpack_require__(813), retrieveMP4Samples = __webpack_require__(822);
    module.exports = {
        matroska: retrieveMatroskaSamples,
        mp4: retrieveMP4Samples
    };
}
