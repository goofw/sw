function(module, exports, __webpack_require__) {
    module.exports = SocketReader;
    var inherits = __webpack_require__(6), Reader = __webpack_require__(82);
    function SocketReader(props) {
        if (!(this instanceof SocketReader)) throw new Error("SocketReader must be called as constructor.");
        if ("Socket" !== props.type || !props.Socket) throw new Error("Non-socket type " + props.type);
        Reader.call(this, props);
    }
    inherits(SocketReader, Reader), SocketReader.prototype._read = function() {
        this._paused || this._ended || (this.emit("end"), this.emit("close"), this._ended = !0);
    };
}
