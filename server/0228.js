function(module, exports, __webpack_require__) {
    "use strict";
    var extend = __webpack_require__(147), cookies = __webpack_require__(473), paramsHaveRequestBody = __webpack_require__(229).paramsHaveRequestBody;
    function initParams(uri, options, callback) {
        "function" == typeof options && (callback = options);
        var params = {};
        return "object" == typeof options ? extend(params, options, {
            uri: uri
        }) : extend(params, "string" == typeof uri ? {
            uri: uri
        } : uri), params.callback = callback || params.callback, params;
    }
    function request(uri, options, callback) {
        if (void 0 === uri) throw new Error("undefined is not a valid uri or options object.");
        var params = initParams(uri, options, callback);
        if ("HEAD" === params.method && paramsHaveRequestBody(params)) throw new Error("HTTP HEAD requests MUST NOT include a request body.");
        return new request.Request(params);
    }
    function verbFunc(verb) {
        var method = verb.toUpperCase();
        return function(uri, options, callback) {
            var params = initParams(uri, options, callback);
            return params.method = method, request(params, params.callback);
        };
    }
    function wrapRequestMethod(method, options, requester, verb) {
        return function(uri, opts, callback) {
            var params = initParams(uri, opts, callback), target = {};
            return extend(!0, target, options, params), target.pool = params.pool || options.pool, 
            verb && (target.method = verb.toUpperCase()), "function" == typeof requester && (method = requester), 
            method(target, target.callback);
        };
    }
    request.get = verbFunc("get"), request.head = verbFunc("head"), request.options = verbFunc("options"), 
    request.post = verbFunc("post"), request.put = verbFunc("put"), request.patch = verbFunc("patch"), 
    request.del = verbFunc("delete"), request.delete = verbFunc("delete"), request.jar = function(store) {
        return cookies.jar(store);
    }, request.cookie = function(str) {
        return cookies.parse(str);
    }, request.defaults = function(options, requester) {
        var self = this;
        "function" == typeof (options = options || {}) && (requester = options, options = {});
        var defaults = wrapRequestMethod(self, options, requester);
        return [ "get", "head", "post", "put", "patch", "del", "delete" ].forEach((function(verb) {
            defaults[verb] = wrapRequestMethod(self[verb], options, requester, verb);
        })), defaults.cookie = wrapRequestMethod(self.cookie, options, requester), defaults.jar = self.jar, 
        defaults.defaults = self.defaults, defaults;
    }, request.forever = function(agentOptions, optionsArg) {
        var options = {};
        return optionsArg && extend(options, optionsArg), agentOptions && (options.agentOptions = agentOptions), 
        options.forever = !0, request.defaults(options);
    }, module.exports = request, request.Request = __webpack_require__(1046), request.initParams = initParams, 
    Object.defineProperty(request, "debug", {
        enumerable: !0,
        get: function() {
            return request.Request.debug;
        },
        set: function(debug) {
            request.Request.debug = debug;
        }
    });
}
