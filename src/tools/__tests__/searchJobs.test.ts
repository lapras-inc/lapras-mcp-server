import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchJobsTool } from "../searchJobs.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("SearchJobsTool", () => {
  let tool: SearchJobsTool;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    tool = new SearchJobsTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("基本的なパラメータで正常にAPIリクエストを実行できる", async () => {
    const mockData = {
      job_descriptions: [
        {
          job_description_id: 123,
          company_id: 456,
          title: "Software Engineer",
          created_at: 1234567890,
          updated_at: 1234567890,
          company: {
            name: "LAPRAS Inc.",
          },
          work_location_prefecture: ["Tokyo"],
          url: "https://example.com/job/123",
        },
      ],
      total_count: 10,
      current_page: 1,
      per_page: 20,
      total_pages: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await tool.execute({ keyword: "engineer" } as any);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual(mockData);

    const callUrl = mockFetch.mock.calls[0][0].toString();
    expect(callUrl).toContain(
      "https://lapras.com/api/mcp/job_descriptions/search?keyword=engineer",
    );
  });

  it("複数のパラメータを使用して正常にAPIリクエストを実行できる", async () => {
    const mockData = {
      job_descriptions: [
        {
          job_description_id: 456,
          company_id: 789,
          title: "Frontend Engineer",
          created_at: 1234567890,
          updated_at: 1234567890,
          company: {
            name: "LAPRAS Inc.",
          },
          work_location_prefecture: ["Tokyo"],
          url: "https://example.com/job/456",
        },
      ],
      total_count: 5,
      current_page: 1,
      per_page: 20,
      total_pages: 1,
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
    expect(JSON.parse(result.content[0].text)).toEqual(mockData);

    const fetchCall = mockFetch.mock.calls[0][0].toString();
    expect(fetchCall).toContain("keyword=frontend");
    expect(fetchCall).toContain("page=1");
    expect(fetchCall).toContain("positions%5B%5D=FRONTEND_ENGINEER");
    expect(fetchCall).toContain("prog_lang_ids%5B%5D=3");
    expect(fetchCall).toContain("annual_salary_min=6000000");
    expect(fetchCall).toContain("sort_type=popularity_desc");
  });

  it("すべての配列パラメータを正しく処理できる", async () => {
    const mockData = {
      job_descriptions: [
        {
          job_description_id: 789,
          company_id: 101,
          title: "Full Stack Engineer",
          created_at: 1234567890,
          updated_at: 1234567890,
          company: {
            name: "LAPRAS Inc.",
          },
          work_location_prefecture: ["Tokyo"],
          url: "https://example.com/job/789",
        },
      ],
      total_count: 3,
      current_page: 1,
      per_page: 20,
      total_pages: 1,
    };
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
    expect(JSON.parse(result.content[0].text)).toEqual(mockData);

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

  it("APIレスポンスが正しくバリデーションされ、画像URLが除外される", async () => {
    const mockApiResponse = {
      job_descriptions: [
        {
          job_description_id: 123,
          company_id: 456,
          title: "エンジニア募集",
          created_at: 1234567890,
          updated_at: 1234567890,
          service_image_url: "https://example.com/image.jpg",
          service_image_thumbnail_url: "https://example.com/thumbnail.jpg",
          company: {
            name: "LAPRAS Inc.",
            logo_image_url: "https://example.com/logo.jpg",
          },
          work_location_prefecture: ["東京都"],
          position_name: "バックエンドエンジニア",
          tags: [{ name: "Python" }],
          employment_type: "正社員",
          salary_min: 5000000,
          salary_max: 8000000,
          salary_type: 1,
          preferred_condition_names: ["フレックス"],
          business_type_names: ["自社開発"],
          work_style_names: ["フルリモート"],
          url: "https://example.com/job/123",
        },
      ],
      total_count: 1,
      current_page: 1,
      per_page: 20,
      total_pages: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await tool.execute({} as any);

    expect(result.isError).toBeUndefined();
    const parsedContent = JSON.parse(result.content[0].text);

    // 画像URLが除外されていることを確認
    expect(parsedContent.job_descriptions[0].service_image_url).toBeUndefined();
    expect(parsedContent.job_descriptions[0].service_image_thumbnail_url).toBeUndefined();
    expect(parsedContent.job_descriptions[0].company.logo_image_url).toBeUndefined();

    // 必須フィールドが存在することを確認
    expect(parsedContent.job_descriptions[0].job_description_id).toBe(123);
    expect(parsedContent.job_descriptions[0].title).toBe("エンジニア募集");
    expect(parsedContent.job_descriptions[0].company.name).toBe("LAPRAS Inc.");
  });

  it("不正なAPIレスポンスの場合はエラーを返す", async () => {
    const invalidApiResponse = {
      job_descriptions: [
        {
          // job_description_idが欠けている
          title: "エンジニア募集",
          company: {
            name: "LAPRAS Inc.",
          },
        },
      ],
      // total_countが欠けている
      current_page: 1,
      per_page: 20,
      total_pages: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(invalidApiResponse),
    });

    const result = await tool.execute({} as any);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("求人情報の取得に失敗しました");
  });
});
