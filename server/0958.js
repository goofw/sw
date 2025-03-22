function(module, exports, __webpack_require__) {
    __webpack_require__(0);
    var sax = __webpack_require__(959), TreeBuilder = __webpack_require__(449).TreeBuilder;
    function XMLParser(target) {
        this.parser = sax.parser(!0), this.target = target || new TreeBuilder, this.parser.onopentag = this._handleOpenTag.bind(this), 
        this.parser.ontext = this._handleText.bind(this), this.parser.oncdata = this._handleCdata.bind(this), 
        this.parser.ondoctype = this._handleDoctype.bind(this), this.parser.oncomment = this._handleComment.bind(this), 
        this.parser.onclosetag = this._handleCloseTag.bind(this), this.parser.onerror = this._handleError.bind(this);
    }
    XMLParser.prototype._handleOpenTag = function(tag) {
        this.target.start(tag.name, tag.attributes);
    }, XMLParser.prototype._handleText = function(text) {
        this.target.data(text);
    }, XMLParser.prototype._handleCdata = function(text) {
        this.target.data(text);
    }, XMLParser.prototype._handleDoctype = function(text) {}, XMLParser.prototype._handleComment = function(comment) {}, 
    XMLParser.prototype._handleCloseTag = function(tag) {
        this.target.end(tag);
    }, XMLParser.prototype._handleError = function(err) {
        throw err;
    }, XMLParser.prototype.feed = function(chunk) {
        this.parser.write(chunk);
    }, XMLParser.prototype.close = function() {
        return this.parser.close(), this.target.close();
    }, exports.XMLParser = XMLParser;
}
