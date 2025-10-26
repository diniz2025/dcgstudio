import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader } from '../ui/Loader';
import { Card } from '../ui/Card';

export const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ prompt?: string; image?: string }>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.image) setErrors(prev => ({ ...prev, image: undefined }));
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setResponse(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = useCallback(async () => {
    const newErrors: { prompt?: string; image?: string } = {};
    if (!prompt.trim()) newErrors.prompt = 'A pergunta é obrigatória.';
    if (!imageFile) newErrors.image = 'Por favor, envie uma imagem.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await geminiService.analyzeImage(base64Image, imageFile.type, prompt);
      setResponse(result.text);
    } catch (e) {
      setError('Falha ao analisar a imagem. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Analisador de Imagens</h2>
      <p className="text-slate-400 mb-6">Obtenha insights de suas imagens. Envie uma foto e faça qualquer pergunta sobre ela.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="p-4 mb-4">
            {previewImage ? (
              <img src={previewImage} alt="Upload preview" className="rounded-lg w-full" />
            ) : (
              <div className="w-full h-64 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                Envie uma imagem para analisar
              </div>
            )}
          </Card>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="w-full"
            error={errors.image}
          />
        </div>
        
        <div className="flex flex-col">
          <Card className="p-6 flex-grow flex flex-col">
            <div className="mb-4 flex-grow">
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Sua Pergunta</label>
              <Input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (errors.prompt) setErrors(prev => ({ ...prev, prompt: undefined }));
                }}
                placeholder="ex: Que raça de cachorro é esta?"
                disabled={isLoading}
                error={errors.prompt}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading || !imageFile || !prompt.trim()} className="w-full">
              {isLoading ? 'Analisando...' : 'Analisar Imagem'}
            </Button>
          </Card>
        </div>
      </div>
      
      {isLoading && <div className="flex justify-center mt-8"><Loader /></div>}
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      {response && (
        <Card className="mt-6 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-3 text-white">Resultado da Análise</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{response}</p>
        </Card>
      )}
    </div>
  );
};