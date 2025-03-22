function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(flags) {
        return {
            isLeading: (12 & flags[0]) >>> 2,
            dependsOn: 3 & flags[0],
            isDependedOn: (192 & flags[1]) >>> 6,
            hasRedundancy: (48 & flags[1]) >>> 4,
            paddingValue: (14 & flags[1]) >>> 1,
            isNonSyncSample: 1 & flags[1],
            degradationPriority: flags[2] << 8 | flags[3]
        };
    };
}
