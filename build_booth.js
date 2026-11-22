const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const pkgDir = path.join(distDir, 'booth_package');
const webDir = path.join(pkgDir, 'web');
const zipPath = path.join(distDir, 'tire_fitment_evidence_booth_v1.0.zip');

fs.rmSync(pkgDir, { recursive: true, force: true });
fs.mkdirSync(webDir, { recursive: true });

const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8');

// Web edition
fs.writeFileSync(path.join(webDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(webDir, 'style.css'), css, 'utf8');
fs.writeFileSync(path.join(webDir, 'app.js'), js, 'utf8');

// Single-file offline HTML edition (uses function replacers so $ patterns in JS/CSS are preserved verbatim)
const safeJs = js.replace(/<\/script>/gi, '<\\/script>');
let standaloneHtml = html.replace(
  /<link\s+rel="stylesheet"\s+href="style\.css[^"]*"\s*\/?>/i,
  () => `<style>\n${css}\n  </style>`
);
standaloneHtml = standaloneHtml.replace(
  /<script[^>]*src="app\.js[^"]*"[^>]*><\/script>/i,
  () => `<script>\n${safeJs}\n  </script>`
);

const standalonePath = path.join(pkgDir, 'タイヤホイール適合エビデンス診断_単体起動版.html');
fs.writeFileSync(standalonePath, standaloneHtml, 'utf8');

const readmeText = `================================================================
タイヤ・ホイール適合エビデンス診断ツール (v1.0) BOOTHパッケージ
================================================================

お買い上げ・ダウンロードいただきありがとうございます。
本ツールは、インターネット接続不要・アカウント登録不要で手元のPC・スマホ・タブレットの
ブラウザからすぐ使える「タイヤ・ホイール適合エビデンス診断ツール」です。

----------------------------------------------------------------
1. 起動方法（おすすめ: 単体起動版）
----------------------------------------------------------------
■ パターンA：ダブルクリックですぐ使う（単体起動版 / おすすめ）
  「タイヤホイール適合エビデンス診断_単体起動版.html」をダブルクリックし、
  Chrome / Edge / Safari 等のブラウザで開くだけでそのまま使えます。
  1ファイルに全機能が内蔵されているため、USBメモリや社用タブレットへの
  持ち運びにも便利です。

■ パターンB：分割Webファイル版を使う（web/ フォルダ）
  「web/index.html」「web/style.css」「web/app.js」の3ファイルを
  同じフォルダに置いたまま web/index.html を開くか、社内サーバー等に配置してご利用ください。

----------------------------------------------------------------
2. 3つの比較モード
----------------------------------------------------------------
画面上部の切替バーから、用途に合わせて3つの比較モードを選択できます。

  [1] タイヤ＋ホイール比較（フル比較）
      外径差・メーター誤差・ロードインデックス(STD/XL)・JATMA適用リム幅・
      イン側/アウト側クリアランス＆ブレーキ逃げまで一括診断します。

  [2] タイヤのみ比較
      ホイールを変えずに別サイズのタイヤを履かせる用途向け。
      外径・車検メーター誤差・自動算出ロードインデックス＆必要空気圧・
      適用リム幅レンジのみに絞ってすっきり判定します。

  [3] ホイールのみ比較
      純正タイヤの流用やホイール単体交換のフィッティング確認向け。
      インチ変化によるブレーキ干渉、イン側/アウト側のリム出面クリアランス、
      リム幅に対する推奨タイヤ幅目安を判定します。

----------------------------------------------------------------
3. 主な便利機能
----------------------------------------------------------------
・クイックテキスト一括反映（全角・記号ゆれ対応）
  「215/45ZR17 91W XL 17×7.5J ET45」「195-65-15 6J +45」などの
  ネット通販表記やカタログ文字列をそのまま貼り付けて「反映」を押すだけで、
  幅・扁平・インチ・J数・インセットへ自動分解入力されます。

・ロードインデックス(STD/XL)＆必要空気圧 自動計算
  タイヤサイズを入力するだけで、ISO 4000-1 / JATMA規格に基づく
  STD規格およびXL規格のロードインデックスを自動算出。
  サイズ変更時にXL指定＋昇圧（例: 290kPa）が必要かどうかも自動判定します。

・最小〜最大マッチング「挟み撃ち比較」
  純正の上位グレードサイズ（最大枠）を追加チェックすることで、
  新車純正の許容レンジ内に収まっているかを比較できます。

・診断画像(PNG)ワンクリック保存＆URL共有
  上部の「診断画像(PNG)保存」ボタンから、2D断面図と4項目判定カードを
  まとめた1200×760の診断シートPNG画像を保存できます（接客・見積添付用）。

----------------------------------------------------------------
4. 注意事項・免責事項
----------------------------------------------------------------
・本ツールの外径・リム幅・ロードインデックス・クリアランス計算は、
  JATMA/ETRTO一般規格および幾何学モデルに基づく目安算出です。
・実際の車両への装着可否は、タイヤメーカー・銘柄ごとの実断面幅（肩張り形状）、
  車両の個体差、ローダウン量、アライメント、ブレーキキャリパー形状等により
  異なります。最終的な装着・車検適合判断は実車確認のうえ自己責任にて行ってください。
・本パッケージの再配布・無断転売・ソースコードのそのままの再販売は禁止します。
  購入者様ご本人・自店舗業務内でのご利用はご自由にお使いいただけます。
================================================================
`;
fs.writeFileSync(path.join(pkgDir, 'README_説明書・利用規約.txt'), readmeText, 'utf8');

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
execFileSync('python3', [
  '-c',
  `
import os, zipfile, sys
pkg_dir, zip_path = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, _, files in os.walk(pkg_dir):
        for fn in sorted(files):
            full = os.path.join(root, fn)
            rel = os.path.relpath(full, pkg_dir)
            zf.write(full, rel)
`,
  pkgDir,
  zipPath
]);

console.log('Built standalone HTML:', standalonePath, fs.statSync(standalonePath).size, 'bytes');
console.log('Built BOOTH zip:', zipPath, fs.statSync(zipPath).size, 'bytes');
