# Lenso documentation

The Lenso public site and documentation, built with Next.js and Fumadocs.
Markdown and MDX under `content/docs` are the source of truth for readers,
search, `llms.txt`, and per-page Markdown routes. The site also owns the public
Plugin browsing experience while catalog signing, publishing, and installation
authority remain in the Marketplace and the adopting Host.

The old Marketplace UI used `/?plugin=ID&version=VERSION` for exact release
links. If such a link reaches this Site, the browser opens the same exact
version only when this build has its release page. Otherwise it shows an
unavailable state; it never substitutes a different version or presents an
omitted release as signed. This is client-side link handling, not a Marketplace
host or API cutover. The old
Marketplace remains in place until a separately verified deployment change.
Plain `/?q=TERM` browse links open the Site Plugin directory with that search
term. Publisher, license, pagination, saved, and sample-catalog views are not
translated because the static signed Site directory does not reproduce their
live Marketplace semantics.

The documentation tree describes the current Lenso architecture only. Retired product generations
are intentionally excluded from the public site. `/docs` and `/docs/zh` are explicitly
**development previews**, not documentation for a published framework version.
The static `/docs/versions` and `/docs/zh/versions` pages accept an exact
`?version=` lookup and report unavailable versions instead of redirecting to
the preview or to “latest.” `/api/docs/versions` is the machine-readable
inventory: this build has one preview channel and no published-version
snapshots. Its corpus revision and each page's content revision are SHA-256
fingerprints of the route, title, description, and processed Markdown, not
release numbers or Git commits.
HTML, per-page Markdown, `llms.txt`, `llms-full.txt`, and the search index carry
the preview identity and revision; page outputs also carry their locale.
The public static Site has no connected project lock, so it cannot infer a
project's selected framework version. Published snapshots and lock-aware
selection require separate content, provenance, and product integration.
The page hashes do not prove translation freshness between languages.

## Development

```sh
pnpm dev
```

## Build

```sh
pnpm build
```

## Preview the production build

```sh
pnpm preview
```

The static build is written to `out/`. `pnpm deploy:dry-run` verifies the
Cloudflare Workers static-assets package without publishing it.

`pnpm check` validates the bilingual docs, all local links, the static
build, AI-readable catalogs, and draft exclusion.

## Structure

- `content/docs`: current Markdown and MDX documentation
- `content/docs/**/meta.ts`: navigation order and group metadata
- `app`: Next.js routes for the home page, Plugin browsing, docs, search, and
  AI-readable output
- `lib/source.ts`: Fumadocs content source and page tree
- `public/lenso-assets`: brand and explanatory assets

The Plugin page keeps its registry candidate separate from signed results.
To include current Portable releases in a static build, set
`LENSO_MARKETPLACE_PORTABLE_URL` to the Marketplace HTTPS
`/api/marketplace/v1/snapshot` endpoint. To include linked Cargo
releases, set `LENSO_MARKETPLACE_LINKED_CARGO_URL` to its HTTPS
`/api/marketplace/v1/linked-cargo` endpoint. npm-only releases use
`LENSO_MARKETPLACE_PACKAGE_URL` and the signed HTTPS
`/api/marketplace/v1/package` endpoint. Configure only the channels the
operator intends to publish; an omitted channel retains its checkpoint history.
To attach versioned Portable Markdown, also set
`LENSO_MARKETPLACE_RELEASE_DETAILS_URL` to the raw signed HTTPS
`/api/marketplace/v1/release-details` endpoint; this requires the Portable
base snapshot. The build verifies the separate details signature, validity
window and exact immutable base-release identity before displaying any
document reference. The details endpoint supplies signed URL, byte length and
SHA-256 metadata, **not** hosted or sanitized document bytes.
To display optional editable templates or development extensions, set
`LENSO_MARKETPLACE_RELEASE_CONTENT_URL` to a raw signed HTTPS
`/api/marketplace/v1/release-content` endpoint. Attached content must match
the exact immutable Portable, linked Cargo or npm package base identity.
A `content_only` release instead binds its own Plugin ID, version, signed
publisher/source metadata, versioned Markdown references and ordered archives
into one identity; it cannot share that ID/version with a base release. Site
checks signature, expiry and checkpoint history in either case. The Site build
verifies the signed Markdown bytes from approved hosts, but does not fetch
archives. Each page shows the signed archive URL, size, digest and separate CLI
preview/copy commands. A copied template becomes App-owned editable source;
a copied development extension remains inactive until the App owner reviews
and explicitly selects it. No source-content listing is a runtime installation.
For a local same-input check, generate a temporary signed fixture with absolute
`LENSO_SITE_LINKED_SNAPSHOT` and `LENSO_SITE_CONTENT_FIXTURE_PARENT` set for
`node scripts/create-release-content-fixture.mjs`. Set the resulting absolute
manifest path as `LENSO_SITE_CONTENT_FIXTURE`, set an absolute candidate CLI as
`LENSO_SITE_CONTENT_CLI`, then run `pnpm check:release-content-integration`.
This builds Site from both signed snapshots and uses the same files for real
CLI preview and copy of both content kinds in a disposable App. Set absolute
`LENSO_SITE_CONTENT_RECEIPT` outside this repository to save a no-overwrite
JSON receipt. The fixture key is generated in memory and is not an operator
trust root; this check does not fetch public archives or select an extension.
For every configured signed channel, set
`LENSO_MARKETPLACE_CATALOG_ID`, `LENSO_MARKETPLACE_KEY_ID`, and
`LENSO_MARKETPLACE_PUBLIC_KEY_HEX` to the independently trusted public
identity shared by these Marketplace channels. The build verifies each exact
signed payload, catalog identity, and validity window; missing configuration
produces an empty signed section, while an incomplete or invalid configuration
fails the build. The generated data is ignored by Git. The directory hides
expired results in the browser; prebuilt version pages remain readable with
their build-time expiry and are not current installation authority. Renewal
requires a new Site build. Site does not persist a catalog checkpoint across
builds automatically. For every signed build, provide an absolute
`LENSO_MARKETPLACE_CHECKPOINT_OUTPUT` path outside the repository and exactly
one of:

