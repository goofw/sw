function(module, exports, __webpack_require__) {
    "use strict";
    var pubsuffix = __webpack_require__(474);
    exports.permuteDomain = function(domain) {
        var pubSuf = pubsuffix.getPublicSuffix(domain);
        if (!pubSuf) return null;
        if (pubSuf == domain) return [ domain ];
        for (var parts = domain.slice(0, -(pubSuf.length + 1)).split(".").reverse(), cur = pubSuf, permutations = [ cur ]; parts.length; ) cur = parts.shift() + "." + cur, 
        permutations.push(cur);
        return permutations;
    };
}
