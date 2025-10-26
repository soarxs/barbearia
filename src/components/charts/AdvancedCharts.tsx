import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AdvancedChartsProps {
  data: ChartData[];
  type: 'line' | 'area' | 'bar' | 'pie';
  title: string;
  color?: string;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdvancedLineChart: React.FC<AdvancedChartsProps> = ({ 
  data, 
  title, 
  color = '#0088FE',
  height = 300 
}) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const AdvancedAreaChart: React.FC<AdvancedChartsProps> = ({ 
  data, 
  title, 
  color = '#00C49F',
  height = 300 
}) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          fill={color}
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const AdvancedBarChart: React.FC<AdvancedChartsProps> = ({ 
  data, 
  title, 
  color = '#FFBB28',
  height = 300 
}) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const AdvancedPieChart: React.FC<AdvancedChartsProps> = ({ 
  data, 
  title, 
  height = 300 
}) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Gráfico de Receita vs Despesas
export const RevenueExpenseChart: React.FC<{ data: any[] }> = ({ data }) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold mb-4">Receita vs Despesas</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#00C49F" 
          strokeWidth={2}
          name="Receita"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#FF8042" 
          strokeWidth={2}
          name="Despesas"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Gráfico de Performance dos Barbeiros
export const BarberPerformanceChart: React.FC<{ data: any[] }> = ({ data }) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold mb-4">Performance dos Barbeiros</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Legend />
        <Bar dataKey="appointments" fill="#0088FE" name="Agendamentos" />
        <Bar dataKey="revenue" fill="#00C49F" name="Receita" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Gráfico de Horários Mais Movimentados
export const BusyHoursChart: React.FC<{ data: any[] }> = ({ data }) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold mb-4">Horários Mais Movimentados</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="appointments" fill="#8884D8" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
