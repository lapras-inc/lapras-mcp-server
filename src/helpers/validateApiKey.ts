import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import { createErrorResponse } from "./createErrorResponse.js";

/**
 * APIキーの検証を行う関数
 * @returns 有効なAPIキーがある場合はAPIキーを、ない場合はエラーレスポンスを返す
 */
export function validateApiKey():
  | { apiKey: string; isInvalid: false }
  | {
      errorResopnse: ReturnType<typeof createErrorResponse>;
      isInvalid: true;
    } {
  const lapras_api_key = process.env.LAPRAS_API_KEY?.trim();
  if (!lapras_api_key) {
    return {
      errorResopnse: createErrorResponse(
        new Error("LAPRAS_API_KEY is required"),
        "LAPRAS_API_KEYの設定が必要です。https://lapras.com/config/api-key から取得してmcp.jsonに設定してください。",
      ),
      isInvalid: true,
    };
  }
  return { apiKey: lapras_api_key, isInvalid: false };
}
