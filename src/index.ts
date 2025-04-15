#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CreateExperienceTool } from "./tools/createExperience.js";
import { DeleteExperienceTool } from "./tools/deleteExperience.js";
import { GetExpriencesTool } from "./tools/getExperiences.js";
import { GetJobDetailTool } from "./tools/getJobDetail.js";
import { SearchJobsTool } from "./tools/searchJobs.js";
import { UpdateExperienceTool } from "./tools/updateExperience.js";
import type { IMCPTool } from "./types.js";

export const ALL_TOOLS: IMCPTool[] = [
  new SearchJobsTool(), // 求人検索ツール
  new GetJobDetailTool(), // 求人詳細取得ツール
  new GetExpriencesTool(), // 職歴取得ツール
  new CreateExperienceTool(), // 職歴新規追加ツール
  new UpdateExperienceTool(), // 職歴更新ツール
  new DeleteExperienceTool(), // 職歴削除ツール
];

const server = new McpServer(
  {
    name: "LAPRAS",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

for (const tool of ALL_TOOLS) {
  server.tool(tool.name, tool.description, tool.parameters, tool.execute.bind(tool));
}

const transport = new StdioServerTransport();
await server.connect(transport);
