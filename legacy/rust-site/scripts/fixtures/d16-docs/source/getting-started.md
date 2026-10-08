# Source-content fixture: getting started

`example.editor.source@1.0.0` is the standalone `content_only` record in the
Site D16 integration test. Its signed metadata and archive references do not
join a Portable, Cargo, or npm base. The test checks that its title, source
identity, exact version page, Markdown route, and search entry are present.

The `starter` and `dev-extension` archive digests are calculated from literal
fixture bytes, not valid `.tar.gz` files. Do not run the page's copy command
with them. A real source-content release requires a current signed snapshot,
independent trust file, exact archive, CLI preview, and human review before
copying files into an App.
