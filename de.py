server = ""
with open("server.js") as f:
    server = f.read()

STOP = 170
module_id = -1
idx = 0
while True:
    if STOP < 0: break
    start = server.find("function(", idx)
    if start == -1:
        break
    print(module_id)
    idx = server.find("{", idx)
    left = 1
    open_quote = None
    open_quote_idx = -1
    escape = False
    while left > 0:
        if STOP < 0: break
        idx += 1
        if open_quote and escape:
            escape = False
            continue
        if server[idx] in [ "'", "\"", "`", "/" ]:
            if open_quote == server[idx]:
                # F U for not escaping / in regex
                # search DAYS = [ 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ] for the stupid code
                if server[idx: idx + 3] in [ "/?]", "/=?", "/;?" ]: continue
                open_quote = None
                if module_id == 359000:
                    print('###', left, STOP, server[open_quote_idx: min(idx + 1, open_quote_idx + 200)])
                    STOP -= 1
                    continue
            elif not open_quote:
                if server[idx] == "/":
                    jdx = idx - 1
                    while jdx >= 0 and server[jdx] in [ " ", "\t", "\n" ]: jdx -= 1
                    if server[jdx] not in [ "(", "[", "{", ",", "=", ":", "!", "&", "|" ]: continue
                open_quote = server[idx]
                open_quote_idx = idx
                escape = False
        if server[idx] == "\\":
            if open_quote:
                escape = True
        if open_quote:
            continue
        if server[idx] == "{":
            left += 1
        if server[idx] == "}":
            left -= 1
    with open(f"server/{module_id:04d}.js", "w") as file:
        print(server[start : idx + 1], file = file)
    module_id += 1
    idx += 1
