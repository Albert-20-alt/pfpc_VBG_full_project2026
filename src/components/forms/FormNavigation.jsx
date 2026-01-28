import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FormNavigation = ({ tabs, activeTab, setActiveTab }) => {
  const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < tabs.length - 1;

  const goToPrevious = () => {
    if (canGoPrevious) {
      setActiveTab(tabs[currentIndex - 1].value);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentIndex + 1].value);
    }
  };

  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/20">
      <Button
        type="button"
        variant="outline"
        onClick={goToPrevious}
        disabled={!canGoPrevious}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
      </Button>
      <span className="text-sm text-white/70">
        Étape {currentIndex + 1} sur {tabs.length}
      </span>
      <Button
        type="button"
        variant="outline"
        onClick={goToNext}
        disabled={!canGoNext}
      >
        Suivant <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default FormNavigation;