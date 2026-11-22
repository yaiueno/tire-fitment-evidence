const INCH_MM = 25.4;

// アフィリエイト設定（ご自身のID・タグを設定すると自動で成果リンクに変換されます）
const AFFILIATE_CONFIG = {
  rakutenId: '', // 例: '12345678.abcdefgh.12345678.abcdefgh'
  amazonTag: '', // 例: 'yourtag-22'
  yahooSid: '',  // 例: '1234567'
  yahooPid: ''   // 例: '1234567890'
};

function buildShopUrls(keyword) {
  const q = encodeURIComponent(keyword);
  const rawRakuten = `https://search.rakuten.co.jp/search/mall/${q}/`;
  const rawAmazon = `https://www.amazon.co.jp/s?k=${q}`;
  const rawYahoo = `https://shopping.yahoo.co.jp/search?p=${q}`;

  return {
    rakuten: AFFILIATE_CONFIG.rakutenId
      ? `https://hb.afl.rakuten.co.jp/hgc/${AFFILIATE_CONFIG.rakutenId}/?pc=${encodeURIComponent(rawRakuten)}`
      : rawRakuten,
    amazon: AFFILIATE_CONFIG.amazonTag
      ? `${rawAmazon}&tag=${encodeURIComponent(AFFILIATE_CONFIG.amazonTag)}`
      : rawAmazon,
    yahoo: AFFILIATE_CONFIG.yahooSid && AFFILIATE_CONFIG.yahooPid
      ? `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${encodeURIComponent(AFFILIATE_CONFIG.yahooSid)}&pid=${encodeURIComponent(AFFILIATE_CONFIG.yahooPid)}&vc_url=${encodeURIComponent(rawYahoo)}`
      : rawYahoo
  };
}

// 最大耐荷重テーブル (LI 69..112 -> kg @ 240kPa STD / 290kPa XL)
const LI_MAX_KG = {
  69: 325, 70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387, 76: 400,
  77: 412, 78: 425, 79: 437, 80: 450, 81: 462, 82: 475, 83: 487, 84: 500,
  85: 515, 86: 530, 87: 545, 88: 560, 89: 580, 90: 600, 91: 615, 92: 630,
  93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775, 100: 800,
  101: 825, 102: 850, 103: 875, 104: 900, 105: 925, 106: 950, 107: 975,
  108: 1000, 109: 1030, 110: 1060, 111: 1090, 112: 1120
};

const COMMON_LI_MAP = {
  '145/80R12': [74, false], '145/80R13': [75, false], '155/65R13': [73, false],
  '155/65R14': [75, false], '155/70R13': [75, false], '165/55R14': [72, false],
  '165/55R15': [75, false], '165/60R15': [77, false], '165/65R14': [79, false],
  '165/70R14': [81, false], '175/65R14': [82, false], '175/65R15': [84, false],
  '175/70R14': [84, false], '175/80R16': [91, false], '185/55R15': [82, false],
  '185/55R16': [83, false], '185/60R15': [84, false], '185/65R15': [88, false],
  '195/50R16': [84, false], '195/50R19': [88, true],  '195/55R16': [87, false],
  '195/60R16': [89, false], '195/60R17': [90, false], '195/65R15': [91, false],
  '195/80R15': [107, false], '205/45R17': [88, true], '205/50R17': [93, true],
  '205/55R16': [91, false], '205/55R17': [91, false], '205/60R16': [92, false],
  '205/65R16': [95, false], '215/45R17': [91, true],  '215/45R18': [93, true],
  '215/50R17': [91, false], '215/50R18': [92, false], '215/55R17': [94, false],
  '215/55R18': [95, false], '215/60R16': [95, false], '215/60R17': [96, false],
  '215/65R16': [98, false], '215/65R17': [109, false], '225/40R18': [92, true],
  '225/45R17': [94, true],  '225/45R18': [95, true],  '225/50R17': [98, true],
  '225/55R17': [97, false], '225/55R18': [98, false], '225/55R19': [99, false],
  '225/60R17': [99, false], '225/60R18': [100, false], '225/65R17': [102, false],
  '225/65R18': [103, false], '235/40R18': [95, true], '235/45R18': [98, true],
  '235/50R18': [97, false], '235/55R18': [100, false], '235/55R19': [101, false],
  '245/40R18': [97, true],  '245/40R19': [98, true],  '265/65R17': [112, false],
  '265/70R17': [112, false]
};

const POPULAR_BUDGET_SIZES = [
  { width: 155, aspect: 65, inch: 14, note: '軽超定番・激安' },
  { width: 165, aspect: 55, inch: 15, note: '軽15インチ定番' },
  { width: 165, aspect: 65, inch: 14, note: '軽ハイト・トール定番' },
  { width: 175, aspect: 65, inch: 14, note: 'コンパクト定番・安価' },
  { width: 175, aspect: 65, inch: 15, note: 'アクア/フィット定番' },
  { width: 185, aspect: 60, inch: 15, note: 'コンパクト15定番' },
  { width: 185, aspect: 65, inch: 15, note: 'コンパクト/フリード定番' },
  { width: 195, aspect: 65, inch: 15, note: '流通量最大級・激安' },
  { width: 195, aspect: 60, inch: 16, note: 'ミドル系安価サイズ' },
  { width: 205, aspect: 55, inch: 16, note: '16インチ世界標準' },
  { width: 205, aspect: 60, inch: 16, note: 'ミニバン/セダン超定番' },
  { width: 215, aspect: 45, inch: 17, note: '17インチ最安定番' },
  { width: 215, aspect: 50, inch: 17, note: 'シビック/ミドル定番' },
  { width: 215, aspect: 55, inch: 17, note: 'SUV/セダン定番' },
  { width: 215, aspect: 60, inch: 16, note: 'ミニバン/セダン肉厚定番' },
  { width: 225, aspect: 40, inch: 18, note: '18インチ最安定番' },
  { width: 225, aspect: 45, inch: 18, note: 'スポーツ/SUV定番' },
  { width: 225, aspect: 65, inch: 17, note: 'SUV最安定番' }
];

const MAKER_DEFAULTS = {
  generic: { hubMm: 0, pcd: '要確認', pitch: '要確認', seat: '要確認', note: 'ハブ径・PCD・純正ナット座面の事前確認が必要です。' },
  toyota: { hubMm: 60, pcd: '114.3/100-5H', pitch: 'M12×P1.5', seat: '平座 (一部60°テーパー)', note: 'トヨタ普通車はハブ径60mm(コンパクトは54mm)が多く、純正アルミの多くは「ストレート平座ナット」です。' },
  honda: { hubMm: 64, pcd: '114.3-5H / 100-4H', pitch: 'M12×P1.5', seat: '12R球面', note: 'ホンダは純正ホイールが「12R球面座」のため、社外アルミへ変更時は「60°テーパーナット」の同時購入が必須です。' },
  nissan: { hubMm: 66, pcd: '114.3-5H / 100-4H', pitch: 'M12×P1.25', seat: '60°テーパー', note: '日産普通車はハブ径66mmと大きく、他社純正(54/56/60/64mm)はハブ穴が小さくて物理的に入らないケースが大半です。ネジピッチはP1.25。' },
  mazda: { hubMm: 67, pcd: '114.3-5H / 100-4H', pitch: 'M12×P1.5', seat: '60°テーパー', note: 'マツダ普通車はハブ径67mmと最大級のため、他社純正流用時はハブ干渉に注意が必要です。' },
  subaru: { hubMm: 56, pcd: '100/114.3-5H', pitch: 'M12×P1.25', seat: '60°テーパー', note: 'スバルはハブ径56mm・ネジピッチM12×P1.25。AWD車は前後左右の外径差があるとセンターデフを痛めます。' },
  kei_suzuki_daihatsu: { hubMm: 54, pcd: '100-4H', pitch: 'M12×P1.25 (ダイハツP1.5)', seat: '60°テーパー', note: 'スズキ(P1.25)・ダイハツ(P1.5)軽はハブ径54mm。日産/三菱/ホンダ軽純正(56mm)は入りますが、逆にこのホイールを日産/三菱/ホンダ軽には入れられません。' },
  kei_mitsubishi_nissan: { hubMm: 56, pcd: '100-4H', pitch: 'M12×P1.5', seat: '60°テーパー (一部平座)', note: 'デイズ/eK系はハブ径56mm。中古市場で安いスズキ・ダイハツ純正(ハブ54mm)は物理的にハブへ入らないので注意！' }
};

