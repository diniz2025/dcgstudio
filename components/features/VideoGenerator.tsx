import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { useVeoPolling } from '../../hooks/useVeoPolling';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [errors, setErrors] = useState<{ prompt?: string }>({});
  
  const { isPolling, videoUrl, error, pollOperation, status } = useVeoPolling();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setErrors({ prompt: 'O prompt é obrigatório.' });
      return;
    }
    setErrors({});

    try {
      const initialOperation = await geminiService.generateVideoFromText(prompt, aspectRatio);
      pollOperation(initialOperation);
    } catch (e) {
      console.error(e);
      // The hook will set the error state
    }
  }, [prompt, aspectRatio, pollOperation]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Geração de Vídeo a partir de Texto</h2>
      <p className="text-slate-400 mb-6">Descreva uma cena e deixe o Veo criar um vídeo cinematográfico para você. A geração pode levar alguns minutos.</p>
      
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
          <Input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (errors.prompt) setErrors(prev => ({...prev, prompt: undefined}));
            }}
            placeholder="ex: Uma cidade futurista com carros voadores ao pôr do sol"
            disabled={isPolling}
            error={errors.prompt}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-slate-300 mb-2">Proporção</label>
          <Select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} disabled={isPolling}>
            <option value="16:9">16:9 (Paisagem)</option>
            <option value="9:16">9:16 (Retrato)</option>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={isPolling || !prompt.trim()} className="w-full">
          {isPolling ? `Gerando... (${status})` : 'Gerar Vídeo'}
        </Button>
      </Card>
      
      {error && <p className="text-red-400 my-4 text-center font-semibold">{error}</p>}
      
      <div className="mt-6">
        {videoUrl ? (
          <Card className="p-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-2 text-white">Vídeo Gerado</h3>
            <video src={videoUrl} controls autoPlay loop className="rounded-lg w-full" />
          </Card>
        ) : (
          isPolling && (
            <Card className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-white">Geração em Andamento</h3>
              <p className="text-slate-400">Seu vídeo está sendo criado. Isso pode levar vários minutos. Por favor, seja paciente.</p>
              <div className="mt-4 text-orange-400">{status}</div>
            </Card>
          )
        )}
      </div>
    </div>
  );
};