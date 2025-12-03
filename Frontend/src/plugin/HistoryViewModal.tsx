import { type JSX } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye } from 'lucide-react'; // Ícones

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import ImagePlugin from '../plugin/ImagePlugin'; // Caminho relativo, ajuste se necessário
import VideoPlugin from '../plugin/VideoPlugin'; // Caminho relativo, ajuste se necessário

import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { ImageNode } from '../components/node/ImageNode'; 
import { VideoNode } from '../components/node/VideoNode'; 

interface HistoryViewModalProps {
  editorStateString: string;
  onClose: () => void;
}

// Configuração base do Lexical (Mantida igual)
const viewModalConfig = {
  namespace: 'HistoryViewModal',
  theme: {
    list: { ol: 'editor-list-ol', ul: 'editor-list-ul', listitem: 'editor-listitem' },
    image: 'editor-image', video: 'editor-video',
    heading: { h1: 'editor-heading-h1', h2: 'editor-heading-h2', h3: 'editor-heading-h3' },
    quote: 'editor-quote', code: 'editor-code', link: 'editor-link',
    text: { bold: 'editor-text-bold', italic: 'editor-text-italic', underline: 'editor-text-underline', highlight: 'editor-text-highlight' },
  },
  onError(error: Error) { console.error("Erro no modal de visualização:", error); },
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode, VideoNode]
};

export default function HistoryViewModal({ editorStateString, onClose }: HistoryViewModalProps): JSX.Element {

  const modalInitialConfig = {
    ...viewModalConfig,
    editorState: editorStateString,
    editable: false, // Garante que seja read-only desde a config
  };

  return createPortal(
    <>
      <div className="modal-backdrop bg-black/50 backdrop-blur-sm z-[1050]" onClick={onClose}></div>

      <div className="modal modal-open z-[1051]">
        <div className="modal-box w-11/12 max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-base-100 shadow-2xl rounded-xl">
            
            {/* Cabeçalho */}
            <div className="flex justify-between items-center p-4 border-b border-base-200 bg-base-100 z-10">
                <h3 className="font-bold text-lg flex items-center gap-2 text-secondary">
                    <Eye size={20} className="text-primary" />
                    Visualizar Versão Anterior
                </h3>
                <button 
                    className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-base-200" 
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Corpo com Scroll (Área do Editor Read-Only) */}
            <div className="flex-1 overflow-y-auto bg-base-200/50 p-6 flex justify-center">
                <div className="bg-white w-full max-w-[850px] min-h-full h-fit  shadow-sm border border-base-200 p-8 rounded-lg">
                    <LexicalComposer initialConfig={modalInitialConfig}>
                        <div className="editor-inner-content relative">
                            <RichTextPlugin
                                contentEditable={
                                    // @ts-ignore
                                    <ContentEditable className="editor-input outline-none min-h-[500px]" />
                                }
                                placeholder={null}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                        </div>
                        {/* Plugins necessários para renderização */}
                        <ListPlugin />
                        <ImagePlugin />
                        <VideoPlugin />
                    </LexicalComposer>
                </div>
            </div>

            {/* Rodapé */}
            <div className="modal-action p-4 border-t border-base-200 bg-base-100 m-0 justify-end">
                <button className="btn btn-ghost text-secondary" onClick={onClose}>
                    Fechar Visualização
                </button>
            </div>

        </div>
      </div>
    </>,
    document.body
  );
}