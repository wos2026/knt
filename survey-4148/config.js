/* =========================================================
 * KNT 英雄育成状況アンケート — 設定ファイル
 * タイトル・締切・英雄リストはここを書き換えるだけで変わります
 * 製作者「FURUKANA」
 * ========================================================= */
var SURVEY = {
  // Apps Script を「ウェブアプリ」でデプロイした URL（https://script.google.com/macros/s/…/exec）
  API_URL: 'https://script.google.com/macros/s/AKfycbyYCPzv5DC1KHd_CTsFs2xQKGdzpvwROCp-1yC_duJz_S9HgJ5m_IVDQGv-5t1zUBLt7A/exec',

  TITLE: '11月21日 4148王国 王城戦 英雄育成アンケート',
  // 空欄なら表示しません。例：'11月14日 14:00'
  DEADLINE: '11月18日（水）24:00まで',
  // この日時を過ぎると回答ページが受付終了になります（日本時間）。空欄なら止めません
  CLOSE_AT: '2026-11-19T00:00:00+09:00',
  LEAD: '各英雄の右上の遠征スキルLvと、★（段）がどこまで育っているかを教えてください。',

  // 所属同盟：固定（質問は表示しません）
  ALLIANCE_FIXED: 'KNT',
  ALLIANCES: ['KNT'],
  // 名前のプルダウン（KNT同盟メンバー、総力順）。リストにない人は手入力できます
  MEMBERS: [
    '戦闘狂アリス',
    'きざみうどん食べてた',
    'Revo',
    'コンコルド',
    'peace',
    'さとりーみっく',
    'うまるん',
    'ちょいちょい',
    'ありゅん',
    'ホームメイドきのこ',
    'くりちゃー',
    'まこ珍',
    'HK_アル',
    'KENSHI',
    'かたのじ',
    'こまえもん',
    'はっぷっぷ',
    'いっちゃん29',
    'mochiko',
    'Marie',
    'Ricky',
    'シエスタ',
    'ニューまっちゃん',
    'ちゃーくり',
    'ネオン',
    'めらとり～',
    'のんのん',
    'トーマス',
    'こまりん',
    'アビス',
    'かじゅ',
    'Mugi',
    'makoton',
    'BATKEI けい',
    'xxxxxxxxxxxxxxxx',
    'ゼルダ',
    'エビアン',
    'かかお',
    'にょり～ん',
    'ハンサム',
    'Shiro',
    'コマキ',
    'つきみ',
    '百目鬼',
    'サムス',
    'カールソン',
    'アッサム',
    'バニラ',
    'たかひろさんちの',
    '萌やしっ娘',
    'ニコラウス',
    'himawari',
    'れぼ2',
    'こゆん',
    'おぎまっする',
    'シガンシナ区',
    'PRIMO',
    'miiia',
    'ざーなん',
    'まぁにぃ',
    'MAOMAO',
    'Marion',
    'あちゃま',
    'にょり助おじさん'
  ],
  // 参加可能時間の選択肢
  JOIN: ['21:00までにログインしてスタートダッシュできる', '22:00以降途中参加', '参加出来ない'],

  FURNACE: ['FC5', 'FC4', 'FC3', 'FC2', 'FC1'],
  // 盾兵士・槍兵士・弓兵士のプルダウン
  TROOP: ['FC5', 'FC4', 'FC3', 'FC2', 'FC1', '該当なし'],

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
    { name: 'ジェシー', type: '槍', rarity: 'SR', icon: '../survey/heroes/jessie.jpg' },
    { name: 'パトリック', type: '槍', rarity: 'SR', icon: '../survey/heroes/patrick.jpg' },
    { name: 'リンセツ', type: '槍', rarity: 'SR', icon: '../survey/heroes/lingxue.jpg' },
    { name: 'ルム・ボーガン', type: '槍', rarity: 'SR', icon: '../survey/heroes/lumak.jpg' },
    { name: 'ソユン', type: '弓', rarity: 'SR', icon: '../survey/heroes/seoyoon.jpg' },
    { name: 'ジャセル', type: '弓', rarity: 'SR', icon: '../survey/heroes/jasser.jpg' }
  ]

};
