# Package releases

Change code and bump `package.json` to a new stable version in the same PR.
Use `npm version patch --no-git-tag-version` (or `minor` / `major`) to update the
manifest; commit any changed lockfile too. Keep dependency locks current.

`publish.yml` checks types, tests when present, builds, and inspects package
contents on PRs. CLI also runs its built `--help` command. Merging to `main`
checks npm: an existing version skips publishing; a new version greater than
`latest` publishes and creates `v<version>` for the tested commit. Registry or
auth errors stop release. Prerelease publishing is not configured here; this
workflow accepts stable versions only.

npm publication uses existing trusted publishing for this repository and
`publish.yml`. No developer npm credentials or manual tags are required.
Keep the workflow filename and package repository URL consistent with npm's
trusted-publisher settings. Do not expose publish credentials to PR jobs.

For a failed release, rerun the original workflow run at the same commit. If npm
accepted the version before tag creation failed, the retry skips publishing
and repairs the tag only when npm records that exact commit. Existing tags
pointing elsewhere are never moved. Fix genuine package errors with a new
version; npm versions are immutable.

Run records distinguish the tested commit from the original published commit
when a version was skipped. Restore a consumer by pinning an earlier package
version and committing its lockfile; merge through normal CI/deployment.
