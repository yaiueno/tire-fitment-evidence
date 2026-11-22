const INCH_MM = 25.4;

// 公式ツール（楽天「URLからリンクを作成」/ もしも「どこでもリンク」等）で事前生成した無改変リンク辞書
// 規約順守のため、URLをJSで動的改変せず登録済みの公式リンクをそのまま使用する（未登録時は通常検索URLへフォールバック）
const STATIC_AFFILIATE_MAP = {
  '155/65R14': { rakuten: '', amazon: '', yahoo: '' },
  '165/55R15': { rakuten: '', amazon: '', yahoo: '' },
  '165/65R14': { rakuten: '', amazon: '', yahoo: '' },
  '175/65R14': { rakuten: '', amazon: '', yahoo: '' },
  '175/65R15': { rakuten: '', amazon: '', yahoo: '' },
  '185/60R15': { rakuten: '', amazon: '', yahoo: '' },
  '185/65R15': { rakuten: '', amazon: '', yahoo: '' },
  '195/65R15': { rakuten: '', amazon: '', yahoo: '' },
  '195/60R16': { rakuten: '', amazon: '', yahoo: '' },
  '205/55R16': { rakuten: '', amazon: '', yahoo: '' },
  '205/60R16': { rakuten: '', amazon: '', yahoo: '' },
  '215/45R17': { rakuten: '', amazon: '', yahoo: '' },
  '215/50R17': { rakuten: '', amazon: '', yahoo: '' },
  '215/55R17': { rakuten: '', amazon: '', yahoo: '' },
  '215/60R16': { rakuten: '', amazon: '', yahoo: '' },
  '225/40R18': { rakuten: '', amazon: '', yahoo: '' },
  '225/45R18': { rakuten: '', amazon: '', yahoo: '' },
  '225/65R17': { rakuten: '', amazon: '', yahoo: '' },
  nut_taper: { rakuten: '', amazon: '', yahoo: '' },
  spacer: { rakuten: '', amazon: '', yahoo: '' }
};

function buildShopUrls(keyword, mapKey = '') {
  const q = encodeURIComponent(keyword);
  const entry = (mapKey && STATIC_AFFILIATE_MAP[mapKey]) || {};
  return {
    rakuten: entry.rakuten || `https://search.rakuten.co.jp/search/mall/${q}/`,
    amazon: entry.amazon || `https://www.amazon.co.jp/s?k=${q}`,
    yahoo: entry.yahoo || `https://shopping.yahoo.co.jp/search?p=${q}`
  };
}

// 最大耐荷重テーブル (LI 69..120 -> kg @ 240kPa STD / 290kPa XL)
const LI_MAX_KG = {
  69: 325, 70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387, 76: 400,
  77: 412, 78: 425, 79: 437, 80: 450, 81: 462, 82: 475, 83: 487, 84: 500,
  85: 515, 86: 530, 87: 545, 88: 560, 89: 580, 90: 600, 91: 615, 92: 630,
  93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775, 100: 800,
  101: 825, 102: 850, 103: 875, 104: 900, 105: 925, 106: 950, 107: 975,
  108: 1000, 109: 1030, 110: 1060, 111: 1090, 112: 1120, 113: 1150, 114: 1180,
  115: 1215, 116: 1250, 117: 1285, 118: 1320, 119: 1360, 120: 1400
};

// 国産主要サイズ JATMA STD / ETRTO XL 規格辞書 ([stdLi, xlLi])
const STD_XL_LI_MAP = {
  '145/80R12': [74, 78], '145/80R13': [75, 79], '155/65R13': [73, 77],
  '155/65R14': [75, 79], '155/70R13': [75, 79], '155/80R13': [79, 83],
  '155/80R14': [84, 88], '165/55R14': [72, 76], '165/55R15': [75, 79],
  '165/60R15': [77, 81], '165/65R14': [79, 83], '165/65R15': [81, 85],
  '165/70R14': [81, 85], '165/80R13': [83, 87], '175/60R15': [81, 85],
  '175/60R16': [82, 86], '175/65R14': [82, 86], '175/65R15': [84, 88],
  '175/70R14': [84, 88], '175/80R15': [90, 94], '175/80R16': [91, 95],
  '185/55R15': [82, 86], '185/55R16': [83, 87], '185/60R15': [84, 88],
  '185/60R16': [86, 90], '185/65R14': [86, 90], '185/65R15': [88, 92],
  '185/70R14': [88, 92], '185/85R16': [98, 102], '195/45R16': [80, 84],
  '195/45R17': [81, 85], '195/50R15': [82, 86], '195/50R16': [84, 88],
  '195/50R19': [84, 88], '195/55R15': [85, 89], '195/55R16': [87, 91],
  '195/60R15': [88, 92], '195/60R16': [89, 93], '195/60R17': [90, 94],
  '195/65R15': [91, 95], '195/80R15': [96, 100], '205/40R17': [80, 84],
  '205/45R17': [84, 88], '205/50R16': [87, 91], '205/50R17': [89, 93],
  '205/55R16': [91, 95], '205/55R17': [91, 95], '205/60R16': [92, 96],
  '205/65R15': [94, 98], '205/65R16': [95, 99], '215/40R17': [83, 87],
  '215/40R18': [85, 89], '215/45R17': [87, 91], '215/45R18': [89, 93],
  '215/50R17': [91, 95], '215/50R18': [92, 96], '215/55R17': [94, 98],
  '215/55R18': [95, 99], '215/60R16': [95, 99], '215/60R17': [96, 100],
  '215/65R16': [98, 102], '215/65R17': [99, 103], '225/40R18': [88, 92],
  '225/40R19': [89, 93], '225/45R17': [91, 94], '225/45R18': [91, 95],
  '225/45R19': [92, 96], '225/50R17': [94, 98], '225/50R18': [95, 99],
  '225/55R17': [97, 101], '225/55R18': [98, 102], '225/55R19': [99, 103],
  '225/60R17': [99, 103], '225/60R18': [100, 104], '225/65R17': [102, 106],
  '225/65R18': [103, 107], '235/35R19': [87, 91], '235/40R18': [91, 95],
  '235/45R18': [94, 98], '235/50R18': [97, 101], '235/55R18': [100, 104],
  '235/55R19': [101, 105], '235/60R18': [103, 107], '245/35R19': [89, 93],
  '245/40R18': [93, 97], '245/40R19': [94, 98], '245/45R18': [96, 100],
  '245/45R19': [98, 102], '255/35R19': [92, 96], '265/65R17': [112, 116],
  '265/70R17': [115, 119]
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

const state = {
  mode: 'both',
  base: { width: 195, aspect: 65, inch: 15, j: 6.0, et: 45, inMargin: 10, outMargin: 12 },
  useMax: false,
  max: { width: 215, aspect: 45, inch: 17, j: 7.0, et: 50 },
  target: { width: 205, aspect: 55, inch: 16, j: 6.5, et: 45, spacer: 0 }
};

function kgToNearestLi(kg) {
  let bestLi = 69;
  let bestDiff = Infinity;
  for (const [liStr, maxKg] of Object.entries(LI_MAX_KG)) {
    const diff = Math.abs(maxKg - kg);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestLi = Number(liStr);
    }
  }
  return bestLi;
}

// ISO 4000-1 / ETRTO 物理空気室体積モデル＋主要規格辞書による STD / XL LI 自動算出
function autoCalcLoadSpec(width, aspect, inch) {
  const key = `${width}/${aspect}R${inch}`;
  let stdLi;
  let xlLi;
  if (STD_XL_LI_MAP[key]) {
    [stdLi, xlLi] = STD_XL_LI_MAP[key];
  } else {
    const S = Number(width) || 195;
    const H = S * ((Number(aspect) || 65) / 100);
    const dr = (Number(inch) || 15) * INCH_MM;
    // Calibrated ETRTO/ISO 4000-1 air-chamber capacity formula (kg at 240kPa STD)
    const kgEst = 0.00204 * Math.pow(S, 1.50) * Math.pow(H / S, 0.70) * Math.pow(dr + H, 0.80);
    stdLi = kgToNearestLi(kgEst);
    xlLi = Math.min(120, stdLi + 4);
  }
  const stdMaxKg = LI_MAX_KG[stdLi] || 500;
  const xlMaxKg = LI_MAX_KG[xlLi] || 560;
  return { stdLi, xlLi, stdMaxKg, xlMaxKg, primaryIsXl: Number(aspect) <= 45 };
}

