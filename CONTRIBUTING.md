# CONTRIBUTING GUIDE

## 開発ワークフロー

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/lapras-inc/lapras-mcp-server.git
cd lapras-mcp-server

npm install
```
### ビルド

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Pull Request

PRを作成する際は、以下の情報を含めてください：

1. 変更内容の概要
2. 関連する Issue 番号（ある場合）
3. テスト方法

## Release

### npm

```
# LAPRASアカウントでログイン
npm login
```

```
# バージョン更新
npm verson [major/minor/patch]
```

```
# 公開
npm publish
```

### Docker Hub

```
# LAPRASアカウントでログイン
docker login
```

```
# build
docker build -t lapras/mcp-server .
```

```
# latestタグでpush
docker tag lapras/mcp-server laprascom/lapras-mcp-server:latest
docker push laprascom/lapras-mcp-server:latest
```

### DXT

新しいtagをmainにpushするとCIでリリースと共に作成されるので特に対応不要。

