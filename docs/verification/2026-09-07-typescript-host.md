# TypeScript Host tutorial verification

Environment: macOS ARM64, Bun 1.4.1-canary.1, fresh `/tmp/lenso-host-docs-proof` project. npm input: `@lenso/cli 0.16.1`, installed from the registry. No runtime source changes were made.

Native inputs were compiled with the Lenso Cargo wrapper and locked dependencies:

- `lenso-bun-adapter` revision `3c1f2f011f4f9d496db337f296ad686ab0a985e0`, package `lenso-host-runtime 0.1.5`.
- `lenso-runtime-rust` revision `1e3915a5a3ae4264262d6ce3e6bc59cc7b45262d`, package `lenso-runner 0.2.13`, binary `lenso-process-owner`, feature `process-owner`.
- Resolver and generated control library came from the installed npm CLI. The local notices input was the runtime source LICENSE, not a complete redistribution notice set.

## Results

1. `plugin new example.host-echo --runtime bun`, check, and pack succeeded. The resulting Bundle 4 declares authoring version 2, `lenso.bun-authoring@2`, execution class `lenso.bun-process@1`, artifact target `javascript-bun`, and `host_targets: ["*"]`.
2. Host build rejected this Bundle with `V4 Bundle has no implementation admitted by Host policy`, for both `aarch64-apple-darwin` and `javascript-bun`. CLI source `src/app/build.rs` admits the core `PLUGIN_AUTHORING_V2_RUNTIME_PROFILE` (`lenso.plugin-authoring@2`) for Bun. No manifest editing was attempted.
3. CLI Plugin dev failed with `Cannot start a runtime from within a runtime`, traced to bundled `lenso-bun-adapter 0.1.7` `authoring_v2.rs:485`. No successful business invocation was observed.
4. Empty Host build/check/show succeeded. Prepare succeeded with the actual runtime, owner, and npm resolver; no mocked executable or resolver was used.
5. `bun lifecycle.ts` started through the generated `host.js`, inspected, stopped, then repeated against the same Root and registry. Both runs returned no Instances/diagnostics and the same generation digest `sha256:c946c2dc93bfd4f8d41f5c40bf7de55e059b615d73e12442c4af904d087f59a2`; revisions advanced from 4 to 7.
6. Both stops returned `{"shutdown":"suspended","ownership":{"termination":"confirmed","cause":"stop_requested","forced":true}}`. Durable suspension and physical termination are confirmed; completely graceful exit is not.
7. A final process inventory found no remaining proof runtime/owner processes.

This is exact-Generation restart evidence, not crash-injection, cross-version upgrade, or successful Bun Plugin Host evidence. The bilingual public guide records these limitations and the actual preparation and lifecycle steps. The standalone document-sync tests were not rerun and do not substitute for this path.
