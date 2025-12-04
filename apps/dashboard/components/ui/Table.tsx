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
      <table className="w-full">
        <thead>
          <tr className="bg-surface border-b border-border">
            {head.map((h,i)=><th key={i} className="px-4 py-3 text-left text-sm font-medium text-text">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,ri)=> (
            <tr key={ri} className="border-b border-border hover:bg-surface/60 transition-colors">
              {r.map((c,ci)=><td key={ci} className="px-4 py-3 text-sm text-text">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;































