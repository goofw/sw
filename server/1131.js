function(module) {
    module.exports = {
        $id: "request.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        required: [ "method", "url", "httpVersion", "cookies", "headers", "queryString", "headersSize", "bodySize" ],
        properties: {
            method: {
                type: "string"
            },
            url: {
                type: "string",
                format: "uri"
            },
            httpVersion: {
                type: "string"
            },
            cookies: {
                type: "array",
                items: {
                    $ref: "cookie.json#"
                }
            },
            headers: {
                type: "array",
                items: {
                    $ref: "header.json#"
                }
            },
            queryString: {
                type: "array",
                items: {
                    $ref: "query.json#"
                }
            },
            postData: {
                $ref: "postData.json#"
            },
            headersSize: {
                type: "integer"
            },
            bodySize: {
                type: "integer"
            },
            comment: {
                type: "string"
            }
        }
    };
}
