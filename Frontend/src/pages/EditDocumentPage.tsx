import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { EditorState } from 'lexical';
import toast from 'react-hot-toast';
//@ts-ignore
import { $getRoot, $isParagraphNode } from 'lexical';
//@ts-ignore
import Prism from 'prismjs';
import { useNavigate } from 'react-router-dom';

// Imports de Serviços e Tipos
import documentService from '../services/Document/api';

import {
  addHistoryEntry,
  getHistoryEntries,
  getLatestHistoryEntry,
  type HistoryEntry
} from '../utils/history_manager';

// Imports de Nós do Lexical
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { ImageNode } from '../components/node/ImageNode';
import { VideoNode } from '../components/node/VideoNode';

// Imports de Plugins do Lexical
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS, CODE } from '@lexical/markdown';

// Imports de Plugins Customizados
import VideoPlugin from '../plugin/VideoPlugin';
import ImagePlugin from '../plugin/ImagePlugin';
import FormattingToolbarPlugin from '../plugin/ToolBarPlugin';
import ActionsPlugin from '../plugin/DownBarPlugin';

// Ícones Lucide
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';


// Import do CSS
import '../assets/css/EditorTheme.css';
import '../assets/css/EditDocumentPage.css';

// Configuração Base do Editor
const baseInitialConfig = {
  namespace: 'MyEditor',
  theme: {
    // ... (seu tema)
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

// Filtra o transformer de Código (que precisa do Prism)
const filteredTransformers = TRANSFORMERS.filter(t => t !== CODE);


// --- Componente-filho para carregar o estado inicial ---
// (Movido para fora do componente principal para clareza)
function LoadInitialStatePlugin({ initialContent }: { initialContent: string | null }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (initialContent) {
      try {
        const initialEditorState = editor.parseEditorState(initialContent);
        editor.setEditorState(initialEditorState);
      } catch (e) {
        console.error("Falha ao carregar estado salvo, iniciando em branco.", e);
      }
    }
  }, [editor, initialContent]); 

  return null;
}


