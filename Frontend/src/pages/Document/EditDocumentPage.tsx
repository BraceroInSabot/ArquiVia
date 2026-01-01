import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

// Lexical Core
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

// Colaboração (Yjs + WebSocket)
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import type { Provider } from '@lexical/yjs';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Plugins do Lexical
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS, CODE } from '@lexical/markdown';

// Plugins Customizados e Nós
import { ImageNode } from '../../components/node/ImageNode';
import { VideoNode } from '../../components/node/VideoNode';
import VideoPlugin from '../../plugin/VideoPlugin';
import ImagePlugin from '../../plugin/ImagePlugin';
import FormattingToolbarPlugin from '../../plugin/ToolBarPlugin';
import ActionsPlugin from '../../plugin/DownBarPlugin';

// Contextos e Serviços
import { useAuth } from '../../contexts/AuthContext'; 
import documentService from '../../services/Document/api';

// Estilos
import '../../assets/css/EditorTheme.css'; 
import '../../assets/css/CollaborativeCursor.css'; 

const WS_ENDPOINT = 'ws://localhost:8000/'; 
const CURSOR_COLORS = ['#d946ef', '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
const getRandomColor = () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

const filteredTransformers = TRANSFORMERS.filter(t => t !== CODE);

// --- PLUGIN DE RESTAURAÇÃO (CORRIGIDO PARA SINGLE USER) ---
const RestoreContentPlugin = ({ 
    content, 
    providerRef,
    isConnected
}: { 
    content: string | null, 
    providerRef: React.MutableRefObject<WebsocketProvider | null>,
    isConnected: boolean
}) => {
    const [editor] = useLexicalComposerContext();
    const hasRestored = useRef(false);

    useEffect(() => {
        const provider = providerRef.current;
        // Se não tem conteúdo de backup, ou já restaurou, ou não conectou ainda: aborta.
        if (!content || hasRestored.current || !provider || !isConnected) return;

        // Função que faz o trabalho sujo
        const attemptRestore = (source: string) => {
            if (hasRestored.current) return;

            // Pequeno delay para garantir que qualquer binário recebido do socket seja processado
            setTimeout(() => {
                editor.update(() => {
                    // Verifica novamente dentro do update para evitar race conditions
                    if (hasRestored.current) return;

                    const root = $getRoot();
                    const textContent = root.getTextContent();
                    const isEmpty = textContent.trim().length === 0;

                    if (isEmpty) {
                        try {
                            const initialEditorState = editor.parseEditorState(content);
                            editor.setEditorState(initialEditorState);
                            console.log(`⚡ Conteúdo restaurado da API via ${source} (Yjs estava vazio).`);
                            hasRestored.current = true;
                        } catch (e) {
                            console.error("Erro restore:", e);
                        }
                    } else {
                        console.log(`🔄 Yjs já tem conteúdo (${source}). Ignorando API.`);
                        hasRestored.current = true;
                    }
                });
            }, 100); 
        };

        // ESTRATÉGIA DUPLA:
        // 1. Se 'synced' disparar (temos gente online), restaura na hora.
        if (provider.synced) {
            attemptRestore('Immediate Sync');
        } else {
            const onSync = (isSynced: boolean) => {
                if (isSynced) attemptRestore('Event Sync');
            };
            provider.on('synced', onSync);

            // 2. TIMEOUT DE SOLIDÃO (A CORREÇÃO):
            // Se passar 1 segundo e ninguém falar nada, assumimos que estamos sozinhos
            // e o servidor é um Relay Cego. Forçamos a verificação.
            const timeoutId = setTimeout(() => {
                if (!hasRestored.current) {
                    attemptRestore('Timeout Fallback');
                }
            }, 1000);

            return () => {
                // provider.off('synced', onSync); // y-websocket as vezes falha no off, deixamos quieto
                clearTimeout(timeoutId);
            };
        }
    }, [content, isConnected, editor, providerRef]);

    return null;
};

const EditDocumentPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [title, setTitle] = useState('');
  const [serverContent, setServerContent] = useState<string | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true); 
  const [isConnected, setIsConnected] = useState(false); 
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const [isAutosaveActive, setIsAutosaveActive] = useState(true);
  const [isGlowing, setIsGlowing] = useState(false);

  const providerRef = useRef<WebsocketProvider | null>(null);

  const userInfo = useMemo(() => ({
    name: user?.data?.name || 'Usuário Anônimo',
    color: getRandomColor(),
  }), [user]);

  const initialConfig = {
    namespace: 'CollaborativeEditor',
    theme: {
      list: { ol: 'editor-list-ol', ul: 'editor-list-ul', listitem: 'editor-listitem' },
      image: 'editor-image', video: 'editor-video',
      heading: { h1: 'editor-heading-h1', h2: 'editor-heading-h2', h3: 'editor-heading-h3' },
      quote: 'editor-quote', code: 'editor-code', link: 'editor-link',
      text: { bold: 'editor-text-bold', italic: 'editor-text-italic', underline: 'editor-text-underline', highlight: 'editor-text-highlight' },
    },
    editorState: null, 
    onError(error: Error) { console.error('Lexical Error:', error); },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode, VideoNode]
  };

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>): Provider => {
      let doc = yjsDocMap.get(id);

      if (!doc) {
        doc = new Y.Doc();
        yjsDocMap.set(id, doc);
      } else {
        doc.load();
      }

      const url = `${WS_ENDPOINT}ws/editor/`;
      
      const provider = new WebsocketProvider(
        url,
        id + '/', 
        doc,
        { connect: false }
      );

      providerRef.current = provider;

      provider.on('status', (event: any) => {
        const connected = event.status === 'connected';
        setIsConnected(connected);
        setSaveStatus(connected ? 'saved' : 'unsaved');
      });

      provider.awareness.setLocalStateField('user', {
        name: userInfo.name,
        color: userInfo.color,
      });

      provider.connect();

      return provider as unknown as Provider;
    },
    [userInfo]
  );

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      if (id) {
        try {
          const response = await documentService.getDocumentById(Number(id)); 
          const doc = response.data.data; 
          setTitle(doc.title || 'Documento Sem Título');
          if (doc.content) {
              //@ts-ignore
              setServerContent(doc.content);
          }
        } catch (error) {
          toast.error("Erro ao carregar dados do documento.");
        }
      }
      setIsLoadingMetadata(false);
    };
    fetchMetadata();
  }, [id]); 

  const triggerGlow = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 1500);
  };

  const handleManualSave = async (jsonContent: string) => {
    triggerGlow();
    setSaveStatus('saving');
    try {
        if (id) {
            await documentService.updateDocument(Number(id), {
                title: title,
                content: jsonContent 
            });
            toast.success("Documento salvo com sucesso!");
            setSaveStatus('saved');
        }
    } catch (e) {
        console.error("Erro ao salvar REST:", e);
        toast.error("Erro ao salvar.");
        setSaveStatus('unsaved');
    }
  };

  const getDisplayTitle = () => {
    if (isTitleFocused) return title; 
    if (title.length > 30) return title.substring(0, 24) + '...'; 
    return title; 
  };

  if (isLoadingMetadata || !id || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 gap-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-gray-500 font-medium">
            {!id ? "Documento não identificado..." : "Conectando ao editor seguro..."}
        </p>
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
                  className="input input-ghost text-xl font-bold max-w-xs md:max-w-md w-full focus:outline-none"
                />
          </div>
        </div>
        
        <div className='gap-2'>
          <div className="navbar-end w-auto min-w-[140px]">
              {!isConnected ? (
                  <div className="flex items-center gap-2 text-error text-sm font-medium animate-pulse" title="Tentando reconectar...">
                      <WifiOff size={16} /> Offline
                  </div>
              ) : (
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                      <CheckCircle size={16} /> Online
                  </div>
              )}
          </div>
          <div className='navbar-end w-auto min-w-[140px]'>
              {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-primary text-sm font-medium animate-pulse">
                      <Loader2 size={16} /> Salvando...
                  </div>
              )}
              {saveStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                      <CheckCircle size={16} /> Salvo
                  </div>
              )}
          </div>
        </div>
      </div>

      <div className="flex overflow-y-auto flex justify-center">
          <div className="bg-white w-full max-w-[850px] min-h-[1100px] h-fit mb-20 p-2 shadow-lg rounded-none md:rounded-lg border border-base-300 flex flex-col relative">
            
            <LexicalComposer initialConfig={initialConfig}>
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
                            placeholder={null} 
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                    </div>
                    
                    <CollaborationPlugin
                        id={id}
                        providerFactory={providerFactory}
                        shouldBootstrap={true}
                        username={userInfo.name}
                        cursorColor={userInfo.color}
                    />

                    <RestoreContentPlugin 
                        content={serverContent} 
                        providerRef={providerRef}
                        isConnected={isConnected} // Importante passar isso
                    />
                    
                    <OnChangePlugin onChange={() => { }} />
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

                </div>
            </LexicalComposer>

          </div>
      </div>
    </div>
  );
};

export default EditDocumentPage;