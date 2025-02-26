# Node.jsイメージを使用
FROM node:18

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# コードをコピー
COPY . .

# ポートを指定
EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "run", "start"]
