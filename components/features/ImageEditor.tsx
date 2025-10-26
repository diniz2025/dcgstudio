import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader } from '../ui/Loader';
import { Card } from '../ui/Card';

export const ImageEditor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ prompt?: string; image?: string }>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.image) setErrors(prev => ({ ...prev, image: undefined }));
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setEditedImage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = useCallback(async () => {
    const newErrors: { prompt?: string; image?: string } = {};
    if (!prompt.trim()) newErrors.prompt = 'A descrição da edição é obrigatória.';
    if (!imageFile) newErrors.image = 'Por favor, envie uma imagem.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await geminiService.editImage(base64Image, imageFile.type, prompt);
      setEditedImage(`data:image/png;base64,${result}`);
    } catch (e) {
      setError('Falha ao editar a imagem. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Editor de Imagens com IA</h2>
      <p className="text-gray-400 mb-6">Envie uma imagem e descreva as alterações que você deseja fazer.</p>
      
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Enviar Imagem</label>
          <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} error={errors.image} />
        </div>
        <div className="mb-4">
          <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-2">2. Descreva sua Edição</label>
          <Input
            id="prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (errors.prompt) setErrors(prev => ({...prev, prompt: undefined}));
            }}
            placeholder="ex: Adicione um filtro retrô, deixe o céu roxo"
            disabled={isLoading}
            error={errors.prompt}
          />
        </div>
        <Button onClick={handleEdit} disabled={isLoading || !imageFile || !prompt.trim()} className="w-full">
          {isLoading ? 'Editando...' : 'Aplicar Edição'}
        </Button>
      </Card>
      
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      {isLoading && <div className="flex justify-center mt-8"><Loader /></div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-white">Original</h3>
          {originalImage ? (
            <img src={originalImage} alt="Original" className="rounded-lg shadow-lg mx-auto max-h-96" />
          ) : (
            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              Sua imagem aparecerá aqui
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-white">Editada</h3>
          {editedImage ? (
            <img src={editedImage} alt="Editada" className="rounded-lg shadow-lg mx-auto max-h-96 animate-fade-in" />
          ) : (
            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              A imagem editada aparecerá aqui
            </div>
          )}
        </div>
      </div>
    </div>
  );
};