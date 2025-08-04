# ビルド済みのアプリケーションを実行するための軽量なコンテナを作成します。
# ビルドに必要なファイルのみをコピーし、余分なファイルを削除します。
FROM node:20-alpine

# 作業ディレクトリを /app に設定
WORKDIR /app

# 本番環境の依存関係のみをインストール
# これにより、開発用依存関係が最終的なイメージに含まれなくなります。
COPY ./app/frontend/package.json ./
COPY ./app/frontend/package-lock.json ./
RUN npm install --omit=dev
RUN npm install typescript

# ビルドステージから必要なファイルとディレクトリをコピー
# .next ディレクトリ（ビルド結果）、public ディレクトリ、node_modules をコピーします。
#COPY --from=builder  /app/public ./public
#COPY --from=builder  /app/.next ./.next
#COPY  /app/frontend/.next ./.next
# `node_modules`は実行ステージで`--only=production`でインストールしたものを使用する
# COPY --from=builder ./app/frontend/node_modules ./node_modules

# Next.jsの本番環境モードを有効にする環境変数を設定
ENV NODE_ENV=production

# Next.jsサーバーがリッスンするポートを公開
# デフォルトは3000番です。必要に応じて変更してください。
EXPOSE 3000

# コンテナが起動したときに実行されるコマンド
# `npm start`は`next start`を実行し、ビルド済みのアプリケーションを起動します。
CMD ["npm", "start"]