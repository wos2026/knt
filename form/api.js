/* アンケート作成システムの保存先（Apps Script ウェブアプリのURL） */
var FORM_API = 'https://script.google.com/macros/s/AKfycbzjegLLOF_KFevY8TECMDJppOjU8uHynZbJ-4zj603Z8_-lo132gMY5Q1gfcJW8GS_U/exec';

/* 幹部のログイン情報（この端末のブラウザに保存） */
var FORM_AUTH = {
  KEY: 'wos-form-token',
  token: function () { try { return localStorage.getItem(this.KEY) || ''; } catch (e) { return ''; } },
  set: function (t) { try { if (t) localStorage.setItem(this.KEY, t); else localStorage.removeItem(this.KEY); } catch (e) {} },
  post: function (body) {
    return fetch(FORM_API, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  },
  netMsg: function (e, fallback) {
    var m = (e && e.message) || '';
    return (!m || /fetch|network|load failed/i.test(m)) ? (fallback || '通信できませんでした。電波の良いところでもう一度お試しください。') : m;
  }
};
