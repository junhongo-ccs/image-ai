# 📷 画像読み取りくん - 技術仕様書

## 🏗️ システム構成

**アーキテクチャ**
- **フロントエンド**: Flutter Web (Dart)
- **バックエンド**: Node.js + Express
- **AI エンジン**: Google Gemini 2.5 Flash API
- **ホスティング**: Railway (GitHub連携で自動デプロイ)
- **ポート**: 8080

---

## 🔧 バックエンドの仕組み

### 1. サーバー構成 (server.js)
- Express.js で REST API を提供
- `/api/describe` エンドポイントで画像解析を受付
- CORS 対応で Flutter Web からのリクエストを許可
- CSP (Content Security Policy) ヘッダーで Flutter Web の動作を保証

### 2. 画像処理フロー
```
① クライアントから Base64 エンコードされた画像を受信
② MIME タイプを自動検出 (JPEG/PNG/GIF/WebP)
③ Gemini API に画像データとプロンプトを送信
④ AI が画像を解析して日本語で説明文を生成
⑤ Markdown 形式のレスポンスをクライアントに返却
```

### 3. 使用している AI モデル
- **モデル名**: `gemini-2.5-flash`
- **特徴**: 高速・低コスト・マルチモーダル (画像+テキスト)
- **API**: Google Generative AI SDK (@google/generative-ai)
- **プロンプト**: 「この画像について、日本語で詳しく説明してください」

### 4. セキュリティ対策
- 環境変数で API キーを管理 (`.env` / Railway Variables)
- CSP ヘッダーで XSS 対策
- 必要なドメインのみ許可:
  - `*.gstatic.com` (CanvasKit, Skia)
  - `fonts.gstatic.com` (Google Fonts)
  - `fonts.googleapis.com` (Google Fonts CSS)
  - `blob:` (画像プレビュー用)

### 5. エラーハンドリング
- 詳細なログ出力でデバッグを容易化
- クライアントには適切なエラーメッセージを返却
- 500 エラー時もユーザーフレンドリーなメッセージ

---

## 📱 フロントエンドの仕組み

### 1. Flutter Web の特徴
- **クロスプラットフォーム**: 同じコードで Web/iOS/Android 対応
- **Material Design 3**: モダンな UI デザイン
- **レスポンシブ**: モバイル・デスクトップ両対応
- **CanvasKit レンダリング**: 高品質な描画エンジン

### 2. 主要機能
- **デバイス検出**: User-Agent で PC/スマホを判定
  ```dart
  bool isMobile = userAgent.contains('Android') || 
                  userAgent.contains('iPhone') || 
                  userAgent.contains('iPad');
  ```
- **カメラ撮影**: スマホのみ有効 (PC ではグレーアウト)
- **画像選択**: ギャラリーから写真を選択
- **Markdown レンダリング**: 見出し・太字・リストを正しく表示
- **画像プレビュー**: 選択した画像をその場で表示

### 3. 使用パッケージ
- `image_picker ^1.0.0`: カメラ・ギャラリーアクセス
- `http ^1.1.0`: バックエンド API 通信
- `markdown_widget ^2.3.2`: Markdown を Flutter ウィジェットに変換
- `flutter_dotenv ^5.2.1`: 環境変数管理

### 4. UI/UX 設計
- **ボタンスタイル**: フォントサイズ 16px, フォントウェイト w600
- **カラースキーム**: Material Design 3 のデフォルトテーマ
- **レイアウト**: Center + Column で中央揃え
- **フィードバック**: ローディング中は CircularProgressIndicator を表示

---

## 🚀 デプロイ戦略

### Railway の自動デプロイ
```
① GitHub に push
② Railway が自動検出して Node.js プロジェクトとしてビルド
③ `npm install` で依存関係をインストール
④ `npm start` (node server.js) でサーバー起動
⑤ Flutter Web の静的ファイルを `/build/web` から配信
```

### 環境変数
- `GEMINI_API_KEY`: Gemini API の認証キー
- `PORT`: Railway が自動設定 (開発環境では 8080)

### ビルドプロセス
```bash
# Flutter Web ビルド
flutter build web --release

# 成果物
build/web/
├── index.html
├── main.dart.js (コンパイル済み Dart コード)
├── flutter_service_worker.js
├── assets/
└── icons/
```

### 静的ファイル配信
```javascript
// server.js
app.use(express.static(path.join(__dirname, 'build/web')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/web', 'index.html'));
});
```

