export type LeadStatus =
  | "New Lead"
  | "Contacted"
  | "Evaluation Scheduled"
  | "Proposal Sent"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export type ProposalStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected";
export type ContractStatus = "pending" | "signed" | "expired";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number | null;
  goal: string;
  source: string;
  status: LeadStatus;
  tags: string[];
  notes: string;
  next_follow_up: string | null;
  estimated_value: number | null;
  created_at: string;
};

export type Proposal = {
  id: string;
  title: string;
  lead_id: string;
  status: ProposalStatus;
  price: number;
  plan: string;
  frequency: string;
  duration_weeks: number;
  token: string;
  created_at: string;
};

export type Contract = {
  id: string;
  title: string;
  status: ContractStatus;
  expires_at: string | null;
  signed_at: string | null;
  created_at: string;
};
