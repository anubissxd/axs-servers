// Yoruichi rotalari: sahne sirasinda ve kovalama sirasinda diyalog acilmasin; kovalarken "yakalayabilirsen konusuruz".
const fs=require('fs');const out=process.argv[2];const U=process.argv[3];
const BS=String.fromCharCode(92), NL=String.fromCharCode(10);
function q(s){return '"'+s.split(BS).join(BS+BS).split('"').join(BS+'"')+'"'}
const CLOSE='{Type:"CLOSE_DIALOG"}';
const admin='{Conditions:[{Type:"PLAYER_TAG",Name:"rank_admin"}],Name:"[Admin] Kapat",Actions:['+CLOSE+']}';
const dlg='{Options:{AllowEscClose:0,ShowCloseButton:0,ButtonConditionMode:"HIDE"},Texts:[{Text:'+q('Beni yakalayabilirsen konuşuruz.')+'}],Label:"chase_bekle",Buttons:[{Name:"Tamam.",Actions:['+CLOSE+']},'+admin+'],Name:"chase_bekle"}';
const r1='/execute as @initiator if entity @s[tag=rank_vloryan,tag=!yoruichi_caught,tag=!yoruichi_scene,tag=!yoruichi_tanisti] run easy_npc dialog open '+U+' @s default';
const r2='/execute as @initiator if entity @s[tag=rank_vloryan,tag=yoruichi_tanisti,tag=!yoruichi_caught,tag=!yoruichi_scene] run easy_npc dialog open '+U+' @s chase_bekle';
const lines=['# Yoruichi rotalari: sahne/kovalama sirasinda diyalog kontrolu. Uretici: tools/yoruichi/gen_routes2.js',
'data modify entity '+U+' ActionData.ActionEventSet.ON_INTERACTION[1].Cmd set value '+q(r1),
'data modify entity '+U+' DialogData.DialogDataSet append value '+dlg,
'data modify entity '+U+' ActionData.ActionEventSet.ON_INTERACTION append value {Type:"COMMAND",PermLevel:3,Cmd:'+q(r2)+'}',
'tellraw @s {"text":"Yoruichi rotalari güncellendi.","color":"green"}'];
fs.writeFileSync(out,lines.join(NL)+NL);console.log('ok',lines.length);
