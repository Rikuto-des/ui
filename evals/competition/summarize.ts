import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
const here=import.meta.dirname, root=resolve(here,'../..');
const ids=['measured-v1','measured-v2','measured-v3','measured-v4','claude-sonnet-v1'];
const labels:Record<string,string>={urushi:'Urushi',base:'Base UI',radix:'Radix UI',shadcn:'shadcn/ui'};
const runs=[];
for(const id of ids){
  const dir=join(here,'runs',id), raw=await readFile(join(dir,'results.json'),'utf8'), results=JSON.parse(raw);
  const protocol=JSON.parse(await readFile(join(dir,'protocol.json'),'utf8'));
  const sharedCssGzip=gzipSync(await readFile(join(dir,'shared.css'))).length;
  const libraries=[];
  for(const library of protocol.libraries){
    const rows=results.filter((r:any)=>r.library===library);
    if(rows.some((r:any)=>!r.generate || !r.update))throw Error(`${id}/${library}: incomplete run`);
    const final=(r:any)=>r['update-repair']??r.update;
    const initial=(r:any)=>r.repair??r.generate;
    const range=(key:string)=>[Math.min(...rows.map((r:any)=>final(r)?.[key]??0)),Math.max(...rows.map((r:any)=>final(r)?.[key]??0))];
    const cssSizes=await Promise.all(rows.map(async(r:any)=>{
      const stage=r['update-repair']?'update-repair':'update';
      const css=await readFile(join(dir,r.id,stage,'dist/entry.css')).catch(()=>null);
      return css?gzipSync(css).length:0;
    }));
    let calls=0,inputTokens=0,outputTokens=0,elapsedMs=0;
    const source=[];
    for(const row of rows)for(const stage of ['generate','repair','update','update-repair'])if(row[stage]){
      const reply=JSON.parse(await readFile(join(dir,row.id,stage,'reply.json'),'utf8'));
      calls++;inputTokens+=reply.usage?.input_tokens??0;outputTokens+=reply.usage?.output_tokens??0;elapsedMs+=reply.elapsedMs??0;
      source.push({sample:row.id,stage,pass:row[stage].pass,sha256:row[stage].sourceSha256,errors:row[stage].errors,browser:row[stage].browser,libraryDiagnostics:row[stage].libraryDiagnostics});
    }
    const assetSizes=rows.map((r:any,i:number)=>final(r).bundleGzip+cssSizes[i]+sharedCssGzip);
    libraries.push({id:library,label:labels[library],n:rows.length,generate:rows.filter((r:any)=>r.generate?.pass).length,repaired:rows.filter((r:any)=>initial(r)?.pass).length,update:rows.filter((r:any)=>r.update?.pass).length,final:rows.filter((r:any)=>final(r)?.pass).length,internalCleanGenerate:library==='urushi'?rows.filter((r:any)=>r.generate?.libraryDiagnostics.length===0).length:null,internalCleanFinal:library==='urushi'?rows.filter((r:any)=>final(r)?.libraryDiagnostics.length===0).length:null,jsGzip:range('bundleGzip'),excludingReactGzip:range('withoutReactGzip'),libraryCssGzip:[Math.min(...cssSizes),Math.max(...cssSizes)],assetGzip:[Math.min(...assetSizes),Math.max(...assetSizes)],sourceBytes:range('sourceBytes'),calls,inputTokens,outputTokens,elapsedMs,source});
  }
  runs.push({id,startedAt:protocol.startedAt,protocol,sharedCssGzip,resultSha256:createHash('sha256').update(raw).digest('hex'),libraries});
}
const summary={schemaVersion:1,measuredOn:'2026-10-27',kind:'exploratory development evaluation',runs};
await writeFile(join(root,'generated/competition-summary.json'),JSON.stringify(summary,null,2));
await mkdir(join(root,'apps/site/public/evals'),{recursive:true});
await writeFile(join(root,'apps/site/public/evals/competition-summary.json'),JSON.stringify({...summary,runs:runs.map(r=>({...r,libraries:r.libraries.map(({source,...rest})=>rest)}))},null,2));
// measured-v4 is the main result; claude-sonnet-v1 repeats it with a second model.
const last=runs.find(r=>r.id==='measured-v4')!, second=runs.find(r=>r.id==='claude-sonnet-v1')!;
const kib=(x:number[])=>[...new Set(x.map(n=>(n/1024).toFixed(1)))].join('–');
const table=last.libraries.map(l=>`| ${l.label} | ${l.generate}/${l.n} | ${l.repaired}/${l.n} | ${l.update}/${l.n} | ${l.final}/${l.n} |`).join('\n');
const secondTable=second.libraries.map(l=>`| ${l.label} | ${l.generate}/${l.n} | ${l.repaired}/${l.n} | ${l.update}/${l.n} | ${l.final}/${l.n} |`).join('\n');
const sizes=last.libraries.map(l=>`| ${l.label} | ${kib(l.jsGzip)} | ${kib(l.excludingReactGzip)} | ${kib(l.assetGzip)} |`).join('\n');
await writeFile(join(here,'REPORT.md'),`# UI生成・修正・仕様更新の比較結果\n\n2026年10月27日。最終成績は、検査を固定してから全工程を新しく実行した \`measured-v4\` の結果です。gpt-6.1-sol、推論設定medium、3課題×2試行、各段階で最大1回の修正。生成コードを人手で書き換えていません。\n\n| ライブラリ | 初回生成 | 修正後 | 仕様更新 | 再修正後 |\n| --- | --- | --- | --- | --- |\n${table}\n\n## 別のモデルでの確認\n\n2026年11月5日、同じ課題・資料・検査を固定したまま、モデルだけを${second.protocol.model}（推論設定${second.protocol.effort}、${second.protocol.provider}）に替えて全工程をやり直しました（\`claude-sonnet-v1\`）。ツール・MCP・利用者の設定はすべて切っています。\n\n| ライブラリ | 初回生成 | 修正後 | 仕様更新 | 再修正後 |\n| --- | --- | --- | --- | --- |\n${secondTable}\n\n2つのモデルとも、初回生成で全件合格したのはUrushiだけでした。ほかのライブラリの初回の失敗は、メニューを開いたあとの読み上げ対象外の要素へのフォーカス（aria-hidden-focus）、タブの色のコントラスト、無効項目へのフォーカスなどです。Claudeでは修正を1回挟むとどのライブラリも最終的に合格しましたが、gpt-6.1-solではBase UIの最終が4/6でした。\n\n合格は型・キーボードと状態・axe・320px表示の共通検査をすべて通った件数です。Urushi独自のlintは共通の合否に含めません。Base UIの無効項目へのフォーカスは今回の指定との不一致であり、一般的なアクセシビリティの欠陥という意味ではありません。\n\n## 配信するコード量\n\n最終の6画面の範囲。gzip後のKiBです。右端は各JS・CSSファイルのgzipサイズの和で、共通の評価用CSSも含みます。\n\n| ライブラリ | JS、React込み | JS、Reactを外部化 | JS＋CSS、React込み |\n| --- | --- | --- | --- |\n${sizes}\n\nReactを外部化した値にはUIライブラリ・ランタイム・アプリ処理を含みます。JSの差をページ全体の軽量化率とは扱えません。Urushiには部品とパックのCSSが別途${kib(last.libraries.find(l=>l.id==='urushi')!.libraryCssGzip)} KiBあり、CSS込みではRadix UIのタブ画面のほうが小さくなります。起動速度は測っていません。\n\n## 実装した改善\n\n- \`urushi context\`：契約だけでなく、デザイン規約とトークンもAIへ渡します。最終実験のUrushiは初回${last.libraries.find(l=>l.id==='urushi')!.internalCleanGenerate}/6、最終${last.libraries.find(l=>l.id==='urushi')!.internalCleanFinal}/6で独自lint違反がありませんでした。改善前の初回は0/6でした。\n- \`Tabs.Activate\`：外部ボタンからタブを切り替えます。静的なidとvalueの誤りをlintで検出します。\n- Dialog：CSSリセット後の中央配置を修正。成功時に閉じてから状態を変更する手順を契約に追加しました。\n\n## 適用範囲\n\n開発中の探索的な比較です。2モデル、3つの小規模課題であり、すべての画面やモデルでの優位性を示すものではありません。更新はアプリの仕様追加です。依存ライブラリの実バージョン移行、スクリーンリーダー利用者の操作、主観的なデザイン品質は未検証です。\n\n[全条件・検査修正の履歴・再実行方法](README.md) · [集計JSON](../../generated/competition-summary.json) · [最終実験の生結果](runs/measured-v4/results.json)\n`);
console.log(JSON.stringify(runs.map(r=>({id:r.id,libraries:r.libraries.map(({source,...rest})=>rest)})),null,2));