function calcLoadCapacityAtKpa(li, isXl, kpa) {
  const maxKg = LI_MAX_KG[Math.max(69, Math.min(120, Math.round(li)))] || 500;
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

function calcTireRangeForRim(j) {
  const stdRaw = Math.round((((Number(j) || 6) * INCH_MM) / 0.72) / 10) * 10;
  const stdW = Math.max(135, Math.min(315, stdRaw));
  return { stdW, minW: stdW - 10, maxW: stdW + 10 };
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

function evaluateEvidence() {
  const mode = state.mode || 'both';
  const tm = calcMetrics(state.target, state.target.spacer);
  const bm = calcMetrics(state.base, 0);
  const mx = state.useMax ? calcMetrics(state.max, 0) : null;

  const ngList = [];
  const warnList = [];
  const okList = [];

  // 1. 外径・メーター誤差・車検基準 (useMax時は最小〜最大レンジの挟み撃ち判定対応)
  const diaDiff = tm.tireDia - bm.tireDia;
  const diaPct = (diaDiff / bm.tireDia) * 100;
  const actualSpeedAt40 = 40 * (tm.tireDia / bm.tireDia);
  const groundClearanceDiff = diaDiff / 2;

  let diaLevel = 'ok';
  let diaText = '適正圏';
  if (mx) {
    const minDia = Math.min(bm.tireDia, mx.tireDia);
    const maxDia = Math.max(bm.tireDia, mx.tireDia);
    const maxDiaDiff = tm.tireDia - maxDia;
    const maxDiaPct = (maxDiaDiff / maxDia) * 100;
    const minDiaDiff = tm.tireDia - minDia;
    const minDiaPct = (minDiaDiff / minDia) * 100;

    if (actualSpeedAt40 > 42.5 || actualSpeedAt40 < 31.0 || maxDiaPct > 2.5 || minDiaPct < -3.5) {
      diaLevel = 'ng';
      diaText = '車検NG/干渉恐れ';
      if (mode !== 'wheel') ngList.push(`【外径 NG】最小(${minDia.toFixed(0)}mm)〜最大(${maxDia.toFixed(0)}mm)の純正許容レンジから大きく外れています（最小比 ${fmt(diaDiff)}, メーター40km/h時実測 ${actualSpeedAt40.toFixed(1)}km/h）。`);
    } else if (tm.tireDia > maxDia + 3 || tm.tireDia < minDia - 5 || Math.abs(diaPct) > 2.5) {
      diaLevel = 'warn';
      diaText = '注意(レンジ外/誤差)';
      if (mode !== 'wheel') warnList.push(`【外径 注意】純正最小〜最大レンジ(${minDia.toFixed(0)}〜${maxDia.toFixed(0)}mm)を少し外れています（検討 ${tm.tireDia.toFixed(0)}mm / 実速度 ${actualSpeedAt40.toFixed(1)}km/h）。干渉と地上高変化(${fmt(groundClearanceDiff)})を確認してください。`);
    } else {
      if (mode !== 'wheel') okList.push(`外径 ${tm.tireDia.toFixed(0)}mm は純正最小〜最大レンジ (${minDia.toFixed(0)}〜${maxDia.toFixed(0)}mm) 内・メーター検査も安全圏です。`);
    }
  } else {
    if (actualSpeedAt40 > 42.5 || actualSpeedAt40 < 31.0 || diaPct > 3.5 || diaPct < -4.0) {
      diaLevel = 'ng';
      diaText = '車検NG/干渉恐れ';
      if (mode !== 'wheel') ngList.push(`【外径 NG】現在比 ${fmt(diaDiff)} (${diaPct >= 0 ? '+' : ''}${diaPct.toFixed(1)}%)。メーター40km/h時の実速度が ${actualSpeedAt40.toFixed(1)}km/h となり、平成19年以降のスピードメーター検査基準（30.9〜42.5km/h）またはタイヤハウス干渉限界を逸脱する恐れがあります。`);
    } else if (Math.abs(diaPct) > 2.0) {
      diaLevel = 'warn';
      diaText = '注意(誤差/車高)';
      if (mode !== 'wheel') warnList.push(`【外径 注意】現在比 ${fmt(diaDiff)} (${diaPct >= 0 ? '+' : ''}${diaPct.toFixed(1)}%)。車検基準内（実速度 ${actualSpeedAt40.toFixed(1)}km/h）ですが、最低地上高が ${fmt(groundClearanceDiff)} 変化し、ステア全切り時の干渉確認が必要です。`);
    } else {
      if (mode !== 'wheel') okList.push(`外径差 ${fmt(diaDiff)} (${diaPct >= 0 ? '+' : ''}${diaPct.toFixed(1)}%) で現在とほぼ同等・車検メーター誤差も安全圏です。`);
    }
  }

  // 2. ロードインデックス (STD / XL 完全自動算出) & 必要空気圧逆算
  const baseLoad = autoCalcLoadSpec(bm.width, bm.aspect, bm.inch);
  const tgtLoad = autoCalcLoadSpec(tm.width, tm.aspect, tm.inch);
  const reqKg = baseLoad.primaryIsXl
    ? calcLoadCapacityAtKpa(baseLoad.xlLi, true, 270)
    : baseLoad.stdMaxKg;

  const tgtStdAt240 = tgtLoad.stdMaxKg;
  const tgtXlAt290 = tgtLoad.xlMaxKg;

  let loadLevel = 'ok';
  let loadText = 'STD/XLともOK';
  let recommendedKpa = 240;

  if (tgtStdAt240 >= reqKg) {
    recommendedKpa = 240;
    for (let p = 200; p <= 240; p += 10) {
      if (calcLoadCapacityAtKpa(tgtLoad.stdLi, false, p) >= reqKg) {
        recommendedKpa = p;
        break;
      }
    }
    if (mode !== 'wheel') okList.push(`耐荷重 (自動算出): 標準STD(LI ${tgtLoad.stdLi}=${tgtStdAt240}kg) / XL(LI ${tgtLoad.xlLi}=${tgtXlAt290}kg) ともに基準必要耐荷重 ${reqKg}kg (基準LI ${baseLoad.primaryIsXl ? `${baseLoad.xlLi}XL` : baseLoad.stdLi}) を確保しています。`);
  } else if (tgtXlAt290 >= reqKg) {
    recommendedKpa = 290;
    for (let p = 240; p <= 290; p += 5) {
      if (calcLoadCapacityAtKpa(tgtLoad.xlLi, true, p) >= reqKg) {
        recommendedKpa = p;
        break;
      }
    }
    loadLevel = 'warn';
    loadText = `XL ${recommendedKpa}kPa必要`;
    if (mode !== 'wheel') warnList.push(`【耐荷重 XL指定・昇圧でOK】標準STD(LI ${tgtLoad.stdLi}=${tgtStdAt240}kg)では基準必要値 ${reqKg}kg に ${reqKg - tgtStdAt240}kg 不足しますが、XL規格(LI ${tgtLoad.xlLi})のタイヤを選び空気圧を「${recommendedKpa}kPa」へ設定すれば必要耐荷重を確保できます。`);
  } else {
    loadLevel = 'ng';
    loadText = `XL最大圧でも${reqKg - tgtXlAt290}kg不足`;
    if (mode !== 'wheel') ngList.push(`【耐荷重 NG】エアボリューム不足のため、XL規格(LI ${tgtLoad.xlLi})の最大空気圧290kPaでも耐荷重 ${tgtXlAt290}kg となり、基準必要値 ${reqKg}kg に ${reqKg - tgtXlAt290}kg 不足します。バースト・偏摩耗・車検不合格の危険があるため不可です。`);
  }

  // 3. リム幅・推奨幅チェック
  const rimRange = calcRimRange(tm.width, tm.aspect);
  const baseStdJ = calcRimRange(bm.width, bm.aspect).stdJ;
  const tireRangeForRim = calcTireRangeForRim(tm.j);
  let rimLevel = 'ok';
  let rimText = '適用範囲内';

  if (mode === 'wheel') {
    rimLevel = 'ok';
    rimText = `${bm.j.toFixed(1)}J → ${tm.j.toFixed(1)}J`;
    okList.push(`リム幅 ${bm.j.toFixed(1)}J → ${tm.j.toFixed(1)}J / 推奨タイヤ幅 ${tireRangeForRim.minW}〜${tireRangeForRim.maxW}mm`);
  } else if (mode === 'tire') {
    if (baseStdJ < rimRange.minJ || baseStdJ > rimRange.maxJ) {
      rimLevel = 'warn';
      rimText = '純正リム幅注意';
      warnList.push(`【リム幅 注意】基準タイヤ標準リム幅(${baseStdJ.toFixed(1)}J前後)は検討タイヤ幅 ${tm.width}mm のJATMA適用レンジ(${rimRange.minJ.toFixed(1)}〜${rimRange.maxJ.toFixed(1)}J)から外れています。`);
    } else {
      rimLevel = 'ok';
      rimText = `適用 ${rimRange.minJ.toFixed(1)}〜${rimRange.maxJ.toFixed(1)}J`;
      okList.push(`タイヤ幅 ${tm.width}mm のJATMA適用リム幅は ${rimRange.minJ.toFixed(1)}J〜${rimRange.maxJ.toFixed(1)}J（標準 ${rimRange.stdJ.toFixed(1)}J）です。`);
    }
  } else {
    if (tm.j < rimRange.minJ - 0.5 || tm.j > rimRange.maxJ + 0.5) {
      rimLevel = 'ng';
      rimText = '規格外(危険)';
      ngList.push(`【リム幅 NG】タイヤ幅 ${tm.width}mm の適用リム幅は ${rimRange.minJ.toFixed(1)}J〜${rimRange.maxJ.toFixed(1)}J です。${tm.j.toFixed(1)}J は大きく外れており、ビード落ちやエア漏れ・サイドウォール破損の危険があります。`);
    } else if (tm.j < rimRange.minJ || tm.j > rimRange.maxJ) {
      rimLevel = 'warn';
      rimText = tm.j > rimRange.maxJ ? '軽度引っ張り' : '軽度ムッチリ';
      warnList.push(`【リム幅 マッチング外】JATMA適用(${rimRange.minJ.toFixed(1)}〜${rimRange.maxJ.toFixed(1)}J)から 0.5J 差の「${rimText}」状態です。通常走行は可能な圏内ですが、空気圧管理と縁石接触に注意してください。`);
    } else {
      okList.push(`リム幅 ${tm.j.toFixed(1)}J はタイヤ幅 ${tm.width}mm のJATMA適用レンジ (${rimRange.minJ.toFixed(1)}〜${rimRange.maxJ.toFixed(1)}J) 内に収まっています。`);
    }
  }

  // 4. 基準比クリアランス (wheelモード時はリム端のみで厳密算出)
  const outRef = mx || bm;
  const rimRadDiff = tm.rimRad - bm.rimRad;
  const innerRimDiff = tm.innerRimX - bm.innerRimX;
  const innerTireDiff = tm.innerTireX - bm.innerTireX;
  const outerRimDiff = tm.outerRimX - outRef.outerRimX;
  const outerTireDiff = tm.outerTireX - outRef.outerTireX;

  const inMargin = Math.max(0, Number(state.base.inMargin) || 0);
  const outMargin = Math.max(0, Number(state.base.outMargin) || 0);
  const inShift = mode === 'wheel'
    ? Math.max(0, -innerRimDiff)
    : Math.max(0, -Math.min(innerRimDiff, innerTireDiff));
  const inRemain = inMargin - inShift;
  const outShift = mode === 'wheel'
    ? Math.max(0, outerRimDiff)
    : Math.max(0, Math.max(outerRimDiff, outerTireDiff));
  const outRemain = outMargin - outShift;

  let clearLevel = 'ok';
  let clearText = 'クリアランス安全';

  if (mode !== 'tire') {
    if (rimRadDiff < -2) {
      clearLevel = 'ng';
      clearText = '小径・ブレーキ干渉恐れ';
      ngList.push(`【小径 NG】最小基準 (${bm.inch}インチ) より小さい ${tm.inch}インチ のため、ブレーキキャリパー／ローターとホイール内側が干渉する可能性が高いです。`);
    }
    if (inRemain < 0) {
      clearLevel = 'ng';
      clearText = `イン側干渉 (${inRemain.toFixed(1)}mm)`;
      ngList.push(`【イン側干渉 NG】最小基準の内側からさらに ${inShift.toFixed(1)}mm 奥に入るため、設定したイン側余裕(${inMargin}mm)を ${Math.abs(inRemain).toFixed(1)}mm 超えてストラット・サス・インナーに干渉します。`);
    }
    if (outRemain < 0) {
      clearLevel = 'ng';
      clearText = `アウト側ハミタイ (${outRemain.toFixed(1)}mm)`;
      ngList.push(`【アウト側ハミタイ NG】${mx ? '最大純正枠' : '現在基準'}より外に ${outShift.toFixed(1)}mm 出るため、設定したアウト側フェンダー余裕(${outMargin}mm)を ${Math.abs(outRemain).toFixed(1)}mm 超えてハミタイ・フェンダー干渉します。`);
    }

    if (clearLevel === 'ok') {
      if (inRemain <= 3 && inShift > 0) {
        clearLevel = 'warn';
        clearText = `イン側ギリギリ (残${inRemain.toFixed(1)}mm)`;
        warnList.push(`【イン側 ギリギリ】イン側余裕まで残り ${inRemain.toFixed(1)}mm です。ステア全切り時や振動時の接触に注意してください。`);
      }
      if (outRemain <= 3 && outShift > 0) {
        clearLevel = 'warn';
        clearText = `ツライチ限界 (残${outRemain.toFixed(1)}mm)`;
        warnList.push(`【アウト側 ツライチ限界】フェンダー限界まで残り ${outRemain.toFixed(1)}mm のツライチ状態です。個体差やバンプ時の干渉に留意してください。`);
      }
      if (clearLevel === 'ok') {
        okList.push(`クリアランス安全圏（イン側残り +${inRemain.toFixed(1)}mm / アウト側残り +${outRemain.toFixed(1)}mm）です。`);
      }
    }
  }

  let overall = 'ok';
  if (mode === 'wheel') {
    if (ngList.length > 0) overall = 'ng';
    else if (warnList.length > 0) overall = 'warn';
  } else if (mode === 'tire') {
    if (ngList.length > 0) overall = 'ng';
    else if (warnList.length > 0 || Math.abs(diaPct) > 1.5) overall = 'warn';
  } else {
    if (ngList.length > 0) overall = 'ng';
    else if (warnList.length > 0 || Math.abs(diaDiff) > 2 || tm.inch !== bm.inch || tm.width !== bm.width) overall = 'warn';
    if (ngList.length === 0 && warnList.length === 0 && Math.abs(diaPct) <= 1.5) {
      overall = 'ok';
    }
  }

  return {
    mode, tm, bm, mx, overall, ngList, warnList, okList,
    diaDiff, diaPct, actualSpeedAt40, groundClearanceDiff, diaLevel, diaText,
    baseLoad, tgtLoad, reqKg, tgtStdAt240, tgtXlAt290, recommendedKpa, loadLevel, loadText,
    rimRange, baseStdJ, tireRangeForRim, rimLevel, rimText,
    rimRadDiff, innerRimDiff, innerTireDiff, outerRimDiff, outerTireDiff,
    inMargin, outMargin, inShift, inRemain, outShift, outRemain, clearLevel, clearText
  };
}

function setCard(cardId, pillId, level, text) {
  document.getElementById(cardId).className = `ev-card ${level}`;
  const pill = document.getElementById(pillId);
  pill.className = `ev-pill ${level}`;
  pill.textContent = text;
}

function renderEvidence() {
  const ev = evaluateEvidence();
  const { tm, bm, mx, mode } = ev;

  document.body.dataset.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  if (mode === 'tire') {
    document.getElementById('baseSummary').textContent = `${bm.width}/${bm.aspect}R${bm.inch}`;
    document.getElementById('targetSummary').textContent = `${tm.width}/${tm.aspect}R${tm.inch}`;
    document.getElementById('baseQuick').placeholder = '例: 195/65R15 (全角・ハイフンOK)';
    document.getElementById('maxQuick').placeholder = '例: 215/45R17';
    document.getElementById('targetQuick').placeholder = '例: 215/45ZR17 91W XL';
  } else if (mode === 'wheel') {
    document.getElementById('baseSummary').textContent = `${bm.inch}×${bm.j.toFixed(1)}J ${bm.et >= 0 ? '+' : ''}${bm.et}`;
    document.getElementById('targetSummary').textContent = `${tm.inch}×${tm.j.toFixed(1)}J ${tm.effEt >= 0 ? '+' : ''}${tm.effEt}`;
    document.getElementById('baseQuick').placeholder = '例: 15×6.0J +45 (15 6J ET45等OK)';
    document.getElementById('maxQuick').placeholder = '例: 17×7.0J +50';
    document.getElementById('targetQuick').placeholder = '例: 17×7.5J +45 スペーサー5mm';
  } else {
    document.getElementById('baseSummary').textContent =
      `${bm.width}/${bm.aspect}R${bm.inch} | ${bm.j.toFixed(1)}J ${bm.et >= 0 ? '+' : ''}${bm.et}`;
    document.getElementById('targetSummary').textContent =
      `${tm.width}/${tm.aspect}R${tm.inch} | ${tm.j.toFixed(1)}J ${tm.effEt >= 0 ? '+' : ''}${tm.effEt}`;
    document.getElementById('baseQuick').placeholder = '例: 195/65R15 6.0J +45 (全角・ET・ハイフンOK)';
    document.getElementById('maxQuick').placeholder = '例: 215/45R17 7.0J +50';
    document.getElementById('targetQuick').placeholder = '例: 215/45ZR17 91W XL 17×7.5J ET45';
  }

  document.getElementById('legendMaxItem').hidden = !state.useMax;
  document.getElementById('marginBar').hidden = (mode === 'tire');
  document.getElementById('evDiameter').hidden = (mode === 'wheel');
  document.getElementById('diameterGaugeBox').hidden = (mode === 'wheel');
  document.getElementById('evLoad').hidden = (mode === 'wheel');
  document.getElementById('evClearance').hidden = (mode === 'tire');
  document.getElementById('evAlt').hidden = (mode === 'wheel');
  document.getElementById('legendInLim').hidden = (mode === 'tire');
  document.getElementById('legendOutLim').hidden = (mode === 'tire');

  const banner = document.getElementById('verdictBanner');
  const badge = document.getElementById('verdictBadge');
  const title = document.getElementById('verdictTitle');
  const talk = document.getElementById('verdictTalk');
  const reasons = document.getElementById('verdictReasons');

  const rangeIntro = mode === 'wheel'
    ? (mx
      ? `同車種の最小基準（${bm.inch}×${bm.j.toFixed(1)}J ${bm.et >= 0 ? '+' : ''}${bm.et}）と最大基準（${mx.inch}×${mx.j.toFixed(1)}J ${mx.et >= 0 ? '+' : ''}${mx.et}）の許容枠と比較し`
      : `今の基準ホイール（${bm.inch}×${bm.j.toFixed(1)}J ${bm.et >= 0 ? '+' : ''}${bm.et}）と比べると`)
    : (mx
      ? `同車種の最小基準（${bm.width}/${bm.aspect}R${bm.inch}）と最大基準（${mx.width}/${mx.aspect}R${mx.inch}）の許容枠と比較し`
      : `今のお車の基準（${bm.width}/${bm.aspect}R${bm.inch}）と比べると`);

  banner.className = `verdict-banner status-${ev.overall}`;
  if (ev.overall === 'ng') {
    badge.textContent = '装着不可 / 非推奨';
    title.textContent = '根拠データ上、装着リスクが高いためおすすめできません';
    talk.textContent = mode === 'wheel'
      ? `💬 接客トーク例: 「ご希望のホイールは、${rangeIntro}【${ev.ngList[0]?.match(/【(.*?)】/)?.[1] || 'クリアランス基準'}】に引っかかるため装着できません（干渉の危険があります）。インセットやJ数の見直しをご検討ください。」`
      : `💬 接客トーク例: 「ご希望のサイズは価格面では魅力的ですが、${rangeIntro}【${ev.ngList[0]?.match(/【(.*?)】/)?.[1] || '安全基準'}】に引っかかるため装着できません（危険があります）。すぐ下の定番代替サイズなら安全に代用できます。」`;
  } else if (ev.overall === 'warn') {
    badge.textContent = 'マッチング外・条件付きOK';
    title.textContent = '基準サイズと異なりますが、条件・注意点を踏まえれば検討できる圏内です';
    talk.textContent = mode === 'wheel'
      ? `💬 接客トーク例: 「${rangeIntro}大きな干渉は回避できていますが、フェンダー・サスペンションとのクリアランスが限界付近です。実車の個体差やバンプ時の干渉にご注意ください。」`
      : `💬 接客トーク例: 「純正と違うサイズですが、${rangeIntro}外径差(${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%)・耐荷重を計算上クリアしています。下の条件（空気圧 ${ev.recommendedKpa}kPa 設定など）を守れば比較的安心して履けます。」`;
  } else {
    badge.textContent = '適合・安全圏';
    title.textContent = mx ? '最小〜最大マッチングの安全範囲内に収まっています' : '現在のサイズと同等レンジで問題なく装着できます';
    talk.textContent = mode === 'wheel'
      ? `💬 接客トーク例: 「リム幅・インセットのクリアランスおよびブレーキ径すべて${mx ? '上下限レンジ' : '現在の基準'}内に綺麗に収まっていますので、このまま安心してお選びいただけます。」`
      : `💬 接客トーク例: 「外径・耐荷重${mode === 'both' ? '・リム幅・出面すべて' : '・適用リム幅すべて'}${mx ? '純正上下限レンジ' : '現在の基準'}内に綺麗に収まっていますので、このまま安心してお選びいただけます。」`;
  }

  reasons.innerHTML = [...ev.ngList, ...ev.warnList, ...ev.okList].map(r => `<li>${r}</li>`).join('');

  // 1. 外径
  setCard('evDiameter', 'pillDiameter', ev.diaLevel, ev.diaText);
  document.getElementById('bodyDiameter').innerHTML =
    `現在外径 <strong>${bm.tireDia.toFixed(0)}mm</strong> → 検討 <strong>${tm.tireDia.toFixed(0)}mm</strong> (差 <strong>${fmt(ev.diaDiff)}</strong> / <strong>${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%</strong>)<br>` +
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

  // 2. 耐荷重 (自動算出 STD / XL)
  setCard('evLoad', 'pillLoad', ev.loadLevel, ev.loadText);
  document.getElementById('bodyLoad').innerHTML =
    `基準必要耐荷重: <strong>${ev.reqKg}kg/本</strong> (自動算出 STD LI <strong>${ev.baseLoad.stdLi}</strong> / XL LI <strong>${ev.baseLoad.xlLi}</strong>)<br>` +
    `検討タイヤ (自動算出): STD LI <strong>${ev.tgtLoad.stdLi}</strong>(最大240kPa時 <strong>${ev.tgtStdAt240}kg</strong>) / XL LI <strong>${ev.tgtLoad.xlLi}</strong>(最大290kPa時 <strong>${ev.tgtXlAt290}kg</strong>)` +
    (ev.loadLevel === 'warn' ? `<br>→ <strong>XL規格タイヤ選択＋${ev.recommendedKpa}kPa充填で必要耐荷重をクリア</strong>` : '');

  // 3. リム幅・推奨幅
  setCard('evRim', 'pillRim', ev.rimLevel, ev.rimText);
  if (mode === 'wheel') {
    document.getElementById('headRim').textContent = '3. リム幅変化・推奨タイヤ幅目安';
    document.getElementById('bodyRim').innerHTML =
      `基準ホイール <strong>${bm.j.toFixed(1)}J</strong> → 検討 <strong>${tm.j.toFixed(1)}J</strong> (幅変化 <strong>${fmt((tm.j - bm.j) * INCH_MM)}</strong>)<br>` +
      `推奨組み合わせタイヤ幅目安: <strong>${ev.tireRangeForRim.minW}〜${ev.tireRangeForRim.maxW}mm</strong> (標準 <strong>${ev.tireRangeForRim.stdW}mm</strong>)`;
  } else if (mode === 'tire') {
    document.getElementById('headRim').textContent = '3. タイヤ幅 × リム幅 (JATMA適用レンジ)';
    document.getElementById('bodyRim').innerHTML =
      `タイヤ幅 <strong>${tm.width}mm</strong> のJATMA適用レンジ: <strong>${ev.rimRange.minJ.toFixed(1)}J 〜 ${ev.rimRange.maxJ.toFixed(1)}J</strong> (標準 ${ev.rimRange.stdJ.toFixed(1)}J)<br>` +
      `純正タイヤ標準リム幅目安: <strong>${ev.baseStdJ.toFixed(1)}J前後</strong> (ホイール変更なしで履けるかの参考値)`;
  } else {
    document.getElementById('headRim').textContent = '3. タイヤ幅 × リム幅 (JATMA適用レンジ)';
    document.getElementById('bodyRim').innerHTML =
      `タイヤ幅 <strong>${tm.width}mm</strong> のJATMA適用レンジ: <strong>${ev.rimRange.minJ.toFixed(1)}J 〜 ${ev.rimRange.maxJ.toFixed(1)}J</strong> (標準 ${ev.rimRange.stdJ.toFixed(1)}J)<br>` +
      `検討ホイール: <strong>${tm.j.toFixed(1)}J</strong> (${tm.j < ev.rimRange.minJ ? 'やや幅狭/ムッチリ寄り' : tm.j > ev.rimRange.maxJ ? 'やや幅広/引っ張り寄り' : '標準適合レンジ内'})`;
  }

  // 4. クリアランス
  setCard('evClearance', 'pillClearance', ev.clearLevel, ev.clearText);
  if (mode === 'wheel') {
    document.getElementById('bodyClearance').innerHTML =
      `【イン側 (最小比 / 余裕 ${ev.inMargin}mm)】リム入り込み <strong>${ev.inShift.toFixed(1)}mm</strong> → 残り <strong>${fmt(ev.inRemain)}</strong> (内リム ${fmt(ev.innerRimDiff)} / 径R ${fmt(ev.rimRadDiff)})<br>` +
      `【アウト側 (${mx ? '最大枠比' : '現在比'} / 余裕 ${ev.outMargin}mm)】リム出幅 <strong>${ev.outShift.toFixed(1)}mm</strong> → 残り <strong>${fmt(ev.outRemain)}</strong> (外リム ${fmt(ev.outerRimDiff)})`;
  } else {
    document.getElementById('bodyClearance').innerHTML =
      `【イン側 (最小比 / 余裕 ${ev.inMargin}mm)】入り込み <strong>${ev.inShift.toFixed(1)}mm</strong> → 残り <strong>${fmt(ev.inRemain)}</strong> (内リム ${fmt(ev.innerRimDiff)} / 径R ${fmt(ev.rimRadDiff)})<br>` +
      `【アウト側 (${mx ? '最大枠比' : '現在比'} / 余裕 ${ev.outMargin}mm)】出幅 <strong>${ev.outShift.toFixed(1)}mm</strong> → 残り <strong>${fmt(ev.outRemain)}</strong> (外リム ${fmt(ev.outerRimDiff)} / 外タイヤ ${fmt(ev.outerTireDiff)})`;
  }

  if (mode !== 'wheel') renderAlternatives(bm, tm);
  renderAffiliateLinks(ev);
  drawEvidenceCanvas(ev);
  window.__lastEvidence = ev;
}

function renderAlternatives(bm, tm) {
  const candidates = POPULAR_BUDGET_SIZES.map(sz => {
    const m = calcMetrics({ ...sz, j: tm.j, et: tm.et });
    const diffPct = ((m.tireDia - bm.tireDia) / bm.tireDia) * 100;
    const range = calcRimRange(sz.width, sz.aspect);
    const fitsRim = tm.j >= range.minJ - 0.5 && tm.j <= range.maxJ + 0.5;
    const inchOk = sz.inch >= bm.inch;
    return { ...sz, tireDia: m.tireDia, diffPct, fitsRim, inchOk };
  })
    .filter(c => Math.abs(c.diffPct) <= 2.5 && c.inchOk)
    .sort((a, b) => (b.fitsRim - a.fitsRim) || (Math.abs(a.diffPct) - Math.abs(b.diffPct)))
    .slice(0, 6);

  const box = document.getElementById('altList');
  if (candidates.length === 0) {
    box.innerHTML = '<span style="font-size:11px;color:#64748b">現在外径 ±2.5% 以内の定番候補がありません</span>';
    return;
  }

  box.innerHTML = candidates.map((c, i) => `
    <button class="alt-btn" data-alt-idx="${i}">
      <span>${c.width}/${c.aspect}R${c.inch} (${c.diffPct >= 0 ? '+' : ''}${c.diffPct.toFixed(1)}%)</span>
      <small>${c.note}${c.fitsRim ? '・現J数適合' : '・J数注意'}</small>
    </button>
  `).join('');

  box.querySelectorAll('.alt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = candidates[Number(btn.dataset.altIdx)];
      state.target.width = c.width;
      state.target.aspect = c.aspect;
      state.target.inch = c.inch;
      syncInputs();
    });
  });
}

