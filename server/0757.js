function(module, exports) {
    !(function() {
        "use strict";
        var isFnodeTypes = [ "isFile", "isDirectory", "isSymbolicLink", "isBlockDevice", "isCharacterDevice", "isFIFO", "isSocket" ], fnodeTypes = [ "file", "directory", "symbolicLink", "blockDevice", "characterDevice", "FIFO", "socket" ], fnodeTypesPlural = [ "files", "directories", "symbolicLinks", "blockDevices", "characterDevices", "FIFOs", "sockets" ];
        module.exports = {
            emitNodeType: function(emitter, path, stats, next, self) {
                var num = 1 + emitter.listeners(stats.type).length + emitter.listeners("node").length;
                function nextWhenReady(flag) {
                    flag && (stats.flag = flag), 0 == (num -= 1) && next.call(self);
                }
                emitter.emit(stats.type, path, stats, nextWhenReady), emitter.emit("node", path, stats, nextWhenReady), 
                nextWhenReady();
            },
            emitNodeTypeGroups: function(emitter, path, nodes, next, self) {
                var num = 1;
                function nextWhenReady() {
                    0 == (num -= 1) && next.call(self);
                }
                fnodeTypesPlural.concat([ "nodes", "errors" ]).forEach((function(fnodeType) {
                    0 !== nodes[fnodeType].length && (num += emitter.listeners(fnodeType).length, emitter.emit(fnodeType, path, nodes[fnodeType], nextWhenReady));
                })), nextWhenReady();
            },
            isFnodeTypes: isFnodeTypes,
            fnodeTypes: fnodeTypes,
            fnodeTypesPlural: fnodeTypesPlural,
            sortFnodesByType: function(stat, fnodes) {
                var i;
                for (i = 0; i < isFnodeTypes.length; i += 1) if (stat[isFnodeTypes[i]]()) return stat.type = fnodeTypes[i], 
                void fnodes[fnodeTypesPlural[i]].push(stat);
            },
            createNodeGroups: function() {
                var nodeGroups = {};
                return fnodeTypesPlural.concat("nodes", "errors").forEach((function(fnodeTypePlural) {
                    nodeGroups[fnodeTypePlural] = [];
                })), nodeGroups;
            }
        };
    })();
}
