function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $errs = "errs__" + $lvl, $it = it.util.copy(it), $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level, $idx = "i" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $currentBaseId = it.baseId;
        if (out += "var " + $errs + " = errors;var " + $valid + ";", Array.isArray($schema)) {
            var $additionalItems = it.schema.additionalItems;
            if (!1 === $additionalItems) {
                out += " " + $valid + " = " + $data + ".length <= " + $schema.length + "; ";
                var $currErrSchemaPath = $errSchemaPath;
                $errSchemaPath = it.errSchemaPath + "/additionalItems", out += "  if (!" + $valid + ") {   ";
                var $$outStack = $$outStack || [];
                $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'additionalItems' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schema.length + " } ", 
                !1 !== it.opts.messages && (out += " , message: 'should NOT have more than " + $schema.length + " items' "), 
                it.opts.verbose && (out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ";
                var __err = out;
                out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                out += " } ", $errSchemaPath = $currErrSchemaPath, $breakOnError && ($closingBraces += "}", 
                out += " else { ");
            }
            var arr1 = $schema;
            if (arr1) for (var $sch, $i = -1, l1 = arr1.length - 1; $i < l1; ) if ($sch = arr1[$i += 1], 
            it.util.schemaHasRules($sch, it.RULES.all)) {
                out += " " + $nextValid + " = true; if (" + $data + ".length > " + $i + ") { ";
                var $passData = $data + "[" + $i + "]";
                $it.schema = $sch, $it.schemaPath = $schemaPath + "[" + $i + "]", $it.errSchemaPath = $errSchemaPath + "/" + $i, 
                $it.errorPath = it.util.getPathExpr(it.errorPath, $i, it.opts.jsonPointers, !0), 
                $it.dataPathArr[$dataNxt] = $i;
                var $code = it.validate($it);
                $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
                out += " }  ", $breakOnError && (out += " if (" + $nextValid + ") { ", $closingBraces += "}");
            }
            "object" == typeof $additionalItems && it.util.schemaHasRules($additionalItems, it.RULES.all) && ($it.schema = $additionalItems, 
            $it.schemaPath = it.schemaPath + ".additionalItems", $it.errSchemaPath = it.errSchemaPath + "/additionalItems", 
            out += " " + $nextValid + " = true; if (" + $data + ".length > " + $schema.length + ") {  for (var " + $idx + " = " + $schema.length + "; " + $idx + " < " + $data + ".length; " + $idx + "++) { ", 
            $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, !0), 
            $passData = $data + "[" + $idx + "]", $it.dataPathArr[$dataNxt] = $idx, $code = it.validate($it), 
            $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
            $breakOnError && (out += " if (!" + $nextValid + ") break; "), out += " } }  ", 
            $breakOnError && (out += " if (" + $nextValid + ") { ", $closingBraces += "}"));
        } else it.util.schemaHasRules($schema, it.RULES.all) && ($it.schema = $schema, $it.schemaPath = $schemaPath, 
        $it.errSchemaPath = $errSchemaPath, out += "  for (var " + $idx + " = 0; " + $idx + " < " + $data + ".length; " + $idx + "++) { ", 
        $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, !0), 
        $passData = $data + "[" + $idx + "]", $it.dataPathArr[$dataNxt] = $idx, $code = it.validate($it), 
        $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
        $breakOnError && (out += " if (!" + $nextValid + ") break; "), out += " }");
        return $breakOnError && (out += " " + $closingBraces + " if (" + $errs + " == errors) {"), 
        it.util.cleanUpCode(out);
    };
}