function renderAffiliateLinks(ev) {
  const { tm, mode } = ev;
  const sizeStr = `${tm.width}/${tm.aspect}R${tm.inch}`;
  const items = mode === 'wheel'
    ? [
        { label: `ホイール「${tm.inch}インチ ${tm.j}J」検索`, query: `${tm.inch}インチ ${tm.j}J アルミホイール`, key: `${tm.inch}x${tm.j}J` },
        { label: `社外用 60°テーパーナット`, query: `ホイールナット 60度 テーパー`, key: 'nut_taper' }
      ]
    : [
        { label: `タイヤ「${sizeStr}」価格比較`, query: `${sizeStr} サマータイヤ`, key: sizeStr },
        { label: `社外用 60°テーパーナット`, query: `ホイールナット 60度 テーパー`, key: 'nut_taper' }
      ];
  if (mode !== 'tire' && (tm.spacer > 0 || ev.outerRimDiff < -5)) {
    items.push({ label: `ホイールスペーサー (${tm.spacer || 5}mm等)`, query: `ホイールスペーサー ${tm.spacer || 5}mm`, key: 'spacer' });
  }

  document.getElementById('shopRows').innerHTML = items.map(it => {
    const urls = buildShopUrls(it.query, it.key);
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

// --- 2D Evidence Canvas (Upper Half Cross-Section) ---
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

  const { tm, bm, mx, mode } = ev;
  const maxRad = mode === 'wheel'
    ? Math.max(tm.rimRad, bm.rimRad, mx ? mx.rimRad : 0, 260)
    : Math.max(tm.tireRad, bm.tireRad, mx ? mx.tireRad : 0, 340);
  const cyAxis = h - 32;
  const scale = Math.min((h - 78) / (maxRad * 1.12), (w - 80) / 380);
  const cxCenter = w * (mode === 'tire' ? 0.5 : 0.52);

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
  if (mode === 'tire') {
    ctx.textAlign = 'center';
    ctx.fillText('中心線比較 (ホイール共通想定)', cxCenter, 18);
    ctx.fillStyle = '#0f172a';
    ctx.fillText('タイヤ断面中心', cxCenter, h - 10);
  } else {
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

    // Inner & Outer Clearance Limit Lines
    const outAnchor = mx || bm;
    const baseInEdge = mode === 'wheel' ? bm.innerRimX : Math.min(bm.innerRimX, bm.innerTireX);
    const baseOutEdge = mode === 'wheel' ? outAnchor.outerRimX : Math.max(outAnchor.outerRimX, outAnchor.outerTireX);
    const inLimitX = cxCenter + (baseInEdge - ev.inMargin) * scale;
    const outLimitX = cxCenter + (baseOutEdge + ev.outMargin) * scale;

    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;

    ctx.strokeStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(inLimitX, 28);
    ctx.lineTo(inLimitX, cyAxis);
    ctx.stroke();
    ctx.fillStyle = '#ea580c';
    ctx.font = '700 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`イン限界(-${ev.inMargin})`, Math.max(84, inLimitX - 4), 38);
    ctx.fillText(`残 ${fmt(ev.inRemain)}`, Math.max(84, inLimitX - 4), 51);

    ctx.strokeStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(outLimitX, 28);
    ctx.lineTo(outLimitX, cyAxis);
    ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.textAlign = 'left';
    ctx.fillText(`アウト限界(+${ev.outMargin})`, Math.min(w - 94, outLimitX + 4), 38);
    ctx.fillText(`残 ${fmt(ev.outRemain)}`, Math.min(w - 94, outLimitX + 4), 51);
    ctx.restore();
  }

  const normalizeCentered = (m) => {
    const stdRimW = calcRimRange(m.width, m.aspect).stdJ * INCH_MM;
    const actSecW = m.width + (stdRimW - m.width * 0.72) * 0.4;
    return {
      ...m,
      centerX: 0,
      rimWidth: stdRimW,
      innerRimX: -stdRimW / 2,
      outerRimX: stdRimW / 2,
      actualSectionWidth: actSecW
    };
  };

  const drawWheelTireProfile = (rawM, strokeColor, fillColor, dashed, lineWidth) => {
    const m = mode === 'tire' ? normalizeCentered(rawM) : rawM;
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

    if (mode === 'wheel') {
      // ハブ取付面からディスク面ラインを描画
      ctx.beginPath();
      ctx.moveTo(0, -rIn * 0.15);
      ctx.lineTo(0, -rOut * 0.92);
      ctx.lineTo(xOut - 4, -rOut * 0.92);
      ctx.stroke();
    } else {
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
    }

    ctx.restore();
  };

  drawWheelTireProfile(bm, '#64748b', 'transparent', true, 1.8);
  if (mx) drawWheelTireProfile(mx, '#0284c7', 'transparent', true, 1.8);
  const tgtColor = ev.overall === 'ng' ? '#dc2626' : ev.overall === 'warn' ? '#d97706' : '#1d4ed8';
  const tgtFill = ev.overall === 'ng' ? 'rgba(220,38,38,0.14)' : ev.overall === 'warn' ? 'rgba(217,119,6,0.14)' : 'rgba(29,78,216,0.14)';
  drawWheelTireProfile(tm, tgtColor, tgtFill, false, 2.6);

  ctx.fillStyle = tgtColor;
  ctx.font = '700 11px sans-serif';
  if (mode === 'tire') {
    const tmVis = normalizeCentered(tm);
    ctx.textAlign = 'center';
    const topY = cyAxis - tm.tireRad * scale - 10;
    ctx.fillText(`外径差 ${fmt(ev.diaDiff)} (${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%)`, cxCenter, Math.max(36, topY));
    ctx.textAlign = 'left';
    ctx.fillText(`幅 ${bm.width}→${tm.width}mm (${fmt(tm.width - bm.width)})`, cxCenter + (tmVis.actualSectionWidth / 2) * scale + 8, cyAxis - (tm.rimRad + tm.sidewallH * 0.55) * scale);
  } else if (mode === 'wheel') {
    ctx.textAlign = 'center';
    const topY = cyAxis - tm.rimRad * scale - 10;
    ctx.fillText(`リム径 ${bm.inch}"→${tm.inch}" (R${fmt(ev.rimRadDiff)})`, cxCenter + tm.centerX * scale, Math.max(36, topY));
    ctx.textAlign = 'left';
    ctx.fillText(`外リム ${fmt(ev.outerRimDiff)}`, cxCenter + tm.outerRimX * scale + 6, cyAxis - tm.rimRad * scale * 0.5);
    ctx.textAlign = 'right';
    ctx.fillText(`内リム ${fmt(ev.innerRimDiff)}`, cxCenter + tm.innerRimX * scale - 6, cyAxis - tm.rimRad * scale * 0.5);
  } else {
    ctx.textAlign = 'center';
    const topY = cyAxis - tm.tireRad * scale - 10;
    ctx.fillText(`外径差 ${fmt(ev.diaDiff)} (${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%)`, cxCenter + tm.centerX * scale, Math.max(36, topY));
    ctx.textAlign = 'left';
    ctx.fillText(`外リム ${fmt(ev.outerRimDiff)}`, cxCenter + tm.outerRimX * scale + 6, cyAxis - tm.rimRad * scale * 0.5);
    ctx.textAlign = 'right';
    ctx.fillText(`内リム ${fmt(ev.innerRimDiff)}`, cxCenter + tm.innerRimX * scale - 6, cyAxis - tm.rimRad * scale * 0.5);
  }
}

// --- Input Sync ---
function syncInputs() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (document.activeElement !== el) el.value = val;
  };

  setVal('b_width', state.base.width);
  setVal('b_aspect', state.base.aspect);
  setVal('b_inch', state.base.inch);
  setVal('b_j', state.base.j);
  setVal('b_et', state.base.et);
  setVal('b_in_margin', state.base.inMargin);
  setVal('b_out_margin', state.base.outMargin);

  document.getElementById('useMaxToggle').checked = state.useMax;
  document.getElementById('maxBox').hidden = !state.useMax;
  setVal('mx_width', state.max.width);
  setVal('mx_aspect', state.max.aspect);
  setVal('mx_inch', state.max.inch);
  setVal('mx_j', state.max.j);
  setVal('mx_et', state.max.et);

  setVal('t_width', state.target.width);
  setVal('t_aspect', state.target.aspect);
  setVal('t_inch', state.target.inch);
  setVal('t_j', state.target.j);
  setVal('t_et', state.target.et);
  setVal('t_spacer', state.target.spacer);

  renderEvidence();
}

