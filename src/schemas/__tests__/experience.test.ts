import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createExperienceParams, updateExperienceParams } from "../experience.js";

describe("experience schemas", () => {
  it("preserves the public field descriptions in both shared parameter sets", () => {
    for (const [name, schema] of Object.entries(createExperienceParams)) {
      expect(updateExperienceParams).toHaveProperty(name);
      expect(updateExperienceParams[name as keyof typeof updateExperienceParams].description).toBe(
        schema.description,
      );
    }

    expect(createExperienceParams.positions.description).toBe(
      "List of position type IDs - multiple selections are allowed. Please set relevant position types.",
    );
    const positionDescription = createExperienceParams.positions.element.shape.id.description;
    expect(positionDescription).toContain("Position type ID (1: フロントエンドエンジニア");
    expect(positionDescription).toContain("30: セールスエンジニア・プリセールス");
    expect(positionDescription).toContain("32: ITエンジニアその他");
    expect(positionDescription).toContain("100: その他)");
    expect(positionDescription).not.toContain("31:");
    expect(createExperienceParams.is_client_work.description).toBe(
      "Whether this is client work (Set to true when the affiliated company and the project client are different, such as in contract development companies)",
    );
    expect(createExperienceParams.client_company_name.description).toBe(
      "Client company name (required only when is_client_work is true)",
    );
  });

  it("keeps create and update validation behavior aligned", () => {
    const validFields = {
      organization_name: "Example Inc.",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2024,
      start_month: 1,
      end_year: 0,
      end_month: 0,
    };

    expect(createExperienceParams).not.toHaveProperty("experience_id");
    expect(updateExperienceParams).toHaveProperty("experience_id");
    expect(z.object(createExperienceParams).parse(validFields)).toEqual({
      ...validFields,
      position_name: "",
      description: "",
    });
    expect(z.object(updateExperienceParams).parse({ experience_id: 7, ...validFields })).toEqual({
      experience_id: 7,
      ...validFields,
      position_name: "",
      description: "",
    });
    expect(
      z.object(createExperienceParams).safeParse({
        ...validFields,
        positions: [{ id: "1" }],
      }).success,
    ).toBe(false);
    expect(
      z.object(createExperienceParams).safeParse({
        ...validFields,
        client_company_name: 42,
      }).success,
    ).toBe(false);
  });
});
