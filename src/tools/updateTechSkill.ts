import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { z } from "zod";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import { validateApiKey } from "../helpers/validateApiKey.js";
import type { IMCPTool, InferZodParams } from "../types.js";

const EXPERIENCE_YEARS_ID_MAP: Array<{ max: number; id: number }> = [
  { max: 1, id: 0 },
  { max: 2, id: 1 },
  { max: 3, id: 2 },
  { max: 5, id: 3 },
  { max: 10, id: 5 },
  { max: Number.POSITIVE_INFINITY, id: 10 },
];

const mapYearsToId = (years: number): number => {
  for (const { max, id } of EXPERIENCE_YEARS_ID_MAP) {
    if (years < max) return id;
  }
  throw new Error("Invalid years value");
};

/**
 * テックスキル更新ツール
 */
export class UpdateTechSkillTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "update_tech_skill";

  /**
   * Tool description
   */
  readonly description =
    "Update tech skills（経験技術・スキル・資格） on LAPRAS(https://lapras.com)";

  /**
   * Parameter definition
   */
  readonly parameters = {
    tech_skill_list: z
      .array(
        z.object({
          name: z.string().min(1).describe("Tech skill name"),
          years: z.number().min(0).describe("Years of experience (numeric value)"),
        }),
      )
      .min(1)
      .describe("List of tech skills with experience years"),
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
      const masterResponse = await fetch(new URL(`${BASE_URL}/tech_skill/master`), {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
        },
      });

      if (!masterResponse.ok) {
        throw new Error(`Failed to fetch tech skill master: ${masterResponse.status}`);
      }

      const masterData = (await masterResponse.json()) as {
        tech_skill_list: Array<{ id: number; name: string }>;
      };

      const nameToIdMap = new Map(
        masterData.tech_skill_list.map((skill) => [
          skill.name.replace(/\s+/g, "").toLowerCase(),
          skill.id,
        ]),
      );

      const requestBody = {
        tech_skill_list: args.tech_skill_list
          .map((skill) => {
            const normalizedName = skill.name.replace(/\s+/g, "").toLowerCase();
            const techSkillId = nameToIdMap.get(normalizedName);
            if (!techSkillId) {
              return null;
            }

            return {
              tech_skill_id: techSkillId,
              years: mapYearsToId(skill.years),
            };
          })
          .filter((skill): skill is { tech_skill_id: number; years: number } => skill !== null),
      };

      if (requestBody.tech_skill_list.length === 0) {
        return createErrorResponse(
          new Error("No valid tech skills to update"),
          "有効なテックスキルが存在しません。スキル名を確認してください。",
        );
      }

      const response = await fetch(new URL(`${BASE_URL}/tech_skill`), {
        method: "PUT",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKeyResult.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(error);
      return createErrorResponse(error, "テックスキルの更新に失敗しました");
    }
  }
}
