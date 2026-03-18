// ─────────────────────────────────────────────────────────────────────────────
// Phishing Detective — Question Bank
// Questions are tag-filtered at runtime based on the phishing attempt's template.
// ─────────────────────────────────────────────────────────────────────────────

export type QuestionTag = 'urgency' | 'bad_grammar' | 'spoofed_sender' | 'general';

export interface GameQuestion {
  id: string;
  tag: QuestionTag;
  scenario: {
    from: string;
    subject: string;
    body: string;
  };
  isPhishing: boolean;
  explanation: string;
  redFlags?: string[];
}

// ── Urgency ───────────────────────────────────────────────────────────────────

const URGENCY_QUESTIONS: GameQuestion[] = [
  {
    id: 'u-01',
    tag: 'urgency',
    scenario: {
      from: 'security-alert@accounts-google.net',
      subject: 'URGENT: Verify your account now or lose access!',
      body:
        'Your Google account has been flagged for suspicious activity. You must verify your identity within 24 hours or your account will be permanently suspended. Click the link below immediately to avoid losing access to your emails and files.',
    },
    isPhishing: true,
    explanation:
      'Legitimate services never threaten immediate permanent suspension and do not send from domains like "accounts-google.net". The real Google domain would be "@google.com".',
    redFlags: ['Suspicious domain (accounts-google.net)', 'Threatening language', 'Artificial deadline'],
  },
  {
    id: 'u-02',
    tag: 'urgency',
    scenario: {
      from: 'it-support@yourcompany.com',
      subject: 'Scheduled password rotation — action required by Friday',
      body:
        'As part of our quarterly security policy, all staff are required to update their passwords by this Friday at 5 PM. Please log in to the IT portal and follow the instructions. If you have questions, contact the helpdesk.',
    },
    isPhishing: false,
    explanation:
      'This is a legitimate IT request. It uses an internal company domain, gives a reasonable deadline, refers to a known policy, and provides a clear contact point — none of the hallmarks of phishing.',
    redFlags: [],
  },
  {
    id: 'u-03',
    tag: 'urgency',
    scenario: {
      from: 'noreply@paypa1.com',
      subject: 'Your account has been LIMITED — restore access immediately!',
      body:
        'We have noticed unusual activity on your PayPal account and have placed a limitation on it. To lift this limitation and restore full access, you must confirm your identity right now. Failure to act will result in permanent account closure.',
    },
    isPhishing: true,
    explanation:
      'The domain "paypa1.com" replaces the letter "l" with the digit "1" — a classic typosquatting trick. Combined with threatening language about "permanent closure", this is a textbook phishing attempt.',
    redFlags: ['Typosquatted domain (paypa1.com)', 'Threatening language', '"Act now" pressure'],
  },
  {
    id: 'u-04',
    tag: 'urgency',
    scenario: {
      from: 'hr@globalcorp.io',
      subject: 'All staff: Annual compliance training due end of month',
      body:
        'This is a reminder that all employees must complete the annual compliance training module before the 31st. Please log in to the learning portal with your existing credentials. Completion is mandatory and tracked.',
    },
    isPhishing: false,
    explanation:
      'A standard HR reminder with a reasonable deadline, sent from an internal domain, linking to an existing portal. No unusual urgency or threatening consequences for non-compliance.',
    redFlags: [],
  },
];

// ── Bad Grammar ───────────────────────────────────────────────────────────────

