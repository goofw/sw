function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $errs = "errs__" + $lvl, $it = it.util.copy(it);
        $it.level++;
        var $nextValid = "valid" + $it.level, $idx = "i" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $currentBaseId = it.baseId, $nonEmptySchema = it.util.schemaHasRules($schema, it.RULES.all);
        if (out += "var " + $errs + " = errors;var " + $valid + ";", $nonEmptySchema) {
            var $wasComposite = it.compositeRule;
            it.compositeRule = $it.compositeRule = !0, $it.schema = $schema, $it.schemaPath = $schemaPath, 
            $it.errSchemaPath = $errSchemaPath, out += " var " + $nextValid + " = false; for (var " + $idx + " = 0; " + $idx + " < " + $data + ".length; " + $idx + "++) { ", 
            $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, !0);
            var $passData = $data + "[" + $idx + "]";
            $it.dataPathArr[$dataNxt] = $idx;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
            out += " if (" + $nextValid + ") break; }  ", it.compositeRule = $it.compositeRule = $wasComposite, 
            out += "  if (!" + $nextValid + ") {";
        } else out += " if (" + $data + ".length == 0) {";
        var $$outStack = $$outStack || [];
        $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'contains' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ", 
        !1 !== it.opts.messages && (out += " , message: 'should contain a valid item' "), 
        it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
        out += " } ") : out += " {} ";
        var __err = out;
        return out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
        out += " } else { ", $nonEmptySchema && (out += "  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; } "), 
        it.opts.allErrors && (out += " } "), it.util.cleanUpCode(out);
    };
}
