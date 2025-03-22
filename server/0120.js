function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLComment(parent, text) {
                if (XMLComment.__super__.constructor.call(this, parent), null == text) throw new Error("Missing comment text");
                this.text = this.stringify.comment(text);
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLComment, superClass), XMLComment.prototype.clone = function() {
                return Object.create(this);
            }, XMLComment.prototype.toString = function(options) {
                return this.options.writer.set(options).comment(this);
            }, XMLComment;
        })(XMLNode);
    }).call(this);
}
