# QuakeWatch JP - リアルタイム地震モニター

日本国内の地震情報をリアルタイムで可視化するWebアプリケーション。

P2P地震情報APIから取得した最新の地震データを、Mapbox GLによるインタラクティブな3Dマップ上にプロットし、サイドバーに一覧表示します。

## 主な機能

- **リアルタイム地震情報表示** - P2P地震情報APIから60秒間隔で最新10件を自動取得
- **3Dマップ可視化** - Mapbox GL JSによるダークテーマの日本地図上にマーカー表示
- **震度別カラーコーディング** - 震度7: 赤 / 震度6: オレンジ / 震度5: ダークオレンジ / 震度4: ゴールド / その他: シアン
- **マグニチュード連動マーカーサイズ** - マグニチュードに比例したマーカーサイズ
- **モバイル対応** - スマホではマップをフルスクリーン表示し、地震リストをボトムシートで表示（iPhoneのセーフエリア対応済み）
- **エラーハンドリング** - 取得失敗時のエラー表示・再試行ボタン、ポーリング失敗時は前回データを保持して警告表示

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 19 |
| 言語 | TypeScript（strict mode） |
| ビルドツール | Vite 7 |
| 地図 | Mapbox GL JS 3 |
| スタイリング | Tailwind CSS |
| テスト | Vitest + Testing Library |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、Mapboxのアクセストークンを設定します。

```
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

トークンは [Mapbox](https://account.mapbox.com/) で無料アカウントを作成して取得できます。

### 3. 開発サーバー起動

```bash
npm run dev
```

## コマンド一覧

```bash
npm run dev            # 開発サーバー起動
npm run build          # TypeScriptチェック + プロダクションビルド
npm run preview        # ビルド結果のプレビュー
npm test               # テスト実行（1回実行）
npm run test:watch     # テスト実行（ウォッチモード）
npm run test:coverage  # カバレッジレポート生成
```

## デプロイ

`main` ブランチへのプッシュで GitHub Actions により GitHub Pages へ自動デプロイされます（`.github/workflows/deploy.yml`）。
リポジトリのSecretsに `VITE_MAPBOX_TOKEN` の登録が必要です。

## データソース

地震情報は [P2P地震情報 API](https://www.p2pquake.net/develop/json_api_v2/) を利用しています。

> 本アプリは情報提供を目的としたものであり、防災利用の際は気象庁等の公式情報を必ず確認してください。
