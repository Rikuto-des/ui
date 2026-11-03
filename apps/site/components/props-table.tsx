import type { PropSchema, Schema } from "@/lib/content";
import { TableScroll } from "./table-scroll";

const tsType = (p: PropSchema): string =>
  p["x-ts-type"] ?? (p.const !== undefined ? JSON.stringify(p.const) : p.anyOf ? p.anyOf.map(tsType).join(" | ") : p.enum ? p.enum.map((v) => JSON.stringify(v)).join(" | ") : p.type === "integer" ? "number" : (p.type ?? "unknown"));

const categories: Record<string, string> = { margin: "外側の余白", width: "幅", height: "高さ", layout: "並びの中の配置", position: "位置" };

/** The props of every part, straight from the contract. */
export function PropsTables({ schema }: { schema: Schema }) {
  return (
    <>
      {schema.parts.map((part) => {
        const entries = Object.entries(part.props.properties ?? {});
        const required = new Set(part.props.required ?? []);
        return (
          <section key={part.jsx} className="part" aria-labelledby={`part-${part.slot}`}>
            <h3 id={`part-${part.slot}`}>
              <code>{`<${part.jsx}>`}</code>
            </h3>
            <p className="part-meta">
              <code>{`<${part.element} data-slot="${part.slot}">`}</code> を描画します。{part.description}
            </p>
            {entries.length ? (
              <TableScroll label={`${part.jsx}のAPI`}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">prop</th>
                      <th scope="col">型</th>
                      <th scope="col">既定値</th>
                      <th scope="col">説明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([key, p]) => (
                      <tr key={key}>
                        <td>
                          <code>{key}</code>
                        </td>
                        <td>
                          <code>{tsType(p)}</code>
                        </td>
                        <td>{p.default !== undefined ? <code>{JSON.stringify(p.default)}</code> : required.has(key) ? "必須" : "—"}</td>
                        <td>{p.description ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            ) : null}
            <p className="part-meta">
              className で調整できる項目：{part.overrides.length ? part.overrides.map((o) => categories[o] ?? o).join("・") : "なし（見た目はパックが決めます）"}
            </p>
          </section>
        );
      })}
    </>
  );
}

export function KeyboardTable({ keyboard }: { keyboard: Record<string, string> }) {
  return (
    <TableScroll label="キーボード操作の一覧">
      <table>
        <thead>
          <tr>
            <th scope="col">キー</th>
            <th scope="col">動作</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(keyboard).map(([key, action]) => (
            <tr key={key}>
              <td>
                <kbd>{key}</kbd>
              </td>
              <td>{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}
