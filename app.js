const INCH_MM = 25.4;

// JATMA / ETRTO 近似耐荷重テーブル (kg) [180, 190, 200, 210, 220, 230, 240, 250(XL), 260(XL), 270(XL), 280(XL), 290(XL)]
// 基準: STD最大圧240kPa、XL最大圧290kPa
const KPA_STEPS = [180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290];

// 最大耐荷重テーブル (LI 69..106 -> kg @ 240kPa STD / 290kPa XL)
const LI_MAX_KG = {
  69: 325, 70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387, 76: 400,
  77: 412, 78: 425, 79: 437, 80: 450, 81: 462, 82: 475, 83: 487, 84: 500,
  85: 515, 86: 530, 87: 545, 88: 560, 89: 580, 90: 600, 91: 615, 92: 630,
  93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775, 100: 800,
  101: 825, 102: 850, 103: 875, 104: 900, 105: 925, 106: 950
};

// 代表的標準LIマップ (タイヤサイズ文字列 -> [LI, XL])
const COMMON_LI_MAP = {
  '145/80R12': [74, false], '145/80R13': [75, false], '155/65R13': [73, false],
  '155/65R14': [75, false], '155/70R13': [75, false], '165/55R14': [72, false],
  '165/55R15': [75, false], '165/60R15': [77, false], '165/65R14': [79, false],
  '165/70R14': [81, false], '175/65R14': [82, false], '175/65R15': [84, false],
  '175/70R14': [84, false], '185/55R15': [82, false], '185/55R16': [83, false],
  '185/60R15': [84, false], '185/65R15': [88, false], '195/50R16': [84, false],
  '195/55R16': [87, false], '195/60R16': [89, false], '195/65R15': [91, false],
  '205/45R17': [88, true],  '205/50R17': [93, true],  '205/55R16': [91, false],
  '205/60R16': [92, false], '205/65R16': [95, false], '215/45R17': [91, true],
  '215/45R18': [93, true],  '215/50R17': [91, false], '215/55R17': [94, false],
  '215/60R16': [95, false], '215/60R17': [96, false], '225/40R18': [92, true],
  '225/45R17': [94, true],  '225/45R18': [95, true],  '225/50R17': [98, true],
  '225/55R17': [97, false], '225/60R17': [99, false], '225/65R17': [102, false],
  '235/40R18': [95, true],  '235/45R18': [98, true],  '235/50R18': [97, false],
  '245/40R18': [97, true],  '245/40R19': [98, true]
};

// 流通量が多く安価になりやすい定番サイズ（代替提案プール）
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

const MAKER_NOTES = {
  generic: 'ハブ径（中心穴径）が純正より小さいホイールは物理的に装着不可。純正ナットが平座（トヨタ等）や球面（ホンダ等）の場合、社外ホイールには60°テーパーナットが別途必要です。',
  toyota: '【トヨタ/レクサス】多くがハブ径54mmまたは60mm（一部商用等除く）。純正アルミは「ストレート平座ナット」が多いため、社外アルミへ変更時は「60°テーパーナット」への買い替えが必須になるケースが大半です。',
  honda: '【ホンダ】ハブ径は56mm（一部大型64mm）。純正ホイールは「12R球面ナット」のため、社外ホイール（60°テーパー）へ組む場合はナットも必ずセット交換が必要です（球面ナットのまま締めるのは緩み・破損の原因）。',
  nissan: '【日産】ハブ径66mmが多く、他メーカー（トヨタ54/60mm、ホンダ56/64mm）の純正ホイールはハブ穴が小さくて物理的に入らないことが多いため要確認。ナットは多くが60°テーパー（M12×P1.25）。',
  mazda: '【マツダ】普通車はハブ径67mm（一部54mm）、ナットはM12×P1.5 60°テーパー。他社純正ホイール流用時はハブ干渉に注意。',
  subaru: '【スバル】ハブ径56mm、PCD100-5Hと114.3-5Hが車種・年式で混在。ナットはM12×P1.25 60°テーパー。AWD車は4輪の外径差があるとデフ負荷になるため前後同外径必須。',
  kei_suzuki_daihatsu: '【軽: スズキ/ダイハツ】ハブ径54mm、PCD100-4H、60°テーパーナット。日産/三菱(56mm)純正は入りますが、ホンダ(56mm)は球面ナット注意。ブレーキ径は13〜14インチ基準。',
  kei_mitsubishi_nissan: '【軽: 三菱/日産】ハブ径56mm、PCD100-4H、60°テーパー（一部純正平座あり）。スズキ/ダイハツ純正ホイール（ハブ径54mm）はハブが引っかかり装着できないので流用不可です。'
};

