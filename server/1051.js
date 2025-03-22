function(module, exports, __webpack_require__) {
    var assert = __webpack_require__(15), util = __webpack_require__(0), utils = __webpack_require__(150), HttpSignatureError = (utils.HASH_ALGOS, 
    utils.PK_ALGOS, utils.HttpSignatureError), InvalidAlgorithmError = utils.InvalidAlgorithmError, validateAlgorithm = utils.validateAlgorithm;
    function ExpiredRequestError(message) {
        HttpSignatureError.call(this, message, ExpiredRequestError);
    }
    function InvalidHeaderError(message) {
        HttpSignatureError.call(this, message, InvalidHeaderError);
    }
    function InvalidParamsError(message) {
        HttpSignatureError.call(this, message, InvalidParamsError);
    }
    function MissingHeaderError(message) {
        HttpSignatureError.call(this, message, MissingHeaderError);
    }
    function StrictParsingError(message) {
        HttpSignatureError.call(this, message, StrictParsingError);
    }
    util.inherits(ExpiredRequestError, HttpSignatureError), util.inherits(InvalidHeaderError, HttpSignatureError), 
    util.inherits(InvalidParamsError, HttpSignatureError), util.inherits(MissingHeaderError, HttpSignatureError), 
    util.inherits(StrictParsingError, HttpSignatureError), module.exports = {
        parseRequest: function(request, options) {
            assert.object(request, "request"), assert.object(request.headers, "request.headers"), 
            void 0 === options && (options = {}), void 0 === options.headers && (options.headers = [ request.headers["x-date"] ? "x-date" : "date" ]), 
            assert.object(options, "options"), assert.arrayOfString(options.headers, "options.headers"), 
            assert.optionalFinite(options.clockSkew, "options.clockSkew");
            var authzHeaderName = options.authorizationHeaderName || "authorization";
            if (!request.headers[authzHeaderName]) throw new MissingHeaderError("no " + authzHeaderName + " header present in the request");
            options.clockSkew = options.clockSkew || 300;
            var date, i = 0, state = 0, substate = 0, tmpName = "", tmpValue = "", parsed = {
                scheme: "",
                params: {},
                signingString: ""
            }, authz = request.headers[authzHeaderName];
            for (i = 0; i < authz.length; i++) {
                var c = authz.charAt(i);
                switch (Number(state)) {
                  case 0:
                    " " !== c ? parsed.scheme += c : state = 1;
                    break;

                  case 1:
                    switch (Number(substate)) {
                      case 0:
                        var code = c.charCodeAt(0);
                        if (code >= 65 && code <= 90 || code >= 97 && code <= 122) tmpName += c; else {
                            if ("=" !== c) throw new InvalidHeaderError("bad param format");
                            if (0 === tmpName.length) throw new InvalidHeaderError("bad param format");
                            substate = 1;
                        }
                        break;

                      case 1:
                        if ('"' !== c) throw new InvalidHeaderError("bad param format");
                        tmpValue = "", substate = 2;
                        break;

                      case 2:
                        '"' === c ? (parsed.params[tmpName] = tmpValue, substate = 3) : tmpValue += c;
                        break;

                      case 3:
                        if ("," !== c) throw new InvalidHeaderError("bad param format");
                        tmpName = "", substate = 0;
                        break;

                      default:
                        throw new Error("Invalid substate");
                    }
                    break;

                  default:
                    throw new Error("Invalid substate");
                }
            }
            if (parsed.params.headers && "" !== parsed.params.headers ? parsed.params.headers = parsed.params.headers.split(" ") : request.headers["x-date"] ? parsed.params.headers = [ "x-date" ] : parsed.params.headers = [ "date" ], 
            !parsed.scheme || "Signature" !== parsed.scheme) throw new InvalidHeaderError('scheme was not "Signature"');
            if (!parsed.params.keyId) throw new InvalidHeaderError("keyId was not specified");
            if (!parsed.params.algorithm) throw new InvalidHeaderError("algorithm was not specified");
            if (!parsed.params.signature) throw new InvalidHeaderError("signature was not specified");
            parsed.params.algorithm = parsed.params.algorithm.toLowerCase();
            try {
                validateAlgorithm(parsed.params.algorithm);
            } catch (e) {
                throw e instanceof InvalidAlgorithmError ? new InvalidParamsError(parsed.params.algorithm + " is not supported") : e;
            }
            for (i = 0; i < parsed.params.headers.length; i++) {
                var h = parsed.params.headers[i].toLowerCase();
                if (parsed.params.headers[i] = h, "request-line" === h) {
                    if (options.strict) throw new StrictParsingError("request-line is not a valid header with strict parsing enabled.");
                    parsed.signingString += request.method + " " + request.url + " HTTP/" + request.httpVersion;
                } else if ("(request-target)" === h) parsed.signingString += "(request-target): " + request.method.toLowerCase() + " " + request.url; else {
                    var value = request.headers[h];
                    if (void 0 === value) throw new MissingHeaderError(h + " was not in the request");
                    parsed.signingString += h + ": " + value;
                }
                i + 1 < parsed.params.headers.length && (parsed.signingString += "\n");
            }
            if (request.headers.date || request.headers["x-date"]) {
                date = request.headers["x-date"] ? new Date(request.headers["x-date"]) : new Date(request.headers.date);
                var now = new Date, skew = Math.abs(now.getTime() - date.getTime());
                if (skew > 1e3 * options.clockSkew) throw new ExpiredRequestError("clock skew of " + skew / 1e3 + "s was greater than " + options.clockSkew + "s");
            }
            if (options.headers.forEach((function(hdr) {
                if (parsed.params.headers.indexOf(hdr.toLowerCase()) < 0) throw new MissingHeaderError(hdr + " was not a signed header");
            })), options.algorithms && -1 === options.algorithms.indexOf(parsed.params.algorithm)) throw new InvalidParamsError(parsed.params.algorithm + " is not a supported algorithm");
            return parsed.algorithm = parsed.params.algorithm.toUpperCase(), parsed.keyId = parsed.params.keyId, 
            parsed;
        }
    };
}
