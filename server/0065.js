function(module, exports, __webpack_require__) {
    "use strict";
    const codes = {};
    function createErrorType(code, message, Base) {
        Base || (Base = Error);
        class NodeError extends Base {
            constructor(arg1, arg2, arg3) {
                super((function(arg1, arg2, arg3) {
                    return "string" == typeof message ? message : message(arg1, arg2, arg3);
                })(arg1, arg2, arg3));
            }
        }
        NodeError.prototype.name = Base.name, NodeError.prototype.code = code, codes[code] = NodeError;
    }
    function oneOf(expected, thing) {
        if (Array.isArray(expected)) {
            const len = expected.length;
            return expected = expected.map((i => String(i))), len > 2 ? `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1] : 2 === len ? `one of ${thing} ${expected[0]} or ${expected[1]}` : `of ${thing} ${expected[0]}`;
        }
        return `of ${thing} ${String(expected)}`;
    }
    createErrorType("ERR_INVALID_OPT_VALUE", (function(name, value) {
        return 'The value "' + value + '" is invalid for option "' + name + '"';
    }), TypeError), createErrorType("ERR_INVALID_ARG_TYPE", (function(name, expected, actual) {
        let determiner;
        let msg;
        if ("string" == typeof expected && ("not ", "not " === expected.substr(0, "not ".length)) ? (determiner = "must not be", 
        expected = expected.replace(/^not /, "")) : determiner = "must be", str = name, 
        (void 0 === this_len || this_len > str.length) && (this_len = str.length), " argument" === str.substring(this_len - " argument".length, this_len)) msg = `The ${name} ${determiner} ${oneOf(expected, "type")}`; else {
            const type = (function(str, search, start) {
                return "number" != typeof start && (start = 0), !(start + ".".length > str.length) && -1 !== str.indexOf(".", start);
            })(name) ? "property" : "argument";
            msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, "type")}`;
        }
        var str, this_len;
        return msg += ". Received type " + typeof actual, msg;
    }), TypeError), createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), 
    createErrorType("ERR_METHOD_NOT_IMPLEMENTED", (function(name) {
        return "The " + name + " method is not implemented";
    })), createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), createErrorType("ERR_STREAM_DESTROYED", (function(name) {
        return "Cannot call " + name + " after a stream was destroyed";
    })), createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), 
    createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable"), createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end"), 
    createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), 
    createErrorType("ERR_UNKNOWN_ENCODING", (function(arg) {
        return "Unknown encoding: " + arg;
    }), TypeError), createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), 
    module.exports.codes = codes;
}
