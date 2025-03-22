function(module, exports, __webpack_require__) {
    "use strict";
    var childProcess = __webpack_require__(31), spawn = childProcess.spawn, exec = childProcess.exec;
    function killAll(tree, signal, callback) {
        var killed = {};
        try {
            Object.keys(tree).forEach((function(pid) {
                tree[pid].forEach((function(pidpid) {
                    killed[pidpid] || (killPid(pidpid, signal), killed[pidpid] = 1);
                })), killed[pid] || (killPid(pid, signal), killed[pid] = 1);
            }));
        } catch (err) {
            if (callback) return callback(err);
            throw err;
        }
        if (callback) return callback();
    }
    function killPid(pid, signal) {
        try {
            process.kill(parseInt(pid, 10), signal);
        } catch (err) {
            if ("ESRCH" !== err.code) throw err;
        }
    }
    function buildProcessTree(parentPid, tree, pidsToProcess, spawnChildProcessesList, cb) {
        var ps = spawnChildProcessesList(parentPid), allData = "";
        ps.stdout.on("data", (function(data) {
            data = data.toString("ascii"), allData += data;
        })), ps.on("close", (function(code) {
            delete pidsToProcess[parentPid], 0 == code ? allData.match(/\d+/g).forEach((function(pid) {
                pid = parseInt(pid, 10), tree[parentPid].push(pid), tree[pid] = [], pidsToProcess[pid] = 1, 
                buildProcessTree(pid, tree, pidsToProcess, spawnChildProcessesList, cb);
            })) : 0 == Object.keys(pidsToProcess).length && cb();
        }));
    }
    module.exports = function(pid, signal, callback) {
        if ("function" == typeof signal && void 0 === callback && (callback = signal, signal = void 0), 
        pid = parseInt(pid), Number.isNaN(pid)) {
            if (callback) return callback(new Error("pid must be a number"));
            throw new Error("pid must be a number");
        }
        var tree = {}, pidsToProcess = {};
        switch (tree[pid] = [], pidsToProcess[pid] = 1, process.platform) {
          case "win32":
            exec("taskkill /pid " + pid + " /T /F", callback);
            break;

          case "darwin":
            buildProcessTree(pid, tree, pidsToProcess, (function(parentPid) {
                return spawn("pgrep", [ "-P", parentPid ]);
            }), (function() {
                killAll(tree, signal, callback);
            }));
            break;

          default:
            buildProcessTree(pid, tree, pidsToProcess, (function(parentPid) {
                return spawn("ps", [ "-o", "pid", "--no-headers", "--ppid", parentPid ]);
            }), (function() {
                killAll(tree, signal, callback);
            }));
        }
    };
}
