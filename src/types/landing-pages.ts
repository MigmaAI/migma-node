export type LandingPageStatus = 'draft' | 'live' | 'paused';

/** A button: a full https link on a domain the brand has verified. */
export interface LandingPageCta {
  label: string;
  url: string;
}

interface SectionBase {
  /** Unique within the page: letters, numbers, - or _. */
  id: string;
}

/** Brand photo by position in brand.images (0-3), never a URL. */
type ImageIndex = number;

export type LandingPageSection =
  | (SectionBase & { type: 'hero'; eyebrow?: string; headline: string; subheadline?: string; imageIndex?: ImageIndex; cta?: LandingPageCta })
  | (SectionBase & { type: 'text'; headline?: string; paragraphs: string[] })
  | (SectionBase & { type: 'features'; headline?: string; items: Array<{ title: string; body: string }> })
  | (SectionBase & { type: 'offer'; headline: string; body?: string; code?: string; endsAt?: string; cta?: LandingPageCta })
  | (SectionBase & { type: 'faq'; headline?: string; items: Array<{ question: string; answer: string }> })
  /** A saved form in this brand; it must be live before the page can be published. One per page. */
  | (SectionBase & { type: 'form'; formId: string; headline?: string; body?: string })
  | (SectionBase & { type: 'cta'; headline?: string; body?: string; cta: LandingPageCta })
  | (SectionBase & { type: 'image'; imageIndex: ImageIndex; alt: string });

/** Page content. Logo, photos and fonts are added by Migma from the brand. */
export interface LandingPageSpec {
  title: string;
  description?: string;
  /** 1-12 sections. */
  sections: LandingPageSection[];
  /** What visitors see once the page is paused, deleted or past endsAt. A published page never 404s. */
  ended: { headline: string; body?: string; cta?: LandingPageCta };
  endsAt?: string;
  /** Hex colours like #1a73e8; unset ones use the brand's. */
  theme?: { accent?: string; background?: string; surface?: string; text?: string };
}

/** Brand facts Migma copies from the brand. Read-only. */
export interface LandingPageBrand {
  name: string;
  logoUrl?: string;
  logoAlt?: string;
  images: string[];
  fontFamily?: string;
  fontUrl?: string;
  colors: { accent?: string; background?: string; text?: string };
  legalName?: string;
  address?: string;
}

export interface LandingPage {
  id: string;
  projectId: string;
  /** The brand's name for the page; visitors never see it. */
  name: string;
  status: LandingPageStatus;
  publicId: string;
  /** The page's link, https://migma.app/p/<id>. Null only on a server that cannot publish pages. */
  hostedUrl: string | null;
  hostingReady: boolean;
  goalId: string | null;
  draftSpec: LandingPageSpec;
  /** What visitors see. Changes only on publish(). */
  publishedSpec: LandingPageSpec | null;
  brand: LandingPageBrand;
  hasUnpublishedChanges: boolean;
  specVersion: number;
  publishedAt: string | null;
  firstPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LandingPageCheck {
  key: 'hosting' | 'owned_domain' | 'links' | 'form';
  status: 'pass' | 'fail';
  message: string;
}

export interface LandingPageDetail extends LandingPage {
  /** Every check must pass to publish. */
  publishChecks: LandingPageCheck[];
  /** Approximate lifetime counts. Null when unavailable; never read that as zero. */
  counters: { viewed: number; clicked: number } | null;
  metricsStatus: 'available' | 'unavailable';
}

export interface CreateLandingPageParams {
  projectId: string;
  name?: string;
  spec: LandingPageSpec;
}

export interface GenerateLandingPageParams {
  projectId: string;
  /** What the page is for, with the offer, dates and facts it may state (10-4000 characters). */
  brief: string;
  name?: string;
  /** A saved form in this brand to show on the page. */
  formId?: string;
  /** Links buttons may use; links outside the brand's verified domains are dropped. Max 5. */
  links?: Array<{ label: string; url: string }>;
  endsAt?: string;
}

export interface UpdateLandingPageParams {
  /** null clears it. */
  name?: string | null;
  /** The whole new draft spec; it replaces the saved draft. */
  spec?: LandingPageSpec;
}

export interface LandingPageVersions {
  versions: Array<{ specVersion: number; specHash: string; publishedAt: string }>;
}

export interface LandingPageMetrics {
  from: string;
  to: string;
  timezone: 'UTC';
  /** Null when reporting is unavailable, which is not zero. */
  days: Array<{ day: string; viewed: number; clicked: number }> | null;
  metricsStatus: 'available' | 'unavailable';
}