const BAD_GRAMMAR_QUESTIONS: GameQuestion[] = [
  {
    id: 'g-01',
    tag: 'bad_grammar',
    scenario: {
      from: 'support@netflix-billing.com',
      subject: 'Your account have been suspend',
      body:
        'Dear costumer, we have notice that you payment information is outdated. Your account have been suspend until you update you credit card detail. Pleese click here to update you informations.',
    },
    isPhishing: true,
    explanation:
      'Multiple grammar errors ("account have been suspend", "you payment", "Pleese") and an unofficial domain "netflix-billing.com" instead of "netflix.com" make this a clear phishing attempt.',
    redFlags: [
      'Unofficial domain (netflix-billing.com)',
      '"account have been suspend" — wrong verb form',
      '"Pleese" — misspelling',
      '"you credit card detail" — missing articles',
    ],
  },
  {
    id: 'g-02',
    tag: 'bad_grammar',
    scenario: {
      from: 'no-reply@github.com',
      subject: 'Your repository has been archived',
      body:
        'The repository "my-project" has been automatically archived due to 12 months of inactivity. Archived repositories are read-only. You can unarchive it at any time from the repository settings. No action is required.',
    },
    isPhishing: false,
    explanation:
      'Professionally written, correct grammar, sent from the official github.com domain, and describes a routine platform action with no urgency or requests for credentials.',
    redFlags: [],
  },
  {
    id: 'g-03',
    tag: 'bad_grammar',
    scenario: {
      from: 'administrator@microsofit.co',
      subject: "Pleese update you're pasword to secure account",
      body:
        'Hello user, your Windows account pasword will expire soon. Pleese click on the link bellow to update you new pasword before it expire. If you not update, you will losing access to you\'re files and email.',
    },
    isPhishing: true,
    explanation:
      'Multiple spelling and grammar errors ("Pleese", "pasword", "bellow", "you\'re files") combined with a misspelled domain "microsofit.co" (instead of microsoft.com) confirm this is phishing.',
    redFlags: [
      'Misspelled domain (microsofit.co)',
      'Multiple spelling errors throughout',
      'Grammatically incorrect subject line',
    ],
  },
  {
    id: 'g-04',
    tag: 'bad_grammar',
    scenario: {
      from: 'subscriptions@spotify.com',
      subject: 'Your Spotify Premium receipt for March',
      body:
        'Thanks for being a Premium member! Your subscription has been renewed for another month. Amount charged: €9.99. Your next billing date is April 15. You can manage your subscription in your account settings.',
    },
    isPhishing: false,
    explanation:
      'Professional language, correct grammar and spelling, sent from the official spotify.com domain, and contains details consistent with a normal billing notification.',
    redFlags: [],
  },
];

// ── Spoofed Sender ────────────────────────────────────────────────────────────

const SPOOFED_SENDER_QUESTIONS: GameQuestion[] = [
  {
    id: 's-01',
    tag: 'spoofed_sender',
    scenario: {
      from: '"Apple Support" <support@apple-id-help.net>',
      subject: 'Your Apple ID was used to sign in from a new device',
      body:
        'We detected a sign-in to your Apple ID from a Windows device in an unusual location. If this was not you, your account may be compromised. Click here to secure your account and review recent activity.',
    },
    isPhishing: true,
    explanation:
      'The display name says "Apple Support" but the actual sending address is "apple-id-help.net" — not apple.com. Always expand the sender field to check the real domain behind a friendly display name.',
    redFlags: [
      'Display name spoofing — real domain is apple-id-help.net, not apple.com',
      '"If this was not you" creates fear and urgency',
    ],
  },
  {
    id: 's-02',
    tag: 'spoofed_sender',
    scenario: {
      from: 'no-reply@amazon.com',
      subject: 'Your order #112-3456789 has shipped',
      body:
        'Your package is on its way! Order #112-3456789 has been shipped and is expected to arrive by Thursday. Track your package using the link in your account. Thank you for shopping with Amazon.',
    },
    isPhishing: false,
    explanation:
      'Sent from the official amazon.com domain with a real-looking order number. The content matches expected shipping notifications and does not ask for any credentials.',
    redFlags: [],
  },
  {
    id: 's-03',
    tag: 'spoofed_sender',
    scenario: {
      from: '"IT Helpdesk" <helpdesk@it-support-desk.com>',
      subject: 'Reset your VPN credentials — required before Monday',
      body:
        'Dear employee, we are migrating our VPN infrastructure this weekend. All users must reset their VPN credentials before Monday morning to maintain access. Please click below to reset your credentials now.',
    },
    isPhishing: true,
    explanation:
      'An external domain "it-support-desk.com" impersonating an internal IT helpdesk is a classic spear-phishing technique. Legitimate IT departments use internal company domains, not external ones.',
    redFlags: [
      'External domain impersonating internal IT (it-support-desk.com)',
      'Urgency with a specific deadline (Monday)',
      'Requests credential reset via external link',
    ],
  },
  {
    id: 's-04',
    tag: 'spoofed_sender',
    scenario: {
      from: 'no-reply@accounts.google.com',
      subject: 'New sign-in on Windows, Chrome',
      body:
        'A new sign-in to your Google Account was detected. Time: Today, 14:32. Device: Windows, Chrome. If this was you, no action is needed. If you do not recognise this sign-in, review your account activity at myaccount.google.com.',
    },
    isPhishing: false,
    explanation:
      'Sent from the official accounts.google.com subdomain, contains no threatening language, and provides the official myaccount.google.com URL without asking you to click any embedded link.',
    redFlags: [],
  },
];

