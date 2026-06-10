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
| テスト | Vitest + Testing Library | 4.x / 16.x |

---

## プロジェクト構造

```
quake-watch-jp/
├── index.html                    # エントリHTML（lang="ja"、viewport-fit=cover）
├── package.json                  # 依存関係・スクリプト定義
├── vite.config.ts                # Vite設定（Vitestの設定も含む）
├── tsconfig.json                 # TypeScript設定
├── tsconfig.node.json            # Node用TypeScript設定
├── .env                          # 環境変数（VITE_MAPBOX_TOKEN）
├── .gitignore
├── README.md                     # プロジェクト概要・セットアップ手順
├── public/
│   └── vite.svg                  # Viteロゴ
└── src/
    ├── main.tsx                  # Reactエントリポイント
    ├── App.tsx                   # メインアプリコンポーネント
    ├── App.test.tsx              # Appコンポーネントのテスト
    ├── index.css                 # グローバルスタイル（Tailwind + セーフエリアユーティリティ）
    ├── types/
    │   └── quake.ts              # Quake型・P2PQuakeRecord型（APIレスポンス型定義）
    ├── components/
    │   ├── EarthquakeMap.tsx     # Mapbox地図コンポーネント
    │   └── EarthquakeMap.test.tsx
    ├── utils/                    # 純粋関数ユーティリティ（テスト対象）
    │   ├── formatIntensity.ts    # 震度コード→表示文字列変換
    │   ├── formatIntensity.test.ts
    │   ├── getIntensityColor.ts  # 震度→マーカー色変換
    │   ├── getIntensityColor.test.ts
    │   ├── formatQuakeTime.ts    # 時刻文字列→"MM/dd HH:mm"整形（不正値フォールバック付き）
    │   ├── formatQuakeTime.test.ts
    │   ├── escapeHtml.ts         # HTML特殊文字エスケープ（XSS対策）
    │   └── escapeHtml.test.ts
    └── test/
        └── setup.ts              # Vitestセットアップ（jest-domマッチャー）
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

# テスト実行（CI用・1回実行）
npm test

# テスト実行（ウォッチモード・開発時）
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
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
  - `fetchQuakes()` - API呼び出し（`response.ok`チェック・配列バリデーション）・データ整形
  - 状態: `loading` / `error` / `quakes` / `listOpen`（モバイルのボトムシート開閉）
  - エラー時UI: データなし→エラーメッセージ + 再試行ボタン、データあり→前回データ保持 + 警告バナー
  - セマンティックHTML（`aside`/`main`/`ul`/`article`）+ ARIA属性
- **`EarthquakeMap.tsx`** - Mapbox GL地図の初期化・マーカー管理
  - マーカーは`useRef`で参照を保持し、`marker.remove()`で破棄（直接DOM操作なし）
  - アンマウント時に`map.remove()`でクリーンアップ
  - ポップアップHTMLは`escapeHtml`でエスケープ、マーカーに`aria-label`付与

### 型定義（`src/types/quake.ts`）

- **`Quake`** - アプリ内で使用する整形済み地震情報
- **`P2PQuakeRecord`** - P2P地震情報APIのレスポンス型（`any`不使用）

### ユーティリティ（`src/utils/`）

- **`formatIntensity.ts`** - 震度コード→表示文字列変換（10→1, 20→2, ..., 70→7）
- **`getIntensityColor.ts`** - 震度文字列→マーカー色のHex変換
- **`formatQuakeTime.ts`** - API時刻文字列→"MM/dd HH:mm"整形（パース不能時はプレースホルダ）
- **`escapeHtml.ts`** - HTML特殊文字エスケープ（ポップアップのXSS対策）

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

## テスト

### テスト構成

テストファイルはソースファイルと同じディレクトリに配置（コロケーション方式）。

| ファイル | テスト数 | 内容 |
|---------|---------|------|
| `utils/formatIntensity.test.ts` | 11 | 全震度コードのマッピング、不明コードのフォールバック |
| `utils/getIntensityColor.test.ts` | 10 | 全震度文字列の色変換、`includes()`ロジックの回帰テスト |
| `utils/formatQuakeTime.test.ts` | 3 | 時刻整形、不正値のフォールバック |
| `utils/escapeHtml.test.ts` | 3 | HTML特殊文字のエスケープ |
| `App.test.tsx` | 14 | ローディング/エラー/空データ状態、再試行、ポーリング失敗時の前回データ保持、ポーリング、クリーンアップ |
| `components/EarthquakeMap.test.tsx` | 13 | マップ初期化・破棄、マーカー生成・破棄・座標・サイズ計算、XSSエスケープ、aria-label |

### Mapboxのモック

`EarthquakeMap.test.tsx`では`vi.mock('mapbox-gl')`でMapbox GL全体をモック。
`vi.hoisted()`で定義したインスタンスを`vi.mock`ファクトリ内から参照している。

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
