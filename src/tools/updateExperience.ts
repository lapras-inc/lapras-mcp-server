import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import { unescapeText } from "../helpers/textFormatter.js";
import { validateApiKey } from "../helpers/validateApiKey.js";
import { updateExperienceParams } from "../schemas/experience.js";
import type { IMCPTool, InferZodParams } from "../types.js";

/**
 * 職歴更新ツール
 */
export class UpdateExperienceTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "update_experience";

  /**
   * Tool description
   */
  readonly description =
    "Update a work experience on LAPRAS(https://lapras.com). You can check the result at https://lapras.com/cv";

  /**
   * Parameter definition
   */
  readonly parameters = updateExperienceParams;

  /**
   * Execute function
   */
  async execute(args: InferZodParams<typeof this.parameters>): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const apiKeyResult = validateApiKey();
    if (apiKeyResult.isInvalid) return apiKeyResult.errorResponse;

    const { experience_id, ...updateData } = args;

    try {
      const response = await fetch(new URL(`${BASE_URL}/experiences/${experience_id}`), {
        method: "PUT",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
        },
        body: JSON.stringify({
          ...updateData,
          description: unescapeText(updateData.description),
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
      return createErrorResponse(error, "職歴の更新に失敗しました");
    }
  }
}
