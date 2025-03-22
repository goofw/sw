function(module, exports, __webpack_require__) {
    "use strict";
    var util = __webpack_require__(16), maybeWrapAsError = util.maybeWrapAsError, OperationalError = __webpack_require__(55).OperationalError, es5 = __webpack_require__(66), rErrorKey = /^(?:name|message|stack|cause)$/;
    function wrapAsOperationalError(obj) {
        var ret;
        if ((function(obj) {
            return obj instanceof Error && es5.getPrototypeOf(obj) === Error.prototype;
        })(obj)) {
            (ret = new OperationalError(obj)).name = obj.name, ret.message = obj.message, ret.stack = obj.stack;
            for (var keys = es5.keys(obj), i = 0; i < keys.length; ++i) {
                var key = keys[i];
                rErrorKey.test(key) || (ret[key] = obj[key]);
            }
            return ret;
        }
        return util.markAsOriginatingFromRejection(obj), obj;
    }
    module.exports = function(promise, multiArgs) {
        return function(err, value) {
            if (null !== promise) {
                if (err) {
                    var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
                    promise._attachExtraTrace(wrapped), promise._reject(wrapped);
                } else if (multiArgs) {
                    for (var $_len = arguments.length, args = new Array(Math.max($_len - 1, 0)), $_i = 1; $_i < $_len; ++$_i) args[$_i - 1] = arguments[$_i];
                    promise._fulfill(args);
                } else promise._fulfill(value);
                promise = null;
            }
        };
    };
}