// 14車系の現場あるあるDB & プリセット
const CAR_ARUARU_DB = {
  kei_nbox: {
    name: 'ホンダ軽 (N-BOX / N-WGN / N-ONE)',
    maker: 'honda',
    hubMm: 56, pcd: '100-4H', pitch: 'M12×P1.5', seat: '12R球面',
    min: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, kpa: 240, li: 75, xl: false },
    max: { width: 165, aspect: 55, inch: 15, j: 4.5, et: 45, margin: 10 },
    target: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, spacer: 0, li: 75, xl: false },
    traps: [
      '【13インチNG罠】JF3以降のN-BOX（特にターボや電動パーキング車）はフロントキャリパーが大きく、安い13インチ（145/80R13等）はキャリパーに当たって履けないことが多いです。',
      '【12R球面ナット必須】ホンダ純正は球面ナット。社外ホイールを組む時は必ず60°テーパーナットを別売り案内（流用すると緩みます）。',
      '【ハブ56mm罠】スズキ・ダイハツ純正の格安中古ホイール（ハブ径54mm）はハブが刺さらず装着不可です。'
    ]
  },
  kei_dayz: {
    name: '日産・三菱軽 (デイズ / ルークス / eK / デリカミニ)',
    maker: 'kei_mitsubishi_nissan',
    hubMm: 56, pcd: '100-4H', pitch: 'M12×P1.5', seat: '60°テーパー (一部平座)',
    min: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, kpa: 240, li: 75, xl: false },
    max: { width: 165, aspect: 55, inch: 15, j: 4.5, et: 45, margin: 10 },
    target: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, spacer: 0, li: 75, xl: false },
    traps: [
      '【ハブ56mm罠】スズキ・ダイハツ純正（54mm）はハブ穴が2mm小さく物理的に入りません（ホンダ純正56mmは入るが球面ナットが必要）。',
      '【三菱/日産純正平座ナット罠】日産デイズ・ルークスの一部純正アルミは「三菱系平座ナット」仕様があり、社外ホイールに純正ナット流用不可。',
      '【ターボ15インチ車】純正165/55R15からの冬タイヤインチダウンは原則155/65R14まで。13インチはキャリパー干渉要警戒。'
    ]
  },
  kei_suzuki_daihatsu: {
    name: 'スズキ・ダイハツ軽 (スペーシア / タント / ワゴンR / ムーヴ)',
    maker: 'kei_suzuki_daihatsu',
    hubMm: 54, pcd: '100-4H', pitch: 'スズキP1.25 / ダイハツP1.5', seat: '60°テーパー',
    min: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, kpa: 240, li: 75, xl: false },
    max: { width: 165, aspect: 55, inch: 15, j: 4.5, et: 45, margin: 10 },
    target: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, spacer: 0, li: 75, xl: false },
    traps: [
      '【スズキP1.25 vs ダイハツP1.5】ホイールは共通でもナットピッチが違います（スズキはP1.25、ダイハツはトヨタ系と同じP1.5）。中古ナット販売時は要注意。',
      '【145/80R13から155/65R14】外径がほぼ同等（約562mm vs 557mm）なので、年式古めの軽でキャリパーが小さければ安価な13インチも視野（ただし新型ハイト系・ターボは14インチ〜）。',
      '【ハブ54mmの強み】車両ハブが54mmと最小クラスのため、他社軽純正(56mm)や社外品はハブ干渉しにくいです（ホンダ純正は球面ナット注意）。'
    ]
  },
  jimny_jb64: {
    name: 'ジムニー (JB64 / JB23)',
    maker: 'kei_suzuki_daihatsu',
    hubMm: 108, pcd: '139.7-5H', pitch: 'M12×P1.25', seat: '60°テーパー',
    min: { width: 175, aspect: 80, inch: 16, j: 5.5, et: 22, kpa: 180, li: 91, xl: false },
    max: { width: 185, aspect: 85, inch: 16, j: 5.5, et: 20, margin: 8 },
    target: { width: 175, aspect: 80, inch: 16, j: 5.5, et: 22, spacer: 0, li: 91, xl: false },
    traps: [
      '【専用規格139.7-5H / ハブ108mm】普通の乗用車用ホイールは一切付きません。ハブ穴が108mm以上必要なためセンターキャップ付き他車流用も不可。',
      '【JB64のツライチシビア】ノーマル車高のJB64は185/85R16やオフセット+20未満（0や-20など）だとフェンダーからハミタイ・バンパー裏擦りしやすいです。',
      '【オフセット注意】JB64純正は5.5J +22、JB74シエラは5.5J +5（シエラ純正をJB64に履くと17mm出てハミタイしやすい）。'
    ]
  },
  compact_fit_aqua: {
    name: 'コンパクト4H (アクア / ヤリス / フィット / ノート)',
    maker: 'toyota',
    hubMm: 54, pcd: '100-4H', pitch: 'M12×P1.5 (日産P1.25)', seat: '車種により平座/球面/テーパー',
    min: { width: 175, aspect: 65, inch: 15, j: 5.5, et: 45, kpa: 230, li: 84, xl: false },
    max: { width: 185, aspect: 55, inch: 16, j: 6.0, et: 50, margin: 12 },
    target: { width: 185, aspect: 60, inch: 15, j: 5.5, et: 45, spacer: 0, li: 84, xl: false },
    traps: [
      '【ヤリス/アクア系175/65R15→185/60R15】185/60R15は流通量が多く外径もほぼ同じ（608mm vs 603mm）なので安価代替の鉄板です。',
      '【日産ノートE12/E13ハブ60mm罠】同じPCD100-4Hでもトヨタ(54mm)やホンダ(56mm)の純正ホイールは日産ノート(60mm)にハブが当って入りません。',
      '【軽用4.5J流用NG】同じ100-4Hでも軽自動車用ホイール(4.5J / 耐荷重JWLのみ・JWL不足や細幅)はコンパクトカーには幅不足・耐荷重不足になるケースあり。'
    ]
  },
  prius_30_50: {
    name: 'プリウス(30/50) / カローラ系 [PCD100-5H]',
    maker: 'toyota',
    hubMm: 54, pcd: '100-5H', pitch: 'M12×P1.5', seat: 'トヨタ平座',
    min: { width: 195, aspect: 65, inch: 15, j: 6.5, et: 40, kpa: 250, li: 91, xl: false },
    max: { width: 215, aspect: 45, inch: 17, j: 7.0, et: 50, margin: 12 },
    target: { width: 195, aspect: 65, inch: 15, j: 6.5, et: 40, spacer: 0, li: 91, xl: false },
    traps: [
      '【PCD100-5H罠】同じトヨタでもノア/クラウン/60プリウスの大半は114.3-5Hですが、30/50プリウス・210カローラは「100-5H」です（60新型プリウスは114.3-5Hに変更されたので要注意！）。',
      '【195/65R15は最強の安価代替】純正17インチ(215/45R17 外径625mm)から冬用等で15インチ(195/65R15 外径635mm)へ落とすとタイヤ代が半額以下になることが多く、30/50プリウスでは定番（ただし60プリウス等19インチ大径ブレーキ車は15/16不可）。',
      '【純正平座ナット罠】30/50プリウスの純正15インチアルミも平座ナット。社外アルミセット時は60°テーパーナット別途必須。'
    ]
  },
  minivan_noah_80: {
    name: 'ミニバン (80ノア / ヴォクシー / セレナ / ステップ)',
    maker: 'toyota',
    hubMm: 60, pcd: '114.3-5H', pitch: 'M12×P1.5 (日産P1.25)', seat: 'トヨタ平座/ホンダ球面/日産テーパー',
    min: { width: 195, aspect: 65, inch: 15, j: 6.0, et: 50, kpa: 240, li: 91, xl: false },
    max: { width: 205, aspect: 55, inch: 17, j: 6.0, et: 50, margin: 12 },
    target: { width: 205, aspect: 60, inch: 16, j: 6.5, et: 48, spacer: 0, li: 92, xl: false },
    traps: [
      '【ミニバン専用・LI91以上必須】車重が重いため、安い軽・コンパクト用や古いタイヤ（LI88以下）を履くと耐荷重不足で危険＆車検NGになります。',
      '【セレナ(ハブ66mm)にノア/ステップ純正NG】同じ114.3-5Hでも日産セレナ(66mm)にトヨタ純正(60mm)やホンダ純正(64mm)はハブが入りません。',
      '【80系ハイブリッド15インチ】80ノア/ヴォクシー・RPステップワゴンは195/65R15(安い！)が履けますが、C28セレナや90ノアは16インチ以上必須になるグレードがあります。'
    ]
  },
  minivan_noah_90: {
    name: '新型90ノア / ヴォクシー [大径化]',
    maker: 'toyota',
    hubMm: 60, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: 'トヨタ平座 (一部球面/ボルト注意)',
    min: { width: 205, aspect: 60, inch: 16, j: 6.0, et: 40, kpa: 240, li: 92, xl: false },
    max: { width: 205, aspect: 55, inch: 17, j: 6.0, et: 40, margin: 12 },
    target: { width: 205, aspect: 60, inch: 16, j: 6.5, et: 42, spacer: 0, li: 92, xl: false },
    traps: [
      '【80系の15インチが履けない罠】90系ノア・ヴォクシーは外径が大きくなり(205/60R16=約652mm)、80系で使っていた安い195/65R15(約635mm)を流用すると外径不足＆キャリパー干渉のリスク大です！',
      '【インセット変化】80系の+50前後から、90系は+40前後へ外出し方向に変わっています。80系純正をそのまま履くと10mm内側に入り干渉注意。',
      '【トヨタ平座ナット】純正アルミは平座、社外は60°テーパーナット必須。'
    ]
  },
  alphard_30: {
    name: 'アルファード / ヴェルファイア (20/30系)',
    maker: 'toyota',
    hubMm: 60, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: 'トヨタ平座',
    min: { width: 215, aspect: 65, inch: 16, j: 6.5, et: 33, kpa: 240, li: 98, xl: false },
    max: { width: 235, aspect: 50, inch: 18, j: 7.5, et: 45, margin: 15 },
    target: { width: 225, aspect: 60, inch: 17, j: 7.0, et: 38, spacer: 0, li: 99, xl: false },
    traps: [
      '【215/65R16 安価定番だがLI98必須】30系の235/50R18は高いので、冬や予算重視なら215/65R16または225/60R17に落とすのが定番。ただし215/60R16(LI95)等に下げると耐荷重不足NGになりやすい！',
      '【30系後期3.5Lは16インチ不可】大型ブレーキ搭載車は17インチ以上必須です。',
      '【平座ナット】純正ホイールはトヨタ平座、社外品はテーパーナット別途必要。'
    ]
  },
  alphard_40: {
    name: '新型40アルファード / ヴェルファイア [PCD120/M14]',
    maker: 'toyota',
    hubMm: 60, pcd: '120-5H', pitch: 'M14×P1.5 (ボルト/球面系)', seat: 'M14 14R球面 / 専用',
    min: { width: 225, aspect: 65, inch: 17, j: 6.5, et: 40, kpa: 240, li: 102, xl: false },
    max: { width: 225, aspect: 55, inch: 19, j: 7.0, et: 40, margin: 12 },
    target: { width: 225, aspect: 65, inch: 17, j: 7.0, et: 40, spacer: 0, li: 102, xl: false },
    traps: [
      '【30系ホイール一切流用不可!!】40系からPCD120-5Hかつ「M14ハブボルト（欧州車方式）」に変更されたため、30系の114.3-5HやM12ナット対応ホイールは物理的に1ミリも付きません！',
      '【M14ボルト穴・座面注意】通常の社外ホイール（M12ボルト穴・60°テーパー）はボルトが通らないか座面が合いません。「40アルヴェル専用／M14対応」が必須です。',
      '【高耐荷重LI102以上】車重増に伴い225/65R17(LI102)等の高耐荷重サイズが基準。安易な低LIサイズ変更は厳禁。'
    ]
  },
  civic_fc1: {
    name: 'シビック (FC1 / FK7 / FL1)',
    maker: 'honda',
    hubMm: 64, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: '12R球面',
    min: { width: 215, aspect: 55, inch: 16, j: 7.0, et: 45, kpa: 230, li: 93, xl: false },
    max: { width: 235, aspect: 40, inch: 18, j: 8.0, et: 50, margin: 12 },
    target: { width: 215, aspect: 50, inch: 17, j: 7.5, et: 42, spacer: 0, li: 91, xl: false },
    traps: [
      '【Type-R(FK8/FL5)とFC1/FK7/FL1は別物】一般シビックは114.3-5Hですが、Type-Rは120-5H・M14・ブレンボ大径で18インチ以上限定。混同注意。',
      '【215/50R17 / 215/45R17の安い罠】FC1/FK7純正235/40R18は高いですが、冬や安く抑えたい時は215/55R16または215/50R17が外径約647mm前後でドンピシャ。215/45R17(約625mm)まで下げると外径-3.5%＆耐荷重余裕がシビアになります。',
      '【ホンダ12R球面ナット】社外ホイールに純正ナット流用厳禁。60°テーパーナットを必ずセット案内。'
    ]
  },
  '86_brz': {
    name: '86 / GR86 / BRZ [PCD100-5H / P1.25]',
    maker: 'subaru',
    hubMm: 56, pcd: '100-5H', pitch: 'M12×P1.25', seat: '60°テーパー',
    min: { width: 205, aspect: 55, inch: 16, j: 6.5, et: 48, kpa: 240, li: 91, xl: false },
    max: { width: 215, aspect: 45, inch: 17, j: 7.5, et: 48, margin: 15 },
    target: { width: 215, aspect: 45, inch: 17, j: 7.5, et: 45, spacer: 0, li: 91, xl: true },
    traps: [
      '【トヨタ車なのにピッチP1.25罠】86/GR86はスバル製造のため「M12×P1.25」です。トヨタ用のP1.5ナットを無理やり回すとハブボルトが即死します！',
      '【ブレンボ装着車は16インチ不可】GTリミテッド・パフォーマンスパッケージ等のブレンボ車は純正16インチ(205/55R16)不可＆ビッグキャリパー逃げ形状必須。',
      '【安価代替】非ブレンボ車なら205/55R16は流通量多くコスパ抜群。同じ100-5Hなので30/50プリウス用サイズも物理は近い（ただしトヨタ純正平座ナットはピッチ違うため流用不可！）。'
    ]
  },
  suv_cx5: {
    name: 'SUV (CX-5 / ハリアー / RAV4)',
    maker: 'mazda',
    hubMm: 67, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: '車種により平座(トヨタ)/テーパー(マツダ)',
    min: { width: 225, aspect: 65, inch: 17, j: 7.0, et: 45, kpa: 240, li: 102, xl: false },
    max: { width: 235, aspect: 55, inch: 19, j: 7.5, et: 45, margin: 14 },
    target: { width: 225, aspect: 65, inch: 17, j: 7.0, et: 45, spacer: 0, li: 102, xl: false },
    traps: [
      '【225/65R17がコスパ王道】ハリアー/RAV4/CX-5の18〜19インチ(225/55R19等)はタイヤ代が高いので、225/65R17(外径約724mm)へインチダウンすると劇的に安くなります（一部スポーツブレーキグレード要確認）。',
      '【CX-5 ハブ径67mm罠】CX-5(67mm)にトヨタ純正(60mm)や日産純正(66mm)ホイールはハブ穴が小さくて入りません！',
      '【乗用低LIタイヤ誤装着NG】見た目が安い215/55R17等を履くと外径も耐荷重(LI94 vs 必要102)も大きく不足し車検も危険もアウトです。'
    ]
  },
  hiace_200: {
    name: 'ハイエース200系 / キャラバン [LT/JWL-T]',
    maker: 'toyota',
    hubMm: 106, pcd: '139.7-6H', pitch: 'M12×P1.5 (日産キャラバンP1.25)', seat: '60°テーパー (純正アルミ一部平座)',
    min: { width: 195, aspect: 80, inch: 15, j: 6.0, et: 35, kpa: 350, li: 107, xl: false },
    max: { width: 215, aspect: 65, inch: 16, j: 6.5, et: 38, margin: 6 },
    target: { width: 195, aspect: 80, inch: 15, j: 6.0, et: 35, spacer: 0, li: 107, xl: false },
    traps: [
      '【JWL-T刻印＆LT/バン規格必須（4ナンバー/1ナンバー）】普通の乗用車用タイヤ（LI98等のSUVタイヤ）やJWLのみのホイールを履くと車検一発不合格になります！195/80R15 107/105L や 215/65R16C 109/107R 等が必須。',
      '【ハブ径106mm＆6穴】オフセットは+33〜+38前後に収めないとスライドドア干渉やハミタイ即アウトです（キャラバンは+45前後でさらに内側・ハブ100mmで別物）。',
      '【空気圧350〜450kPaの世界】乗用車感覚の240kPaではなく、貨物車両規定圧（前350/後425kPa等）が必須です。'
    ]
  },
  prius_60: {
    name: '新型60プリウス [PCD114.3-5H / 195/50R19]',
    maker: 'toyota',
    hubMm: 60, pcd: '114.3-5H', pitch: 'M12×P1.5 (一部ボルト注意)', seat: 'トヨタ平座',
    min: { width: 195, aspect: 60, inch: 17, j: 6.5, et: 40, kpa: 240, li: 90, xl: false },
    max: { width: 195, aspect: 50, inch: 19, j: 6.5, et: 40, margin: 12 },
    target: { width: 205, aspect: 55, inch: 17, j: 7.0, et: 40, spacer: 0, li: 91, xl: false },
    traps: [
      '【30/50系の100-5Hホイールは一切付かない！】60プリウスからPCD114.3-5Hへ変更されました。旧型プリウス用ホイールを安く買って帰っても付きません。',
      '【純正195/50R19が高すぎ＆品薄罠】上級グレードの195/50R19(外径約677mm)はタイヤ代が非常に高く種類が少ないため、下位グレード基準の195/60R17(約666mm)や205/55R17(約657mm)等へインチダウンするのが定番です。',
      '【15インチ不可】旧型用の195/65R15はブレーキ干渉＆PCD違いで装着不可です。'
    ]
  },
  sienta_10_170: {
    name: 'シエンタ (170系 / 新型10系) [100-5H]',
    maker: 'toyota',
    hubMm: 54, pcd: '100-5H', pitch: 'M12×P1.5', seat: 'トヨタ平座 (スチール車はテーパー)',
    min: { width: 185, aspect: 60, inch: 15, j: 5.5, et: 39, kpa: 240, li: 88, xl: false },
    max: { width: 195, aspect: 50, inch: 16, j: 6.0, et: 45, margin: 10 },
    target: { width: 185, aspect: 65, inch: 15, j: 6.0, et: 40, spacer: 0, li: 88, xl: false },
    traps: [
      '【170系185/60R15 vs 新型10系185/65R15】同じシエンタでも170系(外径603mm)と新型10系(外径621mm)でタイヤ外径とLI要件が違います。旧型の185/60R15を新型に履くと車高低下＆LI不足リスクあり。',
      '【コンパクトなのに5穴100-5H】ヤリス/アクア(4穴)のホイールは付きません。30/50プリウス純正(15×6J+45 100-5H)は流用しやすいですが、インセット差と平座ナットに注意。',
      '【純正スチールナットはテーパー】純正鉄チン車は60°テーパーナット、純正アルミ車は平座ナットのため、ホイール変更時はナット形状要確認。'
    ]
  },
  freed_gb: {
    name: 'フリード (GB3/4=4穴 → GB5-8/GT=5穴)',
    maker: 'honda',
    hubMm: 64, pcd: '114.3-5H (GB3/4は100-4H)', pitch: 'M12×P1.5', seat: '12R球面',
    min: { width: 185, aspect: 65, inch: 15, j: 5.5, et: 49, kpa: 230, li: 88, xl: false },
    max: { width: 195, aspect: 55, inch: 16, j: 6.0, et: 50, margin: 10 },
    target: { width: 185, aspect: 65, inch: 15, j: 6.0, et: 48, spacer: 0, li: 88, xl: false },
    traps: [
      '【初代GB3/4(4穴100)と2代目GB5〜新型GT(5穴114.3)で穴数が違う！】年式確認なしでフリード用として売ると穴数が合いません。',
      '【ホンダ12R球面ナット】純正ホイールは球面座。社外ホイールを組む時は必ず60°テーパーナットをセット販売。',
      '【インセット+49〜+53と深め】社外+38〜+42の汎用5穴ホイールを履くと、フロントフェンダーギリギリ〜ハミタイしやすいので+45〜+50推奨。'
    ]
  },
  vezel_rv: {
    name: 'ヴェゼル / ZR-V / オデッセイ',
    maker: 'honda',
    hubMm: 64, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: '12R球面',
    min: { width: 215, aspect: 60, inch: 16, j: 7.0, et: 50, kpa: 230, li: 95, xl: false },
    max: { width: 225, aspect: 50, inch: 18, j: 7.5, et: 55, margin: 12 },
    target: { width: 215, aspect: 60, inch: 16, j: 6.5, et: 48, spacer: 0, li: 95, xl: false },
    traps: [
      '【新型RVヴェゼル外径アップ罠】旧型RUヴェゼル(215/60R16・215/55R17 外径約668mm)に対し、新型RVヴェゼル(215/60R16・225/50R18 外径約682mm)はやや大径。特にZR-Vはさらに大きく225/55R18(約705mm)のため流用不可。',
      '【16インチへの安価インチダウン】ヴェゼル/RCオデッセイの上級18インチはタイヤが高いので、冬や節約時は215/60R16が定番で安い（ただし一部大径ブレーキ車要確認）。',
      '【ホンダ12R球面】社外アルミへ交換時は60°テーパーナット必須。'
    ]
  },
  stepwgn_rp: {
    name: 'ステップワゴン (RP1-5 / 新型RP6-8)',
    maker: 'honda',
    hubMm: 64, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: '12R球面',
    min: { width: 205, aspect: 60, inch: 16, j: 6.0, et: 45, kpa: 240, li: 92, xl: false },
    max: { width: 205, aspect: 55, inch: 17, j: 6.5, et: 50, margin: 10 },
    target: { width: 205, aspect: 60, inch: 16, j: 6.5, et: 48, spacer: 0, li: 92, xl: false },
    traps: [
      '【RK/RP前期の15インチ→RP6-8新型は16インチ〜】旧型で使えた安い195/65R15は、新型RP6〜8（205/60R16標準）には外径不足＆キャリパー干渉で装着不可です。',
      '【純正インセット+45〜+50】ミニバンはクリアランスがシビアで、汎用+38を履くとフロントがはみ出しやすいです。',
      '【LI92以上＆12R球面ナット】ミニバン車重のため耐荷重厳守＋社外ホイールはテーパーナット別途必須。'
    ]
  },
  serena_c27_c28: {
    name: 'セレナ (C26 / C27 / C28) [日産ハブ66mm]',
    maker: 'nissan',
    hubMm: 66, pcd: '114.3-5H', pitch: 'M12×P1.25', seat: '60°テーパー',
    min: { width: 195, aspect: 65, inch: 15, j: 5.5, et: 45, kpa: 240, li: 91, xl: false },
    max: { width: 205, aspect: 55, inch: 17, j: 6.5, et: 45, margin: 10 },
    target: { width: 205, aspect: 65, inch: 16, j: 6.5, et: 45, spacer: 0, li: 95, xl: false },
    traps: [
      '【日産ハブ66mm罠】同じ5穴114.3でもトヨタ純正(60mm)やホンダ純正(64mm)はハブが刺さらず装着不可！',
      '【C28新型は16インチ＆205/65R16化】C26/C27の定番195/65R15(外径635mm)は、C28型では外径(205/65R16=約673mm)・耐荷重(LI95)・ブレーキ径すべて合わず流用不可です！',
      '【ネジピッチM12×P1.25】トヨタ/ホンダ用のP1.5ナットは使えません。'
    ]
  },
  note_e12_e13: {
    name: '日産ノート / オーラ (E12 / E13)',
    maker: 'nissan',
    hubMm: 60, pcd: '100-4H', pitch: 'M12×P1.25', seat: '60°テーパー',
    min: { width: 185, aspect: 65, inch: 15, j: 5.5, et: 40, kpa: 230, li: 88, xl: false },
    max: { width: 205, aspect: 50, inch: 17, j: 6.5, et: 42, margin: 10 },
    target: { width: 185, aspect: 60, inch: 16, j: 6.0, et: 42, spacer: 0, li: 86, xl: false },
    traps: [
      '【ハブ60mm罠（コンパクトカーでは大きめ）】ノートは100-4Hですがハブ60mmのため、ヤリス/アクア純正(54mm)やフィット純正(56mm)はハブに当って付きません。',
      '【E12(14/15インチ)とE13(16インチ)の外径差】E13ノート標準は185/60R16(外径628mm)、オーラは205/50R17(637mm)。E12用の安い185/70R14等はE13にはキャリパー・外径が合いません。',
      '【ピッチM12×P1.25】日産車のためP1.25ナット必須。'
    ]
  },
  xtrail_t32_t33: {
    name: 'エクストレイル (T32=M12 → T33=M14)',
    maker: 'nissan',
    hubMm: 66, pcd: '114.3-5H', pitch: 'T32:M12×P1.25 / T33:M14×P1.5', seat: 'T32:テーパー / T33:ボルト系',
    min: { width: 225, aspect: 65, inch: 17, j: 7.0, et: 45, kpa: 230, li: 102, xl: false },
    max: { width: 235, aspect: 55, inch: 19, j: 7.5, et: 40, margin: 12 },
    target: { width: 225, aspect: 65, inch: 17, j: 7.0, et: 42, spacer: 0, li: 102, xl: false },
    traps: [
      '【T32と新型T33のM14ボルト罠】同じ114.3-5H・ハブ66mmですが、新型T33からM14ハブボルトに変わっており、T32用の一般的な社外ホイール(M12穴)はボルトが通らない事が多いです！',
      '【225/65R17定番インチダウン】18/19インチ装着車でも225/65R17へ落とすとタイヤ代が安くなります（T33等ブレーキ径確認）。',
      '【ハブ66mm】他社純正(60/64mm)は装着不可。'
    ]
  },
  crown_210_220: {
    name: 'クラウン (200 / 210 / 220系) [キャリパー注意]',
    maker: 'toyota',
    hubMm: 60, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: 'トヨタ平座',
    min: { width: 215, aspect: 60, inch: 16, j: 7.0, et: 40, kpa: 240, li: 95, xl: false },
    max: { width: 225, aspect: 45, inch: 18, j: 8.0, et: 45, margin: 12 },
    target: { width: 215, aspect: 55, inch: 17, j: 7.0, et: 40, spacer: 0, li: 94, xl: false },
    traps: [
      '【3.5L / RS / アスリートのビッグキャリパー罠】通常の2.0/2.5Lは16インチ(215/60R16)が入りますが、3.5L・RS系・対向4POTキャリパー車は16インチ（場合により17インチも）がキャリパーにガッツリ干渉します！必ず「ビッグキャリパー対応」要確認。',
      '【トヨタ平座ナット】純正アルミは平座。社外ホイールは60°テーパーナット別途必須。',
      '【安い215/45R17を履くのは絶対NG】クラウンは外径660〜670mm級(215/55R17・225/45R18)のため、プリウス用の215/45R17(625mm)等を履くと外径-6%で車検NG＆腹下擦りになります。'
    ]
  },
  crown_cross_230: {
    name: '新型クラウン (クロスオーバー等) [M14ボルト]',
    maker: 'toyota',
    hubMm: 60, pcd: '114.3-5H', pitch: 'M14×P1.5 (ハブボルト)', seat: '14R球面 / 専用',
    min: { width: 225, aspect: 55, inch: 19, j: 7.5, et: 35, kpa: 240, li: 99, xl: false },
    max: { width: 225, aspect: 45, inch: 21, j: 7.5, et: 35, margin: 12 },
    target: { width: 225, aspect: 55, inch: 19, j: 7.5, et: 35, spacer: 0, li: 99, xl: false },
    traps: [
      '【従来のクラウン(M12)のホイールが一切付かない！】新型クラウン系は114.3-5Hながら欧州車式の「M14ボルト締結」となったため、従来のM12用社外ホイールはボルト穴径不足＆座面違いで装着不可！',
      '【225/55R19 / 225/45R21の大径特殊サイズ】外径730mmクラスとSUV並みの大径のため、過去のセダン用タイヤ・ホイールは流用不可です。',
      '【インチダウンもM14対応専用品が必要】18インチへ落とす場合も必ず「新型クラウン/レクサスNX・RX M14対応ホイール」を指定。'
    ]
  },
  harrier_rav4: {
    name: 'ハリアー / RAV4 (60/80/50系) [トヨタ平座]',
    maker: 'toyota',
    hubMm: 60, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: 'トヨタ平座',
    min: { width: 225, aspect: 65, inch: 17, j: 7.0, et: 35, kpa: 230, li: 102, xl: false },
    max: { width: 235, aspect: 55, inch: 19, j: 7.5, et: 40, margin: 15 },
    target: { width: 225, aspect: 65, inch: 17, j: 7.0, et: 38, spacer: 0, li: 102, xl: false },
    traps: [
      '【225/65R17で半額級に節約】80ハリアーZグレードやRAV4の19インチ(225/55R19)はタイヤ代が高いので、下位グレード基準の225/65R17(外径約724mm)へ落とすと安く済みます（PHEV等大径ブレーキ車は18インチ以上必要）。',
      '【トヨタ平座ナット】社外ホイールに交換時は60°テーパーナット別途必須。',
      '【オフセット+35〜+40前後】RAV4/ハリアーにミニバン用の+50〜+53を履くと15mm内側に入り、サス干渉や引っ込みすぎになります。'
    ]
  },
  landcruiser_prado: {
    name: 'プラド(150) / ハイラックス / ランクル250',
    maker: 'toyota',
    hubMm: 106, pcd: '139.7-6H', pitch: 'M12×P1.5 (250/300はM14×P1.5)', seat: 'トヨタ平座 (社外60°テーパー)',
    min: { width: 265, aspect: 65, inch: 17, j: 7.5, et: 25, kpa: 220, li: 112, xl: false },
    max: { width: 265, aspect: 60, inch: 18, j: 7.5, et: 25, margin: 12 },
    target: { width: 265, aspect: 65, inch: 17, j: 7.5, et: 25, spacer: 0, li: 112, xl: false },
    traps: [
      '【150プラド(ハブ106/M12) vs ランクル250/300(ハブ95/M14)の互換性ゼロ罠！】同じ139.7-6Hでもランクル250/300はハブ95mm・M14平座ボルト(ナット)になったため、150プラド用やハイエース用はほぼ付きません（250用をプラドに入れるのも不可）。',
      '【ハイエース用6穴ホイール流用注意】ハイエース用(6.5J +38)はインセット・J数・キャリパー逃げでプラドに付かないことが多いです。',
      '【高耐荷重LI110以上】2トン超の車重のため乗用・軽SUVタイヤは厳禁。'
    ]
  },
  subaru_levorg_forester: {
    name: 'スバル (レヴォーグ / フォレスター / インプレッサ)',
    maker: 'subaru',
    hubMm: 56, pcd: '114.3-5H / 100-5H混在', pitch: 'M12×P1.25', seat: '60°テーパー',
    min: { width: 215, aspect: 50, inch: 17, j: 7.0, et: 55, kpa: 240, li: 91, xl: false },
    max: { width: 225, aspect: 45, inch: 18, j: 7.5, et: 55, margin: 12 },
    target: { width: 215, aspect: 50, inch: 17, j: 7.0, et: 48, spacer: 0, li: 91, xl: false },
    traps: [
      '【100-5Hと114.3-5Hが車種・世代で混在！】レヴォーグ・WRX S4・SK/SLフォレスターは114.3-5Hですが、インプレッサ/XV/クロストレック/SJフォレスターは100-5H！年式と型式確認が必須。',
      '【純正インセット+55と超深い！】スバル車に普通の+38〜+40の社外ホイールを履くと15mm以上外に出てフロントフェンダーからハミタイしやすいです（+45〜+53推奨）。',
      '【AWDは4本同一サイズ＆P1.25】前後異サイズ・外径差はデフ破損の原因。ナットは必ずM12×P1.25。'
    ]
  },
  mazda3_cx30: {
    name: 'MAZDA3 / CX-30 / CX-60 [ハブ67mm]',
    maker: 'mazda',
    hubMm: 67, pcd: '114.3-5H', pitch: 'M12×P1.5', seat: '60°テーパー',
    min: { width: 205, aspect: 60, inch: 16, j: 6.5, et: 45, kpa: 250, li: 92, xl: false },
    max: { width: 215, aspect: 45, inch: 18, j: 7.0, et: 45, margin: 12 },
    target: { width: 205, aspect: 60, inch: 16, j: 6.5, et: 45, spacer: 0, li: 92, xl: false },
    traps: [
      '【ハブ径67mm罠】トヨタ(60mm)・ホンダ(64mm)・日産(66mm)純正ホイールはすべてハブ穴が小さく物理的に入りません！',
      '【MAZDA3(約652mm) vs CX-30(約704mm)】同じプラットフォームでもタイヤ外径が全く違います（MAZDA3は215/45R18、CX-30は215/55R18）。',
      '【CX-60はFRベースで高耐荷重・大径】CX-60は235/60R18〜235/50R20クラスでCX-30とは別物。'
    ]
  },
  swift_zc33s: {
    name: 'スイフトスポーツ(ZC33S) / スイフト',
    maker: 'kei_suzuki_daihatsu',
    hubMm: 60, pcd: '114.3-5H (スイフトは100-4H)', pitch: 'M12×P1.25', seat: '60°テーパー',
    min: { width: 195, aspect: 50, inch: 16, j: 6.0, et: 45, kpa: 230, li: 84, xl: false },
    max: { width: 195, aspect: 45, inch: 17, j: 6.5, et: 50, margin: 10 },
    target: { width: 195, aspect: 50, inch: 16, j: 6.5, et: 45, spacer: 0, li: 84, xl: false },
    traps: [
      '【スイフト(4穴100・54mm) vs スイフトスポーツ(5穴114.3・60mm)】同じ名前でも穴数・PCD・ハブ径が別車レベルで違います！',
      '【ZC33Sの純正195/45R17が高い＆特殊】冬やコスト重視なら195/50R16（外径約601mmで195/45R17の607mmに近い）か185/55R16へインチダウンするのが定番（15インチはブレーキ干渉リスク大）。',
      '【ネジピッチM12×P1.25】スズキ車のため、トヨタ用P1.5ナットは不可。'
    ]
  },
  probox_succeed: {
    name: 'プロボックス / サクシード / 軽バン [4ナンバーLT]',
    maker: 'toyota',
    hubMm: 54, pcd: '100-4H', pitch: 'M12×P1.5 (軽バンはメーカー別)', seat: '60°テーパー',
    min: { width: 155, aspect: 80, inch: 14, j: 5.0, et: 39, kpa: 260, li: 88, xl: false },
    max: { width: 165, aspect: 80, inch: 13, j: 5.0, et: 39, margin: 8 },
    target: { width: 155, aspect: 80, inch: 14, j: 5.0, et: 39, spacer: 0, li: 88, xl: false },
    traps: [
      '【4ナンバー商用車は「LT規格タイヤ＋JWL-Tホイール」必須!!】プロボックス(155/80R14 88/86N LT)やエブリイ/ハイゼット(145/80R12 80/78N LT)に乗用車用の安い155/65R14等を履かせると車検NG・過積載バーストになります！',
      '【軽トラ/軽バンの12→14インチ化注意】カスタムで14インチにする場合も「JWL-T刻印入りホイール＋LT規格タイヤ（155/65R14C等）」でないと貨物車検に通らない事が多いです。',
      '【プロボックスの13→14インチ世代差】前期165/80R13と現行155/80R14あり。現行ハイブリッド等は13インチ不可。'
    ]
  }
};

