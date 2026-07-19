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
    'High-touch wardrobe strategy for Chicago and virtual clients. Closet edits, occasion styling, and ongoing support delivered with warmth and intention.',
  location: 'Lincoln Park, Chicago',
  serviceArea: 'Chicago + virtual everywhere',
  instagram: 'https://www.instagram.com/styled.by.susanne/',
  instagramHandle: '@styled.by.susanne',
} as const;

/**
 * The site's themed contact form posts directly to a hidden Google Form
 * ("Styled by Susanne · Style Inquiry"). Responses collect in Google Forms;
 * the visitor never sees Google's UI. If the form is ever recreated, update
 * the action URL and the entry IDs together (extract them from the new
 * form's public viewform HTML).
 */
export const INQUIRY_FORM = {
  action:
    'https://docs.google.com/forms/d/e/1FAIpQLSeeEBehn2YiouVbQdtHZsd6IoJ31n1u-jpNOVxIQi2Ki0HRjQ/formResponse',
  fields: {
    name: 'entry.741835830',
    email: 'entry.391311185',
    instagram: 'entry.303079961',
    reason: 'entry.884233403',
    message: 'entry.179219131',
    location: 'entry.1221836998',
  },
  /** Must match the Google Form's multiple-choice options exactly. */
  reasons: [
    'Reset my whole wardrobe',
    'Style a moment: an event or trip',
    'Ongoing styling support',
    'A gift for someone',
    'Just a question',
  ],
} as const;

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
