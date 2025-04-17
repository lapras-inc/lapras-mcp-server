import { describe, expect, it } from "vitest";
import { unescapeText } from "../textFormatter.js";

describe("unescapeText", () => {
  it("エスケープされた改行文字を実際の改行に変換する", () => {
    const input = "Line 1\\nLine 2\\nLine 3";
    const expected = "Line 1\nLine 2\nLine 3";
    expect(unescapeText(input)).toBe(expected);
  });

  it("通常の文字列はそのまま返す", () => {
    const input = "Normal text without escapes";
    expect(unescapeText(input)).toBe(input);
  });

  it("undefinedの場合は空文字列を返す", () => {
    expect(unescapeText(undefined)).toBe("");
  });

  it("nullの場合は空文字列を返す", () => {
    expect(unescapeText(null)).toBe("");
  });

  it("複数の連続した改行文字を正しく変換する", () => {
    const input = "Line 1\\n\\nLine 3";
    const expected = "Line 1\n\nLine 3";
    expect(unescapeText(input)).toBe(expected);
  });

  it("タブ文字を正しく変換する", () => {
    const input = "Column1\\tColumn2\\tColumn3";
    const expected = "Column1\tColumn2\tColumn3";
    expect(unescapeText(input)).toBe(expected);
  });

  it("改行とタブを組み合わせて正しく変換する", () => {
    const input = "Title\\nColumn1\\tColumn2\\tColumn3\\nData1\\tData2";
    const expected = "Title\nColumn1\tColumn2\tColumn3\nData1\tData2";
    expect(unescapeText(input)).toBe(expected);
  });
});
