function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || "");
        if (!1 === it.opts.format) return $breakOnError && (out += " if (true) { "), out;
        var $schemaValue, $isData = it.opts.$data && $schema && $schema.$data;
        $isData ? (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ", 
        $schemaValue = "schema" + $lvl) : $schemaValue = $schema;
        var $unknownFormats = it.opts.unknownFormats, $allowUnknown = Array.isArray($unknownFormats);
        if ($isData) out += " var " + ($format = "format" + $lvl) + " = formats[" + $schemaValue + "]; var " + ($isObject = "isObject" + $lvl) + " = typeof " + $format + " == 'object' && !(" + $format + " instanceof RegExp) && " + $format + ".validate; var " + ($formatType = "formatType" + $lvl) + " = " + $isObject + " && " + $format + ".type || 'string'; if (" + $isObject + ") { ", 
        it.async && (out += " var async" + $lvl + " = " + $format + ".async; "), out += " " + $format + " = " + $format + ".validate; } if (  ", 
        $isData && (out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'string') || "), 
        out += " (", "ignore" != $unknownFormats && (out += " (" + $schemaValue + " && !" + $format + " ", 
        $allowUnknown && (out += " && self._opts.unknownFormats.indexOf(" + $schemaValue + ") == -1 "), 
        out += ") || "), out += " (" + $format + " && " + $formatType + " == '" + $ruleType + "' && !(typeof " + $format + " == 'function' ? ", 
        it.async ? out += " (async" + $lvl + " ? await " + $format + "(" + $data + ") : " + $format + "(" + $data + ")) " : out += " " + $format + "(" + $data + ") ", 
        out += " : " + $format + ".test(" + $data + "))))) {"; else {
            var $format;
            if (!($format = it.formats[$schema])) {
                if ("ignore" == $unknownFormats) return it.logger.warn('unknown format "' + $schema + '" ignored in schema at path "' + it.errSchemaPath + '"'), 
                $breakOnError && (out += " if (true) { "), out;
                if ($allowUnknown && $unknownFormats.indexOf($schema) >= 0) return $breakOnError && (out += " if (true) { "), 
                out;
                throw new Error('unknown format "' + $schema + '" is used in schema at path "' + it.errSchemaPath + '"');
            }
            var $isObject, $formatType = ($isObject = "object" == typeof $format && !($format instanceof RegExp) && $format.validate) && $format.type || "string";
            if ($isObject) {
                var $async = !0 === $format.async;
                $format = $format.validate;
            }
            if ($formatType != $ruleType) return $breakOnError && (out += " if (true) { "), 
            out;
            if ($async) {
                if (!it.async) throw new Error("async format in sync schema");
                out += " if (!(await " + ($formatRef = "formats" + it.util.getProperty($schema) + ".validate") + "(" + $data + "))) { ";
            } else {
                out += " if (! ";
                var $formatRef = "formats" + it.util.getProperty($schema);
                $isObject && ($formatRef += ".validate"), out += "function" == typeof $format ? " " + $formatRef + "(" + $data + ") " : " " + $formatRef + ".test(" + $data + ") ", 
                out += ") { ";
            }
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'format' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { format:  ", 
        out += $isData ? "" + $schemaValue : "" + it.util.toQuotedString($schema), out += "  } ", 
        !1 !== it.opts.messages && (out += " , message: 'should match format \"", out += $isData ? "' + " + $schemaValue + " + '" : "" + it.util.escapeQuotes($schema), 
        out += "\"' "), it.opts.verbose && (out += " , schema:  ", out += $isData ? "validate.schema" + $schemaPath : "" + it.util.toQuotedString($schema), 
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
        out += " } ") : out += " {} ";
        var __err = out;
        return out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
        out += " } ", $breakOnError && (out += " else { "), out;
    };
}
