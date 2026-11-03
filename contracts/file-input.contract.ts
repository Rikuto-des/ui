import { defineContract, z } from "@urushi/contract";

export default defineContract({
  name: "file-input",
  styleDependencies: ["input"],
  tier: 1,
  summary: "A native <input type=\"file\">; the dropzone variant is a large target that files can be dropped on (no JavaScript).",
  use: ["Attaching files to a form"],
  avoid: [{ case: "Uploading in the background with progress", instead: "your own uploader with Progress" }],
  rendering: "server",
  platform: { requires: ["::file-selector-button"] },
  parts: [
    {
      jsx: "FileInput",
      slot: "file-input",
      element: "input",
      description: "The file input. accept and multiple are native. Put it in a Field.",
      props: z.object({
        variant: z.enum(["default", "dropzone"]).default("default"),
        invalid: z.boolean().default(false),
        showFiles: z.boolean().default(false).describe("With UrushiRuntime, show selected file names, sizes, image previews and individual remove buttons. Files stay local."),
        removeLabel: z.string().default("取り除く").describe("Accessible remove action; the file name is appended."),
      }),
      overrides: ["margin", "width", "layout", "position"],
    },
  ],
  states: ["invalid"],
  a11y: { rules: ["Label it with a Field; say the accepted types in its description."] },
  tokens: ["color.field", "color.border-field", "color.secondary"],
  examples: [{ title: "Attachments", code: `<Field id="files" label="添付ファイル"><FileInput variant="dropzone" multiple /></Field>` }],
});
