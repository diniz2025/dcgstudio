import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { useVeoPolling } from '../../hooks/useVeoPolling';
import { fileToBase64 } from '../../utils/fileUtils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';

export const ImageToVideo: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { isPolling, videoUrl, error, pollOperation, status, reset } = useVeoPolling();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      reset();
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!imageFile) return;
    
    try {
      const base64Image = await fileToBase64(imageFile);
      const initialOperation = await geminiService.generateVideoFromImage(
        prompt,
        { imageBytes: base64Image, mimeType: imageFile.type },
        aspectRatio
      );
      pollOperation(initialOperation);
    } catch (e) {
      console.error(e);
      // The hook will set the error state
    }
  }, [imageFile, prompt, aspectRatio, pollOperation]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Geração de Vídeo a partir de Imagem</h2>
      <p className="text-gray-400 mb-6">Dê vida às suas imagens. Envie uma imagem inicial e veja o Veo criar um vídeo.</p>
      
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Enviar Imagem Inicial</label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isPolling} />
          </div>
          <div>
            <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">3. Selecione a Proporção</label>
            <Select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} disabled={isPolling}>
              <option value="16:9">16:9 (Paisagem)</option>
              <option value="9:16">9:16 (Retrato)</option>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">2. Descreva a ação (opcional)</label>
          <Input id="prompt" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="ex: O carro parte em direção ao pôr do sol" disabled={isPolling} />
        </div>
        <Button onClick={handleGenerate} disabled={isPolling || !imageFile} className="w-full">
          {isPolling ? `Gerando... (${status})` : 'Gerar Vídeo'}
        </Button>
      </Card>
      
      {error && <p className="text-red-400 my-4 text-center font-semibold">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-white">Imagem Inicial</h3>
          {previewImage ? (
            <img src={previewImage} alt="Preview" className="rounded-lg shadow-lg mx-auto max-h-96" />
          ) : (
            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              Sua imagem enviada aparecerá aqui
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-white">Vídeo Gerado</h3>
          {videoUrl ? (
            <video src={videoUrl} controls autoPlay loop className="rounded-lg shadow-lg w-full animate-fade-in" />
          ) : (
            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              {isPolling ? 'O vídeo está sendo gerado...' : 'Seu vídeo aparecerá aqui'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};