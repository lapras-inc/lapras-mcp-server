import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { z } from "zod";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import { validateApiKey } from "../helpers/validateApiKey.js";
import type { IMCPTool, InferZodParams } from "../types.js";

/**
 * 職歴更新ツール
 */
export class BulkUpdateExperiencesTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "bulk_update_experiences";

  /**
   * Tool description
   */
  readonly description =
    "Bulk update tool for work experiences on LAPRAS(https://lapras.com). Note that this is a complete replacement operation, NOT A PARTIAL UPDATE, so all experience items must be included. After executing this tool, please check the results at https://lapras.com/cv#experiences.";

  /**
   * Parameter definition
   */
  readonly parameters = {
    experience_list: z
      .array(
        z.object({
          organization_name: z.string().describe("Name of the organization"),
          positions: z
            .array(
              z.object({
                id: z
                  .number()
                  .describe(
                    "Position type ID (1: フロントエンドエンジニア, 2: バックエンドエンジニア, 3: Webアプリケーションエンジニア, 4: インフラエンジニア, 5: SRE, 6: Android アプリエンジニア, 7: iOS アプリエンジニア, 8: モバイルエンジニア, 9: 機械学習エンジニア, 10: データサイエンティスト, 11: プロジェクトマネージャー, 12: プロダクトマネージャー, 13: テックリード, 14: エンジニアリングマネージャー, 15: リサーチエンジニア, 16: QA・テストエンジニア, 17: アーキテクト, 18: システムエンジニア, 19: 組み込みエンジニア, 20: データベースエンジニア, 21: ネットワークエンジニア, 22: セキュリティエンジニア, 23: スクラムマスター, 24: ゲームエンジニア, 25: CTO, 26: コーポレートエンジニア, 27: デザイナーその他, 28: データエンジニア, 29: CRE・テクニカルサポート, 30: セールスエンジニア・プリセールス, 31: ソフトウェアエンジニア, 32: ITエンジニアその他, 33: UI/UXデザイナー, 34: Webデザイナー, 35: ゲームデザイナー, 36: 動画制作・編集, 37: Webプロデューサー・ディレクター, 38: Webコンテンツ企画・編集・ライティング, 39: ゲームプロデューサー・ディレクター, 40: プロダクトマーケティングマネージャー, 41: 動画プロデューサー・ディレクター, 42: アートディレクター, 43: PM/ディレクターその他, 44: 営業, 45: 法人営業, 46: 個人営業, 47: 営業企画, 48: 営業事務, 49: 代理店営業, 50: インサイドセールス, 51: セールスその他, 52: 事業企画, 53: 経営企画, 54: 新規事業開発, 55: 事業開発その他, 56: カスタマーサクセス, 57: カスタマーサポート, 58: ヘルプデスク, 59: コールセンター管理・運営, 60: カスタマーサクセス・サポートその他, 61: 広報・PR・広告宣伝, 62: リサーチ・データ分析, 63: 商品企画・開発, 64: 販促, 65: MD・VMD・バイヤー, 66: Web広告運用・SEO・SNS運用, 67: CRM, 68: 広報・マーケティングその他, 69: 経営者・CEO・COO等, 70: CFO, 71: CIO, 72: 監査役, 73: 経営・CXOその他, 74: 経理, 75: 財務, 76: 法務, 77: 総務, 78: 労務, 79: 秘書, 80: 事務, 81: コーポレートその他, 82: 採用, 83: 人材開発・人材育成・研修, 84: 制度企画・組織開発, 85: 労務・給与, 86: 人事その他, 87: システムコンサルタント, 88: パッケージ導入コンサルタント, 89: セキュリティコンサルタント, 90: ネットワークコンサルタント, 91: ITコンサルタントその他, 92: 戦略コンサルタント, 93: DXコンサルタント, 94: 財務・会計コンサルタント, 95: 組織・人事コンサルタント, 96: 業務プロセスコンサルタント, 97: 物流コンサルタント, 98: リサーチャー・調査員, 99: コンサルタントその他, 100: その他)",
                  ),
              }),
            )
            .describe(
              "List of position type IDs - multiple selections are allowed. Please set relevant position types.",
            ),
          position_name: z.string().optional().describe("Position title"),
          is_client_work: z
            .boolean()
            .describe(
              "Whether this is client work (Set to true when the affiliated company and the project client are different, such as in contract development companies)",
            ),
          client_company_name: z
            .string()
            .optional()
            .describe("Client company name (required only when is_client_work is true)"),
          start_year: z.number().describe("Start year"),
          start_month: z.number().describe("Start month"),
          end_year: z.number().describe("End year (0 if ongoing)"),
          end_month: z.number().describe("End month (0 if ongoing)"),
          description: z
            .string()
            .optional()
            .describe("Detailed description of the experience (Markdown format)"),
        }),
      )
      .describe("List of experiences to create or update"),
    force: z
      .boolean()
      .default(false)
      .describe(
        "Force update even if the experience already exists. Please confirm with the user before setting this option to true.",
      ),
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

    const { experience_list, force } = args;

    try {
      if (!experience_list || experience_list.length === 0) {
        return createErrorResponse(
          new Error("experience_list is required"),
          "職歴リストが必要です",
        );
      }

      const current_experiences = await this.getCurrentExperiences(apiKeyResult.apiKey);

      // 誤って職歴を削除するケースを防ぐため、現在の職歴の数より更新後の職歴の数が少ない場合はエラーとする
      // force が true の場合は、職歴の数が減っていても更新する
      if (!force && current_experiences.length > experience_list.length) {
        return createErrorResponse(
          new Error("Experience list length mismatch"),
          "現在の職歴の数より更新後の職歴の数が少ないです。職歴が削除されますがよろしいですか？削除して良い場合は、ユーザーに状況を必ず確認してください。確認後、それでも更新したい場合はforce=trueを指定して再度実行してください。",
        );
      }

      return await this.handleExperienceUpdate(apiKeyResult.apiKey, experience_list);
    } catch (error) {
      console.error(error);
      return createErrorResponse(error, "職歴の新規追加・更新に失敗しました");
    }
  }

  /**
   * 職歴の更新処理
   */
  private async handleExperienceUpdate(
    lapras_api_key: string,
    experience_list: any[],
  ): Promise<{ content: TextContent[]; isError?: boolean }> {
    const response = await fetch(new URL(`${BASE_URL}/experiences`), {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        Authorization: `Bearer ${lapras_api_key}`,
      },
      body: JSON.stringify({
        // idをnullにすると新規作成になる。一度削除したものを戻すケースをなどでの、IDエラーを防ぐためすべて新規作成扱いとする
        experience_list: experience_list.map((e) => ({ ...e, id: null })),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  /**
   * 現在の職歴を取得
   */
  private async getCurrentExperiences(lapras_api_key: string): Promise<any[]> {
    const response = await fetch(new URL(`${BASE_URL}/experiences`), {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        Authorization: `Bearer ${lapras_api_key}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = (await response.json()) as { experience_list: any[] };
    return data.experience_list;
  }
}
