# TODO

## 高優先度

- [x] エラーハンドリング改善 - fetchのresponse.okチェック、ユーザーへのエラー表示・再試行ボタン
- [x] 型安全性 - `any`型の排除、APIレスポンスの型定義（`src/types/quake.ts`）
- [x] ローディング/エラー/空データ状態のUI表示

## 中優先度

- [x] テスト追加（Vitest導入）- 54テスト実装済み
- [x] アクセシビリティ改善 - ARIA属性、セマンティックHTML（aside/main/ul/article）、マーカーへのaria-label付与
- [x] マーカー管理改善 - 直接DOM操作をMapbox APIに置き換え（マーカー参照を保持して`marker.remove()`）

## 低優先度

- [x] README.md作成
- [x] レスポンシブ対応（モバイルでのサイドバー表示、iPhoneセーフエリア対応）
- [ ] PWA化（オフライン対応、ホーム画面追加）

## 改善メモ

- ポップアップHTMLにXSS対策（`escapeHtml`）を導入済み
- マップはアンマウント時に`map.remove()`で破棄するよう修正済み
- ポーリング失敗時は前回データを保持し警告バナーを表示する仕様