const WHEEL_ORIGINS = {
  aftermarket: { label: '社外アルミ汎用', hubMm: 73, seat: '60°テーパー' },
  oem_same: { label: '同メーカー純正', hubMm: null, seat: '純正同座' },
  oem_suzuki_daihatsu: { label: 'スズキ/ダイハツ純正', hubMm: 54, seat: '60°テーパー' },
  oem_honda: { label: 'ホンダ純正', hubMm: 56, seat: '12R球面', note: '※普通車の一部は64mm' },
  oem_toyota: { label: 'トヨタ純正アルミ', hubMm: 54, seat: 'トヨタ平座', note: '※コンパクト54mm / 普通車60mm' },
  oem_nissan_mitsubishi: { label: '日産/三菱純正', hubMm: 56, seat: '60°テーパー / 三菱平座', note: '※軽56mm / 普通車66-67mm' }
};

const state = {
  presetKey: 'prius_30_50',
  maker: 'toyota',
  wheelOrigin: 'aftermarket',
  target: { width: 205, aspect: 55, inch: 16, j: 6.5, et: 45, spacer: 0, li: 91, xl: false },
  min: { width: 195, aspect: 65, inch: 15, j: 6.5, et: 40, kpa: 250, li: 91, xl: false },
  max: { width: 215, aspect: 45, inch: 17, j: 7.0, et: 50, margin: 12 }
};

