/**
 * Live API test script for the Migma SDK.
 *
 * Usage:
 *   MIGMA_API_KEY=your-key npx tsx test-live.ts
 *
 * Optional:
 *   MIGMA_PROJECT_ID=proj_id  (skip project listing, use this directly)
 *   MIGMA_BASE_URL=http://localhost:3001/api/v1  (test against local backend)
 */

import { Migma } from './src';

const API_KEY = process.env.MIGMA_API_KEY;
if (!API_KEY) {
  console.error('Set MIGMA_API_KEY environment variable');
  process.exit(1);
}

const migma = new Migma(API_KEY, {
  baseUrl: process.env.MIGMA_BASE_URL ?? 'https://api.migma.ai/api/v1',
});

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err: unknown) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  [FAIL] ${name} — ${msg}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
  console.log('\n--- Migma SDK Live Tests ---\n');

  // ─── Projects ───
  let projectId = process.env.MIGMA_PROJECT_ID;

  console.log('Projects:');
  await test('list projects', async () => {
    const { data, error } = await migma.projects.list({ limit: 5 });
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Found ${data!.projects.length} projects`);
    if (!projectId && data!.projects.length > 0) {
      projectId = data!.projects[0]._id;
      console.log(`    Using projectId: ${projectId}`);
    }
  });

  if (!projectId) {
    console.log('\n  No project found. Set MIGMA_PROJECT_ID to continue.\n');
    process.exit(1);
  }

  await test('get project', async () => {
    const { data, error } = await migma.projects.get(projectId!);
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Project: ${data!.name} (${data!.status})`);
  });

  // ─── Tags ───
  console.log('\nTags:');
  let tagId: string | undefined;

  await test('create tag', async () => {
    const { data, error } = await migma.tags.create({
      name: `sdk-test-${Date.now()}`,
      color: '#3B82F6',
      description: 'Created by SDK live test',
      projectId: projectId!,
    });
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    tagId = data!.id;
    console.log(`    Created tag: ${data!.name} (${tagId})`);
  });

  await test('list tags', async () => {
    const { data, error } = await migma.tags.list({
      projectId: projectId!,
      limit: 5,
    });
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Found ${data!.count} tags`);
  });

  if (tagId) {
    await test('get tag', async () => {
      const { data, error } = await migma.tags.get(tagId!, projectId!);
      assert(!error, `Error: ${error?.message}`);
      assert(!!data, 'No data returned');
    });

    await test('update tag', async () => {
      const { data, error } = await migma.tags.update(tagId!, {
        description: 'Updated by SDK live test',
        projectId: projectId!,
      });
      assert(!error, `Error: ${error?.message}`);
      assert(!!data, 'No data returned');
    });

    await test('delete tag', async () => {
      const { data, error } = await migma.tags.remove(tagId!, projectId!);
      assert(!error, `Error: ${error?.message}`);
      assert(!!data, 'No data returned');
      assert(data!.deleted === true, 'Tag not deleted');
    });
  }

  // ─── Contacts ───
  console.log('\nContacts:');
  const testEmail = `sdk-test-${Date.now()}@test.migma.dev`;
  let contactId: string | undefined;

  await test('create contact', async () => {
    const { data, error } = await migma.contacts.create({
      email: testEmail,
      firstName: 'SDK',
      lastName: 'Test',
      projectId: projectId!,
    });
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    contactId = data!.id;
    console.log(`    Created contact: ${data!.email} (${contactId})`);
  });

  await test('list contacts', async () => {
    const { data, error } = await migma.contacts.list({
      projectId: projectId!,
      limit: 5,
    });
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Found ${data!.count} contacts`);
  });

  if (contactId) {
    await test('get contact', async () => {
      const { data, error } = await migma.contacts.get(contactId!, projectId!);
      assert(!error, `Error: ${error?.message}`);
      assert(!!data, 'No data returned');
      assert(data!.email === testEmail, 'Email mismatch');
    });

    await test('update contact', async () => {
      const { data, error } = await migma.contacts.update(contactId!, {
        firstName: 'Updated',
        projectId: projectId!,
      });
      assert(!error, `Error: ${error?.message}`);
      assert(!!data, 'No data returned');
    });

    await test('delete contact', async () => {
      const { data, error } = await migma.contacts.remove(contactId!, projectId!);
      assert(!error, `Error: ${error?.message}`);
      assert(!!data, 'No data returned');
      assert(data!.deleted === true, 'Contact not deleted');
    });
  }

  // ─── Segments ───
  console.log('\nSegments:');
  await test('list segments', async () => {
    const { data, error } = await migma.segments.list(projectId!);
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Found ${data!.count} segments`);
  });

  // ─── Topics ───
  console.log('\nTopics:');
  await test('list topics', async () => {
    const { data, error } = await migma.topics.list({ projectId: projectId! });
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Found ${data!.count} topics`);
  });

  // ─── Domains ───
  console.log('\nDomains:');
  await test('list domains', async () => {
    const { data, error } = await migma.domains.list();
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Found ${data!.length} domains`);
  });

  // ─── Webhooks ───
  console.log('\nWebhooks:');
  await test('list webhooks', async () => {
    const { data, error } = await migma.webhooks.list();
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    Found ${data!.total} webhooks`);
  });

  await test('list webhook events', async () => {
    const { data, error } = await migma.webhooks.getEvents();
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    ${data!.total} event types available`);
  });

  // ─── Export ───
  console.log('\nExport:');
  await test('list export formats', async () => {
    const { data, error } = await migma.export.getFormats();
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    ${data!.total} formats available`);
  });

  // ─── Knowledge Base ───
  console.log('\nKnowledge Base:');
  await test('list knowledge base', async () => {
    const { data, error } = await migma.knowledgeBase.list(projectId!);
    assert(!error, `Error: ${error?.message}`);
    assert(!!data, 'No data returned');
    console.log(`    ${data!.total} entries`);
  });

  // ─── Error Handling ───
  console.log('\nError Handling:');
  await test('404 returns error (not throw)', async () => {
    const { data, error } = await migma.contacts.get('000000000000000000000000', projectId!);
    assert(data === null, 'Expected null data');
    assert(!!error, 'Expected error');
    assert(error!.statusCode === 404, `Expected 404, got ${error!.statusCode}`);
    console.log(`    Correctly returned: ${error!.code} — ${error!.message}`);
  });

  // ─── Summary ───
  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
