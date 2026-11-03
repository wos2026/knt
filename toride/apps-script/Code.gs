/**
 * 4297サーバー砦占領履歴 — 保存・履歴・スクショ読み取り用 Apps Script
 * 製作者「FURUKANA」
 *
 * スクリプト プロパティ（プロジェクトの設定 → スクリプト プロパティ）に以下を登録：
 *   PASSCODE          … 編集用の合言葉（メンバーに共有）
 *   ANTHROPIC_API_KEY … Claude API キー（メンバーには見えません）
 *   CLAUDE_MODEL      … 省略可（既定 claude-sonnet-5-5）
 *
 * 初回だけ setup を実行 → 「ウェブアプリ」としてデプロイ（アクセス：全員）。
 */

var SHEET_REC = '記録';
var SHEET_LOG = '変更履歴';
var HEAD = ['期', '日付', '1号要塞', '2号要塞', '3号要塞', '4号要塞',
  '1号砦', '2号砦', '3号砦', '4号砦', '5号砦', '6号砦', '7号砦', '8号砦', '9号砦', '10号砦', '11号砦', '12号砦',
  '拠点メモ(JSON)', '全体メモ(JSON)', '更新日時', '更新者'];

var SEED = [{"period": 1, "date": "2026-10-02", "fortress": {"1": "ARK", "2": "GaL", "3": "RAV", "4": "WSS"}, "stronghold": {"1": "", "2": "WSS", "3": "RAV", "4": "Rdd", "5": "ARK", "6": "RNE", "7": "GaL", "8": "YEK", "9": "JBA", "10": "lgo", "11": "MOF", "12": "KHK"}}, {"period": 2, "date": "2026-10-09", "fortress": {"1": "lgo", "2": "WSS", "3": "RAV", "4": "JBA"}, "stronghold": {"1": "JBA", "2": "WSS", "3": "RAV", "4": "RNE", "5": "RAV", "6": "RNE", "7": "GaL", "8": "lgo", "9": "YNS", "10": "lgo", "11": "MOF", "12": "MnB"}, "notes": {"fortress:4": "違反あり", "stronghold:9": "違反あり"}, "memo": ["初回違反① YNS（失敗）", "保有違反① JBA"]}, {"period": 3, "date": "2026-10-16", "fortress": {"1": "GaL", "2": "RAV", "3": "WSS", "4": "ARK"}, "stronghold": {"1": "RAV", "2": "WSS", "3": "RAV", "4": "GaL", "5": "RAV", "6": "RNE", "7": "GaL", "8": "lgo", "9": "lgo", "10": "lgo", "11": "ooo", "12": "ARK"}}, {"period": 4, "date": "2026-10-23", "fortress": {"1": "WSS", "2": "RAV", "3": "GaL", "4": "YEK"}, "stronghold": {"1": "RAV", "2": "WSS", "3": "RAV", "4": "GaL", "5": "RAV", "6": "RAV", "7": "GaL", "8": "lgo", "9": "lgo", "10": "GaL", "11": "ooo", "12": "YEK"}, "notes": {"fortress:4": "違反あり", "stronghold:3": "無人だった為、自動申請元のRAVが支配", "stronghold:11": "無人だった為、自動申請元のoooが支配"}, "memo": ["初回違反① ESJ（成功）"]}, {"period": 5, "date": "2026-10-30", "fortress": {"1": "WSS", "2": "GaL", "3": "RAV", "4": "RNE"}, "stronghold": {"1": "YEK", "2": "lgo", "3": "RNE", "4": "GaL", "5": "RAV", "6": "RAV", "7": "GaL", "8": "RAV", "9": "WSS", "10": "GaL", "11": "MOF", "12": "ARK"}}];

