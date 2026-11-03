"use client";
import { useState } from "react";
import { Button, Table } from "@urushi/react";
const rows = [
  { name: "ノート", price: 800, count: 2 },
  { name: "ペン", price: 300, count: 3 },
  { name: "ケース", price: 1200, count: 1 },
];
export default function TableExample() {
  const [tax, setTax] = useState(false),
    [dense, setDense] = useState(false);
  const money = (n: number) =>
    `¥${String(Math.round(n * (tax ? 1.1 : 1))).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  return (
    <div className="interaction-study">
      <header>
        <small>READ / COMPARE</small>
        <h3>数字の桁を揃えて比較する</h3>
      </header>
      <div className="study-actions">
        <Button size="sm" aria-pressed={tax} onClick={() => setTax(!tax)}>
          10%を加算
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={dense}
          onClick={() => setDense(!dense)}
        >
          行をコンパクトに
        </Button>
      </div>
      <Table caption="文具セットの内訳" density={dense ? "compact" : "default"}>
        <thead>
          <tr>
            <th scope="col">品名</th>
            <th scope="col">数量</th>
            <th scope="col">金額</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td>{row.count}</td>
              <td className="study-numeric">{money(row.price * row.count)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>
              合計
            </th>
            <td className="study-numeric">{money(3700)}</td>
          </tr>
        </tfoot>
      </Table>
      <p className="study-caption" role="status">
        {tax ? "10%を加算した金額です。" : "加算前の金額です。"}
        計算を試すための見本です。
      </p>
    </div>
  );
}
