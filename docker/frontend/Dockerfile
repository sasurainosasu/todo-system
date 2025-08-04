# ベースイメージとしてNode.js 18のAlpine版を使用
FROM node:20-alpine

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# package.jsonとロックファイルを先にコピーして、依存関係の変更がない限りキャッシュを利用する
COPY ./app/frontend/package*.json ./

# 依存パッケージをインストール
RUN npm install

# アプリケーションのソースコードをすべてコピー
COPY ./app/frontend/ ./

# Next.jsの開発サーバーが使用するポートを公開
EXPOSE 3000

# 開発サーバーを起動するコマンド
CMD ["npm", "run", "dev"]
