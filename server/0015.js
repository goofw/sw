function(module, exports, __webpack_require__) {
    var assert = __webpack_require__(24), Stream = __webpack_require__(3).Stream, util = __webpack_require__(0), UUID_REGEXP = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function _toss(name, expected, oper, arg, actual) {
        throw new assert.AssertionError({
            message: util.format("%s (%s) is required", name, expected),
            actual: void 0 === actual ? typeof arg : actual(arg),
            expected: expected,
            operator: oper || "===",
            stackStartFunction: _toss.caller
        });
    }
    function _getClass(arg) {
        return Object.prototype.toString.call(arg).slice(8, -1);
    }
    function noop() {}
    var types = {
        bool: {
            check: function(arg) {
                return "boolean" == typeof arg;
            }
        },
        func: {
            check: function(arg) {
                return "function" == typeof arg;
            }
        },
        string: {
            check: function(arg) {
                return "string" == typeof arg;
            }
        },
        object: {
            check: function(arg) {
                return "object" == typeof arg && null !== arg;
            }
        },
        number: {
            check: function(arg) {
                return "number" == typeof arg && !isNaN(arg);
            }
        },
        finite: {
            check: function(arg) {
                return "number" == typeof arg && !isNaN(arg) && isFinite(arg);
            }
        },
        buffer: {
            check: function(arg) {
                return Buffer.isBuffer(arg);
            },
            operator: "Buffer.isBuffer"
        },
        array: {
            check: function(arg) {
                return Array.isArray(arg);
            },
            operator: "Array.isArray"
        },
        stream: {
            check: function(arg) {
                return arg instanceof Stream;
            },
            operator: "instanceof",
            actual: _getClass
        },
        date: {
            check: function(arg) {
                return arg instanceof Date;
            },
            operator: "instanceof",
            actual: _getClass
        },
        regexp: {
            check: function(arg) {
                return arg instanceof RegExp;
            },
            operator: "instanceof",
            actual: _getClass
        },
        uuid: {
            check: function(arg) {
                return "string" == typeof arg && UUID_REGEXP.test(arg);
            },
            operator: "isUUID"
        }
    };
    module.exports = (function _setExports(ndebug) {
        var out, keys = Object.keys(types);
        return out = process.env.NODE_NDEBUG ? noop : function(arg, msg) {
            arg || _toss(msg, "true", arg);
        }, keys.forEach((function(k) {
            if (ndebug) out[k] = noop; else {
                var type = types[k];
                out[k] = function(arg, msg) {
                    type.check(arg) || _toss(msg, k, type.operator, arg, type.actual);
                };
            }
        })), keys.forEach((function(k) {
            var name = "optional" + _capitalize(k);
            if (ndebug) out[name] = noop; else {
                var type = types[k];
                out[name] = function(arg, msg) {
                    null != arg && (type.check(arg) || _toss(msg, k, type.operator, arg, type.actual));
                };
            }
        })), keys.forEach((function(k) {
            var name = "arrayOf" + _capitalize(k);
            if (ndebug) out[name] = noop; else {
                var type = types[k], expected = "[" + k + "]";
                out[name] = function(arg, msg) {
                    var i;
                    for (Array.isArray(arg) || _toss(msg, expected, type.operator, arg, type.actual), 
                    i = 0; i < arg.length; i++) type.check(arg[i]) || _toss(msg, expected, type.operator, arg, type.actual);
                };
            }
        })), keys.forEach((function(k) {
            var name = "optionalArrayOf" + _capitalize(k);
            if (ndebug) out[name] = noop; else {
                var type = types[k], expected = "[" + k + "]";
                out[name] = function(arg, msg) {
                    var i;
                    if (null != arg) for (Array.isArray(arg) || _toss(msg, expected, type.operator, arg, type.actual), 
                    i = 0; i < arg.length; i++) type.check(arg[i]) || _toss(msg, expected, type.operator, arg, type.actual);
                };
            }
        })), Object.keys(assert).forEach((function(k) {
            out[k] = "AssertionError" !== k && ndebug ? noop : assert[k];
        })), out._setExports = _setExports, out;
    })(process.env.NODE_NDEBUG);
}