const PRESETS = {
  kei_dayz: {
    maker: 'kei_mitsubishi_nissan',
    min: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, kpa: 240, li: 75, xl: false },
    max: { width: 165, aspect: 55, inch: 15, j: 4.5, et: 45, margin: 10 },
    target: { width: 155, aspect: 65, inch: 14, j: 4.5, et: 45, spacer: 0, li: 75, xl: false }
  },
  compact_fit: {
    maker: 'honda',
    min: { width: 175, aspect: 65, inch: 15, j: 5.5, et: 50, kpa: 220, li: 84, xl: false },
    max: { width: 185, aspect: 55, inch: 16, j: 6.0, et: 50, margin: 12 },
    target: { width: 185, aspect: 60, inch: 15, j: 5.5, et: 45, spacer: 0, li: 84, xl: false }
  },
  prius_50: {
    maker: 'toyota',
    min: { width: 195, aspect: 65, inch: 15, j: 6.5, et: 40, kpa: 250, li: 91, xl: false },
    max: { width: 215, aspect: 45, inch: 17, j: 7.0, et: 50, margin: 12 },
    target: { width: 205, aspect: 55, inch: 16, j: 6.5, et: 45, spacer: 0, li: 91, xl: false }
  },
  minivan_noah: {
    maker: 'toyota',
    min: { width: 195, aspect: 65, inch: 15, j: 6.0, et: 50, kpa: 240, li: 91, xl: false },
    max: { width: 205, aspect: 55, inch: 17, j: 6.0, et: 50, margin: 12 },
    target: { width: 205, aspect: 60, inch: 16, j: 6.5, et: 48, spacer: 0, li: 92, xl: false }
  },
  civic_fc1: {
    maker: 'honda',
    min: { width: 215, aspect: 55, inch: 16, j: 7.0, et: 45, kpa: 230, li: 93, xl: false },
    max: { width: 235, aspect: 40, inch: 18, j: 8.0, et: 50, margin: 12 },
    target: { width: 215, aspect: 45, inch: 17, j: 7.5, et: 42, spacer: 0, li: 91, xl: true }
  },
  '86_brz': {
    maker: 'subaru',
    min: { width: 205, aspect: 55, inch: 16, j: 6.5, et: 48, kpa: 240, li: 91, xl: false },
    max: { width: 215, aspect: 45, inch: 17, j: 7.5, et: 48, margin: 15 },
    target: { width: 225, aspect: 40, inch: 18, j: 8.0, et: 40, spacer: 0, li: 92, xl: true }
  }
};

const state = {
  maker: 'toyota',
  target: { width: 205, aspect: 55, inch: 16, j: 6.5, et: 45, spacer: 0, li: 91, xl: false },
  min: { width: 195, aspect: 65, inch: 15, j: 6.5, et: 40, kpa: 240, li: 91, xl: false },
  max: { width: 215, aspect: 45, inch: 17, j: 7.0, et: 50, margin: 12 }
};

function estimateLI(width, aspect, inch) {
  const key = `${width}/${aspect}R${inch}`;
  if (COMMON_LI_MAP[key]) return { li: COMMON_LI_MAP[key][0], xl: COMMON_LI_MAP[key][1] };
  // Fallback heuristic based on air volume
  const est = Math.round(52 + (width - 135) * 0.14 + (inch - 12) * 2.2 + (aspect - 40) * 0.12);
  const li = Math.max(69, Math.min(106, est));
  return { li, xl: aspect <= 45 };
}

// 空気圧に応じた耐荷重計算 (JATMA/ETRTO近似式)
function calcLoadCapacityAtKpa(li, isXl, kpa) {
  const maxKg = LI_MAX_KG[Math.max(69, Math.min(106, Math.round(li)))] || 500;
  const maxKpa = isXl ? 290 : 240;
  const effKpa = Math.min(kpa, maxKpa);
  // JATMA負荷能力曲線近似: ratio = ((kPa - 100) / (maxKpa - 100)) ^ 0.56
  const ratio = Math.pow(Math.max(0.3, (effKpa - 80) / (maxKpa - 80)), 0.55);
  return Math.round(maxKg * ratio);
}

// JATMA適用リム幅レンジ近似
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

