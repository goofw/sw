function(module, exports, __webpack_require__) {
    "use strict";
    const os = __webpack_require__(21), hasFlag = __webpack_require__(575), env = process.env;
    let forceColor;
    function getSupportLevel(stream) {
        const level = (function(stream) {
            if (!1 === forceColor) return 0;
            if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) return 3;
            if (hasFlag("color=256")) return 2;
            if (stream && !stream.isTTY && !0 !== forceColor) return 0;
            const min = forceColor ? 1 : 0;
            if ("win32" === process.platform) {
                const osRelease = os.release().split(".");
                return Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586 ? Number(osRelease[2]) >= 14931 ? 3 : 2 : 1;
            }
            if ("CI" in env) return [ "TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI" ].some((sign => sign in env)) || "codeship" === env.CI_NAME ? 1 : min;
            if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
            if ("truecolor" === env.COLORTERM) return 3;
            if ("TERM_PROGRAM" in env) {
                const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
                switch (env.TERM_PROGRAM) {
                  case "iTerm.app":
                    return version >= 3 ? 3 : 2;

                  case "Apple_Terminal":
                    return 2;
                }
            }
            return /-256(color)?$/i.test(env.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM) || "COLORTERM" in env ? 1 : (env.TERM, 
            min);
        })(stream);
        return (function(level) {
            return 0 !== level && {
                level: level,
                hasBasic: !0,
                has256: level >= 2,
                has16m: level >= 3
            };
        })(level);
    }
    hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") ? forceColor = !1 : (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) && (forceColor = !0), 
    "FORCE_COLOR" in env && (forceColor = 0 === env.FORCE_COLOR.length || 0 !== parseInt(env.FORCE_COLOR, 10)), 
    module.exports = {
        supportsColor: getSupportLevel,
        stdout: getSupportLevel(process.stdout),
        stderr: getSupportLevel(process.stderr)
    };
}
