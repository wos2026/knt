/* =========================================================
 * KNT 英雄育成状況アンケート — 設定ファイル
 * タイトル・締切・英雄リストはここを書き換えるだけで変わります
 * 製作者「FURUKANA」
 * ========================================================= */
var SURVEY = {
  // Apps Script を「ウェブアプリ」でデプロイした URL（https://script.google.com/macros/s/…/exec）
  API_URL: '',

  TITLE: '英雄育成状況アンケート',
  // 空欄なら表示しません。例：'11月14日 14:00'
  DEADLINE: '',
  LEAD: '各英雄の右上の遠征スキルLvと、★（段）がどこまで育っているかを教えてください。',

  // 所属同盟の選択肢（並び順のまま表示）
  ALLIANCES: ['KNT', 'その他'],
  // 参加可能時間の選択肢
  JOIN: ['21:00までにログインしてスタートダッシュできる', '途中参加'],

  FURNACE: ['火晶5以上', '火晶4', '火晶3', '火晶2', '火晶1', '火晶未満'],
  TROOP: ['火晶5以上', '火晶4', '火晶3', '火晶2', '火晶1', '火晶未満'],

  // type：盾 / 槍 / 弓   rarity：SSR / SR
  HEROES: [
    { name: 'ジェロニモ',   type: '盾', rarity: 'SSR' },
    { name: 'ナタリア',     type: '盾', rarity: 'SSR' },
    { name: 'フリント',     type: '盾', rarity: 'SSR' },
    { name: 'フレンダー',   type: '槍', rarity: 'SSR' },
    { name: 'ジャスミン',   type: '槍', rarity: 'SSR' },
    { name: 'アロンゾ',     type: '弓', rarity: 'SSR' },
    { name: 'ジンマン',     type: '弓', rarity: 'SSR' },
    { name: 'セルゲイ',     type: '盾', rarity: 'SR' },
    { name: 'ジェシー',     type: '槍', rarity: 'SR' },
    { name: 'パトリック',   type: '槍', rarity: 'SR' },
    { name: 'リンセツ',     type: '槍', rarity: 'SR' },
    { name: 'ルム・ボーガン', type: '槍', rarity: 'SR' },
    { name: 'バシティ',     type: '弓', rarity: 'SR' },
    { name: 'ジーナ',       type: '弓', rarity: 'SR' },
    { name: 'ソユン',       type: '弓', rarity: 'SR' },
    { name: 'ジャセル',     type: '弓', rarity: 'SR' }
  ]
};
