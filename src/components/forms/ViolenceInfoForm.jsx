import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { violenceTypes } from '@/lib/formDataLists';

const ViolenceInfoForm = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold gradient-text">Informations sur la violence</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="violenceType">Type de violence</Label>
          <Select value={formData.violenceType} onValueChange={(value) => handleInputChange('violenceType', value)}>
            <SelectTrigger className={errors?.violenceType ? "border-red-500" : ""}><SelectValue placeholder="Type de violence" /></SelectTrigger>
            <SelectContent>
              {violenceTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
            </SelectContent>
          </Select>
          {errors?.violenceType && <p className="text-red-500 text-xs mt-1">{errors.violenceType}</p>}
        </div>
        <div>
          <Label htmlFor="incidentDate">Date de l'incident</Label>
          <Input
            id="incidentDate"
            type="date"
            value={formData.incidentDate}
            onChange={(e) => handleInputChange('incidentDate', e.target.value)}
            className={errors?.incidentDate ? "border-red-500" : ""}
          />
          {errors?.incidentDate && <p className="text-red-500 text-xs mt-1">{errors.incidentDate}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="incidentLocation">Lieu de l'incident</Label>
          <Input
            id="incidentLocation"
            value={formData.incidentLocation}
            onChange={(e) => handleInputChange('incidentLocation', e.target.value)}
            placeholder="Lieu où s'est produit l'incident"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="violenceDescription">Description détaillée des faits</Label>
          <Textarea
            id="violenceDescription"
            value={formData.violenceDescription}
            onChange={(e) => handleInputChange('violenceDescription', e.target.value)}
            placeholder="Décrivez les faits de manière détaillée..."
            rows={6}
          />
        </div>
      </div>
    </div>
  );
};
export default ViolenceInfoForm;