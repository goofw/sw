function(module) {
    module.exports = {
        name: "stremio-local-addon",
        version: "1.10.0",
        description: "Local add-on to find playable files: .torrent, .mp4, .mkv and .avi",
        main: "index.js",
        dependencies: {
            byline: "^5.0.0",
            "name-to-imdb": "^3.0.4",
            "node-fetch": "^2.3.0",
            "parse-torrent": "^6.1.2",
            "stremio-addon-sdk": "^0.6.4",
            "video-name-parser": "^1.4.6",
            which: "^1.3.1"
        },
        devDependencies: {
            "stremio-addon-client": "^1.12.1",
            tape: "^4.10.1"
        },
        scripts: {
            test: "node test/index",
            start: "node bin/addon"
        },
        repository: {
            type: "git",
            url: "git+https://github.com/Stremio/stremio-local-addon.git"
        },
        keywords: [ "stremio", "local", "bittorrent" ],
        author: "Smart Code OOD",
        license: "MIT",
        bugs: {
            url: "https://github.com/Stremio/stremio-local-addon/issues"
        },
        homepage: "https://github.com/Stremio/stremio-local-addon#readme"
    };
}
