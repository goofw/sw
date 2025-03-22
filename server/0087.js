function(module, exports, __webpack_require__) {
    "use strict";
    var deprecate = __webpack_require__(47)("http-errors"), setPrototypeOf = __webpack_require__(108), statuses = __webpack_require__(109), inherits = __webpack_require__(6), toIdentifier = __webpack_require__(553);
    function codeClass(status) {
        return Number(String(status).charAt(0) + "00");
    }
    function nameFunc(func, name) {
        var desc = Object.getOwnPropertyDescriptor(func, "name");
        desc && desc.configurable && (desc.value = name, Object.defineProperty(func, "name", desc));
    }
    module.exports = function createError() {
        for (var err, msg, status = 500, props = {}, i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg instanceof Error) status = (err = arg).status || err.statusCode || status; else switch (typeof arg) {
              case "string":
                msg = arg;
                break;

              case "number":
                status = arg, 0 !== i && deprecate("non-first-argument status code; replace with createError(" + arg + ", ...)");
                break;

              case "object":
                props = arg;
            }
        }
        "number" == typeof status && (status < 400 || status >= 600) && deprecate("non-error status code; use only 4xx or 5xx status codes"), 
        ("number" != typeof status || !statuses[status] && (status < 400 || status >= 600)) && (status = 500);
        var HttpError = createError[status] || createError[codeClass(status)];
        for (var key in err || (err = HttpError ? new HttpError(msg) : new Error(msg || statuses[status]), 
        Error.captureStackTrace(err, createError)), HttpError && err instanceof HttpError && err.status === status || (err.expose = status < 500, 
        err.status = err.statusCode = status), props) "status" !== key && "statusCode" !== key && (err[key] = props[key]);
        return err;
    }, module.exports.HttpError = (function() {
        function HttpError() {
            throw new TypeError("cannot construct abstract class");
        }
        return inherits(HttpError, Error), HttpError;
    })(), (function(exports, codes, HttpError) {
        codes.forEach((function(code) {
            var CodeError, name = toIdentifier(statuses[code]);
            switch (codeClass(code)) {
              case 400:
                CodeError = (function(HttpError, name, code) {
                    var className = name.match(/Error$/) ? name : name + "Error";
                    function ClientError(message) {
                        var msg = null != message ? message : statuses[code], err = new Error(msg);
                        return Error.captureStackTrace(err, ClientError), setPrototypeOf(err, ClientError.prototype), 
                        Object.defineProperty(err, "message", {
                            enumerable: !0,
                            configurable: !0,
                            value: msg,
                            writable: !0
                        }), Object.defineProperty(err, "name", {
                            enumerable: !1,
                            configurable: !0,
                            value: className,
                            writable: !0
                        }), err;
                    }
                    return inherits(ClientError, HttpError), nameFunc(ClientError, className), ClientError.prototype.status = code, 
                    ClientError.prototype.statusCode = code, ClientError.prototype.expose = !0, ClientError;
                })(HttpError, name, code);
                break;

              case 500:
                CodeError = (function(HttpError, name, code) {
                    var className = name.match(/Error$/) ? name : name + "Error";
                    function ServerError(message) {
                        var msg = null != message ? message : statuses[code], err = new Error(msg);
                        return Error.captureStackTrace(err, ServerError), setPrototypeOf(err, ServerError.prototype), 
                        Object.defineProperty(err, "message", {
                            enumerable: !0,
                            configurable: !0,
                            value: msg,
                            writable: !0
                        }), Object.defineProperty(err, "name", {
                            enumerable: !1,
                            configurable: !0,
                            value: className,
                            writable: !0
                        }), err;
                    }
                    return inherits(ServerError, HttpError), nameFunc(ServerError, className), ServerError.prototype.status = code, 
                    ServerError.prototype.statusCode = code, ServerError.prototype.expose = !1, ServerError;
                })(HttpError, name, code);
            }
            CodeError && (exports[code] = CodeError, exports[name] = CodeError);
        })), exports["I'mateapot"] = deprecate.function(exports.ImATeapot, '"I\'mateapot"; use "ImATeapot" instead');
    })(module.exports, statuses.codes, module.exports.HttpError);
}
