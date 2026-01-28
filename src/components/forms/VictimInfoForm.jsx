import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { senegalRegions, ethnicGroups, religions, educationLevels } from '@/lib/formDataLists';

const VictimInfoForm = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold gradient-text">Informations sur la victime</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


        <div>
          <Label htmlFor="victimAge">Âge de la victime</Label>
          <Input
            id="victimAge"
            type="number"
            value={formData.victimAge}
            onChange={(e) => handleInputChange('victimAge', e.target.value)}
            placeholder="Âge en années"
            className={errors?.victimAge ? "border-red-500" : ""}
          />
          {errors?.victimAge && <p className="text-red-500 text-xs mt-1">{errors.victimAge}</p>}
        </div>
        <div>
          <Label htmlFor="victimGender">Sexe</Label>
          <Select value={formData.victimGender} onValueChange={(value) => handleInputChange('victimGender', value)}>
            <SelectTrigger><SelectValue placeholder="Sélectionner le sexe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="femme">Femme</SelectItem>
              <SelectItem value="homme">Homme</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="victimRegion">Région de résidence</Label>
          <Select value={formData.victimRegion} onValueChange={(value) => handleInputChange('victimRegion', value)}>
            <SelectTrigger className={errors?.victimRegion ? "border-red-500" : ""}><SelectValue placeholder="Sélectionner la région" /></SelectTrigger>
            <SelectContent>
              {senegalRegions.map(region => (<SelectItem key={region} value={region}>{region}</SelectItem>))}
            </SelectContent>
          </Select>
          {errors?.victimRegion && <p className="text-red-500 text-xs mt-1">{errors.victimRegion}</p>}
        </div>
        <div>
          <Label htmlFor="victimCommune">Commune</Label>
          <Input
            id="victimCommune"
            value={formData.victimCommune}
            onChange={(e) => handleInputChange('victimCommune', e.target.value)}
            placeholder="Commune de résidence"
            className={errors?.victimCommune ? "border-red-500" : ""}
          />
          {errors?.victimCommune && <p className="text-red-500 text-xs mt-1">{errors.victimCommune}</p>}
        </div>
        <div>
          <Label htmlFor="victimMaritalStatus">Situation matrimoniale</Label>
          <Select value={formData.victimMaritalStatus} onValueChange={(value) => handleInputChange('victimMaritalStatus', value)}>
            <SelectTrigger><SelectValue placeholder="Situation matrimoniale" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="celibataire">Célibataire</SelectItem>
              <SelectItem value="mariee">Mariée</SelectItem>
              <SelectItem value="divorcee">Divorcée</SelectItem>
              <SelectItem value="veuve">Veuve</SelectItem>
              <SelectItem value="union-libre">Union libre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="victimReligion">Religion</Label>
          <Select value={formData.victimReligion} onValueChange={(value) => handleInputChange('victimReligion', value)}>
            <SelectTrigger><SelectValue placeholder="Religion" /></SelectTrigger>
            <SelectContent>
              {religions.map(religion => (<SelectItem key={religion} value={religion}>{religion}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="victimEthnicity">Ethnie</Label>
          <Select value={formData.victimEthnicity} onValueChange={(value) => handleInputChange('victimEthnicity', value)}>
            <SelectTrigger><SelectValue placeholder="Groupe ethnique" /></SelectTrigger>
            <SelectContent>
              {ethnicGroups.map(group => (<SelectItem key={group} value={group}>{group}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="victimEducation">Niveau d'instruction</Label>
          <Select value={formData.victimEducation} onValueChange={(value) => handleInputChange('victimEducation', value)}>
            <SelectTrigger><SelectValue placeholder="Niveau d'éducation" /></SelectTrigger>
            <SelectContent>
              {educationLevels.map(level => (<SelectItem key={level} value={level}>{level}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="victimProfession">Profession</Label>
          <Input
            id="victimProfession"
            value={formData.victimProfession}
            onChange={(e) => handleInputChange('victimProfession', e.target.value)}
            placeholder="Profession de la victime"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="victimDisability">Situation de handicap</Label>
          <Select value={formData.victimDisability} onValueChange={(value) => handleInputChange('victimDisability', value)}>
            <SelectTrigger><SelectValue placeholder="Handicap" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aucun">Aucun</SelectItem>
              <SelectItem value="physique">Handicap physique</SelectItem>
              <SelectItem value="mental">Handicap mental</SelectItem>
              <SelectItem value="sensoriel">Handicap sensoriel</SelectItem>
              <SelectItem value="multiple">Handicap multiple</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
export default VictimInfoForm;