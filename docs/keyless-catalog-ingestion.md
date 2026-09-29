# Keyless catalog ingestion

The default build continues using existing signed feeds until the production
cutover explicitly sets `LENSO_MARKETPLACE_KEYLESS=1`. Mixed legacy/keyless
inputs fail. The canonical service stays `marketplace.lenso.dev`.

The keyless build fetches its non-cached HTTPS v3 current head, bounded exact
catalog and public bundle, then runs the real GitHub attestation verifier with
the official repository/workflow/main/source and GitHub issuer restrictions.
It rechecks the atomic head before writing generated records. Existing channel
record validators and document digest/host checks still apply. No legacy
signature envelope or expiration is synthesized.

## Delivery state, not a user setup step

The first bootstrap is a migration operation. Normal keyless builds fetch the
previous successfully deployed public checkpoint automatically from
`https://lenso.dev/.well-known/lenso-marketplace-checkpoint.json` with no caching
or redirects. The Site deployment authority authenticates accepted history;
every newly selected catalog still requires independent Sigstore verification.
Missing or corrupt existing state fails delivery rather than resetting history.

For the one migration build only, use
`LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_BOOTSTRAP=1`; it permits a 404 only, not a
corrupt or unreachable existing checkpoint. The normal post-build publication
command rechecks the previous checkpoint and then writes the next checkpoint
into the static artifact at that same path, only after output checks. Failed
builds cannot update the deployed checkpoint. The asset has a `no-store` header.
Deployment must serialize exact candidates: this code does not prevent an
older concurrent deployment from overwriting a newer deployment's checkpoint.

For isolated operator builds, the absolute pair
`LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_INPUT` and
`LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_OUTPUT` preserves the external-file
candidate mode. No input silently defaults to an empty history. Neither users
nor the owner supply or retain a signing private key.

## Browser boundary

The build keeps verified historical records, including withdrawn releases.
Their explicit status accompanies public API records. Browsers compare only
the canonical HTTPS head with the build-verified catalog identity, revision,
digest and publishing source; they never ingest or trust new catalog records.
Unknown or changed heads and withdrawn status hide adoption commands. Clipboard
copy rechecks the current head. Normal commands use
`lenso app add PLUGIN_ID@VERSION --marketplace`; the CLI independently verifies
provenance, current status and exact artifacts before mutation.

Local fixture heads are tests, not production receipts. The committed public
migration fixture has SHA-256
`cf96b4caf1fb0005f05bb9553427313ed112f543b66e49b2477003078ae8eb3d`.
Parsing/checkpoint tests do not substitute for real proof verification.
