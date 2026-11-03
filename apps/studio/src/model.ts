export interface Project {id:string;name:string;description:string;status:"planned"|"active"|"review"|"done";owner:"mika"|"kai"|"alex";due:string;revision:number}
export interface Settings {workspace:string;theme:"light"|"dark"|"system";pack:"graphite"|"lucent"}
export const statusLabels={planned:"予定",active:"進行中",review:"レビュー",done:"完了"};
export const owners=[{value:"mika",label:"Mika Sato",description:"Design"},{value:"kai",label:"Kai Ito",description:"Engineering"},{value:"alex",label:"Alex Morgan",description:"Product"}];
export const initialSettings:Settings={workspace:"Studio",theme:"light",pack:"graphite"};
export const initialProjects:Project[]=[
 ["Website redesign","訪問者が迷わず製品を理解できるサイトへ。","active","mika","2026-11-06"],
 ["Mobile experience","片手でも使いやすい操作を設計する。","review","kai","2026-11-03"],
 ["Design system","コンポーネントとトークンの基準を揃える。","active","mika","2026-11-12"],
 ["Customer onboarding","初回の設定から最初の成果までを短くする。","planned","alex","2026-11-18"],
 ["Accessibility audit","キーボードと支援技術で主要な操作を確認する。","active","kai","2026-11-10"],
 ["Release notes","変更点と移行方法を読みやすくまとめる。","done","alex","2026-10-27"],
 ["Account settings","設定の保存とエラー復旧を改善する。","review","kai","2026-11-05"],
 ["Brand direction","書体、色、余白の方向性を定める。","done","mika","2026-10-25"],
 ["Project templates","よく使う進め方をすぐ再利用できるようにする。","planned","alex","2026-11-24"],
 ["Search experience","必要なプロジェクトに素早くたどり着ける検索。","active","kai","2026-11-15"],
 ["Team handbook","共同作業のルールをわかりやすく残す。","planned","alex","2026-12-01"],
 ["Component documentation","実際に操作できる例とAPIを揃える。","active","mika","2026-11-20"]
].map((row,index)=>({id:`PRJ-${String(index+1).padStart(3,"0")}`,name:row[0],description:row[1],status:row[2] as Project["status"],owner:row[3] as Project["owner"],due:row[4],revision:0}));
