import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Feature } from './types';
import { FEATURES } from './constants';
import { FeatureHome } from './components/features/FeatureHome';
import { Chatbot } from './components/features/Chatbot';
import { GroundedSearch } from './components/features/GroundedSearch';
import { AdvancedGenerator } from './components/features/AdvancedGenerator';
import { ImageEditor } from './components/features/ImageEditor';
import { LiveConversation } from './components/features/LiveConversation';
import { ImageToVideo } from './components/features/ImageToVideo';
import { ImageGenerator } from './components/features/ImageGenerator';
import { VideoGenerator } from './components/features/VideoGenerator';
import { ImageAnalyzer } from './components/features/ImageAnalyzer';
import { VideoAnalyzer } from './components/features/VideoAnalyzer';
import { AudioTranscriber } from './components/features/AudioTranscriber';
import { TextToSpeech } from './components/features/TextToSpeech';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

  const handleSelectFeature = useCallback((feature: Feature) => {
    setActiveFeature(feature);
  }, []);
  
  const handleGoHome = useCallback(() => {
    setActiveFeature(null);
  }, []);

  const renderActiveFeature = () => {
    if (!activeFeature) {
      return <FeatureHome onSelectFeature={handleSelectFeature} />;
    }

    switch (activeFeature.id) {
      case 'chatbot':
        return <Chatbot />;
      case 'grounded-search':
        return <GroundedSearch />;
      case 'advanced-text':
        return <AdvancedGenerator />;
      case 'image-editor':
        return <ImageEditor />;
      case 'live-conversation':
        return <LiveConversation />;
      case 'image-to-video':
        return <ImageToVideo />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'video-generator':
        return <VideoGenerator />;
      case 'image-analyzer':
        return <ImageAnalyzer />;
      case 'video-analyzer':
        return <VideoAnalyzer />;
      case 'audio-transcriber':
        return <AudioTranscriber />;
      case 'tts':
        return <TextToSpeech />;
      default:
        return <FeatureHome onSelectFeature={handleSelectFeature} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans">
      <Sidebar 
        features={FEATURES} 
        onSelectFeature={handleSelectFeature} 
        activeFeatureId={activeFeature?.id} 
        onGoHome={handleGoHome}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeFeature && (
          <button
            onClick={handleGoHome}
            className="mb-6 flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Todas as Funcionalidades
          </button>
        )}
        {renderActiveFeature()}
      </main>
    </div>
  );
};

export default App;