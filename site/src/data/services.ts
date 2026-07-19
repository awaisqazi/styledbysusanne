/**
 * Service catalog, organized by client need per the site strategy:
 * lead with three decisions, not six equal packages.
 *
 * Pricing mirrors the published Instagram services menu. Final quotes are
 * confirmed during the complimentary style conversation.
 */

export interface Service {
  id: string;
  name: string;
  tagline: string;
  description: string;
  duration: string;
  price: string;
  includes: string[];
  bestFor: string;
}

export interface ServiceFamily {
  slug: string;
  name: string;
  /** Shorter name for links/breadcrumbs. */
  shortName?: string;
  /** The client statement this family answers, shown as a quote. */
  need: string;
  /** One-line promise. */
  promise: string;
  blurb: string;
  recommendedStart: string;
  services: Service[];
}

export const FAMILIES: ServiceFamily[] = [
  {
    slug: 'reset-my-wardrobe',
    name: 'Reset My Wardrobe',
    shortName: 'Wardrobe Resets',
    need: 'My closet is full, but nothing feels right.',
    promise: 'Clarity on what belongs, what goes, and what is missing.',
    blurb:
      'For the season of life where your style has to catch up with who you have become. We edit what you own, name what is missing, and rebuild a closet that works on autopilot.',
    recommendedStart: 'taste-test',
    services: [
      {
        id: 'taste-test',
        name: 'The Taste Test',
        tagline: 'A focused first edit, and the easiest way to try working together.',
        description:
          'We tackle two specific closet areas (think shoes and tops, or workwear and weekend) so I can learn your style preferences and you can feel the difference a trained eye makes.',
        duration: '2 hours, in your closet',
        price: '$250–$350',
        includes: [
          'Two closet areas, fully edited',
          'A read on your style preferences and lifestyle',
          'Quick-win outfit pairings from what you already own',
          'A short list of smart next moves',
        ],
        bestFor: 'First-time clients who want a low-commitment starting point.',
      },
      {
        id: 'deep-detox',
        name: 'The Deep Detox',
        tagline: 'The full closet audit: keep, donate, and see the gaps.',
        description:
          'Every piece you own, considered with intention. We build keep and donate piles together, identify exactly what your wardrobe is missing, and leave your closet lighter and legible.',
        duration: '4 hours, in your closet',
        price: '$500–$750',
        includes: [
          'Full closet audit, piece by piece',
          'Keep / donate decisions made together: no guilt, no second-guessing',
          'Wardrobe gap identification',
          'A closet organized so getting dressed is fast',
        ],
        bestFor: 'A style chapter change: new role, new body, new city, new you.',
      },
      {
        id: 'seasonal-pivot',
        name: 'The Seasonal Pivot',
        tagline: 'A twice-a-year refresh that keeps your closet current.',
        description:
          'Every six months we rotate the season in, retire what is done, and refresh your go-to outfits, so the closet never drifts back into chaos.',
        duration: '4 hours, twice a year',
        price: '$400–$650',
        includes: [
          'Spring/summer or fall/winter rotation',
          'Re-edit of the incoming season’s pieces',
          'Updated outfit combinations for the months ahead',
          'A refreshed gap list before you shop the season',
        ],
        bestFor: 'Past clients and anyone who wants maintenance, not another overhaul.',
      },
    ],
  },
  {
    slug: 'style-a-moment',
    name: 'Style a Moment',
    shortName: 'Moment Styling',
    need: 'I have a big moment coming, and I want the decision made well.',
    promise: 'The outfit question, answered: for trips, events, and milestones.',
    blurb:
      'A wedding, a conference, a vacation, a family photo. When the calendar has a date on it, we make sure what you wear is one decision you never have to worry about.',
    recommendedStart: 'occasion-edit',
    services: [
      {
        id: 'occasion-edit',
        name: 'The Occasion Edit',
        tagline: 'Personal styling for the day that matters.',
        description:
          'We define the moment, the mood, and the dress code, then build the full look (outfit, shoes, accessories) from your closet, smart new pieces, or both.',
        duration: 'Per project',
        price: 'From $200',
        includes: [
          'A styling consult around your event and its dress code',
          'Complete look built head to toe',
          'Sourcing links or shopping support as needed',
          'A backup plan, because weather exists',
        ],
        bestFor: 'Weddings, galas, milestone birthdays, interviews, photo shoots.',
      },
      {
        id: 'suitcase-solo',
        name: 'The Suitcase Solo',
        tagline: 'Every travel day styled before you zip the bag.',
        description:
          'Packing for a multi-day trip without the overpacking spiral: we plan each day’s looks, photograph them, and archive everything so getting dressed on the road takes seconds.',
        duration: 'Per project',
        price: 'From $200',
        includes: [
          'Day-by-day outfit plan for the full trip',
          'Photographed and archived looks on your phone',
          'A pack list that fits in the suitcase you actually own',
          'Mix-and-match backups for plan changes',
        ],
        bestFor: 'Work trips, European carry-on missions, beach weeks, city weekends.',
      },
    ],
  },
  {
    slug: 'ongoing-styling',
    name: 'Support Me Ongoing',
    shortName: 'Ongoing Styling',
    need: 'I want polished outfits without spending hours figuring them out.',
    promise: 'A stylist in your pocket, season after season.',
    blurb:
      'Style is not a one-day project; it is a relationship with your closet. Keep me on call for outfit checks, shopping questions, and continual sourcing, or go all-in with the flagship Susanne Standard.',
    recommendedStart: 'digital-stylist',
    services: [
      {
        id: 'digital-stylist',
        name: 'The Digital Stylist',
        tagline: 'Ongoing text and video support, plus personal shopping as a service.',
        description:
          'A monthly retainer that keeps a stylist one message away: outfit checks before big days, “should I buy this?” verdicts, and curated links sourced for your life and budget.',
        duration: 'Monthly retainer',
        price: '$150–$300/mo',
        includes: [
          'Text and video styling support',
          'Continual personal shopping and sourcing',
          'Outfit feedback when you need a second eye',
          'Seasonal nudges so your closet stays ahead',
        ],
        bestFor: 'Virtual clients anywhere, and alumni of any in-closet service.',
      },
      {
        id: 'susanne-standard',
        name: 'The Susanne Standard',
        tagline: 'The flagship, full-circle wardrobe transformation.',
        description:
          'The complete method: style conversation, full closet edit, donation removal, curated investment list, sourcing, look sessions, and a digital wardrobe you can open every morning.',
        duration: 'Multi-session engagement',
        price: 'By proposal',
        includes: [
          'Everything in the seven-step Susanne Standard method',
          'Donation removal: an instant, guilt-free reset',
          'A photographed, app-based digital style library',
          '30 days of follow-up support',
        ],
        bestFor: 'The full transformation, currently onboarding a small number of clients.',
      },
    ],
  },
];

