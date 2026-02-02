export const PLANS = {
  free: {
    name: "Básico",
    maxFamiliares: 1,
    maxViewers: 0,
    alertChannels: ["push"] as const,
    geoLocation: false,
    photoVerification: false,
    customAvatar: false,
    smsAlerts: false,
    emailAlerts: false,
    prioritySupport: false,
    price: 0,
  },
  premium: {
    name: "Premium",
    maxFamiliares: 5,
    maxViewers: 3,
    alertChannels: ["push", "sms", "email"] as const,
    geoLocation: true,
    photoVerification: true,
    customAvatar: true,
    smsAlerts: true,
    emailAlerts: true,
    prioritySupport: true,
    price: 499, // cents = €4.99/month
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function canUseFeature(plan: PlanType, feature: keyof typeof PLANS.premium): boolean {
  return !!PLANS[plan][feature];
}
