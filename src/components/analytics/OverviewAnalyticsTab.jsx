import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useMemo } from 'react';

const OverviewAnalyticsTab = ({ cases, period }) => {

  const violenceTypeData = useMemo(() => {
    const counts = cases.reduce((acc, curr) => {
      acc[curr.violenceType] = (acc[curr.violenceType] || 0) + 1;
      return acc;
    }, {});
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];
    return Object.entries(counts).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));
  }, [cases]);
  
  const monthlyTrend = useMemo(() => {
    // This should be dynamic based on `period` and `cases`
    // For now, static example
    return [
      { month: 'Jan', cases: Math.floor(Math.random()*20)+5, resolved: Math.floor(Math.random()*10)+2 },
      { month: 'Fév', cases: Math.floor(Math.random()*20)+5, resolved: Math.floor(Math.random()*10)+2 },
      { month: 'Mar', cases: Math.floor(Math.random()*20)+5, resolved: Math.floor(Math.random()*10)+2 },
      { month: 'Avr', cases: Math.floor(Math.random()*20)+5, resolved: Math.floor(Math.random()*10)+2 },
      { month: 'Mai', cases: Math.floor(Math.random()*20)+5, resolved: Math.floor(Math.random()*10)+2 },
      { month: 'Juin', cases: Math.floor(Math.random()*20)+5, resolved: Math.floor(Math.random()*10)+2 }
    ];
  }, [cases, period]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle>Types de violence</CardTitle>
          <CardDescription>Répartition par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={violenceTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {violenceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
          <CardDescription>Cas signalés vs résolus (période: {period})</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}/>
              <Area type="monotone" dataKey="cases" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} name="Signalés"/>
              <Area type="monotone" dataKey="resolved" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Résolus"/>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewAnalyticsTab;