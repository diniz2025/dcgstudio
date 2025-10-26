
import React from 'react';

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  models: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}
