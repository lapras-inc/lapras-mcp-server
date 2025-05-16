import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import type { IMCPTool } from "../types.js";
import { historyManager } from "../history.js";

export class GetHistoryTool implements IMCPTool {
  readonly name = "get_history";
  readonly description = "Get history of changes made during this session";
  readonly parameters = {} as const;

  async execute(): Promise<{ content: TextContent[]; isError?: boolean }> {
    const entries = historyManager.getHistory();
    return {
      content: [{ type: "text", text: JSON.stringify(entries, null, 2) }],
    };
  }
}
