import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { z } from "zod";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import { validateApiKey } from "../helpers/validateApiKey.js";
import type { IMCPTool, InferZodParams } from "../types.js";

/**
 * 職歴削除ツール
 */
export class DeleteExperienceTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "delete_experience";

  /**
   * Tool description
   */
  readonly description =
    "Delete a work experience from LAPRAS(https://lapras.com). You can check the result at https://lapras.com/cv";

  /**
   * Parameter definition
   */
  readonly parameters = {
    experience_id: z.number().describe("ID of the experience to delete"),
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
      const response = await fetch(new URL(`${BASE_URL}/experiences/${args.experience_id}`), {
        method: "DELETE",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return {
        content: [{ type: "text", text: "職歴の削除が完了しました" }],
      };
    } catch (error) {
      console.error(error);
      return createErrorResponse(error, "職歴の削除に失敗しました");
    }
  }
}
