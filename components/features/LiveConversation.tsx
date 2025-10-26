import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage } from '@google/genai';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { encode, decode, decodeAudioData, createBlob } from '../../utils/audioUtils';
import { Loader } from '../ui/Loader';

enum ConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

export const LiveConversation: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
  const [statusText, setStatusText] = useState("Clique em 'Iniciar Conversa' para começar.");
  
  const sessionRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const currentInputTranscription = useRef<string>('');
  const currentOutputTranscription = useRef<string>('');

  const stopConversation = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current.then(session => session.close());
        sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setConnectionState(ConnectionState.DISCONNECTED);
    setStatusText("Conversa encerrada. Clique em 'Iniciar' para começar novamente.");
  }, []);

  const startConversation = useCallback(async () => {
    setConnectionState(ConnectionState.CONNECTING);
    setStatusText('Solicitando permissões e conectando...');
    setTranscriptionHistory([]);
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        sessionRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: ['AUDIO'],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
            callbacks: {
                onopen: () => {
                    setConnectionState(ConnectionState.CONNECTED);
                    setStatusText('Conectado! Comece a falar.');
                    // FIX: Cast window to `any` to allow for `webkitAudioContext` for cross-browser compatibility.
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    const source = audioContextRef.current.createMediaStreamSource(stream);
                    scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        if (sessionRef.current) {
                            sessionRef.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };
                    source.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscription.current += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        const fullInput = currentInputTranscription.current;
                        const fullOutput = currentOutputTranscription.current;
                        if (fullInput) {
                          setTranscriptionHistory(prev => [...prev, `Você: ${fullInput}`]);
                        }
                        if (fullOutput) {
                          setTranscriptionHistory(prev => [...prev, `Gemini: ${fullOutput}`]);
                        }
                        currentInputTranscription.current = '';
                        currentOutputTranscription.current = '';
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    setStatusText(`Erro: ${e.message}. Por favor, tente novamente.`);
                    setConnectionState(ConnectionState.ERROR);
                    stopConversation();
                },
                onclose: () => {
                    setStatusText("Conexão encerrada.");
                    // Check state to avoid auto-restarting on manual stop
                    if (connectionState !== ConnectionState.DISCONNECTED) {
                        stopConversation();
                    }
                },
            },
        });
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setStatusText('Falha ao obter permissões do microfone. Por favor, permita o acesso e tente novamente.');
      setConnectionState(ConnectionState.ERROR);
    }
  }, [stopConversation, connectionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Conversa ao Vivo</h2>
      <p className="text-gray-400 mb-6">Tenha uma conversa de voz em tempo real com o Gemini.</p>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-medium">{statusText}</p>
          <div className="flex items-center gap-2">
            {connectionState === ConnectionState.CONNECTED && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            {connectionState === ConnectionState.CONNECTING && <Loader />}
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={startConversation} disabled={connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.CONNECTED} className="flex-1">
            Iniciar Conversa
          </Button>
          <Button onClick={stopConversation} disabled={connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR} variant="secondary" className="flex-1">
            Parar Conversa
          </Button>
        </div>
      </Card>
      
      <Card className="mt-6 p-4 h-80 overflow-y-auto">
        <h3 className="font-semibold text-white mb-2">Transcrição</h3>
        {transcriptionHistory.length > 0 ? (
          <div className="space-y-2 text-sm text-gray-300">
            {transcriptionHistory.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">A transcrição aparecerá aqui...</p>
        )}
      </Card>
    </div>
  );
};