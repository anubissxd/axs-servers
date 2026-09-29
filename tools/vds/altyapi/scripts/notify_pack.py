#!/usr/bin/env python3
# Guncelleme duyurusu (Update kanali): notify_pack.py "<baslik>" <surum> < notlar.md
# Gece (TR 01-08) yeni mesaj atmaz, son duyuruya embed ekler. Son mesaj ID: LAST_ID_FILE.
import sys, os, json, re, datetime, urllib.request, urllib.error
WEBHOOK = "https://discord.com/api/webhooks/GIZLI_ID/GIZLI_TOKEN"
LAST_ID_FILE = "/root/scripts/update_message_id.txt"
name, version = sys.argv[1], sys.argv[2]
notes = sys.stdin.read().strip()
notes = re.sub(r'^#+ .*\n', '', notes, count=1).strip()
if len(notes) > 3900: notes = notes[:3900] + "\n…"
embed = {
    "title": f"{name} v{version} yayınlandı",
    "description": notes,
    "color": 0x1F3A93,
    "footer": {"text": "AnuDownloader'ı aç → Kur / Güncelle. Oyun kapalıyken."}
}
HEADERS = {"Content-Type": "application/json", "User-Agent": "anubis-pack-notify/1.0"}

def call(url, method, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

# Gece (TR 01-08) herkesi @everyone ile uyandirma: son duyuru mesajina yeni surumu ekle.
tr_hour = (datetime.datetime.utcnow() + datetime.timedelta(hours=3)).hour
last_id = open(LAST_ID_FILE).read().strip() if os.path.exists(LAST_ID_FILE) else ""
if 1 <= tr_hour < 8 and last_id:
    try:
        msg = call(f"{WEBHOOK}/messages/{last_id}", "GET")
        embeds = (msg.get("embeds") or [])[-9:] + [embed]  # Discord en fazla 10 embed
        call(f"{WEBHOOK}/messages/{last_id}", "PATCH", {"embeds": embeds})
        print("gece: son mesaj guncellendi:", last_id)
        sys.exit(0)
    except urllib.error.HTTPError as e:
        print("son mesaj duzenlenemedi, yeni mesaj atiliyor:", e.code)

payload = {"username": "Minecraft", "content": "@everyone", "embeds": [embed],
           "allowed_mentions": {"parse": ["everyone"]}}
mid = call(WEBHOOK + "?wait=true", "POST", payload).get("id")
open(LAST_ID_FILE, "w").write(str(mid))
print("gonderildi:", mid)
