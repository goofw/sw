function(module, exports, __webpack_require__) {
    var Transform = __webpack_require__(3).Transform;
    function parserFactory(name, fn) {
        return {
            fn: function() {
                var chunks = [], stream = new Transform({
                    objectMode: !0
                });
                return stream._transform = function(chunk, encoding, done) {
                    chunks.push(chunk), done();
                }, stream._flush = function(done) {
                    var self = this, data = Buffer.concat(chunks);
                    try {
                        fn(data, (function(err, result) {
                            if (err) throw err;
                            self.push(result);
                        }));
                    } catch (err) {
                        self.push(data);
                    } finally {
                        done();
                    }
                }, stream;
            },
            name: name
        };
    }
    var json = parserFactory("json", (function(buffer, cb) {
        var err, data;
        try {
            data = JSON.parse(buffer);
        } catch (e) {
            err = e;
        }
        cb(err, data);
    }));
    module.exports["application/json"] = json, module.exports["text/javascript"] = json;
    try {
        var xml = parserFactory("xml", new (__webpack_require__(172).Parser)({
            explicitRoot: !0,
            explicitArray: !1
        }).parseString);
        module.exports["text/xml"] = xml, module.exports["application/xml"] = xml, module.exports["application/rdf+xml"] = xml, 
        module.exports["application/rss+xml"] = xml, module.exports["application/atom+xml"] = xml;
    } catch (e) {}
}
