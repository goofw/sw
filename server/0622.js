function(module, exports, __webpack_require__) {
    var parseVideoName = __webpack_require__(623), MEDIA_FILE_EXTENTIONS = /.mkv$|.avi$|.mp4$|.wmv$|.vp8$|.mov$|.mpg$|.ts$|.m3u8$|.webm$|.flac$|.mp3$|.wav$|.wma$|.aac$|.ogg$/i;
    module.exports = function(files, seriesInfo) {
        if (!files || !Array.isArray(files) || !seriesInfo) return -1;
        var mediaFiles = files.filter((function(file) {
            return file.path.match(MEDIA_FILE_EXTENTIONS);
        }));
        if (0 === mediaFiles.length) return -1;
        seriesInfo.season && seriesInfo.episode || (seriesInfo = !1);
        var mediaFilesForEpisode = seriesInfo ? mediaFiles.filter((function(file) {
            try {
                var info = parseVideoName(file.path);
                return null !== info.season && isFinite(info.season) && info.season === seriesInfo.season && Array.isArray(info.episode) && -1 !== info.episode.indexOf(seriesInfo.episode);
            } catch (e) {
                return -1;
            }
        })) : [], selectedFile = (mediaFilesForEpisode.length > 0 ? mediaFilesForEpisode : mediaFiles).reduce((function(result, file) {
            return !result || file.length > result.length ? file : result;
        }), null);
        return files.indexOf(selectedFile);
    };
}
