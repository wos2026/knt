/**
 * KNT 英雄育成状況アンケート — 回答保存用 Apps Script
 * 製作者「FURUKANA」
 *
 * 使い方：
 *  1. 新しい Google スプレッドシートを作る
 *  2. 拡張機能 → Apps Script を開き、このコードを全部貼り付けて保存
 *  3. （省略可）関数「setup」を ▶実行。しなくても最初の回答時に自動でシートが作られます
 *  4. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *       次のユーザーとして実行：自分 / アクセスできるユーザー：全員
 *  5. 表示された URL（…/exec）を survey/config.js の API_URL に入れる
 *
 * 任意：スクリプト プロパティに VIEW_PASS を登録すると、
 *       集計ページを見るときに合言葉が必要になります（回答は誰でも可）。
 *
 * 締切：下の CLOSE_AT の日時を過ぎると送信を受け付けません。
 * 新しいアンケートを始めるとき：シート「回答」を名前変更して保管 → setup を再実行。
 */

// この日時を過ぎると回答を受け付けません（日本時間）。空欄 '' なら止めません
var CLOSE_AT = ''; // 締切が決まったら設定

var SHEET = '回答';
var SHEET_LOG = '送信ログ';
var BASE = ['回答日時', 'プレイヤー名', '所属同盟', '参加可能時間', '大溶鉱炉', '総力', '兵士(盾)', '兵士(槍)', '兵士(弓)', 'ひとこと'];

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if (!sh) {
    // 最初からある空のシート（シート1）があれば「回答」に名前を変えて使う
    var first = ss.getSheets()[0];
    if (ss.getSheets().length === 1 && first.getLastRow() === 0) { sh = first.setName(SHEET); }
    else { sh = ss.insertSheet(SHEET); }
  }
  if (sh.getLastRow() === 0) { sh.appendRow(BASE); sh.setFrozenRows(1); sh.setFrozenColumns(2); }
  var log = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
  if (log.getLastRow() === 0) { log.appendRow(['日時', 'プレイヤー名', '内容(JSON)']); log.setFrozenRows(1); }
}

/* ---------- 入口 ---------- */
function doGet(e) {
  var pass = prop_('VIEW_PASS');
  if (pass && String((e && e.parameter && e.parameter.pass) || '') !== pass) {
    return json_({ ok: false, needPass: true, error: pass && e && e.parameter && e.parameter.pass ? '合言葉が違います' : '合言葉が必要です' });
  }
  return json_({ ok: true, rows: list_() });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: '不正なリクエスト' }); }
  if (req.action !== 'submit') return json_({ ok: false, error: '不明な操作' });
  if (CLOSE_AT && new Date() >= new Date(CLOSE_AT)) return json_({ ok: false, closed: true, error: '受付は終了しました' });
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    return json_(submit_(req));
  } catch (err) {
    return json_({ ok: false, error: '保存に失敗しました：' + err.message });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ---------- 保存 ---------- */
function submit_(r) {
  var name = clean_(r.name, 40);
  if (!name) return { ok: false, error: 'プレイヤー名がありません' };
  var heroes = r.heroes || {};
  var sh = sheet_();
  var head = header_(sh);
  // 基本項目の列が足りなければ追加（古いシートでも動くように）
  BASE.forEach(function (c) { if (head.indexOf(c) < 0) { head.push(c); sh.getRange(1, head.length).setValue(c); } });

  // 英雄の列（スキル列「名前」と星列「名前★」）がなければ右端に追加
  Object.keys(heroes).forEach(function (h) {
    var col = clean_(h, 30);
    [col, col + '★'].forEach(function (c) {
      if (col && head.indexOf(c) < 0) { head.push(c); sh.getRange(1, head.length).setValue(c); }
    });
  });

  var row = head.map(function () { return ''; });
  var t = r.troops || {};
  var put = function (k, v) { var i = head.indexOf(k); if (i >= 0) row[i] = v; };
  put('回答日時', new Date());
  put('プレイヤー名', name);
  put('所属同盟', clean_(r.alliance, 30));
  put('参加可能時間', clean_(r.join, 60));
  put('大溶鉱炉', clean_(r.furnace, 20));
  put('総力', clean_(r.power, 20));
  put('兵士(盾)', clean_(t['盾'], 20));
  put('兵士(槍)', clean_(t['槍'], 20));
  put('兵士(弓)', clean_(t['弓'], 20));
  put('ひとこと', clean_(r.memo, 300));
  Object.keys(heroes).forEach(function (h) {
    var v = heroes[h] || {}, col = clean_(h, 30);
    var sk = Number(v.skill);
    if (!(sk >= 0 && sk <= 5)) return;
    put(col, sk === 0 ? '未所持' : sk);
    if (sk === 0) { put(col + '★', '未所持'); return; }
    var star = Math.min(5, Math.max(0, Number(v.star) || 0));
    var step = Math.min(5, Math.max(0, Number(v.step) || 0));
    put(col + '★', star === 5 ? '★5' : '★' + star + '-' + step); // 例：★4-4（★4・4段）
  });

  // 同じ名前（大文字小文字・全角半角・空白を無視）の行があれば上書き
  var key = norm_(name), updated = false, last = sh.getLastRow();
  if (last > 1) {
    var names = sh.getRange(2, 2, last - 1, 1).getValues();
    for (var i = 0; i < names.length; i++) {
      if (norm_(names[i][0]) === key) {
        sh.getRange(i + 2, 1, 1, row.length).setValues([row]); updated = true; break;
      }
    }
  }
  if (!updated) sh.appendRow(row);
  sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).setNumberFormat('yyyy/mm/dd hh:mm');

  var log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG);
  if (!log) { setup(); log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOG); }
  log.appendRow([new Date(), name, JSON.stringify(r)]);
  return { ok: true, updated: updated };
}

/* ---------- 読み出し ---------- */
function list_() {
  var sh = sheet_(), last = sh.getLastRow();
  if (last < 2) return [];
  var head = header_(sh);
  var vals = sh.getRange(2, 1, last - 1, head.length).getValues();
  return vals.filter(function (v) { return v[1] !== ''; }).map(function (v) {
    var o = { heroes: {} };
    head.forEach(function (h, i) {
      var x = v[i];
      if (x instanceof Date) x = Utilities.formatDate(x, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
      if (BASE.indexOf(h) >= 0) { o[h] = x; return; }
      if (x === '') return;
      var star = /★$/.test(h), name = star ? h.slice(0, -1) : h;
      var hv = o.heroes[name] || (o.heroes[name] = {});
      if (x === '未所持') { hv.skill = 0; return; }
      if (!star) { hv.skill = Number(x); return; }
      var m = String(x).match(/★(\d)(?:-(\d))?/);
      if (m) { hv.star = Number(m[1]); hv.step = Number(m[2] || 0); }
    });
    return o;
  });
}

/* ---------- 共通 ---------- */
function sheet_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  if (!sh) { setup(); sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET); }
  return sh;
}
function header_(sh) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String); }
function norm_(s) { return String(s || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase(); }
function clean_(s, n) {
  s = String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // 数式として解釈されないように
}
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
