import React, { useState, useEffect, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader } from '../ui/Loader';
import { Card } from '../ui/Card';
import { GroundingChunk } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { TextArea } from '../ui/TextArea';

type SearchMode = 'web' | 'maps' | 'websites';

export const GroundedSearch: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<SearchMode>('web');
  const [websiteUrls, setWebsiteUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [chunks, setChunks] = useState<GroundingChunk[]>([]);
  const [errors, setErrors] = useState<{ prompt?: string; urls?: string }>({});
  
  const { location, error: geoError, requestLocation } = useGeolocation();

  useEffect(() => {
    if (mode === 'maps') {
      requestLocation();
    }
  }, [mode, requestLocation]);

  const handleSearch = useCallback(async () => {
    const newErrors: { prompt?: string; urls?: string } = {};
    let hasErrors = false;

    if (!prompt.trim()) {
      newErrors.prompt = 'A pergunta é obrigatória.';
      hasErrors = true;
    }
    if (mode === 'websites' && !websiteUrls.trim()) {
      newErrors.urls = 'Por favor, insira pelo menos um URL.';
      hasErrors = true;
    }

    setErrors(newErrors);
    if (hasErrors) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setChunks([]);

    try {
      let finalPrompt = prompt;
      const searchModeForApi: 'web' | 'maps' = mode === 'maps' ? 'maps' : 'web';

      if (mode === 'websites') {
        const sites = websiteUrls.split('\n').filter(url => url.trim() !== '').map(url => `site:${url.trim()}`).join(' OR ');
        if (sites) {
          finalPrompt = `${prompt} ${sites}`;
        }
      }

      const result = await geminiService.generateGroundedContent(finalPrompt, searchModeForApi, location);
      setResponse(result.text);
      setChunks(result.chunks);
    } catch (e) {
      setError('Falha ao obter resposta fundamentada do Gemini. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, mode, location, websiteUrls]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Pesquisa Fundamentada</h2>
      <p className="text-slate-400 mb-6">Obtenha respostas atualizadas da Pesquisa Google, do Google Maps ou de uma lista de sites que você fornecer.</p>
      
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">1. Escolha a Fonte da Pesquisa</h3>
        <div className="flex justify-center mb-4">
            <div className="bg-slate-900 rounded-full p-1 flex items-center flex-wrap justify-center">
            <Button
                onClick={() => setMode('web')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${mode === 'web' ? 'bg-orange-600 text-white' : 'bg-transparent text-slate-300'}`}
            >
                Pesquisar na Web
            </Button>
            <Button
                onClick={() => setMode('maps')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${mode === 'maps' ? 'bg-orange-600 text-white' : 'bg-transparent text-slate-300'}`}
            >
                Pesquisar no Maps
            </Button>
            <Button
                onClick={() => setMode('websites')}
                className={`px-6 py-2 rounded-full text-sm font-medium ${mode === 'websites' ? 'bg-orange-600 text-white' : 'bg-transparent text-slate-300'}`}
            >
                Meus Sites
            </Button>
            </div>
        </div>
        
        {mode === 'websites' && (
            <div className="animate-fade-in bg-slate-900/50 p-4 rounded-lg border border-orange-500/50 transition-all">
                <label htmlFor="website-urls" className="block text-sm font-medium text-slate-300 mb-2">
                    Cole os URLs dos seus sites (um por linha)
                </label>
                <TextArea
                    id="website-urls"
                    value={websiteUrls}
                    onChange={(e) => {
                      setWebsiteUrls(e.target.value);
                      if (errors.urls) setErrors(prev => ({ ...prev, urls: undefined }));
                    }}
                    placeholder="https://example.com&#10;https://anothersite.org"
                    className="min-h-[100px]"
                    disabled={isLoading}
                    error={errors.urls}
                />
                 <p className="text-sm text-slate-400 mt-2">
                    O Gemini usará o conteúdo desses sites para responder à sua pergunta.
                </p>
            </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">2. Faça sua Pergunta</h3>
         <div className="flex items-start gap-2">
            <Input
                type="text"
                value={prompt}
                onChange={(e) => {
                    setPrompt(e.target.value);
                    if (errors.prompt) setErrors(prev => ({...prev, prompt: undefined}));
                }}
                placeholder={
                    mode === 'web' ? 'ex: Quem venceu a última corrida de F1?' :
                    mode === 'maps' ? 'ex: Melhores cafeterias perto de mim?' :
                    'ex: Qual o resumo do conteúdo destes sites?'
                }
                wrapperClassName="flex-grow"
                disabled={isLoading}
                error={errors.prompt}
            />
            <Button onClick={handleSearch} disabled={isLoading || !prompt.trim() || (mode === 'websites' && !websiteUrls.trim())}>
                {isLoading ? 'Pesquisando...' : 'Pesquisar'}
            </Button>
        </div>
        {mode === 'maps' && geoError && <p className="text-yellow-400 text-sm mt-4">Não foi possível obter a localização: {geoError}. A busca pode ser menos precisa.</p>}
      </Card>
      
      {isLoading && <div className="flex justify-center mt-8"><Loader /></div>}
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      {response && (
        <Card className="mt-6 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-3 text-white">Resposta</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{response}</p>
          
          {chunks.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2 text-orange-400">Fontes</h4>
              <ul className="list-disc list-inside space-y-2">
                {chunks.map((chunk, index) => {
                  const source = chunk.web || chunk.maps;
                  if (!source) return null;
                  return (
                    <li key={index}>
                      <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {source.title || source.uri}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};