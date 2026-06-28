import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { getCountryById } from "@/services/country.service";
import { countryIdParamSchema } from "@/validation/country.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandling<RouteContext>(async (_req, { params }) => {
  const { id } = countryIdParamSchema.parse(await params);
  const country = await getCountryById(id);
  return apiSuccess(country);
});