/* ---------- 初回セットアップ ---------- */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rec = ss.getSheetByName(SHEET_REC) || ss.insertSheet(SHEET_REC);
  if (rec.getLastRow() === 0) {
    rec.appendRow(HEAD);
    rec.setFrozenRows(1);
    SEED.forEach(function (p) { writeRow_(rec, p, 'setup'); });
  }
  var log = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
  if (log.getLastRow() === 0) {
    log.appendRow(['日時', '更新者', '操作', '期', '変更前(JSON)', '変更後(JSON)']);
    log.setFrozenRows(1);
  }
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PASSCODE')) props.setProperty('PASSCODE', 'knt');
}

/* ---------- 入口 ---------- */
function doGet(e) {
  return json_({ ok: true, periods: listAll_() });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: '不正なリクエスト' }); }
  var pass = PropertiesService.getScriptProperties().getProperty('PASSCODE') || '';
  if (String(req.pass || '') !== pass) return json_({ ok: false, error: '合言葉が違います' });
  try {
    switch (req.action) {
      case 'check': return json_({ ok: true });
      case 'save': return json_(save_(req.record, req.editor));
      case 'delete': return json_(remove_(req.period, req.editor));
      case 'read': return json_(readShots_(req.images || [], req.known || []));
      case 'history': return json_({ ok: true, rows: history_() });
      default: return json_({ ok: false, error: '不明な操作' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/* ---------- データ ---------- */
function sheet_(n) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n); }

function rowToRec_(r) {
  var f = {}, s = {};
  for (var i = 0; i < 4; i++) f[String(i + 1)] = String(r[2 + i] || '');
  for (var j = 0; j < 12; j++) s[String(j + 1)] = String(r[6 + j] || '');
  var d = r[1];
  if (d instanceof Date) d = Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');
  return {
    period: Number(r[0]), date: String(d || ''), fortress: f, stronghold: s,
    notes: parse_(r[18], {}), memo: parse_(r[19], [])
  };
}
function parse_(v, def) { try { return v ? JSON.parse(v) : def; } catch (e) { return def; } }

function listAll_() {
  var sh = sheet_(SHEET_REC);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD.length).getValues()
    .filter(function (r) { return r[0] !== ''; })
    .map(rowToRec_)
    .sort(function (a, b) { return a.period - b.period; });
}

function recToRow_(p, editor) {
  var row = [Number(p.period), String(p.date || '')];
  for (var i = 1; i <= 4; i++) row.push(clean_((p.fortress || {})[i]));
  for (var j = 1; j <= 12; j++) row.push(clean_((p.stronghold || {})[j]));
  var notes = {};
  Object.keys(p.notes || {}).forEach(function (k) { var v = clean_(p.notes[k], 60); if (v) notes[k] = v; });
  var memo = (p.memo || []).map(function (m) { return clean_(m, 100); }).filter(String);
  row.push(JSON.stringify(notes), JSON.stringify(memo), new Date(), clean_(editor, 30) || '名無し');
  return row;
}
function clean_(v, max) { return String(v == null ? '' : v).replace(/[\r\n\t]/g, ' ').trim().slice(0, max || 12); }

function findRow_(sh, period) {
  if (sh.getLastRow() < 2) return -1;
  var col = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) if (Number(col[i][0]) === Number(period)) return i + 2;
  return -1;
}

function writeRow_(sh, p, editor) {
  var row = recToRow_(p, editor);
  sh.getRange(sh.getLastRow() + 1, 1, 1, row.length).setValues([row]);
  sh.getRange(2, 2, Math.max(sh.getLastRow() - 1, 1), 1).setNumberFormat('@');
}

