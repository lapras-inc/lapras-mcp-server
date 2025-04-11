import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { z } from "zod";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import type { IMCPTool, InferZodParams } from "../types.js";

export const JobSearchResultSchema = z.object({
  job_description_id: z.number(),
  company_id: z.number(),
  title: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
  service_image_url: z.string().optional(),
  company: z.object({
    name: z.string(),
    logo_image_url: z.string().optional(),
  }),
  work_location_prefecture: z.array(z.string()),
  position_name: z.string().optional(),
  tags: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .optional(),
  employment_type: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  service_image_thumbnail_url: z.string().optional(),
  salary_type: z.number().optional(),
  preferred_condition_names: z.array(z.string()).optional(),
  business_type_names: z.array(z.string()).optional(),
  work_style_names: z.array(z.string()).optional(),
  url: z.string(),
});

export type JobSearchResult = z.infer<typeof JobSearchResultSchema>;

/**
 * 求人検索ツール
 */
export class SearchJobsTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "search_jobs";

  /**
   * Tool description
   */
  readonly description = "Search job by keyword, position, and minimum annual salary";

  /**
   * Parameter definition
   */
  readonly parameters = {
    keyword: z.string().optional().describe("The keyword to search for in job listings"),
    page: z.number().optional().describe("Page number for pagination"),
    positions: z
      .array(z.string())
      .optional()
      .describe(
        "List of job position keys (e.g., FRONTEND_ENGINEER, BACKEND_ENGINEER, WEB_APPLICATION_ENGINEER, INFRA_ENGINEER, SITE_RELIABILITY_ENGINEER, ANDROID_ENGINEER, IOS_ENGINEER, MOBILE_ENGINEER, MACHINE_LEARNING_ENGINEER, DATA_SCIENTIST, PROJECT_MANAGER, PRODUCT_MANAGER, TECH_LEAD, ENGINEERING_MANAGER, RESEARCH_ENGINEER, TEST_ENGINEER, SOFTWARE_ARCHITECT, SYSTEM_ENGINEER, EMBEDDED_ENGINEER, DATABASE_ENGINEER, NETWORK_ENGINEER, SECURITY_ENGINEER, SCRUM_MASTER, GAME_ENGINEER, CTO, CORPORATE_ENGINEER, DESIGNER, DATA_ENGINEER, OTHER)",
      ),
    prog_lang_ids: z
      .array(z.number())
      .optional()
      .describe(
        "List of programming language IDs (3: TypeScript, 39: JavaScript, 5: Python, 32: Go, 2: Ruby, 25: PHP, 45: Java, 40: Kotlin, 27: Node.js, 43: Swift, 82: Scala, 421: C#, 46: Rust, 56: C++, 42: Dart, 55: Objective-C)",
      ),
    framework_ids: z
      .array(z.number())
      .optional()
      .describe(
        "List of framework IDs (4: Vue.js, 1428: React, 20: Next.js, 31: Nuxt.js, 6: Angular, 172: Redux, 21: Ruby on Rails, 76: Laravel, 140: Spring Boot, 8: Django, 237: Express, 41: Flutter, 171: ReactNative)",
      ),
    db_ids: z
      .array(z.number())
      .optional()
      .describe(
        "List of database IDs (28: MySQL, 10: PostgreSQL, 419: SQL Server, 318: Oracle, 33: Aurora, 60: Redis, 221: DynamoDB, 170: MongoDB, 169: Elasticsearch, 200: BigQuery)",
      ),
    infra_ids: z
      .array(z.number())
      .optional()
      .describe(
        "List of infrastructure and CI/CD IDs (15: AWS, 52: GCP, 165: Azure, 18: Docker, 17: Terraform, 224: Kubernetes, 51: Firebase, 16: CircleCI, 122: Jenkins, 180: GitHubActions)",
      ),
    business_types: z
      .array(z.number())
      .optional()
      .describe("List of business type IDs (1: 自社開発, 2: 受託開発, 3: SES)"),
    employment_types: z
      .array(z.number())
      .optional()
      .describe(
        "List of employment type IDs (1: 正社員, 2: 業務委託, 3: インターンシップ, 4: その他)",
      ),
    work_styles: z
      .array(z.number())
      .optional()
      .describe("List of work style IDs (1: フルリモート, 2: 一部リモート)"),
    preferred_condition_ids: z
      .array(z.number())
      .optional()
      .describe(
        "List of preferred condition IDs (1: 副業OK, 2: 副業からのジョイン可, 3: SOあり, 4: BtoB, 5: BtoC, 6: 株式上場済み, 7: グローバル, 8: 残業平均20時間未満, 9: アジャイル開発, 10: 英語で書く・話す業務がある, 11: フレックス, 12: 役員以上にエンジニアがいる, 13: 育休取得実績あり, 14: 地方在住社員がいる, 15: スタートアップ, 16: 副業)",
      ),
    annual_salary_min: z.number().optional().describe("Minimum annual salary requirement in JPY"),
    sort_type: z
      .string()
      .optional()
      .describe(
        "Sort order (人気順: popularity_desc, 新着順: updated_at_desc, 年収が低い順: annual_salary_at_asc, 年収が高い順: annual_salary_at_desc)",
      ),
  } as const;

  /**
   * Execute function
   */
  async execute(args: InferZodParams<typeof this.parameters>): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const {
      keyword,
      page,
      positions,
      prog_lang_ids,
      framework_ids,
      db_ids,
      infra_ids,
      business_types,
      employment_types,
      work_styles,
      preferred_condition_ids,
      annual_salary_min,
      sort_type,
    } = args;

    const url = new URL(`${BASE_URL}/job_descriptions/search`);

    if (page) {
      url.searchParams.append("page", page.toString());
    }

    if (keyword) {
      url.searchParams.append("keyword", keyword);
    }

    if (positions && positions.length > 0) {
      for (const position of positions) {
        url.searchParams.append("positions[]", position);
      }
    }

    if (prog_lang_ids && prog_lang_ids.length > 0) {
      for (const id of prog_lang_ids) {
        url.searchParams.append("prog_lang_ids[]", id.toString());
      }
    }

    if (framework_ids && framework_ids.length > 0) {
      for (const id of framework_ids) {
        url.searchParams.append("framework_ids[]", id.toString());
      }
    }

    if (db_ids && db_ids.length > 0) {
      for (const id of db_ids) {
        url.searchParams.append("db_ids[]", id.toString());
      }
    }

    if (infra_ids && infra_ids.length > 0) {
      for (const id of infra_ids) {
        url.searchParams.append("infra_ids[]", id.toString());
      }
    }

    if (business_types && business_types.length > 0) {
      for (const type of business_types) {
        url.searchParams.append("business_types[]", type.toString());
      }
    }

    if (employment_types && employment_types.length > 0) {
      for (const type of employment_types) {
        url.searchParams.append("employment_types[]", type.toString());
      }
    }

    if (work_styles && work_styles.length > 0) {
      for (const style of work_styles) {
        url.searchParams.append("work_styles[]", style.toString());
      }
    }

    if (preferred_condition_ids && preferred_condition_ids.length > 0) {
      for (const id of preferred_condition_ids) {
        url.searchParams.append("preferred_condition_ids[]", id.toString());
      }
    }

    if (annual_salary_min !== undefined) {
      url.searchParams.append("annual_salary_min", annual_salary_min.toString());
    }

    if (sort_type) {
      url.searchParams.append("sort_type", sort_type);
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const rawData = await response.json();

      const ApiResponse = z.object({
        job_descriptions: z.array(JobSearchResultSchema).catch([]),
        total_count: z.number(),
        current_page: z.number(),
        per_page: z.number(),
        total_pages: z.number(),
      });

      const data = ApiResponse.parse(rawData);

      // 画像URLはコンテキスト長を圧迫するため除外
      const cleanedJobs = data.job_descriptions.map((job) => {
        const { service_image_url, service_image_thumbnail_url, company, tags, ...rest } = job;
        return {
          ...rest,
          tags: tags?.map((tag) => tag.name).join(", "),
          company: {
            name: company.name,
          },
        };
      });

      const content: TextContent[] = [
        {
          type: "text",
          text: JSON.stringify({ ...data, job_descriptions: cleanedJobs }, null, 2),
        },
      ];

      return { content };
    } catch (error) {
      return createErrorResponse(error, "求人情報の取得に失敗しました");
    }
  }
}
