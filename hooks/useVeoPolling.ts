import { useState, useCallback, useRef } from 'react';
import { geminiService } from '../services/geminiService';

export const useVeoPolling = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Iniciando...');
  const [hasSelectedKey, setHasSelectedKey] = useState(false);

  const pollIntervalRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setIsPolling(false);
    setVideoUrl(null);
    setError(null);
    setStatus('Iniciando...');
    if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
    }
  }, []);

  const pollOperation = useCallback(async (initialOperation: any) => {
    reset();
    
    // Check for API key
    try {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        if (!keySelected) {
            await window.aistudio.openSelectKey();
        }
        setHasSelectedKey(true); // Assume success after prompt
    } catch(e) {
        console.error("API Key selection error", e);
        setError("Não foi possível verificar a chave de API. Por favor, selecione uma para continuar.");
        return;
    }

    setIsPolling(true);
    let operation = initialOperation;

    const poll = async () => {
      try {
        operation = await geminiService.getVeoOperation(operation);
        
        const progress = operation.metadata?.progressPercentage;
        if (progress) {
          setStatus(`Processando (${Math.round(progress)}%)`);
        } else {
          setStatus('Processando...');
        }
        
        if (operation.done) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsPolling(false);
          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (downloadLink) {
            const videoDataUrl = await geminiService.fetchVeoVideo(downloadLink);
            setVideoUrl(videoDataUrl);
            setStatus('Concluído!');
          } else {
            setError('Geração de vídeo concluída, mas nenhum vídeo foi encontrado.');
          }
        }
      } catch (e: any) {
        console.error('Polling error:', e);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setIsPolling(false);
        if (e.message?.includes("Requested entity was not found.")) {
             setError("Erro na chave de API. Por favor, selecione sua chave novamente e tente de novo.");
             setHasSelectedKey(false);
        } else {
            setError('Ocorreu um erro durante a geração do vídeo.');
        }
      }
    };

    pollIntervalRef.current = window.setInterval(poll, 10000);
    poll(); // Initial poll
  }, [reset]);

  return { isPolling, videoUrl, error, status, pollOperation, reset, hasSelectedKey };
};