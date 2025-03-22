function(module, exports, __webpack_require__) {
    var createHash = __webpack_require__(9).createHash;
    function md5(string) {
        return createHash("md5").update(string).digest("hex");
    }
    function basic(user, pass) {
        var str = void 0 === pass ? user : [ user, pass ].join(":");
        return "Basic " + new Buffer(str).toString("base64");
    }
    var digest = {
        parse_header: function(header) {
            for (var challenge = {}, matches = header.match(/([a-z0-9_-]+)="?([a-z0-9=\/\.@\s-]+)"?/gi), i = 0, l = matches.length; i < l; i++) {
                var parts = matches[i].split("="), key = parts.shift(), val = parts.join("=").replace(/^"/, "").replace(/"$/, "");
                challenge[key] = val;
            }
            return challenge;
        },
        update_nc: function(nc) {
            return ++nc > 99999999 && (nc = 1), nc += "", (new Array(8).join("0") + "").substr(0, 8 - nc.length) + nc;
        },
        generate: function(header, user, pass, method, path) {
            var nc = 1, cnonce = null, challenge = digest.parse_header(header), ha1 = md5(user + ":" + challenge.realm + ":" + pass), ha2 = md5(method.toUpperCase() + ":" + path), resp = [ ha1, challenge.nonce ];
            "string" == typeof challenge.qop && (cnonce = md5(Math.random().toString(36)).substr(0, 8), 
            nc = digest.update_nc(nc), resp = resp.concat(nc, cnonce)), resp = resp.concat(challenge.qop, ha2);
            var params = {
                uri: path,
                realm: challenge.realm,
                nonce: challenge.nonce,
                username: user,
                response: md5(resp.join(":"))
            };
            for (var k in challenge.qop && (params.qop = challenge.qop), challenge.opaque && (params.opaque = challenge.opaque), 
            cnonce && (params.nc = nc, params.cnonce = cnonce), header = [], params) header.push(k + '="' + params[k] + '"');
            return "Digest " + header.join(", ");
        }
    };
    module.exports = {
        header: function(header, credentials, opts) {
            var type = header.split(" ")[0], user = credentials[0], pass = credentials[1];
            return "Digest" == type ? digest.generate(header, user, pass, opts.method, opts.path) : "Basic" == type ? basic(user, pass) : void 0;
        },
        basic: basic,
        digest: digest.generate
    };
}
