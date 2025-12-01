import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface ChartWidgetProps {
  data: any[];
  title: string;
  defaultType?: 'bar' | 'line' | 'pie';
}

const COLORS = ['#0B5FFF', '#6366F1', '#3B82F6', '#16A34A', '#F59E0B'];

export function ChartWidget({ data, title, defaultType = 'bar' }: ChartWidgetProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>(defaultType);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="m-0">{title}</h3>
        <Tabs value={chartType} onValueChange={(v) => setChartType(v as any)}>
          <TabsList>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="pie">Pie</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            <Legend />
            <Bar dataKey="value" fill="#0B5FFF" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
        
        {chartType === 'line' && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0B5FFF" strokeWidth={2} dot={{ fill: '#0B5FFF', r: 4 }} />
          </LineChart>
        )}
        
        {chartType === 'pie' && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
