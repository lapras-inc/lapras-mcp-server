# LAPRAS MCP

LAPRAS APIを利用したMCP（Model Context Protocol） サーバー。


## Tools
###  `search_job` 求人検索
- キーワード、ページ番号、最低年収などのパラメータを使用して求人を検索
- 使用例: `search_job` ツールを呼び出し、特定の条件に合致する求人リストを取得

### `get_job_detail` 求人詳細取得
- 求人IDを指定して特定の求人の詳細情報を取得
- 使用例: `get_job_detail` ツールを呼び出し、特定の求人の詳細情報を取得

## Setup

mcp.jsonまたはclaude_desktop_config.jsonに以下を追記してください。

### npm経由での利用

```
{
  "mcpServers": {
    "lapras": {
      "command": "npx",
      "args": [
        "-y",
        "@lapras-inc/lapras-mcp"
      ]
    }
  }
}
```

### Dockerでの利用

```
{
  "mcpServers": {
    "lapras": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "laprascom/lapras-mcp"
      ]
    }
  }
}
```
