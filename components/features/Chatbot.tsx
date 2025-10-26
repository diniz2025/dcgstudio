import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader } from '../ui/Loader';
import { UserIcon, SparklesIcon } from '../ui/Icons';

export const Chatbot: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ input?: string }>({});
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = geminiService.startChat('gemini-2.5-flash');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSendMessage = useCallback(async () => {
    if (!chatRef.current) return;

    if (!input.trim()) {
      setErrors({ input: 'A mensagem não pode estar vazia.' });
      return;
    }
    setErrors({});

    const userMessage: ChatMessage = { role: 'user', text: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatRef.current.sendMessage(input);
      const modelMessage: ChatMessage = { role: 'model', text: result.text };
      setHistory(prev => [...prev, modelMessage]);
    } catch (e) {
      setError('Falha ao obter resposta do Gemini. Por favor, tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [input]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (errors.input) {
      setErrors(prev => ({ ...prev, input: undefined }));
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Chatbot com IA</h2>
      <div className="flex-grow bg-slate-800 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-700">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <SparklesIcon className="w-16 h-16 mb-4" />
            <p>Pergunte-me qualquer coisa!</p>
          </div>
        )}
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-white" /></div>}
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-white" /></div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 my-4">
             <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-white" /></div>
             <div className="max-w-md p-3 rounded-lg bg-slate-700">
              <Loader />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="flex items-start gap-2">
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder="Digite sua mensagem..."
          wrapperClassName="flex-grow"
          disabled={isLoading}
          error={errors.input}
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </div>
  );
};