// Ortak NPC diyalog yardımcıları: NPC'lerin cevapları sohbet yerine Easy NPC diyalog penceresinde açılır.
// Her NPC'nin '<npc>_yanit' adlı bir cevap diyaloğu vardır (yoksa buradan kendiliğinden eklenir). Cevap metni bu diyaloğa yazılır, sonra
// oyuncuya 'easy_npc dialog open' ile açılır. Aynı tikte gelen sözler tek pencerede birleşir. Yazılamazsa (NPC yüklü değil vb.) sohbete düşülür.
// Notlar:
//  - 'data modify' değer zaten aynıysa başarısız (0) döner; bu yüzden önce yer tutucu ('.'), sonra gerçek metin yazılır.
//  - Minecraft'ın tırnaklı SNBT dizgesinde '\n' kaçışı yoktur (yalnızca \\ ve \"); satır sonu gerçek satır sonu karakteriyle girer.
// Not: server_scripts dosyaları aynı scope'ta çalışır, isimler benzersiz olmalı (npcDlg önekli).

var npcDlgPending = {}

function npcDlgEsc(s) {
  return String(s).split('\\').join('\\\\').split('"').join('\\"')
}

// NPC'de cevap diyaloğu yoksa ekler (Tamam. düğmeli, kapatılabilir).
function npcDlgEnsure(server, uuid, dlg) {
  var val = '{Options:{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"},Texts:[{Text:"."}],Label:"' + dlg + '",Buttons:[{Name:"Tamam.",Actions:[{Type:"CLOSE_DIALOG"}]}],Name:"' + dlg + '"}'
  server.runCommandSilent('execute unless data entity ' + uuid + ' DialogData.DialogDataSet[{Name:"' + dlg + '"}] run data modify entity ' + uuid + ' DialogData.DialogDataSet append value ' + val)
}

// Diyalogdaki bir alanı yazar (yer tutucu + gerçek değer). Başarıyı döndürür.
function npcDlgWrite(server, uuid, dlg, path, value) {
  var base = 'data modify entity ' + uuid + ' DialogData.DialogDataSet[{Name:"' + dlg + '"}].' + path + ' set value '
  var ok = 0
  try {
    server.runCommandSilent(base + '"."')
    ok = server.runCommandSilent(base + '"' + npcDlgEsc(value) + '"')
    if (!(ok > 0) && String(value).indexOf('\n') >= 0) ok = server.runCommandSilent(base + '"' + npcDlgEsc(String(value).split('\n').join(' ')) + '"')
  } catch (e) {
    console.error('npc diyalog yazma hata: ' + e)
    ok = 0
  }
  if (!(ok > 0)) console.error('npc diyalog yazilamadi: ' + dlg + ' ' + path + ' (NPC yuklu mu, diyalog var mi?)')
  return ok > 0
}

function npcDlgOpen(server, uuid, name, dlg) {
  server.runCommandSilent('easy_npc dialog open ' + uuid + ' ' + name + ' ' + dlg)
}

// Cevabı kuyruğa alır; aynı tikte gelenler birleşir. newLine=true ise önceki metinden sonra yeni satır başlar (liste/kayıt gösterimi), değilse boşluk.
// chatFn(metin): diyalog yazılamazsa her parça için çağrılır (eski sohbet çıktısı).
function npcDlgSay(server, uuid, dlg, name, text, newLine, chatFn) {
  var key = uuid + '|' + name
  var first = !npcDlgPending[key]
  if (first) npcDlgPending[key] = []
  npcDlgPending[key].push({ t: String(text).split('**').join(''), nl: !!newLine })
  if (first) server.scheduleInTicks(1, () => npcDlgFlush(server, uuid, dlg, name, key, chatFn))
}

function npcDlgFlush(server, uuid, dlg, name, key, chatFn) {
  var list = npcDlgPending[key]
  delete npcDlgPending[key]
  if (!list) return
  var text = ''
  for (var i = 0; i < list.length; i++) text += (i === 0 ? '' : (list[i].nl ? '\n' : ' ')) + list[i].t
  npcDlgEnsure(server, uuid, dlg)
  if (npcDlgWrite(server, uuid, dlg, 'Texts[0].Text', text)) {
    npcDlgOpen(server, uuid, name, dlg)
  } else {
    list.forEach(it => chatFn(it.t))
  }
}
