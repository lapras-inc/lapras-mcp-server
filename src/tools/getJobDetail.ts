import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fetch from "node-fetch";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import type { IMCPTool, InferZodParams } from "../types.js";

/**
 * 求人詳細取得ツール
 */
export class GetJobDetailTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "get_job_detail";

  /**
   * Tool description
   */
  readonly description = "Get detailed information about a specific job posting";

  /**
   * Parameter definition
   */
  readonly parameters = {
    jobId: z.string().describe("The unique identifier of the job posting"),
  } as const;

  /**
   * Execute function
   */
  async execute(args: InferZodParams<typeof this.parameters>): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const { jobId } = args;
    if (!jobId) {
      return createErrorResponse(new Error("jobId is required"), "求人IDが必要です");
    }

    const url = `${BASE_URL}/job_descriptions/${jobId}`;

    try {
      const response = await fetch(url);

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
      return createErrorResponse(error, "求人詳細の取得に失敗しました");
    }
  }
}
