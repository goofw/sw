function(module, exports, __webpack_require__) {
    var fs = __webpack_require__(2), http = __webpack_require__(11), https = __webpack_require__(22), url = __webpack_require__(7), stream = __webpack_require__(3), debug = __webpack_require__(8)("needle"), stringify = __webpack_require__(1015).build, multipart = __webpack_require__(1016), auth = __webpack_require__(1017), cookies = __webpack_require__(1018), parsers = __webpack_require__(1019), decoder = __webpack_require__(1020), version = __webpack_require__(1021).version, user_agent = "Needle/" + version;
    user_agent += " (Node.js " + process.version + "; " + process.platform + " " + process.arch + ")";
    var close_by_default = !http.Agent || http.Agent.defaultMaxSockets != 1 / 0, extend = Object.assign ? Object.assign : __webpack_require__(0)._extend, redirect_codes = [ 301, 302, 303, 307 ], decompressors = {};
    try {
        var zlib = __webpack_require__(45);
        decompressors["x-deflate"] = zlib.Inflate, decompressors.deflate = zlib.Inflate, 
        decompressors["x-gzip"] = zlib.Gunzip, decompressors.gzip = zlib.Gunzip;
        var zlib_options = {
            flush: zlib.Z_SYNC_FLUSH,
            finishFlush: zlib.Z_SYNC_FLUSH
        };
    } catch (e) {}
    var defaults = {
        boundary: "--------------------NODENEEDLEHTTPCLIENT",
        encoding: "utf8",
        parse_response: "all",
        proxy: null,
        accept: "*/*",
        user_agent: user_agent,
        open_timeout: 1e4,
        read_timeout: 0,
        follow_max: 0,
        stream_length: -1,
        decode_response: !0,
        parse_cookies: !0,
        follow_set_cookies: !1,
        follow_set_referer: !1,
        follow_keep_method: !1,
        follow_if_same_host: !1,
        follow_if_same_protocol: !1
    }, aliased = {
        options: {
            decode: "decode_response",
            parse: "parse_response",
            timeout: "open_timeout",
            follow: "follow_max"
        },
        inverted: {}
    };
    function keys_by_type(type) {
        return Object.keys(defaults).map((function(el) {
            if (null !== defaults[el] && defaults[el].constructor == type) return el;
        })).filter((function(el) {
            return el;
        }));
    }
    function is_stream(obj) {
        return "function" == typeof obj.pipe;
    }
    function Needle(method, uri, data, options, callback) {
        if ("string" != typeof uri) throw new TypeError("URL must be a string, not " + uri);
        this.method = method, this.uri = uri, this.data = data, "function" == typeof options ? (this.callback = options, 
        this.options = {}) : (this.callback = callback, this.options = options);
    }
    Object.keys(aliased.options).map((function(k) {
        var value = aliased.options[k];
        aliased.inverted[value] = k;
    })), Needle.prototype.setup = function(uri, options) {
        function get_option(key, fallback) {
            return void 0 !== options[key] ? options[key] : void 0 !== options[aliased.inverted[key]] ? options[aliased.inverted[key]] : fallback;
        }
        function check_value(expected, key) {
            var value = get_option(key), type = typeof value;
            if ("undefined" != type && type != expected) throw new TypeError(type + " received for " + key + ", but expected a " + expected);
            return type == expected ? value : defaults[key];
        }
        var config = {
            http_opts: {},
            output: options.output,
            proxy: get_option("proxy", defaults.proxy),
            parser: get_option("parse_response", defaults.parse_response),
            encoding: options.encoding || (options.multipart ? "binary" : defaults.encoding)
        };
        if (keys_by_type(Boolean).forEach((function(key) {
            config[key] = check_value("boolean", key);
        })), keys_by_type(Number).forEach((function(key) {
            config[key] = check_value("number", key);
        })), "agent pfx key passphrase cert ca ciphers rejectUnauthorized secureProtocol checkServerIdentity".split(" ").forEach((function(key) {
            void 0 !== options[key] && (config.http_opts[key] = options[key], void 0 === options.agent && (config.http_opts.agent = !1));
        })), config.headers = {
            accept: options.accept || defaults.accept,
            "user-agent": options.user_agent || defaults.user_agent
        }, options.content_type && (config.headers["content-type"] = options.content_type), 
        (options.connection || close_by_default) && (config.headers.connection = options.connection || "close"), 
        (options.compressed || defaults.compressed) && void 0 !== zlib && (config.headers["accept-encoding"] = "gzip,deflate"), 
        options.cookies && (config.headers.cookie = cookies.write(options.cookies)), -1 !== uri.indexOf("@")) {
            var parts = (url.parse(uri).auth || "").split(":");
            options.username = parts[0], options.password = parts[1];
        }
        if (options.username && (!options.auth || "auto" != options.auth && "digest" != options.auth ? config.headers.authorization = auth.basic(options.username, options.password) : config.credentials = [ options.username, options.password ]), 
        config.proxy) {
            if (-1 === config.proxy.indexOf("http") && (config.proxy = "http://" + config.proxy), 
            -1 !== config.proxy.indexOf("@")) {
                var proxy = (url.parse(config.proxy).auth || "").split(":");
                options.proxy_user = proxy[0], options.proxy_pass = proxy[1];
            }
            options.proxy_user && (config.headers["proxy-authorization"] = auth.basic(options.proxy_user, options.proxy_pass));
        }
        for (var h in options.headers) config.headers[h.toLowerCase()] = options.headers[h];
        return config;
    }, Needle.prototype.start = function() {
        var out = new stream.PassThrough({
            objectMode: !1
        }), uri = this.uri, data = this.data, method = this.method, callback = "function" == typeof this.options ? this.options : this.callback, options = this.options || {};
        -1 === uri.indexOf("http") && (uri = uri.replace(/^(\/\/)?/, "http://"));
        var body, self = this, waiting = !1, config = this.setup(uri, options), json = options.json || !1 !== options.json && "application/json" == config.headers["content-type"];
        if (data) if (options.multipart) {
            var boundary = options.boundary || defaults.boundary;
            waiting = !0, multipart.build(data, boundary, (function(err, parts) {
                if (err) throw err;
                config.headers["content-type"] = "multipart/form-data; boundary=" + boundary, next(parts);
            }));
        } else if (is_stream(data)) {
            if ("GET" == method.toUpperCase()) throw new Error("Refusing to pipe() a stream via GET. Did you mean .post?");
            config.stream_length > 0 || 0 === config.stream_length && data.path ? (waiting = !0, 
            (function(stream, given_length, cb) {
                given_length > 0 ? cb(given_length) : void 0 !== stream.end && stream.end !== 1 / 0 && void 0 !== stream.start ? cb(stream.end + 1 - (stream.start || 0)) : fs.stat(stream.path, (function(err, stat) {
                    cb(stat ? stat.size - (stream.start || 0) : null);
                }));
            })(data, config.stream_length, (function(length) {
                data.length = length, next(data);
            }))) : body = data;
        } else Buffer.isBuffer(data) ? body = data : "GET" != method.toUpperCase() || json ? (body = "string" == typeof data ? data : json ? JSON.stringify(data) : stringify(data), 
        body = new Buffer(body, config.encoding)) : uri = uri.replace(/\?.*|$/, "?" + stringify(data));
        function next(body) {
            body && (body.length && (config.headers["content-length"] = body.length), config.headers["content-type"] || (config.headers["content-type"] = json ? "application/json; charset=utf-8" : "application/x-www-form-urlencoded")), 
            !options.json || options.accept || (options.headers || {}).accept || (config.headers.accept = "application/json"), 
            self.send_request(1, method, uri, config, body, out, callback);
        }
        return waiting || next(body), out;
    }, Needle.prototype.get_request_opts = function(method, uri, config) {
        var opts = config.http_opts, proxy = config.proxy, remote = proxy ? url.parse(proxy) : url.parse(uri);
        if (opts.protocol = remote.protocol, opts.host = remote.hostname, opts.port = remote.port || ("https:" == remote.protocol ? 443 : 80), 
        opts.path = proxy ? uri : remote.pathname + (remote.search || ""), opts.method = method, 
        opts.headers = config.headers, !opts.headers.host) {
            var target = proxy ? url.parse(uri) : remote;
            opts.headers.host = target.hostname, target.port && -1 === [ 80, 443 ].indexOf(target.port) && (opts.headers.host += ":" + target.port);
        }
        return opts;
    }, Needle.prototype.should_follow = function(location, config, original) {
        if (!location) return !1;
        function matches(property) {
            return property = original[property], -1 !== location.indexOf(property);
        }
        return !(location === original || config.follow_if_same_host && !matches("host") || config.follow_if_same_protocol && !matches("protocol"));
    }, Needle.prototype.send_request = function(count, method, uri, config, post_data, out, callback) {
        var timer, returned = 0, self = this, request_opts = this.get_request_opts(method, uri, config), protocol = "https:" == request_opts.protocol ? https : http;
        function done(err, resp) {
            return returned++ > 0 ? debug("Already finished, stopping here.") : (timer && clearTimeout(timer), 
            request.removeListener("error", had_error), callback ? callback(err, resp, resp ? resp.body : void 0) : void out.emit("done", err));
        }
        function had_error(err) {
            debug("Request error", err), out.emit("err", err), done(err || new Error("Unknown error when making request."));
        }
        function set_timeout(type, milisecs) {
            milisecs <= 0 || (timer = setTimeout((function() {
                out.emit("timeout", type), request.abort();
            }), milisecs));
        }
        function on_socket_end() {
            this.writable || !1 !== this.destroyed || (this.destroy(), had_error(new Error("Remote end closed socket abruptly.")));
        }
        debug("Making request #" + count, request_opts);
        var request = protocol.request(request_opts, (function(resp) {
            var headers = resp.headers;
            if (debug("Got response", resp.statusCode, headers), out.emit("response", resp), 
            timer && clearTimeout(timer), set_timeout("read", config.read_timeout), config.parse_cookies && (headers["set-cookie"] || config.stored_cookies) && (resp.cookies = extend(config.stored_cookies || {}, cookies.read(headers["set-cookie"])), 
            debug("Got cookies", resp.cookies)), -1 !== redirect_codes.indexOf(resp.statusCode) && self.should_follow(headers.location, config, uri)) {
                if (count <= config.follow_max) return out.emit("redirect", headers.location), config.follow_keep_method || (method = "GET", 
                post_data = null, delete config.headers["content-length"]), config.follow_set_cookies && resp.cookies && (config.stored_cookies = resp.cookies, 
                config.headers.cookie = cookies.write(resp.cookies)), config.follow_set_referer && (config.headers.referer = uri), 
                config.headers.host = null, debug("Redirecting to " + url.resolve(uri, headers.location)), 
                self.send_request(++count, method, url.resolve(uri, headers.location), config, post_data, out, callback);
                if (config.follow_max > 0) return done(new Error("Max redirects reached. Possible loop in: " + headers.location));
            }
            if (401 == resp.statusCode && headers["www-authenticate"] && config.credentials && !config.headers.authorization) {
                var auth_header = auth.header(headers["www-authenticate"], config.credentials, request_opts);
                if (auth_header) return config.headers.authorization = auth_header, self.send_request(count, method, uri, config, post_data, out, callback);
            }
            out.emit("header", resp.statusCode, headers), out.emit("headers", headers);
            var pipeline = [], mime = (function(header) {
                if (!header || "" === header) return {};
                var charset = "iso-8859-1", arr = header.split(";");
                try {
                    charset = arr[1].match(/charset=(.+)/)[1];
                } catch (e) {}
                return {
                    type: arr[0],
                    charset: charset
                };
            })(headers["content-type"]), text_response = mime.type && -1 != mime.type.indexOf("text/");
            if (headers["content-encoding"] && decompressors[headers["content-encoding"]]) {
                var decompressor = decompressors[headers["content-encoding"]](zlib_options);
                decompressor.on("error", had_error), pipeline.push(decompressor);
            }
            if (config.parser && parsers[mime.type]) {
                var parser_name = config.parser.toString().toLowerCase();
                -1 != [ "xml", "json" ].indexOf(parser_name) && parsers[mime.type].name != parser_name || (out.parser = parsers[mime.type].name, 
                pipeline.push(parsers[mime.type].fn()), out._writableState.objectMode = !0, out._readableState.objectMode = !0);
            } else text_response && config.decode_response && mime.charset && !mime.charset.match(/utf-?8$/i) && pipeline.push(decoder(mime.charset));
            pipeline.push(out);
            for (var tmp = resp; pipeline.length; ) tmp = tmp.pipe(pipeline.shift());
            if (config.output && 200 == resp.statusCode) {
                var file = fs.createWriteStream(config.output);
                file.on("error", had_error), out.on("end", (function() {
                    file.writable && file.end();
                })), file.on("close", (function() {
                    delete out.file;
                })), out.on("readable", (function() {
                    for (var chunk; null !== (chunk = this.read()); ) file.writable && file.write(chunk), 
                    resp.body && resp.body.push(chunk);
                })), out.file = file;
            }
            if (callback) {
                resp.raw = [], resp.body = [], resp.bytes = 0;
                var clean_pipe = new stream.PassThrough;
                resp.pipe(clean_pipe), clean_pipe.on("readable", (function() {
                    for (var chunk; null != (chunk = this.read()); ) resp.bytes += chunk.length, resp.raw.push(chunk);
                })), config.output && 200 == resp.statusCode || out.on("readable", (function() {
                    for (var chunk; null !== (chunk = this.read()); ) "string" == typeof chunk && (chunk = new Buffer(chunk)), 
                    resp.body.push(chunk);
                })), out.on("end", (function() {
                    resp.raw = Buffer.concat(resp.raw), void 0 === resp.body[0] || Buffer.isBuffer(resp.body[0]) ? (resp.body = Buffer.concat(resp.body), 
                    (text_response || out.parser) && (resp.body = resp.body.toString())) : (resp.body = resp.body[0], 
                    out.parser && (resp.parser = out.parser)), out.file ? out.file.on("close", (function() {
                        done(null, resp, resp.body);
                    })) : done(null, resp, resp.body);
                }));
            }
        }));
        return set_timeout("open", config.open_timeout), request.on("error", had_error), 
        request.once("socket", (function(socket) {
            socket.on_socket_end || (socket.on_socket_end = on_socket_end, socket.on("end", socket.on_socket_end));
        })), post_data ? is_stream(post_data) ? post_data.pipe(request) : (request.write(post_data, config.encoding), 
        request.end()) : request.end(), out.request = request, out;
    }, exports.version = version, exports.defaults = function(obj) {
        for (var key in obj) {
            var target_key = aliased.options[key] || key;
            if (defaults.hasOwnProperty(target_key) && void 0 !== obj[key]) {
                if ("parse_response" != target_key && "proxy" != target_key) {
                    var valid_type = defaults[target_key].constructor.name;
                    if (obj[key].constructor.name != valid_type) throw new TypeError("Invalid type for " + key + ", should be " + valid_type);
                }
                defaults[target_key] = obj[key];
            }
        }
        return defaults;
    }, "head get".split(" ").forEach((function(method) {
        exports[method] = function(uri, options, callback) {
            return new Needle(method, uri, null, options, callback).start();
        };
    })), "post put patch delete".split(" ").forEach((function(method) {
        exports[method] = function(uri, data, options, callback) {
            return new Needle(method, uri, data, options, callback).start();
        };
    })), exports.request = function(method, uri, data, opts, callback) {
        return new Needle(method, uri, data, opts, callback).start();
    };
}
