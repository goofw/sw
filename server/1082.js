function(module, exports, __webpack_require__) {
    "use strict";
    var resolve = __webpack_require__(237), util = __webpack_require__(80), errorClasses = __webpack_require__(239), stableStringify = __webpack_require__(497), validateGenerator = __webpack_require__(498), ucs2length = util.ucs2length, equal = __webpack_require__(238), ValidationError = errorClasses.Validation;
    function checkCompiling(schema, root, baseId) {
        var index = compIndex.call(this, schema, root, baseId);
        return index >= 0 ? {
            index: index,
            compiling: !0
        } : (index = this._compilations.length, this._compilations[index] = {
            schema: schema,
            root: root,
            baseId: baseId
        }, {
            index: index,
            compiling: !1
        });
    }
    function endCompiling(schema, root, baseId) {
        var i = compIndex.call(this, schema, root, baseId);
        i >= 0 && this._compilations.splice(i, 1);
    }
    function compIndex(schema, root, baseId) {
        for (var i = 0; i < this._compilations.length; i++) {
            var c = this._compilations[i];
            if (c.schema == schema && c.root == root && c.baseId == baseId) return i;
        }
        return -1;
    }
    function patternCode(i, patterns) {
        return "var pattern" + i + " = new RegExp(" + util.toQuotedString(patterns[i]) + ");";
    }
    function defaultCode(i) {
        return "var default" + i + " = defaults[" + i + "];";
    }
    function refValCode(i, refVal) {
        return void 0 === refVal[i] ? "" : "var refVal" + i + " = refVal[" + i + "];";
    }
    function customRuleCode(i) {
        return "var customRule" + i + " = customRules[" + i + "];";
    }
    function vars(arr, statement) {
        if (!arr.length) return "";
        for (var code = "", i = 0; i < arr.length; i++) code += statement(i, arr);
        return code;
    }
    module.exports = function compile(schema, root, localRefs, baseId) {
        var self = this, opts = this._opts, refVal = [ void 0 ], refs = {}, patterns = [], patternsHash = {}, defaults = [], defaultsHash = {}, customRules = [];
        root = root || {
            schema: schema,
            refVal: refVal,
            refs: refs
        };
        var c = checkCompiling.call(this, schema, root, baseId), compilation = this._compilations[c.index];
        if (c.compiling) return compilation.callValidate = function callValidate() {
            var validate = compilation.validate, result = validate.apply(this, arguments);
            return callValidate.errors = validate.errors, result;
        };
        var formats = this._formats, RULES = this.RULES;
        try {
            var v = localCompile(schema, root, localRefs, baseId);
            compilation.validate = v;
            var cv = compilation.callValidate;
            return cv && (cv.schema = v.schema, cv.errors = null, cv.refs = v.refs, cv.refVal = v.refVal, 
            cv.root = v.root, cv.$async = v.$async, opts.sourceCode && (cv.source = v.source)), 
            v;
        } finally {
            endCompiling.call(this, schema, root, baseId);
        }
        function localCompile(_schema, _root, localRefs, baseId) {
            var isRoot = !_root || _root && _root.schema == _schema;
            if (_root.schema != root.schema) return compile.call(self, _schema, _root, localRefs, baseId);
            var validate, $async = !0 === _schema.$async, sourceCode = validateGenerator({
                isTop: !0,
                schema: _schema,
                isRoot: isRoot,
                baseId: baseId,
                root: _root,
                schemaPath: "",
                errSchemaPath: "#",
                errorPath: '""',
                MissingRefError: errorClasses.MissingRef,
                RULES: RULES,
                validate: validateGenerator,
                util: util,
                resolve: resolve,
                resolveRef: resolveRef,
                usePattern: usePattern,
                useDefault: useDefault,
                useCustomRule: useCustomRule,
                opts: opts,
                formats: formats,
                logger: self.logger,
                self: self
            });
            sourceCode = vars(refVal, refValCode) + vars(patterns, patternCode) + vars(defaults, defaultCode) + vars(customRules, customRuleCode) + sourceCode, 
            opts.processCode && (sourceCode = opts.processCode(sourceCode));
            try {
                validate = new Function("self", "RULES", "formats", "root", "refVal", "defaults", "customRules", "equal", "ucs2length", "ValidationError", sourceCode)(self, RULES, formats, root, refVal, defaults, customRules, equal, ucs2length, ValidationError), 
                refVal[0] = validate;
            } catch (e) {
                throw self.logger.error("Error compiling schema, function code:", sourceCode), e;
            }
            return validate.schema = _schema, validate.errors = null, validate.refs = refs, 
            validate.refVal = refVal, validate.root = isRoot ? validate : _root, $async && (validate.$async = !0), 
            !0 === opts.sourceCode && (validate.source = {
                code: sourceCode,
                patterns: patterns,
                defaults: defaults
            }), validate;
        }
        function resolveRef(baseId, ref, isRoot) {
            ref = resolve.url(baseId, ref);
            var _refVal, refCode, refIndex = refs[ref];
            if (void 0 !== refIndex) return resolvedRef(_refVal = refVal[refIndex], refCode = "refVal[" + refIndex + "]");
            if (!isRoot && root.refs) {
                var rootRefId = root.refs[ref];
                if (void 0 !== rootRefId) return resolvedRef(_refVal = root.refVal[rootRefId], refCode = addLocalRef(ref, _refVal));
            }
            refCode = addLocalRef(ref);
            var v = resolve.call(self, localCompile, root, ref);
            if (void 0 === v) {
                var localSchema = localRefs && localRefs[ref];
                localSchema && (v = resolve.inlineRef(localSchema, opts.inlineRefs) ? localSchema : compile.call(self, localSchema, root, localRefs, baseId));
            }
            if (void 0 !== v) return (function(ref, v) {
                var refId = refs[ref];
                refVal[refId] = v;
            })(ref, v), resolvedRef(v, refCode);
            !(function(ref) {
                delete refs[ref];
            })(ref);
        }
        function addLocalRef(ref, v) {
            var refId = refVal.length;
            return refVal[refId] = v, refs[ref] = refId, "refVal" + refId;
        }
        function resolvedRef(refVal, code) {
            return "object" == typeof refVal || "boolean" == typeof refVal ? {
                code: code,
                schema: refVal,
                inline: !0
            } : {
                code: code,
                $async: refVal && !!refVal.$async
            };
        }
        function usePattern(regexStr) {
            var index = patternsHash[regexStr];
            return void 0 === index && (index = patternsHash[regexStr] = patterns.length, patterns[index] = regexStr), 
            "pattern" + index;
        }
        function useDefault(value) {
            switch (typeof value) {
              case "boolean":
              case "number":
                return "" + value;

              case "string":
                return util.toQuotedString(value);

              case "object":
                if (null === value) return "null";
                var valueStr = stableStringify(value), index = defaultsHash[valueStr];
                return void 0 === index && (index = defaultsHash[valueStr] = defaults.length, defaults[index] = value), 
                "default" + index;
            }
        }
        function useCustomRule(rule, schema, parentSchema, it) {
            if (!1 !== self._opts.validateSchema) {
                var deps = rule.definition.dependencies;
                if (deps && !deps.every((function(keyword) {
                    return Object.prototype.hasOwnProperty.call(parentSchema, keyword);
                }))) throw new Error("parent schema must have all required keywords: " + deps.join(","));
                var validateSchema = rule.definition.validateSchema;
                if (validateSchema && !validateSchema(schema)) {
                    var message = "keyword schema is invalid: " + self.errorsText(validateSchema.errors);
                    if ("log" != self._opts.validateSchema) throw new Error(message);
                    self.logger.error(message);
                }
            }
            var validate, compile = rule.definition.compile, inline = rule.definition.inline, macro = rule.definition.macro;
            if (compile) validate = compile.call(self, schema, parentSchema, it); else if (macro) validate = macro.call(self, schema, parentSchema, it), 
            !1 !== opts.validateSchema && self.validateSchema(validate, !0); else if (inline) validate = inline.call(self, it, rule.keyword, schema, parentSchema); else if (!(validate = rule.definition.validate)) return;
            if (void 0 === validate) throw new Error('custom keyword "' + rule.keyword + '"failed to compile');
            var index = customRules.length;
            return customRules[index] = validate, {
                code: "customRule" + index,
                validate: validate
            };
        }
    };
}