const bindNum = (id, groupObj, key) => {
  const el = document.getElementById(id);
  el.addEventListener('input', (e) => {
    const raw = e.target.value.trim();
    if (raw === '' || raw === '-' || raw.endsWith('.')) return;
    const v = parseFloat(raw);
    if (isNaN(v)) return;
    groupObj[key] = v;
    syncInputs();
  });
  el.addEventListener('blur', () => syncInputs());
};

bindNum('b_width', state.base, 'width');
bindNum('b_aspect', state.base, 'aspect');
bindNum('b_inch', state.base, 'inch');
bindNum('b_j', state.base, 'j');
bindNum('b_et', state.base, 'et');
bindNum('b_in_margin', state.base, 'inMargin');
bindNum('b_out_margin', state.base, 'outMargin');

bindNum('mx_width', state.max, 'width');
bindNum('mx_aspect', state.max, 'aspect');
bindNum('mx_inch', state.max, 'inch');
bindNum('mx_j', state.max, 'j');
bindNum('mx_et', state.max, 'et');

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.mode = btn.dataset.mode;
    syncInputs();
  });
});

document.getElementById('useMaxToggle').addEventListener('change', (e) => {
  state.useMax = e.target.checked;
  syncInputs();
});

document.querySelectorAll('.margin-preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.base.inMargin = Number(btn.dataset.in);
    state.base.outMargin = Number(btn.dataset.out);
    syncInputs();
  });
});

