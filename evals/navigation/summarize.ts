import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,root=resolve(here,'../..'), run='measured-v3',repairRun='repair-v3';
const read=async(path:string)=>JSON.parse(await readFile(path,'utf8'));
const exists=(p:string)=>access(p).then(()=>true,()=>false);
const range=(values:number[])=>[Math.min(...values),Math.max(...values)];
const kb=(values:number[])=>[...new Set(values.map(n=>(n/1024).toFixed(1)))].join('–');
const labels:Record<string,string>={urushi:'Urushi',base:'Base UI',radix:'Radix UI',shadcn:'shadcn/ui (Radix)'};
const stages=['generate','repair','update','update-repair'];
const rows=await read(join(here,'runs',run,'results.json'));
const repairs=await read(join(here,'runs',repairRun,'results.json'));
const shared=await readFile(join(here,'runs',run,'shared.css'));
const libraries=[];
for(const library of Object.keys(labels)){
  const samples=rows.filter((x:any)=>x.library===library), sizes=[], usage={input:0,output:0,calls:0};
  for(const s of samples){
    const final=s['update-repair']?'update-repair':'update', dir=join(here,'runs',run,s.id,final),css=join(dir,'dist/entry.css');
    const cssGzip=await exists(css)?gzipSync(await readFile(css)).length:0;
    sizes.push({id:s.id,stage:final,sourceBytes:s[final].sourceBytes,jsGzip:s[final].bundleGzip,withoutReactGzip:s[final].withoutReactGzip,cssGzip,totalGzip:s[final].bundleGzip+cssGzip+gzipSync(shared).length});
    const paths=stages.map(stage=>join(here,'runs',run,s.id,stage,'reply.json'));
    paths.push(join(here,'runs',repairRun,s.id,'update-repair/reply.json'));
    for(const path of paths)if(await exists(path)){const r=await read(path);if(!r.usage)throw Error('Missing model usage '+path);usage.calls++;usage.input+=r.usage.input_tokens;usage.output+=r.usage.output_tokens;}
  }
  libraries.push({id:library,label:labels[library],n:samples.length,generate:samples.filter((s:any)=>s.generate?.pass).length,generatedAfterRepair:samples.filter((s:any)=>(s.repair??s.generate)?.pass).length,update:samples.filter((s:any)=>s.update?.pass).length,final:samples.filter((s:any)=>(s['update-repair']??s.update)?.pass).length,seededRepair:repairs.filter((s:any)=>s.library===library&&s['update-repair']?.pass).length,internalClean:library==='urushi'?samples.filter((s:any)=>['generate','update'].every(stage=>s[stage]?.libraryDiagnostics.length===0)).length:null,sourceBytes:range(sizes.map(s=>s.sourceBytes)),jsGzip:range(sizes.map(s=>s.jsGzip)),withoutReactGzip:range(sizes.map(s=>s.withoutReactGzip)),cssGzip:range(sizes.map(s=>s.cssGzip)),totalGzip:range(sizes.map(s=>s.totalGzip)),usage,samples:sizes});
}
const previous=await read(join(here,'runs/measured-v2/results.json'));
const summary={measuredAt:new Date().toISOString(),run,repairRun,model:'gpt-6.1-sol',effort:'medium',trials:2,commonCssGzip:gzipSync(shared).length,commonCssSha256:createHash('sha256').update(shared).digest('hex'),libraries,previous:{id:'measured-v2',allGeneratedAndUpdatedPassed:previous.every((s:any)=>s.generate.pass&&s.update.pass),urushiInitialAndUpdatedInternalClean:previous.filter((s:any)=>s.library==='urushi').flatMap((s:any)=>[s.generate,s.update]).filter((s:any)=>!s.libraryDiagnostics.length).length},limitations:['One model, one header scenario, two independent trials.','Development comparison; earlier v2 passed all four libraries. Do not infer a general success-rate ranking.','Focus-sentinel-only axe findings are advisory; raw findings and redirect probes are retained. No screen-reader user study.','Seeded repair starts from successful final outputs and injects three identical semantic faults.','One shared Tailwind stylesheet; not separately optimized CSS per app.','Sizes sum gzip of each JS/CSS asset; no HTML, images, fonts or startup timing.','Urushi full optional runtime is included. shadcn is the Radix edition.']};
await writeFile(join(root,'generated/navigation-summary.json'),JSON.stringify(summary,null,2)+'\n');
await mkdir(join(root,'apps/site/public/evals'),{recursive:true});await writeFile(join(root,'apps/site/public/evals/navigation-summary.json'),JSON.stringify(summary,null,2)+'\n');
const table=libraries.map(r=>`| ${r.label} | ${r.generate}/2 | ${r.generatedAfterRepair}/2 | ${r.final}/2 | ${r.seededRepair}/2 | ${kb(r.withoutReactGzip)} | ${kb(r.totalGzip)} |`).join('\n');
await writeFile(join(here,'REPORT.md'),`# Navigation Menuの実測比較\n\nモデルはgpt-6.1-sol、推論設定はmedium。4ライブラリを各2回、同じ依頼文・検査・最大1回の修正機会で比較しました。最終集計は${run}と${repairRun}です。実モデル応答は計${libraries.reduce((n,r)=>n+r.usage.calls,0)}回。生成されたコードは人手で修正していません。\n\n| ライブラリ | 初回生成 | 生成後の修正まで | 仕様変更後の最終 | 同一不具合の修正 | JS・React外部化 / KiB | JS＋CSS・React込み / KiB |\n|---|---:|---:|---:|---:|---:|---:|\n${table}\n\nJS＋CSSには全条件共通のCSS ${kb([gzipSync(shared).length])} KiBを含みます。Urushiは必要部品のCSSと完全なGraphiteパック、全機能の任意ランタイムを含みます。数値は各ファイルのgzipサイズの合計で、ロード時間ではありません。\n\n## 何を検査したか\n\n- ナビゲーションの名前、通常のリンク、現在のページ。\n- Enterで開く、Tabでリンクへ入る、Escapeで閉じてトリガーへ戻る。\n- 兄弟グループの切替、外へフォーカスしたときの閉鎖、リンクの移動。\n- リンクの追加・改名・削除と復元、入力値とカウンターの保持。\n- strict TypeScript、axe WCAG A/AA、320pxの閉じた状態と開いたパネル。\n\n同一不具合の修正では、全件が合格済みのコードに、ナビゲーション名の誤り、Guidesのリンク先の誤り、外側の最小幅640pxを追加しました。8件とも3項目の検査で失敗したことを確認し、診断付きで1回だけ修正させました。注入元・改変後のハッシュは各seed.json、注入処理はseed-plan.tsに残しています。\n\n## 改善と解釈\n\nUrushiの高速なグループ切替で、遅れて届くtoggleイベントに古い操作が勝つ問題を修正しました。型生成で数値リテラルのunionを保持し、columnsは1か2だけを受け付けます。context --compactは契約と共通規約を保持し、関係の薄いトークンを省きます。Rootに内部リスト用の表示クラスを付けないことも説明に追加しました。最終のUrushiは初回生成・仕様変更・同一不具合の修正の6画面とも独自診断0件でした。\n\n成功率の全面的な優位性は示していません。直前のmeasured-v2では全ライブラリが生成・仕様変更とも全件合格しました。今回のshadcnの生成・仕様変更の失敗は最終的に修正されています。ただし別の同一不具合の修正課題では、幅320pxに対して333pxと321pxの横はみ出しが残り、2件とも不合格でした。2試行だけでモデル全般やライブラリ全体を順位付けできません。サイズの差と成功率は分けて判断します。\n\n## 条件と記録\n\nBase UI 1.9.0、radix-ui 1.8.1、shadcn new-york-v4のRadix版、React 19.3.1。依頼文、API資料、返答、使用トークン、生成コード、診断、画面、ライブラリソースを各runへ保存しました。AIはツールなし、履歴なし。費用はCLIが返さないため未計測です。入力トークンはAPI資料の長さにも左右されます。最終2実験の入力トークンはUrushi 65,417、Base UI 124,514、Radix 61,245、shadcn 88,500で、UrushiはRadixより少なくありません。\n\n空で1pxにクリップされたaria-hiddenのフォーカス用spanだけはaxeの判定を別記録にしています。通常の要素の違反は除外しません。これはスクリーンリーダーの実利用で問題がないことを保証するものではありません。\n\nbaseline-v1とrepair-v1は検査校正用で成績から除外。前者にはsummaryの検索、各ライブラリの矢印開始条件、hoverとclickの競合がありました。後者は仕様変更済みコードに生成時点の検査を適用していたため使っていません。measured-v2とrepair-v2は改善前の結果として保存しています。\n\n公式資料：[Base UI](https://base-ui.com/react/components/navigation-menu)、[Radix](https://www.radix-ui.com/primitives/docs/components/navigation-menu)、[shadcn公式レジストリ](https://ui.shadcn.com/r/styles/new-york-v4/navigation-menu.json)。\n`);
console.log(JSON.stringify(libraries.map(({samples,...r})=>r),null,2));
