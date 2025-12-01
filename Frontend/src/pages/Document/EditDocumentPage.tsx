import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'; // AlertCircle adicionado
import toast from 'react-hot-toast';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { EditorState } from 'lexical';

// Imports de Serviços
import documentService from '../../services/Document/api';
import { getLatestHistoryEntry } from '../../utils/history_manager';

// Imports de Plugins do Lexical
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { ImageNode } from '../../components/node/ImageNode';
import { VideoNode } from '../../components/node/VideoNode';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS, CODE } from '@lexical/markdown';

// Imports de Plugins Customizados
import VideoPlugin from '../../plugin/VideoPlugin';
import ImagePlugin from '../../plugin/ImagePlugin';
import FormattingToolbarPlugin from '../../plugin/ToolBarPlugin';
import ActionsPlugin from '../../plugin/DownBarPlugin';

import '../../assets/css/EditorTheme.css'; 

const baseInitialConfig = {
  namespace: 'MyEditor',
  theme: {
    list: { ol: 'editor-list-ol', ul: 'editor-list-ul', listitem: 'editor-listitem' },
    image: 'editor-image', video: 'editor-video',
    heading: { h1: 'editor-heading-h1', h2: 'editor-heading-h2', h3: 'editor-heading-h3' },
    quote: 'editor-quote', code: 'editor-code', link: 'editor-link',
    text: { bold: 'editor-text-bold', italic: 'editor-text-italic', underline: 'editor-text-underline', highlight: 'editor-text-highlight' },
  },
  onError(error: Error) { throw error; },
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode, VideoNode]
};

const filteredTransformers = TRANSFORMERS.filter(t => t !== CODE);

// --- CORREÇÃO APLICADA AQUI ---
// O setTimeout(..., 0) resolve o aviso de flushSync
function LoadInitialStatePlugin({ initialContent }: { initialContent: string | null }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (initialContent) {
      // Move a atualização para o final da fila de eventos
      const timer = setTimeout(() => {
        try {
          const initialEditorState = editor.parseEditorState(initialContent);
          editor.setEditorState(initialEditorState);
        } catch (e) {
          console.error("Falha ao carregar estado salvo.", e);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [editor, initialContent]); 
  
  return null;
}
// --- FIM DA CORREÇÃO ---

const EditDocumentPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [title, setTitle] = useState(''); 
  const [isLoading, setIsLoading] = useState(true); 
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const [isAutosaveActive, setIsAutosaveActive] = useState(true);
  const [isGlowing, setIsGlowing] = useState(false);

  const inactivityTimerRef = useRef<number | null>(null);
  const editorStateRef = useRef<string | null>(null);
  const autosaveActiveRef = useRef<boolean>(true);

  // --- LÓGICA (INTACTA) ---
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      if (id) {
        try {
          const response = await documentService.getDocumentById(Number(id)); 
          const doc = response.data.data; 
          setTitle(doc.title || 'Documento Sem Título');
          // @ts-ignore
          setInitialContent(doc.content); 
        } catch (error) {
          toast.error("Não foi possível carregar o documento.");
          setInitialContent(null);
        }
      } else {
        const latestState = getLatestHistoryEntry();
        if (latestState) setInitialContent(latestState.state);
        else setInitialContent(null); 
      }
      setIsLoading(false);
    };
    fetchDocument();
  }, [id]); 

  const triggerGlow = () => {
    setIsGlowing(true);
    setSaveStatus('saved');
    setTimeout(() => setIsGlowing(false), 1500);
  };

  const saveSnapshot = useCallback(async (currentState: string) => {
    setSaveStatus('saving');
    
    if (id) {
      if (currentState === '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"version":1}}') return; 
      try {
        await documentService.updateDocument(Number(id), { content: currentState }); 
        triggerGlow();
      } catch (error) {
        console.error("Falha ao salvar snapshot:", error);
        setSaveStatus('unsaved');
      }
    } else {
        triggerGlow();
    }
  }, [id]); 

  const handleOnChange = (editorState: EditorState) => {
    const editorStateJSON = JSON.stringify(editorState.toJSON());
    editorStateRef.current = editorStateJSON;
    setSaveStatus('unsaved');

    if (!autosaveActiveRef.current) return;
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    inactivityTimerRef.current = window.setTimeout(() => {
      saveSnapshot(editorStateJSON);
    }, 300000); 
  };

  const handleManualSave = () => {
    const currentState = editorStateRef.current;
    if (currentState) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      saveSnapshot(currentState); 
    }
  };

  useEffect(() => {
    autosaveActiveRef.current = isAutosaveActive;
  }, [isAutosaveActive]);

  const getDisplayTitle = () => {
    if (isTitleFocused) return title; // Se focado, mostra tudo
    if (title.length > 30) return title.substring(0, 24) + '...'; // Se blur, corta
    return title; // Se curto, mostra tudo
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 gap-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-gray-500 font-medium">Carregando editor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-base-200 overflow-hidden">
      
      <div className="navbar flex justify-between items-center bg-base-100 border-b border-base-300 shadow-sm h-16 px-4 z-20">
        <div>
          <div className="navbar-start w-auto">
              <button 
                  onClick={() => navigate('/documentos')} 
                  className="btn btn-ghost btn-circle text-secondary"
                  title="Voltar"
              >
                  <ArrowLeft size={24} />
              </button>
          </div>
          
          <div>
              <input 
                  type="text" 
                  value={getDisplayTitle()}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setIsTitleFocused(true)}
                  onBlur={() => {
                    setIsTitleFocused(false); 
                    if (id) {
                      documentService.updateDocument(Number(id), { title: title });
                    }
                  }}
                  
                  placeholder="Título do Documento"
                  className="input input-ghost text-xl font-bold max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl w-full focus:outline-none"
                  title={title}
                />
          </div>
        </div>

        <div className="navbar-end w-auto min-w-[140px]">
            {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 size={16} className="animate-spin" /> Salvando...
                </div>
            )}
            {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle size={16} /> Salvo
                </div>
            )}
            {saveStatus === 'unsaved' && (
                <div className="flex items-center gap-2 text-warning text-sm font-medium" title="Alterações não salvas">
                    <AlertCircle size={16} /> Não salvo
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex justify-center p-4 md:p-8 relative">
          
          <div className="bg-white w-full max-w-[850px] min-h-[1100px] h-fit mb-8 p-2 shadow-lg rounded-none md:rounded-lg border border-base-300 flex flex-col relative">
            
            <LexicalComposer initialConfig={baseInitialConfig}>
                <div className="flex flex-col flex-grow h-full relative">
                
                    <div className="sticky flex justify-end top-0 z-10">
                        <FormattingToolbarPlugin />
                    </div>
                    
                    <div className="flex-grow relative px-4 md:px-8 cursor-text" onClick={() => {
                        const editorElement = document.querySelector('.editor-input') as HTMLElement;
                        if(editorElement) editorElement.focus();
                    }}>
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="editor-input outline-none min-h-full text-lg leading-relaxed text-gray-800" />}
                            placeholder={null} // Placeholder removido do JSX original, ajuste se necessário
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
                        onManualSave={handleManualSave}
                    />
                    
                    {/* Usando o componente corrigido */}
                    <LoadInitialStatePlugin initialContent={initialContent} />

                </div>
            </LexicalComposer>

          </div>
      </div>
    </div>
  );
};

export default EditDocumentPage;