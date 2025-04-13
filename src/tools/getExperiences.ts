import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import type { IMCPTool } from "../types.js";
import { validateApiKey } from "../helpers/validateApiKey.js";

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
    const apiKeyResult = validateApiKey();
    if (apiKeyResult.isInvalid) return apiKeyResult.errorResopnse;

    try {
      const url = new URL(`${BASE_URL}/experiences`);
      const response = await fetch(url, {
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
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
