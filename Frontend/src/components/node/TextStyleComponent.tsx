import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState, type JSX } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type LexicalCommand,
  type EditorState,
  type TextFormatType,
} from 'lexical';

import BoldIcon from '../icons/bold.svg';
import ItalicIcon from '../icons/italic.svg';
import UnderIcon from '../icons/underline.svg';
import HighlightIcon from '../icons/highlight.svg';

// Tipamos o comando para garantir que o payload seja do tipo correto
const TypedFormatTextCommand: LexicalCommand<TextFormatType> = FORMAT_TEXT_COMMAND;

export default function TextStyleControls(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsHighlight(selection.hasFormat('highlight'));
    }
  }, []);

  useEffect(() => {
    // Adiciona o tipo EditorState ao parâmetro
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  return (
    <>
      <button
        onClick={() => editor.dispatchCommand(TypedFormatTextCommand, 'bold')}
        className={'toolbar-item ' + (isBold ? 'active' : '')}
        aria-label="Bold"
      >
        <i className="format" style={{ backgroundImage: `url(${BoldIcon})` }} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(TypedFormatTextCommand, 'italic')}
        className={'toolbar-item ' + (isItalic ? 'active' : '')}
        aria-label="Italic"
      >
        <i className="format" style={{ backgroundImage: `url(${ItalicIcon})` }} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(TypedFormatTextCommand, 'underline')}
        className={'toolbar-item ' + (isUnderline ? 'active' : '')}
        aria-label="Underline"
      >
        <i className="format" style={{ backgroundImage: `url(${UnderIcon})` }} />
B     </button>
      <button
        onClick={() => editor.dispatchCommand(TypedFormatTextCommand, 'highlight')}
        className={'toolbar-item ' + (isHighlight ? 'active' : '')}
        aria-label="Highlight"
      >
        <i className="format" style={{ backgroundImage: `url(${HighlightIcon})` }} />
      </button>
    </>
  );
}