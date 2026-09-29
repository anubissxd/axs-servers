import hashlib, uuid, json, sys
name = sys.argv[1]
b = bytearray(hashlib.md5(('OfflinePlayer:'+name).encode()).digest())
b[6] = (b[6] & 0x0f) | 0x30; b[8] = (b[8] & 0x3f) | 0x80
u = str(uuid.UUID(bytes=bytes(b)))
p = '/root/servers/medieval-fantasy/whitelist.json'
wl = [e for e in json.load(open(p)) if e['name'].lower() != name.lower()]
wl.append({'uuid': u, 'name': name})
json.dump(wl, open(p, 'w'), indent=2)
print(name, u)
