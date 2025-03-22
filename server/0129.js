function(module, exports, __webpack_require__) {
    (function() {
        var XMLNode, hasProp = {}.hasOwnProperty;
        XMLNode = __webpack_require__(36), module.exports = (function(superClass) {
            function XMLProcessingInstruction(parent, target, value) {
                if (XMLProcessingInstruction.__super__.constructor.call(this, parent), null == target) throw new Error("Missing instruction target");
                this.target = this.stringify.insTarget(target), value && (this.value = this.stringify.insValue(value));
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(XMLProcessingInstruction, superClass), XMLProcessingInstruction.prototype.clone = function() {
                return Object.create(this);
            }, XMLProcessingInstruction.prototype.toString = function(options) {
                return this.options.writer.set(options).processingInstruction(this);
            }, XMLProcessingInstruction;
        })(XMLNode);
    }).call(this);
}
