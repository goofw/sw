function(module, exports, __webpack_require__) {
    "use strict";
    var fs = __webpack_require__(2), os = __webpack_require__(21), net = __webpack_require__(42), path = __webpack_require__(4), _async = __webpack_require__(801), debug = __webpack_require__(802), mkdirp = __webpack_require__(132).mkdirp, debugTestPort = debug("portfinder:testPort"), debugGetPort = debug("portfinder:getPort"), debugDefaultHosts = debug("portfinder:defaultHosts"), internals = {
        testPort: function(options, callback) {
            function onListen() {
                debugTestPort("done w/ testPort(): OK", options.host, "port", options.port), options.server.removeListener("error", onError), 
                options.server.close(), callback(null, options.port);
            }
            function onError(err) {
                if (debugTestPort("done w/ testPort(): failed", options.host, "w/ port", options.port, "with error", err.code), 
                options.server.removeListener("listening", onListen), "EADDRINUSE" != err.code && "EACCES" != err.code) return callback(err);
                var nextPort = exports.nextPort(options.port);
                if (nextPort > exports.highestPort) return callback(new Error("No open ports available"));
                internals.testPort({
                    port: nextPort,
                    host: options.host,
                    server: options.server
                }, callback);
            }
            callback || (callback = options, options = {}), options.server = options.server || net.createServer((function() {})), 
            debugTestPort("entered testPort(): trying", options.host, "port", options.port), 
            options.server.once("error", onError), options.server.once("listening", onListen), 
            options.host ? options.server.listen(options.port, options.host) : options.server.listen(options.port);
        }
    };
    exports.basePort = 8e3, exports.setBasePort = function(port) {
        exports.basePort = port;
    }, exports.highestPort = 65535, exports.setHighestPort = function(port) {
        exports.highestPort = port;
    }, exports.basePath = "/tmp/portfinder", exports.getPort = function(options, callback) {
        if (callback || (callback = options, options = {}), options.port = Number(options.port) || Number(exports.basePort), 
        options.host = options.host || null, options.stopPort = Number(options.stopPort) || Number(exports.highestPort), 
        !options.startPort) {
            if (options.startPort = Number(options.port), options.startPort < 0) throw Error("Provided options.startPort(" + options.startPort + ") is less than 0, which are cannot be bound.");
            if (options.stopPort < options.startPort) throw Error("Provided options.stopPort(" + options.stopPort + "is less than options.startPort (" + options.startPort + ")");
        }
        options.host && -1 !== exports._defaultHosts.indexOf(options.host) && exports._defaultHosts.push(options.host);
        var currentHost, openPorts = [];
        return _async.eachSeries(exports._defaultHosts, (function(host, next) {
            return debugGetPort("in eachSeries() iteration callback: host is", host), internals.testPort({
                host: host,
                port: options.port
            }, (function(err, port) {
                return err ? (debugGetPort("in eachSeries() iteration callback testPort() callback", "with an err:", err.code), 
                currentHost = host, next(err)) : (debugGetPort("in eachSeries() iteration callback testPort() callback", "with a success for port", port), 
                openPorts.push(port), next());
            }));
        }), (function(err) {
            if (err) {
                if (debugGetPort("in eachSeries() result callback: err is", err), "EADDRNOTAVAIL" === err.code || "EINVAL" === err.code) {
                    if (options.host === currentHost) {
                        var msg = "Provided host " + options.host + " could NOT be bound. Please provide a different host address or hostname";
                        return callback(Error(msg));
                    }
                    var idx = exports._defaultHosts.indexOf(currentHost);
                    return exports._defaultHosts.splice(idx, 1), exports.getPort(options, callback);
                }
                return callback(err);
            }
            return openPorts.sort((function(a, b) {
                return a - b;
            })), debugGetPort("in eachSeries() result callback: openPorts is", openPorts), openPorts[0] === openPorts[openPorts.length - 1] ? openPorts[0] <= options.stopPort ? callback(null, openPorts[0]) : (msg = "No open ports found in between " + options.startPort + " and " + options.stopPort, 
            callback(Error(msg))) : exports.getPort({
                port: openPorts.pop(),
                host: options.host,
                startPort: options.startPort,
                stopPort: options.stopPort
            }, callback);
        }));
    }, exports.getPortPromise = function(options) {
        if ("function" != typeof Promise) throw Error("Native promise support is not available in this version of node.Please install a polyfill and assign Promise to global.Promise before calling this method");
        return options || (options = {}), new Promise((function(resolve, reject) {
            exports.getPort(options, (function(err, port) {
                if (err) return reject(err);
                resolve(port);
            }));
        }));
    }, exports.getPorts = function(count, options, callback) {
        callback || (callback = options, options = {});
        var lastPort = null;
        _async.timesSeries(count, (function(index, asyncCallback) {
            lastPort && (options.port = exports.nextPort(lastPort)), exports.getPort(options, (function(err, port) {
                err ? asyncCallback(err) : (lastPort = port, asyncCallback(null, port));
            }));
        }), callback);
    }, exports.getSocket = function(options, callback) {
        function testSocket() {
            fs.stat(options.path, (function(err) {
                err ? "ENOENT" == err.code ? callback(null, options.path) : callback(err) : (options.path = exports.nextSocket(options.path), 
                exports.getSocket(options, callback));
            }));
        }
        return callback || (callback = options, options = {}), options.mod = options.mod || parseInt(755, 8), 
        options.path = options.path || exports.basePath + ".sock", options.exists ? testSocket() : (dir = path.dirname(options.path), 
        void fs.stat(dir, (function(err, stats) {
            if (err || !stats.isDirectory()) return (function(dir) {
                mkdirp(dir, options.mod, (function(err) {
                    if (err) return callback(err);
                    options.exists = !0, testSocket();
                }));
            })(dir);
            options.exists = !0, testSocket();
        })));
        var dir;
    }, exports.nextPort = function(port) {
        return port + 1;
    }, exports.nextSocket = function(socketPath) {
        var dir = path.dirname(socketPath), match = path.basename(socketPath, ".sock").match(/^([a-zA-z]+)(\d*)$/i), index = parseInt(match[2]), base = match[1];
        return isNaN(index) && (index = 0), index += 1, path.join(dir, base + index + ".sock");
    }, exports._defaultHosts = (function() {
        var interfaces = {};
        try {
            interfaces = os.networkInterfaces();
        } catch (e) {
            if ("uv_interface_addresses" !== e.syscall) throw e;
        }
        for (var interfaceNames = Object.keys(interfaces), results = [ "0.0.0.0" ], i = 0; i < interfaceNames.length; i++) for (var _interface = interfaces[interfaceNames[i]], j = 0; j < _interface.length; j++) {
            var curr = _interface[j];
            results.push(curr.address);
        }
        return results.push(null), debugDefaultHosts("exports._defaultHosts is: %o", results), 
        results;
    })();
}
