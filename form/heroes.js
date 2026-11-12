/* =========================================================
 * 英雄データ（世代別）— アンケート作成システム共通
 * gen：登場する世代（0 = SR英雄、どの世代のサーバーでも対象）
 * type：盾 / 槍 / 弓   gear：専用装備あり   icon：顔アイコン（無い英雄は頭文字で表示）
 * 新しい英雄を追加するときは、この一覧に1行足すだけです
 * 製作者「FURUKANA」
 * ========================================================= */
var HERO_DB = [
  // 第1世代
  { id: 'jeronimo', name: 'ジェロニモ',   type: '盾', gen: 1, gear: true,  icon: 'heroes/jeronimo.jpg' },
  { id: 'natalia',  name: 'ナタリア',     type: '盾', gen: 1, gear: true,  icon: 'heroes/natalia.jpg' },
  { id: 'jasmine',  name: 'ジャスミン',   type: '槍', gen: 1, gear: true,  icon: 'heroes/jasmine.jpg' },
  { id: 'zinman',   name: 'ジンマン',     type: '弓', gen: 1, gear: true,  icon: 'heroes/zinman.jpg' },
  // 第2世代
  { id: 'flint',    name: 'フリント',     type: '盾', gen: 2, gear: true,  icon: 'heroes/flint.jpg' },
  { id: 'philly',   name: 'フレンダー',   type: '槍', gen: 2, gear: true,  icon: 'heroes/philly.jpg' },
  { id: 'alonso',   name: 'アロンゾ',     type: '弓', gen: 2, gear: true,  icon: 'heroes/alonso.jpg' },
  // 第3世代
  { id: 'logan',    name: 'ローガン',     type: '盾', gen: 3, gear: true,  icon: 'heroes/logan.jpg' },
  { id: 'mia',      name: 'ミア',         type: '槍', gen: 3, gear: true,  icon: 'heroes/mia.jpg' },
  { id: 'greg',     name: 'グレッグ',     type: '弓', gen: 3, gear: true,  icon: 'heroes/greg.jpg' },
  // 第4世代
  { id: 'akmos',    name: 'アクモス',     type: '盾', gen: 4, gear: true,  icon: 'heroes/akmos.jpg' },
  { id: 'reina',    name: 'レイナ',       type: '槍', gen: 4, gear: true,  icon: 'heroes/reina.jpg' },
  { id: 'lion',     name: 'リオン',       type: '弓', gen: 4, gear: true,  icon: 'heroes/lion.jpg' },
  // 第5世代
  { id: 'hector',   name: 'ヘクトー',     type: '盾', gen: 5, gear: true,  icon: 'heroes/hector.jpg' },
  { id: 'norah',    name: 'ノラ',         type: '槍', gen: 5, gear: true,  icon: 'heroes/norah.jpg' },
  { id: 'gwen',     name: 'グエン',       type: '弓', gen: 5, gear: true,  icon: 'heroes/gwen.jpg' },
  // 第6世代
  { id: 'wuming',   name: '無名',         type: '盾', gen: 6, gear: true },
  { id: 'renee',    name: 'レネ',         type: '槍', gen: 6, gear: true },
  { id: 'wayne',    name: 'ウェイン',     type: '弓', gen: 6, gear: true },
  // SR英雄（どの世代でも対象）
  { id: 'sergey',   name: 'セルゲイ',     type: '盾', gen: 0, icon: 'heroes/sergey.jpg' },
  { id: 'jessie',   name: 'ジェシー',     type: '槍', gen: 0, icon: 'heroes/jessie.jpg' },
  { id: 'patrick',  name: 'パトリック',   type: '槍', gen: 0, icon: 'heroes/patrick.jpg' },
  { id: 'lingxue',  name: 'リンセツ',     type: '槍', gen: 0, icon: 'heroes/lingxue.jpg' },
  { id: 'lumak',    name: 'ルム・ボーガン', type: '槍', gen: 0, icon: 'heroes/lumak.jpg' },
  { id: 'seoyoon',  name: 'ソユン',       type: '弓', gen: 0, icon: 'heroes/seoyoon.jpg' },
  { id: 'jasser',   name: 'ジャセル',     type: '弓', gen: 0, icon: 'heroes/jasser.jpg' },
  { id: 'bahiti',   name: 'バシティ',     type: '弓', gen: 0, icon: 'heroes/bahiti.jpg' },
  { id: 'gina',     name: 'ジーナ',       type: '弓', gen: 0, icon: 'heroes/gina.jpg' }
];

/* 対応する世代（作成ページの選択肢） */
var GEN_LIST = [2, 3, 4, 5, 6];

/* 見出し：第N世代 / SR */
function heroGroup(h) { return h.gen ? '第' + h.gen + '世代' : 'SR'; }

/* 世代ごとの初期値（作成ページで書き換え可能） */
function genDefaults(gen) {
  var fcAll = [];
  for (var j = 8; j >= 1; j--) fcAll.push('FC' + j);
  return {
    heroes: HERO_DB.filter(function (h) { return h.gen <= gen; })
      .sort(function (a, b) { return (b.gen || 0) - (a.gen || 0); })
      .map(function (h) { return h.id; }),
    furnace: fcAll.concat(['L30', 'L29', 'L28以下']),
    troop: ['T12', 'T11'].concat(fcAll, ['該当なし'])
  };
}

/* 英雄IDの並びから、表示用の英雄リストを作る（世代の新しい順 → SR） */
function heroesFromIds(ids) {
  var set = {};
  (ids || []).forEach(function (id) { set[id] = 1; });
  return HERO_DB.filter(function (h) { return set[h.id]; })
    .sort(function (a, b) { return (b.gen || 0) - (a.gen || 0); })
    .map(function (h) {
      return { id: h.id, name: h.name, type: h.type, rarity: heroGroup(h), gear: !!h.gear, icon: h.icon || '' };
    });
}
