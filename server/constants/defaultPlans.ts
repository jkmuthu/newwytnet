// Default pricing plans for all apps
// These plans are automatically created when a new app is added to the registry

export interface DefaultPlanTemplate {
  planBatch: string;
  planName: string;
  description: string;
  basePrice: string;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  pricingTypes: {
    type: 'free' | 'one_output' | 'onetime' | 'monthly' | 'yearly' | 'trial';
    price: string;
    billingInterval: string;
    trialDays: number;
  }[];
}

export const DEFAULT_PLANS: DefaultPlanTemplate[] = [
  {
    planBatch: 'Free',
    planName: 'Free Plan',
    description: 'Basic features for getting started',
    basePrice: '0',
    currency: 'INR',
    isActive: true, // Free plan enabled by default
    isFeatured: false,
    sortOrder: 1,
    pricingTypes: [
      {
        type: 'free',
        price: '0',
        billingInterval: '',
        trialDays: 0,
      },
    ],
  },
  {
    planBatch: 'Per Out',
    planName: 'Per Output Plan',
    description: 'Pay per output generated',
    basePrice: '99',
    currency: 'INR',
    isActive: false,
    isFeatured: false,
    sortOrder: 2,
    pricingTypes: [
      {
        type: 'one_output',
        price: '99',
        billingInterval: '',
        trialDays: 0,
      },
    ],
  },
  {
    planBatch: 'Plus',
    planName: 'Plus Plan',
    description: 'Enhanced features for growing needs',
    basePrice: '499',
    currency: 'INR',
    isActive: false,
    isFeatured: false,
    sortOrder: 3,
    pricingTypes: [
      {
        type: 'monthly',
        price: '499',
        billingInterval: 'month',
        trialDays: 0,
      },
      {
        type: 'yearly',
        price: '4999',
        billingInterval: 'year',
        trialDays: 0,
      },
    ],
  },
  {
    planBatch: 'Pro',
    planName: 'Pro Plan',
    description: 'Professional features for power users',
    basePrice: '999',
    currency: 'INR',
    isActive: false,
    isFeatured: true,
    sortOrder: 4,
    pricingTypes: [
      {
        type: 'monthly',
        price: '999',
        billingInterval: 'month',
        trialDays: 0,
      },
      {
        type: 'yearly',
        price: '9999',
        billingInterval: 'year',
        trialDays: 0,
      },
    ],
  },
  {
    planBatch: 'Prime',
    planName: 'Prime Plan',
    description: 'Premium features with priority support',
    basePrice: '1999',
    currency: 'INR',
    isActive: false,
    isFeatured: false,
    sortOrder: 5,
    pricingTypes: [
      {
        type: 'monthly',
        price: '1999',
        billingInterval: 'month',
        trialDays: 0,
      },
      {
        type: 'yearly',
        price: '19999',
        billingInterval: 'year',
        trialDays: 0,
      },
    ],
  },
];
