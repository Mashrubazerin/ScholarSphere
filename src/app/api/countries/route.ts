import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { listCountries } from "@/services/country.service";
import { listCountriesQuerySchema } from "@/validation/country.schema";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const query = listCountriesQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  const result = await listCountries(query);
  return apiSuccess(result);
});
