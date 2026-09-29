#!/usr/bin/env python3
# Sunucu bosken Chunky'yi kisik CPU ile calistir, oyuncu girince durdur.
import socket, struct, json, subprocess, os
STATE='/root/scripts/chunky_guard.state'
def vi(n):
    o=b''
    while True:
        b=n&0x7f; n>>=7; o+=bytes([b|(0x80 if n else 0)])
        if not n: return o
def rvi(s):
    n=0;i=0
    while True:
        b=s.recv(1)[0]; n|=(b&0x7f)<<(7*i); i+=1
        if not b&0x80: return n
def online():
    s=socket.create_connection(("127.0.0.1",25567),timeout=5)
    host=b"localhost"; p=b'\x00'+vi(763)+vi(len(host))+host+struct.pack('>H',25567)+b'\x01'
    s.sendall(vi(len(p))+p); s.sendall(b'\x01\x00'); rvi(s); rvi(s); jl=rvi(s); d=b''
    while len(d)<jl: d+=s.recv(jl-len(d))
    return json.loads(d)["players"]["online"]
def screen(cmd): subprocess.run(["screen","-S","fantasy","-X","stuff",cmd+"\n"])
def quota(q): subprocess.run(["systemctl","set-property","--runtime","minecraft-fantasy",f"CPUQuota={q}%"])
try: n=online()
except Exception: raise SystemExit  # sunucu acik degil
# durum sunucu PID'siyle tutulur: sunucu yeniden baslarsa (crash/restart) Chunky tekrar devam ettirilir
pid=subprocess.run(["systemctl","show","-p","MainPID","--value","minecraft-fantasy"],capture_output=True,text=True).stdout.strip()
prev=open(STATE).read().strip() if os.path.exists(STATE) else ""
if n==0 and prev!="gen:"+pid:
    quota(250); screen("chunky continue"); open(STATE,"w").write("gen:"+pid)
elif n>0 and prev!="play:"+pid:
    screen("chunky pause"); quota(380); open(STATE,"w").write("play:"+pid)
