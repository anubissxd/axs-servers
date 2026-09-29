#!/bin/bash
# Medieval Fantasy gece yedegi: dunya + ayarlar, 7 gun tutulur.
set -e
SRV=/root/servers/medieval-fantasy
DST=/root/backups/medieval-fantasy/auto
mkdir -p "$DST"
STAMP=$(date +%Y%m%d-%H%M)
# yazmayi durdur, diske bas, arsivle, yazmayi ac (hata olsa bile save-on mutlaka gider)
save_on() { screen -S fantasy -X stuff 'save-on\n' 2>/dev/null || true; }
trap save_on EXIT
screen -S fantasy -X stuff 'save-off\n' 2>/dev/null || true
screen -S fantasy -X stuff 'save-all flush\n' 2>/dev/null || true
sleep 15
tar -czf "$DST/$STAMP.tar.gz" -C "$SRV" world server.properties whitelist.json ops.json user_jvm_args.txt server-only-mods.txt config kubejs global_packs 2>/dev/null || [ $? -eq 1 ]  # 1 = dosya okunurken degisti uyarisi, arsiv gecerli
# 7 gunden eskileri sil
find "$DST" -name '*.tar.gz' -mtime +7 -delete
echo "$(date '+%F %T') yedek: $STAMP.tar.gz $(du -h "$DST/$STAMP.tar.gz" | cut -f1)" >> "$DST/backup.log"
