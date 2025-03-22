function(module, exports, __webpack_require__) {
    const semver = __webpack_require__(996);
    function lintManifest(manifest) {
        var errors = [], warnings = [];
        if (!manifest || "object" != typeof manifest) return {
            valid: !1,
            errors: [ new Error("manifest must be an object") ]
        };
        function assertString(val, name) {
            "string" != typeof val && errors.push(new Error(name + " must be a string"));
        }
        function assertArray(val, name) {
            Array.isArray(val) || errors.push(new Error(name + " must be an array"));
        }
        return assertString(manifest.id, "manifest.id"), assertString(manifest.name, "manifest.name"), 
        (function(val, name) {
            "string" == typeof val && semver.valid(val) || errors.push(new Error("manifest.version must be a valid semver string"));
        })(manifest.version), assertArray(manifest.resources, "manifest.resources"), Array.isArray(manifest.resources) && (function(val, set, name) {
            Array.isArray(val) && val.forEach((function(m) {
                set.includes(m) || warnings.push(new Error("manifest.resources: unknown value " + m));
            }));
        })(manifest.resources.map((function(r) {
            return r && r.name ? r.name : r;
        })), [ "catalog", "meta", "stream", "subtitles" ]), assertArray(manifest.types, "manifest.types"), 
        assertArray(manifest.catalogs, "manifest.catalogs"), manifest.hasOwnProperty("idPrefixes") && null !== manifest.idPrefixes && assertArray(manifest.idPrefixes, "manifest.idPrefixes"), 
        Array.isArray(manifest.catalogs) && manifest.catalogs.forEach((function(catalog, i) {
            "string" == typeof catalog.id && "string" == typeof catalog.type || errors.push(new Error("manifest.catalogs[" + i + "]: id and type must be string properties")), 
            catalog.hasOwnProperty("extra") && assertArray(catalog.extra, "manifest.catalogs[" + i + "].extra"), 
            catalog.hasOwnProperty("extraSupported") && assertArray(catalog.extraSupported, "manifest.catalogs[" + i + "].extraSupported"), 
            catalog.hasOwnProperty("extraRequired") && assertArray(catalog.extraRequired, "manifest.catalogs[" + i + "].extraRequired");
        })), {
            valid: !errors.length,
            errors: errors,
            warnings: warnings
        };
    }
    module.exports = {
        lintManifest: lintManifest,
        lintCollection: function(col) {
            var errors = [];
            return Array.isArray(col) ? col.forEach((function(item, i) {
                "string" != typeof item.transportUrl && errors.push(new Error(i + ": transportUrl must be a string")), 
                "string" != typeof item.transportName && errors.push(new Error(i + ": transportName must be a string")), 
                errors = errors.concat(lintManifest(item.manifest).errors);
            })) : errors.push(new Error("col is not an array")), {
                valid: !errors.length,
                errors: errors,
                warnings: []
            };
        }
    };
}
