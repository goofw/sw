function(module, exports) {
    module.exports = process.env.HLSV2_REMOTE ? "remote" : "local";
}
