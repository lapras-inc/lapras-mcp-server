import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";

/**
 * Zodスキーマから型を抽出するユーティリティ型
 */
export type InferZodParams<T extends Record<string, z.ZodType>> = {
  [K in keyof T]: z.infer<T[K]>;
};

export interface IMCPTool<TParams extends Record<string, z.ZodType> = Record<string, z.ZodType>> {
  /**
   * ツール名
   */
  readonly name: string;

  /**
   * ツールの説明
   */
  readonly description: string;

  /**
   * パラメータの定義
   */
  readonly parameters: TParams;

  /**
   * ツールを実行する
   * @param args パラメータ
   * @returns 実行結果
   */
  execute(args: InferZodParams<TParams>): Promise<{
    content: TextContent[];
    isError?: boolean;
  }>;
}
