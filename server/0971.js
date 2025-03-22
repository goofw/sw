function(module, exports, __webpack_require__) {
    "use strict";
    var bodyParser = __webpack_require__(106), EventEmitter = __webpack_require__(5).EventEmitter, mixin = __webpack_require__(972), proto = __webpack_require__(973), Route = __webpack_require__(457), Router = __webpack_require__(456), req = __webpack_require__(981), res = __webpack_require__(988);
    (exports = module.exports = function() {
        var app = function(req, res, next) {
            app.handle(req, res, next);
        };
        return mixin(app, EventEmitter.prototype, !1), mixin(app, proto, !1), app.request = Object.create(req, {
            app: {
                configurable: !0,
                enumerable: !0,
                writable: !0,
                value: app
            }
        }), app.response = Object.create(res, {
            app: {
                configurable: !0,
                enumerable: !0,
                writable: !0,
                value: app
            }
        }), app.init(), app;
    }).application = proto, exports.request = req, exports.response = res, exports.Route = Route, 
    exports.Router = Router, exports.json = bodyParser.json, exports.query = __webpack_require__(459), 
    exports.raw = bodyParser.raw, exports.static = __webpack_require__(991), exports.text = bodyParser.text, 
    exports.urlencoded = bodyParser.urlencoded, [ "bodyParser", "compress", "cookieSession", "session", "logger", "cookieParser", "favicon", "responseTime", "errorHandler", "timeout", "methodOverride", "vhost", "csrf", "directory", "limit", "multipart", "staticCache" ].forEach((function(name) {
        Object.defineProperty(exports, name, {
            get: function() {
                throw new Error("Most middleware (like " + name + ") is no longer bundled with Express and must be installed separately. Please see https://github.com/senchalabs/connect#middleware.");
            },
            configurable: !0
        });
    }));
}
