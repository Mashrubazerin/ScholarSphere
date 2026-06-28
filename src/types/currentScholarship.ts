/** Mirrors the GET /api/scholarships/current response shape. */
export interface CurrentScholarship {
  id: string;
  title: string;
  hostCountry: string;
  hostCountryFlag: string;
  university: string | null;
  degreeLevels: string[];
  category: string | null;
  eligibleCountries: string[];
  fundingType: string;
  fundingAmount: string | null;
  benefits: string[];
  applicationOpen: boolean;
  /** ISO 8601, or null if no deadline was published (rolling admission). */
  deadline: string | null;
  applicationLink: string;
  officialWebsite: string | null;
  description: string | null;
  fieldOfStudy: string | null;
  imageUrl: string | null;
  status: "OPEN" | "CLOSED" | "UPCOMING";
}
