# Design QA

## Source Truth

- Figma file: `CXTkEmNktgfMPiM5oAiras`
- Figma frame: `98:21`, `Lenso Site Redesign - Fresh Eve Copy`
- Source screenshot: `/tmp/lenso-figma-faithful-98-21.png`
- Implementation screenshot: `/tmp/lenso-site-faithful-final-1440.png`
- Mobile sanity screenshot: `/tmp/lenso-site-faithful-final-mobile.png`
- Full-view comparison evidence: `/tmp/lenso-compare-faithful-final-full.png`
- Focused comparison evidence: `/tmp/lenso-compare-faithful-final-hero.png`, `/tmp/lenso-compare-faithful-final-contract_top.png`, `/tmp/lenso-compare-faithful-final-contract_mid.png`, `/tmp/lenso-compare-faithful-final-runtime.png`, `/tmp/lenso-compare-faithful-final-systems.png`, `/tmp/lenso-compare-systems-detail-fix.png`, `/tmp/lenso-compare-systems-corners-clean.png`, `/tmp/lenso-compare-faithful-final-footer.png`
- Mask restoration evidence: `/tmp/lenso-site-mask-final-hero.png`, `/tmp/lenso-site-mask-final-lifecycle.png`, `/tmp/lenso-site-mask-final-runtime.png`, `/tmp/lenso-site-mask-final-systems.png`
- Latest host-card mask evidence: `/tmp/lenso-site-host-border-mask-aligned.png`, `/tmp/lenso-host-aligned-diff.png`
- Viewport/state: desktop `1440x900` full-page capture, mobile `390x844`, light theme, homepage initial state

## Findings

- No actionable P0/P1/P2 mismatches remain.

## Fidelity Surfaces

- Fonts and typography: Geist-family rendering matches the Figma intent. Browser antialiasing and exact text run endings differ slightly from the Figma raster.
- Spacing and layout: header, hero, lifecycle, runtime primitive, system library, CTA, and footer sections follow the current `1440x7591` frame and ordering. Measured desktop anchors: lifecycle height `4160px`, runtime section top `4800px`, systems section top `5446px`, footer top `6761px`. Rendered document height is `7591px`, matching the Figma frame.
- Colors and tokens: page background, surface, border, and ink tokens map to the Figma gray palette.
- Image quality and assets: exported Figma SVGs/PNGs are used for the header mark, footer mark, wordmark, raw hero WordArt fill/stroke masks, copy icon, file-tree icons, lifecycle leverage icons, runtime card icons, systems feature icons, channel brand marks, and footer theme icons. The previous blurry PNG logo exports and baked hero mask image were removed.
- Copy and content: headline, lifecycle copy, primitive/system sections, CTA, and footer labels match the refreshed Figma screenshot and checked node metadata.
- Responsiveness: mobile viewport screenshot shows no horizontal overflow from browser-side measurement; hero CTA no longer overlaps the paragraph.

## Patches Made Since Previous QA

- Deleted the old homepage component split and rebuilt the homepage route from the current Figma frame: header, hero, contract lifecycle, runtime primitives, systems library, CTA, and footer.
- Exported exact Figma SVG assets into `public/lenso-assets/` and removed the old blurry PNG assets.
- Removed the lifecycle preview sticky behavior that caused scroll drift into the runtime section.
- Fixed mobile horizontal overflow in the hero command row and proof chart.
- Added exact Figma detail assets for runtime cards, systems feature headings, and channel pills.
- Added exact Figma detail assets for lifecycle leverage links and footer theme controls.
- Restored Figma mask fades for the lifecycle preview, systems evidence table, and systems channel cloud.
- Replaced inferred proof chart scaling with measured Figma bar coordinates.
- Corrected the Evidence Table paragraph against the refreshed full-frame mockup.
- Changed the hero command chip to hard-clip text like the mockup instead of rendering an ellipsis.
- Fixed the systems preview row so the three panels join at full column width and the Evidence Table uses Geist sans typography.
- Matched the cleaned Figma radius rules for the systems preview row: outer strip corners remain rounded, internal joins are square.
- Restored header action pill styling, CTA line wrap, footer logo/status placement, and the `1440x7591` document height.
- Rebuilt the hero WordArt as raw vector mask assets plus code-side radial gradients, and restored the Figma `CSS mask border` layers for lifecycle and runtime cards as masked gradient border rings.
- Corrected the host preview so the mask applies only to the outer border ring; the inner code panel content is no longer masked.
- Reworked the host preview stack against node `98:459`: removed the uniform outer outline and replaced the SVG approximation with a border-only radial mask layer aligned to the Figma top-left stroke.
- Removed the host card's invisible layout border so the inner file/code panels return to the Figma `12px` inset, `660px` width, and `104px` code-panel y-position.
- Rebuilt the host preview as the actual Figma node architecture instead of a visual chunk: top file group `98:460`, placeholder/margin layer `98:467`, absolute code panel `98:470`, inner code block `98:471`, fixed text nodes `98:473-478`, and border-only mask layer `98:479`; the former visible background/fade fill is no longer rendered.
- Removed the remaining broad host-card fills: the outer host container and inner code block are transparent; only the `host.toml` row keeps its grey file-selection background.
- Realigned footer groups to Figma: headings use the 24px heading frame with 12px top padding, link frames use the `-2px` x-offset with 2px internal padding, first items start 38px below each group frame, and the second footer row starts at 312px.
- Restored footer text contrast to Figma: group titles stay `#171717`, and footer items now use the lighter `#666666` instead of the previous darker value.
- Synced the bottom-right Theme fieldset to Figma node `98:1190`: 72px by 24px fieldset, three 24px label cells, hidden radio inputs, and compact glyph bounds matching the Figma crop: system `(6,5)-(17,18)`, light `(4,4)-(19,19)`, dark `(5,5)-(18,18)`. Render crop: `/tmp/lenso-theme-toggle-v3.png`.

## Follow-up Polish

- P3: browser typography is slightly wider than the Figma raster because global letter spacing is kept at `0`, so a few text runs and small table labels end a few pixels differently.

## Final Result

final result: passed
