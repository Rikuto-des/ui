# Chart

A bar or line chart drawn with HTML and CSS on the server, with the numbers as a table for screen readers. The first series takes the accent color and the others are greys, so the series to look at stands out; palette="multi" gives each series its own color. Hovering a column shows its values (CSS only). Values start at zero.

- Tier: 2
- Rendering: server
- Requires: 

## When to use

- A few series over a short range of labels: months, weeks, categories

## When not to use

- Exact values people compare or copy → use `table`
- Progress toward one goal → use `progress`

## Parts

### `<Chart>`

The chart (<figure>): its title, a legend, the plot and a visually hidden table of the same numbers. Renders `<figure data-slot="chart">`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"bar" \| "line"` | `"bar"` |  |
| `title` | `string` | **required** | Required. Says what is measured and in what unit, e.g. "月ごとの売上（万円）". |
| `labels` | `readonly string[]` | **required** | The labels along the bottom, one per value. |
| `series` | `readonly { name: string; values: readonly number[] }[]` | **required** | Up to 5 series; each has one value per label. The first is the one to look at. |
| `unit` | `string` | — | Written after each value in the tooltip and the table, e.g. "万円". |
| `hideTitle` | `boolean` | `false` | Hide the title visually (it still names the figure and the table), for a chart under a heading that already says it. |
| `height` | `number` | `220` | Height of the plot in px. |
| `palette` | `"quiet" \| "multi"` | `"quiet"` | quiet: accent and greys. multi: a color per series. |

className may only adjust: margin, width, layout, position.

## Accessibility

- title is required; it names the figure and the table.
- The plot is hidden from assistive technology; the table carries the numbers.
- Do not tell series apart by color alone in the text around the chart; name them.

## States

`hover`

## Tokens

`color.accent`, `color.text`, `color.border`, `color.surface-overlay`

## Examples

### Monthly sales

```tsx
<Chart title="月ごとの売上（万円）" unit="万円" labels={["6月", "7月", "8月"]} series={[{ name: "今年", values: [42, 51, 47] }, { name: "去年", values: [38, 40, 45] }]} />
```
