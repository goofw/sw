function(module) {
    module.exports = {
        $id: "response.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        required: [ "status", "statusText", "httpVersion", "cookies", "headers", "content", "redirectURL", "headersSize", "bodySize" ],
        properties: {
            status: {
                type: "integer"
            },
            statusText: {
                type: "string"
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
            content: {
                $ref: "content.json#"
            },
            redirectURL: {
                type: "string"
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
