import type { TextContent } from "@modelcontextprotocol/sdk/types.js";

/**
 * エラーレスポンスを作成するユーティリティ関数
 * @param error エラー情報
 * @param errorMessage エラーメッセージ
 */
export function createErrorResponse(
  error: unknown,
  errorMessage: string,
): {
  content: TextContent[];
  isError: boolean;
} {
  const details = error instanceof Error ? error.message : String(error);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error: errorMessage,
          details,
        }),
      },
    ],
    isError: true,
  };
}
