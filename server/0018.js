function(module, exports) {
    module.exports = function(conf, csName, lang) {
        this.confidence = conf, this.charsetName = csName, this.lang = lang;
    };
}
