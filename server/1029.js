function(module, exports, __webpack_require__) {
    module.exports = which, which.sync = function(cmd, opt) {
        for (var info = getPathInfo(cmd, opt = opt || {}), pathEnv = info.env, pathExt = info.ext, pathExtExe = info.extExe, found = [], i = 0, l = pathEnv.length; i < l; i++) {
            var pathPart = pathEnv[i];
            '"' === pathPart.charAt(0) && '"' === pathPart.slice(-1) && (pathPart = pathPart.slice(1, -1));
            var p = path.join(pathPart, cmd);
            !pathPart && /^\.[\\\/]/.test(cmd) && (p = cmd.slice(0, 2) + p);
            for (var j = 0, ll = pathExt.length; j < ll; j++) {
                var cur = p + pathExt[j];
                try {
                    if (isexe.sync(cur, {
                        pathExt: pathExtExe
                    })) {
                        if (!opt.all) return cur;
                        found.push(cur);
                    }
                } catch (ex) {}
            }
        }
        if (opt.all && found.length) return found;
        if (opt.nothrow) return null;
        throw getNotFoundError(cmd);
    };
    var isWindows = "win32" === process.platform || "cygwin" === process.env.OSTYPE || "msys" === process.env.OSTYPE, path = __webpack_require__(4), COLON = isWindows ? ";" : ":", isexe = __webpack_require__(1030);
    function getNotFoundError(cmd) {
        var er = new Error("not found: " + cmd);
        return er.code = "ENOENT", er;
    }
    function getPathInfo(cmd, opt) {
        var colon = opt.colon || COLON, pathEnv = opt.path || process.env.PATH || "", pathExt = [ "" ];
        pathEnv = pathEnv.split(colon);
        var pathExtExe = "";
        return isWindows && (pathEnv.unshift(process.cwd()), pathExt = (pathExtExe = opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM").split(colon), 
        -1 !== cmd.indexOf(".") && "" !== pathExt[0] && pathExt.unshift("")), (cmd.match(/\//) || isWindows && cmd.match(/\\/)) && (pathEnv = [ "" ]), 
        {
            env: pathEnv,
            ext: pathExt,
            extExe: pathExtExe
        };
    }
    function which(cmd, opt, cb) {
        "function" == typeof opt && (cb = opt, opt = {});
        var info = getPathInfo(cmd, opt), pathEnv = info.env, pathExt = info.ext, pathExtExe = info.extExe, found = [];
        !(function F(i, l) {
            if (i === l) return opt.all && found.length ? cb(null, found) : cb(getNotFoundError(cmd));
            var pathPart = pathEnv[i];
            '"' === pathPart.charAt(0) && '"' === pathPart.slice(-1) && (pathPart = pathPart.slice(1, -1));
            var p = path.join(pathPart, cmd);
            !pathPart && /^\.[\\\/]/.test(cmd) && (p = cmd.slice(0, 2) + p), (function E(ii, ll) {
                if (ii === ll) return F(i + 1, l);
                var ext = pathExt[ii];
                isexe(p + ext, {
                    pathExt: pathExtExe
                }, (function(er, is) {
                    if (!er && is) {
                        if (!opt.all) return cb(null, p + ext);
                        found.push(p + ext);
                    }
                    return E(ii + 1, ll);
                }));
            })(0, pathExt.length);
        })(0, pathEnv.length);
    }
}
