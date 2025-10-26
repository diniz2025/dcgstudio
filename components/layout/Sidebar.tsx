import React from 'react';
import { Feature } from '../../types';
import { HomeIcon } from '../ui/Icons';

interface SidebarProps {
  features: Feature[];
  onSelectFeature: (feature: Feature) => void;
  activeFeatureId?: string;
  onGoHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ features, onSelectFeature, activeFeatureId, onGoHome }) => {
  return (
    <div className="w-64 bg-slate-800 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-lg mr-3"></div>
        <h1 className="text-xl font-bold text-white">AI Powerhouse</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          <li>
            <button
              onClick={onGoHome}
              className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors ${
                !activeFeatureId ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <HomeIcon className="w-6 h-6 mr-3" />
              <span>Início</span>
            </button>
          </li>
          {features.map((feature) => (
            <li key={feature.id}>
              <button
                onClick={() => onSelectFeature(feature)}
                className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors ${
                  activeFeatureId === feature.id ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="w-6 h-6 mr-3">{feature.icon}</div>
                <span>{feature.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto text-center text-xs text-slate-500">
        <p>Desenvolvido com Gemini</p>
      </div>
    </div>
  );
};