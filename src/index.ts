#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CreateExperienceTool } from "./tools/createExperience.js";
import { DeleteExperienceTool } from "./tools/deleteExperience.js";
import { GetExpriencesTool } from "./tools/getExperiences.js";
import { GetJobDetailTool } from "./tools/getJobDetail.js";
import { GetJobSummaryTool } from "./tools/getJobSummary.js";
import { GetTechSkillTool } from "./tools/getTechSkill.js";
import { GetWantToDoTool } from "./tools/getWantToDo.js";
import { SearchJobsTool } from "./tools/searchJobs.js";
import { UpdateExperienceTool } from "./tools/updateExperience.js";
import { UpdateJobSummaryTool } from "./tools/updateJobSummary.js";
import { UpdateTechSkillTool } from "./tools/updateTechSkill.js";
import { UpdateWantToDoTool } from "./tools/updateWantToDo.js";
import type { IMCPTool } from "./types.js";

export const ALL_TOOLS: IMCPTool[] = [
  new SearchJobsTool(), // 求人検索ツール
  new GetJobDetailTool(), // 求人詳細取得ツール
  new GetExpriencesTool(), // 職歴取得ツール
  new CreateExperienceTool(), // 職歴新規追加ツール
  new UpdateExperienceTool(), // 職歴更新ツール
  new DeleteExperienceTool(), // 職歴削除ツール
  new GetJobSummaryTool(), // 職務要約取得ツール
  new UpdateJobSummaryTool(), // 職務要約更新ツール
  new GetWantToDoTool(), // 今後のキャリアでやりたいこと取得ツール
  new UpdateWantToDoTool(), // 今後のキャリアでやりたいこと更新ツール
  new GetTechSkillTool(), // テックスキル取得ツール
  new UpdateTechSkillTool(), // テックスキル更新ツール
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
