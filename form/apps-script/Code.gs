/**
 * ホワサバ 英雄育成アンケート作成システム — 共通の保存用 Apps Script
 * 製作者「FURUKANA」
 *
 * ひとつのスプレッドシートで、複数のアンケート（同盟・サーバー別）をまとめて保存します。
 *  シート「アンケート」… 作成されたアンケートの設定（1行 = 1アンケート）
 *  シート「回答」      … 全アンケートの回答（1行 = 1人分、アンケートIDで区別）
 *  シート「幹部」      … 幹部のログインID（パスワードは暗号化して保存）
 *
 * 幹部は合言葉を使って自分でID・パスワードを登録し、ログインして使います。
 * 同じサーバー・同じ同盟の幹部どうしは、アンケートを共有できます。
 * パスワードを忘れた幹部は、シート「幹部」からその行を削除すると登録し直せます。
 *
 * スクリプト プロパティ（プロジェクトの設定 → スクリプト プロパティ）：
 *   CREATE_PASS … 幹部登録用の合言葉。未設定だと誰も登録できません
 *
 * デプロイ：ウェブアプリ / 次のユーザーとして実行：自分 / アクセスできるユーザー：全員
 */

var SH_SURVEYS = 'アンケート';
var SH_ANSWERS = '回答';
var SH_USERS = '幹部';
var HEAD_SURVEYS = ['ID', '管理キー', '作成日時', '更新日時', 'タイトル', 'サーバー', '同盟', '締切', '設定(JSON)', 'グループ', '作成者'];
var HEAD_USERS = ['ログインID', 'パスワード(暗号化)', 'ソルト', 'サーバー', '同盟', 'グループ', '登録日時', '最終ログイン'];
var SESSION_SEC = 21600; // ログインの有効時間（6時間。使うたびに延長）
var HEAD_ANSWERS = ['アンケートID', '名前キー', '回答日時', 'プレイヤー名', '回答(JSON)'];
var MAX_MEMBERS = 300, MAX_OPTIONS = 20, MAX_HEROES = 60;

/* ---------- 入口 ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'config') return json_(getConfig_(p.id));
    if (p.action === 'results') return json_(getResults_(p.id, p.key, null));
    if (p.action === 'admin') return json_(getAdmin_(p.id, p.key, null));
    return json_({ ok: true, service: 'wos-survey' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: '不正なリクエスト' }); }
  try {
    switch (req.action) { // 読み取りだけの操作（ロック不要）
      case 'login': return json_(login_(req));
      case 'me': return json_(me_(req));
      case 'mine': return json_(mine_(req));
      case 'results': return json_(getResults_(req.id, req.key, req.token));
      case 'admin': return json_(getAdmin_(req.id, req.key, req.token));
      case 'logout': CacheService.getScriptCache().remove('tok_' + String(req.token || '')); return json_({ ok: true });
    }
  } catch (err) {
    return json_({ ok: false, error: '処理に失敗しました：' + (err.message || err) });
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    switch (req.action) {
      case 'register': return json_(register_(req));
      case 'create': return json_(create_(req));
      case 'update': return json_(update_(req));
      case 'submit': return json_(submit_(req));
      default: return json_({ ok: false, error: '不明な操作' });
    }
  } catch (err) {
    return json_({ ok: false, error: '処理に失敗しました：' + (err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ---------- 幹部アカウント ---------- */
function register_(req) {
  var pass = prop_('CREATE_PASS');
  if (!pass) return { ok: false, error: '登録用の合言葉が未設定です（管理者に連絡）' };
  if (String(req.pass || '') !== pass) return { ok: false, error: '登録用の合言葉が違います' };
  var id = String(req.loginId || '').trim(), pw = String(req.password || '');
  var server = String(req.server || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 10);
  var alliance = String(req.alliance || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 20);
  if (!/^[A-Za-z0-9_.-]{3,20}$/.test(id)) return { ok: false, error: 'ログインIDは半角英数字（3〜20文字）で入力してください' };
  if (pw.length < 6 || pw.length > 64) return { ok: false, error: 'パスワードは6文字以上にしてください' };
  if (!server) return { ok: false, error: 'サーバー番号を入力してください' };
  if (!alliance) return { ok: false, error: '同盟名を入力してください' };
  if (findUser_(id)) return { ok: false, error: 'このログインIDはすでに使われています' };
  var salt = newId_(16), group = groupKey_(server, alliance), now = new Date();
  sheet_(SH_USERS, HEAD_USERS).appendRow([id, hash_(pw, salt), salt, server, alliance, group, now, now]);
  return { ok: true, token: newSession_({ id: id, server: server, alliance: alliance, group: group }), user: { id: id, server: server, alliance: alliance } };
}

