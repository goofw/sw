function(module, exports) {
    module.exports = {
        isValidErrorCode: function(code) {
            return code >= 1e3 && code <= 1011 && 1004 != code && 1005 != code && 1006 != code || code >= 3e3 && code <= 4999;
        },
        1e3: "normal",
        1001: "going away",
        1002: "protocol error",
        1003: "unsupported data",
        1004: "reserved",
        1005: "reserved for extensions",
        1006: "reserved for extensions",
        1007: "inconsistent or invalid data",
        1008: "policy violation",
        1009: "message too big",
        1010: "extension handshake missing",
        1011: "an unexpected condition prevented the request from being fulfilled"
    };
}
