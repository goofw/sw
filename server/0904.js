function(module, exports, __webpack_require__) {
    "use strict";
    var MissingRefError = __webpack_require__(239).MissingRef;
    module.exports = function compileAsync(schema, meta, callback) {
        var self = this;
        if ("function" != typeof this._opts.loadSchema) throw new Error("options.loadSchema should be a function");
        "function" == typeof meta && (callback = meta, meta = void 0);
        var p = loadMetaSchemaOf(schema).then((function() {
            var schemaObj = self._addSchema(schema, void 0, meta);
            return schemaObj.validate || _compileAsync(schemaObj);
        }));
        return callback && p.then((function(v) {
            callback(null, v);
        }), callback), p;
        function loadMetaSchemaOf(sch) {
            var $schema = sch.$schema;
            return $schema && !self.getSchema($schema) ? compileAsync.call(self, {
                $ref: $schema
            }, !0) : Promise.resolve();
        }
        function _compileAsync(schemaObj) {
            try {
                return self._compile(schemaObj);
            } catch (e) {
                if (e instanceof MissingRefError) return (function(e) {
                    var ref = e.missingSchema;
                    if (added(ref)) throw new Error("Schema " + ref + " is loaded but " + e.missingRef + " cannot be resolved");
                    var schemaPromise = self._loadingSchemas[ref];
                    return schemaPromise || (schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref)).then(removePromise, removePromise), 
                    schemaPromise.then((function(sch) {
                        if (!added(ref)) return loadMetaSchemaOf(sch).then((function() {
                            added(ref) || self.addSchema(sch, ref, void 0, meta);
                        }));
                    })).then((function() {
                        return _compileAsync(schemaObj);
                    }));
                    function removePromise() {
                        delete self._loadingSchemas[ref];
                    }
                    function added(ref) {
                        return self._refs[ref] || self._schemas[ref];
                    }
                })(e);
                throw e;
            }
        }
    };
}
