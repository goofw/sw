function(module, exports, __webpack_require__) {
    var xmlrpc = __webpack_require__(744), ep = module.exports = function() {
        this.clientOptions = "http://api.opensubtitles.org/xml-rpc", this.client = xmlrpc.createClient(this.clientOptions);
    };
    ep.prototype.call = function(method, args) {
        var cb = args[0], t = [];
        for (var i in delete args[0], args) t.push(args[i]);
        this.client.methodCall(method, t, cb);
    }, ep.prototype.LogIn = function(cb, username, password, language, useragent) {
        this.call("LogIn", arguments);
    }, ep.prototype.LogOut = function(cb, token) {
        this.call("LogOut", arguments);
    }, ep.prototype.SearchSubtitles = function(cb, token, t_queries) {
        this.call("SearchSubtitles", arguments);
    }, ep.prototype.SearchToMail = function(cb, token, t_langs, t_movies) {
        this.call("SearchToMail", arguments);
    }, ep.prototype.CheckSubHash = function(cb, token, t_subs_hash) {
        this.call("CheckSubHash", arguments);
    }, ep.prototype.CheckMovieHash = function(cb, token, t_movies_hash) {
        this.call("CheckMovieHash", arguments);
    }, ep.prototype.CheckMovieHash2 = function(cb, token, t_movies_hash) {
        this.call("CheckMovieHash2", arguments);
    }, ep.prototype.InsertMovieHash = function(cb, token, t_movies_info) {
        this.call("InsertMovieHash", arguments);
    }, ep.prototype.TryUploadSubtitles = function(cb, token, t_sub) {
        this.call("TryUploadSubtitles", arguments);
    }, ep.prototype.UploadSubtitles = function(cb, token, t_sub) {
        this.call("UploadSubtitles", arguments);
    }, ep.prototype.DetectLanguage = function(cb, token, t_texts) {
        this.call("DetectLanguage", arguments);
    }, ep.prototype.DownloadSubtitles = function(cb, token, t_subid) {
        this.call("DownloadSubtitles", arguments);
    }, ep.prototype.ReportWrongMovieHash = function(cb, token, IDSubMovieFile) {
        this.call("ReportWrongMovieHash", arguments);
    }, ep.prototype.ReportWrongImdbMovie = function(cb, token, t_movie) {
        this.call("ReportWrongImdbMovie", arguments);
    }, ep.prototype.GetSubLanguages = function(cb, language) {
        this.call("GetSubLanguages", arguments);
    }, ep.prototype.GetAvailableTranslations = function(cb, token, program) {
        this.call("GetAvailableTranslations", arguments);
    }, ep.prototype.GetTranslation = function(cb, token, iso639, format, program) {
        this.call("GetTranslation", arguments);
    }, ep.prototype.SearchMoviesOnIMDB = function(cb, token, query) {
        this.call("SearchMoviesOnIMDB", arguments);
    }, ep.prototype.GetIMDBMovieDetails = function(cb, token, imdbid) {
        this.call("GetIMDBMovieDetails", arguments);
    }, ep.prototype.InsertMovie = function(cb, token, t_movie) {
        this.call("InsertMovie", arguments);
    }, ep.prototype.SubtitlesVote = function(cb, token, t_vote) {
        this.call("SubtitlesVote", arguments);
    }, ep.prototype.GetComments = function(cb, token, t_subids) {
        this.call("GetComments", arguments);
    }, ep.prototype.AddComment = function(cb, token, t_comments) {
        this.call("AddComment", arguments);
    }, ep.prototype.AddRequest = function(cb, token, t_request) {
        this.call("AddRequest", arguments);
    }, ep.prototype.AutoUpdate = function(cb, program_name) {
        this.call("AutoUpdate", arguments);
    }, ep.prototype.NoOperation = function(cb, token) {
        this.call("NoOperation", arguments);
    };
}
