function(module, exports, __webpack_require__) {
    "use strict";
    var Punycode = __webpack_require__(475), internals = {};
    internals.rules = __webpack_require__(1042).map((function(rule) {
        return {
            rule: rule,
            suffix: rule.replace(/^(\*\.|\!)/, ""),
            punySuffix: -1,
            wildcard: "*" === rule.charAt(0),
            exception: "!" === rule.charAt(0)
        };
    })), internals.endsWith = function(str, suffix) {
        return -1 !== str.indexOf(suffix, str.length - suffix.length);
    }, internals.findRule = function(domain) {
        var punyDomain = Punycode.toASCII(domain);
        return internals.rules.reduce((function(memo, rule) {
            return -1 === rule.punySuffix && (rule.punySuffix = Punycode.toASCII(rule.suffix)), 
            internals.endsWith(punyDomain, "." + rule.punySuffix) || punyDomain === rule.punySuffix ? rule : memo;
        }), null);
    }, exports.errorCodes = {
        DOMAIN_TOO_SHORT: "Domain name too short.",
        DOMAIN_TOO_LONG: "Domain name too long. It should be no more than 255 chars.",
        LABEL_STARTS_WITH_DASH: "Domain name label can not start with a dash.",
        LABEL_ENDS_WITH_DASH: "Domain name label can not end with a dash.",
        LABEL_TOO_LONG: "Domain name label should be at most 63 chars long.",
        LABEL_TOO_SHORT: "Domain name label should be at least 1 character long.",
        LABEL_INVALID_CHARS: "Domain name label can only contain alphanumeric characters or dashes."
    }, internals.validate = function(input) {
        var ascii = Punycode.toASCII(input);
        if (ascii.length < 1) return "DOMAIN_TOO_SHORT";
        if (ascii.length > 255) return "DOMAIN_TOO_LONG";
        for (var label, labels = ascii.split("."), i = 0; i < labels.length; ++i) {
            if (!(label = labels[i]).length) return "LABEL_TOO_SHORT";
            if (label.length > 63) return "LABEL_TOO_LONG";
            if ("-" === label.charAt(0)) return "LABEL_STARTS_WITH_DASH";
            if ("-" === label.charAt(label.length - 1)) return "LABEL_ENDS_WITH_DASH";
            if (!/^[a-z0-9\-]+$/.test(label)) return "LABEL_INVALID_CHARS";
        }
    }, exports.parse = function(input) {
        if ("string" != typeof input) throw new TypeError("Domain name must be a string.");
        var domain = input.slice(0).toLowerCase();
        "." === domain.charAt(domain.length - 1) && (domain = domain.slice(0, domain.length - 1));
        var error = internals.validate(domain);
        if (error) return {
            input: input,
            error: {
                message: exports.errorCodes[error],
                code: error
            }
        };
        var parsed = {
            input: input,
            tld: null,
            sld: null,
            domain: null,
            subdomain: null,
            listed: !1
        }, domainParts = domain.split(".");
        if ("local" === domainParts[domainParts.length - 1]) return parsed;
        var handlePunycode = function() {
            return /xn--/.test(domain) ? (parsed.domain && (parsed.domain = Punycode.toASCII(parsed.domain)), 
            parsed.subdomain && (parsed.subdomain = Punycode.toASCII(parsed.subdomain)), parsed) : parsed;
        }, rule = internals.findRule(domain);
        if (!rule) return domainParts.length < 2 ? parsed : (parsed.tld = domainParts.pop(), 
        parsed.sld = domainParts.pop(), parsed.domain = [ parsed.sld, parsed.tld ].join("."), 
        domainParts.length && (parsed.subdomain = domainParts.pop()), handlePunycode());
        parsed.listed = !0;
        var tldParts = rule.suffix.split("."), privateParts = domainParts.slice(0, domainParts.length - tldParts.length);
        return rule.exception && privateParts.push(tldParts.shift()), parsed.tld = tldParts.join("."), 
        privateParts.length ? (rule.wildcard && (tldParts.unshift(privateParts.pop()), parsed.tld = tldParts.join(".")), 
        privateParts.length ? (parsed.sld = privateParts.pop(), parsed.domain = [ parsed.sld, parsed.tld ].join("."), 
        privateParts.length && (parsed.subdomain = privateParts.join(".")), handlePunycode()) : handlePunycode()) : handlePunycode();
    }, exports.get = function(domain) {
        return domain && exports.parse(domain).domain || null;
    }, exports.isValid = function(domain) {
        var parsed = exports.parse(domain);
        return Boolean(parsed.domain && parsed.listed);
    };
}
