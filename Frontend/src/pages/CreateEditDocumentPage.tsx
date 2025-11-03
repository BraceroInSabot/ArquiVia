import { useState, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import type { EditorState } from 'lexical';
import Prism from 'prismjs';

import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
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

interface HistoryEntry {
  state: string;
  timestamp: Date;
}

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

function EditorPlaceholder() {
  return <div className="editor-placeholder">Digite seu texto...</div>;
}

const filteredTransformers = TRANSFORMERS.filter(t => t !== CODE);

const CreateEditDocumentPage = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const debounceTimeoutRef = useRef<number | null>(null);

  const handleOnChange = (editorState: EditorState) => {
    if (editorState.isEmpty()) return;

    const editorStateJSON = JSON.stringify(editorState.toJSON());

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      const newEntry: HistoryEntry = {
        state: editorStateJSON,
        timestamp: new Date(),
      };
      
      setHistory(prevHistory => {
        const updatedHistory = [newEntry, ...prevHistory];
        return updatedHistory.slice(0, 20); 
      });

    }, 2000);
  };

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

          <ActionsPlugin history={history} />

        </div>
      </LexicalComposer>
    </div>
  );
};

export default CreateEditDocumentPage;