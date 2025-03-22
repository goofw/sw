function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $isData = it.opts.$data && $schema && $schema.$data;
        $isData && (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ");
        var $i = "i" + $lvl, $vSchema = "schema" + $lvl;
        $isData || (out += " var " + $vSchema + " = validate.schema" + $schemaPath + ";"), 
        out += "var " + $valid + ";", $isData && (out += " if (schema" + $lvl + " === undefined) " + $valid + " = true; else if (!Array.isArray(schema" + $lvl + ")) " + $valid + " = false; else {"), 
        out += $valid + " = false;for (var " + $i + "=0; " + $i + "<" + $vSchema + ".length; " + $i + "++) if (equal(" + $data + ", " + $vSchema + "[" + $i + "])) { " + $valid + " = true; break; }", 
        $isData && (out += "  }  "), out += " if (!" + $valid + ") {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'enum' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { allowedValues: schema" + $lvl + " } ", 
        !1 !== it.opts.messages && (out += " , message: 'should be equal to one of the allowed values' "), 
        it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
        out += " } ") : out += " {} ";
        var __err = out;
        return out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
        out += " }", $breakOnError && (out += " else { "), out;
    };
}
