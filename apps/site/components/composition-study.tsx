type LibraryResult = {
  library: string; n: number; requested: number; generate: number; afterRepair: number;
  update: number; final: number; calls: number; medianOutputTokens: number | null;
  passedSizes: {withReact: number; withoutReact: number}[];
};
export type CompositionStudy = {
  models: {model: string; libraries: LibraryResult[]}[];
  libraries: LibraryResult[];
  requestLedger: {total: number; exploratory: number; confirmation: number};
  decision: {outputReduction: number | null; criterionMet: boolean};
};
const label = (library: string) => library === 'urushi' ? 'Urushi' : 'Base UI';
const range = (values: number[]) => {
  if (!values.length) return '—';
  const low = (Math.min(...values) / 1024).toFixed(1), high = (Math.max(...values) / 1024).toFixed(1);
  return `${low === high ? low : `${low}–${high}`} KiB`;
};

export function CompositionStudyResults({study}: {study: CompositionStudy}) {
  return <section aria-labelledby="composition-study-title">
    <h2 id="composition-study-title">4コンポーネントを組み合わせた追加比較</h2>
    <p>2026年10月29日にDialog、Tabs、Menu、Comboboxを使う設定画面を生成し、非同期検索と未保存時の確認を追加させました。各モデル・各ライブラリ3試行、生成後と仕様変更後の修正はそれぞれ最大1回です。</p>
    <p>SolではUrushiが仕様変更後も3/3を修正なしで通過しました。Base UIは1/3で、2件の修正後に3/3となりました。一方、Lunaは両者とも更新後0/3でした。モデルや課題を問わず優位とは結論づけていません。</p>
    <div className="table-scroll"><table>
      <caption>固定した共通検査をすべて通過した試行数</caption>
      <thead><tr><th scope="col">モデル</th><th scope="col">ライブラリ</th><th scope="col">初回生成</th><th scope="col">修正後</th><th scope="col">仕様変更</th><th scope="col">再修正後</th></tr></thead>
      <tbody>{study.models.flatMap(group => group.libraries.map(row => <tr key={`${group.model}-${row.library}`}>
        <th scope="row">{group.model}</th><th scope="row">{label(row.library)}</th>
        <td>{row.generate} / {row.n}</td><td>{row.afterRepair} / {row.n}</td><td>{row.update} / {row.n}</td><td>{row.final} / {row.n}</td>
      </tr>))}</tbody>
    </table></div>
    <p>生成後は6項目、仕様変更後は9項目を検査しました。型、下書きの分離、キーボード、フォーカス、通信失敗と再試行、応答順の逆転、axe、幅390pxを検査しました。部分的な合格を成功件数に含めていません。</p>
    <h3>作成量と配信量を分けて測る</h3>
    <div className="table-scroll"><table>
      <caption>同じ確認試行でのトークン数と、合格した最終画面のサイズ</caption>
      <thead><tr><th scope="col">ライブラリ</th><th scope="col">AI出力トークン・中央値</th><th scope="col">JS＋CSS＋React</th><th scope="col">サイズの対象</th></tr></thead>
      <tbody>{study.libraries.map(row => <tr key={row.library}><th scope="row">{label(row.library)}</th><td>{row.medianOutputTokens?.toLocaleString('en-US') ?? '—'}</td><td>{range(row.passedSizes.map(size => size.withReact))}</td><td>{row.passedSizes.length}画面</td></tr>)}</tbody>
    </table></div>
    <p>2モデル全試行のAI出力トークン中央値はUrushiが36.7%少なく、両者とも最終合格は3/6でした。合格したSolの各3画面では、CSS・React込みのサイズがUrushi 84.2〜84.4 KiB、Base UI 154.3〜154.5 KiBで、Urushiが45.3〜45.4%小さくなりました。</p>
    <p>トークン数は生成・修正・仕様変更・再修正の合計を試行ごとに求め、失敗した試行も含めた中央値です。参照資料の長さは異なるため、入力トークンや料金の差とは分けています。サイズは各ファイルのgzipサイズの和で、アプリ、任意ランタイム、必要なコンポーネントのCSS、Graphite、共通CSS、Reactを含みます。画像・フォント・HTML・起動時間は対象外です。</p>
    <p>新しいAPIでは、Comboboxの<code>loadOptions</code>が古い応答の除外と再試行を扱い、Dialogの<code>initialFocus</code>／<code>returnFocus</code>が動的な画面のフォーカスを指定します。一方、モデルが開く処理を省略したり、入力検証を誤ったりするケースは残りました。コード量が小さいことと、生成結果が正しく動くことは別の指標です。</p>
    <details><summary>探索試行・検査の修正・条件を確認する</summary>
      <p>先行するLunaの探索{study.requestLedger.exploratory}応答で、保存中の文言変更、確認Dialogの表示待ち、別のDOM位置に出る検索ポップアップの判定に問題が見つかりました。元の記録を残して再採点し、探索結果は上の確認試行に混ぜていません。</p>
      <p>両ライブラリの正解例と不良例で校正してから、依頼文・実装・参照資料・検査を固定し、新しい要求で{study.requestLedger.confirmation}応答を取得しました。検査中は変更していません。AIの出力を人手で直して合格にしたものも含めていません。</p>
      <p>Base UI 1.9.0とReact 19.3.1を使い、推論設定はmediumにしました。ツールや検索は使っていません。資料は各ライブラリの公開APIに合わせており、同一の文章や長さではありません。Urushiのlintは追加診断で、共通の合否条件には含めません。少数の試行とChromiumでの検査であり、全モデル、実機、支援技術への一般化はできません。</p>
    </details>
    <p><a href="/evals/composition-summary.json" download>全試行・失敗・使用トークン・固定条件のJSON</a>を保存できます。</p>
  </section>;
}
