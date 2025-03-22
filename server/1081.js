function(module, exports, __webpack_require__) {
    "use strict";
    var compileSchema = __webpack_require__(1082), resolve = __webpack_require__(237), Cache = __webpack_require__(1086), SchemaObject = __webpack_require__(496), stableStringify = __webpack_require__(497), formats = __webpack_require__(1087), rules = __webpack_require__(1088), $dataMetaSchema = __webpack_require__(1109), util = __webpack_require__(80);
    module.exports = Ajv, Ajv.prototype.validate = function(schemaKeyRef, data) {
        var v;
        if ("string" == typeof schemaKeyRef) {
            if (!(v = this.getSchema(schemaKeyRef))) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
        } else {
            var schemaObj = this._addSchema(schemaKeyRef);
            v = schemaObj.validate || this._compile(schemaObj);
        }
        var valid = v(data);
        return !0 !== v.$async && (this.errors = v.errors), valid;
    }, Ajv.prototype.compile = function(schema, _meta) {
        var schemaObj = this._addSchema(schema, void 0, _meta);
        return schemaObj.validate || this._compile(schemaObj);
    }, Ajv.prototype.addSchema = function(schema, key, _skipValidation, _meta) {
        if (Array.isArray(schema)) {
            for (var i = 0; i < schema.length; i++) this.addSchema(schema[i], void 0, _skipValidation, _meta);
            return this;
        }
        var id = this._getId(schema);
        if (void 0 !== id && "string" != typeof id) throw new Error("schema id must be string");
        return checkUnique(this, key = resolve.normalizeId(key || id)), this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, !0), 
        this;
    }, Ajv.prototype.addMetaSchema = function(schema, key, skipValidation) {
        return this.addSchema(schema, key, skipValidation, !0), this;
    }, Ajv.prototype.validateSchema = function(schema, throwOrLogError) {
        var $schema = schema.$schema;
        if (void 0 !== $schema && "string" != typeof $schema) throw new Error("$schema must be a string");
        if (!($schema = $schema || this._opts.defaultMeta || (function(self) {
            var meta = self._opts.meta;
            return self._opts.defaultMeta = "object" == typeof meta ? self._getId(meta) || meta : self.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0, 
            self._opts.defaultMeta;
        })(this))) return this.logger.warn("meta-schema not available"), this.errors = null, 
        !0;
        var valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
            var message = "schema is invalid: " + this.errorsText();
            if ("log" != this._opts.validateSchema) throw new Error(message);
            this.logger.error(message);
        }
        return valid;
    }, Ajv.prototype.getSchema = function(keyRef) {
        var schemaObj = _getSchemaObj(this, keyRef);
        switch (typeof schemaObj) {
          case "object":
            return schemaObj.validate || this._compile(schemaObj);

          case "string":
            return this.getSchema(schemaObj);

          case "undefined":
            return (function(self, ref) {
                var res = resolve.schema.call(self, {
                    schema: {}
                }, ref);
                if (res) {
                    var schema = res.schema, root = res.root, baseId = res.baseId, v = compileSchema.call(self, schema, root, void 0, baseId);
                    return self._fragments[ref] = new SchemaObject({
                        ref: ref,
                        fragment: !0,
                        schema: schema,
                        root: root,
                        baseId: baseId,
                        validate: v
                    }), v;
                }
            })(this, keyRef);
        }
    }, Ajv.prototype.removeSchema = function(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) return _removeAllSchemas(this, this._schemas, schemaKeyRef), 
        _removeAllSchemas(this, this._refs, schemaKeyRef), this;
        switch (typeof schemaKeyRef) {
          case "undefined":
            return _removeAllSchemas(this, this._schemas), _removeAllSchemas(this, this._refs), 
            this._cache.clear(), this;

          case "string":
            var schemaObj = _getSchemaObj(this, schemaKeyRef);
            return schemaObj && this._cache.del(schemaObj.cacheKey), delete this._schemas[schemaKeyRef], 
            delete this._refs[schemaKeyRef], this;

          case "object":
            var serialize = this._opts.serialize, cacheKey = serialize ? serialize(schemaKeyRef) : schemaKeyRef;
            this._cache.del(cacheKey);
            var id = this._getId(schemaKeyRef);
            id && (id = resolve.normalizeId(id), delete this._schemas[id], delete this._refs[id]);
        }
        return this;
    }, Ajv.prototype.addFormat = function(name, format) {
        return "string" == typeof format && (format = new RegExp(format)), this._formats[name] = format, 
        this;
    }, Ajv.prototype.errorsText = function(errors, options) {
        if (!(errors = errors || this.errors)) return "No errors";
        for (var separator = void 0 === (options = options || {}).separator ? ", " : options.separator, dataVar = void 0 === options.dataVar ? "data" : options.dataVar, text = "", i = 0; i < errors.length; i++) {
            var e = errors[i];
            e && (text += dataVar + e.dataPath + " " + e.message + separator);
        }
        return text.slice(0, -separator.length);
    }, Ajv.prototype._addSchema = function(schema, skipValidation, meta, shouldAddSchema) {
        if ("object" != typeof schema && "boolean" != typeof schema) throw new Error("schema should be object or boolean");
        var serialize = this._opts.serialize, cacheKey = serialize ? serialize(schema) : schema, cached = this._cache.get(cacheKey);
        if (cached) return cached;
        shouldAddSchema = shouldAddSchema || !1 !== this._opts.addUsedSchema;
        var id = resolve.normalizeId(this._getId(schema));
        id && shouldAddSchema && checkUnique(this, id);
        var recursiveMeta, willValidate = !1 !== this._opts.validateSchema && !skipValidation;
        willValidate && !(recursiveMeta = id && id == resolve.normalizeId(schema.$schema)) && this.validateSchema(schema, !0);
        var localRefs = resolve.ids.call(this, schema), schemaObj = new SchemaObject({
            id: id,
            schema: schema,
            localRefs: localRefs,
            cacheKey: cacheKey,
            meta: meta
        });
        return "#" != id[0] && shouldAddSchema && (this._refs[id] = schemaObj), this._cache.put(cacheKey, schemaObj), 
        willValidate && recursiveMeta && this.validateSchema(schema, !0), schemaObj;
    }, Ajv.prototype._compile = function(schemaObj, root) {
        if (schemaObj.compiling) return schemaObj.validate = callValidate, callValidate.schema = schemaObj.schema, 
        callValidate.errors = null, callValidate.root = root || callValidate, !0 === schemaObj.schema.$async && (callValidate.$async = !0), 
        callValidate;
        var currentOpts, v;
        schemaObj.compiling = !0, schemaObj.meta && (currentOpts = this._opts, this._opts = this._metaOpts);
        try {
            v = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs);
        } catch (e) {
            throw delete schemaObj.validate, e;
        } finally {
            schemaObj.compiling = !1, schemaObj.meta && (this._opts = currentOpts);
        }
        return schemaObj.validate = v, schemaObj.refs = v.refs, schemaObj.refVal = v.refVal, 
        schemaObj.root = v.root, v;
        function callValidate() {
            var _validate = schemaObj.validate, result = _validate.apply(this, arguments);
            return callValidate.errors = _validate.errors, result;
        }
    }, Ajv.prototype.compileAsync = __webpack_require__(1110);
    var customKeyword = __webpack_require__(1111);
    Ajv.prototype.addKeyword = customKeyword.add, Ajv.prototype.getKeyword = customKeyword.get, 
    Ajv.prototype.removeKeyword = customKeyword.remove, Ajv.prototype.validateKeyword = customKeyword.validate;
    var errorClasses = __webpack_require__(239);
    Ajv.ValidationError = errorClasses.Validation, Ajv.MissingRefError = errorClasses.MissingRef, 
    Ajv.$dataMetaSchema = $dataMetaSchema;
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema", META_IGNORE_OPTIONS = [ "removeAdditional", "useDefaults", "coerceTypes", "strictDefaults" ], META_SUPPORT_DATA = [ "/properties" ];
    function Ajv(opts) {
        if (!(this instanceof Ajv)) return new Ajv(opts);
        opts = this._opts = util.copy(opts) || {}, (function(self) {
            var logger = self._opts.logger;
            if (!1 === logger) self.logger = {
                log: noop,
                warn: noop,
                error: noop
            }; else {
                if (void 0 === logger && (logger = console), !("object" == typeof logger && logger.log && logger.warn && logger.error)) throw new Error("logger must implement log, warn and error methods");
                self.logger = logger;
            }
        })(this), this._schemas = {}, this._refs = {}, this._fragments = {}, this._formats = formats(opts.format), 
        this._cache = opts.cache || new Cache, this._loadingSchemas = {}, this._compilations = [], 
        this.RULES = rules(), this._getId = (function(opts) {
            switch (opts.schemaId) {
              case "auto":
                return _get$IdOrId;

              case "id":
                return _getId;

              default:
                return _get$Id;
            }
        })(opts), opts.loopRequired = opts.loopRequired || 1 / 0, "property" == opts.errorDataPath && (opts._errorDataPathProperty = !0), 
        void 0 === opts.serialize && (opts.serialize = stableStringify), this._metaOpts = (function(self) {
            for (var metaOpts = util.copy(self._opts), i = 0; i < META_IGNORE_OPTIONS.length; i++) delete metaOpts[META_IGNORE_OPTIONS[i]];
            return metaOpts;
        })(this), opts.formats && (function(self) {
            for (var name in self._opts.formats) {
                var format = self._opts.formats[name];
                self.addFormat(name, format);
            }
        })(this), (function(self) {
            var $dataSchema;
            if (self._opts.$data && ($dataSchema = __webpack_require__(1113), self.addMetaSchema($dataSchema, $dataSchema.$id, !0)), 
            !1 !== self._opts.meta) {
                var metaSchema = __webpack_require__(503);
                self._opts.$data && (metaSchema = $dataMetaSchema(metaSchema, META_SUPPORT_DATA)), 
                self.addMetaSchema(metaSchema, META_SCHEMA_ID, !0), self._refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
            }
        })(this), "object" == typeof opts.meta && this.addMetaSchema(opts.meta), opts.nullable && this.addKeyword("nullable", {
            metaSchema: {
                type: "boolean"
            }
        }), (function(self) {
            var optsSchemas = self._opts.schemas;
            if (optsSchemas) if (Array.isArray(optsSchemas)) self.addSchema(optsSchemas); else for (var key in optsSchemas) self.addSchema(optsSchemas[key], key);
        })(this);
    }
    function _getSchemaObj(self, keyRef) {
        return keyRef = resolve.normalizeId(keyRef), self._schemas[keyRef] || self._refs[keyRef] || self._fragments[keyRef];
    }
    function _removeAllSchemas(self, schemas, regex) {
        for (var keyRef in schemas) {
            var schemaObj = schemas[keyRef];
            schemaObj.meta || regex && !regex.test(keyRef) || (self._cache.del(schemaObj.cacheKey), 
            delete schemas[keyRef]);
        }
    }
    function _getId(schema) {
        return schema.$id && this.logger.warn("schema $id ignored", schema.$id), schema.id;
    }
    function _get$Id(schema) {
        return schema.id && this.logger.warn("schema id ignored", schema.id), schema.$id;
    }
    function _get$IdOrId(schema) {
        if (schema.$id && schema.id && schema.$id != schema.id) throw new Error("schema $id is different from id");
        return schema.$id || schema.id;
    }
    function checkUnique(self, id) {
        if (self._schemas[id] || self._refs[id]) throw new Error('schema with key or id "' + id + '" already exists');
    }
    function noop() {}
}
