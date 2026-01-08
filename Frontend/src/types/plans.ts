interface PlanFeature {
  [key: string]: string | number | boolean;
}

interface PlanType {
  plan_type_id: number;
  plan_type: string;
  price: string | number;
  description: string;
  features: PlanFeature;
  is_active: boolean;
  is_most_popular: boolean;
  order: number;
  is_free: boolean;
  is_price_under_review: boolean;
}

interface UsageMetric {
  used: number;
  limit: number;
  percentage: number;
}

interface PlanData {
  has_plan: boolean;
  plan_details?: {
    id: number;
    name: string;
    status: string;
    status_color: string;
    next_due_date: string | null;
    payment_link: string | null;
  };
  usage?: {
    enterprises: UsageMetric;
    sectors: UsageMetric;
  };
}

export type { PlanType, PlanData, UsageMetric };