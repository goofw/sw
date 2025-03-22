function(module, exports) {
    function formatTime(time) {
        return [ Math.floor(time / 3600), Math.floor(time / 60) % 60, (time % 60).toFixed(3) ].map((v => v < 10 ? "0" + v : v)).join(":");
    }
    module.exports = function(cues) {
        return "WEBVTT\n\n" + cues.map((cue => `${formatTime(cue.startTime)} --\x3e ${formatTime(cue.endTime)}\n${cue.text}\n`)).join("\n");
    };
}
