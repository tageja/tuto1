import React from 'react';

export function Table({
  head,
  rows,
}:{
  head: string[];
  rows: (string|number)[][];
}) {
  return (
    <div className="card table">
      <table>
        <thead>
          <tr>{head.map((h,i)=><th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r,ri)=> (
            <tr key={ri}>{r.map((c,ci)=><td key={ci}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;








