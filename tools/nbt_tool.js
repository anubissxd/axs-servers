// Minimal NBT okuma/yazma aracı (gzip'li .dat dosyaları için). Bağımlılık yok.
// Kullanım (sunucu dünyasını tek oyunculu dünyaya çevirme):
//   node nbt_tool.js singleplayer <dünya klasörü> <oyuncu-uuid-dosya-adı (uzantısız)> [yeni-uuid]
//     - <dünya>/playerdata/<uuid>.dat içeriğini level.dat'taki "Player" etiketine kopyalar (tek oyunculu dünya bunu okur),
//       cheats'i açar (allowCommands=1) ve LevelName'i düzenlemez. yeni-uuid verilirse oyuncunun UUID'si ona çevrilir.
//   node nbt_tool.js export-player <dünya klasörü> <uuid>
//     - Tersi: level.dat'taki "Player" etiketini <dünya>/playerdata/<uuid>.dat olarak yazar (UUID alanı da o uuid olur).
//       Tek oyunculu dünyayı sunucuya geri taşırken oyuncunun ilerlemesini sunucu UUID'sine aktarmak için.
//   node nbt_tool.js dump <dosya.dat> [yol]   dosyanın içeriğini (veya bir yolu) JSON olarak yazar (küçük dosyalar için)
const fs = require('fs')
const zlib = require('zlib')

const T = { END: 0, BYTE: 1, SHORT: 2, INT: 3, LONG: 4, FLOAT: 5, DOUBLE: 6, BYTE_ARRAY: 7, STRING: 8, LIST: 9, COMPOUND: 10, INT_ARRAY: 11, LONG_ARRAY: 12 }

function readTag(buf, pos, type) {
  switch (type) {
    case T.BYTE: return [{ t: type, v: buf.readInt8(pos) }, pos + 1]
    case T.SHORT: return [{ t: type, v: buf.readInt16BE(pos) }, pos + 2]
    case T.INT: return [{ t: type, v: buf.readInt32BE(pos) }, pos + 4]
    case T.LONG: return [{ t: type, v: buf.readBigInt64BE(pos) }, pos + 8]
    case T.FLOAT: return [{ t: type, v: buf.readFloatBE(pos) }, pos + 4]
    case T.DOUBLE: return [{ t: type, v: buf.readDoubleBE(pos) }, pos + 8]
    case T.BYTE_ARRAY: { const n = buf.readInt32BE(pos); return [{ t: type, v: Buffer.from(buf.subarray(pos + 4, pos + 4 + n)) }, pos + 4 + n] }
    case T.STRING: { const n = buf.readUInt16BE(pos); return [{ t: type, v: buf.subarray(pos + 2, pos + 2 + n).toString('utf8') }, pos + 2 + n] }
    case T.LIST: {
      const et = buf.readInt8(pos); const n = buf.readInt32BE(pos + 1); let p = pos + 5; const items = []
      for (let i = 0; i < n; i++) { const [tag, np] = readTag(buf, p, et); items.push(tag); p = np }
      return [{ t: type, et, v: items }, p]
    }
    case T.COMPOUND: {
      const map = new Map(); let p = pos
      for (;;) {
        const ct = buf.readInt8(p); p++
        if (ct === T.END) break
        const nl = buf.readUInt16BE(p); const name = buf.subarray(p + 2, p + 2 + nl).toString('utf8'); p += 2 + nl
        const [tag, np] = readTag(buf, p, ct); map.set(name, tag); p = np
      }
      return [{ t: type, v: map }, p]
    }
    case T.INT_ARRAY: { const n = buf.readInt32BE(pos); const a = []; for (let i = 0; i < n; i++) a.push(buf.readInt32BE(pos + 4 + i * 4)); return [{ t: type, v: a }, pos + 4 + n * 4] }
    case T.LONG_ARRAY: { const n = buf.readInt32BE(pos); const a = []; for (let i = 0; i < n; i++) a.push(buf.readBigInt64BE(pos + 4 + i * 8)); return [{ t: type, v: a }, pos + 4 + n * 8] }
    default: throw new Error('bilinmeyen NBT turu ' + type)
  }
}

