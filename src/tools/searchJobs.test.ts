import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchJobsTool } from "./searchJobs.js";

describe("SearchJobsTool", () => {
  let tool: SearchJobsTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    tool = new SearchJobsTool();
    originalFetch = global.fetch;
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it("基本的なパラメータで正常にAPIリクエストを実行できる", async () => {
    const mockData = {
      total: 10,
      current_page: 1,
      jobs: [
        {
          id: "123",
          title: "Software Engineer",
          company_name: "LAPRAS Inc.",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await tool.execute({ keyword: "engineer" } as any);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));

    const callUrl = mockFetch.mock.calls[0][0].toString();
    expect(callUrl).toContain(
      "https://lapras.com/api/mcp/job_descriptions/search?keyword=engineer",
    );
  });

  it("複数のパラメータを使用して正常にAPIリクエストを実行できる", async () => {
    const mockData = {
      total: 5,
      current_page: 1,
      jobs: [
        {
          id: "456",
          title: "Frontend Engineer",
          company_name: "LAPRAS Inc.",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const params = {
      keyword: "frontend",
      page: 1,
      positions: ["FRONTEND_ENGINEER"],
      prog_lang_ids: [3], // TypeScript
      annual_salary_min: 6000000,
      sort_type: "popularity_desc",
    };

    const result = await tool.execute(params as any);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));

    const fetchCall = mockFetch.mock.calls[0][0].toString();
    expect(fetchCall).toContain("keyword=frontend");
    expect(fetchCall).toContain("page=1");
    expect(fetchCall).toContain("positions%5B%5D=FRONTEND_ENGINEER");
    expect(fetchCall).toContain("prog_lang_ids%5B%5D=3");
    expect(fetchCall).toContain("annual_salary_min=6000000");
    expect(fetchCall).toContain("sort_type=popularity_desc");
  });

  it("すべての配列パラメータを正しく処理できる", async () => {
    const mockData = { total: 3, jobs: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const params = {
      positions: ["FRONTEND_ENGINEER", "BACKEND_ENGINEER"],
      prog_lang_ids: [3, 39], // TypeScript, JavaScript
      framework_ids: [4, 1428], // Vue.js, React
      db_ids: [28, 10], // MySQL, PostgreSQL
      infra_ids: [15, 52], // AWS, GCP
      business_types: [1, 2], // 自社開発, 受託開発
      employment_types: [1], // 正社員
      work_styles: [1, 2], // フルリモート, 一部リモート
      preferred_condition_ids: [1, 3], // 副業OK, SOあり
    };

    const result = await tool.execute(params as any);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));

    const fetchCall = mockFetch.mock.calls[0][0].toString();
    expect(fetchCall).toContain("positions%5B%5D=FRONTEND_ENGINEER");
    expect(fetchCall).toContain("positions%5B%5D=BACKEND_ENGINEER");
    expect(fetchCall).toContain("prog_lang_ids%5B%5D=3");
    expect(fetchCall).toContain("prog_lang_ids%5B%5D=39");
    expect(fetchCall).toContain("framework_ids%5B%5D=4");
    expect(fetchCall).toContain("framework_ids%5B%5D=1428");
    expect(fetchCall).toContain("db_ids%5B%5D=28");
    expect(fetchCall).toContain("db_ids%5B%5D=10");
    expect(fetchCall).toContain("infra_ids%5B%5D=15");
    expect(fetchCall).toContain("infra_ids%5B%5D=52");
    expect(fetchCall).toContain("business_types%5B%5D=1");
    expect(fetchCall).toContain("business_types%5B%5D=2");
    expect(fetchCall).toContain("employment_types%5B%5D=1");
    expect(fetchCall).toContain("work_styles%5B%5D=1");
    expect(fetchCall).toContain("work_styles%5B%5D=2");
    expect(fetchCall).toContain("preferred_condition_ids%5B%5D=1");
    expect(fetchCall).toContain("preferred_condition_ids%5B%5D=3");
  });

  it("APIリクエストが失敗した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    });

    const result = await tool.execute({ keyword: "engineer" } as any);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("求人情報の取得に失敗しました");

    console.error = originalConsoleError;
  });

  it("ネットワークエラーが発生した場合は適切にエラーハンドリングする", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const result = await tool.execute({ keyword: "engineer" } as any);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("求人情報の取得に失敗しました");

    console.error = originalConsoleError;
  });
});
