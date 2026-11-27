
export interface OrderDetails {
  subtotal: number;
  shipping: number;
  pickup: number;
  taxes: number;
  returnsProtection: number;
  totalItems: number;
}

export interface CheckoutSettings {
  showTaxes: boolean;
  freeShipping: boolean;
  storeName: string;
  themeColor: string;
  layout: 'single-step' | 'multi-step';
  multiShippingAddress: boolean;
  multiShippingMethod: boolean;
  customerStatus: 'logged-out' | 'logged-in';
  selectedTemplate: string;
}

export type ActiveFeatures = Record<string, boolean>;