const EditDocumentPage = () => {
  // Hooks de Roteamento e Estado
  const { id } = useParams<{ id: string }>(); 
  const [title, setTitle] = useState(''); 
  const [isLoading, setIsLoading] = useState(true); 
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const navigate = useNavigate();


  // Estados do Histórico e Autosave
  //@ts-ignore
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistoryEntries());
  const [isAutosaveActive, setIsAutosaveActive] = useState(true);
  const [isGlowing, setIsGlowing] = useState(false);

  // Refs para a lógica de salvamento
  const inactivityTimerRef = useRef<number | null>(null);
  const editorStateRef = useRef<string | null>(null);
  const autosaveActiveRef = useRef<boolean>(true);

  // --- LÓGICA DE CARREGAMENTO (FETCH) ---
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      if (id) {
        // --- MODO EDIÇÃO (tem ID) ---
        try {
          console.log(`Buscando documento ${id}...`);
          const response = await documentService.getDocumentById(Number(id)); 
          const doc = response.data.data; 

          setTitle(doc.title || 'Documento Sem Título');
          // Assumindo que seu backend retorna o JSON em 'content'
          // Se for string JSON, .content está ok. Se for objeto, .content está ok.
          //@ts-ignore
          setInitialContent(doc.content);
          
        } catch (error) {
          toast.error("Não foi possível carregar o documento. Verifique o console.");
          setInitialContent(null);
        }
      } else {
        // --- MODO CRIAÇÃO (sem ID) ---
        const latestState = getLatestHistoryEntry();
        if (latestState) {
          setInitialContent(latestState.state);
        } else {
          setInitialContent(null); 
        }
      }
      setIsLoading(false);
    };

    fetchDocument();
  }, [id]); 

  // --- LÓGICA DE SALVAMENTO (AUTO-SAVE) ---

  const triggerGlow = () => {
    setIsGlowing(true);
    setTimeout(() => {
      setIsGlowing(false);
    }, 1500);
    setSaveStatus('saved');
  };

  // --- 1. 'saveSnapshot' (Auto-save) ATUALIZADO ---
  const saveSnapshot = useCallback(async (currentState: string) => {
    setSaveStatus('saving');
    addHistoryEntry(currentState);
    setHistory(getHistoryEntries()); 
    triggerGlow(); 

    if (id) {
      if (currentState === '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"version":1}}') {
          return; 
      }
      
      try {
        // Envia APENAS o 'content' (payload parcial)
        await documentService.updateDocument(Number(id), { content: currentState }); 
        console.log(`Snapshot de CONTEÚDO salvo no backend para doc ${id}`);
      } catch (error) {
        console.error("Falha ao salvar snapshot no backend:", error);
        setSaveStatus('unsaved');
      }
    }
  }, [id]); // Depende apenas do 'id'

  const handleOnChange = (editorState: EditorState) => {
    const editorStateJSON = JSON.stringify(editorState.toJSON());
    editorStateRef.current = editorStateJSON;
    setSaveStatus('unsaved');

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
    //@ts-ignore
    const handleSaveOnExit = (event: BeforeUnloadEvent) => {
      if (!autosaveActiveRef.current) return;
      if (inactivityTimerRef.current) { clearTimeout(inactivityTimerRef.current); }
      const currentState = editorStateRef.current;
      if (currentState) {
        console.log("Salvando snapshot (localStorage) antes de fechar...");
        addHistoryEntry(currentState);
      }
    };
    window.addEventListener('beforeunload', handleSaveOnExit);
    return () => {
      window.removeEventListener('beforeunload', handleSaveOnExit);
    };
  }, []); 

  // --- 2. NOVA FUNÇÃO: Salvamento Manual (para o botão) ---
  const handleManualSave = () => {
    const currentState = editorStateRef.current;

    if (currentState) {
      console.log("Salvamento manual disparado...");
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      // Chama a mesma função do auto-save
      saveSnapshot(currentState); 
    }
  };

  // --- RENDERIZAÇÃO ---

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h2>Carregando documento...</h2>
      </div>
    );
  }

  return (
    <div className='p-0 mt-100'>
      <header className="editor-header">
        <div className="header-content container-fluid">
            
            {/* Botão Voltar */}
            <button 
                onClick={() => navigate('/documentos')} 
                className="btn-back"
                title="Voltar para Meus Documentos"
            >
                <ArrowLeft size={24} />
            </button>
            
            {/* Input de Título */}
            <div className="title-container">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => {
                    if (id) {
                      // Salva apenas o título ao sair do campo
                      documentService.updateDocument(Number(id), { title: title });
                    }
                  }}
                  placeholder="Título do Documento"
                  className="document-title-input"
                />
            </div>

            {/* Status de Salvamento */}
            <div className="save-status">
                {saveStatus === 'saving' && (
                    <span className="status-badge saving">
                        <Loader2 size={14} className="animate-spin"/> Salvando...
                    </span>
                )}
                {saveStatus === 'saved' && (
                    <span className="status-badge saved">
                        <CheckCircle2 size={14} /> Salvo
                    </span>
                )}
                {saveStatus === 'unsaved' && (
                    <span className="status-badge unsaved">Não salvo</span>
                )}
            </div>
        </div>
      </header>
      
      <LexicalComposer initialConfig={baseInitialConfig}>
        <div className="editor-container">
          
          <FormattingToolbarPlugin />
          
          <div className="editor-inner-content container-fluid">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div className="editor-placeholder">Comece a escrever...</div>}
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
            isAutosaveActive={isAutosaveActive}
            onAutosaveToggle={() => setIsAutosaveActive(prev => !prev)}
            isGlowing={isGlowing}
            onManualSave={handleManualSave} // Passa a função de salvar
          />
          
          {/* O Plugin de Carregamento agora recebe o conteúdo inicial */}
          <LoadInitialStatePlugin initialContent={initialContent} />

        </div>
      </LexicalComposer>
    </div>
  );
};

export default EditDocumentPage;