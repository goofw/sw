function(module) {
    module.exports = {
        name: "needle",
        version: "1.6.0",
        description: "The leanest and most handsome HTTP client in the Nodelands.",
        keywords: [ "http", "https", "simple", "request", "client", "multipart", "upload", "proxy", "deflate", "timeout", "charset", "iconv", "cookie", "redirect" ],
        tags: [ "http", "https", "simple", "request", "client", "multipart", "upload", "proxy", "deflate", "timeout", "charset", "iconv", "cookie", "redirect" ],
        author: "Tomás Pollak <tomas@forkhq.com>",
        repository: {
            type: "git",
            url: "https://github.com/tomas/needle.git"
        },
        dependencies: {
            debug: "^2.1.2",
            "iconv-lite": "^0.4.4"
        },
        devDependencies: {
            mocha: "",
            sinon: "",
            should: "",
            xml2js: "",
            JSONStream: "",
            q: "",
            jschardet: ""
        },
        scripts: {
            test: "mocha test"
        },
        directories: {
            lib: "./lib"
        },
        main: "./lib/needle",
        bin: {
            needle: "./bin/needle"
        },
        license: "MIT",
        engines: {
            node: ">= 0.10.x"
        }
    };
}