// ── General ───────────────────────────────────────────────────────────────────

const GENERAL_QUESTIONS: GameQuestion[] = [
  {
    id: 'gen-01',
    tag: 'general',
    scenario: {
      from: 'prize-winner@lottery-international.org',
      subject: 'You have been selected for a €5,000 reward!',
      body:
        'Congratulations! Your email address was randomly selected in our international lottery draw. You have won €5,000. To claim your prize, simply reply with your full name, address, and bank account number within 48 hours.',
    },
    isPhishing: true,
    explanation:
      'Unsolicited prize notifications from unknown senders that request personal and banking details are almost always phishing or advance-fee fraud. You cannot win a lottery you never entered.',
    redFlags: [
      'Unexpected prize from unknown sender',
      'Requests bank account number',
      '48-hour deadline creates pressure',
    ],
  },
  {
    id: 'gen-02',
    tag: 'general',
    scenario: {
      from: 'newsletter@medium.com',
      subject: 'Your weekly digest is ready',
      body:
        'Here are the top stories from your reading list this week. Based on your interests in Technology and Design, we picked these five articles for you. Open in app or read on the web.',
    },
    isPhishing: false,
    explanation:
      'A routine newsletter from a legitimate publishing platform you likely subscribed to. No requests for credentials, no urgency, and sent from the official medium.com domain.',
    redFlags: [],
  },
  {
    id: 'gen-03',
    tag: 'general',
    scenario: {
      from: 'ceo@companynamee.com',
      subject: 'Wire transfer request — strictly confidential',
      body:
        'This is urgent. I am in a board meeting and cannot take calls. I need you to process a wire transfer of €12,000 to a new vendor immediately. I will explain everything later. Please keep this confidential and do not mention it to anyone else.',
    },
    isPhishing: true,
    explanation:
      'This is Business Email Compromise (BEC), also called CEO fraud. A misspelled domain ("companynamee.com") impersonates the CEO. The secrecy demand, urgency, and unusual financial request are all red flags.',
    redFlags: [
      'Misspelled domain (companynamee.com)',
      'Requests secrecy from colleagues',
      'Unusual financial request with vague justification',
      '"Cannot take calls" prevents verification',
    ],
  },
];

// ── Full Question Bank ────────────────────────────────────────────────────────

export const ALL_QUESTIONS: GameQuestion[] = [
  ...URGENCY_QUESTIONS,
  ...BAD_GRAMMAR_QUESTIONS,
  ...SPOOFED_SENDER_QUESTIONS,
  ...GENERAL_QUESTIONS,
];

/**
 * Selects up to `count` questions relevant to the given tags.
 * Tag-matching questions are prioritised; general questions fill any gap.
 * The pool is shuffled so each game session feels fresh.
 */
export function selectQuestionsForTags(tags: string[], count = 5): GameQuestion[] {
  const tagSet = new Set(tags as QuestionTag[]);
  const matching = ALL_QUESTIONS.filter(q => tagSet.has(q.tag));
  const general  = ALL_QUESTIONS.filter(q => q.tag === 'general');
  // Deduplicate (general questions won't appear twice even if "general" is in tags)
  const pool = [...new Map([...matching, ...general].map(q => [q.id, q])).values()];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
