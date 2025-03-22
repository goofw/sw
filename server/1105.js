function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $errs = "errs__" + $lvl, $it = it.util.copy(it), $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level, $key = "key" + $lvl, $idx = "idx" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $dataProperties = "dataProperties" + $lvl, $schemaKeys = Object.keys($schema || {}), $pProperties = it.schema.patternProperties || {}, $pPropertyKeys = Object.keys($pProperties), $aProperties = it.schema.additionalProperties, $someProperties = $schemaKeys.length || $pPropertyKeys.length, $noAdditional = !1 === $aProperties, $additionalIsSchema = "object" == typeof $aProperties && Object.keys($aProperties).length, $removeAdditional = it.opts.removeAdditional, $checkAdditional = $noAdditional || $additionalIsSchema || $removeAdditional, $ownProperties = it.opts.ownProperties, $currentBaseId = it.baseId, $required = it.schema.required;
        if ($required && (!it.opts.$data || !$required.$data) && $required.length < it.opts.loopRequired) var $requiredHash = it.util.toHash($required);
        if (out += "var " + $errs + " = errors;var " + $nextValid + " = true;", $ownProperties && (out += " var " + $dataProperties + " = undefined;"), 
        $checkAdditional) {
            if (out += $ownProperties ? " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; " : " for (var " + $key + " in " + $data + ") { ", 
            $someProperties) {
                if (out += " var isAdditional" + $lvl + " = !(false ", $schemaKeys.length) if ($schemaKeys.length > 8) out += " || validate.schema" + $schemaPath + ".hasOwnProperty(" + $key + ") "; else {
                    var arr1 = $schemaKeys;
                    if (arr1) for (var i1 = -1, l1 = arr1.length - 1; i1 < l1; ) $propertyKey = arr1[i1 += 1], 
                    out += " || " + $key + " == " + it.util.toQuotedString($propertyKey) + " ";
                }
                if ($pPropertyKeys.length) {
                    var arr2 = $pPropertyKeys;
                    if (arr2) for (var $i = -1, l2 = arr2.length - 1; $i < l2; ) $pProperty = arr2[$i += 1], 
                    out += " || " + it.usePattern($pProperty) + ".test(" + $key + ") ";
                }
                out += " ); if (isAdditional" + $lvl + ") { ";
            }
            if ("all" == $removeAdditional) out += " delete " + $data + "[" + $key + "]; "; else {
                var $currentErrorPath = it.errorPath, $additionalProperty = "' + " + $key + " + '";
                if (it.opts._errorDataPathProperty && (it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers)), 
                $noAdditional) if ($removeAdditional) out += " delete " + $data + "[" + $key + "]; "; else {
                    out += " " + $nextValid + " = false; ";
                    var $currErrSchemaPath = $errSchemaPath;
                    $errSchemaPath = it.errSchemaPath + "/additionalProperties", ($$outStack = $$outStack || []).push(out), 
                    out = "", !1 !== it.createErrors ? (out += " { keyword: 'additionalProperties' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { additionalProperty: '" + $additionalProperty + "' } ", 
                    !1 !== it.opts.messages && (out += " , message: '", it.opts._errorDataPathProperty ? out += "is an invalid additional property" : out += "should NOT have additional properties", 
                    out += "' "), it.opts.verbose && (out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                    out += " } ") : out += " {} ";
                    var __err = out;
                    out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                    $errSchemaPath = $currErrSchemaPath, $breakOnError && (out += " break; ");
                } else if ($additionalIsSchema) if ("failing" == $removeAdditional) {
                    out += " var " + $errs + " = errors;  ";
                    var $wasComposite = it.compositeRule;
                    it.compositeRule = $it.compositeRule = !0, $it.schema = $aProperties, $it.schemaPath = it.schemaPath + ".additionalProperties", 
                    $it.errSchemaPath = it.errSchemaPath + "/additionalProperties", $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
                    var $passData = $data + "[" + $key + "]";
                    $it.dataPathArr[$dataNxt] = $key;
                    var $code = it.validate($it);
                    $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
                    out += " if (!" + $nextValid + ") { errors = " + $errs + "; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete " + $data + "[" + $key + "]; }  ", 
                    it.compositeRule = $it.compositeRule = $wasComposite;
                } else $it.schema = $aProperties, $it.schemaPath = it.schemaPath + ".additionalProperties", 
                $it.errSchemaPath = it.errSchemaPath + "/additionalProperties", $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers), 
                $passData = $data + "[" + $key + "]", $it.dataPathArr[$dataNxt] = $key, $code = it.validate($it), 
                $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
                $breakOnError && (out += " if (!" + $nextValid + ") break; ");
                it.errorPath = $currentErrorPath;
            }
            $someProperties && (out += " } "), out += " }  ", $breakOnError && (out += " if (" + $nextValid + ") { ", 
            $closingBraces += "}");
        }
        var $useDefaults = it.opts.useDefaults && !it.compositeRule;
        if ($schemaKeys.length) {
            var arr3 = $schemaKeys;
            if (arr3) for (var $propertyKey, i3 = -1, l3 = arr3.length - 1; i3 < l3; ) {
                var $sch = $schema[$propertyKey = arr3[i3 += 1]];
                if (it.util.schemaHasRules($sch, it.RULES.all)) {
                    var $prop = it.util.getProperty($propertyKey), $hasDefault = ($passData = $data + $prop, 
                    $useDefaults && void 0 !== $sch.default);
                    if ($it.schema = $sch, $it.schemaPath = $schemaPath + $prop, $it.errSchemaPath = $errSchemaPath + "/" + it.util.escapeFragment($propertyKey), 
                    $it.errorPath = it.util.getPath(it.errorPath, $propertyKey, it.opts.jsonPointers), 
                    $it.dataPathArr[$dataNxt] = it.util.toQuotedString($propertyKey), $code = it.validate($it), 
                    $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2) {
                        $code = it.util.varReplace($code, $nextData, $passData);
                        var $useData = $passData;
                    } else $useData = $nextData, out += " var " + $nextData + " = " + $passData + "; ";
                    if ($hasDefault) out += " " + $code + " "; else {
                        if ($requiredHash && $requiredHash[$propertyKey]) {
                            out += " if ( " + $useData + " === undefined ", $ownProperties && (out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') "), 
                            out += ") { " + $nextValid + " = false; ", $currentErrorPath = it.errorPath, $currErrSchemaPath = $errSchemaPath;
                            var $$outStack, $missingProperty = it.util.escapeQuotes($propertyKey);
                            it.opts._errorDataPathProperty && (it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers)), 
                            $errSchemaPath = it.errSchemaPath + "/required", ($$outStack = $$outStack || []).push(out), 
                            out = "", !1 !== it.createErrors ? (out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ", 
                            !1 !== it.opts.messages && (out += " , message: '", it.opts._errorDataPathProperty ? out += "is a required property" : out += "should have required property \\'" + $missingProperty + "\\'", 
                            out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                            out += " } ") : out += " {} ", __err = out, out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                            $errSchemaPath = $currErrSchemaPath, it.errorPath = $currentErrorPath, out += " } else { ";
                        } else $breakOnError ? (out += " if ( " + $useData + " === undefined ", $ownProperties && (out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') "), 
                        out += ") { " + $nextValid + " = true; } else { ") : (out += " if (" + $useData + " !== undefined ", 
                        $ownProperties && (out += " &&   Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') "), 
                        out += " ) { ");
                        out += " " + $code + " } ";
                    }
                }
                $breakOnError && (out += " if (" + $nextValid + ") { ", $closingBraces += "}");
            }
        }
        if ($pPropertyKeys.length) {
            var arr4 = $pPropertyKeys;
            if (arr4) for (var $pProperty, i4 = -1, l4 = arr4.length - 1; i4 < l4; ) $sch = $pProperties[$pProperty = arr4[i4 += 1]], 
            it.util.schemaHasRules($sch, it.RULES.all) && ($it.schema = $sch, $it.schemaPath = it.schemaPath + ".patternProperties" + it.util.getProperty($pProperty), 
            $it.errSchemaPath = it.errSchemaPath + "/patternProperties/" + it.util.escapeFragment($pProperty), 
            out += $ownProperties ? " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; " : " for (var " + $key + " in " + $data + ") { ", 
            out += " if (" + it.usePattern($pProperty) + ".test(" + $key + ")) { ", $it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers), 
            $passData = $data + "[" + $key + "]", $it.dataPathArr[$dataNxt] = $key, $code = it.validate($it), 
            $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
            $breakOnError && (out += " if (!" + $nextValid + ") break; "), out += " } ", $breakOnError && (out += " else " + $nextValid + " = true; "), 
            out += " }  ", $breakOnError && (out += " if (" + $nextValid + ") { ", $closingBraces += "}"));
        }
        return $breakOnError && (out += " " + $closingBraces + " if (" + $errs + " == errors) {"), 
        it.util.cleanUpCode(out);
    };
}
