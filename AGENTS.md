# Lenso site

Work only in the assigned checkout. Preserve other changes. Local commits are allowed; merging, pushing, npm publishing and deployment need separate authorization. Console, Relay and the framework source checkout are outside this task.

Consume @lenso/docs@0.1.0 through public exports and lenso-docs CLI. Do not replace its shell, search, Markdown or renderer with a second engine, copy package source, use latest or add source-wide UI compilation. Generated .lenso/ and out/ are owned outputs. Do not infer API compatibility from version strings alone: use the verified installation/API inventory and frozen source ref 549b9870acb6af239faf79245179a4f1f7e60cdb.

Content parity lives in content/en and content/zh; docs.source.mjs owns slugs/order. Keep application examples on the existing Notes/Tasks contracts, identify runnable complete examples versus excerpts, and keep identity, ownership and host limitations explicit. Legacy Rust content under legacy/rust-site is reference-only and must not enter current search/navigation.

Use pnpm 11.7.0 and Node 26.10+. There is one pnpm-lock.yaml; runtime examples use Bun separately. Run pnpm check plus appropriate browser checks for visible changes. When routing or custom Next consumers change, read the installed next/dist/docs guides resolved through @lenso/docs dependencies. Read docs/agents/domain.md for terminology rules; issue/triage conventions remain under docs/agents.
