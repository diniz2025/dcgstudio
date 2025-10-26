import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader } from '../ui/Loader';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ prompt?: string }>({});

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setErrors({ prompt: 'O prompt é obrigatório.' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const result = await geminiService.generateImage(prompt, aspectRatio);
      setImageUrl(result);
    } catch (e) {
      setError('Falha ao gerar a imagem. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Geração de Imagens</h2>
      <p className="text-gray-400 mb-6">Crie imagens de alta qualidade a partir de descrições de texto usando o Imagen.</p>
      
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
          <Input
            id="prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (errors.prompt) setErrors(prev => ({...prev, prompt: undefined}));
            }}
            placeholder="ex: Uma foto de um astronauta cavalgando em Marte"
            disabled={isLoading}
            error={errors.prompt}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Proporção</label>
          <Select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} disabled={isLoading}>
            <option value="1:1">1:1 (Quadrado)</option>
            <option value="16:9">16:9 (Widescreen)</option>
            <option value="9:16">9:16 (Retrato)</option>
            <option value="4:3">4:3 (Padrão)</option>
            <option value="3:4">3:4 (Vertical)</option>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full">
          {isLoading ? 'Gerando...' : 'Gerar Imagem'}
        </Button>
      </Card>
      
      {isLoading && <div className="flex justify-center mt-8"><Loader /></div>}
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      {imageUrl && (
        <Card className="mt-6 p-4 animate-fade-in">
          <img src={imageUrl} alt={prompt} className="rounded-lg w-full" />
        </Card>
      )}
    </div>
  );
};