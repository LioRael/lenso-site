# npm fixture: getting started

This document belongs to `example.editor@1.0.0` in the Site D16 integration
test. The test signs an npm-only release record for `@example/editor@1.0.0`,
then checks the exact version page, Markdown route, and search index.

The test does not provide a valid npm tarball or a published editor. Its digest
is calculated from the literal bytes `npm tarball fixture`. The adoption
command on the version page is a command shape to inspect, not one to run with
this test record. A real adoption needs a current signed snapshot, independent
trust file, exact `.tgz`, compatible Host, and a separate build and check.