- `LENSO_MARKETPLACE_CHECKPOINT_INPUT`: the operator-persisted output from the
  previously accepted deployment, at a different absolute path; or
- `LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP=1`: an explicit first trusted build
  only. Never use bootstrap to recover from a missing prior checkpoint.

Site validates the previous Portable, release-details, linked Cargo, npm
package and release-content checkpoints, including historical immutable release,
content and document identities, revision rollback and same-revision
equivocation. An omitted channel keeps
its previous history. Only after static generation and published-output checks
pass does the build atomically create (without overwriting) the **candidate**
checkpoint output. The build does not promote or persist it: the operator must
serialize deployments, retain the previous trusted checkpoint, and supply the
new candidate as the next INPUT **only after the matching Site deployment
succeeds**. Without that external continuity, including after an accidental
bootstrap reset, no cross-deployment anti-rollback guarantee exists. Unsigned
local builds need none of these settings and retain an empty signed directory.
The directory searches the configured signed channels with the same filters
and links each listed identity to an exact-version page,
while labeling their different distribution and target evidence. A Portable
base snapshot does not declare target compatibility or carry versioned
documentation. Without matching signed release details, its version page
reports no versioned Markdown rather than substituting linked or candidate
content. With details, linked and Portable documents have separate route
identities even for the same Plugin ID, version, document ID and revision.
This is display evidence only: the adopting Host must independently verify
the current signed snapshot and exact Bundle or crate before admission.
Each listed release gets an exact version page. The page links only to
Markdown revisions whose bytes and digests were verified during the same build;
the public Markdown route is read-only.

`/api/plugins/search` is a static, read-only search index made from those same
verified public Markdown bodies and their exact Plugin/version routes. The
Plugin directory loads it only when a reader searches, keeps unsigned
candidate copy out of its results, and hides matches from expired signed
channels. The index and version pages remain build-time records, not a live
registry or an installation authority; refresh the Site build to pick up a
new signed snapshot or documentation revision. Set
`LENSO_MARKETPLACE_DOCUMENT_HOSTS` to a comma-separated exact host:port
allowlist for documentation, using only operator-trusted document
infrastructure. The build never follows redirects, rejects unapproved hosts,
and enforces per-document and aggregate byte limits before rendering Markdown
with HTML, images and executable MDX disabled. A DNS name allowlist alone
does not prevent a trusted host from resolving to a private/rebound address or
an operator proxy from redirecting traffic; deploy the Site build with
network egress policy and trusted DNS/proxy settings. Do not allow arbitrary
publisher-supplied hosts. The local `lenso app add` example needs
the actual signed snapshot, trust file, and matching `.crate` from an approved
source. Site never adopts a Plugin on behalf of a local project. Run
`pnpm check:linked-site-integration` to build against temporary locally signed
HTTPS Portable, release-details and linked fixtures and prove the shared
directory, exact versions, and separate linked/Portable document page/API
paths. This is fixture evidence, not a claim of a live production catalog or
operator checkpoint persistence. Signed details can be amended additively by
Market; Site needs a fresh build to display new revisions.

For a separate opt-in, package-backed linked adoption check, set absolute
`LENSO_SITE_CLI`, `LENSO_SITE_LINKED_SNAPSHOT`, `LENSO_SITE_LINKED_TRUST`,
`LENSO_SITE_AUTH_CRATE`, `LENSO_SITE_SECRETS_CRATE`, and
`LENSO_SITE_CARGO_CONFIG`, then run `pnpm check:real-linked-adoption`.
The snapshot must contain exact `lenso.auth.api-token@0.1.1` and
`lenso.secrets.env@0.1.7` releases matching those two `.crate` files; the
Cargo config must point to an available offline dependency source. The check
serves the unchanged signed snapshot over temporary loopback HTTPS for one
static Site build, then gives that same snapshot file, trust file and both
archives to the supplied CLI for `app add`, `app build`, `app check` and
`app show` in a disposable App. It does not publish the fixture, prepare an
Auth database, or make the Site an installation authority. Set absolute
`LENSO_SITE_RECEIPT` outside this repository to save a JSON result; existing
receipt files are never overwritten. This check runs native build-time code
from the selected archives, so use only a reviewed local release cohort.

## Documentation model

Write navigation around a reader's job, not an internal subsystem. The first
page of a workflow should produce one observable result. Split another page
when the reader must choose a different language, authoring path, or product
role.

- Tutorials own one complete sequence from prerequisite to observable behavior.
- Agent-assisted Lenso development is the first workflow; developing the Agent
  product itself remains a separate, later section.
- Web backend development is a top-level workflow beside Agent product
  development. Its pages follow the Endpoint, Host integration, and real-socket
  proof sequence.
- Plugin guides separate portable Rust, linked Rust, and Bun authoring paths.
- Concept pages define a term once and link back to concrete workflows.
- Reference pages hold compatibility and platform boundaries, repository
  ownership, and architecture decisions; tutorials should not make readers
  traverse them to finish a task.
- Verification appears at the end of the behavior it proves. It is completion
  evidence, not the subject of the page.
- Commands and public APIs must come from current `--help`, package source, or
  an owner repository's executable example. Planned APIs are labeled as such.
- English and Chinese documents have identical relative paths. `check:docs`
  rejects a page that exists in only one language.
