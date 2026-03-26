# QuakeWatch JP 🛰️🚨

日本国内の地震情報をリアルタイムで監視・可視化するWebサイト。

## ✨ 現在の機能
- **リアルタイム同期**: P2P地震情報 API から最新の地震報を取得。
- **ダイナミック・マップ**: Mapbox GL JS を使用し、震源地をアニメーション表示。
- **インテリジェンス・サイドバー**: 最新10件の地震をリスト化し、震度を直感的に色分け。
- **サイバーパンクUI**: Slate-950を基調とした、緊急性の高いダークモードデザイン。

## 🚀 セットアップ
1. `.env` ファイルに `VITE_MAPBOX_TOKEN` を設定。
2. `npm install`
3. `npm run dev`

## 🛠 デバッグ状況
- 画面が真っ白になる問題を調査中。
- `App.tsx` に `DEBUG: APP LOADED` という赤いラベルを追加し、Reactのレンダリングを確認可能にしました。

---
**Status**: Debugging (Blank screen investigation)
