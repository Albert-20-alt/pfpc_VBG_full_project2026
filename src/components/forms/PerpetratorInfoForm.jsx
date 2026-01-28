import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { senegalRegions } from '@/lib/formDataLists';

const PerpetratorInfoForm = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold gradient-text">Informations sur l'auteur</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <Label htmlFor="perpetratorGender">Sexe de l'auteur</Label>
          <Select value={formData.perpetratorGender} onValueChange={(value) => handleInputChange('perpetratorGender', value)}>
            <SelectTrigger><SelectValue placeholder="Sexe de l'auteur" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="homme">Homme</SelectItem>
              <SelectItem value="femme">Femme</SelectItem>
              <SelectItem value="inconnu">Inconnu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="perpetratorAge">Âge de l'auteur</Label>
          <Input
            id="perpetratorAge"
            type="number"
            value={formData.perpetratorAge}
            onChange={(e) => handleInputChange('perpetratorAge', e.target.value)}
            placeholder="Âge approximatif"
          />
        </div>
        <div>
          <Label htmlFor="perpetratorProfession">Profession</Label>
          <Input
            id="perpetratorProfession"
            value={formData.perpetratorProfession}
            onChange={(e) => handleInputChange('perpetratorProfession', e.target.value)}
            placeholder="Profession de l'auteur"
          />
        </div>
        <div>
          <Label htmlFor="perpetratorRegion">Région de résidence</Label>
          <Select value={formData.perpetratorRegion} onValueChange={(value) => handleInputChange('perpetratorRegion', value)}>
            <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
            <SelectContent>
              {senegalRegions.map(region => (<SelectItem key={region} value={region}>{region}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="perpetratorCommune">Commune</Label>
          <Input
            id="perpetratorCommune"
            value={formData.perpetratorCommune}
            onChange={(e) => handleInputChange('perpetratorCommune', e.target.value)}
            placeholder="Commune de résidence"
          />
        </div>
        <div>
          <Label htmlFor="perpetratorSocialClass">Classe sociale</Label>
          <Select value={formData.perpetratorSocialClass} onValueChange={(value) => handleInputChange('perpetratorSocialClass', value)}>
            <SelectTrigger><SelectValue placeholder="Classe sociale" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="populaire">Classe populaire</SelectItem>
              <SelectItem value="moyenne">Classe moyenne</SelectItem>
              <SelectItem value="aisee">Classe aisée</SelectItem>
              <SelectItem value="inconnue">Inconnue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="relationshipToVictim">Lien avec la victime</Label>
          <Select value={formData.relationshipToVictim} onValueChange={(value) => handleInputChange('relationshipToVictim', value)}>
            <SelectTrigger><SelectValue placeholder="Relation avec la victime" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="conjoint">Conjoint/Partenaire</SelectItem>
              <SelectItem value="ex-conjoint">Ex-conjoint/Ex-partenaire</SelectItem>
              <SelectItem value="famille">Membre de la famille</SelectItem>
              <SelectItem value="connaissance">Connaissance</SelectItem>
              <SelectItem value="inconnu">Inconnu</SelectItem>
              <SelectItem value="autorite">Figure d'autorité</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
export default PerpetratorInfoForm;