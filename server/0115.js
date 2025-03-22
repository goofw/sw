function(module, exports, __webpack_require__) {
    var zlib = __webpack_require__(45), AVAILABLE_WINDOW_BITS = [ 8, 9, 10, 11, 12, 13, 14, 15 ];
    function PerMessageDeflate(options, isServer, maxPayload) {
        if (this instanceof PerMessageDeflate == 0) throw new TypeError("Classes can't be function-called");
        this._options = options || {}, this._isServer = !!isServer, this._inflate = null, 
        this._deflate = null, this.params = null, this._maxPayload = maxPayload || 0;
    }
    PerMessageDeflate.extensionName = "permessage-deflate", PerMessageDeflate.prototype.offer = function() {
        var params = {};
        return this._options.serverNoContextTakeover && (params.server_no_context_takeover = !0), 
        this._options.clientNoContextTakeover && (params.client_no_context_takeover = !0), 
        this._options.serverMaxWindowBits && (params.server_max_window_bits = this._options.serverMaxWindowBits), 
        this._options.clientMaxWindowBits ? params.client_max_window_bits = this._options.clientMaxWindowBits : null == this._options.clientMaxWindowBits && (params.client_max_window_bits = !0), 
        params;
    }, PerMessageDeflate.prototype.accept = function(paramsList) {
        var params;
        return paramsList = this.normalizeParams(paramsList), params = this._isServer ? this.acceptAsServer(paramsList) : this.acceptAsClient(paramsList), 
        this.params = params, params;
    }, PerMessageDeflate.prototype.cleanup = function() {
        this._inflate && (this._inflate.writeInProgress ? this._inflate.pendingClose = !0 : (this._inflate.close && this._inflate.close(), 
        this._inflate = null)), this._deflate && (this._deflate.writeInProgress ? this._deflate.pendingClose = !0 : (this._deflate.close && this._deflate.close(), 
        this._deflate = null));
    }, PerMessageDeflate.prototype.acceptAsServer = function(paramsList) {
        var accepted = {};
        if (!paramsList.some((function(params) {
            if (accepted = {}, (!1 !== this._options.serverNoContextTakeover || !params.server_no_context_takeover) && (!1 !== this._options.serverMaxWindowBits || !params.server_max_window_bits) && !("number" == typeof this._options.serverMaxWindowBits && "number" == typeof params.server_max_window_bits && this._options.serverMaxWindowBits > params.server_max_window_bits) && ("number" != typeof this._options.clientMaxWindowBits || params.client_max_window_bits)) return (this._options.serverNoContextTakeover || params.server_no_context_takeover) && (accepted.server_no_context_takeover = !0), 
            this._options.clientNoContextTakeover && (accepted.client_no_context_takeover = !0), 
            !1 !== this._options.clientNoContextTakeover && params.client_no_context_takeover && (accepted.client_no_context_takeover = !0), 
            "number" == typeof this._options.serverMaxWindowBits ? accepted.server_max_window_bits = this._options.serverMaxWindowBits : "number" == typeof params.server_max_window_bits && (accepted.server_max_window_bits = params.server_max_window_bits), 
            "number" == typeof this._options.clientMaxWindowBits ? accepted.client_max_window_bits = this._options.clientMaxWindowBits : !1 !== this._options.clientMaxWindowBits && "number" == typeof params.client_max_window_bits && (accepted.client_max_window_bits = params.client_max_window_bits), 
            !0;
        }), this)) throw new Error("Doesn't support the offered configuration");
        return accepted;
    }, PerMessageDeflate.prototype.acceptAsClient = function(paramsList) {
        var params = paramsList[0];
        if (null != this._options.clientNoContextTakeover && !1 === this._options.clientNoContextTakeover && params.client_no_context_takeover) throw new Error('Invalid value for "client_no_context_takeover"');
        if (null != this._options.clientMaxWindowBits) {
            if (!1 === this._options.clientMaxWindowBits && params.client_max_window_bits) throw new Error('Invalid value for "client_max_window_bits"');
            if ("number" == typeof this._options.clientMaxWindowBits && (!params.client_max_window_bits || params.client_max_window_bits > this._options.clientMaxWindowBits)) throw new Error('Invalid value for "client_max_window_bits"');
        }
        return params;
    }, PerMessageDeflate.prototype.normalizeParams = function(paramsList) {
        return paramsList.map((function(params) {
            return Object.keys(params).forEach((function(key) {
                var value = params[key];
                if (value.length > 1) throw new Error("Multiple extension parameters for " + key);
                switch (value = value[0], key) {
                  case "server_no_context_takeover":
                  case "client_no_context_takeover":
                    if (!0 !== value) throw new Error("invalid extension parameter value for " + key + " (" + value + ")");
                    params[key] = !0;
                    break;

                  case "server_max_window_bits":
                  case "client_max_window_bits":
                    if ("string" == typeof value && (value = parseInt(value, 10), !~AVAILABLE_WINDOW_BITS.indexOf(value))) throw new Error("invalid extension parameter value for " + key + " (" + value + ")");
                    if (!this._isServer && !0 === value) throw new Error("Missing extension parameter value for " + key);
                    params[key] = value;
                    break;

                  default:
                    throw new Error("Not defined extension parameter (" + key + ")");
                }
            }), this), params;
        }), this);
    }, PerMessageDeflate.prototype.decompress = function(data, fin, callback) {
        var endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
            var maxWindowBits = this.params[endpoint + "_max_window_bits"];
            this._inflate = zlib.createInflateRaw({
                windowBits: "number" == typeof maxWindowBits ? maxWindowBits : 15
            });
        }
        this._inflate.writeInProgress = !0;
        var self = this, buffers = [], cumulativeBufferLength = 0;
        function onError(err) {
            cleanup(), callback(err);
        }
        function onData(data) {
            void 0 !== self._maxPayload && null !== self._maxPayload && self._maxPayload > 0 && (cumulativeBufferLength += data.length) > self._maxPayload ? (buffers = [], 
            cleanup(), callback({
                type: 1009
            })) : buffers.push(data);
        }
        function cleanup() {
            self._inflate && (self._inflate.removeListener("error", onError), self._inflate.removeListener("data", onData), 
            self._inflate.writeInProgress = !1, (fin && self.params[endpoint + "_no_context_takeover"] || self._inflate.pendingClose) && (self._inflate.close && self._inflate.close(), 
            self._inflate = null));
        }
        this._inflate.on("error", onError).on("data", onData), this._inflate.write(data), 
        fin && this._inflate.write(new Buffer([ 0, 0, 255, 255 ])), this._inflate.flush((function() {
            cleanup(), callback(null, Buffer.concat(buffers));
        }));
    }, PerMessageDeflate.prototype.compress = function(data, fin, callback) {
        var endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
            var maxWindowBits = this.params[endpoint + "_max_window_bits"];
            this._deflate = zlib.createDeflateRaw({
                flush: zlib.Z_SYNC_FLUSH,
                windowBits: "number" == typeof maxWindowBits ? maxWindowBits : 15,
                memLevel: this._options.memLevel || 8
            });
        }
        this._deflate.writeInProgress = !0;
        var self = this, buffers = [];
        function onError(err) {
            cleanup(), callback(err);
        }
        function onData(data) {
            buffers.push(data);
        }
        function cleanup() {
            self._deflate && (self._deflate.removeListener("error", onError), self._deflate.removeListener("data", onData), 
            self._deflate.writeInProgress = !1, (fin && self.params[endpoint + "_no_context_takeover"] || self._deflate.pendingClose) && (self._deflate.close && self._deflate.close(), 
            self._deflate = null));
        }
        this._deflate.on("error", onError).on("data", onData), this._deflate.write(data), 
        this._deflate.flush((function() {
            cleanup();
            var data = Buffer.concat(buffers);
            fin && (data = data.slice(0, data.length - 4)), callback(null, data);
        }));
    }, module.exports = PerMessageDeflate;
}
