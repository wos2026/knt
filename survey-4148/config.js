/* =========================================================
 * KNT 英雄育成状況アンケート — 設定ファイル
 * タイトル・締切・英雄リストはここを書き換えるだけで変わります
 * 製作者「FURUKANA」
 * ========================================================= */
var SURVEY = {
  // Apps Script を「ウェブアプリ」でデプロイした URL（https://script.google.com/macros/s/…/exec）
  API_URL: '',

  TITLE: '11月21日 4148王国 王城戦 英雄育成アンケート（準備中）',
  // 空欄なら表示しません。例：'11月14日 14:00'
  DEADLINE: '',
  // この日時を過ぎると回答ページが受付終了になります（日本時間）。空欄なら止めません
  CLOSE_AT: '',
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

  // type：盾 / 槍 / 弓   rarity：見出し（この順に表示）   icon：顔アイコン画像
  HEROES: [
    { name: 'アクモス', type: '盾', rarity: '第4世代', icon: 'heroes/akmos.jpg' },
    { name: 'レイナ', type: '槍', rarity: '第4世代', icon: 'heroes/reina.jpg' },
    { name: 'リオン', type: '弓', rarity: '第4世代', icon: 'heroes/lion.jpg' },
    { name: 'ローガン', type: '盾', rarity: '第3世代', icon: 'heroes/logan.jpg' },
    { name: 'ミア', type: '槍', rarity: '第3世代', icon: 'heroes/mia.jpg' },
    { name: 'グレッグ', type: '弓', rarity: '第3世代', icon: 'heroes/greg.jpg' },
    { name: 'ジェロニモ', type: '盾', rarity: 'SSR', icon: '../survey/heroes/jeronimo.jpg' },
    { name: 'ナタリア', type: '盾', rarity: 'SSR', icon: '../survey/heroes/natalia.jpg' },
    { name: 'フリント', type: '盾', rarity: 'SSR', icon: '../survey/heroes/flint.jpg' },
    { name: 'フレンダー', type: '槍', rarity: 'SSR', icon: '../survey/heroes/philly.jpg' },
    { name: 'ジャスミン', type: '槍', rarity: 'SSR', icon: '../survey/heroes/jasmine.jpg' },
    { name: 'アロンゾ', type: '弓', rarity: 'SSR', icon: '../survey/heroes/alonso.jpg' },
    { name: 'ジンマン', type: '弓', rarity: 'SSR', icon: '../survey/heroes/zinman.jpg' },
    { name: 'セルゲイ', type: '盾', rarity: 'SR', icon: '../survey/heroes/sergey.jpg' },
    { name: 'ジェシー', type: '槍', rarity: 'SR', icon: '../survey/heroes/jessie.jpg' },
    { name: 'パトリック', type: '槍', rarity: 'SR', icon: '../survey/heroes/patrick.jpg' },
    { name: 'リンセツ', type: '槍', rarity: 'SR', icon: '../survey/heroes/lingxue.jpg' },
    { name: 'ルム・ボーガン', type: '槍', rarity: 'SR', icon: '../survey/heroes/lumak.jpg' },
    { name: 'ソユン', type: '弓', rarity: 'SR', icon: '../survey/heroes/seoyoon.jpg' },
    { name: 'ジャセル', type: '弓', rarity: 'SR', icon: '../survey/heroes/jasser.jpg' }
  ]

};
