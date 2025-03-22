function(module, exports, __webpack_require__) {
    (function() {
        "use strict";
        var builder, defaults, parser, processors, hasProp = {}.hasOwnProperty;
        defaults = __webpack_require__(173), builder = __webpack_require__(684), parser = __webpack_require__(689), 
        processors = __webpack_require__(282), exports.defaults = defaults.defaults, exports.processors = processors, 
        exports.ValidationError = (function(superClass) {
            function ValidationError(message) {
                this.message = message;
            }
            return (function(child, parent) {
                for (var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype;
            })(ValidationError, Error), ValidationError;
        })(), exports.Builder = builder.Builder, exports.Parser = parser.Parser, exports.parseString = parser.parseString;
    }).call(this);
}
