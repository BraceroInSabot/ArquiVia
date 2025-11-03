import { useState, useRef, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'; // Importe este hook
import type { EditorState } from 'lexical';
import { $getRoot, $isParagraphNode } from 'lexical';
//@ts-ignore
import Prism from 'prismjs';

import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';

import {
  addHistoryEntry,
  getHistoryEntries,
  getLatestHistoryEntry,
  type HistoryEntry
} from '../utils/history_manager';
import { ImageNode } from '../components/node/ImageNode';
import { VideoNode } from '../components/node/VideoNode';

import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS, CODE } from '@lexical/markdown';
import VideoPlugin from '../plugin/VideoPlugin';
import ImagePlugin from '../plugin/ImagePlugin';

import FormattingToolbarPlugin from '../plugin/ToolBarPlugin';
import ActionsPlugin from '../plugin/DownBarPlugin';

import '../assets/css/EditorTheme.css';

const initialConfig = {
  namespace: 'MyEditor',
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
  onError(error: Error) {
    throw error;
  },
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

const filteredTransformers = TRANSFORMERS.filter(t => t !== CODE);

// Componente-filho para carregar o estado inicial
function LoadInitialStatePlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    const latestState = getLatestHistoryEntry();
    if (latestState) {
      try {
        const initialEditorState = editor.parseEditorState(latestState.state);
        editor.setEditorState(initialEditorState);
      } catch (e) {
        console.error("Falha ao carregar estado salvo, iniciando em branco.", e);
      }
    }
  }, [editor]); // Roda uma vez quando o editor está pronto

  return null;
}

// Componente Principal
const CreateEditDocumentPage = () => {
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistoryEntries());
  const [isAutosaveActive, setIsAutosaveActive] = useState(true);
  const [isGlowing, setIsGlowing] = useState(false);

  const inactivityTimerRef = useRef<number | null>(null);
  const editorStateRef = useRef<string | null>(null);
  const autosaveActiveRef = useRef<boolean>(true);

  const triggerGlow = () => {
    setIsGlowing(true);
    setTimeout(() => {
      setIsGlowing(false);
    }, 1500);
  };

  const saveSnapshot = (currentState: string) => {
    // Evita salvar se o estado estiver vazio
    if (currentState === '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"version":1}}') {
        return;
    }
    
    addHistoryEntry(currentState);
    setHistory(getHistoryEntries()); 
    triggerGlow();
  };

  const handleOnChange = (editorState: EditorState) => {
    const editorStateJSON = JSON.stringify(editorState.toJSON());
    editorStateRef.current = editorStateJSON;

    if (!autosaveActiveRef.current) {
      return;
    }

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      console.log("Inatividade detectada: Salvando snapshot...");
      saveSnapshot(editorStateJSON);
    }, 300000); 
  };

  useEffect(() => {
    autosaveActiveRef.current = isAutosaveActive;
  }, [isAutosaveActive]);

  useEffect(() => {
    const handleSaveOnExit = (event: BeforeUnloadEvent) => {
      if (!autosaveActiveRef.current) return;
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      const currentState = editorStateRef.current;
      if (currentState) {
        console.log("Salvando snapshot antes de fechar...");
        addHistoryEntry(currentState);
      }
    };

    window.addEventListener('beforeunload', handleSaveOnExit);

    return () => {
      window.removeEventListener('beforeunload', handleSaveOnExit);
    };
  }, []); 

  // --- O 'useEffect' que estava aqui foi REMOVIDO ---
  // (Ele tentava usar 'editor' fora do escopo)

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Criar/Editar Documento</h1>
      
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          
          <FormattingToolbarPlugin />
          
          <div className="editor-inner-content">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          
          <OnChangePlugin onChange={handleOnChange} />
          <HistoryPlugin />
          
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={filteredTransformers} />

          <ImagePlugin />
          <VideoPlugin />

          <ActionsPlugin 
            history={history}
            isAutosaveActive={isAutosaveActive}
            onAutosaveToggle={() => setIsAutosaveActive(prev => !prev)}
            isGlowing={isGlowing}
            // --- A prop 'onRestore' foi REMOVIDA daqui ---
          />

          {/* Este componente carrega o estado inicial */}
          <LoadInitialStatePlugin />

        </div>
      </LexicalComposer>
    </div>
  );
};

export default CreateEditDocumentPage;