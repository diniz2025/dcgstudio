import React, { useState, useRef, useCallback } from 'react';
import { geminiService } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/fileUtils';
import { Button } from '../ui/Button';
import { Loader } from '../ui/Loader';
import { Card } from '../ui/Card';

enum RecordingState {
  IDLE,
  RECORDING,
  PROCESSING,
}

export const AudioTranscriber: React.FC = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setRecordingState(RecordingState.PROCESSING);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const base64Audio = await fileToBase64(audioBlob);
          const result = await geminiService.transcribeAudio(base64Audio, 'audio/webm');
          setTranscription(result.text);
        } catch (e) {
          setError('Falha ao transcrever o áudio. Por favor, tente novamente.');
          console.error(e);
        } finally {
          setRecordingState(RecordingState.IDLE);
        }
      };

      mediaRecorderRef.current.start();
      setRecordingState(RecordingState.RECORDING);
      setError(null);
      setTranscription(null);
    } catch (err) {
      setError('Acesso ao microfone negado. Por favor, permita o acesso para usar esta funcionalidade.');
      console.error(err);
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RecordingState.RECORDING) {
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);

  const getButtonText = () => {
    switch (recordingState) {
      case RecordingState.IDLE:
        return 'Iniciar Gravação';
      case RecordingState.RECORDING:
        return 'Parar Gravação';
      case RecordingState.PROCESSING:
        return 'Processando...';
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Transcritor de Áudio</h2>
      <p className="text-slate-400 mb-6">Grave sua voz e obtenha uma transcrição instantânea com o Gemini.</p>
      
      <Card className="p-8">
        <Button 
          onClick={recordingState === RecordingState.RECORDING ? handleStopRecording : handleStartRecording} 
          disabled={recordingState === RecordingState.PROCESSING}
          className="w-48 h-16 text-lg"
        >
          {getButtonText()}
        </Button>
        {recordingState === RecordingState.RECORDING && (
          <div className="mt-4 text-orange-400 animate-pulse">Gravando...</div>
        )}
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </Card>
      
      {(recordingState === RecordingState.PROCESSING) && <div className="flex justify-center mt-8"><Loader /></div>}
      
      {transcription && (
        <Card className="mt-6 p-6 animate-fade-in text-left">
          <h3 className="text-lg font-semibold mb-3 text-white">Resultado da Transcrição</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{transcription}</p>
        </Card>
      )}
    </div>
  );
};