function save_(p, editor) {
  if (!p || !(Number(p.period) >= 1 && Number(p.period) <= 8)) return { ok: false, error: '期は1〜8で指定してください' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.date || ''))) return { ok: false, error: '日付が不正です' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_(SHEET_REC);
    var r = findRow_(sh, p.period), before = null;
    var row = recToRow_(p, editor);
    sh.getRange(2, 2, Math.max(sh.getLastRow(), 2), 1).setNumberFormat('@');
    if (r > 0) {
      before = rowToRec_(sh.getRange(r, 1, 1, HEAD.length).getValues()[0]);
      sh.getRange(r, 1, 1, row.length).setValues([row]);
    } else {
      sh.getRange(sh.getLastRow() + 1, 1, 1, row.length).setValues([row]);
    }
    log_(editor, r > 0 ? '修正' : '追加', p.period, before, rowToRec_(row));
    return { ok: true, periods: listAll_() };
  } finally { lock.releaseLock(); }
}

function remove_(period, editor) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_(SHEET_REC), r = findRow_(sh, period);
    if (r < 0) return { ok: false, error: 'その期の記録はありません' };
    var before = rowToRec_(sh.getRange(r, 1, 1, HEAD.length).getValues()[0]);
    sh.deleteRow(r);
    log_(editor, '削除', period, before, null);
    return { ok: true, periods: listAll_() };
  } finally { lock.releaseLock(); }
}

function log_(editor, action, period, before, after) {
  sheet_(SHEET_LOG).appendRow([new Date(), clean_(editor, 30) || '名無し', action, period,
    before ? JSON.stringify(before) : '', after ? JSON.stringify(after) : '']);
}

function history_() {
  var sh = sheet_(SHEET_LOG);
  if (sh.getLastRow() < 2) return [];
  var n = Math.min(sh.getLastRow() - 1, 30);
  return sh.getRange(sh.getLastRow() - n + 1, 1, n, 4).getValues().reverse().map(function (r) {
    return { at: Utilities.formatDate(r[0], 'Asia/Tokyo', 'M/d HH:mm'), editor: r[1], action: r[2], period: r[3] };
  });
}

/* ---------- スクショ読み取り（Claude API） ---------- */
function readShots_(images, known) {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ANTHROPIC_API_KEY');
  if (!key) return { ok: false, error: 'APIキーが未設定です（管理者に連絡）' };
  if (!images.length || images.length > 8) return { ok: false, error: 'スクショは1〜8枚にしてください' };

  var content = images.map(function (b64) {
    var m = String(b64).match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
    if (!m) throw new Error('画像の形式が不正です');
    return { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } };
  });
  content.push({ type: 'text', text:
    'Whiteout Survival の「拠点争奪 → 砦」タブのスクリーンショットです。' +
    '各拠点（1〜4号要塞、1〜12号砦）について、「【XXX】同盟名 支配中」の【】内の同盟タグを読み取ってください。\n' +
    '・タグは【】の中の英数字をそのまま書き写す。大文字小文字を区別する。\n' +
    '・小文字 l と大文字 I が紛らわしい場合は、既知のタグに合わせる。既知のタグ: ' + known.join(', ') + '\n' +
    '・支配同盟がない、または画像に写っていない拠点は空文字 "" にする。\n' +
    '・出力は次の JSON のみ。説明文は不要。\n' +
    '{"fortress":{"1":"","2":"","3":"","4":""},"stronghold":{"1":"","2":"","3":"","4":"","5":"","6":"","7":"","8":"","9":"","10":"","11":"","12":""},"unseen":["写っていなかった拠点名"]}'
  });

  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: props.getProperty('CLAUDE_MODEL') || 'claude-sonnet-5-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: content }]
    })
  });
  var code = res.getResponseCode(), body = parse_(res.getContentText(), {});
  if (code !== 200) return { ok: false, error: '読み取りに失敗しました（' + code + '）' + ((body.error && body.error.message) || '') };
  var text = (body.content || []).map(function (c) { return c.text || ''; }).join('');
  var m = text.match(/\{[\s\S]*\}/);
  if (!m) return { ok: false, error: '読み取り結果を解釈できませんでした' };
  var out = parse_(m[0], null);
  if (!out) return { ok: false, error: '読み取り結果を解釈できませんでした' };
  return { ok: true, result: out };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
