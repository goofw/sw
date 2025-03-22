function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var $schemaValue, out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $isData = it.opts.$data && $schema && $schema.$data;
        if ($isData ? (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ", 
        $schemaValue = "schema" + $lvl) : $schemaValue = $schema, ($schema || $isData) && !1 !== it.opts.uniqueItems) {
            $isData && (out += " var " + $valid + "; if (" + $schemaValue + " === false || " + $schemaValue + " === undefined) " + $valid + " = true; else if (typeof " + $schemaValue + " != 'boolean') " + $valid + " = false; else { "), 
            out += " var i = " + $data + ".length , " + $valid + " = true , j; if (i > 1) { ";
            var $itemType = it.schema.items && it.schema.items.type, $typeIsArray = Array.isArray($itemType);
            if (!$itemType || "object" == $itemType || "array" == $itemType || $typeIsArray && ($itemType.indexOf("object") >= 0 || $itemType.indexOf("array") >= 0)) out += " outer: for (;i--;) { for (j = i; j--;) { if (equal(" + $data + "[i], " + $data + "[j])) { " + $valid + " = false; break outer; } } } "; else {
                out += " var itemIndices = {}, item; for (;i--;) { var item = " + $data + "[i]; ";
                var $method = "checkDataType" + ($typeIsArray ? "s" : "");
                out += " if (" + it.util[$method]($itemType, "item", !0) + ") continue; ", $typeIsArray && (out += " if (typeof item == 'string') item = '\"' + item; "), 
                out += " if (typeof itemIndices[item] == 'number') { " + $valid + " = false; j = itemIndices[item]; break; } itemIndices[item] = i; } ";
            }
            out += " } ", $isData && (out += "  }  "), out += " if (!" + $valid + ") {   ";
            var $$outStack = $$outStack || [];
            $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'uniqueItems' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { i: i, j: j } ", 
            !1 !== it.opts.messages && (out += " , message: 'should NOT have duplicate items (items ## ' + j + ' and ' + i + ' are identical)' "), 
            it.opts.verbose && (out += " , schema:  ", out += $isData ? "validate.schema" + $schemaPath : "" + $schema, 
            out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
            out += " } ") : out += " {} ";
            var __err = out;
            out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
            out += " } ", $breakOnError && (out += " else { ");
        } else $breakOnError && (out += " if (true) { ");
        return out;
    };
}
