import React, { useState, useCallback, useRef } from 'react';
import { geminiService } from '../../services/geminiService';
import { decode, decodeAudioData } from '../../utils/audioUtils';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { Loader } from '../ui/Loader';
import { Card } from '../ui/Card';

export const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('Olá, mundo! Este é o Gemini falando.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ text?: string }>({});

  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerateAndPlay = useCallback(async () => {
    if (!text.trim()) {
      setErrors({ text: 'O campo de texto não pode estar vazio.' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    setError(null);

    try {
      const base64Audio = await geminiService.generateSpeech(text);

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        // FIX: Cast window to `any` to allow for `webkitAudioContext` for cross-browser compatibility.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioCtx = audioContextRef.current;
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioCtx,
        24000,
        1,
      );

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();

    } catch (e) {
      setError('Falha ao gerar a fala. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [text]);
  
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Texto para Fala</h2>
      <p className="text-gray-400 mb-6">Converta texto em áudio com som natural com o Gemini.</p>
      
      <Card className="p-6">
        <TextArea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (errors.text) setErrors(prev => ({ ...prev, text: undefined }));
          }}
          placeholder="Digite o texto para converter em fala..."
          className="min-h-[150px] mb-4"
          disabled={isLoading}
          error={errors.text}
        />
        <Button onClick={handleGenerateAndPlay} disabled={isLoading || !text.trim()} className="w-full">
          {isLoading ? 'Gerando Áudio...' : 'Gerar e Reproduzir'}
        </Button>
      </Card>
      
      {isLoading && <div className="flex justify-center mt-8"><Loader /></div>}
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
    </div>
  );
};