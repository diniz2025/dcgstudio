import React from 'react';
import { Feature } from './types';
import { 
  ChatBubbleLeftRightIcon, MagnifyingGlassIcon, CpuChipIcon, PhotoIcon, 
  SparklesIcon, VideoCameraIcon, MusicalNoteIcon, PencilSquareIcon,
  MicrophoneIcon, SpeakerWaveIcon, FilmIcon, EyeIcon
} from './components/ui/Icons';

export const FEATURES: Feature[] = [
  {
    id: 'chatbot',
    name: 'Chatbot com IA',
    description: 'Converse, faça perguntas e obtenha respostas instantâneas.',
    icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
    models: ['gemini-2.5-flash'],
  },
  {
    id: 'grounded-search',
    name: 'Pesquisa Fundamentada',
    description: 'Obtenha informações atualizadas da web e do Google Maps.',
    icon: <MagnifyingGlassIcon className="w-8 h-8" />,
    models: ['gemini-2.5-flash'],
  },
  {
    id: 'advanced-text',
    name: 'Geração de Texto Avançada',
    description: 'Resolva consultas complexas com o Modo Pensamento ou obtenha respostas rápidas.',
    icon: <CpuChipIcon className="w-8 h-8" />,
    models: ['gemini-2.5-pro', 'gemini-2.5-flash-lite'],
  },
  {
    id: 'live-conversation',
    name: 'Conversa ao Vivo',
    description: 'Fale com o Gemini em tempo real com latência ultrabaixa.',
    icon: <MicrophoneIcon className="w-8 h-8" />,
    models: ['gemini-2.5-flash-native-audio-preview-09-2025'],
  },
  {
    id: 'image-generator',
    name: 'Geração de Imagens',
    description: 'Crie imagens impressionantes e de alta qualidade a partir de prompts de texto.',
    icon: <SparklesIcon className="w-8 h-8" />,
    models: ['imagen-4.0-generate-001'],
  },
  {
    id: 'image-editor',
    name: 'Editor de Imagens com IA',
    description: 'Envie uma foto e edite-a com comandos de texto simples.',
    icon: <PencilSquareIcon className="w-8 h-8" />,
    models: ['gemini-2.5-flash-image'],
  },
  {
    id: 'image-analyzer',
    name: 'Analisador de Imagens',
    description: 'Envie uma imagem e faça perguntas para entender seu conteúdo.',
    icon: <EyeIcon className="w-8 h-8" />,
    models: ['gemini-2.5-flash'],
  },
  {
    id: 'video-generator',
    name: 'Geração de Vídeo a partir de Texto',
    description: 'Gere vídeos cinematográficos a partir de prompts de texto com o Veo.',
    icon: <VideoCameraIcon className="w-8 h-8" />,
    models: ['veo-3.1-fast-generate-preview'],
  },
  {
    id: 'image-to-video',
    name: 'Geração de Vídeo a partir de Imagem',
    description: 'Dê vida a uma imagem estática gerando um vídeo a partir dela.',
    icon: <FilmIcon className="w-8 h-8" />,
    models: ['veo-3.1-fast-generate-preview'],
  },
  {
    id: 'video-analyzer',
    name: 'Analisador de Vídeos',
    description: 'Analise o conteúdo de um vídeo fazendo perguntas.',
    icon: <PhotoIcon className="w-8 h-8" />,
    models: ['gemini-2.5-pro'],
  },
  {
    id: 'audio-transcriber',
    name: 'Transcritor de Áudio',
    description: 'Grave áudio do seu microfone e obtenha uma transcrição.',
    icon: <MusicalNoteIcon className="w-8 h-8" />,
    models: ['gemini-2.5-flash'],
  },
  {
    id: 'tts',
    name: 'Texto para Fala',
    description: 'Converta texto em fala com som natural.',
    icon: <SpeakerWaveIcon className="w-8 h-8" />,
    models: ['gemini-2.5-flash-preview-tts'],
  },
];