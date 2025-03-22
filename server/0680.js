function(module, exports, __webpack_require__) {
    var readFile = __webpack_require__(2).readFile, basename = __webpack_require__(4).basename;
    function generate_part(name, part, boundary, callback) {
        var return_part = "--" + boundary + "\r\n";
        function append(data, filename) {
            if (data) {
                var binary = -1 == part.content_type.indexOf("text");
                return_part += '; filename="' + encodeURIComponent(filename) + '"\r\n', binary && (return_part += "Content-Transfer-Encoding: binary\r\n"), 
                return_part += "Content-Type: " + part.content_type + "\r\n\r\n", return_part += binary ? data.toString("binary") : data.toString("utf8");
            }
            callback(null, return_part + "\r\n");
        }
        if (return_part += 'Content-Disposition: form-data; name="' + name + '"', (part.file || part.buffer) && part.content_type) {
            var filename = part.filename ? part.filename : part.file ? basename(part.file) : name;
            if (part.buffer) return append(part.buffer, filename);
            readFile(part.file, (function(err, data) {
                if (err) return callback(err);
                append(data, filename);
            }));
        } else {
            if ("object" == typeof part.value) return callback(new Error("Object received for " + name + ", expected string."));
            part.content_type && (return_part += "\r\n", return_part += "Content-Type: " + part.content_type), 
            return_part += "\r\n\r\n", return_part += new Buffer(String(part.value), "utf8").toString("binary"), 
            append();
        }
    }
    function flatten(object, into, prefix) {
        for (var key in into = into || {}, object) {
            var prefix_key = prefix ? prefix + "[" + key + "]" : key, prop = object[key];
            prop && "object" == typeof prop && !(prop.buffer || prop.file || prop.content_type) ? flatten(prop, into, prefix_key) : into[prefix_key] = prop;
        }
        return into;
    }
    exports.build = function(data, boundary, callback) {
        if ("object" != typeof data || "function" == typeof data.pipe) return callback(new Error("Multipart builder expects data as key/val object."));
        var body = "", object = flatten(data), count = Object.keys(object).length;
        if (0 === count) return callback(new Error("Empty multipart body. Invalid data."));
        function done(err, section) {
            if (err) return callback(err);
            section && (body += section), --count || callback(null, body + "--" + boundary + "--");
        }
        for (var key in object) {
            var value = object[key];
            null == value ? done() : generate_part(key, value.buffer || value.file || value.content_type ? value : {
                value: value
            }, boundary, done);
        }
    };
}
