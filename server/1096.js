function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $errs = "errs__" + $lvl, $it = it.util.copy(it), $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level, $schemaDeps = {}, $propertyDeps = {}, $ownProperties = it.opts.ownProperties;
        for ($property in $schema) {
            var $sch = $schema[$property], $deps = Array.isArray($sch) ? $propertyDeps : $schemaDeps;
            $deps[$property] = $sch;
        }
        out += "var " + $errs + " = errors;";
        var $currentErrorPath = it.errorPath;
        for (var $property in out += "var missing" + $lvl + ";", $propertyDeps) if (($deps = $propertyDeps[$property]).length) {
            if (out += " if ( " + $data + it.util.getProperty($property) + " !== undefined ", 
            $ownProperties && (out += " && Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($property) + "') "), 
            $breakOnError) {
                out += " && ( ";
                var arr1 = $deps;
                if (arr1) for (var $i = -1, l1 = arr1.length - 1; $i < l1; ) $propertyKey = arr1[$i += 1], 
                $i && (out += " || "), out += " ( ( " + ($useData = $data + ($prop = it.util.getProperty($propertyKey))) + " === undefined ", 
                $ownProperties && (out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') "), 
                out += ") && (missing" + $lvl + " = " + it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop) + ") ) ";
                out += ")) {  ";
                var $propertyPath = "missing" + $lvl, $missingProperty = "' + " + $propertyPath + " + '";
                it.opts._errorDataPathProperty && (it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, !0) : $currentErrorPath + " + " + $propertyPath);
                var $$outStack = $$outStack || [];
                $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { property: '" + it.util.escapeQuotes($property) + "', missingProperty: '" + $missingProperty + "', depsCount: " + $deps.length + ", deps: '" + it.util.escapeQuotes(1 == $deps.length ? $deps[0] : $deps.join(", ")) + "' } ", 
                !1 !== it.opts.messages && (out += " , message: 'should have ", 1 == $deps.length ? out += "property " + it.util.escapeQuotes($deps[0]) : out += "properties " + it.util.escapeQuotes($deps.join(", ")), 
                out += " when property " + it.util.escapeQuotes($property) + " is present' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ";
                var __err = out;
                out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            } else {
                out += " ) { ";
                var arr2 = $deps;
                if (arr2) for (var $propertyKey, i2 = -1, l2 = arr2.length - 1; i2 < l2; ) {
                    $propertyKey = arr2[i2 += 1];
                    var $prop = it.util.getProperty($propertyKey), $useData = ($missingProperty = it.util.escapeQuotes($propertyKey), 
                    $data + $prop);
                    it.opts._errorDataPathProperty && (it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers)), 
                    out += " if ( " + $useData + " === undefined ", $ownProperties && (out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') "), 
                    out += ") {  var err =   ", !1 !== it.createErrors ? (out += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { property: '" + it.util.escapeQuotes($property) + "', missingProperty: '" + $missingProperty + "', depsCount: " + $deps.length + ", deps: '" + it.util.escapeQuotes(1 == $deps.length ? $deps[0] : $deps.join(", ")) + "' } ", 
                    !1 !== it.opts.messages && (out += " , message: 'should have ", 1 == $deps.length ? out += "property " + it.util.escapeQuotes($deps[0]) : out += "properties " + it.util.escapeQuotes($deps.join(", ")), 
                    out += " when property " + it.util.escapeQuotes($property) + " is present' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                    out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
                }
            }
            out += " }   ", $breakOnError && ($closingBraces += "}", out += " else { ");
        }
        it.errorPath = $currentErrorPath;
        var $currentBaseId = $it.baseId;
        for (var $property in $schemaDeps) $sch = $schemaDeps[$property], it.util.schemaHasRules($sch, it.RULES.all) && (out += " " + $nextValid + " = true; if ( " + $data + it.util.getProperty($property) + " !== undefined ", 
        $ownProperties && (out += " && Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($property) + "') "), 
        out += ") { ", $it.schema = $sch, $it.schemaPath = $schemaPath + it.util.getProperty($property), 
        $it.errSchemaPath = $errSchemaPath + "/" + it.util.escapeFragment($property), out += "  " + it.validate($it) + " ", 
        $it.baseId = $currentBaseId, out += " }  ", $breakOnError && (out += " if (" + $nextValid + ") { ", 
        $closingBraces += "}"));
        return $breakOnError && (out += "   " + $closingBraces + " if (" + $errs + " == errors) {"), 
        it.util.cleanUpCode(out);
    };
}
