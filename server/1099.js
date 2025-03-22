function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $errs = "errs__" + $lvl, $it = it.util.copy(it);
        $it.level++;
        var $nextValid = "valid" + $it.level, $thenSch = it.schema.then, $elseSch = it.schema.else, $thenPresent = void 0 !== $thenSch && it.util.schemaHasRules($thenSch, it.RULES.all), $elsePresent = void 0 !== $elseSch && it.util.schemaHasRules($elseSch, it.RULES.all), $currentBaseId = $it.baseId;
        if ($thenPresent || $elsePresent) {
            var $ifClause;
            $it.createErrors = !1, $it.schema = $schema, $it.schemaPath = $schemaPath, $it.errSchemaPath = $errSchemaPath, 
            out += " var " + $errs + " = errors; var " + $valid + " = true;  ";
            var $wasComposite = it.compositeRule;
            it.compositeRule = $it.compositeRule = !0, out += "  " + it.validate($it) + " ", 
            $it.baseId = $currentBaseId, $it.createErrors = !0, out += "  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; }  ", 
            it.compositeRule = $it.compositeRule = $wasComposite, $thenPresent ? (out += " if (" + $nextValid + ") {  ", 
            $it.schema = it.schema.then, $it.schemaPath = it.schemaPath + ".then", $it.errSchemaPath = it.errSchemaPath + "/then", 
            out += "  " + it.validate($it) + " ", $it.baseId = $currentBaseId, out += " " + $valid + " = " + $nextValid + "; ", 
            $thenPresent && $elsePresent ? out += " var " + ($ifClause = "ifClause" + $lvl) + " = 'then'; " : $ifClause = "'then'", 
            out += " } ", $elsePresent && (out += " else { ")) : out += " if (!" + $nextValid + ") { ", 
            $elsePresent && ($it.schema = it.schema.else, $it.schemaPath = it.schemaPath + ".else", 
            $it.errSchemaPath = it.errSchemaPath + "/else", out += "  " + it.validate($it) + " ", 
            $it.baseId = $currentBaseId, out += " " + $valid + " = " + $nextValid + "; ", $thenPresent && $elsePresent ? out += " var " + ($ifClause = "ifClause" + $lvl) + " = 'else'; " : $ifClause = "'else'", 
            out += " } "), out += " if (!" + $valid + ") {   var err =   ", !1 !== it.createErrors ? (out += " { keyword: 'if' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { failingKeyword: " + $ifClause + " } ", 
            !1 !== it.opts.messages && (out += " , message: 'should match \"' + " + $ifClause + " + '\" schema' "), 
            it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
            out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
            !it.compositeRule && $breakOnError && (it.async ? out += " throw new ValidationError(vErrors); " : out += " validate.errors = vErrors; return false; "), 
            out += " }   ", $breakOnError && (out += " else { "), out = it.util.cleanUpCode(out);
        } else $breakOnError && (out += " if (true) { ");
        return out;
    };
}
