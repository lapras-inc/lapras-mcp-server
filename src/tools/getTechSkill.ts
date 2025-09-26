import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import { validateApiKey } from "../helpers/validateApiKey.js";
import type { IMCPTool } from "../types.js";

const EXPERIENCE_YEARS_LABEL_MAP: Record<number, string> = {
  0: "1年未満",
  1: "1年以上2年未満",
  2: "2年以上3年未満",
  3: "3年以上5年未満",
  5: "5年以上10年未満",
  10: "10年以上",
};

const formatSkillYears = (yearsId: number): string => {
  return EXPERIENCE_YEARS_LABEL_MAP[yearsId] ?? "不明";
};

/**
 * テックスキル取得ツール
 */
export class GetTechSkillTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "get_tech_skill";

  /**
   * Tool description
   */
  readonly description =
    "Get current tech skills（経験技術・スキル・資格） on LAPRAS(https://lapras.com)";

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

      const masterMap = new Map(masterData.tech_skill_list.map((skill) => [skill.id, skill.name]));

      const url = new URL(`${BASE_URL}/tech_skill`);
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

      const data = (await response.json()) as {
        error: boolean;
        tech_skill_list: Array<{ tech_skill_id: number; years: number }>;
        updated_at: string;
      };

      const formatted = data.tech_skill_list.map((skill) => {
        const name = masterMap.get(skill.tech_skill_id);
        return {
          tech_skill_id: skill.tech_skill_id,
          tech_skill_name: name ?? null,
          years_id: skill.years,
          years_label: formatSkillYears(skill.years),
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: data.error,
                updated_at: data.updated_at,
                tech_skill_list: formatted,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      console.error(error);
      return createErrorResponse(error, "テックスキルの取得に失敗しました");
    }
  }
}
