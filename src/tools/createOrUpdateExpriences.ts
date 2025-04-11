import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import { z } from "zod";
import { BASE_URL } from "../constants.js";
import { createErrorResponse } from "../helpers/createErrorResponse.js";
import type { IMCPTool, InferZodParams } from "../types.js";

/**
 * 職歴新規追加・更新ツール
 */
export class CreateOrUpdateExpriencesTool implements IMCPTool {
  /**
   * Tool name
   */
  readonly name = "create_or_update_work_experiences";

  /**
   * Tool description
   */
  readonly description =
    "Create or update work experiences on LAPRAS(https://lapras.com). This API does not perform differential updates. You need to send all work experience information, not just the ones you want to update. Before executing this API, please make sure to run the get_experiences tool to backup your current work experience data.";

  /**
   * Parameter definition
   */
  readonly parameters = {
    experience_list: z
      .array(
        z.object({
          id: z
            .number()
            .nullable()
            .describe("ID of the experience - specify to update, null to create new experience"),
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
  } as const;

  /**
   * Execute function
   */
  async execute(args: InferZodParams<typeof this.parameters>): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const { experience_list } = args;
    if (!experience_list) {
      return createErrorResponse(new Error("experience_list is required"), "職歴リストが必要です");
    }
    const lapras_api_key = process.env.LAPRAS_API_KEY?.trim();
    if (!lapras_api_key) {
      return createErrorResponse(
        new Error("LAPRAS_API_KEY is required"),
        "LAPRAS_API_KEYの設定が必要です。https://lapras.com/config/api-key から取得してmcp.jsonに設定してください。",
      );
    }

    try {
      const url = new URL(`${BASE_URL}/experiences`);
      const response = await fetch(url, {
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${lapras_api_key}`,
        },
        body: JSON.stringify({ experience_list }),
        method: "POST",
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
      return createErrorResponse(error, "職歴の新規追加・更新に失敗しました");
    }
  }
}
