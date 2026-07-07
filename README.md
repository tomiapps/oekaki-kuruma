# おえかきくるま LP

子供向けアプリ「おえかきくるま」(`../ekaki_densha`) の宣伝用ランディングページ。

## 構成

```
index.html        ページ本体
css/style.css     スタイル(アプリのテーマカラーを踏襲)
js/main.js        ヒーローのカウンター & お絵描きミニデモ
assets/favicon.svg
```

静的サイトなので `index.html` をブラウザで開くだけで確認できます。
ビルド不要。GitHub Pages / Netlify / Cloudflare Pages などにフォルダごと置けば公開できます。

## デザインの出典(アプリ本体との対応)

- テーマカラー: オレンジ `#EF6C00` / `#E65100`(`lib/main.dart` の colorSchemeSeed)
- 空のグラデ: `#4FC3F7 → #B3E5FC → #E1F5FE`(`lib/game_screen.dart`)
- 芝生 `#66BB6A`・土 `#8D6E63`、金 `#FFD740`(祝福演出)
- お絵描きデモの8色パレット: `lib/pen.dart` の基本8色と同一

## 公開前に差し替え・追記するもの

- [ ] ストアバッジ: 公開後に本物の Google Play / App Store バッジ画像とリンクへ差し替え
      (現在は「近日公開」「準備中」のダミー表示)
- [ ] OGP画像 (`og:image`): 実機スクリーンショットか宣伝画像を用意して meta タグに追加
- [ ] プライバシーポリシーページへのリンク(ストア公開に必須)
- [ ] 実機スクリーンショット: ヒーローのCSSモックアップを本物のスクショに差し替えても良い
- [ ] Webフォント(M PLUS Rounded 1c)を Google Fonts から読み込み中。
      オフライン配布する場合はセルフホストに変更
