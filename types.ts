export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface AttachedImageFile {
  file: File;
  dataUrl: string;
}

export interface ImageContent {
    url: string;
    text?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text?: string;
  images?: ImageContent[];
  isLoading?: boolean;
}
