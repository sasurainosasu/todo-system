# ベースイメージとして、軽量なNginxのAlpine版を使用します
FROM nginx:alpine

# Nginxのデフォルト設定ファイルを削除します。
# この後、docker-compose.ymlでホストのカスタム設定ファイルがマウントされます。
RUN rm /etc/nginx/conf.d/default.conf