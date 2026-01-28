import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { services as serviceList } from '@/lib/formDataLists';

const SupportAnalyticsTab = ({ cases }) => {
  const supportServicesData = useMemo(() => {
    const serviceCounts = serviceList.reduce((acc, serviceName) => {
      acc[serviceName] = { provided: 0, needed: 0 };
      return acc;
    }, {});

    cases.forEach(c => {
      (c.servicesProvided || []).forEach(serviceName => {
        if (serviceCounts[serviceName]) {
          serviceCounts[serviceName].provided++;
        }
      });
      serviceList.forEach(serviceName => {
        if (serviceCounts[serviceName] && Math.random() > 0.5) {
            serviceCounts[serviceName].needed += Math.floor(Math.random() * (cases.length / serviceList.length));
        }
         if (serviceCounts[serviceName] && serviceCounts[serviceName].needed < serviceCounts[serviceName].provided) {
            serviceCounts[serviceName].needed = serviceCounts[serviceName].provided + Math.floor(Math.random() * 5);
        }
      });
    });
    
    return Object.entries(serviceCounts).map(([service, counts]) => ({ service, ...counts }));
  }, [cases]);

  return (
    <Card className="glass-effect border-white/20">
      <CardHeader>
        <CardTitle>Services de prise en charge</CardTitle>
        <CardDescription>Services fournis vs besoins identifiés (simulation)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={supportServicesData} layout="vertical" margin={{ left: 150 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
            <YAxis dataKey="service" type="category" stroke="rgba(255,255,255,0.7)" width={150} interval={0} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}/>
            <Bar dataKey="provided" fill="#82ca9d" name="Services fournis" radius={[0, 4, 4, 0]} />
            <Bar dataKey="needed" fill="#ffc658" name="Besoins identifiés (sim.)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SupportAnalyticsTab;