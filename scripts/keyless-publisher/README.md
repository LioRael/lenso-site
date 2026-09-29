# Publisher verifier policy

`catalog.mjs` is copied unchanged from `LioRael/lenso-marketplace` commit
`bda1f4f56d299a6a5e09fe94f14cd685c36c539e`, `tools/keyless/`.
`verify.mjs` and its tests are copied unchanged from policy commit
`5074b410c9b8f06762795db65dbc5ba294375acd`. Verifier SHA-256 is
`665986ab8fa7cc89c24d2358231f74fe0b1f402a0abc5769907ba23fd82c2988`.
Policy-source pins are distinct from each attested catalog's publishing source
commit; the migration catalog was published from the first commit above.
Keep updates explicit and review the publisher identity/issuer/ref/source pins.
These are public verification dependencies, not owner signing keys.
All trusted verifier results must have the Sigstore public-good certificate
issuer organization and public source visibility; private or mixed results fail.

The Site transport validates exact bytes and the current descriptor before
calling the real GitHub attestation verifier. Tests of descriptor parsing are
not evidence of cryptographic verification or production currentness.
