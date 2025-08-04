#================================
# ファイル: docker/php/Dockerfile
#================================

# ベースイメージとしてPHP 8.2のFPM-Alpine版を使用
FROM php:8.2-fpm-alpine

# Alpine Linuxのパッケージを更新し、必要なライブラリをインストール
# (今回は不要ですが、gdやzipなどを入れる場合はここに追記します)
# RUN apk update && apk add --no-cache libpng-dev libzip-dev && docker-php-ext-install gd zip

# MySQLに接続するためのPHP拡張機能をインストール
# pdoを先にインストールし、その後にpdo_mysql, mysqliをインストール
RUN docker-php-ext-install pdo \
    && docker-php-ext-install pdo_mysql mysqli

# MailHogのmhsendmailをインストール（1行にまとめる）
RUN curl -sSL https://github.com/mailhog/mhsendmail/releases/download/v0.2.0/mhsendmail_linux_amd64 -o /usr/local/bin/mhsendmail \
    && chmod +x /usr/local/bin/mhsendmail

# カスタムのphp.iniファイルをコンテナ内にコピー
COPY ./docker/php/php.ini /usr/local/etc/php/php.ini