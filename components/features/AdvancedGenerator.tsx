import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { Loader } from '../ui/Loader';
import { Card } from '../ui/Card';

type GenerationMode = 'thinking' | 'fast';

export const AdvancedGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('thinking');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ prompt?: string }>({});

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setErrors({ prompt: 'O prompt é obrigatório.' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await geminiService.generateAdvancedText(prompt, mode);
      setResponse(result.text);
    } catch (e) {
      setError('Falha ao gerar resposta. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, mode]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Geração de Texto Avançada</h2>
      <p className="text-slate-400 mb-6">
        Use o 'Modo Pensamento' para raciocínio complexo, ou o 'Modo Rápido' para resultados de baixa latência.
      </p>
      
      <div className="flex justify-center mb-6">
        <div className="bg-slate-800 rounded-full p-1 flex items-center">
          <Button
            onClick={() => setMode('thinking')}
            className={`px-6 py-2 rounded-full text-sm font-medium ${mode === 'thinking' ? 'bg-orange-600 text-white' : 'bg-transparent text-slate-300'}`}
          >
            Modo Pensamento (Pro)
          </Button>
          <Button
            onClick={() => setMode('fast')}
            className={`px-6 py-2 rounded-full text-sm font-medium ${mode === 'fast' ? 'bg-orange-600 text-white' : 'bg-transparent text-slate-300'}`}
          >
            Modo Rápido (Flash-Lite)
          </Button>
        </div>
      </div>
      
      <TextArea
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          if (errors.prompt) setErrors(prev => ({...prev, prompt: undefined}));
        }}
        placeholder="Digite sua consulta complexa ou pergunta simples aqui..."
        className="min-h-[150px] mb-4"
        disabled={isLoading}
        error={errors.prompt}
      />
      <div className="flex justify-end">
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full sm:w-auto">
          {isLoading ? 'Gerando...' : 'Gerar Resposta'}
        </Button>
      </div>

      {isLoading && <div className="flex justify-center mt-8"><Loader /></div>}
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      {response && (
        <Card className="mt-6 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-3 text-white">Resposta Gerada</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{response}</p>
        </Card>
      )}
    </div>
  );
};