function estimateLI(width, aspect, inch) {
  const key = `${width}/${aspect}R${inch}`;
  if (COMMON_LI_MAP[key]) return { li: COMMON_LI_MAP[key][0], xl: COMMON_LI_MAP[key][1] };
  const est = Math.round(52 + (width - 135) * 0.14 + (inch - 12) * 2.2 + (aspect - 40) * 0.12);
  const li = Math.max(69, Math.min(112, est));
  return { li, xl: aspect <= 45 };
}

function calcLoadCapacityAtKpa(li, isXl, kpa) {
  const maxKg = LI_MAX_KG[Math.max(69, Math.min(112, Math.round(li)))] || 500;
  const maxKpa = isXl ? 290 : 240;
  const effKpa = Math.min(kpa, maxKpa);
  const ratio = Math.pow(Math.max(0.3, (effKpa - 80) / (maxKpa - 80)), 0.55);
  return Math.round(maxKg * ratio);
}

function calcRimRange(width, aspect) {
  const stdJ = Math.round(((width * (aspect >= 60 ? 0.68 : aspect >= 50 ? 0.72 : 0.76)) / INCH_MM) * 2) / 2;
  const minJ = Math.max(3.5, stdJ - (width >= 205 ? 1.0 : 0.5));
  const maxJ = stdJ + (width >= 205 ? 1.0 : 0.5);
  return { stdJ, minJ, maxJ };
}

function calcMetrics(spec, spacer = 0) {
  const inch = Math.max(10, Number(spec.inch) || 15);
  const j = Math.max(3.5, Number(spec.j) || 6);
  const et = Number(spec.et) || 0;
  const width = Math.max(115, Number(spec.width) || 195);
  const aspect = Math.max(20, Number(spec.aspect) || 65);

  const rimDia = inch * INCH_MM;
  const rimRad = rimDia / 2;
  const rimWidth = j * INCH_MM;
  const effEt = et - spacer;
  const centerX = -effEt;
  const outerRimX = centerX + rimWidth / 2;
  const innerRimX = centerX - rimWidth / 2;

  const sidewallH = width * (aspect / 100);
  const tireDia = rimDia + 2 * sidewallH;
  const tireRad = tireDia / 2;

  const stdRimWidth = width * 0.72;
  const actualSectionWidth = width + (rimWidth - stdRimWidth) * 0.4;
  const maxTireWidth = Math.max(actualSectionWidth, rimWidth + 6);
  const outerTireX = centerX + maxTireWidth / 2;
  const innerTireX = centerX - maxTireWidth / 2;
  const barrelInnerRad = Math.max(60, rimRad - 18);

  return {
    inch, j, et, spacer, width, aspect,
    rimDia, rimRad, rimWidth, effEt, centerX,
    outerRimX, innerRimX, sidewallH, tireDia, tireRad,
    actualSectionWidth, outerTireX, innerTireX, barrelInnerRad
  };
}

function fmt(v, unit = 'mm') {
  const s = v > 0 ? '+' : '';
  return `${s}${v.toFixed(1)}${unit}`;
}

function getVehiclePhysicalSpec() {
  const preset = state.presetKey && CAR_ARUARU_DB[state.presetKey];
  if (preset && preset.maker === state.maker) {
    return {
      name: preset.name,
      hubMm: preset.hubMm,
      pcd: preset.pcd,
      pitch: preset.pitch,
      seat: preset.seat,
      traps: preset.traps
    };
  }
  const mk = MAKER_DEFAULTS[state.maker] || MAKER_DEFAULTS.generic;
  return {
    name: document.getElementById('makerSelect').selectedOptions[0]?.text || '選択メーカー',
    hubMm: mk.hubMm,
    pcd: mk.pcd,
    pitch: mk.pitch,
    seat: mk.seat,
    traps: [mk.note]
  };
}

