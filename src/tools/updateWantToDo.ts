import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { z } from "zod";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import { unescapeText } from "../helpers/textFormatter.js";
import { validateApiKey } from "../helpers/validateApiKey.js";
import type { IMCPTool, InferZodParams } from "../types.js";
import { historyManager } from "../history.js";

/**
 * 今後のキャリアでやりたいこと更新ツール
 */
export class UpdateWantToDoTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "update_want_to_do";

  /**
   * Tool description
   */
  readonly description =
    "Update career aspirations（今後のキャリアでやりたいこと） on LAPRAS(https://lapras.com). You can check the result at https://lapras.com/cv";

  /**
   * Parameter definition
   */
  readonly parameters = {
    want_to_do: z.string().max(1000).describe("Career aspirations（今後のキャリアでやりたいこと）"),
  } as const;

  /**
   * Execute function
   */
  async execute(args: InferZodParams<typeof this.parameters>): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const apiKeyResult = validateApiKey();
    if (apiKeyResult.isInvalid) return apiKeyResult.errorResopnse;

    try {
      // Record history before updating want_to_do
      const prevResponse = await fetch(new URL(`${BASE_URL}/want_to_do`), {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
        },
      });
      const prevData = await prevResponse.json();
      historyManager.add({
        timestamp: new Date().toISOString(),
        toolName: this.name,
        objectType: "want_to_do",
        previousState: prevData,
      });

      const response = await fetch(new URL(`${BASE_URL}/want_to_do`), {
        method: "PUT",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
        },
        body: JSON.stringify({
          want_to_do: unescapeText(args.want_to_do),
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      console.error(error);
      return createErrorResponse(error, "今後のキャリアでやりたいことの更新に失敗しました");
    }
  }
}
