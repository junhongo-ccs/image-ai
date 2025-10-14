# 🤖 AI画像説明アプリ

Gemini AIを使用して、画像を詳しく日本語で説明するWebアプリケーションです。

## 🌟 機能

- 📷 画像アップロード
- 🤖 Gemini 2.5 Flash AIによる詳細な日本語説明生成
- ⚡ 高速処理
- 🎨 Flutter Webによる美しいUI

## 🛠️ 技術スタック

- **バックエンド**: Node.js + Express
- **AI**: Google Gemini 2.5 Flash
- **フロントエンド**: Flutter Web
- **デプロイ**: Railway

## 🚀 Railwayへのデプロイ手順

### 1. GitHubリポジトリの準備

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Railwayでプロジェクトを作成

1. [Railway](https://railway.app/)にアクセス
2. "New Project" → "Deploy from GitHub repo"
3. このリポジトリを選択

### 3. 環境変数の設定

Railwayのダッシュボードで以下の環境変数を設定：

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8080
```

### 4. デプロイ

Railwayが自動的にビルドとデプロイを開始します。

## 🏃 ローカル開発

### 前提条件

- Node.js 18以上
- Flutter SDK（Webビルド用）

### セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. `.env`ファイルを作成:
```
GEMINI_API_KEY=your_api_key_here
PORT=8080
```

3. Flutter Webのビルド:
```bash
./flutter/bin/flutter build web --release
```

4. サーバーの起動:
```bash
npm start
```

5. ブラウザで `http://localhost:8080` にアクセス

## 📝 環境変数

- `GEMINI_API_KEY`: Google Gemini APIキー（必須）
- `PORT`: サーバーポート（デフォルト: 3000）

## 🎯 APIエンドポイント

### POST /api/describe

画像の説明を生成します。

**リクエスト:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**レスポンス:**
```json
{
  "description": "画像の詳細な説明..."
}
```

## 📄 ライセンス

MIT