function evaluatePhysicalCompatibility(vSpec, ngList, warnList, okList) {
  const wo = state.wheelOrigin;
  let physLevel = 'ok';
  let physText = '物理・座面OK';
  let physNote = '';

  if (vSpec.hubMm >= 100 && wo !== 'oem_same' && wo !== 'aftermarket') {
    physLevel = 'ng';
    physText = 'ハブ/PCD非対応';
    const msg = `【ハブ/PCD NG】車体側ハブ径 ${vSpec.hubMm}mm・特殊PCD(${vSpec.pcd})のため、他メーカー乗用車純正ホイールは物理的に装着不可です。`;
    ngList.push(msg);
    return { physLevel, physText, physNote: msg };
  }

  // ハブ径NGチェック
  if (wo === 'oem_suzuki_daihatsu' && vSpec.hubMm > 54) {
    physLevel = 'ng';
    physText = 'ハブ径NG (54mm入らず)';
    const msg = `【ハブ径 NG】車体側ハブ径 ${vSpec.hubMm}mm に対し、スズキ/ダイハツ純正ホイールはハブ穴 54mm のため物理的に奥まで入らず装着不可です。`;
    ngList.push(msg);
    return { physLevel, physText, physNote: msg };
  }

  if (wo === 'oem_honda' && vSpec.hubMm > 64) {
    physLevel = 'ng';
    physText = 'ハブ径NG (入らず)';
    const msg = `【ハブ径 NG】車体側ハブ径 ${vSpec.hubMm}mm に対し、ホンダ純正ホイール(56/64mm)はハブ穴が小さく装着不可です。`;
    ngList.push(msg);
    return { physLevel, physText, physNote: msg };
  }

  if (wo === 'oem_toyota' && vSpec.hubMm > 60) {
    physLevel = 'ng';
    physText = 'ハブ径NG (入らず)';
    const msg = `【ハブ径 NG】車体側ハブ径 ${vSpec.hubMm}mm に対し、トヨタ純正ホイール(54/60mm)はハブ穴が小さく装着不可です。`;
    ngList.push(msg);
    return { physLevel, physText, physNote: msg };
  }

  // ナット座面チェック
  if (wo === 'aftermarket') {
    if (state.maker === 'toyota' || state.maker === 'honda' || state.presetKey === 'alphard_40') {
      physLevel = 'warn';
      physText = 'テーパーナット別売';
      physNote = `【ナット座面注意】純正ナット(${vSpec.seat})は社外アルミに使用不可です。60°テーパーナット(${vSpec.pitch})を別途ご案内ください。` + (state.presetKey === 'alphard_40' ? '（※40アルヴェルはM14対応ホール確認必須）' : '');
      warnList.push(physNote);
    } else {
      physNote = `社外アルミ汎用：車体側ハブ(${vSpec.hubMm || '要確認'}mm)にはハブリング推奨・ナットは60°テーパー(${vSpec.pitch})。`;
      okList.push(physNote);
    }
  } else if (wo === 'oem_toyota' && state.maker !== 'toyota') {
    physLevel = 'ng';
    physText = '平座ナット不一致';
    physNote = `【座面 NG/流用注意】トヨタ純正アルミは「ストレート平座ナット」専用です。他社車両に通常のテーパーナットで締めると座面が噛まず脱輪リスクがあります（54mm/60mmハブ径一致も要確認）。`;
    ngList.push(physNote);
  } else if (wo === 'oem_honda' && state.maker !== 'honda') {
    physLevel = 'warn';
    physText = '12R球面ナット必須';
    physNote = `【座面注意】ホンダ純正ホイールは「12R球面座」のため、車体ピッチ(${vSpec.pitch})に合う12R球面ナットが別途必要です（スズキ・日産P1.25車への流用はピッチ違いで純正ナット流用不可）。`;
    warnList.push(physNote);
  } else if (wo === 'oem_same') {
    physNote = `同メーカー純正ホイール選択：ハブ径・純正ナット(${vSpec.seat})の適合性が高い組み合わせです（※グレード間のブレーキ径・40アルヴェル等の世代差のみ確認）。`;
    okList.push(physNote);
  } else {
    physLevel = 'warn';
    physText = 'ハブ/座面 要確認';
    physNote = `他社純正流用のため、実測ハブ径(車体${vSpec.hubMm || '?'}mm)とナット座面・ピッチ(${vSpec.pitch})の一致を現物確認してください。`;
    warnList.push(physNote);
  }

  return { physLevel, physText, physNote };
}

function evaluateEvidence() {
  const tm = calcMetrics(state.target, state.target.spacer);
  const mn = calcMetrics(state.min, 0);
  const mx = calcMetrics(state.max, 0);

  const ngList = [];
  const warnList = [];
  const okList = [];

  // 1. 外径・メーター誤差
  const diaDiff = tm.tireDia - mn.tireDia;
  const diaPct = (diaDiff / mn.tireDia) * 100;
  const actualSpeedAt40 = 40 * (tm.tireDia / mn.tireDia);
  const groundClearanceDiff = diaDiff / 2;
  const maxDiaDiff = tm.tireDia - mx.tireDia;

  let diaLevel = 'ok';
  let diaText = '適正圏';
  if (actualSpeedAt40 > 42.5 || actualSpeedAt40 < 31.0 || diaPct > 3.5 || diaPct < -4.0) {
    diaLevel = 'ng';
    diaText = '車検NG/干渉恐れ';
    ngList.push(`【外径 NG】純正比 ${fmt(diaDiff)} (${diaPct >= 0 ? '+' : ''}${diaPct.toFixed(1)}%)。メーター40km/h時の実速度が ${actualSpeedAt40.toFixed(1)}km/h となり、平成19年以降のスピードメーター検査基準（30.9〜42.5km/h）またはハウス干渉限界を逸脱する恐れがあります。`);
  } else if (Math.abs(diaPct) > 2.0 || maxDiaDiff > 8) {
    diaLevel = 'warn';
    diaText = '注意(誤差/地上高)';
    warnList.push(`【外径 注意】純正比 ${fmt(diaDiff)} (${diaPct >= 0 ? '+' : ''}${diaPct.toFixed(1)}%)。車検誤差範囲内（実速度 ${actualSpeedAt40.toFixed(1)}km/h）ですが、最低地上高が ${fmt(groundClearanceDiff)} 変化し、舵角全切り時のインナー干渉確認が必要です。`);
  } else {
    okList.push(`外径差 ${fmt(diaDiff)} (${diaPct >= 0 ? '+' : ''}${diaPct.toFixed(1)}%) で純正ほぼ同等・メーター検査も安全圏です。`);
  }

  // 2. 耐荷重
  const reqKg = calcLoadCapacityAtKpa(state.min.li, state.min.xl, state.min.kpa);
  const tgtKgSameKpa = calcLoadCapacityAtKpa(state.target.li, state.target.xl, state.min.kpa);
  const tgtMaxKpa = state.target.xl ? 290 : 240;
  const tgtMaxKg = calcLoadCapacityAtKpa(state.target.li, state.target.xl, tgtMaxKpa);

  let loadLevel = 'ok';
  let loadText = '耐荷重OK';
  let recommendedKpa = state.min.kpa;

  if (tgtKgSameKpa >= reqKg) {
    okList.push(`耐荷重: 規定圧 ${state.min.kpa}kPa 時点で ${tgtKgSameKpa}kg（純正必要 ${reqKg}kg）を確保しています。`);
  } else if (tgtMaxKg >= reqKg) {
    for (let p = state.min.kpa; p <= tgtMaxKpa; p += 5) {
      if (calcLoadCapacityAtKpa(state.target.li, state.target.xl, p) >= reqKg) {
        recommendedKpa = p;
        break;
      }
    }
    loadLevel = 'warn';
    loadText = `${recommendedKpa}kPa昇圧でOK`;
    warnList.push(`【耐荷重 条件付きOK】純正と同圧(${state.min.kpa}kPa)では耐荷重が ${reqKg - tgtKgSameKpa}kg 不足しますが、空気圧を「${recommendedKpa}kPa」へ設定すれば必要耐荷重 ${reqKg}kg を確保できます。`);
  } else {
    loadLevel = 'ng';
    loadText = `${reqKg - tgtMaxKg}kg不足`;
    ngList.push(`【耐荷重 NG】最大空気圧(${tgtMaxKpa}kPa)まで入れても耐荷重 ${tgtMaxKg}kg で、純正必要値 ${reqKg}kg に ${reqKg - tgtMaxKg}kg 不足しています。車重を支えきれずバースト・偏摩耗・車検不合格となるため装着不可です。`);
  }

  // 3. リム幅
  const rimRange = calcRimRange(tm.width, tm.aspect);
  let rimLevel = 'ok';
  let rimText = '適用範囲内';
  if (tm.j < rimRange.minJ - 0.5 || tm.j > rimRange.maxJ + 0.5) {
    rimLevel = 'ng';
    rimText = '規格外(危険)';
    ngList.push(`【リム幅 NG】タイヤ幅 ${tm.width}mm の適用リム幅は ${rimRange.minJ.toFixed(1)}J〜${rimRange.maxJ.toFixed(1)}J です。${tm.j.toFixed(1)}J は大きく外れており、ビード落ちやエア漏れ・サイドウォール破損の危険があります。`);
  } else if (tm.j < rimRange.minJ || tm.j > rimRange.maxJ) {
    rimLevel = 'warn';
    rimText = tm.j > rimRange.maxJ ? '軽度引っ張り' : '軽度ムッチリ';
    warnList.push(`【リム幅 マッチング外】JATMA適用(${rimRange.minJ.toFixed(1)}〜${rimRange.maxJ.toFixed(1)}J)から 0.5J 差の「${rimText}」状態です。通常走行は可能な圏内ですが、空気圧管理と縁石接触に注意が必要です。`);
  } else {
    okList.push(`リム幅 ${tm.j.toFixed(1)}J はタイヤ幅 ${tm.width}mm のJATMA適用レンジ (${rimRange.minJ.toFixed(1)}〜${rimRange.maxJ.toFixed(1)}J) 内に収まっています。`);
  }

  // 4. クリアランス
  const rimRadDiff = tm.rimRad - mn.rimRad;
  const innerRimDiff = tm.innerRimX - mn.innerRimX;
  const innerTireDiff = tm.innerTireX - mn.innerTireX;
  const outerRimDiff = tm.outerRimX - mx.outerRimX;
  const outerTireDiff = tm.outerTireX - mx.outerTireX;
  const fenderMargin = state.max.margin;

  let clearLevel = 'ok';
  let clearText = '干渉・ハミタイ無';

  if (rimRadDiff < -2) {
    clearLevel = 'ng';
    clearText = 'ブレーキ干渉恐れ';
    ngList.push(`【小径 NG】純正最小 (${mn.inch}インチ) より小さい ${tm.inch}インチ のため、ブレーキキャリパー／ローターとホイール内側が物理的に干渉する可能性が高いです。`);
  }
  if (outerTireDiff > fenderMargin + 1 || outerRimDiff > fenderMargin + 1) {
    clearLevel = 'ng';
    clearText = 'ハミタイ警告';
    ngList.push(`【出面 NG】純正最大比で外に ${fmt(Math.max(outerTireDiff, outerRimDiff))} 出るため、設定したフェンダー余裕 (+${fenderMargin}mm) を超えてハミタイ（保安基準違反・フェンダー干渉）の恐れがあります。`);
  }
  if (innerRimDiff < -12 || innerTireDiff < -14) {
    clearLevel = 'ng';
    clearText = '内側サス干渉';
    ngList.push(`【内側 NG】純正比で内側に ${Math.abs(Math.min(innerRimDiff, innerTireDiff)).toFixed(1)}mm 入り込むため、ストラット・サスアーム・インナーフェンダーに干渉する恐れがあります。`);
  }

  if (clearLevel === 'ok') {
    if (outerTireDiff > fenderMargin - 4 || outerRimDiff > fenderMargin - 4) {
      clearLevel = 'warn';
      clearText = 'ツライチ攻め';
      warnList.push(`【出面 攻め】フェンダー余裕限界まで残り ${(fenderMargin - Math.max(outerTireDiff, outerRimDiff)).toFixed(1)}mm です。個体差やバンプ時の干渉に留意してください。`);
    } else if (innerRimDiff < -5 || innerTireDiff < -6) {
      clearLevel = 'warn';
      clearText = '内側クリアランス狭';
      warnList.push(`【内側 注意】純正より ${Math.abs(Math.min(innerRimDiff, innerTireDiff)).toFixed(1)}mm 内側に入るため、ステア全切り時のインナー接触を確認してください。`);
    } else {
      okList.push(`出面・内側クリアランスともに安全圏（最大比 外タイヤ ${fmt(outerTireDiff)} / 最小比 内リム ${fmt(innerRimDiff)}）です。`);
    }
  }

  // 5. ハブ径・座面・物理クロスチェック
  const vSpec = getVehiclePhysicalSpec();
  const { physLevel, physText, physNote } = evaluatePhysicalCompatibility(vSpec, ngList, warnList, okList);

  let overall = 'ok';
  if (ngList.length > 0) overall = 'ng';
  else if (warnList.length > 0 || Math.abs(diaDiff) > 2 || tm.inch !== mn.inch || tm.width !== mn.width) overall = 'warn';

  if (ngList.length === 0 && warnList.length === 0 && Math.abs(diaPct) <= 1.5) {
    overall = 'ok';
  }

  return {
    tm, mn, mx,
    overall, ngList, warnList, okList,
    diaDiff, diaPct, actualSpeedAt40, groundClearanceDiff, diaLevel, diaText,
    reqKg, tgtKgSameKpa, tgtMaxKpa, tgtMaxKg, recommendedKpa, loadLevel, loadText,
    rimRange, rimLevel, rimText,
    rimRadDiff, innerRimDiff, innerTireDiff, outerRimDiff, outerTireDiff, fenderMargin, clearLevel, clearText,
    vSpec, physLevel, physText, physNote
  };
}