function login_(req) {
  var id = String(req.loginId || '').trim(), pw = String(req.password || '');
  var cache = CacheService.getScriptCache(), fk = 'fail_' + id.toLowerCase();
  var fails = Number(cache.get(fk) || 0);
  if (fails >= 8) return { ok: false, error: 'ログインの失敗が続いたため、10分ほど待ってからお試しください' };
  var u = findUser_(id);
  if (!u || hash_(pw, u.salt) !== u.hash) {
    cache.put(fk, String(fails + 1), 600);
    return { ok: false, error: 'ログインIDかパスワードが違います' };
  }
  cache.remove(fk);
  try { u.sheet.getRange(u.row, 8).setValue(new Date()); } catch (x) {}
  return { ok: true, token: newSession_({ id: u.id, server: u.server, alliance: u.alliance, group: u.group }), user: { id: u.id, server: u.server, alliance: u.alliance } };
}

function me_(req) {
  var s = session_(req.token);
  if (!s) return { ok: false, needLogin: true, error: 'ログインしてください' };
  return { ok: true, user: { id: s.id, server: s.server, alliance: s.alliance } };
}

function mine_(req) {
  var s = session_(req.token);
  if (!s) return { ok: false, needLogin: true, error: 'ログインしてください' };
  var sh = sheet_(SH_SURVEYS, HEAD_SURVEYS), last = sh.getLastRow(), list = [];
  if (last > 1) {
    var vals = sh.getRange(2, 1, last - 1, HEAD_SURVEYS.length).getValues();
    var ans = sheet_(SH_ANSWERS, HEAD_ANSWERS), alast = ans.getLastRow(), counts = {};
    if (alast > 1) ans.getRange(2, 1, alast - 1, 1).getValues().forEach(function (r) { counts[r[0]] = (counts[r[0]] || 0) + 1; });
    vals.forEach(function (v) {
      if (String(v[9]) !== s.group) return;
      var cfg = {}; try { cfg = JSON.parse(v[8]); } catch (x) {}
      list.push({ id: v[0], title: v[4], deadline: cfg.deadline || '', closeAt: cfg.closeAt || '', closed: closed_(cfg),
        created: Utilities.formatDate(new Date(v[2]), 'Asia/Tokyo', 'yyyy/MM/dd'), owner: v[10] || '', answers: counts[v[0]] || 0 });
    });
  }
  list.reverse();
  return { ok: true, user: { id: s.id, server: s.server, alliance: s.alliance }, surveys: list };
}

function findUser_(id) {
  id = String(id || '').trim();
  if (!id) return null;
  var sh = sheet_(SH_USERS, HEAD_USERS);
  var hit = sh.getRange('A:A').createTextFinder(id).matchEntireCell(true).matchCase(false).findNext();
  if (!hit || hit.getRow() === 1) return null;
  var v = sh.getRange(hit.getRow(), 1, 1, HEAD_USERS.length).getValues()[0];
  return { sheet: sh, row: hit.getRow(), id: String(v[0]), hash: String(v[1]), salt: String(v[2]), server: String(v[3]), alliance: String(v[4]), group: String(v[5]) };
}
function newSession_(u) {
  var t = newId_(32);
  CacheService.getScriptCache().put('tok_' + t, JSON.stringify(u), SESSION_SEC);
  return t;
}
function session_(token) {
  token = String(token || '');
  if (!/^[A-Za-z0-9]{20,40}$/.test(token)) return null;
  var c = CacheService.getScriptCache(), v = c.get('tok_' + token);
  if (!v) return null;
  c.put('tok_' + token, v, SESSION_SEC);
  return JSON.parse(v);
}
function hash_(pw, salt) {
  var h = salt + '|' + pw;
  for (var i = 0; i < 300; i++) h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + '|' + salt));
  return h;
}
function groupKey_(server, alliance) { return norm_(server) + '|' + norm_(alliance); }
function canManage_(s, key, token) {
  if (key && String(key) === s.key) return { ok: true };
  var u = session_(token);
  if (u && s.group && u.group === s.group) return { ok: true, user: u };
  return null;
}

