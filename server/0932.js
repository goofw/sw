function(module, exports, __webpack_require__) {
    "use strict";
    var crypto = __webpack_require__(9);
    exports.calculateMac = function(credentials, opts) {
        var normalized = "hawk.1.header\n" + opts.ts + "\n" + opts.nonce + "\n" + (opts.method || "").toUpperCase() + "\n" + opts.resource + "\n" + opts.host.toLowerCase() + "\n" + opts.port + "\n" + (opts.hash || "") + "\n";
        return opts.ext && (normalized += opts.ext.replace("\\", "\\\\").replace("\n", "\\n")), 
        normalized += "\n", opts.app && (normalized = normalized + opts.app + "\n" + (opts.dlg || "") + "\n"), 
        crypto.createHmac(credentials.algorithm, credentials.key).update(normalized).digest("base64");
    }, exports.header = function(uri, method, opts) {
        var timestamp = opts.timestamp || Math.floor((Date.now() + (opts.localtimeOffsetMsec || 0)) / 1e3), credentials = opts.credentials;
        if (!(credentials && credentials.id && credentials.key && credentials.algorithm)) return "";
        if (-1 === [ "sha1", "sha256" ].indexOf(credentials.algorithm)) return "";
        var payload, algorithm, contentType, hash, artifacts = {
            ts: timestamp,
            nonce: opts.nonce || (6, 42, crypto.randomBytes(Math.ceil(5.25)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "").slice(0, 6)),
            method: method,
            resource: uri.pathname + (uri.search || ""),
            host: uri.hostname,
            port: uri.port || ("http:" === uri.protocol ? 80 : 443),
            hash: opts.hash,
            ext: opts.ext,
            app: opts.app,
            dlg: opts.dlg
        };
        artifacts.hash || !opts.payload && "" !== opts.payload || (artifacts.hash = (payload = opts.payload, 
        algorithm = credentials.algorithm, contentType = opts.contentType, (hash = crypto.createHash(algorithm)).update("hawk.1.payload\n"), 
        hash.update((contentType ? contentType.split(";")[0].trim().toLowerCase() : "") + "\n"), 
        hash.update(payload || ""), hash.update("\n"), hash.digest("base64")));
        var mac = exports.calculateMac(credentials, artifacts), hasExt = null !== artifacts.ext && void 0 !== artifacts.ext && "" !== artifacts.ext, header = 'Hawk id="' + credentials.id + '", ts="' + artifacts.ts + '", nonce="' + artifacts.nonce + (artifacts.hash ? '", hash="' + artifacts.hash : "") + (hasExt ? '", ext="' + artifacts.ext.replace(/\\/g, "\\\\").replace(/"/g, '\\"') : "") + '", mac="' + mac + '"';
        return artifacts.app && (header = header + ', app="' + artifacts.app + (artifacts.dlg ? '", dlg="' + artifacts.dlg : "") + '"'), 
        header;
    };
}
