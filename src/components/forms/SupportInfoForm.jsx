import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { services } from '@/lib/formDataLists';

const SupportInfoForm = ({ formData, handleInputChange, handleServiceToggle }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold gradient-text">Prise en charge et soutien</h2>
      <div>
        <Label>Services fournis</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {services.map(service => (
            <label key={service} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={(formData.servicesProvided || []).includes(service)}
                onChange={() => handleServiceToggle(service)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-400"
              />
              <span className="text-sm">{service}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="followUpRequired">Suivi requis</Label>
        <Select value={formData.followUpRequired} onValueChange={(value) => handleInputChange('followUpRequired', value)}>
          <SelectTrigger><SelectValue placeholder="Type de suivi nécessaire" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="medical">Suivi médical</SelectItem>
            <SelectItem value="psychological">Suivi psychologique</SelectItem>
            <SelectItem value="legal">Suivi juridique</SelectItem>
            <SelectItem value="social">Suivi social</SelectItem>
            <SelectItem value="multiple">Suivi multiple</SelectItem>
            <SelectItem value="none">Aucun suivi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="supportNeeds">Besoins de soutien spécifiques</Label>
        <Textarea
          id="supportNeeds"
          value={formData.supportNeeds}
          onChange={(e) => handleInputChange('supportNeeds', e.target.value)}
          placeholder="Décrivez les besoins spécifiques de soutien..."
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="referrals">Orientations (services ou organisations)</Label>
        <Textarea
          id="referrals"
          value={formData.referrals}
          onChange={(e) => handleInputChange('referrals', e.target.value)}
          placeholder="Services ou organisations vers lesquels la victime a été orientée..."
          rows={3}
        />
      </div>
    </div>
  );
};
export default SupportInfoForm;