function renderEvidence() {
  const ev = evaluateEvidence();
  const { tm, mn, mx } = ev;

  document.getElementById('targetSummary').textContent =
    `${tm.width}/${tm.aspect}R${tm.inch} | ${tm.j.toFixed(1)}J ${tm.effEt >= 0 ? '+' : ''}${tm.effEt}`;
  document.getElementById('minSummary').textContent =
    `${mn.width}/${mn.aspect}R${mn.inch} | ${mn.j.toFixed(1)}J ${mn.et >= 0 ? '+' : ''}${mn.et}`;
  document.getElementById('maxSummary').textContent =
    `${mx.width}/${mx.aspect}R${mx.inch} | ${mx.j.toFixed(1)}J ${mx.et >= 0 ? '+' : ''}${mx.et}`;

  const banner = document.getElementById('verdictBanner');
  const badge = document.getElementById('verdictBadge');
  const title = document.getElementById('verdictTitle');
  const talk = document.getElementById('verdictTalk');
  const reasons = document.getElementById('verdictReasons');

  banner.className = `verdict-banner status-${ev.overall}`;
  if (ev.overall === 'ng') {
    badge.textContent = '装着不可 / 非推奨';
    title.textContent = '根拠データ上、装着リスクが高いためおすすめできません';
    talk.textContent = `💬 接客トーク例: 「ご希望のサイズは価格面では魅力的ですが、お車の基準と比べると【${ev.ngList[0].match(/【(.*?)】/)?.[1] || '安全・物理基準'}】に引っかかるため装着できません（危険があります）。すぐ下に安全に安く代用できる定番サイズを出しています！」`;
  } else if (ev.overall === 'warn') {
    badge.textContent = 'マッチング外・条件付きOK';
    title.textContent = 'カタログ標準外ですが、数値上は比較的安全に装着できる圏内です';
    talk.textContent = `💬 接客トーク例: 「適合表には載っていませんが、外径差(${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%)・耐荷重・出面を計算上クリアしています。下の注意点（空気圧 ${ev.recommendedKpa}kPa やナット/ハブ条件）を押さえれば比較的安心して履けるサイズです。」`;
  } else {
    badge.textContent = '適合・安全圏';
    title.textContent = '純正基準と同等レンジで問題なく装着できます';
    talk.textContent = `💬 接客トーク例: 「外径・リム幅・耐荷重・クリアランスすべて純正基準の範囲内に綺麗に収まっていますので、安心してこのままお選びいただけます。」`;
  }

  reasons.innerHTML = [...ev.ngList, ...ev.warnList, ...ev.okList].map(r => `<li>${r}</li>`).join('');

  setCard('evDiameter', 'pillDiameter', ev.diaLevel, ev.diaText);
  document.getElementById('bodyDiameter').innerHTML =
    `純正外径 <strong>${mn.tireDia.toFixed(0)}mm</strong> → 検討 <strong>${tm.tireDia.toFixed(0)}mm</strong> (差 <strong>${fmt(ev.diaDiff)}</strong> / <strong>${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%</strong>)<br>` +
    `メーター40km/h時の実速度: <strong>${ev.actualSpeedAt40.toFixed(1)} km/h</strong> (保安基準 30.9〜42.5km/h) / 車高変化: <strong>${fmt(ev.groundClearanceDiff)}</strong>`;

  const clampPct = (p) => Math.max(0, Math.min(100, ((p + 6) / 12) * 100));
  document.getElementById('diameterGaugeBox').innerHTML = `
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:11px;">
      <span>外径変化率（車検安全帯バー）</span>
      <span>${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(2)}%</span>
    </div>
    <div class="gauge-track">
      <div class="gauge-legal" style="left:${clampPct(-4)}%;width:${clampPct(3.5) - clampPct(-4)}%"></div>
      <div class="gauge-safe" style="left:${clampPct(-3)}%;width:${clampPct(2) - clampPct(-3)}%"></div>
      <div class="gauge-marker" style="left:${clampPct(ev.diaPct)}%"></div>
    </div>
    <div class="gauge-scale">
      <span>-6% (車高低下)</span>
      <span>-3%〜+2% (実務安全帯)</span>
      <span>+6% (干渉/車検NG)</span>
    </div>
  `;

  setCard('evLoad', 'pillLoad', ev.loadLevel, ev.loadText);
  document.getElementById('bodyLoad').innerHTML =
    `純正必要耐荷重 (${state.min.kpa}kPa時): <strong>${ev.reqKg}kg/本</strong> (LI ${state.min.li}${state.min.xl ? ' XL' : ''})<br>` +
    `検討タイヤ (LI ${state.target.li}${state.target.xl ? ' XL' : ''}): 同圧時 <strong>${ev.tgtKgSameKpa}kg</strong> / 最大圧(${ev.tgtMaxKpa}kPa)時 <strong>${ev.tgtMaxKg}kg</strong>` +
    (ev.loadLevel === 'warn' ? `<br>→ <strong>${ev.recommendedKpa}kPa 充填で純正同等耐荷重をクリア</strong>` : '');

  setCard('evRim', 'pillRim', ev.rimLevel, ev.rimText);
  document.getElementById('bodyRim').innerHTML =
    `タイヤ幅 <strong>${tm.width}mm</strong> のJATMA適用レンジ: <strong>${ev.rimRange.minJ.toFixed(1)}J 〜 ${ev.rimRange.maxJ.toFixed(1)}J</strong> (標準 ${ev.rimRange.stdJ.toFixed(1)}J)<br>` +
    `検討ホイール: <strong>${tm.j.toFixed(1)}J</strong> (${tm.j < ev.rimRange.minJ ? 'やや幅狭/ムッチリ寄り' : tm.j > ev.rimRange.maxJ ? 'やや幅広/引っ張り寄り' : '標準適合レンジ内'})`;

  setCard('evClearance', 'pillClearance', ev.clearLevel, ev.clearText);
  document.getElementById('bodyClearance').innerHTML =
    `【外側 vs 純正最大】外リム <strong>${fmt(ev.outerRimDiff)}</strong> / 外タイヤ <strong>${fmt(ev.outerTireDiff)}</strong> (設定余裕 +${ev.fenderMargin}mm)<br>` +
    `【内側 vs 純正最小】リム径R <strong>${fmt(ev.rimRadDiff)}</strong> / 内リム <strong>${fmt(ev.innerRimDiff)}</strong> / 内タイヤ <strong>${fmt(ev.innerTireDiff)}</strong>`;

  // 5. 車種あるある & 物理チェック
  setCard('evPhysical', 'pillPhysical', ev.physLevel, ev.physText);
  document.getElementById('physicalSpecs').innerHTML = `
    <span class="spec-chip">車体ハブ: ${ev.vSpec.hubMm ? `${ev.vSpec.hubMm}mm` : '要確認'}</span>
    <span class="spec-chip">PCD: ${ev.vSpec.pcd}</span>
    <span class="spec-chip">ピッチ: ${ev.vSpec.pitch}</span>
    <span class="spec-chip">純正座面: ${ev.vSpec.seat}</span>
  `;
  document.getElementById('bodyPhysical').innerHTML = `<strong>${ev.physNote}</strong>`;
  document.getElementById('carTrapList').innerHTML = ev.vSpec.traps.map(t => `<li>${t}</li>`).join('');

  renderAruaruDict();
  renderAlternatives(mn, tm);
  renderAffiliateLinks(ev);
  drawEvidenceCanvas(ev);
  updateAlertModalContent(ev);
  window.__lastEvidence = ev;
}

function renderAffiliateLinks(ev) {
  const { tm, vSpec } = ev;
  const sizeStr = `${tm.width}/${tm.aspect}R${tm.inch}`;
  const items = [
    { label: `タイヤ「${sizeStr}」最安検索`, query: `${sizeStr} サマータイヤ` }
  ];

  if (state.wheelOrigin === 'aftermarket') {
    const pitchShort = vSpec.pitch.includes('1.25') ? 'M12 P1.25' : vSpec.pitch.includes('M14') ? 'M14' : 'M12 P1.5';
    items.push({ label: `60°テーパーナット (${pitchShort})`, query: `ホイールナット 60度 テーパー ${pitchShort}` });
    if (vSpec.hubMm && vSpec.hubMm < 73) {
      items.push({ label: `ハブリング (73mm→${vSpec.hubMm}mm)`, query: `ハブリング 73 ${vSpec.hubMm}` });
    }
  }
  if (tm.spacer > 0 || ev.outerRimDiff < -5) {
    items.push({ label: `ホイールスペーサー (${tm.spacer || 5}mm等)`, query: `ホイールスペーサー ${tm.spacer || 5}mm` });
  }

  document.getElementById('shopRows').innerHTML = items.map(it => {
    const urls = buildShopUrls(it.query);
    return `
      <div class="shop-row">
        <span class="shop-label">${it.label}</span>
        <div class="shop-links">
          <a class="shop-link rakuten" href="${urls.rakuten}" target="_blank" rel="noopener">楽天市場</a>
          <a class="shop-link amazon" href="${urls.amazon}" target="_blank" rel="noopener">Amazon</a>
          <a class="shop-link yahoo" href="${urls.yahoo}" target="_blank" rel="noopener">Yahoo!</a>
        </div>
      </div>
    `;
  }).join('');
}

function renderAruaruDict() {
  const q = document.getElementById('aruaruSearch').value.trim().toLowerCase();
  const box = document.getElementById('aruaruResults');
  const entries = Object.entries(CAR_ARUARU_DB).filter(([key, d]) => {
    if (!q) return key === state.presetKey;
    const text = `${d.name} ${d.pcd} ${d.pitch} ${d.seat} ${d.hubMm} ${d.traps.join(' ')}`.toLowerCase();
    return text.includes(q);
  });

  if (entries.length === 0) {
    box.innerHTML = '<div style="font-size:11px;color:#64748b;">該当する車系あるあるがありません。</div>';
    return;
  }

  box.innerHTML = entries.map(([key, d]) => `
    <div class="aruaru-item">
      <div class="aruaru-item-head">
        <span>${d.name} (${d.pcd} / ハブ${d.hubMm}mm)</span>
        <button class="aruaru-apply-btn" data-preset="${key}">この車種を適用</button>
      </div>
      <div style="color:#475569;">${d.traps[0]}</div>
    </div>
  `).join('');

  box.querySelectorAll('.aruaru-apply-btn').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
}

function setCard(cardId, pillId, level, text) {
  document.getElementById(cardId).className = `ev-card ${level}`;
  const pill = document.getElementById(pillId);
  pill.className = `ev-pill ${level}`;
  pill.textContent = text;
}

function getAlternativeCandidates(mn, tm) {
  return POPULAR_BUDGET_SIZES.map(sz => {
    const m = calcMetrics({ ...sz, j: tm.j, et: tm.et });
    const diffPct = ((m.tireDia - mn.tireDia) / mn.tireDia) * 100;
    const range = calcRimRange(sz.width, sz.aspect);
    const fitsRim = tm.j >= range.minJ - 0.5 && tm.j <= range.maxJ + 0.5;
    const inchOk = sz.inch >= mn.inch;
    return { ...sz, tireDia: m.tireDia, diffPct, fitsRim, inchOk };
  })
    .filter(c => Math.abs(c.diffPct) <= 2.5 && c.inchOk)
    .sort((a, b) => (b.fitsRim - a.fitsRim) || (Math.abs(a.diffPct) - Math.abs(b.diffPct)))
    .slice(0, 6);
}

function applyAlternativeSize(c) {
  state.target.width = c.width;
  state.target.aspect = c.aspect;
  state.target.inch = c.inch;
  const liEst = estimateLI(c.width, c.aspect, c.inch);
  state.target.li = liEst.li;
  state.target.xl = liEst.xl;
  syncInputs();
}

function renderAlternatives(mn, tm) {
  const candidates = getAlternativeCandidates(mn, tm);

  const box = document.getElementById('altList');
  if (candidates.length === 0) {
    box.innerHTML = '<span style="font-size:11px;color:#64748b">純正外径 ±2.5% 以内の定番候補がありません（インチやJ数を確認してください）</span>';
    return;
  }

  box.innerHTML = candidates.map((c, i) => `
    <button class="alt-btn" data-alt-idx="${i}">
      <span>${c.width}/${c.aspect}R${c.inch} (${c.diffPct >= 0 ? '+' : ''}${c.diffPct.toFixed(1)}%)</span>
      <small>${c.note}${c.fitsRim ? '・現J数適合' : '・J数注意'}</small>
    </button>
  `).join('');

  box.querySelectorAll('.alt-btn').forEach(btn => {
    btn.addEventListener('click', () => applyAlternativeSize(candidates[Number(btn.dataset.altIdx)]));
  });
}

// --- 2D Evidence Canvas ---
const canvas = document.getElementById('evidenceCanvas');
const ctx = canvas.getContext('2d');

