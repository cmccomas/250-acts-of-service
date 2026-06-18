// Shared constants for the Upriver Fire Relief resource signup feature.
// Kept separate from the existing acts-of-service code so this feature
// stays self-contained.

export const RESOURCE_OPTIONS = [
  "Ladder",
  "Power washer",
  "Chainsaw",
  "Trailer",
  "Truck",
  "Tractor",
  "Cots",
  "Bedding",
  "Outdoor cooking (flat top, grill)",
] as const;

export const AVAILABILITY_OPTIONS = ["Weekends", "Weekdays", "Evenings"] as const;

// Shape of a row in the resource_offers table.
export interface ResourceOffer {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  availability: string | null;
  resources: string[] | null;
  other_resources: string | null;
  notes: string | null;
}
