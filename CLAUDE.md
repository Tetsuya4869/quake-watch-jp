# QuakeWatch JP - リアルタイム地震モニター

日本国内の地震情報をリアルタイムで可視化するWebアプリケーション。

---

## プロジェクト概要

P2P地震情報APIから取得した最新の地震データを、Mapbox GLによるインタラクティブな3Dマップ上にプロットし、サイドバーに一覧表示するシングルページアプリケーション。

### 主な機能

- **リアルタイム地震情報表示** - P2P Quake APIから60秒間隔で最新10件を自動取得
- **3Dマップ可視化** - Mapbox GL JSによるダークテーマの日本地図上にマーカー表示
- **震度別カラーコーディング** - 震度に応じたマーカーの色分け（震度7: 赤, 震度6: オレンジ, 震度5: ダークオレンジ, 震度4: ゴールド, その他: シアン）
- **マグニチュード連動マーカーサイズ** - マグニチュードに比例したマーカーサイズ

---

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | React | 19.x |
| 言語 | TypeScript | ~5.9 |
| ビルドツール | Vite | 7.x |
| 地図 | Mapbox GL JS | 3.x |
| スタイリング | Tailwind CSS | (CDN/PostCSS) |
| アイコン | Lucide React | 0.563.x |
| 日付処理 | date-fns | 4.x |

---

## プロジェクト構造

```
quake-watch-jp/
├── index.html                    # エントリHTML（lang="ja"）
├── package.json                  # 依存関係・スクリプト定義
├── vite.config.ts                # Vite設定
├── tsconfig.json                 # TypeScript設定
├── tsconfig.node.json            # Node用TypeScript設定
├── .env                          # 環境変数（VITE_MAPBOX_TOKEN）
├── .gitignore
├── public/
│   └── vite.svg                  # Viteロゴ
└── src/
    ├── main.tsx                  # Reactエントリポイント
    ├── App.tsx                   # メインアプリコンポーネント
    ├── index.css                 # グローバルスタイル（Tailwind + カスタムCSS）
    └── components/
        └── EarthquakeMap.tsx     # Mapbox地図コンポーネント
```

---

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# TypeScriptチェック + プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## 外部API

### P2P地震情報 API

- **エンドポイント**: `https://api.p2pquake.net/v2/history?codes=551&limit=10`
- **用途**: 地震情報（震源地、マグニチュード、最大震度、緯度経度）の取得
- **更新間隔**: 60秒
- **コード551**: 地震情報を示すフィルタコード

### Mapbox GL

- **アクセストークン**: `.env`ファイルの`VITE_MAPBOX_TOKEN`で管理
- **スタイル**: `mapbox://styles/mapbox/dark-v11`
- **初期ビュー**: 日本中心（137.7278, 38.3606）、ズーム4.5、ピッチ45度

---

## アーキテクチャ

### データフロー

```
P2P Quake API → App.tsx (fetch + state管理) → EarthquakeMap.tsx (マーカー描画)
                                              → サイドバー (リスト表示)
```

### コンポーネント構成

- **`App.tsx`** - データ取得・状態管理・レイアウト（サイドバー + マップ）
  - `Quake`インターフェース定義
  - `fetchQuakes()` - API呼び出し・データ整形
  - `formatIntensity()` - 震度コード→表示文字列変換（10→1, 20→2, ..., 70→7）
- **`EarthquakeMap.tsx`** - Mapbox GL地図の初期化・マーカー管理
  - `getIntensityColor()` - 震度→色変換

### 震度マッピング

| APIコード | 表示 |
|----------|------|
| 10 | 1 |
| 20 | 2 |
| 30 | 3 |
| 40 | 4 |
| 45 | 5弱 |
| 50 | 5強 |
| 55 | 6弱 |
| 60 | 6強 |
| 70 | 7 |

---

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `VITE_MAPBOX_TOKEN` | Mapbox GLのアクセストークン |

---

## コーディング規約

- **言語**: TypeScript（strict mode有効）
- **UIテキスト**: 日本語
- **スタイリング**: Tailwind CSSユーティリティクラスを優先使用
- **テーマ**: ダークモード固定（`color-scheme: dark`）
- **コンポーネント**: 関数コンポーネント + Hooks
- **状態管理**: React useState/useEffect（外部ライブラリ不使用）
