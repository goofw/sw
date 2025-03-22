function(module, exports, __webpack_require__) {
    const {WebVTT: WebVTT, VTTCue: VTTCue} = __webpack_require__(871);
    global.navigator = {
        userAgent: ""
    }, module.exports = function(text) {
        const parser = new WebVTT.Parser({
            VTTCue: VTTCue
        }, WebVTT.StringDecoder()), errors = [], cues = [];
        if (parser.oncue = cue => {
            cues.push(cue);
        }, parser.onparsingerror = error => {
            errors.push(error);
        }, parser.parse(text.startsWith("WEBVTT") ? text : "WEBVTT\n\n" + text), parser.flush(), 
        parser.oncue = null, parser.onparsingerror = null, 0 === cues.length && errors.length > 0) throw errors[0];
        return cues;
    };
}