/* ---------- アンケートの作成・変更 ---------- */
function create_(req) {
  var u = session_(req.token);
  if (!u) return { ok: false, needLogin: true, error: 'ログインしてください' };
  req.config = req.config || {};
  req.config.server = u.server; req.config.alliance = u.alliance; // アンケートは幹部の同盟に属する
  var cfg = cleanConfig_(req.config);
  if (cfg.error) return { ok: false, error: cfg.error };
  var sh = sheet_(SH_SURVEYS, HEAD_SURVEYS);
  var id = newId_(8), key = newId_(20), now = new Date(), tries = 0;
  while (findSurvey_(id) && tries++ < 5) id = newId_(8);
  sh.appendRow([id, key, now, now, cfg.title, cfg.server, cfg.alliance, cfg.closeAt, JSON.stringify(cfg), u.group, u.id]);
  return { ok: true, id: id, key: key };
}

function update_(req) {
  var s = findSurvey_(req.id);
  var auth = s && canManage_(s, req.key, req.token);
  if (!auth) return { ok: false, error: 'アンケートが見つからないか、変更する権限がありません' };
  if (auth.user) { req.config = req.config || {}; req.config.server = s.config.server; req.config.alliance = s.config.alliance; }
  var cfg = cleanConfig_(req.config);
  if (cfg.error) return { ok: false, error: cfg.error };
  s.sheet.getRange(s.row, 4, 1, 6).setValues([[new Date(), cfg.title, cfg.server, cfg.alliance, cfg.closeAt, JSON.stringify(cfg)]]);
  CacheService.getScriptCache().remove('cfg_' + s.id);
  return { ok: true, id: s.id };
}

function cleanConfig_(c) {
  if (!c || typeof c !== 'object') return { error: '設定がありません' };
  var str = function (v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); };
  var list = function (v, n, max) {
    return (Array.isArray(v) ? v : []).map(function (x) { return str(x, n); })
      .filter(function (x, i, a) { return x && a.indexOf(x) === i; }).slice(0, max);
  };
  var out = {
    title: str(c.title, 80),
    server: str(c.server, 20),
    alliance: str(c.alliance, 20),
    gen: Math.min(6, Math.max(2, Number(c.gen) || 2)),
    lead: str(c.lead, 200),
    deadline: str(c.deadline, 40),
    closeAt: str(c.closeAt, 40),
    joinLabel: str(c.joinLabel, 40) || '参加可能時間',
    join: list(c.join, 40, MAX_OPTIONS),
    furnace: list(c.furnace, 20, MAX_OPTIONS),
    troop: list(c.troop, 20, MAX_OPTIONS),
    heroes: list(c.heroes, 20, MAX_HEROES),
    members: list(c.members, 30, MAX_MEMBERS),
    memoHint: str(c.memoHint, 80),
    publicResults: !!c.publicResults
  };
  if (!out.title) return { error: 'タイトルを入力してください' };
  if (!out.heroes.length) return { error: '英雄を1人以上選んでください' };
  if (!out.join.length) return { error: '参加可能時間の選択肢を入力してください' };
  if (!out.furnace.length || !out.troop.length) return { error: '大溶鉱炉・兵士レベルの選択肢を入力してください' };
  if (out.closeAt && isNaN(new Date(out.closeAt).getTime())) return { error: '締切の日時が正しくありません' };
  return out;
}

/* ---------- 読み出し ---------- */
function getConfig_(id) {
  var cache = CacheService.getScriptCache(), ck = 'cfg_' + String(id || '').slice(0, 20);
  var hit = cache.get(ck);
  if (hit) return JSON.parse(hit);
  var s = findSurvey_(id);
  if (!s) return { ok: false, error: 'アンケートが見つかりません' };
  var res = { ok: true, id: s.id, config: s.config };
  try { cache.put(ck, JSON.stringify(res), 120); } catch (x) {}
  return res;
}

function getAdmin_(id, key, token) {
  var s = findSurvey_(id);
  if (!s || !canManage_(s, key, token)) return { ok: false, needLogin: !key && !session_(token), error: 'アンケートが見つからないか、見る権限がありません' };
  return { ok: true, id: s.id, config: s.config };
}

