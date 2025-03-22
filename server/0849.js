function(module, exports, __webpack_require__) {
    "use strict";
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
            var info = gen[key](arg), value = info.value;
        } catch (error) {
            return void reject(error);
        }
        info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
        return function() {
            var self = this, args = arguments;
            return new Promise((function(resolve, reject) {
                var gen = fn.apply(self, args);
                function _next(value) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
                }
                function _throw(err) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
                }
                _next(void 0);
            }));
        };
    }
    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            enumerableOnly && (symbols = symbols.filter((function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            }))), keys.push.apply(keys, symbols);
        }
        return keys;
    }
    function _defineProperty(obj, key, value) {
        return key in obj ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : obj[key] = value, obj;
    }
    var ERR_INVALID_ARG_TYPE = __webpack_require__(65).codes.ERR_INVALID_ARG_TYPE;
    module.exports = function(Readable, iterable, opts) {
        var iterator;
        if (iterable && "function" == typeof iterable.next) iterator = iterable; else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator](); else {
            if (!iterable || !iterable[Symbol.iterator]) throw new ERR_INVALID_ARG_TYPE("iterable", [ "Iterable" ], iterable);
            iterator = iterable[Symbol.iterator]();
        }
        var readable = new Readable((function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = null != arguments[i] ? arguments[i] : {};
                i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
                    _defineProperty(target, key, source[key]);
                })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                }));
            }
            return target;
        })({
            objectMode: !0
        }, opts)), reading = !1;
        function next() {
            return _next2.apply(this, arguments);
        }
        function _next2() {
            return (_next2 = _asyncToGenerator((function*() {
                try {
                    var _ref = yield iterator.next(), value = _ref.value;
                    _ref.done ? readable.push(null) : readable.push(yield value) ? next() : reading = !1;
                } catch (err) {
                    readable.destroy(err);
                }
            }))).apply(this, arguments);
        }
        return readable._read = function() {
            reading || (reading = !0, next());
        }, readable;
    };
}
