# LAPRAS MCP Server

https://lapras.com 公式のMCP Server

[![npm version](https://img.shields.io/npm/v/@lapras-inc/lapras-mcp-server.svg)](https://www.npmjs.com/package/@lapras-inc/lapras-mcp-server)
[![npm downloads](https://img.shields.io/npm/dt/@lapras-inc/lapras-mcp-server.svg)](https://www.npmjs.com/package/@lapras-inc/lapras-mcp-server)
[![Docker Pulls](https://img.shields.io/docker/pulls/laprascom/lapras-mcp-server)](https://hub.docker.com/r/laprascom/lapras-mcp-server)
[![CI Status](https://img.shields.io/github/actions/workflow/status/lapras-inc/lapras-mcp-server/ci.yml?branch=main)](https://github.com/lapras-inc/lapras-mcp-server/actions)


## Instration

mcp.jsonまたはclaude_desktop_config.jsonに以下を追記してください。

### npx

```
{
  "mcpServers": {
    "lapras": {
      "command": "npx",
      "args": [
        "-y",
        "@lapras-inc/lapras-mcp-server"
      ]
    }
  }
}
```

> [!IMPORTANT]
> Node.jsの環境によってはサーバー接続に失敗する可能性があります。その場合は下記のDocker経由での利用をお試しください。


### Docker

```
{
  "mcpServers": {
    "lapras": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "laprascom/lapras-mcp-server"
      ]
    }
  }
}
```

## Examples

シンプルな求人の検索例

```
フルリモートワーク可能でRustが使えるバックエンドの求人を探してください。年収は800万以上で。
結果はMardkownの表にまとめてください。
```

自分にあった求人の検索例

```
<自分のキャリアがわかる画像 or URL を貼り付ける> 
これが私の職歴です。私に合いそうな求人を探してください。
```

https://github.com/user-attachments/assets/ec0c03c2-a601-416b-ba75-14f16c6b96c2

## Tools
###  `search_job` 求人検索
- キーワード、ページ番号、最低年収などのパラメータを使用して求人を検索
- 使用例: `search_job` ツールを呼び出し、特定の条件に合致する求人リストを取得

### `get_job_detail` 求人詳細取得
- 求人IDを指定して特定の求人の詳細情報を取得
- 使用例: `get_job_detail` ツールを呼び出し、特定の求人の詳細情報を取得