/** The seven-step method, per the Instagram "Susanne Standard" carousel. */
export interface StandardStep {
  name: string;
  detail: string;
  /** The client outcome, phrased as a benefit. */
  outcome: string;
}

export const STANDARD_STEPS: StandardStep[] = [
  {
    name: 'Onboarding',
    detail:
      'A focused 30-minute style conversation to uncover your aesthetic, intentions, and what’s been holding you back.',
    outcome: 'Feel understood before a single hanger moves.',
  },
  {
    name: 'The Edit',
    detail:
      'A refined closet cleanse that clarifies what aligns, what doesn’t, and what opens space for elevated style.',
    outcome: 'Know exactly what belongs.',
  },
  {
    name: 'Signature Services',
    detail:
      'A curated suite of high-touch styling options designed around your goals and level of transformation.',
    outcome: 'A plan shaped to your life, not a package off the shelf.',
  },
  {
    name: 'The Departure',
    detail:
      'I remove every donation piece for you: an instant, guilt-free reset.',
    outcome: 'The past leaves the building. Literally.',
  },
  {
    name: 'The Curated List',
    detail:
      'A sleek, color-coded selection of strategic must-haves and elevated wants to guide intentional investment.',
    outcome: 'Shop with a purpose, never out of panic.',
  },
  {
    name: 'The Look Sessions',
    detail:
      'Once new pieces arrive, I return to craft fresh, effortless outfits that blend seamlessly with what you already love.',
    outcome: 'Real outfits, built and photographed.',
  },
  {
    name: 'Your Digital Style Library',
    detail:
      'Your wardrobe is photographed and uploaded into minimalist, premium apps: a streamlined archive that reduces decision fatigue.',
    outcome: 'Open your phone and see ready-to-wear outfits.',
  },
];

export function getFamily(slug: string): ServiceFamily | undefined {
  return FAMILIES.find((f) => f.slug === slug);
}

export function getAllServices(): Service[] {
  return FAMILIES.flatMap((f) => f.services);
}
