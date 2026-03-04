/**
 * Landing Page configuration API service.
 */

import { apiClient } from "@/lib/apiClient";

type SectionsConfig = Record<string, { visible: boolean; order: number }>;

interface LandingConfig {
  sections: SectionsConfig;
}

const DEFAULT_CONFIG: LandingConfig = {
  sections: {
    hero: { visible: true, order: 0 },
    preview: { visible: true, order: 1 },
    features: { visible: true, order: 2 },
    "import-showcase": { visible: true, order: 3 },
    "ai-showcase": { visible: true, order: 4 },
    "multichannel-showcase": { visible: true, order: 5 },
    integrations: { visible: true, order: 6 },
    testimonials: { visible: true, order: 7 },
    cta: { visible: true, order: 8 },
    footer: { visible: true, order: 9 },
  },
};

export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    return await apiClient<LandingConfig>("/admin/landing-config/");
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function updateLandingConfig(
  data: { sections: SectionsConfig },
): Promise<LandingConfig> {
  return apiClient<LandingConfig>("/admin/landing-config/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
