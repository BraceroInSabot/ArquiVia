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
import { $getRoot, $isParagraphNode } from 'lexical';
//@ts-ignore
import Prism from 'prismjs';

// Imports de Serviços e Tipos
import documentService from '../services/Document/api';
import type { Document as ApiDocument } from '../services/core-api';
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

// Import do CSS
import '../assets/css/EditorTheme.css';

// Configuração Base do Editor
const baseInitialConfig = {
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

// Filtra o transformer de Código (que precisa do Prism)
const filteredTransformers = TRANSFORMERS.filter(t => t !== CODE);


const EditDocumentPage = () => {
  // Hooks de Roteamento e Estado
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  const [title, setTitle] = useState(''); // Estado para o título do documento
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento da página
  
  // Estado dinâmico do editor (para carregar dados da API)
  const [editorConfig, setEditorConfig] = useState(baseInitialConfig);

  // Estados do Histórico e Autosave
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
          // (Assumindo que você adicionou 'getDocumentById' ao seu service)
          const response = await documentService.getDocumentById(Number(id)); 
          const doc = response.data.data; // (Ajuste o caminho se necessário)

          setTitle(doc.title || 'Documento Sem Título');
          
          // Define o estado inicial do editor com o conteúdo do banco
          setEditorConfig({
            ...baseInitialConfig,
            editorState: doc.content_json, // Use a string JSON do seu backend
          });
          
        } catch (error) {
          console.error("Falha ao buscar documento:", error);
          alert("Não foi possível carregar o documento. Verifique o console.");
          setEditorConfig(baseInitialConfig); // Carrega em branco se falhar
        }
      } else {
        // --- MODO CRIAÇÃO (sem ID, ex: /documento/novo) ---
        // Tenta carregar do histórico local (localStorage)
        const latestState = getLatestHistoryEntry();
        if (latestState) {
          setEditorConfig({ ...baseInitialConfig, editorState: latestState.state });
        } else {
          setEditorConfig(baseInitialConfig); // Garante que carrega vazio
        }
      }
      setIsLoading(false);
    };

    fetchDocument();
  }, [id]); // Roda sempre que o ID na URL mudar

  // --- LÓGICA DE SALVAMENTO (AUTO-SAVE) ---

  const triggerGlow = () => {
    setIsGlowing(true);
    setTimeout(() => {
      setIsGlowing(false);
    }, 1500);
  };

  // Função 'saveSnapshot' atualizada para salvar no Backend
  const saveSnapshot = useCallback(async (currentState: string) => {
    // 1. Salva no localStorage (histórico rápido)
    addHistoryEntry(currentState);
    setHistory(getHistoryEntries()); 
    triggerGlow(); 

    // 2. Salva no Backend (APENAS se estivermos editando um doc existente)
    if (id) {
      if (currentState === '{"root":{"children":[{"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"version":1}}') {
          return; // Não salva estado vazio no backend
      }
      
      try {
        // Chama a API com 'id', 'title' e 'content'
        await documentService.editDocument(Number(id), title, currentState); 
        console.log(`Snapshot salvo no backend para doc ${id}`);
      } catch (error) {
        console.error("Falha ao salvar snapshot no backend:", error);
      }
    }
  }, [id, title]); // Depende do 'id' e 'title'

  const handleOnChange = (editorState: EditorState) => {
    const editorStateJSON = JSON.stringify(editorState.toJSON());
    editorStateRef.current = editorStateJSON;

    if (!autosaveActiveRef.current) {
      return;
    }

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Salva 5 minutos (300.000 ms) após a *última* mudança
    inactivityTimerRef.current = window.setTimeout(() => {
      console.log("Inatividade detectada: Salvando snapshot...");
      saveSnapshot(editorStateJSON);
    }, 300000); 
  };

  // Sincroniza o estado do 'toggle' com o Ref (para o 'beforeunload')
  useEffect(() => {
    autosaveActiveRef.current = isAutosaveActive;
  }, [isAutosaveActive]);

  // Salva no localStorage ANTES de fechar a aba
  useEffect(() => {
    const handleSaveOnExit = (event: BeforeUnloadEvent) => {
      if (!autosaveActiveRef.current) return;
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
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
  }, []); // Array vazio é intencional


  // --- RENDERIZAÇÃO ---

  // Estado de Carregamento
  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h2>Carregando documento...</h2>
      </div>
    );
  }

  // Editor Carregado
  return (
    <div style={{ padding: '2rem' }}>
      <center>
        {/* --- Input de Título --- */}
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            // Salva o título no backend quando o usuário clica fora
            if (id) {
              console.log("Salvando título...");
              documentService.editDocument(Number(id), title, editorStateRef.current || "");
            }
          }}
          placeholder="Título do Documento"
          style={{ fontSize: '1.5rem', fontWeight: 'bold', border: 'none', textAlign: 'center', width: '100%', marginBottom: '1rem', outline: 'none' }}
        />
      </center>
      
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          
          <FormattingToolbarPlugin />
          
          <div className="editor-inner-content">
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
            history={history}
            isAutosaveActive={isAutosaveActive}
            onAutosaveToggle={() => setIsAutosaveActive(prev => !prev)}
            isGlowing={isGlowing}
          />
          
          {/* O LoadInitialStatePlugin foi removido daqui */}
        </div>
      </LexicalComposer>
    </div>
  );
};

export default EditDocumentPage;