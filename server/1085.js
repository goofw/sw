function(module, exports, __webpack_require__) {
    "use strict";
    var traverse = module.exports = function(schema, opts, cb) {
        "function" == typeof opts && (cb = opts, opts = {}), _traverse(opts, "function" == typeof (cb = opts.cb || cb) ? cb : cb.pre || function() {}, cb.post || function() {}, schema, "", schema);
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
        if (schema && "object" == typeof schema && !Array.isArray(schema)) {
            for (var key in pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex), 
            schema) {
                var sch = schema[key];
                if (Array.isArray(sch)) {
                    if (key in traverse.arrayKeywords) for (var i = 0; i < sch.length; i++) _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
                } else if (key in traverse.propsKeywords) {
                    if (sch && "object" == typeof sch) for (var prop in sch) _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + prop.replace(/~/g, "~0").replace(/\//g, "~1"), rootSchema, jsonPtr, key, schema, prop);
                } else (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) && _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
            }
            post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        }
    }
    traverse.keywords = {
        additionalItems: !0,
        items: !0,
        contains: !0,
        additionalProperties: !0,
        propertyNames: !0,
        not: !0
    }, traverse.arrayKeywords = {
        items: !0,
        allOf: !0,
        anyOf: !0,
        oneOf: !0
    }, traverse.propsKeywords = {
        definitions: !0,
        properties: !0,
        patternProperties: !0,
        dependencies: !0
    }, traverse.skipKeywords = {
        default: !0,
        enum: !0,
        const: !0,
        required: !0,
        maximum: !0,
        minimum: !0,
        exclusiveMaximum: !0,
        exclusiveMinimum: !0,
        multipleOf: !0,
        maxLength: !0,
        minLength: !0,
        pattern: !0,
        format: !0,
        maxItems: !0,
        minItems: !0,
        uniqueItems: !0,
        maxProperties: !0,
        minProperties: !0
    };
}