bindNum('t_width', state.target, 'width');
bindNum('t_aspect', state.target, 'aspect');
bindNum('t_inch', state.target, 'inch');
bindNum('t_j', state.target, 'j');
bindNum('t_et', state.target, 'et');
bindNum('t_spacer', state.target, 'spacer');

// 極限対応表記揺れパーサー (全角/記号違い/順序違い/ET/80省略/XL/LI)
function parseSpecText(rawStr, targetObj) {
  let s = String(rawStr || '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[／]/g, '/')
    .replace(/[－―‐−]/g, '-')
    .replace(/(?<![\u30A0-\u30FF])ー/g, '-')
    .replace(/[×✕＊*]/g, 'X')
    .replace(/±/g, '+')
    .replace(/[,、]/g, ' ');

  // Remove PCD / bolt holes / PR noise
  s = s.replace(/PCD\s*[:=]?\s*\d{2,3}(?:\.\d+)?/g, ' ');
  s = s.replace(/\b(?:100|114\.3|112|120|139\.7)\s*[-/]\s*[456]\s*[H穴]\b/g, ' ');
  s = s.replace(/\b[456]\s*(?:H|HOLE|穴)\b/g, ' ');
  s = s.replace(/\b\d{1,2}\s*PR\b/g, ' ');

  let sizeParsed = false;
  const tireRe = /(?:^|[^\d.])(1[1-9][05]|[23]\d[05])\s*(?:\/|-|\s)\s*(\d{2})\s*(?:Z?R|RF|F|\/|-|\s)\s*(\d{2})\s*(?:C|LT)?(?=$|[^\d])/;
  const tm = s.match(tireRe);
  if (tm) {
    targetObj.width = Number(tm[1]);
    targetObj.aspect = Number(tm[2]);
    targetObj.inch = Number(tm[3]);
    sizeParsed = true;
    s = s.replace(tm[0], ' ');
  } else {
    const tm80 = s.match(/(?:^|[^\d.])(1[2-9][05]|2\d[05])\s*\/?\s*R\s*(\d{2})\s*(?:C|LT)?(?=$|[^\d])/);
    if (tm80) {
      targetObj.width = Number(tm80[1]);
      targetObj.aspect = 80;
      targetObj.inch = Number(tm80[2]);
      sizeParsed = true;
      s = s.replace(tm80[0], ' ');
    }
  }

  // XL / LI strings are consumed only to prevent offset misdetection
  s = s.replace(/\b(?:XL|EXTRA\s*LOAD|RFD|REINFORCED)\b|エクストラロード/g, ' ');
  s = s.replace(/(?:LI|ロードインデックス)\s*[:=]?\s*(69|[789]\d|1[01]\d)(?=$|[^\d])/g, ' ');
  s = s.replace(/\(?\b(69|[789]\d|1[01]\d)(?:\/\d{2,3})?\s*[HVWYZQRSTULMNPK]\b\)?/g, ' ');

  // Wheel Inch x J or J x Inch
  const setA = s.match(/(?:^|[^\d.])(1\d|2[0-4])\s*(?:インチ|INCH|IN|")?\s*X\s*(\d{1,2}(?:\.\d+)?)\s*(?:JJ?|B)?(?=$|[^\d])/);
  if (setA) {
    const jVal = Number(setA[2]);
    if (jVal >= 3.5 && jVal <= 14) {
      targetObj.inch = Number(setA[1]);
      targetObj.j = jVal;
      s = s.replace(setA[0], ' ');
    }
  }
  const setB = s.match(/(?:^|[^\d.])(\d{1,2}(?:\.\d+)?)\s*(?:JJ?|B)(?:\s*X\s*|-)(1\d|2[0-4])(?=$|[^\d])/);
  if (setB) {
    const jVal = Number(setB[1]);
    if (jVal >= 3.5 && jVal <= 14) {
      targetObj.j = jVal;
      targetObj.inch = Number(setB[2]);
      s = s.replace(setB[0], ' ');
    }
  }

  if (!sizeParsed) {
    const spaceWheel = s.match(/(?:^|[^\d.])(1\d|2[0-4])\s+(\d{1,2}(?:\.\d+)?)\s*(?:JJ?|B)(?=$|[^\d])/);
    if (spaceWheel) {
      const jVal = Number(spaceWheel[2]);
      if (jVal >= 3.5 && jVal <= 14) {
        targetObj.inch = Number(spaceWheel[1]);
        targetObj.j = jVal;
        s = s.replace(spaceWheel[0], ' ');
      }
    }
  }

  const jMatch = s.match(/(?:^|[^\d.])(\d{1,2}(?:\.\d+)?)\s*(?:JJ?|B)(?=$|[^\d])|(?:リム幅)\s*[:=]?\s*(\d{1,2}(?:\.\d+)?)/);
  if (jMatch) {
    const jVal = Number(jMatch[1] || jMatch[2]);
    if (jVal >= 3.5 && jVal <= 14) {
      targetObj.j = jVal;
      s = s.replace(jMatch[0], ' ');
    }
  }
  const inMatch = s.match(/(?:^|[^\d.])(1\d|2[0-4])\s*(?:インチ|INCH|IN|")/);
  if (inMatch) {
    targetObj.inch = Number(inMatch[1]);
    s = s.replace(inMatch[0], ' ');
  }

  const spMatch = s.match(/(?:スペーサー|SPACER)\s*[:=]?\s*(\d{1,2}(?:\.\d+)?)\s*(?:MM)?/);
  if (spMatch) {
    if ('spacer' in targetObj) targetObj.spacer = Number(spMatch[1]);
    s = s.replace(spMatch[0], ' ');
  }

  const etLabel = s.match(/(?:INSET|OFFSET|OFF|ET|インセット|オフセット|オフ)\s*[:=]?\s*([+-]?\s*\d{1,2}(?:\.\d+)?)/);
  if (etLabel) {
    targetObj.et = Number(etLabel[1].replace(/\s+/g, ''));
  } else {
    const etSign = s.match(/(?:^|\s)([+-]\d{1,2}(?:\.\d+)?)(?:\s*MM)?(?=\s|$)/);
    if (etSign) {
      targetObj.et = Number(etSign[1]);
    } else {
      const nums = s.match(/(?:^|\s)(-?\d{1,2}(?:\.\d+)?)(?=\s|$)/g);
      if (nums) {
        for (let i = nums.length - 1; i >= 0; i--) {
          const val = Number(nums[i].trim());
          if (val >= -50 && val <= 75) {
            targetObj.et = val;
            break;
          }
        }
      }
    }
  }
}

function bindQuickParse(inputId, btnId, obj) {
  const apply = () => {
    const str = document.getElementById(inputId).value.trim();
    if (!str) return;
    parseSpecText(str, obj);
    syncInputs();
  };
  document.getElementById(btnId).addEventListener('click', apply);
  document.getElementById(inputId).addEventListener('keydown', (e) => { if (e.key === 'Enter') apply(); });
}

bindQuickParse('baseQuick', 'baseQuickBtn', state.base);
bindQuickParse('maxQuick', 'maxQuickBtn', state.max);
bindQuickParse('targetQuick', 'targetQuickBtn', state.target);

document.getElementById('shareUrlBtn').addEventListener('click', async () => {
  const url = new URL(window.location.href);
  const b = state.base, t = state.target, mx = state.max;
  url.searchParams.set('m', state.mode);
  url.searchParams.set('b', `${b.width},${b.aspect},${b.inch},${b.j},${b.et},${b.inMargin},${b.outMargin}`);
  url.searchParams.set('t', `${t.width},${t.aspect},${t.inch},${t.j},${t.et},${t.spacer}`);
  url.searchParams.set('um', state.useMax ? '1' : '0');
  url.searchParams.set('mx', `${mx.width},${mx.aspect},${mx.inch},${mx.j},${mx.et}`);
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
  if (p.has('m')) {
    const mVal = p.get('m');
    if (mVal === 'both' || mVal === 'tire' || mVal === 'wheel') state.mode = mVal;
  }
  if (p.has('b')) {
    const a = p.get('b').split(',');
    if (a.length >= 5) {
      Object.assign(state.base, {
        width: Number(a[0]), aspect: Number(a[1]), inch: Number(a[2]),
        j: Number(a[3]), et: Number(a[4]),
        inMargin: a.length === 7 ? Number(a[5]) : (a[8] !== undefined ? Number(a[8]) : 10),
        outMargin: a.length === 7 ? Number(a[6]) : (a[9] !== undefined ? Number(a[9]) : 12)
      });
    }
  }
  if (p.has('um')) state.useMax = p.get('um') === '1';
  if (p.has('mx')) {
    const a = p.get('mx').split(',');
    if (a.length >= 5) Object.assign(state.max, {
      width: Number(a[0]), aspect: Number(a[1]), inch: Number(a[2]),
      j: Number(a[3]), et: Number(a[4])
    });
  }
  if (p.has('t')) {
    const a = p.get('t').split(',');
    if (a.length >= 6) Object.assign(state.target, {
      width: Number(a[0]), aspect: Number(a[1]), inch: Number(a[2]),
      j: Number(a[3]), et: Number(a[4]), spacer: Number(a[5])
    });
  }
}

if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(() => renderEvidence()).observe(document.querySelector('.canvas-wrap'));
}
window.addEventListener('resize', () => renderEvidence());

// --- PNG Evidence Sheet Exporter (1200x760) ---
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
  const { tm, bm, mode } = ev;

  const sheet = document.createElement('canvas');
  sheet.width = 1200;
  sheet.height = 760;
  const sc = sheet.getContext('2d');

  sc.fillStyle = '#ffffff';
  sc.fillRect(0, 0, 1200, 760);

  const statusMap = {
    ok: { bg: '#ecfdf5', bd: '#10b981', tx: '#065f46', tag: '適合・安全圏' },
    warn: { bg: '#fffbeb', bd: '#f59e0b', tx: '#92400e', tag: 'マッチング外・条件付きOK' },
    ng: { bg: '#fef2f2', bd: '#ef4444', tx: '#991b1b', tag: '装着不可 / 非推奨' }
  };
  const modeLabelMap = {
    both: 'タイヤ＋ホイール比較',
    tire: 'タイヤのみ比較',
    wheel: 'ホイールのみ比較'
  };
  const st = statusMap[ev.overall];
  sc.fillStyle = st.bg;
  sc.fillRect(24, 20, 1152, 78);
  sc.strokeStyle = st.bd;
  sc.lineWidth = 3;
  sc.strokeRect(24, 20, 1152, 78);

  sc.fillStyle = st.bd;
  sc.fillRect(40, 36, 195, 28);
  sc.fillStyle = '#ffffff';
  sc.font = 'bold 14px sans-serif';
  sc.textAlign = 'center';
  sc.fillText(st.tag, 137, 55);

  sc.textAlign = 'left';
  sc.fillStyle = st.tx;
  sc.font = 'bold 20px sans-serif';
  sc.fillText(`タイヤ・ホイール適合エビデンス診断シート [${modeLabelMap[mode] || modeLabelMap.both}]`, 250, 56);

  sc.fillStyle = '#475569';
  sc.font = '13px sans-serif';
  sc.fillText(`診断日時: ${new Date().toLocaleString('ja-JP')}`, 40, 84);

  sc.fillStyle = '#f8fafc';
  sc.fillRect(24, 112, 1152, 58);
  sc.strokeStyle = '#cbd5e1';
  sc.lineWidth = 1;
  sc.strokeRect(24, 112, 1152, 58);

  sc.fillStyle = '#1e293b';
  sc.font = 'bold 15px sans-serif';
  if (mode === 'tire') {
    sc.fillText(`① 最小基準: ${bm.width}/${bm.aspect}R${bm.inch} [自動LI STD:${ev.baseLoad.stdLi}/XL:${ev.baseLoad.xlLi}]` + (ev.mx ? `  |  最大枠: ${ev.mx.width}/${ev.mx.aspect}R${ev.mx.inch}` : ''), 40, 136);
    sc.fillStyle = '#1d4ed8';
    sc.fillText(`② 検討中  : ${tm.width}/${tm.aspect}R${tm.inch} [自動LI STD:${ev.tgtLoad.stdLi}/XL:${ev.tgtLoad.xlLi}]`, 40, 159);
  } else if (mode === 'wheel') {
    sc.fillText(`① 最小基準: ${bm.inch}×${bm.j.toFixed(1)}J ${bm.et >= 0 ? '+' : ''}${bm.et} [余裕 内${ev.inMargin}・外${ev.outMargin}mm]` + (ev.mx ? `  |  最大枠: ${ev.mx.inch}×${ev.mx.j.toFixed(1)}J +${ev.mx.et}` : ''), 40, 136);
    sc.fillStyle = '#1d4ed8';
    sc.fillText(`② 検討中  : ${tm.inch}×${tm.j.toFixed(1)}J ${tm.effEt >= 0 ? '+' : ''}${tm.effEt}` + (tm.spacer > 0 ? ` (スペーサー ${tm.spacer}mm含)` : ''), 40, 159);
  } else {
    sc.fillText(`① 最小基準: ${bm.width}/${bm.aspect}R${bm.inch} (${bm.j.toFixed(1)}J ${bm.et >= 0 ? '+' : ''}${bm.et}) [自動LI STD:${ev.baseLoad.stdLi}/XL:${ev.baseLoad.xlLi} / 余裕 内${ev.inMargin}・外${ev.outMargin}mm]` + (ev.mx ? `  |  最大枠: ${ev.mx.width}/${ev.mx.aspect}R${ev.mx.inch} (${ev.mx.j.toFixed(1)}J +${ev.mx.et})` : ''), 40, 136);
    sc.fillStyle = '#1d4ed8';
    sc.fillText(`② 検討中  : ${tm.width}/${tm.aspect}R${tm.inch} (${tm.j.toFixed(1)}J ${tm.effEt >= 0 ? '+' : ''}${tm.effEt}) [自動LI STD:${ev.tgtLoad.stdLi}/XL:${ev.tgtLoad.xlLi}]`, 40, 159);
  }

  sc.strokeStyle = '#cbd5e1';
  sc.strokeRect(24, 186, 560, 420);
  sc.drawImage(canvas, 26, 188, 556, 416);

  sc.fillStyle = '#f8fafc';
  sc.fillRect(24, 620, 560, 116);
  sc.strokeStyle = '#cbd5e1';
  sc.strokeRect(24, 620, 560, 116);
  sc.fillStyle = '#0f172a';
  sc.font = 'bold 13px sans-serif';
  sc.fillText('判定サマリー', 38, 642);
  sc.font = '12px sans-serif';
  sc.fillStyle = '#334155';
  const summaryText = [...ev.ngList, ...ev.warnList, ...ev.okList].slice(0, 2).join(' / ');
  wrapTextLines(sc, summaryText, 532).slice(0, 4).forEach((ln, idx) => {
    sc.fillText(ln, 38, 664 + idx * 18);
  });

  const diaCard = {
    title: `1. 外径・メーター検査 (${ev.diaText})`,
    level: ev.diaLevel,
    text: `現在 ${bm.tireDia.toFixed(0)}mm → 検討 ${tm.tireDia.toFixed(0)}mm (差 ${fmt(ev.diaDiff)} / ${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%) | メーター40km/h時実測 ${ev.actualSpeedAt40.toFixed(1)}km/h (車検30.9〜42.5) | 車高 ${fmt(ev.groundClearanceDiff)}`
  };
  const loadCard = {
    title: `2. 耐荷重・空気圧 (${ev.loadText})`,
    level: ev.loadLevel,
    text: `必要耐荷重 ${ev.reqKg}kg/本 → 検討 STD LI${ev.tgtLoad.stdLi}(${ev.tgtStdAt240}kg) / XL LI${ev.tgtLoad.xlLi}(最大${ev.tgtXlAt290}kg)` + (ev.loadLevel === 'warn' ? ` → XL+${ev.recommendedKpa}kPa昇圧でOK` : '')
  };
  const rimCard = mode === 'wheel'
    ? {
        title: `3. リム幅・推奨タイヤ幅 (${ev.rimText})`,
        level: ev.rimLevel,
        text: `基準 ${bm.j.toFixed(1)}J → 検討 ${tm.j.toFixed(1)}J (差 ${fmt((tm.j - bm.j) * INCH_MM)}) | 推奨組み合わせタイヤ幅 ${ev.tireRangeForRim.minW}〜${ev.tireRangeForRim.maxW}mm (標準 ${ev.tireRangeForRim.stdW}mm)`
      }
    : mode === 'tire'
      ? {
          title: `3. 適用リム幅レンジ (${ev.rimText})`,
          level: ev.rimLevel,
          text: `タイヤ幅 ${tm.width}mm JATMA適用 ${ev.rimRange.minJ.toFixed(1)}J〜${ev.rimRange.maxJ.toFixed(1)}J (標準 ${ev.rimRange.stdJ.toFixed(1)}J) | 純正タイヤ標準リム幅目安 ${ev.baseStdJ.toFixed(1)}J前後`
        }
      : {
          title: `3. リム幅 JATMA (${ev.rimText})`,
          level: ev.rimLevel,
          text: `タイヤ幅 ${tm.width}mm 適用レンジ ${ev.rimRange.minJ.toFixed(1)}J〜${ev.rimRange.maxJ.toFixed(1)}J に対し、検討ホイール ${tm.j.toFixed(1)}J`
        };
  const clearCard = mode === 'wheel'
    ? {
        title: `4. 基準比クリアランス (${ev.clearText})`,
        level: ev.clearLevel,
        text: `イン余裕${ev.inMargin}mm→残 ${fmt(ev.inRemain)} (内リム ${fmt(ev.innerRimDiff)} / 径R ${fmt(ev.rimRadDiff)}) | アウト余裕${ev.outMargin}mm→残 ${fmt(ev.outRemain)} (外リム ${fmt(ev.outerRimDiff)})`
      }
    : {
        title: `4. 基準比クリアランス (${ev.clearText})`,
        level: ev.clearLevel,
        text: `イン余裕${ev.inMargin}mm→残 ${fmt(ev.inRemain)} (内リム ${fmt(ev.innerRimDiff)} / 径R ${fmt(ev.rimRadDiff)}) | アウト余裕${ev.outMargin}mm→残 ${fmt(ev.outRemain)} (外リム ${fmt(ev.outerRimDiff)} / 外タイヤ ${fmt(ev.outerTireDiff)})`
      };

  const rightCards = mode === 'tire'
    ? [diaCard, loadCard, rimCard]
    : mode === 'wheel'
      ? [rimCard, clearCard]
      : [diaCard, loadCard, rimCard, clearCard];

  let ry = 186;
  rightCards.forEach(card => {
    const col = card.level === 'ng' ? '#ef4444' : card.level === 'warn' ? '#f59e0b' : '#10b981';
    sc.fillStyle = '#ffffff';
    sc.fillRect(602, ry, 574, 126);
    sc.strokeStyle = '#cbd5e1';
    sc.lineWidth = 1;
    sc.strokeRect(602, ry, 574, 126);
    sc.fillStyle = col;
    sc.fillRect(602, ry, 6, 126);

    sc.fillStyle = '#0f172a';
    sc.font = 'bold 14px sans-serif';
    sc.fillText(card.title, 618, ry + 26);

    sc.fillStyle = '#334155';
    sc.font = '12px sans-serif';
    wrapTextLines(sc, card.text, 544).slice(0, 4).forEach((ln, idx) => {
      sc.fillText(ln, 618, ry + 52 + idx * 20);
    });
    ry += 140;
  });

  sheet.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'tire'
      ? `fitment_tire_${tm.width}-${tm.aspect}R${tm.inch}.png`
      : mode === 'wheel'
        ? `fitment_wheel_${tm.inch}x${tm.j}J_ET${tm.effEt}.png`
        : `fitment_${tm.width}-${tm.aspect}R${tm.inch}_${tm.j}J_ET${tm.effEt}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

document.getElementById('saveSheetBtn').addEventListener('click', exportEvidenceSheetPng);

loadFromUrl();
syncInputs();
