export const tasks = [
  {
    id: 'dialog',
    prompt: `Build a project deletion screen. Export default App. The page has h1 "Projects", a paragraph "Atlas project", and a button "Delete Atlas". Clicking it opens a modal dialog named "Delete project" with a description, a Cancel button and a "Confirm delete" button. Focus Cancel first. Escape and Cancel close it, preserve the project and return focus to Delete Atlas. Confirm removes Atlas and closes the dialog; announce "Project deleted" in role=status. There must be exactly one deletion per confirmation. Use the assigned library's dialog primitive. Support keyboard and a 320px screen. Do not implement your own dialog, focus trap or tab primitive.`,
    update: `Update this screen without losing any existing behavior: confirmation now simulates a server request of 1200ms. While pending, show "Deleting…", disable duplicate confirmation and cancellation, and prevent Escape or backdrop dismissal. The first attempt fails: keep the modal open, announce "Deletion failed" with role=alert and retain Atlas. A second confirmation succeeds, closes the modal and announces Project deleted. Cancel outside a pending request still works. This is an application specification update, not a dependency-version migration.`,
  },
  {
    id: 'tabs',
    prompt: `Build an account screen. Export default App. h1 "Account". Use the assigned library's tabs with an accessible tablist named "Account sections", tabs Profile, Security, Billing. Profile starts active and contains a labelled textbox "Display name" initially Alex. Security contains text "Security settings". Billing is disabled. ArrowRight from Profile selects Security, skips Billing and wraps to Profile. Store the display name so editing it, visiting Security and returning to Profile retains the edit. A button "Refresh" outside the tabs increments a visible "Refresh count: N" without changing the active tab or the name. Support a 320px screen, keyboard and accessible names. Do not recreate tab behavior with raw HTML.`,
    update: `Preserve all behavior. Add a button "Open security" outside the tablist that selects Security. Add a button "Open profile" outside the tablist that selects Profile. These must work repeatedly even after the user has changed tabs by clicking and using arrows. Add "Save name" to Profile: it announces "Saved: <current display name>" with role=status without resetting selection or input. Billing remains disabled. This is an application specification update.`,
  },
  {
    id: 'menu',
    prompt: `Build a task list. Export default App. h1 "Tasks". Two rows contain text "Atlas task" and "Boreal task". Each has a button named "Actions for Atlas" or "Actions for Boreal" opening the assigned library's menu. Menu items: "Rename" (disabled) and "Archive". Arrow keys skip disabled Rename; Escape closes and returns focus to the opening button. Archive removes only the corresponding row, closes the menu and announces "Archived Atlas" or "Archived Boreal" in role=status. Keep the other row unchanged. Use the library's menu primitive, not a custom menu. Support a 320px screen, keyboard and accessible names.`,
    update: `Preserve all behavior. After archiving, show a button "Undo archive" outside the menu that restores the most recently archived task to its original row position and announces "Restored Atlas" or "Restored Boreal" in role=status. The restored row's menu must work again, by keyboard as well as pointer. A second archive then undo must also work. Hide Undo archive when nothing can be undone. This is an application specification update.`,
  },
] as const;

export const protocol = {
  version: 2,
  model: 'gpt-6.1-sol', effort: 'medium', provider: 'Codex CLI 0.160.0 via ChatGPT login', maxSecondsPerResponse: 240,
  trials: 2, libraries: ['urushi','base','radix','shadcn'],
  generationAttempts: 1, repairAttempts: 1, updateAttempts: 1, updateRepairAttempts: 1,
  commonGate: ['TypeScript strict', 'required library primitive usage', 'keyboard and state behavior', 'axe WCAG A/AA', '320px overflow'],
  secondary: ['wall time', 'reported tokens and cost', 'bundle gzip', 'authored source bytes', 'library-specific diagnostics'],
  ordering: 'rotated library order per task and trial; at most 4 simultaneous requests',
  context: 'same task and system template; version-specific API references per library; no tools, no prior history; repair gets code and diagnostic output',
  scoringRevision: 'Wait for finite animations before axe; hidden rows count as removed; verify restored row order; wait for menu initial focus and two animation frames after arrow navigation before negative focus assertions. This is an exploratory development evaluation, not a preregistered benchmark. measured-v4 freezes these checks before every model response.',
  scoring: 'all common gates must pass; failures and missing responses remain in denominator; internal library lint is additional repair feedback, never a competitor scoring rule',
  updateMeaning: 'application specification change; no claim about real dependency-version migrations',
  limitations: ['one model', 'three small workflows', 'no free browsing or tool use by model', 'authored reference extracts', 'no screen reader user study', 'no subjective design superiority score'],
};
