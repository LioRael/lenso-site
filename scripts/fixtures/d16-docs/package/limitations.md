# npm fixture: limitations

`example.editor@1.0.0` is an isolated integration fixture. The signing key is
created during the test, the HTTPS document host is loopback-only, and no
package or source URL represents a public release. Passing the Site build
proves signature ingestion and document rendering, not registry availability,
Host compatibility, package execution, or an editor feature.

The version page is a build-time record. Before adopting any real package,
check that its signed snapshot is still current and verify its archive locally.
