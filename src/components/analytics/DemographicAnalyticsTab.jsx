import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const DemographicAnalyticsTab = ({ cases }) => {
  const ageGroupData = useMemo(() => {
    const ageGroups = { '0-14':0, '15-24':0, '25-34':0, '35-44':0, '45-54':0, '55+':0 };
    cases.forEach(c => {
      const age = parseInt(c.victimAge);
      if (isNaN(age)) return;
      if (age <= 14) ageGroups['0-14']++;
      else if (age <= 24) ageGroups['15-24']++;
      else if (age <= 34) ageGroups['25-34']++;
      else if (age <= 44) ageGroups['35-44']++;
      else if (age <= 54) ageGroups['45-54']++;
      else ageGroups['55+']++;
    });
    return Object.entries(ageGroups).map(([group, value]) => ({ group, cases: value }));
  }, [cases]);

  const perpetratorProfileData = useMemo(() => {
    const profiles = cases.reduce((acc, curr) => {
      if(curr.relationshipToVictim) {
        acc[curr.relationshipToVictim] = (acc[curr.relationshipToVictim] || 0) + 1;
      }
      return acc;
    }, {});
    const total = Object.values(profiles).reduce((sum, count) => sum + count, 0);
    return Object.entries(profiles)
      .map(([category, count]) => ({ category, percentage: total > 0 ? (count/total*100).toFixed(1) : 0 }))
      .sort((a,b) => b.percentage - a.percentage);
  }, [cases]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle>Répartition par âge (Victimes)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
              <YAxis dataKey="group" type="category" stroke="rgba(255,255,255,0.7)" width={80} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}/>
              <Bar dataKey="cases" fill="#82ca9d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle>Profil des auteurs</CardTitle>
          <CardDescription>Relation avec la victime</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide">
          {perpetratorProfileData.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <span className="font-medium capitalize">{item.category.replace('-', ' ')}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-white/70">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemographicAnalyticsTab;