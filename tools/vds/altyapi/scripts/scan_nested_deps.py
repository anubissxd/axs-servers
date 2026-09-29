import zipfile, glob, re, io, os, sys

removed = set(sys.argv[1].split(","))


def scan(z, label):
    out = []
    names = z.namelist()
    if "META-INF/mods.toml" in names:
        t = z.read("META-INF/mods.toml").decode("utf8", "ignore")
        own = re.search(r'modId\s*=\s*"([^"]+)"', t)
        own = own.group(1) if own else "?"
        for block in re.split(r"\[\[dependencies\.", t)[1:]:
            m = re.search(r'modId\s*=\s*"([^"]+)"', block)
            mand = re.search(r"mandatory\s*=\s*(true|false)", block)
            side = re.search(r'side\s*=\s*"([^"]+)"', block)
            if m and m.group(1) in removed and mand and mand.group(1) == "true":
                out.append("%s (%s) -> %s side=%s" % (label, own, m.group(1), side.group(1) if side else "-"))
    for n in names:
        if n.startswith("META-INF/jarjar/") and n.endswith(".jar"):
            try:
                out += scan(zipfile.ZipFile(io.BytesIO(z.read(n))), label + "!" + os.path.basename(n))
            except Exception:
                pass
    return out


res = []
for j in sorted(glob.glob("mods/*.jar") + glob.glob("client-extra/mods/*.jar")):
    try:
        res += scan(zipfile.ZipFile(j), os.path.basename(j))
    except Exception:
        pass
print("\n".join(res) if res else "baska zorunlu bagimlilik yok")
