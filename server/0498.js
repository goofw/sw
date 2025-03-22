function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = "", $async = !0 === it.schema.$async, $refKeywords = it.util.schemaHasRulesExcept(it.schema, it.RULES.all, "$ref"), $id = it.self._getId(it.schema);
        if (it.opts.strictKeywords) {
            var $unknownKwd = it.util.schemaUnknownRules(it.schema, it.RULES.keywords);
            if ($unknownKwd) {
                var $keywordsMsg = "unknown keyword: " + $unknownKwd;
                if ("log" !== it.opts.strictKeywords) throw new Error($keywordsMsg);
                it.logger.warn($keywordsMsg);
            }
        }
        if (it.isTop && (out += " var validate = ", $async && (it.async = !0, out += "async "), 
        out += "function(data, dataPath, parentData, parentDataProperty, rootData) { 'use strict'; ", 
        $id && (it.opts.sourceCode || it.opts.processCode) && (out += " /*# sourceURL=" + $id + " */ ")), 
        "boolean" == typeof it.schema || !$refKeywords && !it.schema.$ref) {
            var $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema["false schema"], $schemaPath = it.schemaPath + it.util.getProperty("false schema"), $errSchemaPath = it.errSchemaPath + "/false schema", $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl;
            if (!1 === it.schema) {
                it.isTop ? $breakOnError = !0 : out += " var " + $valid + " = false; ", ($$outStack = $$outStack || []).push(out), 
                out = "", !1 !== it.createErrors ? (out += " { keyword: 'false schema' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ", 
                !1 !== it.opts.messages && (out += " , message: 'boolean schema is false' "), it.opts.verbose && (out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ";
                var __err = out;
                out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            } else it.isTop ? out += $async ? " return data; " : " validate.errors = null; return true; " : out += " var " + $valid + " = true; ";
            return it.isTop && (out += " }; return validate; "), out;
        }
        if (it.isTop) {
            var $top = it.isTop;
            if ($lvl = it.level = 0, $dataLvl = it.dataLevel = 0, $data = "data", it.rootId = it.resolve.fullPath(it.self._getId(it.root.schema)), 
            it.baseId = it.baseId || it.rootId, delete it.isTop, it.dataPathArr = [ void 0 ], 
            void 0 !== it.schema.default && it.opts.useDefaults && it.opts.strictDefaults) {
                var $defaultMsg = "default is ignored in the schema root";
                if ("log" !== it.opts.strictDefaults) throw new Error($defaultMsg);
                it.logger.warn($defaultMsg);
            }
            out += " var vErrors = null; ", out += " var errors = 0;     ", out += " if (rootData === undefined) rootData = data; ";
        } else {
            if ($lvl = it.level, $data = "data" + (($dataLvl = it.dataLevel) || ""), $id && (it.baseId = it.resolve.url(it.baseId, $id)), 
            $async && !it.async) throw new Error("async schema in sync schema");
            out += " var errs_" + $lvl + " = errors;";
        }
        $valid = "valid" + $lvl, $breakOnError = !it.opts.allErrors;
        var $closingBraces1 = "", $closingBraces2 = "", $typeSchema = it.schema.type, $typeIsArray = Array.isArray($typeSchema);
        if ($typeSchema && it.opts.nullable && !0 === it.schema.nullable && ($typeIsArray ? -1 == $typeSchema.indexOf("null") && ($typeSchema = $typeSchema.concat("null")) : "null" != $typeSchema && ($typeSchema = [ $typeSchema, "null" ], 
        $typeIsArray = !0)), $typeIsArray && 1 == $typeSchema.length && ($typeSchema = $typeSchema[0], 
        $typeIsArray = !1), it.schema.$ref && $refKeywords) {
            if ("fail" == it.opts.extendRefs) throw new Error('$ref: validation keywords used in schema at path "' + it.errSchemaPath + '" (see option extendRefs)');
            !0 !== it.opts.extendRefs && ($refKeywords = !1, it.logger.warn('$ref: keywords ignored in schema at path "' + it.errSchemaPath + '"'));
        }
        if (it.schema.$comment && it.opts.$comment && (out += " " + it.RULES.all.$comment.code(it, "$comment")), 
        $typeSchema) {
            if (it.opts.coerceTypes) var $coerceToTypes = it.util.coerceToTypes(it.opts.coerceTypes, $typeSchema);
            var $rulesGroup = it.RULES.types[$typeSchema];
            if ($coerceToTypes || $typeIsArray || !0 === $rulesGroup || $rulesGroup && !$shouldUseGroup($rulesGroup)) {
                $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type", 
                $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type";
                var $method = $typeIsArray ? "checkDataTypes" : "checkDataType";
                if (out += " if (" + it.util[$method]($typeSchema, $data, !0) + ") { ", $coerceToTypes) {
                    var $dataType = "dataType" + $lvl, $coerced = "coerced" + $lvl;
                    out += " var " + $dataType + " = typeof " + $data + "; ", "array" == it.opts.coerceTypes && (out += " if (" + $dataType + " == 'object' && Array.isArray(" + $data + ")) " + $dataType + " = 'array'; "), 
                    out += " var " + $coerced + " = undefined; ";
                    var $bracesCoercion = "", arr1 = $coerceToTypes;
                    if (arr1) for (var $type, $i = -1, l1 = arr1.length - 1; $i < l1; ) $type = arr1[$i += 1], 
                    $i && (out += " if (" + $coerced + " === undefined) { ", $bracesCoercion += "}"), 
                    "array" == it.opts.coerceTypes && "array" != $type && (out += " if (" + $dataType + " == 'array' && " + $data + ".length == 1) { " + $coerced + " = " + $data + " = " + $data + "[0]; " + $dataType + " = typeof " + $data + ";  } "), 
                    "string" == $type ? out += " if (" + $dataType + " == 'number' || " + $dataType + " == 'boolean') " + $coerced + " = '' + " + $data + "; else if (" + $data + " === null) " + $coerced + " = ''; " : "number" == $type || "integer" == $type ? (out += " if (" + $dataType + " == 'boolean' || " + $data + " === null || (" + $dataType + " == 'string' && " + $data + " && " + $data + " == +" + $data + " ", 
                    "integer" == $type && (out += " && !(" + $data + " % 1)"), out += ")) " + $coerced + " = +" + $data + "; ") : "boolean" == $type ? out += " if (" + $data + " === 'false' || " + $data + " === 0 || " + $data + " === null) " + $coerced + " = false; else if (" + $data + " === 'true' || " + $data + " === 1) " + $coerced + " = true; " : "null" == $type ? out += " if (" + $data + " === '' || " + $data + " === 0 || " + $data + " === false) " + $coerced + " = null; " : "array" == it.opts.coerceTypes && "array" == $type && (out += " if (" + $dataType + " == 'string' || " + $dataType + " == 'number' || " + $dataType + " == 'boolean' || " + $data + " == null) " + $coerced + " = [" + $data + "]; ");
                    out += " " + $bracesCoercion + " if (" + $coerced + " === undefined) {   ", ($$outStack = $$outStack || []).push(out), 
                    out = "", !1 !== it.createErrors ? (out += " { keyword: 'type' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '", 
                    out += $typeIsArray ? "" + $typeSchema.join(",") : "" + $typeSchema, out += "' } ", 
                    !1 !== it.opts.messages && (out += " , message: 'should be ", out += $typeIsArray ? "" + $typeSchema.join(",") : "" + $typeSchema, 
                    out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                    out += " } ") : out += " {} ", __err = out, out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                    out += " } else {  ";
                    var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData";
                    out += " " + $data + " = " + $coerced + "; ", $dataLvl || (out += "if (" + $parentData + " !== undefined)"), 
                    out += " " + $parentData + "[" + ($dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty") + "] = " + $coerced + "; } ";
                } else ($$outStack = $$outStack || []).push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'type' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '", 
                out += $typeIsArray ? "" + $typeSchema.join(",") : "" + $typeSchema, out += "' } ", 
                !1 !== it.opts.messages && (out += " , message: 'should be ", out += $typeIsArray ? "" + $typeSchema.join(",") : "" + $typeSchema, 
                out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ", __err = out, out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                out += " } ";
            }
        }
        if (it.schema.$ref && !$refKeywords) out += " " + it.RULES.all.$ref.code(it, "$ref") + " ", 
        $breakOnError && (out += " } if (errors === ", out += $top ? "0" : "errs_" + $lvl, 
        out += ") { ", $closingBraces2 += "}"); else {
            var arr2 = it.RULES;
            if (arr2) for (var i2 = -1, l2 = arr2.length - 1; i2 < l2; ) if ($shouldUseGroup($rulesGroup = arr2[i2 += 1])) {
                if ($rulesGroup.type && (out += " if (" + it.util.checkDataType($rulesGroup.type, $data) + ") { "), 
                it.opts.useDefaults) if ("object" == $rulesGroup.type && it.schema.properties) {
                    $schema = it.schema.properties;
                    var arr3 = Object.keys($schema);
                    if (arr3) for (var $propertyKey, i3 = -1, l3 = arr3.length - 1; i3 < l3; ) if (void 0 !== ($sch = $schema[$propertyKey = arr3[i3 += 1]]).default) {
                        var $passData = $data + it.util.getProperty($propertyKey);
                        if (it.compositeRule) {
                            if (it.opts.strictDefaults) {
                                if ($defaultMsg = "default is ignored for: " + $passData, "log" !== it.opts.strictDefaults) throw new Error($defaultMsg);
                                it.logger.warn($defaultMsg);
                            }
                        } else out += " if (" + $passData + " === undefined ", "empty" == it.opts.useDefaults && (out += " || " + $passData + " === null || " + $passData + " === '' "), 
                        out += " ) " + $passData + " = ", "shared" == it.opts.useDefaults ? out += " " + it.useDefault($sch.default) + " " : out += " " + JSON.stringify($sch.default) + " ", 
                        out += "; ";
                    }
                } else if ("array" == $rulesGroup.type && Array.isArray(it.schema.items)) {
                    var arr4 = it.schema.items;
                    if (arr4) {
                        $i = -1;
                        for (var $sch, l4 = arr4.length - 1; $i < l4; ) if (void 0 !== ($sch = arr4[$i += 1]).default) if ($passData = $data + "[" + $i + "]", 
                        it.compositeRule) {
                            if (it.opts.strictDefaults) {
                                if ($defaultMsg = "default is ignored for: " + $passData, "log" !== it.opts.strictDefaults) throw new Error($defaultMsg);
                                it.logger.warn($defaultMsg);
                            }
                        } else out += " if (" + $passData + " === undefined ", "empty" == it.opts.useDefaults && (out += " || " + $passData + " === null || " + $passData + " === '' "), 
                        out += " ) " + $passData + " = ", "shared" == it.opts.useDefaults ? out += " " + it.useDefault($sch.default) + " " : out += " " + JSON.stringify($sch.default) + " ", 
                        out += "; ";
                    }
                }
                var $$outStack, arr5 = $rulesGroup.rules;
                if (arr5) for (var $rule, i5 = -1, l5 = arr5.length - 1; i5 < l5; ) if ($shouldUseRule($rule = arr5[i5 += 1])) {
                    var $code = $rule.code(it, $rule.keyword, $rulesGroup.type);
                    $code && (out += " " + $code + " ", $breakOnError && ($closingBraces1 += "}"));
                }
                if ($breakOnError && (out += " " + $closingBraces1 + " ", $closingBraces1 = ""), 
                $rulesGroup.type && (out += " } ", $typeSchema && $typeSchema === $rulesGroup.type && !$coerceToTypes)) out += " else { ", 
                $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type", 
                ($$outStack = $$outStack || []).push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'type' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '", 
                out += $typeIsArray ? "" + $typeSchema.join(",") : "" + $typeSchema, out += "' } ", 
                !1 !== it.opts.messages && (out += " , message: 'should be ", out += $typeIsArray ? "" + $typeSchema.join(",") : "" + $typeSchema, 
                out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ", __err = out, out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                out += " } ";
                $breakOnError && (out += " if (errors === ", out += $top ? "0" : "errs_" + $lvl, 
                out += ") { ", $closingBraces2 += "}");
            }
        }
        function $shouldUseGroup($rulesGroup) {
            for (var rules = $rulesGroup.rules, i = 0; i < rules.length; i++) if ($shouldUseRule(rules[i])) return !0;
        }
        function $shouldUseRule($rule) {
            return void 0 !== it.schema[$rule.keyword] || $rule.implements && (function($rule) {
                for (var impl = $rule.implements, i = 0; i < impl.length; i++) if (void 0 !== it.schema[impl[i]]) return !0;
            })($rule);
        }
        return $breakOnError && (out += " " + $closingBraces2 + " "), $top ? ($async ? (out += " if (errors === 0) return data;           ", 
        out += " else throw new ValidationError(vErrors); ") : (out += " validate.errors = vErrors; ", 
        out += " return errors === 0;       "), out += " }; return validate;") : out += " var " + $valid + " = errors === errs_" + $lvl + ";", 
        out = it.util.cleanUpCode(out), $top && (out = it.util.finalCleanUpCode(out, $async)), 
        out;
    };
}
