import React, { useMemo } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type Props = {
  chart: 'bar' | 'line' | 'pie' | 'scatter' | 'table';
  columns: string[];
  rows: Record<string, unknown>[];
};

const COLORS = ['#5aa9ff', '#58d6a3', '#ffcf5a', '#e26fff', '#ff7f7f', '#7fd1ff'];

export const ChartPanel: React.FC<Props> = ({ chart, columns, rows }) => {
  const { categoryKey, valueKeys } = useMemo(() => {
    if (!columns.length || !rows.length) return { categoryKey: undefined, valueKeys: [] as string[] };

    const sample = rows[0];
    const numeric = columns.filter((c) => typeof sample[c] === 'number');
    const nonNumeric = columns.filter((c) => !numeric.includes(c));

    let categoryKey: string | undefined = nonNumeric[0];
    if (!categoryKey && columns.length) categoryKey = columns[0];
    let valueKeys: string[] = numeric.length ? numeric : columns.filter((c) => c !== categoryKey);
    return { categoryKey, valueKeys };
  }, [columns, rows]);

  if (!rows.length) return null;

  return (
    <div className="card">
      <h3>Chart</h3>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          {chart === 'bar' && categoryKey ? (
            <BarChart data={rows as any} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {valueKeys.slice(0, 3).map((k, i) => (
                <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          ) : chart === 'line' && categoryKey ? (
            <LineChart data={rows as any} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {valueKeys.slice(0, 3).map((k, i) => (
                <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} dot={false} />
              ))}
            </LineChart>
          ) : chart === 'pie' && categoryKey && valueKeys[0] ? (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={rows as any} dataKey={valueKeys[0]} nameKey={categoryKey} outerRadius={140}>
                {rows.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : chart === 'scatter' && valueKeys.length >= 2 ? (
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey={valueKeys[0]} name={valueKeys[0]} />
              <YAxis type="number" dataKey={valueKeys[1]} name={valueKeys[1]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter data={rows as any} fill={COLORS[0]} />
            </ScatterChart>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9aa4b2' }}>
              Not enough numeric data to chart; showing table instead.
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
