export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-L2B326LE04';

// Track custom GA4 events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    GA_MEASUREMENT_ID
  ) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Global TypeScript typings declarations for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}
