import { useCallback, useEffect, useState, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  type LexicalCommand,
  type ElementFormatType,
  type EditorState,
} from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $findMatchingParent } from '@lexical/utils';

import AlignL from '../icons/align-left.svg';
import AlignC from '../icons/align-center.svg';
import AlignR from '../icons/align-right.svg';
import AlignJ from '../icons/align-justify.svg';
import UnorderedListIcon from '../icons/ul.svg';
import OrderedListIcon from '../icons/ol.svg';

// Tipamos os comandos para garantir o payload correto
const TypedFormatElementCommand: LexicalCommand<ElementFormatType> = FORMAT_ELEMENT_COMMAND;
const TypedRemoveListCommand: LexicalCommand<void> = REMOVE_LIST_COMMAND;
const TypedInsertUnorderedListCommand: LexicalCommand<void> = INSERT_UNORDERED_LIST_COMMAND;
const TypedInsertOrderedListCommand: LexicalCommand<void> = INSERT_ORDERED_LIST_COMMAND;


export default function BlockFormatControls(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  // Podemos ser mais específicos sobre o tipo do 'textAlign'
  const [textAlign, setTextAlign] = useState<ElementFormatType>('left');
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      
      // Tipamos o retorno do $findMatchingParent
      const listNode = $findMatchingParent(anchorNode, $isListNode) as ListNode | null;
      setIsUnorderedList(listNode ? listNode.getListType() === 'bullet' : false);
      setIsOrderedList(listNode ? listNode.getListType() === 'number' : false);

      if (element) {
        const elementKey = element.getKey();
        const elementDOM = editor.getElementByKey(elementKey);
        if (elementDOM !== null) {
          // Fazemos um cast para ElementFormatType
          setTextAlign((elementDOM.style.textAlign as ElementFormatType) || 'left');
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    // Adiciona o tipo EditorState ao parâmetro
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatUnorderedList = (): void => {
    if (isUnorderedList) {
      editor.dispatchCommand(TypedRemoveListCommand, undefined);
    } else {
      editor.dispatchCommand(TypedInsertUnorderedListCommand, undefined);
    }
  };

  const formatOrderedList = (): void => {
    if (isOrderedList) {
      editor.dispatchCommand(TypedRemoveListCommand, undefined);
    } else {
      editor.dispatchCommand(TypedInsertOrderedListCommand, undefined);
    }
  };

  return (
    <>
      <button
        onClick={formatUnorderedList}
        className={'toolbar-item ' + (isUnorderedList ? 'active' : '')}
        aria-label="Unordered List"
      >
        <i className="format" style={{ backgroundImage: `url(${UnorderedListIcon})` }} />
      </button>
      <button
        onClick={formatOrderedList}
        className={'toolbar-item ' + (isOrderedList ? 'active' : '')}
        aria-label="Ordered List"
      >
        <i className="format" style={{ backgroundImage: `url(${OrderedListIcon})` }} />
      </button>
      <div className="divider" />
       <button
        onClick={() => editor.dispatchCommand(TypedFormatElementCommand, 'left')}
        className={'toolbar-item ' + (textAlign === 'left' ? 'active' : '')}
        aria-label="Left Align"
      >
        <i className="format" style={{ backgroundImage: `url(${AlignL})` }} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(TypedFormatElementCommand, 'center')}
        className={'toolbar-item ' + (textAlign === 'center' ? 'active' : '')}
        aria-label="Center Align"
      >
        <i className="format" style={{ backgroundImage: `url(${AlignC})` }} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(TypedFormatElementCommand, 'right')}
        className={'toolbar-item ' + (textAlign === 'right' ? 'active' : '')}
         aria-label="Right Align"
      >
        <i className="format" style={{ backgroundImage: `url(${AlignR})` }} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(TypedFormatElementCommand, 'justify')}
        className={'toolbar-item ' + (textAlign === 'justify' ? 'active' : '')}
        aria-label="Justify Align"
      >
        <i className="format" style={{ backgroundImage: `url(${AlignJ})` }} />
      </button>
    </>
  );
}