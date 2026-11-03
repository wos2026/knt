/* =========================================================
 * KNT 英雄育成状況アンケート — 設定ファイル
 * タイトル・締切・英雄リストはここを書き換えるだけで変わります
 * 製作者「FURUKANA」
 * ========================================================= */
var SURVEY = {
  // Apps Script を「ウェブアプリ」でデプロイした URL（https://script.google.com/macros/s/…/exec）
  API_URL: 'https://script.google.com/macros/s/AKfycbzwg0lZcnUOL6OeWpnxEs-0a7AL-BW1C5HQTF6ns0gDIbVj3ZXdYdd2pnfriEqEA4tU1Q/exec',

  TITLE: '11月7日 4574サーバーSVS参加者 英雄育成アンケート',
  // 空欄なら表示しません。例：'11月14日 14:00'
  DEADLINE: '11月5日（木）13:00まで',
  // この日時を過ぎると回答ページが受付終了になります（日本時間）。空欄なら止めません
  CLOSE_AT: '2026-11-05T13:00:00+09:00',
  LEAD: '各英雄の右上の遠征スキルLvと、★（段）がどこまで育っているかを教えてください。',

  // 所属同盟の選択肢（並び順のまま表示）
  ALLIANCES: [
    '[SMG]THESHOWMUSTGOON',
    '[T9M]九十九束',
    '[nya]猫カフェ',
    '[111]HELLOKITTY',
    '[Mof]myau',
    '[EKO]栄光の同盟',
    '[NEO]ネオ',
    '[AUR]Aurora',
    '[Fwe]一般人の組',
    '[arc]ariracco',
    '[GTM]Götterdämmerung',
    '[GOT]ちーちゃん危機一髪',
    '[ebF]ワホー',
    'その他'
  ],
  // 参加可能時間の選択肢
  JOIN: ['21:00までにログインしてスタートダッシュできる', '途中参加'],

  FURNACE: ['火晶3', '火晶2', '火晶1', 'L30', 'L29', 'L28以下'],
  // 盾兵士・槍兵士・弓兵士のプルダウン
  TROOP: ['火晶3', '火晶2', '火晶1', '該当なし'],

  // type：盾 / 槍 / 弓   rarity：SSR / SR   icon：顔アイコン画像（heroes フォルダ）
  HEROES: [
    { name: 'ジェロニモ',   type: '盾', rarity: 'SSR', icon: 'heroes/jeronimo.jpg' },
    { name: 'ナタリア',     type: '盾', rarity: 'SSR', icon: 'heroes/natalia.jpg' },
    { name: 'フリント',     type: '盾', rarity: 'SSR', icon: 'heroes/flint.jpg' },
    { name: 'フレンダー',   type: '槍', rarity: 'SSR', icon: 'heroes/philly.jpg' },
    { name: 'ジャスミン',   type: '槍', rarity: 'SSR', icon: 'heroes/jasmine.jpg' },
    { name: 'アロンゾ',     type: '弓', rarity: 'SSR', icon: 'heroes/alonso.jpg' },
    { name: 'ジンマン',     type: '弓', rarity: 'SSR', icon: 'heroes/zinman.jpg' },
    { name: 'セルゲイ',     type: '盾', rarity: 'SR', icon: 'heroes/sergey.jpg' },
    { name: 'ジェシー',     type: '槍', rarity: 'SR', icon: 'heroes/jessie.jpg' },
    { name: 'パトリック',   type: '槍', rarity: 'SR', icon: 'heroes/patrick.jpg' },
    { name: 'リンセツ',     type: '槍', rarity: 'SR', icon: 'heroes/lingxue.jpg' },
    { name: 'ルム・ボーガン', type: '槍', rarity: 'SR', icon: 'heroes/lumak.jpg' },
    { name: 'ソユン',       type: '弓', rarity: 'SR', icon: 'heroes/seoyoon.jpg' },
    { name: 'ジャセル',     type: '弓', rarity: 'SR', icon: 'heroes/jasser.jpg' }
  ]
};
