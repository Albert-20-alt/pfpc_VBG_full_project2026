import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const TrendsAnalyticsTab = ({ cases, period }) => {
  const monthlyTrend = useMemo(() => {
    // Group cases by month
    const trend = cases.reduce((acc, curr) => {
      const month = new Date(curr.submittedAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      if(!acc[month]) acc[month] = { cases: 0, resolved: 0};
      acc[month].cases++;
      if(curr.status === 'completed') acc[month].resolved++;
      return acc;
    }, {});

    // Convert to array and sort (simplified for now)
    return Object.entries(trend)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a,b) => new Date('01 '+a.month) - new Date('01 '+b.month)) // Basic sort
      .slice(-12); // Show last 12 months for example
  }, [cases, period]);

  return (
    <Card className="glass-effect border-white/20">
      <CardHeader>
        <CardTitle>Analyse des Tendances</CardTitle>
        <CardDescription>Évolution des cas signalés et résolus sur la période: {period}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
            <YAxis stroke="rgba(255,255,255,0.7)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}/>
            <Line 
              type="monotone" 
              dataKey="cases" 
              stroke="#667eea" 
              strokeWidth={3}
              dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
              name="Cas signalés"
            />
            <Line 
              type="monotone" 
              dataKey="resolved" 
              stroke="#82ca9d" 
              strokeWidth={3}
              dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
              name="Cas résolus"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TrendsAnalyticsTab;