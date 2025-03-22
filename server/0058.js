function(module, exports, __webpack_require__) {
    "use strict";
    var _TypeError, _RangeError, es5 = __webpack_require__(81), Objectfreeze = es5.freeze, util = __webpack_require__(17), inherits = util.inherits, notEnumerableProp = util.notEnumerableProp;
    function subError(nameProperty, defaultMessage) {
        function SubError(message) {
            if (!(this instanceof SubError)) return new SubError(message);
            notEnumerableProp(this, "message", "string" == typeof message ? message : defaultMessage), 
            notEnumerableProp(this, "name", nameProperty), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : Error.call(this);
        }
        return inherits(SubError, Error), SubError;
    }
    var Warning = subError("Warning", "warning"), CancellationError = subError("CancellationError", "cancellation error"), TimeoutError = subError("TimeoutError", "timeout error"), AggregateError = subError("AggregateError", "aggregate error");
    try {
        _TypeError = TypeError, _RangeError = RangeError;
    } catch (e) {
        _TypeError = subError("TypeError", "type error"), _RangeError = subError("RangeError", "range error");
    }
    for (var methods = "join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "), i = 0; i < methods.length; ++i) "function" == typeof Array.prototype[methods[i]] && (AggregateError.prototype[methods[i]] = Array.prototype[methods[i]]);
    es5.defineProperty(AggregateError.prototype, "length", {
        value: 0,
        configurable: !1,
        writable: !0,
        enumerable: !0
    }), AggregateError.prototype.isOperational = !0;
    var level = 0;
    function OperationalError(message) {
        if (!(this instanceof OperationalError)) return new OperationalError(message);
        notEnumerableProp(this, "name", "OperationalError"), notEnumerableProp(this, "message", message), 
        this.cause = message, this.isOperational = !0, message instanceof Error ? (notEnumerableProp(this, "message", message.message), 
        notEnumerableProp(this, "stack", message.stack)) : Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    }
    AggregateError.prototype.toString = function() {
        var indent = Array(4 * level + 1).join(" "), ret = "\n" + indent + "AggregateError of:\n";
        level++, indent = Array(4 * level + 1).join(" ");
        for (var i = 0; i < this.length; ++i) {
            for (var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "", lines = str.split("\n"), j = 0; j < lines.length; ++j) lines[j] = indent + lines[j];
            ret += (str = lines.join("\n")) + "\n";
        }
        return level--, ret;
    }, inherits(OperationalError, Error);
    var errorTypes = Error.__BluebirdErrorTypes__;
    errorTypes || (errorTypes = Objectfreeze({
        CancellationError: CancellationError,
        TimeoutError: TimeoutError,
        OperationalError: OperationalError,
        RejectionError: OperationalError,
        AggregateError: AggregateError
    }), es5.defineProperty(Error, "__BluebirdErrorTypes__", {
        value: errorTypes,
        writable: !1,
        enumerable: !1,
        configurable: !1
    })), module.exports = {
        Error: Error,
        TypeError: _TypeError,
        RangeError: _RangeError,
        CancellationError: errorTypes.CancellationError,
        OperationalError: errorTypes.OperationalError,
        TimeoutError: errorTypes.TimeoutError,
        AggregateError: errorTypes.AggregateError,
        Warning: Warning
    };
}
