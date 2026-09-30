import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function stableVersion(version) {
  if (typeof version !== 'string' || version.trim() !== version || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error('Releases require a stable major.minor.patch version, such as 1.8.2.');
  }
  return version.split('.').map(BigInt);
}

export async function releaseStatus(pkg, request = fetch) {
  const parts = stableVersion(pkg.version);
  if (pkg.private || typeof pkg.name !== 'string' || pkg.name.trim() !== pkg.name || !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(pkg.name)) {
    throw new Error('Expected a public npm package.');
  }
  const response = await request(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`, {
    signal: AbortSignal.timeout(15000),
    headers: { accept: 'application/json' },
  });
  // A registry outage, auth error, or missing package must never mean "publish".
  if (!response.ok) throw new Error(`npm registry check failed (HTTP ${response.status}).`);
  const metadata = await response.json();
  if (metadata?.name !== pkg.name || !metadata.versions || typeof metadata.versions !== 'object' || Array.isArray(metadata.versions)) {
    throw new Error('Invalid npm registry metadata.');
  }
  if (Object.hasOwn(metadata.versions, pkg.version)) {
    const published = metadata.versions[pkg.version];
    if (published?.name !== pkg.name || published.version !== pkg.version) {
      throw new Error('Invalid published version metadata.');
    }
    if (published.gitHead && !/^[a-f0-9]{40}$/.test(published.gitHead)) throw new Error('Invalid published commit SHA.');
    return { name: pkg.name, version: pkg.version, publish: false, published_sha: published.gitHead || '' };
  }
  const latest = stableVersion(metadata['dist-tags']?.latest);
  const firstDifference = parts.findIndex((part, index) => part !== latest[index]);
  if (firstDifference < 0 || parts[firstDifference] < latest[firstDifference]) {
    throw new Error('New release version must be greater than npm latest.');
  }
  return { name: pkg.name, version: pkg.version, publish: true, published_sha: '' };
}

export async function releaseTag({ repository, sha, version, token, create = false }, request = fetch) {
  stableVersion(version);
  if (typeof repository !== 'string' || repository.trim() !== repository || typeof sha !== 'string' || sha.trim() !== sha || !/^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*$/.test(repository || '') || !/^[a-f0-9]{40}$/.test(sha || '') || !token) {
    throw new Error('Tag check requires repository, exact commit SHA, and GitHub token.');
  }
  const base = `https://api.github.com/repos/${repository}/git`;
  const tag = `v${version}`;
  const headers = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'content-type': 'application/json' };
  const options = { headers, signal: AbortSignal.timeout(15000) };
  const response = await request(`${base}/ref/tags/${tag}`, options);
  if (response.status === 404) {
    if (!create) return;
    const created = await request(`${base}/refs`, {
      ...options, method: 'POST', body: JSON.stringify({ ref: `refs/tags/${tag}`, sha }),
    });
    if (created.status !== 201) throw new Error(`GitHub tag creation failed (HTTP ${created.status}).`);
    return;
  }
  if (!response.ok) throw new Error(`GitHub tag check failed (HTTP ${response.status}).`);
  let object = (await response.json()).object;
  // Existing annotated tags are accepted only when they resolve to this commit.
  for (let depth = 0; object?.type === 'tag' && depth < 5; depth++) {
    if (!/^[a-f0-9]{40}$/.test(object.sha || '')) throw new Error('Invalid annotated tag SHA.');
    const annotated = await request(`${base}/tags/${object.sha}`, options);
    if (!annotated.ok) throw new Error(`GitHub annotated tag check failed (HTTP ${annotated.status}).`);
    object = (await annotated.json()).object;
  }
  if (object?.type !== 'commit' || object.sha !== sha) {
    throw new Error(`Release tag ${tag} already points to a different commit. It will not be moved.`);
  }
}

async function main() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  if (process.argv[2] === 'check') {
    const status = await releaseStatus(pkg);
    console.log(`${status.name}@${status.version}: ${status.publish ? 'new release' : 'already published; skip'}`);
    if (process.env.GITHUB_OUTPUT) {
      for (const [key, value] of Object.entries(status)) {
        if (String(value).includes('\n') || String(value).includes('\r')) throw new Error('Invalid release output.');
        appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
      }
    }
    return;
  }
  if (!['tag-check', 'tag-create'].includes(process.argv[2])) throw new Error('Expected check, tag-check, or tag-create.');
  await releaseTag({
    repository: process.env.GITHUB_REPOSITORY, sha: process.env.GITHUB_SHA,
    version: pkg.version, token: process.env.GH_TOKEN, create: process.argv[2] === 'tag-create',
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