function getResults_(id, key, token) {
  var s = findSurvey_(id);
  if (!s) return { ok: false, error: 'アンケートが見つかりません' };
  var admin = !!canManage_(s, key, token);
  if (!admin) {
    if (!s.config.publicResults) return token && session_(token)
      ? { ok: false, forbidden: true, error: 'このアンケートを見る権限がありません（別のサーバー・同盟のアンケートです）' }
      : { ok: false, needLogin: true, error: '集計を見るには幹部ページからログインしてください' };
    if (closed_(s.config)) return { ok: false, closed: true, error: '集計の公開は終了しました' };
  }
  var sh = sheet_(SH_ANSWERS, HEAD_ANSWERS), rows = [];
  var found = sh.getRange('A:A').createTextFinder(s.id).matchEntireCell(true).findAll();
  found.forEach(function (r) {
    var v = sh.getRange(r.getRow(), 1, 1, 5).getValues()[0];
    try {
      var a = JSON.parse(v[4]);
      a['回答日時'] = Utilities.formatDate(new Date(v[2]), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
      rows.push(a);
    } catch (x) {}
  });
  return { ok: true, id: s.id, config: s.config, admin: !!admin, rows: rows };
}

/* ---------- 回答の保存 ---------- */
function submit_(r) {
  var s = findSurvey_(r.id);
  if (!s) return { ok: false, error: 'アンケートが見つかりません' };
  if (closed_(s.config)) return { ok: false, closed: true, error: '受付は終了しました' };
  var str = function (v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); };
  var cell = function (v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }; // シートで数式にならないように
  var name = str(r.name, 40);
  if (!name) return { ok: false, error: 'プレイヤー名がありません' };
  var cfg = s.config, t = r.troops || {}, heroes = {};
  var allowed = {}; cfg.heroes.forEach(function (h) { allowed[h] = 1; });
  Object.keys(r.heroes || {}).forEach(function (hid) {
    if (!allowed[hid]) return;
    var v = r.heroes[hid] || {}, sk = Number(v.skill);
    if (!(sk >= 0 && sk <= 5)) return;
    if (sk === 0) { heroes[hid] = { skill: 0 }; return; }
    var o = { skill: sk, star: clamp_(v.star, 0, 5), step: clamp_(v.step, 0, 5) };
    if (o.star === 5) o.step = 0;
    if (v.gear != null && v.gear !== '') o.gear = clamp_(v.gear, 0, 10);
    heroes[hid] = o;
  });
  var ans = {
    'プレイヤー名': name,
    '所属同盟': str(r.alliance || cfg.alliance, 30),
    '参加可能時間': str(r.join, 40),
    '大溶鉱炉': str(r.furnace, 20),
    '総力': str(r.power, 20),
    '兵士(盾)': str(t['盾'], 20), '兵士(槍)': str(t['槍'], 20), '兵士(弓)': str(t['弓'], 20),
    'ひとこと': str(r.memo, 500),
    heroes: heroes
  };
  var sh = sheet_(SH_ANSWERS, HEAD_ANSWERS);
  var nk = s.id + '|' + norm_(name), now = new Date();
  var hit = sh.getRange('B:B').createTextFinder(nk).matchEntireCell(true).findNext();
  var row = [s.id, nk, now, cell(name), JSON.stringify(ans)];
  if (hit) { sh.getRange(hit.getRow(), 1, 1, 5).setValues([row]); return { ok: true, updated: true }; }
  sh.appendRow(row);
  return { ok: true, updated: false };
}

/* ---------- 共通 ---------- */
function findSurvey_(id) {
  id = String(id || '').trim();
  if (!/^[A-Za-z0-9]{6,20}$/.test(id)) return null;
  var sh = sheet_(SH_SURVEYS, HEAD_SURVEYS);
  var hit = sh.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
  if (!hit) return null;
  var v = sh.getRange(hit.getRow(), 1, 1, HEAD_SURVEYS.length).getValues()[0];
  var cfg = {}; try { cfg = JSON.parse(v[8]); } catch (x) {}
  return { sheet: sh, row: hit.getRow(), id: v[0], key: String(v[1]), config: cfg, group: String(v[9] || '') };
}
function closed_(cfg) { return !!cfg.closeAt && new Date() >= new Date(cfg.closeAt); }
function sheet_(name, head) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    var first = ss.getSheets()[0];
    sh = (ss.getSheets().length === 1 && first.getLastRow() === 0 && first.getName() !== SH_SURVEYS && first.getName() !== SH_ANSWERS && first.getName() !== SH_USERS)
      ? first.setName(name) : ss.insertSheet(name);
  }
  if (sh.getLastRow() === 0) { sh.appendRow(head); sh.setFrozenRows(1); }
  else if (sh.getLastColumn() < head.length) sh.getRange(1, 1, 1, head.length).setValues([head]);
  return sh;
}
function setup() { sheet_(SH_SURVEYS, HEAD_SURVEYS); sheet_(SH_ANSWERS, HEAD_ANSWERS); sheet_(SH_USERS, HEAD_USERS); }
function newId_(n) {
  var c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', s = '';
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Math.random() + Date.now());
  for (var i = 0; i < n; i++) s += c.charAt(((bytes[i % bytes.length] + 256) % 256 + i * 7) % c.length);
  return s;
}
function clamp_(v, a, b) { v = Math.round(Number(v) || 0); return Math.min(b, Math.max(a, v)); }
function norm_(s) { return String(s || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase(); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
