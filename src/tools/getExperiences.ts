import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import type { IMCPTool } from "../types.js";

/**
 * 職歴取得ツール
 */
export class GetExpriencesTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "get_experiences";

  /**
   * Tool description
   */
  readonly description = "Get work experiences on LAPRAS(https://lapras.com)";

  /**
   * Parameter definition
   */
  readonly parameters = {} as const;

  /**
   * Execute function
   */
  async execute(): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const lapras_api_key = process.env.LAPRAS_API_KEY?.trim();
    if (!lapras_api_key) {
      return createErrorResponse(
        new Error("LAPRAS_API_KEY is required"),
        "LAPRAS_API_KEYの設定が必要です。https://lapras.com/config/api-key から取得してmcp.jsonに設定してください。",
      );
    }

    try {
      const url = new URL(`${BASE_URL}/experiences`);
      const response = await fetch(url, {
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${lapras_api_key}`,
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      const content: TextContent[] = [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ];

      return { content };
    } catch (error) {
      console.error(error);
      return createErrorResponse(error, "職歴の取得に失敗しました");
    }
  }
}
