
import { z } from "zod";

const positionSchema = z.object({
  id: z.number().describe("Position type ID"),
});

const experienceFields = {
  organization_name: z.string().describe("Name of the organization"),
  positions: z.array(positionSchema).describe(
    "List of position type IDs - multiple selections are allowed.",
  ),
  position_name: z.string().default("").describe("Position title"),
  is_client_work: z.boolean().describe("Whether this is client work"),
  client_company_name: z.string().optional().describe("Client company name"),
  start_year: z.number().describe("Start year"),
  start_month: z.number().describe("Start month"),
  end_year: z.number().describe("End year (0 if ongoing)"),
  end_month: z.number().describe("End month (0 if ongoing)"),
  description: z.string().default("").describe(
    "Detailed description of the experience (Markdown format)",
  ),
} as const;

const createExperienceParams = experienceFields;

const updateExperienceParams = {
  experience_id: z.number().describe("ID of the experience to update"),
  ...experienceFields,
} as const;


export { experienceFields, createExperienceParams, updateExperienceParams }
