function(module, exports, __webpack_require__) {
    __webpack_require__(2);
    var ProtoBuf = __webpack_require__(944), cast_channel = __webpack_require__(948), extensions = ProtoBuf.loadJson(cast_channel).build("extensions.api.cast_channel");
    [ "CastMessage", "AuthChallenge", "AuthResponse", "AuthError", "DeviceAuthMessage" ].forEach((function(message) {
        module.exports[message] = {
            serialize: function(data) {
                return new extensions[message](data).encode().toBuffer();
            },
            parse: function(data) {
                return extensions[message].decode(data);
            }
        };
    }));
}