function evaluateEvidence() {
  const tm = calcMetrics(state.target, state.target.spacer);
  const mn = calcMetrics(state.min, 0);
  const mx = calcMetrics(state.max, 0);

  const ngList = [];
  const warnList = [];
  const okList = [];

  // 1. 外径・メーター誤差・最低地上高 (vs 純正基準 min)
  const diaDiff = tm.tireDia - mn.tireDia;
  const diaPct = (diaDiff / mn.tireDia) * 100;
  const actualSpeedAt40 = 40 * (tm.tireDia / mn.tireDia); // メーター40km/h時の実速度
  const groundClearanceDiff = diaDiff / 2;
  const maxDiaDiff = tm.tireDia - mx.tireDia;

  let diaLevel = 'ok';
  let diaText = '適正圏';
  // 平成19年以降保安基準: メーター40km/hに対し実速度 30.9〜42.55 km/h
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

  // 2. ロードインデックス (耐荷重) & 空気圧補正
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
    // 必要な空気圧を探索
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

  // 3. タイヤ幅 × ホイールJ数 (JATMA適用リム幅)
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

  // 4. ブレーキ内側・フェンダー外側クリアランス
  const rimRadDiff = tm.rimRad - mn.rimRad;
  const innerRimDiff = tm.innerRimX - mn.innerRimX; // 負 = さらに内側へ入る
  const innerTireDiff = tm.innerTireX - mn.innerTireX;
  const outerRimDiff = tm.outerRimX - mx.outerRimX; // 正 = 最大純正より外へ出る
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

  // 総合判定
  let overall = 'ok';
  if (ngList.length > 0) overall = 'ng';
  else if (warnList.length > 0 || Math.abs(diaDiff) > 2 || tm.inch !== mn.inch || tm.width !== mn.width) overall = 'warn';

  // もし完全に純正同等なら ok
  if (ngList.length === 0 && warnList.length === 0 && Math.abs(diaPct) <= 1.5) {
    overall = 'ok';
  }

  return {
    tm, mn, mx,
    overall, ngList, warnList, okList,
    diaDiff, diaPct, actualSpeedAt40, groundClearanceDiff, diaLevel, diaText,
    reqKg, tgtKgSameKpa, tgtMaxKpa, tgtMaxKg, recommendedKpa, loadLevel, loadText,
    rimRange, rimLevel, rimText,
    rimRadDiff, innerRimDiff, innerTireDiff, outerRimDiff, outerTireDiff, fenderMargin, clearLevel, clearText
  };
}