function writeTag(tag, out) {
  const b = (n) => Buffer.alloc(n)
  switch (tag.t) {
    case T.BYTE: { const x = b(1); x.writeInt8(tag.v); out.push(x); break }
    case T.SHORT: { const x = b(2); x.writeInt16BE(tag.v); out.push(x); break }
    case T.INT: { const x = b(4); x.writeInt32BE(tag.v); out.push(x); break }
    case T.LONG: { const x = b(8); x.writeBigInt64BE(BigInt(tag.v)); out.push(x); break }
    case T.FLOAT: { const x = b(4); x.writeFloatBE(tag.v); out.push(x); break }
    case T.DOUBLE: { const x = b(8); x.writeDoubleBE(tag.v); out.push(x); break }
    case T.BYTE_ARRAY: { const x = b(4); x.writeInt32BE(tag.v.length); out.push(x, tag.v); break }
    case T.STRING: { const s = Buffer.from(tag.v, 'utf8'); const x = b(2); x.writeUInt16BE(s.length); out.push(x, s); break }
    case T.LIST: { const x = b(5); x.writeInt8(tag.et); x.writeInt32BE(tag.v.length, 1); out.push(x); tag.v.forEach(t => writeTag(t, out)); break }
    case T.COMPOUND: {
      tag.v.forEach((t, name) => {
        const nb = Buffer.from(name, 'utf8'); const h = b(3 + nb.length); h.writeInt8(t.t); h.writeUInt16BE(nb.length, 1); nb.copy(h, 3); out.push(h)
        writeTag(t, out)
      })
      out.push(Buffer.from([0])); break
    }
    case T.INT_ARRAY: { const x = b(4 + tag.v.length * 4); x.writeInt32BE(tag.v.length); tag.v.forEach((n, i) => x.writeInt32BE(n, 4 + i * 4)); out.push(x); break }
    case T.LONG_ARRAY: { const x = b(4 + tag.v.length * 8); x.writeInt32BE(tag.v.length); tag.v.forEach((n, i) => x.writeBigInt64BE(BigInt(n), 4 + i * 8)); out.push(x); break }
    default: throw new Error('yazılamayan NBT turu ' + tag.t)
  }
}

function load(file) {
  const raw = fs.readFileSync(file)
  const buf = raw[0] === 0x1f && raw[1] === 0x8b ? zlib.gunzipSync(raw) : raw
  const type = buf.readInt8(0)
  const nl = buf.readUInt16BE(1)
  const name = buf.subarray(3, 3 + nl).toString('utf8')
  const [tag] = readTag(buf, 3 + nl, type)
  return { name, tag }
}

function save(file, root) {
  const nb = Buffer.from(root.name, 'utf8')
  const head = Buffer.alloc(3 + nb.length); head.writeInt8(root.tag.t); head.writeUInt16BE(nb.length, 1); nb.copy(head, 3)
  const out = [head]
  writeTag(root.tag, out)
  fs.writeFileSync(file, zlib.gzipSync(Buffer.concat(out)))
}

function plain(tag) {
  switch (tag.t) {
    case T.COMPOUND: { const o = {}; tag.v.forEach((v, k) => { o[k] = plain(v) }); return o }
    case T.LIST: return tag.v.map(plain)
    case T.BYTE_ARRAY: return '[bytes ' + tag.v.length + ']'
    case T.LONG: return String(tag.v)
    default: return tag.v
  }
}

function uuidToInts(u) {
  const h = u.replace(/-/g, '')
  const out = []
  for (let i = 0; i < 4; i++) out.push(BigInt.asIntN(32, BigInt('0x' + h.slice(i * 8, i * 8 + 8))).toString())
  return out.map(Number)
}

const [cmd, a, b, c] = process.argv.slice(2)
if (cmd === 'dump') {
  const r = load(a)
  let t = r.tag
  if (b) b.split('.').forEach(k => { t = t.v.get(k) })
  console.log(JSON.stringify(plain(t), null, 1))
} else if (cmd === 'singleplayer') {
  // a = dünya klasörü, b = playerdata dosya adı (uuid), c = isteğe bağlı yeni uuid
  const lvlFile = a + '/level.dat'
  const lvl = load(lvlFile)
  const data = lvl.tag.v.get('Data')
  const player = load(a + '/playerdata/' + b + '.dat')
  const pt = player.tag
  if (c) pt.v.set('UUID', { t: T.INT_ARRAY, v: uuidToInts(c) })
  data.v.set('Player', pt)
  data.v.set('allowCommands', { t: T.BYTE, v: 1 })
  fs.copyFileSync(lvlFile, lvlFile + '.vds-orijinal')
  save(lvlFile, lvl)
  // yeniden okunabiliyor mu
  const chk = load(lvlFile)
  const pl = chk.tag.v.get('Data').v.get('Player')
  console.log('ok: Player etiketi yazıldı, alan sayısı', pl.v.size, '| allowCommands', chk.tag.v.get('Data').v.get('allowCommands').v)
} else if (cmd === 'export-player') {
  const lvl = load(a + '/level.dat')
  const pt = lvl.tag.v.get('Data').v.get('Player')
  if (!pt) throw new Error('level.dat içinde Player etiketi yok')
  pt.v.set('UUID', { t: T.INT_ARRAY, v: uuidToInts(b) })
  fs.mkdirSync(a + '/playerdata', { recursive: true })
  const out = a + '/playerdata/' + b + '.dat'
  if (fs.existsSync(out)) fs.copyFileSync(out, out + '.oncesi')
  save(out, { name: '', tag: pt })
  console.log('ok:', out)
} else {
  console.log('kullanim: node nbt_tool.js singleplayer <dünya klasörü> <uuid> [yeni-uuid] | dump <dosya> [yol]')
}
