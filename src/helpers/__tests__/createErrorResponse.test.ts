import { describe, expect, it } from "vitest";
import { createErrorResponse } from "../createErrorResponse.js";

describe("createErrorResponse", () => {
  it("Errorインスタンスを渡した場合、エラーメッセージを含むレスポンスを返す", () => {
    const error = new Error("テストエラー");
    const errorMessage = "エラーが発生しました";
    const response = createErrorResponse(error, errorMessage);

    expect(response.isError).toBe(true);
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe("text");
    expect(JSON.parse(response.content[0].text)).toEqual({
      error: errorMessage,
      details: error.message,
    });
  });

  it("Error以外のオブジェクトを渡した場合、文字列に変換したdetailsを含むレスポンスを返す", () => {
    const error = { code: 404, message: "Not Found" };
    const errorMessage = "リソースが見つかりません";
    const response = createErrorResponse(error, errorMessage);

    expect(response.isError).toBe(true);
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe("text");
    expect(JSON.parse(response.content[0].text)).toEqual({
      error: errorMessage,
      details: String(error),
    });
  });

  it("プリミティブ値を渡した場合、文字列に変換したdetailsを含むレスポンスを返す", () => {
    const error = 404;
    const errorMessage = "不正なステータスコード";
    const response = createErrorResponse(error, errorMessage);

    expect(response.isError).toBe(true);
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe("text");
    expect(JSON.parse(response.content[0].text)).toEqual({
      error: errorMessage,
      details: String(error),
    });
  });
});
