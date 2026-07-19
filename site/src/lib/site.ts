/**
 * Central site configuration: contact details, external links, and nav.
 * Every page pulls from here so a change (new booking form, new email
 * provider, launched domain) only happens in one place.
 */

export const SITE = {
  name: 'Styled by Susanne',
  domain: 'https://styledbysusanne.com',
  tagline:
    'Personal style that makes getting dressed effortless, and makes who you are unmistakable.',
  description:
    'High-touch wardrobe strategy for Chicago and virtual clients. Closet edits, occasion styling, and ongoing support delivered with warmth, intention, and a little playful color.',
  location: 'Lincoln Park, Chicago',
  serviceArea: 'Chicago + virtual everywhere',
  email: '[removed]',
  phone: '[removed]',
  phoneHref: '[removed]',
  instagram: 'https://www.instagram.com/styled.by.susanne/',
  instagramHandle: '@styled.by.susanne',
} as const;

/**
 * Booking currently runs through Susanne's Google Form (the same link used
 * in the Instagram bio). When a dedicated scheduler (e.g. Calendly/Acuity)
 * replaces it, update this one constant.
 */
export const BOOKING_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe1j5IgJc4ijKbDBEsAQ7E-uDCSwxtz03nG2ZQc_UkaDgx3Yg/viewform';

/**
 * Email capture provider form action. Leave empty until an email platform
 * (Shopify Email, Buttondown, Mailchimp…) is connected, the EmailCapture
 * component renders an Instagram/email fallback while this is empty.
 */
export const EMAIL_SIGNUP_ACTION = '';

export const NAV = [
  { label: 'Work With Me', href: '/services' },
  { label: 'Shop the Looks', href: '/looks' },
  { label: 'About', href: '/about' },
  { label: 'Style Notes', href: '/style-notes' },
  { label: 'FAQ', href: '/faq' },
] as const;

export const ANNOUNCEMENT =
  'Chicago + virtual styling · Start with a complimentary style conversation';

/** Default page metadata fallbacks. */
export const DEFAULT_OG_IMAGE = '/og-default.jpg';
