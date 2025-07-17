[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/lapras-inc-lapras-mcp-server-badge.png)](https://mseep.ai/app/lapras-inc-lapras-mcp-server)

# LAPRAS MCP Server

https://lapras.com 公式のMCP Server

[![npm version](https://img.shields.io/npm/v/@lapras-inc/lapras-mcp-server.svg)](https://www.npmjs.com/package/@lapras-inc/lapras-mcp-server)
[![npm downloads](https://img.shields.io/npm/dt/@lapras-inc/lapras-mcp-server.svg)](https://www.npmjs.com/package/@lapras-inc/lapras-mcp-server)
[![Docker Pulls](https://img.shields.io/docker/pulls/laprascom/lapras-mcp-server)](https://hub.docker.com/r/laprascom/lapras-mcp-server)
[![CI Status](https://img.shields.io/github/actions/workflow/status/lapras-inc/lapras-mcp-server/ci.yml?branch=main)](https://github.com/lapras-inc/lapras-mcp-server/actions)


##  Setup

MCP Serverの設定（[Cursor](https://docs.cursor.com/context/model-context-protocol#configuring-mcp-servers)、[Claude Desktop](https://modelcontextprotocol.io/quickstart/user)）を参考に、mcp.jsonまたはclaude_desktop_config.jsonに以下を追記してください。  
LAPRAS_API_KEYは職歴関連のツールを使う場合のみ必要です。https://lapras.com/config/api-key から取得できます。

### npx

```
{
  "mcpServers": {
    "lapras": {
      "command": "npx",
      "args": [
        "-y",
        "@lapras-inc/lapras-mcp-server"
      ],
      "env": {
        "LAPRAS_API_KEY": "<YOUR_LAPRAS_API_KEY>"
      }
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
        "-e",
        "LAPRAS_API_KEY",
        "laprascom/lapras-mcp-server:v0.4.0"
      ],
      "env": {
        "LAPRAS_API_KEY": "<YOUR_LAPRAS_API_KEY>"
      }
    }
  }
}
```

## General notes
> [!WARNING]
> AIがMCPサーバー経由でLAPRASから取得した情報(個人情報等を含む)は、ご利用中のAIモデルに送信され、解釈・処理が行われます。
> 利用されるAIサービスのデータ取扱いポリシー等をご確認の上、個人情報や機密情報の取り扱いにはご留意ください。

## Examples

#### シンプルな求人の検索例

```
フルリモートワーク可能でRustが使えるバックエンドの求人を探してください。年収は800万以上で。
結果はMarkdownの表にまとめてください。
```

#### 自分にあった求人の検索例

```
<自分のキャリアがわかる画像 or URL を貼り付ける> 
これが私の職歴です。私に合いそうな求人を探してください。
```

#### 自分に合った求人の検索例

```
LAPRASで職歴を取得して、私に合いそうな求人を探してください。
```

#### 職歴を更新する例

```
<自分のキャリアがわかる画像 or URL を貼り付ける> 
これが私の職歴です。LARPASの職歴を更新してください。
```

#### LAPRASの職歴を改善する例

```
LAPRASの職歴を取得して、ブラッシュアップするための質問をしてください。
改善後、LAPRASの職歴を更新してください。
```

#### 職務要約を更新する例

```
私のこれまでの職歴を整理し職務要約を作成して、LAPRASに登録してください。
```

#### 今後のキャリアでやりたいことを更新する例

```
私の職歴を取得して、今後のキャリアでやりたいことについて質問してください。
回答をもとに、LAPRASの今後のキャリアでやりたいことを更新してください。
```

https://github.com/user-attachments/assets/9c61470f-f97d-4e6f-97ca-53718c796376

## Tools
###  `search_job` 求人検索
- キーワード、ページ番号、最低年収などのパラメータを使用して求人を検索
- 使用例: `search_job` ツールを呼び出し、特定の条件に合致する求人リストを取得

### `get_job_detail` 求人詳細取得
- 求人IDを指定して特定の求人の詳細情報を取得
- 使用例: `get_job_detail` ツールを呼び出し、特定の求人の詳細情報を取得

### `get_experiences` 職歴一覧取得
- LAPRASに登録されている職歴情報の一覧を取得
- 使用例: `get_experiences` ツールを呼び出し、登録済みの職歴一覧を取得

### `create_experience` 職歴新規追加
- LAPRASに新しい職歴情報を追加
- 使用例: `create_experience` ツールを呼び出し、新しい職歴を登録

### `update_experience` 職歴更新
- LAPRASに登録されている職歴情報を更新
- 使用例: `update_experience` ツールを呼び出し、既存の職歴を更新

### `delete_experience` 職歴削除
- LAPRASに登録されている職歴情報を削除
- 使用例: `delete_experience` ツールを呼び出し、指定した職歴を削除

### `get_job_summary` 職務要約取得
- LAPRASに登録されている職務要約を取得
- 使用例: `get_job_summary` ツールを呼び出し、登録済みの職務要約を取得

### `update_job_summary` 職務要約更新
- LAPRASに職務要約を登録または更新
- 使用例: `update_job_summary` ツールを呼び出し、職務要約を更新

### `get_want_to_do` キャリア志向取得
- LAPRASに登録されている今後のキャリアでやりたいことを取得
- 使用例: `get_want_to_do` ツールを呼び出し、やりたいことを取得

### `update_want_to_do` キャリア志向更新
- LAPRASに今後のキャリアでやりたいことを登録または更新
- 使用例: `update_want_to_do` ツールを呼び出し、やりたいことを更新

> [!NOTE]
> 職歴関連のツールを使用するには、LAPRAS_API_KEYの設定が必要です。
> APIキーは https://lapras.com/config/api-key から取得できます。