function renderEvidence() {
  const ev = evaluateEvidence();
  const { tm, mn, mx } = ev;

  // Summaries
  document.getElementById('targetSummary').textContent =
    `${tm.width}/${tm.aspect}R${tm.inch} | ${tm.j.toFixed(1)}J ${tm.effEt >= 0 ? '+' : ''}${tm.effEt}`;
  document.getElementById('minSummary').textContent =
    `${mn.width}/${mn.aspect}R${mn.inch} | ${mn.j.toFixed(1)}J ${mn.et >= 0 ? '+' : ''}${mn.et}`;
  document.getElementById('maxSummary').textContent =
    `${mx.width}/${mx.aspect}R${mx.inch} | ${mx.j.toFixed(1)}J ${mx.et >= 0 ? '+' : ''}${mx.et}`;

  // ① 総合判定バナー & 接客トーク
  const banner = document.getElementById('verdictBanner');
  const badge = document.getElementById('verdictBadge');
  const title = document.getElementById('verdictTitle');
  const talk = document.getElementById('verdictTalk');
  const reasons = document.getElementById('verdictReasons');

  banner.className = `verdict-banner status-${ev.overall}`;
  if (ev.overall === 'ng') {
    badge.textContent = '装着不可 / 非推奨';
    title.textContent = '根拠データ上、装着リスクが高いためおすすめできません';
    talk.textContent = `💬 接客トーク例: 「ご希望のサイズは安くて魅力的ですが、お車の純正基準と比べると【${ev.ngList[0].match(/【(.*?)】/)?.[1] || '安全基準'}】の数値を超えてしまうため、車検不適合や干渉・バーストの危険があります。すぐ下に安全に安く代用できる定番サイズを出しています！」`;
  } else if (ev.overall === 'warn') {
    badge.textContent = 'マッチング外・条件付きOK';
    title.textContent = 'カタログ標準外ですが、数値上は比較的安全に装着できる圏内です';
    talk.textContent = `💬 接客トーク例: 「適合表には載っていませんが、外径差(${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%)・耐荷重・出面を計算上クリアしています。下の条件（空気圧 ${ev.recommendedKpa}kPa 等）を守れば比較的安心して履けるサイズです。」`;
  } else {
    badge.textContent = '適合・安全圏';
    title.textContent = '純正基準と同等レンジで問題なく装着できます';
    talk.textContent = `💬 接客トーク例: 「外径・リム幅・耐荷重・クリアランスすべて純正基準の範囲内に綺麗に収まっていますので、安心してこのままお選びいただけます。」`;
  }

  const allReasons = [...ev.ngList, ...ev.warnList, ...ev.okList];
  reasons.innerHTML = allReasons.map(r => `<li>${r}</li>`).join('');

  // ② 外径・メーターカード & ゲージ
  setCard('evDiameter', 'pillDiameter', ev.diaLevel, ev.diaText);
  document.getElementById('bodyDiameter').innerHTML =
    `純正外径 <strong>${mn.tireDia.toFixed(0)}mm</strong> → 検討 <strong>${tm.tireDia.toFixed(0)}mm</strong> (差 <strong>${fmt(ev.diaDiff)}</strong> / <strong>${ev.diaPct >= 0 ? '+' : ''}${ev.diaPct.toFixed(1)}%</strong>)<br>` +
    `メーター40km/h時の実速度: <strong>${ev.actualSpeedAt40.toFixed(1)} km/h</strong> (保安基準 30.9〜42.5km/h) / 車高変化: <strong>${fmt(ev.groundClearanceDiff)}</strong>`;

  // Gauge (-6% .. +6% mapped to 0%..100%)
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

  // ③ 耐荷重カード
  setCard('evLoad', 'pillLoad', ev.loadLevel, ev.loadText);
  document.getElementById('bodyLoad').innerHTML =
    `純正必要耐荷重 (${state.min.kpa}kPa時): <strong>${ev.reqKg}kg/本</strong> (LI ${state.min.li}${state.min.xl ? ' XL' : ''})<br>` +
    `検討タイヤ (LI ${state.target.li}${state.target.xl ? ' XL' : ''}): 同圧時 <strong>${ev.tgtKgSameKpa}kg</strong> / 最大圧(${ev.tgtMaxKpa}kPa)時 <strong>${ev.tgtMaxKg}kg</strong>` +
    (ev.loadLevel === 'warn' ? `<br>→ <strong>${ev.recommendedKpa}kPa 充填で純正同等耐荷重をクリア</strong>` : '');

  // ④ リム幅カード
  setCard('evRim', 'pillRim', ev.rimLevel, ev.rimText);
  document.getElementById('bodyRim').innerHTML =
    `タイヤ幅 <strong>${tm.width}mm</strong> のJATMA適用レンジ: <strong>${ev.rimRange.minJ.toFixed(1)}J 〜 ${ev.rimRange.maxJ.toFixed(1)}J</strong> (標準 ${ev.rimRange.stdJ.toFixed(1)}J)<br>` +
    `検討ホイール: <strong>${tm.j.toFixed(1)}J</strong> (${tm.j < ev.rimRange.minJ ? 'やや幅狭/ムッチリ寄り' : tm.j > ev.rimRange.maxJ ? 'やや幅広/引っ張り寄り' : '標準適合レンジ内'})`;

  // ⑤ クリアランスカード
  setCard('evClearance', 'pillClearance', ev.clearLevel, ev.clearText);
  document.getElementById('bodyClearance').innerHTML =
    `【外側 vs 純正最大】外リム <strong>${fmt(ev.outerRimDiff)}</strong> / 外タイヤ <strong>${fmt(ev.outerTireDiff)}</strong> (設定余裕 +${ev.fenderMargin}mm)<br>` +
    `【内側 vs 純正最小】リム径R <strong>${fmt(ev.rimRadDiff)}</strong> / 内リム <strong>${fmt(ev.innerRimDiff)}</strong> / 内タイヤ <strong>${fmt(ev.innerTireDiff)}</strong>`;

  // ⑥ 物理注意点
  document.getElementById('bodyPhysical').textContent = MAKER_NOTES[state.maker] || MAKER_NOTES.generic;

  // ⑦ 代替安価サイズ提案
  renderAlternatives(mn, tm);

  // Canvas図解
  drawEvidenceCanvas(ev);
}

function setCard(cardId, pillId, level, text) {
  document.getElementById(cardId).className = `ev-card ${level}`;
  const pill = document.getElementById(pillId);
  pill.className = `ev-pill ${level}`;
  pill.textContent = text;
}

function renderAlternatives(mn, tm) {
  const candidates = POPULAR_BUDGET_SIZES.map(sz => {
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
    btn.addEventListener('click', () => {
      const c = candidates[Number(btn.dataset.altIdx)];
      state.target.width = c.width;
      state.target.aspect = c.aspect;
      state.target.inch = c.inch;
      const liEst = estimateLI(c.width, c.aspect, c.inch);
      state.target.li = liEst.li;
      state.target.xl = liEst.xl;
      syncInputs();
    });
  });
}

