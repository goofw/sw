function(module, exports, __webpack_require__) {
    "use strict";
    var URI = __webpack_require__(1083), equal = __webpack_require__(238), util = __webpack_require__(80), SchemaObject = __webpack_require__(496), traverse = __webpack_require__(1085);
    function resolve(compile, root, ref) {
        var refVal = this._refs[ref];
        if ("string" == typeof refVal) {
            if (!this._refs[refVal]) return resolve.call(this, compile, root, refVal);
            refVal = this._refs[refVal];
        }
        if ((refVal = refVal || this._schemas[ref]) instanceof SchemaObject) return inlineRef(refVal.schema, this._opts.inlineRefs) ? refVal.schema : refVal.validate || this._compile(refVal);
        var schema, v, baseId, res = resolveSchema.call(this, root, ref);
        return res && (schema = res.schema, root = res.root, baseId = res.baseId), schema instanceof SchemaObject ? v = schema.validate || compile.call(this, schema.schema, root, void 0, baseId) : void 0 !== schema && (v = inlineRef(schema, this._opts.inlineRefs) ? schema : compile.call(this, schema, root, void 0, baseId)), 
        v;
    }
    function resolveSchema(root, ref) {
        var p = URI.parse(ref), refPath = _getFullPath(p), baseId = getFullPath(this._getId(root.schema));
        if (0 === Object.keys(root.schema).length || refPath !== baseId) {
            var id = normalizeId(refPath), refVal = this._refs[id];
            if ("string" == typeof refVal) return resolveRecursive.call(this, root, refVal, p);
            if (refVal instanceof SchemaObject) refVal.validate || this._compile(refVal), root = refVal; else {
                if (!((refVal = this._schemas[id]) instanceof SchemaObject)) return;
                if (refVal.validate || this._compile(refVal), id == normalizeId(ref)) return {
                    schema: refVal,
                    root: root,
                    baseId: baseId
                };
                root = refVal;
            }
            if (!root.schema) return;
            baseId = getFullPath(this._getId(root.schema));
        }
        return getJsonPointer.call(this, p, baseId, root.schema, root);
    }
    function resolveRecursive(root, ref, parsedRef) {
        var res = resolveSchema.call(this, root, ref);
        if (res) {
            var schema = res.schema, baseId = res.baseId;
            root = res.root;
            var id = this._getId(schema);
            return id && (baseId = resolveUrl(baseId, id)), getJsonPointer.call(this, parsedRef, baseId, schema, root);
        }
    }
    module.exports = resolve, resolve.normalizeId = normalizeId, resolve.fullPath = getFullPath, 
    resolve.url = resolveUrl, resolve.ids = function(schema) {
        var schemaId = normalizeId(this._getId(schema)), baseIds = {
            "": schemaId
        }, fullPaths = {
            "": getFullPath(schemaId, !1)
        }, localRefs = {}, self = this;
        return traverse(schema, {
            allKeys: !0
        }, (function(sch, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
            if ("" !== jsonPtr) {
                var id = self._getId(sch), baseId = baseIds[parentJsonPtr], fullPath = fullPaths[parentJsonPtr] + "/" + parentKeyword;
                if (void 0 !== keyIndex && (fullPath += "/" + ("number" == typeof keyIndex ? keyIndex : util.escapeFragment(keyIndex))), 
                "string" == typeof id) {
                    id = baseId = normalizeId(baseId ? URI.resolve(baseId, id) : id);
                    var refVal = self._refs[id];
                    if ("string" == typeof refVal && (refVal = self._refs[refVal]), refVal && refVal.schema) {
                        if (!equal(sch, refVal.schema)) throw new Error('id "' + id + '" resolves to more than one schema');
                    } else if (id != normalizeId(fullPath)) if ("#" == id[0]) {
                        if (localRefs[id] && !equal(sch, localRefs[id])) throw new Error('id "' + id + '" resolves to more than one schema');
                        localRefs[id] = sch;
                    } else self._refs[id] = fullPath;
                }
                baseIds[jsonPtr] = baseId, fullPaths[jsonPtr] = fullPath;
            }
        })), localRefs;
    }, resolve.inlineRef = inlineRef, resolve.schema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = util.toHash([ "properties", "patternProperties", "enum", "dependencies", "definitions" ]);
    function getJsonPointer(parsedRef, baseId, schema, root) {
        if (parsedRef.fragment = parsedRef.fragment || "", "/" == parsedRef.fragment.slice(0, 1)) {
            for (var parts = parsedRef.fragment.split("/"), i = 1; i < parts.length; i++) {
                var part = parts[i];
                if (part) {
                    if (void 0 === (schema = schema[part = util.unescapeFragment(part)])) break;
                    var id;
                    if (!PREVENT_SCOPE_CHANGE[part] && ((id = this._getId(schema)) && (baseId = resolveUrl(baseId, id)), 
                    schema.$ref)) {
                        var $ref = resolveUrl(baseId, schema.$ref), res = resolveSchema.call(this, root, $ref);
                        res && (schema = res.schema, root = res.root, baseId = res.baseId);
                    }
                }
            }
            return void 0 !== schema && schema !== root.schema ? {
                schema: schema,
                root: root,
                baseId: baseId
            } : void 0;
        }
    }
    var SIMPLE_INLINED = util.toHash([ "type", "format", "pattern", "maxLength", "minLength", "maxProperties", "minProperties", "maxItems", "minItems", "maximum", "minimum", "uniqueItems", "multipleOf", "required", "enum" ]);
    function inlineRef(schema, limit) {
        return !1 !== limit && (void 0 === limit || !0 === limit ? checkNoRef(schema) : limit ? countKeys(schema) <= limit : void 0);
    }
    function checkNoRef(schema) {
        var item;
        if (Array.isArray(schema)) {
            for (var i = 0; i < schema.length; i++) if ("object" == typeof (item = schema[i]) && !checkNoRef(item)) return !1;
        } else for (var key in schema) {
            if ("$ref" == key) return !1;
            if ("object" == typeof (item = schema[key]) && !checkNoRef(item)) return !1;
        }
        return !0;
    }
    function countKeys(schema) {
        var item, count = 0;
        if (Array.isArray(schema)) {
            for (var i = 0; i < schema.length; i++) if ("object" == typeof (item = schema[i]) && (count += countKeys(item)), 
            count == 1 / 0) return 1 / 0;
        } else for (var key in schema) {
            if ("$ref" == key) return 1 / 0;
            if (SIMPLE_INLINED[key]) count++; else if ("object" == typeof (item = schema[key]) && (count += countKeys(item) + 1), 
            count == 1 / 0) return 1 / 0;
        }
        return count;
    }
    function getFullPath(id, normalize) {
        return !1 !== normalize && (id = normalizeId(id)), _getFullPath(URI.parse(id));
    }
    function _getFullPath(p) {
        return URI.serialize(p).split("#")[0] + "#";
    }
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
        return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    function resolveUrl(baseId, id) {
        return id = normalizeId(id), URI.resolve(baseId, id);
    }
}
