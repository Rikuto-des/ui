# FileInput

A native <input type="file">; the dropzone variant is a large target that files can be dropped on (no JavaScript).

- Tier: 1
- Rendering: server
- Requires: ::file-selector-button

## When to use

- Attaching files to a form

## When not to use

- Uploading in the background with progress → use `your own uploader with Progress`

## Parts

### `<FileInput>`

The file input. accept and multiple are native. Put it in a Field. Renders `<input data-slot="file-input">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "dropzone"` | `"default"` |  |
| `invalid` | `boolean` | `false` |  |
| `showFiles` | `boolean` | `false` | With UrushiRuntime, show selected file names, sizes, image previews and individual remove buttons. Files stay local. |
| `removeLabel` | `string` | `"取り除く"` | Accessible remove action; the file name is appended. |

className may only adjust: margin, width, layout, position.

## Accessibility

- Label it with a Field; say the accepted types in its description.

## States

`invalid`

## Tokens

`color.field`, `color.border-field`, `color.secondary`

## Examples

### Attachments

```tsx
<Field id="files" label="添付ファイル"><FileInput variant="dropzone" multiple /></Field>
```
