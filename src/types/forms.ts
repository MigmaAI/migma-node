export type FormKind = 'subscribe' | 'waitlist' | 'leadgen' | 'rsvp' | 'gated';
export type FormStatus = 'draft' | 'live' | 'paused';

export interface FormField {
  /** Letters, digits and underscores, starting with a letter. Exactly one field is the required email field. */
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
  required: boolean;
  /** Contact field this input fills, such as firstName or a custom field. */
  bindsTo?: string;
  /** Unique choices for select fields (max 20). */
  options?: string[];
}

export interface FormStep {
  id: string;
  headline: string;
  subheadline?: string;
  ctaLabel: string;
  fields: FormField[];
}

export interface FormStateCopy {
  headline: string;
  body?: string;
}

/** How the hosted page arranges the form. split and banner show brand.imageUrl. */
export type FormLayout = 'card' | 'split' | 'banner' | 'minimal';

/**
 * Brand assets the form shows. Migma fills these from the brand when it writes
 * the form; a published form keeps them until it is published again. https URLs.
 */
export interface FormBrand {
  logoUrl?: string;
  logoAlt?: string;
  /** A brand photo for the split and banner layouts. */
  imageUrl?: string;
  /** CSS font-family stack; the font loads when the form's font starts with it. */
  fontFamily?: string;
  /** Google Fonts stylesheet or a .woff2/.woff/.ttf/.otf file for fontFamily. */
  fontUrl?: string;
}

/** What the hosted page and embed render. 1-5 steps and 1-10 fields in total. */
export interface FormSpec {
  kind: FormKind;
  steps?: FormStep[];
  /** Legacy single-step fields; prefer steps. */
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  fields?: FormField[];
  success?: FormStateCopy;
  confirmed?: FormStateCopy;
  subscribed?: FormStateCopy;
  teaser?: { label: string };
  display?: 'inline' | 'popup';
  /**
   * message shows value after signup; redirect sends visitors to an absolute
   * http(s) URL; doubleOptIn emails a confirmation link first and needs a
   * verified transactional sender before publishing.
   */
  confirmation: { mode: 'message' | 'redirect' | 'doubleOptIn'; value: string };
  styleTokens: Record<string, string>;
  /** Forms without a layout render as card. */
  layout?: FormLayout;
  brand?: FormBrand;
}

export interface Form {
  id: string;
  projectId: string;
  /** The brand's name for the form; unnamed forms read as their first headline, then their type. Visitors never see it. */
  name: string;
  kind: FormKind;
  status: FormStatus;
  /** Opaque ID used by the hosted page and embed. */
  publicId: string;
  /** Present when the API's public URL is configured. */
  hostedUrl?: string;
  embed?: { inline: string; popup: string };
  /** The brand ID means every contact in the brand. */
  audienceId: string;
  /** Saved tags added to every new signup. */
  tagIds: string[];
  /** Edits go here; visitors see publishedSpec until publish(). */
  draftSpec: FormSpec;
  publishedSpec: FormSpec | null;
  hasUnpublishedChanges: boolean;
  specVersion: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormDetail extends Form {
  /** Null when reporting is unavailable; never read that as zero. */
  counters: { viewed: number; submitted: number; confirmed: number } | null;
  metricsStatus: 'available' | 'unavailable';
  /** Automations whose trigger starts from this form. Enabled ones block pause and delete. */
  automations: Array<{ id: string; name: string; status: 'draft' | 'enabled' | 'paused'; link: string }>;
}

export interface CreateFormParams {
  projectId: string;
  /** Up to 120 characters; shown in form lists, never to visitors. */
  name?: string;
  spec: FormSpec;
  tagIds?: string[];
  /** Saved audience ID; defaults to every contact in the brand. */
  audienceId?: string;
}

export interface UpdateFormParams {
  /** Renames at once, live or draft; null clears it. */
  name?: string | null;
  /** Merged into the draft; publish() makes it live. */
  spec?: Partial<FormSpec>;
  tagIds?: string[];
  audienceId?: string;
}

/** Optional source of a server-side submission; saved on a new contact only. */
export interface FormSubmissionAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingUrl?: string;
}

/** Original request details supplied as consent evidence. */
export interface FormSubmissionConsent {
  /** The signing-up person's IP address. The API stores it hashed. */
  ip?: string;
  /** The signing-up person's user agent, up to 1000 characters. */
  userAgent?: string;
}

export interface SubmitFormParams {
  email: string;
  /** Values keyed by the form's field keys; checkboxes may be booleans. Unknown keys are rejected. */
  fields?: Record<string, string | boolean>;
  attribution?: FormSubmissionAttribution;
  /** Original signup request evidence. Never substitute the SDK host or agent's request details. */
  consent?: FormSubmissionConsent;
}

export interface FormSubmitResult {
  formId: string;
  /** Hash of form, email and API key: the same caller submitting the same email gets the same id. */
  submissionId: string;
  /** `confirmation_pending`: a double opt-in form emailed the contact a confirmation link. */
  state: 'received' | 'confirmation_pending';
  /** Already recorded (a repeat): no new submission event or automation entry. */
  duplicate: boolean;
}

export interface FormSubmission {
  id: string;
  email: string;
  subscriberId: string | null;
  fields: Record<string, string>;
  submittedAt: string;
  /** Set once a double opt-in signup is confirmed. */
  confirmedAt: string | null;
}

export interface FormSubmissions {
  submissions: FormSubmission[];
  nextCursor: string | null;
  /** Submission receipts are kept this many days. */
  retentionDays: number;
}
