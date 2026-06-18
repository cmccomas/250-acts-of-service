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
  "Generator",
  "Hand tools",
  "Water / hoses",
] as const;

export const AVAILABILITY_OPTIONS = [
  "Right now / today",
  "Within a few days",
  "Weekends only",
  "Flexible, contact me to coordinate",
] as const;

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
