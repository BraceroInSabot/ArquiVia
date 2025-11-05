import { type JSX }from 'react';
import { createPortal } from 'react-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// --- IMPORTANTE: Estes plugins são necessários para renderizar os nós ---
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import ImagePlugin from './ImagePlugin';
import VideoPlugin from './VideoPlugin';

// --- IMPORTANTE: Estes nós DEVEM ser os mesmos da sua página principal ---
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { ImageNode } from '../components/node/ImageNode'; // Verifique o caminho
import { VideoNode } from '../components/node/VideoNode'; // Verifique o caminho

// Props que o modal espera
interface HistoryViewModalProps {
  editorStateString: string; // O JSON do estado a ser visualizado
  onClose: () => void;
}

// Configuração base para o editor read-only
const viewModalConfig = {
  namespace: 'HistoryViewModal',
  // Reutiliza o mesmo tema do editor principal
  theme: {
    list: {
      ol: 'editor-list-ol',
      ul: 'editor-list-ul',
      listitem: 'editor-listitem',
    },
    image: 'editor-image',
    video: 'editor-video',
    heading: {
      h1: 'editor-heading-h1',
      h2: 'editor-heading-h2',
      h3: 'editor-heading-h3',
    },
    quote: 'editor-quote',
    code: 'editor-code',
    link: 'editor-link',
    text: {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
      underline: 'editor-text-underline',
      highlight: 'editor-text-highlight',
    },
  },
  // Erros são logados no console
  onError(error: Error) {
    console.error("Erro no modal de visualização:", error);
  },
  // Registra TODOS os nós que o estado salvo pode conter
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    ImageNode,
    VideoNode
  ]
};


export default function HistoryViewModal({ editorStateString, onClose }: HistoryViewModalProps): JSX.Element {

  // Cria a configuração inicial específica para este modal, 
  // injetando o estado salvo
  const modalInitialConfig = {
    ...viewModalConfig,
    editorState: editorStateString,
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content history-view-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Visualizar Histórico</h2>
        
        <div className="readonly-editor-container">
          <LexicalComposer initialConfig={modalInitialConfig}>
            <div className="editor-inner-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <RichTextPlugin
                contentEditable={
                  // A "mágica" está aqui: editable={false}
                  //@ts-ignore
                  <ContentEditable className="editor-input" editable={false} />
                }
                placeholder={null}
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            {/* Plugins necessários para os nós customizados renderizarem */}
            <ListPlugin />
            <ImagePlugin />
            <VideoPlugin />
          </LexicalComposer>
        </div>
      </div>
    </div>,
    document.body
  );
}