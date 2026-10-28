import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import { unescapeText } from "../helpers/textFormatter.js";
import { validateApiKey } from "../helpers/validateApiKey.js";
import { createExperienceParams } from "../schemas/experience.js";
import type { IMCPTool, InferZodParams } from "../types.js";

/**
 * 職歴新規追加ツール
 */
export class CreateExperienceTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "create_experience";

  /**
   * Tool description
   */
  readonly description =
    "Create a new work experience on LAPRAS(https://lapras.com). You can check the result at https://lapras.com/cv";

  /**
   * Parameter definition
   */
  readonly parameters = createExperienceParams;

  /**
   * Execute function
   */
  async execute(args: InferZodParams<typeof this.parameters>): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const apiKeyResult = validateApiKey();
    if (apiKeyResult.isInvalid) return apiKeyResult.errorResponse;

    try {
      const response = await fetch(new URL(`${BASE_URL}/experiences`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
        },
        body: JSON.stringify({
          ...args,
          description: unescapeText(args.description),
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
      return createErrorResponse(error, "職歴の新規追加に失敗しました");
    }
  }
}
