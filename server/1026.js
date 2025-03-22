function(module, exports, __webpack_require__) {
    const child = __webpack_require__(31), byline = __webpack_require__(93), events = __webpack_require__(5);
    module.exports = function() {
        const ev = new events.EventEmitter;
        var propsProc = child.spawn("powershell", [ "-command", "\n[console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding\n$sql = \"SELECT System.ItemUrl FROM SystemIndex WHERE scope='file:' AND (System.Kind IS Null OR System.Kind = 'Video') AND System.FileAttributes <> ALL BITWISE 0x2 AND NOT System.ItemUrl LIKE '%/Program Files%' AND NOT System.ItemUrl LIKE '%/SteamLibrary/%' AND NOT System.ItemUrl LIKE '%/node_modules/%' AND (System.fileExtension = '.torrent' OR System.FileExtension = '.mp4' OR System.FileExtension = '.mkv' OR System.FileExtension = '.avi')\"\n$connector = New-Object -ComObject ADODB.Connection\n$rs = New-Object -ComObject ADODB.Recordset\n$connector.Open(\"Provider=Search.CollatorDSO;Extended Properties='Application=Windows';DateTimeFormat=Ticks;\")\n$rs.Open($sql, $connector)\nWhile (-Not $rs.EOF) {\n    $pos = $rs.Fields.Item(\"System.ItemUrl\").Value.IndexOf(\":\")\n    $rs.Fields.Item(\"System.ItemUrl\").Value.Substring($pos + 1)\n    $rs.MoveNext()\n}\n" ]);
        return propsProc.on("error", (function(err) {
            ev.emit("err", err);
        })), propsProc.stdout.pipe(byline()).on("data", (function(line) {
            ev.emit("file", line.toString().trim());
        })), propsProc.stderr.on("data", (function(chunk) {
            console.log("powershell search: " + chunk.toString());
        })), propsProc.on("close", (function() {
            ev.emit("finished");
        })), ev;
    };
}