function drawEvidenceCanvas(ev) {
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  if (w <= 0 || h <= 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const { tm, mn, mx } = ev;
  const maxRad = Math.max(tm.tireRad, mn.tireRad, mx.tireRad, 340);
  const cyAxis = h - 32;
  const scale = Math.min((h - 78) / (maxRad * 1.12), (w - 80) / 380);
  const cxCenter = w * 0.52;

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let mm = -250; mm <= 200; mm += 50) {
    const px = cxCenter + mm * scale;
    if (px < 16 || px > w - 16) continue;
    ctx.beginPath();
    ctx.moveTo(px, 24);
    ctx.lineTo(px, cyAxis);
    ctx.stroke();
  }

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(cxCenter, 24);
  ctx.lineTo(cxCenter, cyAxis);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(16, cyAxis);
  ctx.lineTo(w - 16, cyAxis);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = '600 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('← 車体側 (ブレーキ/サス)', 12, 18);
  ctx.textAlign = 'right';
  ctx.fillText('フェンダー側 (外側) →', w - 12, 18);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('ハブ面 (0mm)', cxCenter, h - 10);

  ctx.fillStyle = 'rgba(148, 163, 184, 0.30)';
  ctx.fillRect(cxCenter - 32 * scale, cyAxis - 145 * scale, 22 * scale, 145 * scale);
  ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
  ctx.fillRect(cxCenter - 42 * scale, cyAxis - 150 * scale, 34 * scale, 52 * scale);

  const fenderLimitX = cxCenter + (Math.max(mx.outerRimX, mx.outerTireX) + ev.fenderMargin) * scale;
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(fenderLimitX, 28);
  ctx.lineTo(fenderLimitX, cyAxis);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#0284c7';
  ctx.font = '700 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`限界(+${ev.fenderMargin})`, fenderLimitX + 4, 38);

  const drawWheelTireProfile = (m, strokeColor, fillColor, dashed, lineWidth) => {
    ctx.save();
    ctx.translate(cxCenter, cyAxis);
    if (dashed) ctx.setLineDash([5, 4]);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = lineWidth;

    const xIn = m.innerRimX * scale;
    const xOut = m.outerRimX * scale;
    const rIn = m.barrelInnerRad * scale;
    const rOut = m.rimRad * scale;
    ctx.beginPath();
    ctx.rect(xIn, -rOut, xOut - xIn, rOut - rIn);
    if (!dashed) ctx.fill();
    ctx.stroke();

    const cx = m.centerX * scale;
    const rimHalf = (m.rimWidth / 2) * scale;
    const bulgeHalf = (m.actualSectionWidth / 2) * scale;
    const treadHalf = ((m.actualSectionWidth * 0.86) / 2) * scale;
    const rBead = m.rimRad * scale;
    const rMid = (m.rimRad + m.sidewallH * 0.52) * scale;
    const rTop = m.tireRad * scale;

    ctx.beginPath();
    ctx.moveTo(cx - rimHalf, -rBead);
    ctx.lineTo(cx - bulgeHalf, -rMid);
    ctx.lineTo(cx - treadHalf, -rTop);
    ctx.lineTo(cx + treadHalf, -rTop);
    ctx.lineTo(cx + bulgeHalf, -rMid);
    ctx.lineTo(cx + rimHalf, -rBead);
    ctx.closePath();
    if (!dashed) ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  drawWheelTireProfile(mn, '#64748b', 'transparent', true, 1.8);
  const tgtColor = ev.overall === 'ng' ? '#dc2626' : ev.overall === 'warn' ? '#d97706' : '#1d4ed8';
  const tgtFill = ev.overall === 'ng' ? 'rgba(220,38,38,0.14)' : ev.overall === 'warn' ? 'rgba(217,119,6,0.14)' : 'rgba(29,78,216,0.14)';
  drawWheelTireProfile(tm, tgtColor, tgtFill, false, 2.6);

  ctx.fillStyle = tgtColor;
  ctx.font = '700 11px sans-serif';
  ctx.textAlign = 'center';
  const topY = cyAxis - tm.tireRad * scale - 10;
  ctx.fillText(`外径差 ${fmt(ev.diaDiff)} (${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%)`, cxCenter + tm.centerX * scale, Math.max(36, topY));

  ctx.textAlign = 'left';
  ctx.fillText(`外リム ${fmt(ev.outerRimDiff)}`, cxCenter + tm.outerRimX * scale + 6, cyAxis - tm.rimRad * scale * 0.5);

  ctx.textAlign = 'right';
  ctx.fillText(`内リム ${fmt(ev.innerRimDiff)}`, cxCenter + tm.innerRimX * scale - 6, cyAxis - tm.rimRad * scale * 0.5);
}

function applyPreset(key) {
  const p = CAR_ARUARU_DB[key];
  if (!p) return;
  state.presetKey = key;
  state.maker = p.maker;
  Object.assign(state.min, p.min);
  Object.assign(state.max, p.max);
  Object.assign(state.target, p.target);
  document.getElementById('presetSelect').value = key;
  syncInputs();
  maybeAutoPopup(true);
}

function syncInputs() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (document.activeElement !== el) el.value = val;
  };

  setVal('t_width', state.target.width);
  setVal('t_aspect', state.target.aspect);
  setVal('t_inch', state.target.inch);
  setVal('t_j', state.target.j);
  setVal('t_et', state.target.et);
  setVal('t_spacer', state.target.spacer);
  setVal('t_li', state.target.li);
  document.getElementById('t_xl').checked = state.target.xl;
  document.getElementById('wheelOriginSelect').value = state.wheelOrigin;

  setVal('mn_width', state.min.width);
  setVal('mn_aspect', state.min.aspect);
  setVal('mn_inch', state.min.inch);
  setVal('mn_j', state.min.j);
  setVal('mn_et', state.min.et);
  setVal('mn_kpa', state.min.kpa);
  setVal('mn_li', state.min.li);
  document.getElementById('mn_xl').checked = state.min.xl;

  setVal('mx_width', state.max.width);
  setVal('mx_aspect', state.max.aspect);
  setVal('mx_inch', state.max.inch);
  setVal('mx_j', state.max.j);
  setVal('mx_et', state.max.et);
  setVal('mx_margin', state.max.margin);

  document.getElementById('makerSelect').value = state.maker;
  document.getElementById('presetSelect').value = state.presetKey || '';

  renderEvidence();
}

const bindNum = (id, groupObj, key, autoEstLi = false) => {
  const el = document.getElementById(id);
  el.addEventListener('input', (e) => {
    const raw = e.target.value.trim();
    if (raw === '' || raw === '-' || raw.endsWith('.')) return;
    const v = parseFloat(raw);
    if (isNaN(v)) return;
    groupObj[key] = v;
    if (autoEstLi && (key === 'width' || key === 'aspect' || key === 'inch')) {
      const est = estimateLI(groupObj.width, groupObj.aspect, groupObj.inch);
      groupObj.li = est.li;
      groupObj.xl = est.xl;
    }
    syncInputs();
  });
  el.addEventListener('change', () => {
    const ev = window.__lastEvidence || evaluateEvidence();
    if (ev.overall === 'ng' || ev.overall === 'warn') maybeAutoPopup(false);
  });
  el.addEventListener('blur', () => syncInputs());
};

bindNum('t_width', state.target, 'width', true);
bindNum('t_aspect', state.target, 'aspect', true);
bindNum('t_inch', state.target, 'inch', true);
bindNum('t_j', state.target, 'j');
bindNum('t_et', state.target, 'et');
bindNum('t_spacer', state.target, 'spacer');
bindNum('t_li', state.target, 'li');

bindNum('mn_width', state.min, 'width', true);
bindNum('mn_aspect', state.min, 'aspect', true);
bindNum('mn_inch', state.min, 'inch', true);
bindNum('mn_j', state.min, 'j');
bindNum('mn_et', state.min, 'et');
bindNum('mn_kpa', state.min, 'kpa');
bindNum('mn_li', state.min, 'li');

bindNum('mx_width', state.max, 'width');
bindNum('mx_aspect', state.max, 'aspect');
bindNum('mx_inch', state.max, 'inch');
bindNum('mx_j', state.max, 'j');
bindNum('mx_et', state.max, 'et');
bindNum('mx_margin', state.max, 'margin');

document.getElementById('t_xl').addEventListener('change', (e) => { state.target.xl = e.target.checked; renderEvidence(); maybeAutoPopup(false); });
document.getElementById('mn_xl').addEventListener('change', (e) => { state.min.xl = e.target.checked; renderEvidence(); maybeAutoPopup(false); });
document.getElementById('wheelOriginSelect').addEventListener('change', (e) => { state.wheelOrigin = e.target.value; renderEvidence(); maybeAutoPopup(true); });
document.getElementById('makerSelect').addEventListener('change', (e) => {
  state.maker = e.target.value;
  state.presetKey = '';
  syncInputs();
  maybeAutoPopup(true);
});
document.getElementById('aruaruSearch').addEventListener('input', () => renderAruaruDict());

function bindQuickParse(inputId, btnId, obj, hasLi) {
  const apply = () => {
    const str = document.getElementById(inputId).value.trim();
    if (!str) return;
    const tm = str.match(/(\d{3})\s*\/\s*(\d{2})\s*[RrCc]\s*(\d{2})/);
    if (tm) {
      obj.width = Number(tm[1]);
      obj.aspect = Number(tm[2]);
      obj.inch = Number(tm[3]);
      if (hasLi) {
        const est = estimateLI(obj.width, obj.aspect, obj.inch);
        obj.li = est.li;
        obj.xl = est.xl;
      }
    }
    const jm = str.match(/(\d+(?:\.\d+)?)\s*[Jj]/);
    if (jm) obj.j = Number(jm[1]);
    const etm = str.match(/([+-]\d+)(?:\s|$)/);
    if (etm) obj.et = Number(etm[1]);
    syncInputs();
    maybeAutoPopup(false);
  };
  document.getElementById(btnId).addEventListener('click', apply);
  document.getElementById(inputId).addEventListener('keydown', (e) => { if (e.key === 'Enter') apply(); });
}

bindQuickParse('targetQuick', 'targetQuickBtn', state.target, true);
bindQuickParse('minQuick', 'minQuickBtn', state.min, true);
bindQuickParse('maxQuick', 'maxQuickBtn', state.max, false);

document.getElementById('presetSelect').addEventListener('change', (e) => {
  if (e.target.value) applyPreset(e.target.value);
});

document.getElementById('shareUrlBtn').addEventListener('click', async () => {
  const url = new URL(window.location.href);
  const t = state.target, mn = state.min, mx = state.max;
  url.searchParams.set('t', `${t.width},${t.aspect},${t.inch},${t.j},${t.et},${t.spacer},${t.li},${t.xl ? 1 : 0}`);
  url.searchParams.set('mn', `${mn.width},${mn.aspect},${mn.inch},${mn.j},${mn.et},${mn.kpa},${mn.li},${mn.xl ? 1 : 0}`);
  url.searchParams.set('mx', `${mx.width},${mx.aspect},${mx.inch},${mx.j},${mx.et},${mx.margin}`);
  url.searchParams.set('mk', state.maker);
  url.searchParams.set('wo', state.wheelOrigin);
  if (state.presetKey) url.searchParams.set('pr', state.presetKey);
  try {
    await navigator.clipboard.writeText(url.toString());
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  } catch {
    prompt('以下のURLをコピーしてください:', url.toString());
  }
});

function loadFromUrl() {
  const p = new URLSearchParams(window.location.search);
  if (p.has('pr') && CAR_ARUARU_DB[p.get('pr')]) {
    state.presetKey = p.get('pr');
  }
  if (p.has('mk') && MAKER_DEFAULTS[p.get('mk')]) state.maker = p.get('mk');
  if (p.has('wo') && WHEEL_ORIGINS[p.get('wo')]) state.wheelOrigin = p.get('wo');
  if (p.has('t')) {
    const a = p.get('t').split(',');
    if (a.length >= 7) Object.assign(state.target, {
      width: Number(a[0]), aspect: Number(a[1]), inch: Number(a[2]),
      j: Number(a[3]), et: Number(a[4]), spacer: Number(a[5]),
      li: Number(a[6]), xl: a[7] === '1'
    });
  }
  if (p.has('mn')) {
    const a = p.get('mn').split(',');
    if (a.length >= 7) Object.assign(state.min, {
      width: Number(a[0]), aspect: Number(a[1]), inch: Number(a[2]),
      j: Number(a[3]), et: Number(a[4]), kpa: Number(a[5]),
      li: Number(a[6]), xl: a[7] === '1'
    });
  }
  if (p.has('mx')) {
    const a = p.get('mx').split(',');
    if (a.length >= 6) Object.assign(state.max, {
      width: Number(a[0]), aspect: Number(a[1]), inch: Number(a[2]),
      j: Number(a[3]), et: Number(a[4]), margin: Number(a[5])
    });
  }
}

