function(module) {
    module.exports = {
        name: "node-ssdp-js",
        version: "0.9.6",
        description: "A node.js SSDP client and server library",
        main: "index.js",
        scripts: {
            test: "standard --fix"
        },
        repository: {
            type: "git",
            url: "git+https://github.com/brandonlehmann/node-ssdp-js.git"
        },
        keywords: [ "SSDP", "client", "server" ],
        author: "Brandon Lehmann <brandonlehmann@gmail.com>",
        license: "MIT",
        bugs: {
            url: "https://github.com/brandonlehmann/node-ssdp-js/issues"
        },
        homepage: "https://github.com/brandonlehmann/node-ssdp-js#readme",
        dependencies: {
            extend: "^3.0.0",
            uuid: "^3.0.1"
        },
        devDependencies: {
            standard: "^8.6.0"
        }
    };
}
