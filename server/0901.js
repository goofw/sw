function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $isData = it.opts.$data && $schema && $schema.$data;
        $isData && (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ");
        var $vSchema = "schema" + $lvl;
        if (!$isData) if ($schema.length < it.opts.loopRequired && it.schema.properties && Object.keys(it.schema.properties).length) {
            var $required = [], arr1 = $schema;
            if (arr1) for (var $property, i1 = -1, l1 = arr1.length - 1; i1 < l1; ) {
                $property = arr1[i1 += 1];
                var $propertySch = it.schema.properties[$property];
                $propertySch && it.util.schemaHasRules($propertySch, it.RULES.all) || ($required[$required.length] = $property);
            }
        } else $required = $schema;
        if ($isData || $required.length) {
            var $currentErrorPath = it.errorPath, $loopRequired = $isData || $required.length >= it.opts.loopRequired, $ownProperties = it.opts.ownProperties;
            if ($breakOnError) if (out += " var missing" + $lvl + "; ", $loopRequired) {
                $isData || (out += " var " + $vSchema + " = validate.schema" + $schemaPath + "; ");
                var $missingProperty = "' + " + ($propertyPath = "schema" + $lvl + "[" + ($i = "i" + $lvl) + "]") + " + '";
                it.opts._errorDataPathProperty && (it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers)), 
                out += " var " + $valid + " = true; ", $isData && (out += " if (schema" + $lvl + " === undefined) " + $valid + " = true; else if (!Array.isArray(schema" + $lvl + ")) " + $valid + " = false; else {"), 
                out += " for (var " + $i + " = 0; " + $i + " < " + $vSchema + ".length; " + $i + "++) { " + $valid + " = " + $data + "[" + $vSchema + "[" + $i + "]] !== undefined ", 
                $ownProperties && (out += " &&   Object.prototype.hasOwnProperty.call(" + $data + ", " + $vSchema + "[" + $i + "]) "), 
                out += "; if (!" + $valid + ") break; } ", $isData && (out += "  }  "), out += "  if (!" + $valid + ") {   ", 
                ($$outStack = $$outStack || []).push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ", 
                !1 !== it.opts.messages && (out += " , message: '", it.opts._errorDataPathProperty ? out += "is a required property" : out += "should have required property \\'" + $missingProperty + "\\'", 
                out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ";
                var __err = out;
                out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                out += " } else { ";
            } else {
                out += " if ( ";
                var $$outStack, arr2 = $required;
                if (arr2) for (var $i = -1, l2 = arr2.length - 1; $i < l2; ) $propertyKey = arr2[$i += 1], 
                $i && (out += " || "), out += " ( ( " + ($useData = $data + ($prop = it.util.getProperty($propertyKey))) + " === undefined ", 
                $ownProperties && (out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') "), 
                out += ") && (missing" + $lvl + " = " + it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop) + ") ) ";
                out += ") {  ", $missingProperty = "' + " + ($propertyPath = "missing" + $lvl) + " + '", 
                it.opts._errorDataPathProperty && (it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, !0) : $currentErrorPath + " + " + $propertyPath), 
                ($$outStack = $$outStack || []).push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ", 
                !1 !== it.opts.messages && (out += " , message: '", it.opts._errorDataPathProperty ? out += "is a required property" : out += "should have required property \\'" + $missingProperty + "\\'", 
                out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ", __err = out, out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                out += " } else { ";
            } else if ($loopRequired) {
                var $propertyPath;
                $isData || (out += " var " + $vSchema + " = validate.schema" + $schemaPath + "; "), 
                $missingProperty = "' + " + ($propertyPath = "schema" + $lvl + "[" + ($i = "i" + $lvl) + "]") + " + '", 
                it.opts._errorDataPathProperty && (it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers)), 
                $isData && (out += " if (" + $vSchema + " && !Array.isArray(" + $vSchema + ")) {  var err =   ", 
                !1 !== it.createErrors ? (out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ", 
                !1 !== it.opts.messages && (out += " , message: '", it.opts._errorDataPathProperty ? out += "is a required property" : out += "should have required property \\'" + $missingProperty + "\\'", 
                out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (" + $vSchema + " !== undefined) { "), 
                out += " for (var " + $i + " = 0; " + $i + " < " + $vSchema + ".length; " + $i + "++) { if (" + $data + "[" + $vSchema + "[" + $i + "]] === undefined ", 
                $ownProperties && (out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", " + $vSchema + "[" + $i + "]) "), 
                out += ") {  var err =   ", !1 !== it.createErrors ? (out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ", 
                !1 !== it.opts.messages && (out += " , message: '", it.opts._errorDataPathProperty ? out += "is a required property" : out += "should have required property \\'" + $missingProperty + "\\'", 
                out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ", 
                $isData && (out += "  }  ");
            } else {
                var arr3 = $required;
                if (arr3) for (var $propertyKey, i3 = -1, l3 = arr3.length - 1; i3 < l3; ) {
                    $propertyKey = arr3[i3 += 1];
                    var $prop = it.util.getProperty($propertyKey), $useData = ($missingProperty = it.util.escapeQuotes($propertyKey), 
                    $data + $prop);
                    it.opts._errorDataPathProperty && (it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers)), 
                    out += " if ( " + $useData + " === undefined ", $ownProperties && (out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') "), 
                    out += ") {  var err =   ", !1 !== it.createErrors ? (out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ", 
                    !1 !== it.opts.messages && (out += " , message: '", it.opts._errorDataPathProperty ? out += "is a required property" : out += "should have required property \\'" + $missingProperty + "\\'", 
                    out += "' "), it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                    out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
                }
            }
            it.errorPath = $currentErrorPath;
        } else $breakOnError && (out += " if (true) {");
        return out;
    };
}
