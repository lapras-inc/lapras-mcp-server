import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GetJobDetailTool } from "./getJobDetail.js";

describe("GetJobDetailTool", () => {
  let tool: GetJobDetailTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    tool = new GetJobDetailTool();
    originalFetch = global.fetch;
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it("jobIdが空の場合はエラーを返す", async () => {
    const result = await tool.execute({ jobId: "" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("求人IDが必要です");
  });

  it("APIリクエストが失敗した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    });

    const result = await tool.execute({ jobId: "123" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("求人詳細の取得に失敗しました");
    expect(console.error).toHaveBeenCalled();

    console.error = originalConsoleError;
  });

  it("正常なレスポンスを適切に処理できる", async () => {
    const mockData = {
      job_description_id: "123",
      job_description: {
        title: "Software Engineer",
        company_name: "LAPRAS Inc.",
        description: "Job description here",
      },
      company: {
        name: "LAPRAS Inc.",
        logo_image_url: "https://example.com/logo.png",
      },
      images: ["image1.jpg", "image2.jpg"],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await tool.execute({ jobId: "123" });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));

    expect(mockFetch).toHaveBeenCalledWith("https://lapras.com/api/mcp/job_descriptions/123");
  });

  it("ネットワークエラーが発生した場合は適切にエラーハンドリングする", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const result = await tool.execute({ jobId: "123" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("求人詳細の取得に失敗しました");
    expect(console.error).toHaveBeenCalledWith(networkError);

    console.error = originalConsoleError;
  });
});
