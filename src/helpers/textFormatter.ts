/**
 * エスケープされた文字列を実際の文字に変換します
 * @see https://github.com/lapras-inc/lapras-mcp-server/issues/5
 */
export function unescapeText(text: string | undefined | null): string {
  if (!text) return "";

  // エスケープされた改行文字とタブ文字を実際の文字に変換
  return text
    .replace(/\\n/g, "\n") // 改行
    .replace(/\\t/g, "\t"); // タブ
}
