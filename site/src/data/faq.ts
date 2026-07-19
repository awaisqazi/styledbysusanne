/**
 * Site-wide FAQ. Answers are HTML strings (kept simple: <p> and <a> only)
 * rendered inside FaqItem. Topics follow the strategy plan: location,
 * virtual service, budget, sizing, shopping responsibility, returns,
 * timing, privacy, and whether clients need new clothing.
 */

export interface Faq {
  question: string;
  answer: string;
  /** Show on the homepage teaser. */
  featured?: boolean;
}

export const FAQS: Faq[] = [
  {
    question: 'Where are you based, and do I have to be in Chicago?',
    answer:
      '<p>I’m based in Lincoln Park, Chicago, and work in closets across the city and nearby suburbs. Not local? The Digital Stylist retainer, virtual sessions, and trip or occasion styling all work beautifully over video and text; distance has never stopped a good outfit.</p>',
    featured: true,
  },
  {
    question: 'Do I need a big clothing budget to work with you?',
    answer:
      '<p>No. Most engagements start by making what you already own work harder; the majority of “new outfits” come out of your existing closet. When we do shop, your clothing budget is separate from my service fee, you set it, and I respect it. I’m just as happy sourcing from Amazon as from a boutique.</p>',
    featured: true,
  },
  {
    question: 'Will you make me get rid of everything?',
    answer:
      '<p>Never. Every keep-or-donate decision is made together, and “it makes me happy” is a perfectly valid reason to keep something. My job is to clear the noise so the pieces you love actually get worn. And with the Departure step, I take donation pieces away for you so the reset is instant and guilt-free.</p>',
    featured: true,
  },
  {
    question: 'What happens in the style conversation?',
    answer:
      '<p>It’s a complimentary, no-pressure 30-minute chat: about your lifestyle, what’s working, what isn’t, and what you want your style to say. From there I’ll recommend the service that actually fits your situation (sometimes that’s the smallest one). No prep needed; messy closets are the point.</p>',
  },
  {
    question: 'Do I have to buy new clothes?',
    answer:
      '<p>Not unless something is genuinely missing. When there are gaps, you get a color-coded curated list of strategic must-haves and elevated wants; you choose what to invest in, on your timeline. My fee never depends on how much you spend, and any commissionable links are always disclosed.</p>',
  },
  {
    question: 'How does pricing work?',
    answer:
      '<p>Published ranges cover the typical scope of each service; your exact quote is confirmed after the style conversation, before anything is booked. Travel terms for your location are part of that same conversation, agreed up front before anything is booked.</p>',
  },
  {
    question: 'What sizes and styles do you work with?',
    answer:
      '<p>All of them. Every body, every age, every aesthetic. My work is aligning your outsides with <em>your</em> identity, not imposing mine. You’ll never be talked into trends that don’t feel like you.</p>',
  },
  {
    question: 'What about returns and things that don’t work out?',
    answer:
      '<p>Anything sourced for you is chosen with return windows in mind, and Look Sessions happen after pieces arrive precisely so we can send back what doesn’t earn its place. Purchases stay in your accounts and your control at all times.</p>',
  },
  {
    question: 'Is my closet (and everything in it) kept private?',
    answer:
      '<p>Completely. What happens in your closet stays there. Client photos, before/afters, and stories are only ever shared with written permission, and most never are.</p>',
  },
  {
    question: 'How do the shopping links on this site work?',
    answer:
      '<p>Some product links in <a href="/looks">Shop the Looks</a> are affiliate links, which means I may earn a small commission if you buy through them, at no extra cost to you. It’s how the free styling content stays free, and I only ever link pieces I’d put in a client’s cart. Details in the <a href="/policies/affiliate-disclosure">affiliate disclosure</a>.</p>',
  },
];
