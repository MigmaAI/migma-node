# migma

The official Node.js SDK for the [Migma](https://migma.ai) email platform API.

Generate pixel-perfect, on-brand emails with AI in 30 seconds. Manage contacts, domains, webhooks, and more — all from code.

[![npm version](https://img.shields.io/npm/v/migma.svg)](https://www.npmjs.com/package/migma)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install migma
```

## Quick Start

```typescript
import { Migma } from 'migma';

const migma = new Migma('mgma_sk_live_...');

// A project holds your brand info (colors, fonts, logos, tone of voice).
// Import one from your website, or grab the ID of an existing project
// from the Migma dashboard.
const { data: project } = await migma.projects.importAndWait({
  urls: ['https://yourcompany.com'],
});

// Generate an email design with AI — returns the finished HTML directly.
const { data: email } = await migma.emails.generateAndWait({
  projectId: project.projectId,
  prompt: 'Create a welcome email for new subscribers',
});

if (email?.status === 'completed') {
  console.log('Subject:', email.result.subject);
  console.log('HTML:', email.result.html); // primary email HTML
  console.log('Email ID:', email.result.emails[0].emailId);
}
```

> **Prefer async?** Use `migma.emails.generate()` to kick off generation without waiting,
> then set up a [webhook](https://docs.migma.ai/webhooks) to get notified when the design is ready
> via the `email.generation.completed` event — no polling needed.

Get your API key from the [Migma Dashboard](https://migma.ai) under **Settings > API Integration > API Keys**.

### Quick Start with OpenClaw

[OpenClaw](https://openclaw.ai/) (formerly ClawdBot) is an open-source AI agent for WhatsApp, Telegram, and Discord. Pair it with Migma to generate and send professional emails from a single chat command.

```typescript
import { Migma } from 'migma';

const migma = new Migma(process.env.MIGMA_API_KEY);

// 1. Set up an instant sending domain (no DNS needed)
await migma.domains.createManaged({ prefix: 'yourcompany' });

// 2. Generate an on-brand email with AI
const { data: email } = await migma.emails.generateAndWait({
  projectId: process.env.MIGMA_PROJECT_ID, // your brand project
  prompt: 'Create a summer sale email with 30% off everything',
});

if (!email?.result) throw new Error('Email generation failed');

// 3. Send it — emailId works for single emails and series slots
const selectedEmail = email.result.emails[0];
if (!selectedEmail.emailId) throw new Error('No emailId returned');
await migma.sending.send({
  recipientType: 'email',
  recipientEmail: 'sarah@example.com',
  from: 'hello@yourcompany.migma.email',
  fromName: 'Your Company',
  subject: selectedEmail.subject,
  emailId: selectedEmail.emailId,
});

// conversationId also works for single-email conversations.
// For multi-slot emails or series, use result.emails[].emailId.
```

[Full OpenClaw tutorial](https://docs.migma.ai/tutorials/send-emails-from-openclaw)

## Documentation

| Resource | Link |
|----------|------|
| API Reference | [docs.migma.ai/api-reference](https://docs.migma.ai/api-reference/introduction) |
| Quickstart Guide | [docs.migma.ai/quickstart](https://docs.migma.ai/quickstart) |
| Authentication | [docs.migma.ai/authentication](https://docs.migma.ai/authentication) |
| Webhooks Guide | [docs.migma.ai/webhooks](https://docs.migma.ai/webhooks) |
| Platform | [migma.ai](https://migma.ai) |
| Community | [Discord](https://discord.gg/ZB6c2meCUA) |

## Features

- Full coverage of all Migma API v1 endpoints (80+ methods across 15 resources)
- TypeScript-first with complete type definitions
- `{ data, error }` return pattern — methods never throw
- Automatic retries with exponential backoff on 5xx/429
- Polling helpers for async operations (email generation, project import, previews)
- Zero runtime dependencies (uses native `fetch`)
- Dual ESM + CommonJS support

## Usage

### Configuration

```typescript
import { Migma } from 'migma';

const migma = new Migma('mgma_sk_live_...', {
  baseUrl: 'https://api.migma.ai/v1', // default
  maxRetries: 2,                           // retries on 5xx/429
  retryDelay: 1000,                        // base delay between retries
});
```

### Error Handling

Every method returns `{ data, error }` instead of throwing. TypeScript narrows the types automatically:

```typescript
const { data, error } = await migma.contacts.create({
  email: 'john@example.com',
  status: 'subscribed', // only for contacts with marketing consent
  projectId: 'proj_abc123',
});

if (error) {
  console.error(error.statusCode, error.code, error.message);
  // 400 validation_error "Invalid email address"
  return;
}

// TypeScript knows data is non-null here
console.log(data.id, data.email);
```

Error codes: `validation_error` | `not_found` | `unauthorized` | `forbidden` | `rate_limit_exceeded` | `conflict` | `timeout` | `network_error` | `internal_error`

---

### Projects

Import your brand and manage projects.

```typescript
// List all projects
const { data } = await migma.projects.list({ limit: 20 });

// Import a brand from a URL and wait for it to finish
const { data: project } = await migma.projects.importAndWait(
  { urls: ['https://example.com'] },
  {
    interval: 3000,
    onPoll: (status) => console.log(`${status.progress.percentage}%`),
  }
);
```

[Projects API Reference](https://docs.migma.ai/api-reference/projects/list-projects)

### AI Email Generation

Generate emails with AI — fire-and-forget or wait for the result.

```typescript
// Generate and wait for the result
const { data } = await migma.emails.generateAndWait({
  projectId: 'proj_abc123',
  prompt: 'Black Friday promotional email with 30% discount',
  images: [{ source: { type: 'url', url: 'https://example.com/hero.jpg' } }],
  languages: ['en'],
});

if (data?.status === 'completed') {
  console.log('Subject:', data.result.subject);
  console.log('HTML:', data.result.html);
}

// Or fire-and-forget, check status later
const { data: gen } = await migma.emails.generate({
  projectId: 'proj_abc123',
  prompt: 'Weekly newsletter',
});
const { data: status } = await migma.emails.getGenerationStatus(gen.conversationId);
```

[Email Generation API Reference](https://docs.migma.ai/api-reference/email/generate-email-async)

### Contacts

```typescript
// Create
const { data: contact } = await migma.contacts.create({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  tags: ['newsletter', 'vip'],
  projectId: 'proj_abc123',
});

// List with filters
const { data: contacts } = await migma.contacts.list({
  projectId: 'proj_abc123',
  status: 'subscribed',
  tags: 'newsletter',
  limit: 50,
});

// Bulk import (sync for <=5000 contacts, async for more)
const { data: result } = await migma.contacts.bulkImport({
  subscribers: [
    { email: 'a@example.com', firstName: 'Alice' },
    { email: 'b@example.com', firstName: 'Bob' },
  ],
  projectId: 'proj_abc123',
});

// Batch delete by email (up to 1000; unmatched emails come back in notFound)
const { data: deletion } = await migma.contacts.bulkDeleteByEmail({
  emails: ['a@example.com', 'b@example.com'],
  projectId: 'proj_abc123',
});

// Safe retries: pass an Idempotency-Key so a retried write never duplicates.
// Same key + same body within 24h replays the original response.
await migma.contacts.create(
  { email: 'jane@example.com', projectId: 'proj_abc123' },
  { idempotencyKey: 'signup-jane@example.com-1779292800' },
);
```

[Contacts API Reference](https://docs.migma.ai/api-reference/contacts/get-contact)

### Sending Emails

Send to a single recipient, segment, tag, or full audience.

```typescript
// Send a generated email by emailId
await migma.sending.send({
  recipientType: 'email',
  recipientEmail: 'user@example.com',
  from: 'hello@yourdomain.com',
  fromName: 'Your Company',
  subject: 'Welcome!',
  emailId: 'email_abc123',
});

// Single-email conversations can also be sent by conversationId.
await migma.sending.send({
  recipientType: 'email',
  recipientEmail: 'user@example.com',
  from: 'hello@yourdomain.com',
  fromName: 'Your Company',
  subject: 'Welcome!',
  conversationId: 'conv_abc123',
});

// Send to a segment
await migma.sending.send({
  recipientType: 'segment',
  recipientId: 'seg_abc123',
  from: 'hello@yourdomain.com',
  fromName: 'Your Company',
  subject: 'Big Announcement',
  emailId: 'email_abc123',
});

// Single sends are automatically transactional — no flag needed
// Use transactional: true on batch sends to bypass subscription status
await migma.sending.send({
  recipientType: 'tag',
  recipientId: 'tag_active_users',
  from: 'noreply@yourdomain.com',
  fromName: 'Your Company',
  subject: 'Your subscription renews tomorrow',
  emailId: 'email_abc123',
  transactional: true,
});
```

[Sending API Reference](https://docs.migma.ai/api-reference/sending/send-email)

### Generated Series and Editing

Generate a series with `count`, then use each email's `emailId` to fetch, prompt-edit, or send one email.

```typescript
const { data: series } = await migma.emails.generateAndWait({
  projectId: 'proj_abc123',
  prompt: 'Create a three-email onboarding series',
  count: 3,
});

for (const generated of series?.result?.emails ?? []) {
  console.log(generated.slot, generated.emailId, generated.html);
  console.log(generated.screenshotUrl);
}

const { data: email } = await migma.emails.get('email_abc123');
console.log(email?.html);

await migma.emails.edit('email_abc123', {
  prompt: 'Change the CTA from "Start now" to "Start your trial"',
});
```

### Campaigns

Create a campaign from a generated email, send or schedule it, then read its
engagement stats and per-recipient logs.

```typescript
// Create from a generated email
const { data: campaign } = await migma.campaigns.create({
  projectId: 'proj_abc123',
  name: 'Spring Launch',
  conversationId: 'conv_abc123',
  emailId: 'email_abc123',
  subject: 'Spring is here',
  from: 'hello@yourdomain.com',
  fromName: 'Your Brand',
  recipientType: 'audience',
  recipientId: 'aud_abc123',
});

// Send now (idempotency key recommended — see below)
await migma.campaigns.send(campaign.id, {
  idempotencyKey: `campaign-send-${campaign.id}`,
});

// Or schedule for later
await migma.campaigns.schedule(
  campaign.id,
  { scheduledAt: '2026-07-01T15:00:00Z', scheduledTimezone: 'America/New_York' },
  { idempotencyKey: `campaign-send-${campaign.id}` },
);

// Aggregated engagement metrics (cached, may be slightly stale)
const { data: stats } = await migma.campaigns.stats(campaign.id);
console.log(stats?.openRate, stats?.clickRate, stats?.lastUpdated);

// Per-recipient logs, cursor-paginated and optionally filtered by status
const { data: logs } = await migma.campaigns.logs(campaign.id, {
  status: 'opened',
  limit: 50,
});
for (const row of logs?.emails ?? []) {
  console.log(row.to_email, row.status, row.opened_at);
}
if (logs?.hasMore) {
  await migma.campaigns.logs(campaign.id, { cursor: logs.nextCursor ?? undefined });
}
```

Campaign stats are sourced from the email tracking worker and cached on the
campaign, so they can lag live activity. `botOpens`, `botClicks`, and `mppOpens`
reflect Apple Mail Privacy Protection and bot detection when that data is
available. Log rows come straight from the tracking store, so their field names
are `snake_case` (`to_email`, `opened_at`, `bounce_type`) unlike the rest of the
API.

[Campaigns Guide](https://docs.migma.ai/campaigns/overview)

### Idempotency

Write methods accept an optional trailing `CallOptions` argument carrying an
`idempotencyKey`. The key is sent as the `Idempotency-Key` header (max 100
characters) and is scoped to your API key for 24 hours:

- **Same key + same body** within 24h replays the original response (the server
  marks the replay with an `Idempotent-Replayed: true` header).
- **Same key + different body** returns `409 IDEMPOTENCY_CONFLICT`.
- `429` and `5xx` responses are never cached, so they stay safe to retry — and
  the SDK reuses your key across its own automatic retries, so a retried call
  never duplicates.

```typescript
// Sending — key on the recipient + send time
await migma.sending.send(
  {
    recipientType: 'email',
    recipientEmail: 'user@example.com',
    from: 'hello@yourdomain.com',
    fromName: 'Your Brand',
    subject: 'Welcome!',
    emailId: 'email_abc123',
  },
  { idempotencyKey: 'send-email_abc123-user@example.com-now' },
);

// Campaign send — one key per campaign send
await migma.campaigns.send('camp_abc123', {
  idempotencyKey: 'campaign-send-camp_abc123',
});

// Email generation — key on project + the turn/prompt
await migma.emails.generate(
  { projectId: 'proj_abc123', prompt: 'Welcome email' },
  { idempotencyKey: 'email-gen-proj_abc123-welcome' },
);

// Contact add — key on the email
await migma.contacts.create(
  { email: 'jane@example.com', projectId: 'proj_abc123' },
  { idempotencyKey: 'contact-jane@example.com' },
);
```

**Choose a deterministic key** so the same logical operation produces the same
key on every attempt:

- send: `send-<emailId>-<recipientId|to>-<scheduledAt|"now">`
- campaign send: `campaign-send-<campaignId>`
- email generate: `email-gen-<projectId>-<turnOrPromptHash>`
- contact add: `contact-<email>`

**Anti-patterns to avoid:**

- Don't generate the key with `uuid()` or `Date.now()` per call — a fresh key
  every attempt defeats deduplication across retries and process restarts.
- Don't hash the request body to build the key — identical retries you *want*
  deduplicated would each get a different key, and you lose the conflict signal.

### Email Validation

Run preflight checks — compatibility, links, spelling, and deliverability.

```typescript
// Run all checks at once
const { data } = await migma.validation.all({
  html: '<html>...</html>',
  subject: 'My Email',
  options: {
    checkCompatibility: true,
    checkLinks: true,
    checkSpelling: true,
    checkDeliverability: true,
  },
});

console.log('Score:', data.overallScore);
console.log('Spam score:', data.deliverability?.spamScore.score);

// Or run individual checks
const { data: compat } = await migma.validation.compatibility({ html: '...' });
const { data: links } = await migma.validation.links({ html: '...' });
const { data: spam } = await migma.validation.deliverability({ html: '...' });
```

[Validation API Reference](https://docs.migma.ai/api-reference/email-validation/run-all-validation-checks)

### Email Previews

Preview emails across 20+ email clients and devices.

```typescript
const { data } = await migma.previews.createAndWait({
  html: '<html>...</html>',
  subject: 'Test Email',
  devices: ['apple-mail.ios', 'gmail.desktop-webmail'],
});

data.devices.forEach((d) => {
  console.log(`${d.deviceName}: ${d.screenshotUrl}`);
});

// List all supported devices
const { data: devices } = await migma.previews.getSupportedDevices();
```

[Previews API Reference](https://docs.migma.ai/api-reference/email-previews/create-email-preview)

### Export

Export generated emails to HTML, MJML, PDF, or directly to ESP platforms.

```typescript
const { data: html } = await migma.export.html('conversation_id');
const { data: mjml } = await migma.export.mjml('conversation_id');
const { data: pdf } = await migma.export.pdf('conversation_id');
const { data: klaviyo } = await migma.export.klaviyo('conversation_id', 'hybrid');
const { data: mailchimp } = await migma.export.mailchimp('conversation_id');
```

[Export API Reference](https://docs.migma.ai/api-reference/export/list-export-formats)

### Domains

Add custom sending domains or use managed quick-start domains.

```typescript
// Add and verify a custom domain
await migma.domains.create({ domain: 'mail.example.com', region: 'us-east-1' });
await migma.domains.verify('mail.example.com');

// Or use a managed domain (quick start)
const { data: avail } = await migma.domains.checkAvailability('mycompany');
if (avail.available) {
  await migma.domains.createManaged({ prefix: 'mycompany' });
}

// Provision a transactional stream (notify.example.com) to isolate
// transactional reputation from marketing, then publish the returned DNS records
await migma.domains.provisionStream({ rootDomain: 'example.com', stream: 'transactional' });

// Or provision both streams (send. marketing + notify. transactional) in one call
const { data } = await migma.domains.setup({ rootDomain: 'example.com' });
// data.marketing, data.transactional
```

[Domains API Reference](https://docs.migma.ai/api-reference/domains/list-domains)

### Tags, Segments & Topics

```typescript
// Tags
const { data: tag } = await migma.tags.create({
  name: 'VIP Customers',
  color: '#FF5733',
  projectId: 'proj_abc123',
});

// Segments
const { data: segment } = await migma.segments.create({
  name: 'Active US Customers',
  filters: {
    status: 'subscribed',
    fields: [{ key: 'country', mode: 'is', values: ['US'] }],
    activity: [{ action: 'opened', channel: 'email', mode: 'within', unit: 'days', amount: 30 }],
  },
  projectId: 'proj_abc123',
});

const { data: campaignSegment } = await migma.segments.create({
  name: 'Campaign openers',
  filters: {
    activity: [{ action: 'opened', channel: 'email', mode: 'within', unit: 'days', amount: 14, campaignId: 'cmp_123' }],
  },
  projectId: 'proj_abc123',
});

// Topics with subscribe/unsubscribe
const { data: topic } = await migma.topics.create({
  name: 'Weekly Newsletter',
  defaultSubscription: 'opt_out',
  projectId: 'proj_abc123',
});
await migma.topics.subscribe('topic_id', {
  subscriberId: 'sub_id',
  projectId: 'proj_abc123',
});
```

[Tags](https://docs.migma.ai/api-reference/tags/list-tags) | [Segments](https://docs.migma.ai/api-reference/audiences/list-audiences) | [Topics](https://docs.migma.ai/api-reference/topics/list-topics)

### Webhooks

```typescript
const { data: webhook } = await migma.webhooks.create({
  url: 'https://example.com/webhooks',
  events: ['email.generation.completed', 'subscriber.added'],
});

const { data: test } = await migma.webhooks.test(webhook.id);
console.log('Success:', test.success);
```

[Webhooks Guide](https://docs.migma.ai/webhooks)

### Knowledge Base & Images

```typescript
// Add context for AI email generation
await migma.knowledgeBase.add('proj_abc123', {
  title: 'Company FAQ',
  content: 'We are a SaaS company that...',
});

// Manage project images
await migma.images.add('proj_abc123', {
  url: 'https://example.com/hero.jpg',
  description: 'Hero banner',
});

await migma.images.updateLogos('proj_abc123', {
  primary: 'https://example.com/logo.png',
});
```

---

## All Resources

| Resource | Methods | Docs |
|----------|---------|------|
| `migma.contacts` | `create` `list` `get` `update` `remove` `bulkImport` `getBulkImportStatus` `changeStatus` | [Contacts](https://docs.migma.ai/api-reference/contacts/get-contact) |
| `migma.tags` | `create` `list` `get` `update` `remove` | [Tags](https://docs.migma.ai/api-reference/tags/list-tags) |
| `migma.segments` | `create` `list` `get` `update` `remove` | [Segments](https://docs.migma.ai/api-reference/audiences/list-audiences) |
| `migma.topics` | `create` `list` `get` `update` `remove` `subscribe` `unsubscribe` | [Topics](https://docs.migma.ai/api-reference/topics/list-topics) |
| `migma.sending` | `send` `getBatchStatus` | [Sending](https://docs.migma.ai/api-reference/sending/send-email) |
| `migma.projects` | `list` `get` `import` `getImportStatus` `retryImport` `fieldCatalog` `importAndWait` | [Projects](https://docs.migma.ai/api-reference/projects/list-projects) |
| `migma.emails` | `generate` `getGenerationStatus` `generateAndWait` `sendTest` `get` `edit` | [Email Generation](https://docs.migma.ai/api-reference/email/generate-email-async) |
| `migma.campaigns` | `list` `create` `get` `send` `schedule` `cancel` `stats` `logs` `archive` `unarchive` | [Campaigns](https://docs.migma.ai/campaigns/overview) |
| `migma.validation` | `all` `compatibility` `links` `spelling` `deliverability` | [Validation](https://docs.migma.ai/api-reference/email-validation/run-all-validation-checks) |
| `migma.previews` | `create` `get` `getStatus` `getDevice` `getSupportedDevices` `createAndWait` | [Previews](https://docs.migma.ai/api-reference/email-previews/create-email-preview) |
| `migma.export` | `getFormats` `getStatus` `html` `mjml` `pdf` `klaviyo` `mailchimp` `hubspot` | [Export](https://docs.migma.ai/api-reference/export/list-export-formats) |
| `migma.domains` | `create` `list` `get` `verify` `update` `remove` `checkAvailability` `listManaged` `createManaged` `removeManaged` `provisionStream` `setup` | [Domains](https://docs.migma.ai/api-reference/domains/list-domains) |
| `migma.webhooks` | `create` `list` `get` `update` `remove` `test` `getDeliveries` `getEvents` `getStats` | [Webhooks](https://docs.migma.ai/webhooks) |
| `migma.knowledgeBase` | `list` `add` `update` `remove` | [API Ref](https://docs.migma.ai/api-reference/introduction) |
| `migma.images` | `add` `update` `remove` `updateLogos` | [API Ref](https://docs.migma.ai/api-reference/introduction) |

## Async Polling Helpers

Three resources support async operations with built-in polling:

```typescript
// All polling methods accept optional config
const options = {
  interval: 2000,      // poll every 2s (default)
  maxAttempts: 150,     // max polls before timeout (default)
  onPoll: (status, attempt) => console.log(`Attempt ${attempt}:`, status),
  signal: abortController.signal,  // cancel polling
};

await migma.emails.generateAndWait(params, options);
await migma.projects.importAndWait(params, options);
await migma.previews.createAndWait(params, options);
```

## Use Cases

### Send emails from WhatsApp/Telegram via OpenClaw

See [Quick Start with OpenClaw](#quick-start-with-openclaw) above, or read the [full tutorial](https://docs.migma.ai/tutorials/send-emails-from-openclaw).

### Generate + validate + send in one pipeline

```typescript
const { data: email } = await migma.emails.generateAndWait({
  projectId: 'proj_abc123',
  prompt: 'Summer sale — 30% off everything this weekend',
});

const { data: checks } = await migma.validation.all({
  html: email.result.html,
  subject: email.result.subject,
});

if (checks.overallScore > 80) {
  await migma.sending.send({
    recipientType: 'tag',
    recipientId: 'newsletter-subscribers',
    from: 'hello@yourdomain.com',
    fromName: 'Your Brand',
    subject: email.result.subject,
    conversationId: email.conversationId,
  });
}
```

### Pull live data from Shopify, Notion, Stripe via MCP

Migma connects to [26+ tools via MCP](https://docs.migma.ai/integrations/mcp-servers). Generate emails with live product data, content calendars, or revenue metrics.

```typescript
await migma.emails.generateAndWait({
  projectId: 'proj_abc123',
  prompt: 'Product launch email for items tagged "New Arrival" from Shopify',
});
```

### Email preview testing in CI/CD

```typescript
const { data: preview } = await migma.previews.createAndWait({
  html: emailHtml,
  devices: ['apple-mail.ios', 'gmail.desktop-webmail', 'outlook.desktop-windows'],
});

const failed = preview.devices.filter((d) => d.status === 'FAILED');
if (failed.length) throw new Error(`Broken on: ${failed.map((d) => d.deviceName)}`);
```

### One-click export to Klaviyo, Mailchimp, HubSpot

```typescript
const { data } = await migma.export.klaviyo(conversationId, 'hybrid');
console.log('Download:', data.files[0].url);
```

---

## Requirements

- Node.js 18 or later (uses native `fetch`)
- [Migma API key](https://migma.ai) (Settings > API Integration)

## Support

- [Documentation](https://docs.migma.ai)
- [Discord Community](https://discord.gg/ZB6c2meCUA)
- [Support](https://migma.ai/support)
- [Email](mailto:support@migma.ai)

## License

MIT
