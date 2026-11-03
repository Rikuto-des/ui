import { Carousel } from "@urushi/react";
const editions = [
  { title: "観察を形にする", category: "FIELD NOTES", art: "orbit", note: "日常で気づいたことを記録します。" },
  { title: "余白と配置を考える", category: "QUIET OBJECTS", art: "arch", note: "残す要素と省く要素を考えます。" },
  { title: "読むリズムを整える", category: "TYPE & RHYTHM", art: "type", note: "読む速さを考慮してデザインします。" },
  { title: "繰り返しの違いを比べる", category: "PATTERN STUDY", art: "grid", note: "同じ形に少しずつ変化を付けます。" },
];
export default function CarouselExample() {
  return <div className="carousel-study">
    <div className="experience-caption"><span>SELECTED EDITIONS</span><span>01 — 04</span></div>
    <h3>次のスライドを少し見せる</h3>
    <p className="experience-muted">スワイプや矢印で移動したり、見たい位置を直接選んだりできます。</p>
    <Carousel label="デザインノート">
      {editions.map((edition, i) => <Carousel.Item key={edition.art}><article className="edition-card">
        <div className="edition-art" data-art={edition.art} aria-hidden="true"><span className="edition-number">0{i + 1}</span><div className="edition-shape">{edition.art === "type" ? "Aa" : <><i/><i/><i/><i/></>}</div><span className="edition-caption">{edition.category}</span></div>
        <div className="edition-copy"><h4>{edition.title}</h4><p>{edition.note}</p></div>
      </article></Carousel.Item>)}
    </Carousel>
  </div>;
}
