import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STATUS_LABELS = { pending: 'Pending', interview: 'Interview', reject: 'Rejected' };
const STATUS_COLORS = { pending: '#7c3aed', interview: '#059669', reject: '#dc2626' };

const StatusPieChart = ({ defaultStats }) => {
  const data = Object.entries(defaultStats || {}).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    value,
    color: STATUS_COLORS[key] || '#7c3aed',
  }));

  if (data.every((d) => d.value === 0)) {
    return <div className="chart-empty">No data to display</div>;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Application Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const MonthlyAreaChart = ({ monthlyApplication }) => {
  if (!monthlyApplication || monthlyApplication.length === 0) {
    return <div className="chart-empty">No monthly data available</div>;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Monthly Applications</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthlyApplication}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#7c3aed"
            fillOpacity={1}
            fill="url(#colorCount)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const Charts = ({ defaultStats, monthlyApplication }) => {
  return (
    <div className="charts-grid">
      <StatusPieChart defaultStats={defaultStats} />
      <MonthlyAreaChart monthlyApplication={monthlyApplication} />
    </div>
  );
};

export default Charts;
