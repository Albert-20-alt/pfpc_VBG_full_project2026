import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const GeographicAnalyticsTab = ({ cases }) => {
  const regionData = useMemo(() => {
    const counts = cases.reduce((acc, curr) => {
      if(curr.victimRegion) {
        acc[curr.victimRegion] = (acc[curr.victimRegion] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, cases: value, rate: (value / (Math.random()*100000 + 10000) * 1000).toFixed(1) })); // rate is random for now
  }, [cases]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle>Cas par région</CardTitle>
          <CardDescription>Distribution géographique</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}/>
              <Bar dataKey="cases" fill="url(#geoGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="geoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle>Taux par population (simulation)</CardTitle>
          <CardDescription>Cas pour 1000 habitants (données fictives)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide">
          {regionData.sort((a,b) => b.rate - a.rate).map((region) => (
            <div key={region.name} className="flex items-center justify-between">
              <span className="font-medium">{region.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${(region.rate / Math.max(...regionData.map(r => r.rate), 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-white/70">{region.rate}‰</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographicAnalyticsTab;