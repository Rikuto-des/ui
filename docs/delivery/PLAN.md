# Urushi: product delivery

Authorized scope (2026-10-28): complete all five proposed next steps. Preserve the existing dirty workspace and immutable historical evaluations. Prepare release artifacts and CI; publishing a public package is not part of the proposed scope.

## Completion criteria

1. A runnable project-management application using public Urushi components: list, search, filtering, sorting, selection and bulk action, create/edit, settings; loading, empty, error/retry; persisted local data and clear demo status. Review desktop/mobile rendering and actual interactions.
2. Public Combobox, DataTable, DatePicker and Command components with contracts, generated types/docs/CSS/registry, site examples and catalog previews. Keyboard and accessibility checks in Chromium, Firefox and WebKit.
3. CLI browser verification with stable JSON diagnostics, scenario steps, screenshots and repair context; demonstrate a real failure, AI correction and successful replay. Extend fair real-app competition to multiple actual models and preserve prompts/responses/results/limits.
4. Actual VoiceOver on the available Mac and available touch hardware. Identify Windows/NVDA access; do not substitute axe or emulation for real assistive technology evidence. Record actual observed speech/focus and unavailable platforms explicitly.
5. README, distributable packages, fresh-project installation, preserve-edit update/conflict checks, and CI configuration. Verify packed artifacts outside the monorepo.

## Progress

- [x] Inspect current state and prior evidence.
- [x] Implement four components, contracts/docs/registry/site examples and focused tests.
- [x] Implement/review persisted application and browser workflow verifier; actual AI correction replay passes.
- [x] Package and verify fresh install/update, add CI configuration.
- [x] Run real application comparison with both requested models, preserving responses and honest missing-data records.
- [ ] Obtain all planned gpt-6.1-sol responses: HTTP 429 left three generation samples and specification updates unavailable. Do not count missing output as implementation failure.
- [ ] Complete assistive-technology speech and physical touch verification: VoiceOver app access denied, Windows/NVDA unavailable, manual iPhone results pending.
- [x] Final integration review, evidence and delivery report.

## Current evidence

See [REPORT.md](REPORT.md) for outcomes, commands, limitations and device instructions.

- Unit 268, component E2E 400 (11 platform skips), Next 36, Studio 33, site 177 passed. Root typecheck/lint and generated output passed.
- Fresh consumer outside the repository installed all seven compiled packages; Vite, Next, packed CLI browser check, customization merge and conflict handling passed. `evals/product/release/result.json`.
- gpt-6-luna completed two trials per library: Urushi and Base UI pass generation and specification update without repairs. gpt-6.1-sol returned five initial samples and five repairs before rate errors. 54 total request attempts, 32 successful responses; no added requests for rescoring.
- Final fair replay records: product-luna-recheck-v2, product-sol-recheck-v2, product-luna-css-v2. Original requests/responses preserved. Corrected selector and animation timing false positives; excluded original sol repair scores from primary ranking.
- Selected Dialog CSS preserves all four passing Urushi workflow checks. JS+CSS+React approximately 90.4 KiB, with the identical common CSS included. Scope is one task, not a universal ranking.
- Real model correction replay: `evals/product/review/ai-replay/result.json`, fail before / pass after, unchanged CLI scenario and saved source hashes. Repair prompt used original Playwright diagnostics; CLI independently verifies it.
- Current app: localhost:3300; same-LAN URL 192.168.11.4:3300 returns HTTP 200 from Mac. It does not prove iPhone interaction.
- VoiceOver speech, NVDA and physical device touch remain unverified. GitHub CI configured but not run remotely; npm publication not requested/performed.
