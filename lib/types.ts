export interface Act {
  id: number;
  side_of_veil: "this" | "other";
  act_description: string;
  ward_name: string;
}

export interface WardStat {
  ward_name: string;
  count: number;
}

export interface AdminAct {
  id: number;
  name: string;
  email: string;
  ward_name: string;
  side_of_veil: "this" | "other";
  act_description: string;
  status: "pending" | "approved";
  created_at: string;
}

export interface ProgressCounts {
  this_side: number;
  other_side: number;
  total: number;
}

export interface SubmissionPayload {
  name: string;
  email: string;
  ward_name: string;
  side_of_veil: "this" | "other";
  act_description: string;
}

export interface SessionData {
  isAdmin?: boolean;
}