if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(() => renderEvidence()).observe(document.querySelector('.canvas-wrap'));
}
window.addEventListener('resize', () => renderEvidence());

// --- PNG Evidence Sheet Exporter (1200x820) ---
function wrapTextLines(c, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    const test = line + ch;
    if (c.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function exportEvidenceSheetPng() {
  const ev = window.__lastEvidence || evaluateEvidence();
  const { tm, mn, mx } = ev;

  const sheet = document.createElement('canvas');
  sheet.width = 1200;
  sheet.height = 820;
  const sc = sheet.getContext('2d');

  // Background
  sc.fillStyle = '#ffffff';
  sc.fillRect(0, 0, 1200, 820);

  // Header Banner
  const statusMap = {
    ok: { bg: '#ecfdf5', bd: '#10b981', tx: '#065f46', tag: '適合・安全圏' },
    warn: { bg: '#fffbeb', bd: '#f59e0b', tx: '#92400e', tag: 'マッチング外・条件付きOK' },
    ng: { bg: '#fef2f2', bd: '#ef4444', tx: '#991b1b', tag: '装着不可 / 非推奨' }
  };
  const st = statusMap[ev.overall];
  sc.fillStyle = st.bg;
  sc.fillRect(24, 20, 1152, 86);
  sc.strokeStyle = st.bd;
  sc.lineWidth = 3;
  sc.strokeRect(24, 20, 1152, 86);

  sc.fillStyle = st.bd;
  sc.fillRect(40, 36, 195, 28);
  sc.fillStyle = '#ffffff';
  sc.font = 'bold 14px sans-serif';
  sc.textAlign = 'center';
  sc.fillText(st.tag, 137, 55);

  sc.textAlign = 'left';
  sc.fillStyle = st.tx;
  sc.font = 'bold 21px sans-serif';
  sc.fillText(`タイヤ・ホイール適合エビデンス診断シート — ${ev.vSpec.name}`, 250, 57);

  sc.fillStyle = '#475569';
  sc.font = '13px sans-serif';
  const nowStr = new Date().toLocaleString('ja-JP');
  sc.fillText(`診断日時: ${nowStr}   |   ハブ径:${ev.vSpec.hubMm || '?'}mm  PCD:${ev.vSpec.pcd}  ピッチ:${ev.vSpec.pitch}  座面:${ev.vSpec.seat}`, 40, 90);

  // Size comparison strip
  sc.fillStyle = '#f8fafc';
  sc.fillRect(24, 120, 1152, 62);
  sc.strokeStyle = '#cbd5e1';
  sc.lineWidth = 1;
  sc.strokeRect(24, 120, 1152, 62);

  sc.fillStyle = '#1e293b';
  sc.font = 'bold 15px sans-serif';
  sc.fillText(`検討サイズ: ${tm.width}/${tm.aspect}R${tm.inch} (${tm.j.toFixed(1)}J ${tm.effEt >= 0 ? '+' : ''}${tm.effEt}) [LI:${state.target.li}${state.target.xl ? ' XL' : ''}]`, 40, 146);
  sc.fillStyle = '#475569';
  sc.font = '13px sans-serif';
  sc.fillText(`純正最小基準: ${mn.width}/${mn.aspect}R${mn.inch} (${mn.j.toFixed(1)}J +${mn.et})  |  純正最大枠: ${mx.width}/${mx.aspect}R${mx.inch} (${mx.j.toFixed(1)}J +${mx.et}, 余裕+${ev.fenderMargin}mm)`, 40, 170);

  // Left: Transfer 2D Cross-Section Canvas
  sc.strokeStyle = '#cbd5e1';
  sc.strokeRect(24, 198, 560, 410);
  sc.drawImage(canvas, 26, 200, 556, 406);

  // Left Bottom: Diameter & Spec Summary
  sc.fillStyle = '#f8fafc';
  sc.fillRect(24, 622, 560, 174);
  sc.strokeStyle = '#cbd5e1';
  sc.strokeRect(24, 622, 560, 174);
  sc.fillStyle = '#0f172a';
  sc.font = 'bold 14px sans-serif';
  sc.fillText('車種別あるある・現場チェックポイント', 38, 646);
  sc.font = '12px sans-serif';
  sc.fillStyle = '#334155';
  let ly = 668;
  ev.vSpec.traps.slice(0, 3).forEach(trap => {
    const lines = wrapTextLines(sc, `• ${trap}`, 532);
    lines.slice(0, 2).forEach(ln => {
      if (ly < 788) {
        sc.fillText(ln, 38, ly);
        ly += 18;
      }
    });
  });

  // Right: 5 Evidence Rows
  const rightCards = [
    {
      title: `1. 外径・メーター検査 (${ev.diaText})`,
      level: ev.diaLevel,
      text: `純正 ${mn.tireDia.toFixed(0)}mm → 検討 ${tm.tireDia.toFixed(0)}mm (差 ${fmt(ev.diaDiff)} / ${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%) | メーター40km/h時実測 ${ev.actualSpeedAt40.toFixed(1)}km/h (車検30.9〜42.5) | 車高 ${fmt(ev.groundClearanceDiff)}`
    },
    {
      title: `2. 耐荷重・空気圧 (${ev.loadText})`,
      level: ev.loadLevel,
      text: `純正必要 ${ev.reqKg}kg/本 (${state.min.kpa}kPa) → 検討 同圧 ${ev.tgtKgSameKpa}kg / 最大 ${ev.tgtMaxKg}kg (${ev.tgtMaxKpa}kPa)` + (ev.loadLevel === 'warn' ? ` → ${ev.recommendedKpa}kPa昇圧でOK` : '')
    },
    {
      title: `3. リム幅 JATMA (${ev.rimText})`,
      level: ev.rimLevel,
      text: `タイヤ幅 ${tm.width}mm 適用レンジ ${ev.rimRange.minJ.toFixed(1)}J〜${ev.rimRange.maxJ.toFixed(1)}J に対し、検討ホイール ${tm.j.toFixed(1)}J`
    },
    {
      title: `4. クリアランス (${ev.clearText})`,
      level: ev.clearLevel,
      text: `外側(vs最大): リム ${fmt(ev.outerRimDiff)} / タイヤ ${fmt(ev.outerTireDiff)} (余裕+${ev.fenderMargin}mm)  |  内側(vs最小): 径R ${fmt(ev.rimRadDiff)} / リム ${fmt(ev.innerRimDiff)}`
    },
    {
      title: `5. ハブ径・ナット座面 (${ev.physText})`,
      level: ev.physLevel,
      text: ev.physNote
    }
  ];

  let ry = 198;
  rightCards.forEach(card => {
    const col = card.level === 'ng' ? '#ef4444' : card.level === 'warn' ? '#f59e0b' : '#10b981';
    sc.fillStyle = '#ffffff';
    sc.fillRect(602, ry, 574, 108);
    sc.strokeStyle = '#cbd5e1';
    sc.lineWidth = 1;
    sc.strokeRect(602, ry, 574, 108);
    sc.fillStyle = col;
    sc.fillRect(602, ry, 6, 108);

    sc.fillStyle = '#0f172a';
    sc.font = 'bold 14px sans-serif';
    sc.fillText(card.title, 618, ry + 24);

    sc.fillStyle = '#334155';
    sc.font = '12px sans-serif';
    const lines = wrapTextLines(sc, card.text, 544);
    lines.slice(0, 3).forEach((ln, idx) => {
      sc.fillText(ln, 618, ry + 48 + idx * 19);
    });
    ry += 120;
  });

  sheet.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitment_${tm.width}-${tm.aspect}R${tm.inch}_${tm.j}J_ET${tm.effEt}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

document.getElementById('saveSheetBtn').addEventListener('click', exportEvidenceSheetPng);
document.getElementById('modalSavePngBtn').addEventListener('click', exportEvidenceSheetPng);

// --- Popup Alert Modal Logic ---
let autoPopupEnabled = true;

function updateAlertModalContent(ev) {
  const alertCount = ev.ngList.length + ev.warnList.length;
  const totalBadge = alertCount + ev.vSpec.traps.length;

  const reopenBtn = document.getElementById('reopenAlertBtn');
  reopenBtn.className = `floating-alert-btn level-${ev.overall}`;
  document.getElementById('alertCountBadge').textContent = String(totalBadge);

  const dialog = document.getElementById('alertDialog');
  dialog.className = `modal-dialog status-${ev.overall}`;

  const badge = document.getElementById('modalBadge');
  const title = document.getElementById('modalTitle');
  const talk = document.getElementById('modalTalk');

  if (ev.overall === 'ng') {
    badge.textContent = '装着不可 / 危険';
    title.textContent = '【警告】装着不可・危険エビデンスがあります';
    talk.textContent = `💬 「${ev.tm.width}/${ev.tm.aspect}R${ev.tm.inch} (${ev.tm.j.toFixed(1)}J ${ev.tm.effEt >= 0 ? '+' : ''}${ev.tm.effEt})」は、安全基準・物理寸法に抵触するためおすすめできません。`;
  } else if (ev.overall === 'warn') {
    badge.textContent = '要注意・条件付きOK';
    title.textContent = '【要注意】マッチング外・車種固有トラップ確認';
    talk.textContent = `💬 「${ev.tm.width}/${ev.tm.aspect}R${ev.tm.inch}」はカタログ標準外ですが、下記条件（空気圧・ナット等）と車種トラップを確認すれば比較的装着できる圏内です。`;
  } else {
    badge.textContent = '適合・安全圏';
    title.textContent = `【適合確認】安全圏（${ev.vSpec.name}）`;
    talk.textContent = `💬 数値上の適合は安全圏です。下の車種固有の現場トラップ（ハブ径・ナット座面等）だけ念のためご確認ください。`;
  }

  const findingsList = document.getElementById('modalFindingsList');
  const findingsSec = document.getElementById('modalFindingsSection');
  const itemsHtml = [
    ...ev.ngList.map(t => `<li class="item-ng">${t}</li>`),
    ...ev.warnList.map(t => `<li class="item-warn">${t}</li>`)
  ];
  if (itemsHtml.length > 0) {
    findingsSec.hidden = false;
    findingsList.innerHTML = itemsHtml.join('');
  } else {
    findingsSec.hidden = false;
    findingsList.innerHTML = ev.okList.map(t => `<li>${t}</li>`).join('');
  }

  document.getElementById('modalTrapsTitle').textContent = `⚠️ ${ev.vSpec.name} の「現場あるある・固有トラップ」`;
  document.getElementById('modalTrapsList').innerHTML = ev.vSpec.traps.map(t => `<li>${t}</li>`).join('');

  const altsWrap = document.getElementById('modalAltsWrap');
  const altsList = document.getElementById('modalAltsList');
  const candidates = getAlternativeCandidates(ev.mn, ev.tm);
  if (ev.overall === 'ng' && candidates.length > 0) {
    altsWrap.hidden = false;
    altsList.innerHTML = candidates.map((c, i) => `
      <button class="alt-btn" data-modal-alt="${i}">
        <span>${c.width}/${c.aspect}R${c.inch} (${c.diffPct >= 0 ? '+' : ''}${c.diffPct.toFixed(1)}%)</span>
        <small>${c.note}${c.fitsRim ? '・現J数適合' : '・J数注意'}</small>
      </button>
    `).join('');
    altsList.querySelectorAll('[data-modal-alt]').forEach(btn => {
      btn.addEventListener('click', () => applyAlternativeSize(candidates[Number(btn.dataset.modalAlt)]));
    });
  } else {
    altsWrap.hidden = true;
  }
}

function openAlertModal() {
  document.getElementById('alertModal').hidden = false;
}

function closeAlertModal() {
  document.getElementById('alertModal').hidden = true;
}

function maybeAutoPopup(forceOnPresetOrOrigin = false) {
  if (!autoPopupEnabled) return;
  const ev = window.__lastEvidence || evaluateEvidence();
  if (forceOnPresetOrOrigin || ev.overall === 'ng' || ev.overall === 'warn') {
    openAlertModal();
  }
}

document.getElementById('autoPopupToggle').addEventListener('change', (e) => {
  autoPopupEnabled = e.target.checked;
});
document.getElementById('reopenAlertBtn').addEventListener('click', openAlertModal);
document.getElementById('verdictBanner').addEventListener('click', openAlertModal);
document.getElementById('modalCloseBtn').addEventListener('click', closeAlertModal);
document.getElementById('modalCloseTopBtn').addEventListener('click', closeAlertModal);
document.getElementById('alertModal').addEventListener('click', (e) => {
  if (e.target.id === 'alertModal') closeAlertModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.getElementById('alertModal').hidden) closeAlertModal();
});

loadFromUrl();
syncInputs();
