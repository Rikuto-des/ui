"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Alert, Badge, Button, Card, Checkbox, Field, Input, Item, Progress, Select, Slider, Switch, ToggleGroup } from "@urushi/react";
import { packCss } from "@urushi/tokens";
import { applyChoices, choicesFrom, contrastChecks, type Base, type Choices, type Pair } from "@/lib/pack-editor";

const colors: [keyof Choices & ("accent" | "action" | "bg" | "surface" | "text"), string][] = [
  ["accent", "アクセント（選択とフォーカス）"],
  ["action", "主ボタン"],
  ["bg", "背景"],
  ["surface", "面（カードや入力欄）"],
  ["text", "文字"],
];

function download(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

/** A choice of a few named options, as a ToggleGroup that reports its value. */
function Options<T extends string>({ legend, name, value, options, onChange }: { legend: string; name: string; value: T; options: [T, string][]; onChange: (value: T) => void }) {
  return (
    <ToggleGroup legend={legend} name={name} type="single" size="sm" defaultValue={value} onChange={(e) => onChange((e.nativeEvent.target as HTMLInputElement).value as T)}>
      {options.map(([v, label]) => (
        <ToggleGroup.Item key={v} value={v}>
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
}

export function PackEditor() {
  const [choices, setChoices] = useState<Choices>(() => choicesFrom("graphite"));
  const [name, setName] = useState("my-pack");
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);
  const validName = /^[a-z][a-z0-9-]{0,30}$/.test(name);
  const packName = validName ? name : "my-pack";
  const tree = useMemo(() => applyChoices(choices), [choices]);
  const css = useMemo(() => packCss(packName, tree as Parameters<typeof packCss>[1]).replace(/^\/\* generated from .* \*\/\n/, `/* Urushi pack "${packName}" — made with the pack editor, based on ${choices.base} */\n`), [packName, tree, choices.base]);
  const checks = contrastChecks(choices);
  const failing = checks.filter((c) => c.ratio < c.min);
  const set = (patch: Partial<Choices>) => setChoices((c) => ({ ...c, ...patch }));
  const setPair = (key: (typeof colors)[number][0], mode: keyof Pair, value: string) => setChoices((c) => ({ ...c, [key]: { ...c[key], [mode]: value } }));

  return (
    <div className="pack-editor">
      <style>{css}</style>
      <form className="pack-editor-controls" aria-label="パックの設定" onSubmit={(e) => e.preventDefault()}>
        <Field id="pack-base" label="元にするパック" description="選び直すと、色と大きさがそのパックの値に戻ります。">
          <Select value={choices.base} onChange={(e) => setChoices(choicesFrom(e.target.value as Base))}>
            <option value="graphite">Graphite</option>
            <option value="lucent">Lucent</option>
          </Select>
        </Field>
        <Field id="pack-name" label="パックの名前" description="小文字の英字・数字・ハイフン。data-pack に書く名前です。" error={validName ? undefined : "小文字の英字で始め、英字・数字・ハイフンだけにしてください。"}>
          <Input value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} autoComplete="off" />
        </Field>
        <fieldset className="pack-editor-colors">
          <legend>色</legend>
          <span aria-hidden="true" />
          <span className="pack-editor-mode" aria-hidden="true">ライト</span>
          <span className="pack-editor-mode" aria-hidden="true">ダーク</span>
          {colors.map(([key, label]) => (
            <ColorRow key={`${choices.base}-${key}`} label={label} pair={choices[key]} onChange={(mode, v) => setPair(key, mode, v)} />
          ))}
        </fieldset>
        <Field id="pack-radius" label={`角の丸み（${choices.radius}px）`} description="ボタンや入力欄の丸み。カードやダイアログはこれより大きく丸めます。">
          <Slider min={0} max={20} step={1} value={choices.radius} onChange={(e) => set({ radius: Number(e.target.value) })} />
        </Field>
        <Field id="pack-font" label={`文字の大きさ（${choices.fontSize}px）`} description="本文の大きさ。見出しと補足の文字もこれに合わせます。">
          <Slider min={13} max={17} step={0.5} value={choices.fontSize} onChange={(e) => set({ fontSize: Number(e.target.value) })} />
        </Field>
        <Options key={`density-${choices.base}`} legend="密度" name="pack-density" value={choices.density} onChange={(density) => set({ density })} options={[["compact", "詰める"], ["regular", "標準"], ["roomy", "ゆったり"]]} />
        <Options key={`motion-${choices.base}`} legend="動き" name="pack-motion" value={choices.motion} onChange={(motion) => set({ motion })} options={[["none", "なし"], ["fast", "速い"], ["regular", "標準"]]} />
        <Options key={`shadow-${choices.base}`} legend="影" name="pack-shadow" value={choices.shadow} onChange={(shadow) => set({ shadow })} options={[["none", "なし"], ["soft", "弱い"], ["regular", "標準"], ["strong", "強い"]]} />
      </form>

      <div className="pack-editor-result">
        <div className="pack-editor-preview-head">
          <h2>プレビュー</h2>
          <Options legend="プレビューの明るさ" name="pack-scheme" value={scheme} onChange={setScheme} options={[["light", "ライト"], ["dark", "ダーク"]]} />
        </div>
        <div className="pack-editor-preview" data-pack={packName} style={{ colorScheme: scheme }}>
          <Preview />
        </div>

        <section aria-labelledby="pack-contrast">
          <h2 id="pack-contrast">読みやすさの確認</h2>
          {failing.length ? (
            <Alert tone="warning" title={`${failing.length} か所でコントラストが足りません`}>
              文字は 4.5:1、フォーカスの輪は 3:1 以上が WCAG の基準です。色を濃くするか薄くしてください。
            </Alert>
          ) : (
            <Alert tone="ok" title="すべての組み合わせが WCAG の基準を満たしています" />
          )}
          <ul className="pack-editor-checks">
            {checks.map((check) => (
              <li key={check.label}>
                <span>{check.label}</span>
                <span className="pack-editor-ratio">{check.ratio.toFixed(2)}:1</span>
                <Badge tone={check.ratio >= check.min ? "ok" : "danger"}>{check.ratio >= check.min ? "基準を満たす" : `${check.min}:1 未満`}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pack-output">
          <h2 id="pack-output">書き出す</h2>
          <p>CSS を読み込み、<code>{`<html data-pack="${packName}">`}</code> にすると、すべてのコンポーネントがこのパックになります。<code>tokens.json</code> は <code>packages/packs/{packName}/</code> に置くと、<code>urushi build</code> で同じ CSS を作れます。</p>
          <div className="pack-editor-actions">
            <Button
              variant="primary"
              onClick={async () => {
                await navigator.clipboard.writeText(css);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              CSS をコピー
            </Button>
            <Button onClick={() => download(`${packName}.css`, "text/css", css)}>CSS を保存</Button>
            <Button onClick={() => download("tokens.json", "application/json", JSON.stringify(tree, null, 2) + "\n")}>tokens.json を保存</Button>
            <span role="status" className="pack-editor-copied">
              {copied ? "コピーしました" : ""}
            </span>
          </div>
          <pre className="pack-editor-code" tabIndex={0} aria-label="パックの CSS">
            <code>{css}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}

function ColorRow({ label, pair, onChange }: { label: string; pair: Pair; onChange: (mode: keyof Pair, value: string) => void }) {
  return (
    <>
      <span className="pack-editor-color-label">{label}</span>
      {(["light", "dark"] as const).map((mode) => (
        <label key={mode} className="pack-editor-swatch">
          <input type="color" value={pair[mode]} onChange={(e) => onChange(mode, e.target.value)} aria-label={`${label}（${mode === "light" ? "ライト" : "ダーク"}）`} />
          <code>{pair[mode]}</code>
        </label>
      ))}
    </>
  );
}

function Preview(): ReactNode {
  return (
    <div className="pack-editor-sample">
      <Card title="プロジェクトを作る" description="名前と公開範囲を決めます。" headingLevel="h3">
        <div className="pack-editor-stack">
          <Field id="pack-sample-name" label="プロジェクト名">
            <Input defaultValue="秋のキャンペーン" />
          </Field>
          <Checkbox defaultChecked>チームのメンバーに公開する</Checkbox>
          <div className="pack-editor-row">
            <Button variant="primary">作成する</Button>
            <Button>下書きに保存</Button>
            <Button variant="ghost">やめる</Button>
          </div>
        </div>
      </Card>
      <Item.Group label="通知">
        <Item title="コメント" description="自分のタスクにコメントが付いたとき" action={<Switch aria-label="コメント" defaultChecked />} />
        <Item title="締め切り" description="担当のタスクが近いとき" action={<Badge tone="accent">毎日</Badge>} />
      </Item.Group>
      <Progress label="今月の目標" value={64} valueText="64%" showValue />
      <div className="pack-editor-row">
        <Badge>下書き</Badge>
        <Badge tone="ok">公開中</Badge>
        <Badge tone="danger">期限切れ</Badge>
        <Button variant="danger" size="sm">
          削除する
        </Button>
      </div>
    </div>
  );
}
