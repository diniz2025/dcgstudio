import React, { useState, useCallback, useRef } from 'react';
import { geminiService } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader } from '../ui/Loader';
import { Card } from '../ui/Card';

export const VideoAnalyzer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ prompt?: string; video?: string }>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.video) setErrors(prev => ({ ...prev, video: undefined }));
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setResponse(null);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const captureFrame = async (): Promise<{ base64: string; mimeType: 'image/jpeg' }> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) return reject('Video element not found');
      
      const canvas = document.createElement('canvas');
      videoRef.current.onseeked = () => {
        canvas.width = videoRef.current!.videoWidth;
        canvas.height = videoRef.current!.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');
        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const base64 = await fileToBase64(blob);
              resolve({ base64, mimeType: 'image/jpeg' });
            } catch (err) {
              reject(err);
            }
          } else {
            reject('Could not create blob from canvas');
          }
        }, 'image/jpeg', 0.9);
      };
      videoRef.current.currentTime = 1; // Seek to 1 second to get a good frame
    });
  };

  const handleAnalyze = useCallback(async () => {
    const newErrors: { prompt?: string; video?: string } = {};
    if (!prompt.trim()) newErrors.prompt = 'A pergunta é obrigatória.';
    if (!videoFile) newErrors.video = 'Por favor, envie um vídeo.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const { base64, mimeType } = await captureFrame();
      const updatedPrompt = `Com base neste único quadro de um vídeo, responda à seguinte pergunta: ${prompt}`;
      const result = await geminiService.analyzeVideoFrame(base64, mimeType, updatedPrompt);
      setResponse(result.text);
    } catch (e) {
      setError('Falha ao analisar o vídeo. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [videoFile, prompt]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Analisador de Vídeos</h2>
      <p className="text-slate-400 mb-2">Envie um vídeo e faça perguntas sobre seu conteúdo.</p>
      <p className="text-sm bg-yellow-900/50 text-yellow-300 border border-yellow-700 p-3 rounded-lg mb-6">
        <strong>Observação:</strong> Devido a limitações do navegador, esta ferramenta analisa o <strong>primeiro quadro</strong> do vídeo, não o conteúdo completo do vídeo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="p-4 mb-4">
            {videoPreview ? (
              <video ref={videoRef} src={videoPreview} muted className="rounded-lg w-full" />
            ) : (
              <div className="w-full h-64 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                Envie um vídeo para analisar
              </div>
            )}
          </Card>
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="w-full"
            error={errors.video}
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
                placeholder="ex: O que está acontecendo nesta cena?"
                disabled={isLoading}
                error={errors.prompt}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading || !videoFile || !prompt.trim()} className="w-full">
              {isLoading ? 'Analisando...' : 'Analisar Quadro do Vídeo'}
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