// --- 2D Evidence Canvas (Upper Half Cross-Section with Dimension Arrows) ---
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

  // Grid (50mm)
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

  // Hub Face Line (X = 0)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(cxCenter, 24);
  ctx.lineTo(cxCenter, cyAxis);
  ctx.stroke();
  ctx.setLineDash([]);

  // Axle Base Line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(16, cyAxis);
  ctx.lineTo(w - 16, cyAxis);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#475569';
  ctx.font = '600 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('← 車体側 (ブレーキ/サス)', 12, 18);
  ctx.textAlign = 'right';
  ctx.fillText('フェンダー側 (外側) →', w - 12, 18);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('ハブ面 (0mm)', cxCenter, h - 10);

  // Brake Rotor + Caliper Silhouette (-X)
  ctx.fillStyle = 'rgba(148, 163, 184, 0.30)';
  ctx.fillRect(cxCenter - 32 * scale, cyAxis - 145 * scale, 22 * scale, 145 * scale);
  ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
  ctx.fillRect(cxCenter - 42 * scale, cyAxis - 150 * scale, 34 * scale, 52 * scale);

  // Max Fender Limit Vertical Line (+X)
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

    // Rim
    const xIn = m.innerRimX * scale;
    const xOut = m.outerRimX * scale;
    const rIn = m.barrelInnerRad * scale;
    const rOut = m.rimRad * scale;
    ctx.beginPath();
    ctx.rect(xIn, -rOut, xOut - xIn, rOut - rIn);
    if (!dashed) ctx.fill();
    ctx.stroke();

    // Tire
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

  // Draw Base (Dashed gray) and Target (Colored solid)
  drawWheelTireProfile(mn, '#64748b', 'transparent', true, 1.8);
  const tgtColor = ev.overall === 'ng' ? '#dc2626' : ev.overall === 'warn' ? '#d97706' : '#1d4ed8';
  const tgtFill = ev.overall === 'ng' ? 'rgba(220,38,38,0.14)' : ev.overall === 'warn' ? 'rgba(217,119,6,0.14)' : 'rgba(29,78,216,0.14)';
  drawWheelTireProfile(tm, tgtColor, tgtFill, false, 2.6);

  // Dimension Callouts directly on diagram
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

// --- Input Sync & URL ---
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

document.getElementById('t_xl').addEventListener('change', (e) => { state.target.xl = e.target.checked; renderEvidence(); });
document.getElementById('mn_xl').addEventListener('change', (e) => { state.min.xl = e.target.checked; renderEvidence(); });
document.getElementById('makerSelect').addEventListener('change', (e) => { state.maker = e.target.value; renderEvidence(); });

function bindQuickParse(inputId, btnId, obj, hasLi) {
  const apply = () => {
    const str = document.getElementById(inputId).value.trim();
    if (!str) return;
    const tm = str.match(/(\d{3})\s*\/\s*(\d{2})\s*[Rr]\s*(\d{2})/);
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
  };
  document.getElementById(btnId).addEventListener('click', apply);
  document.getElementById(inputId).addEventListener('keydown', (e) => { if (e.key === 'Enter') apply(); });
}

bindQuickParse('targetQuick', 'targetQuickBtn', state.target, true);
bindQuickParse('minQuick', 'minQuickBtn', state.min, true);
bindQuickParse('maxQuick', 'maxQuickBtn', state.max, false);

document.getElementById('presetSelect').addEventListener('change', (e) => {
  const p = PRESETS[e.target.value];
  if (!p) return;
  state.maker = p.maker;
  Object.assign(state.min, p.min);
  Object.assign(state.max, p.max);
  Object.assign(state.target, p.target);
  syncInputs();
});

document.getElementById('shareUrlBtn').addEventListener('click', async () => {
  const url = new URL(window.location.href);
  const t = state.target, mn = state.min, mx = state.max;
  url.searchParams.set('t', `${t.width},${t.aspect},${t.inch},${t.j},${t.et},${t.spacer},${t.li},${t.xl ? 1 : 0}`);
  url.searchParams.set('mn', `${mn.width},${mn.aspect},${mn.inch},${mn.j},${mn.et},${mn.kpa},${mn.li},${mn.xl ? 1 : 0}`);
  url.searchParams.set('mx', `${mx.width},${mx.aspect},${mx.inch},${mx.j},${mx.et},${mx.margin}`);
  url.searchParams.set('mk', state.maker);
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
  if (p.has('mk') && MAKER_NOTES[p.get('mk')]) state.maker = p.get('mk');
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

loadFromUrl();
syncInputs();
