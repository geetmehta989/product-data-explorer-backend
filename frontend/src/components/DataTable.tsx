import React from 'react';

type Props = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export const DataTable: React.FC<Props> = ({ columns, rows }) => {
  if (!columns.length) return null;
  return (
    <div className="card">
      <h3>Data</h3>
      <div style={{ overflow: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((c) => (
                  <td key={c}>{String(row[c] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
