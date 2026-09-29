#!/usr/bin/env python3
import socket, struct, json, urllib.request, sys

WEBHOOK_ID = "GIZLI_WEBHOOK_ID_BURAYA"
WEBHOOK_TOKEN = "GIZLI_WEBHOOK_TOKEN_BURAYA"
MESSAGE_ID_FILE = "/root/scripts/servers_message_id.txt"
GIF_URL = "https://cdn.discordapp.com/attachments/1544091058437234798/1544106019016409120/ayirma-cubugu.gif"

SERVERS = [
    {
        "name": "Medieval Fantasy",
        "host": "127.0.0.1",
        "port": 25567,
        "public_addr": "31.58.91.7:25567",
        "max_players": 10,
    },
]

NAME_WIDTH = max(len(s["name"]) for s in SERVERS)

def encode_varint(value):
    out = b""
    while True:
        b = value & 0x7F
        value >>= 7
        if value:
            out += struct.pack("B", b | 0x80)
        else:
            out += struct.pack("B", b)
            return out

def encode_string(s):
    data = s.encode("utf-8")
    return encode_varint(len(data)) + data

def read_varint(sock):
    value = 0
    pos = 0
    while True:
        b = sock.recv(1)
        if not b:
            raise ConnectionError("no data")
        b = b[0]
        value |= (b & 0x7F) << pos
        if not (b & 0x80):
            break
        pos += 7
    return value

def recvall(sock, n):
    data = b""
    while len(data) < n:
        chunk = sock.recv(n - len(data))
        if not chunk:
            raise ConnectionError("closed")
        data += chunk
    return data

def query_players(host, port):
    s = socket.create_connection((host, port), timeout=5)
    try:
        handshake = encode_varint(0) + encode_varint(763) + encode_string(host) + struct.pack(">H", port) + encode_varint(1)
        packet = encode_varint(len(handshake)) + handshake
        s.sendall(packet)

        status_req = encode_varint(0)
        s.sendall(encode_varint(len(status_req)) + status_req)

        length = read_varint(s)
        payload = recvall(s, length)
        pid = payload[0]
        offset = 1
        strlen = 0
        shift = 0
        while True:
            b = payload[offset]
            offset += 1
            strlen |= (b & 0x7F) << shift
            if not (b & 0x80):
                break
            shift += 7
        json_str = payload[offset:offset + strlen].decode("utf-8")
        data = json.loads(json_str)
        online = data.get("players", {}).get("online", 0)
        return online
    finally:
        s.close()

def build_server_line(server):
    # Server is either reachable (online) or not - no maintenance/yellow state.
    try:
        online = query_players(server["host"], server["port"])
        status_emoji = "\U0001F7E2"
    except Exception:
        online = 0
        status_emoji = "\U0001F534"

    name_padded = server["name"].ljust(NAME_WIDTH)
    return f"{status_emoji} **[ `{name_padded}` ]** 一 `{server['public_addr']}` | `{online}/{server['max_players']}`"

def build_payload():
    lines = [build_server_line(s) for s in SERVERS]
    lines_block = "\n".join(lines)
    return {
        "flags": 32768,
        "components": [
            {
                "type": 17,
                "accent_color": 9498256,
                "components": [
                    {"type": 14},
                    {"type": 10, "content": f"## \U0001F5A5️ Sunucularımız\n{lines_block}"},
                    {"type": 12, "items": [{"media": {"url": GIF_URL}}]}
                ]
            }
        ]
    }

def send_or_edit(payload):
    try:
        with open(MESSAGE_ID_FILE) as f:
            message_id = f.read().strip()
    except FileNotFoundError:
        message_id = None

    body = json.dumps(payload).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MultiverseSuperheroesBot/1.0)",
    }

    if message_id:
        url = f"https://discord.com/api/webhooks/{WEBHOOK_ID}/{WEBHOOK_TOKEN}/messages/{message_id}?with_components=true"
        req = urllib.request.Request(url, data=body, method="PATCH", headers=headers)
    else:
        url = f"https://discord.com/api/webhooks/{WEBHOOK_ID}/{WEBHOOK_TOKEN}?with_components=true&wait=true"
        req = urllib.request.Request(url, data=body, method="POST", headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = resp.read()
            if not message_id:
                new_id = json.loads(resp_data)["id"]
                with open(MESSAGE_ID_FILE, "w") as f:
                    f.write(new_id)
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"HTTP error: {e.code} {e.read()}\n")

def main():
    payload = build_payload()
    send_or_edit(payload)

if __name__ == "__main__":
    main()
