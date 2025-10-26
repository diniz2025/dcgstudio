import React from 'react';
import { Feature } from '../../types';
import { Card } from '../ui/Card';
import { FEATURES } from '../../constants';

interface FeatureHomeProps {
  onSelectFeature: (feature: Feature) => void;
}

export const FeatureHome: React.FC<FeatureHomeProps> = ({ onSelectFeature }) => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-2">AI Powerhouse com Gemini</h1>
      <p className="text-lg text-slate-400 mb-8">
        Explore um conjunto abrangente de ferramentas de IA com os modelos Gemini do Google. Selecione uma funcionalidade para começar.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <Card
            key={feature.id}
            onClick={() => onSelectFeature(feature)}
            className="flex flex-col p-6 hover:border-orange-500 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start mb-4">
              <div className="text-orange-400">{feature.icon}</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.name}</h3>
            <p className="text-slate-400 text-sm flex-grow">{feature.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {feature.models.map(model => (
                <span key={model} className="text-xs bg-slate-700 text-orange-300 px-2 py-1 rounded-full">{model}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};