---

## 📊 技術スタック一覧

| カテゴリ | 技術 | バージョン |
|---------|------|----------|
| **言語** | Dart, JavaScript | Dart 3.5, Node 18+ |
| **フレームワーク** | Flutter, Express.js | Flutter 3.24, Express 4.21 |
| **AI** | Google Gemini API | 2.5 Flash |
| **パッケージ管理** | npm, pub | npm 9+, pub |
| **ホスティング** | Railway | - |
| **バージョン管理** | Git, GitHub | - |

---

## 🎯 今後の拡張可能性

### 機能拡張案
- **複数言語対応**: プロンプトを変更するだけで英語・中国語等に対応可能
- **画像履歴**: データベース (PostgreSQL/MongoDB) で過去の解析結果を保存
- **リアルタイム解析**: WebSocket で進捗状況をストリーミング
- **OCR 機能**: 文字認識に特化したプロンプトで文字起こし
- **バッチ処理**: 複数画像を一括解析
- **PDF 出力**: 解析結果を PDF でエクスポート
- **共有機能**: SNS シェアボタンの追加

### 技術的改善案
- **キャッシュ機構**: 同じ画像の再解析を防ぐ
- **画像圧縮**: アップロード前にクライアント側で圧縮
- **プログレッシブ応答**: ストリーミング API で段階的に結果表示
- **A/B テスト**: 異なるプロンプトの効果を測定
- **アナリティクス**: Google Analytics で利用状況を追跡

---

## 💰 コスト試算

### Gemini API 料金 (2025年10月時点)
- **Gemini 2.5 Flash**: 画像1枚あたり約 $0.0001 未満
- **月間1万リクエスト**: $1未満
- **月間10万リクエスト**: $10未満

### Railway ホスティング
- **Starter Plan**: $5/月
  - 512MB RAM
  - 1GB Storage
  - 100GB Bandwidth
- **Pro Plan**: $20/月
  - 8GB RAM
  - 100GB Storage
  - 無制限 Bandwidth

### 合計コスト試算
- **小規模運用** (月間1,000リクエスト): 約 $5/月
- **中規模運用** (月間10,000リクエスト): 約 $6/月
- **大規模運用** (月間100,000リクエスト): 約 $30/月

---

## 🔍 トラブルシューティング

### よくある問題と解決策

**1. Service Worker エラー**
- **原因**: Flutter Web のビルド成果物が Git にコミットされていない
- **解決**: `git add -f build/web/` でビルドディレクトリを強制追加

**2. CSP エラー (Content Security Policy)**
- **原因**: Flutter Web が必要とするドメインがブロックされている
- **解決**: server.js で適切な CSP ヘッダーを設定

**3. Gemini API 401 エラー**
- **原因**: API キーが設定されていない or 空文字列
- **解決**: Railway の環境変数で `GEMINI_API_KEY` を正しく設定

**4. Gemini API 404 エラー**
- **原因**: 古いモデル名を使用している (例: gemini-1.5-flash)
- **解決**: 最新モデル `gemini-2.5-flash` に更新

**5. Markdown が正しく表示されない**
- **原因**: `MarkdownWidget` の設定ミス
- **解決**: `MarkdownBlock` を使用し、適切な設定を適用

---

## 📞 リソース

### ドキュメント
- **Flutter 公式**: https://flutter.dev/
- **Gemini API**: https://ai.google.dev/
- **Railway 公式**: https://railway.app/
- **Express.js**: https://expressjs.com/

### プロジェクト情報
- **リポジトリ**: https://github.com/junhongo-ccs/image-ai
- **本番環境**: https://web-production-ebf06.up.railway.app/
- **開発環境**: http://localhost:8080

### 開発コマンド
```bash
# ローカル開発
npm start                          # バックエンド起動
flutter run -d chrome              # フロントエンド起動 (開発モード)
flutter build web --release        # プロダクションビルド

# デプロイ
git add -A
git commit -m "Update"
git push origin main               # Railway が自動デプロイ

# デバッグ
node list-models.js                # 利用可能な Gemini モデルを確認
curl -X POST http://localhost:8080/api/describe  # API テスト
```

---

## 👥 チーム・お問い合わせ

技術的な質問や機能追加のご相談は、開発チームまでお気軽にどうぞ！

**開発**: junhongo-ccs  
**更新日**: 2025年10月14日
