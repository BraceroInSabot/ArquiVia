import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  type LexicalCommand,
} from 'lexical';
import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $findMatchingParent } from '@lexical/utils';
import { INSERT_VIDEO_COMMAND } from './VideoPlugin';

// --- CORREÇÃO: Adicionado '?url' a todas as importações de ícones ---
import BoldIcon from '../assets/icons/bold.svg?url';
import ItalicIcon from '../assets/icons/italic.svg?url';
import UnderIcon from '../assets/icons/underline.svg?url';
import AlignL from '../assets/icons/align-left.svg?url';
import AlignC from '../assets/icons/align-center.svg?url';
import AlignR from '../assets/icons/align-right.svg?url';
import AlignJ from '../assets/icons/align-justify.svg?url';
import HighlightIcon from '../assets/icons/highlight.svg?url';
import ImageIcon from '../assets/icons/image.svg?url';
import UnorderedListIcon from '../assets/icons/ul.svg?url';
import OrderedListIcon from '../assets/icons/ol.svg?url';
import VideoIcon from '../assets/icons/video.svg?url';

import VideoUploadModal from './VideoUploadModal';
import type { CreateVideoNodePayload } from '../components/node/VideoNode';

import '../assets/css/ToolBarPlugin.css'

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

interface SelectProps {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  className: string;
  options: [string, string][];
  value: string;
}

function Select({ onChange, className, options, value }: SelectProps) {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden={true} value="" />
      {options.map((option) => (
        <option key={option[0]} value={option[0]}>
          {option[1]}
        </option>
      ))}
    </select>
  );
}

const TypedInsertVideoCommand: LexicalCommand<CreateVideoNodePayload> = INSERT_VIDEO_COMMAND;

export default function FormattingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('12px');
  const [inputValue, setInputValue] = useState('');
  const [fontColor, setFontColor] = useState('#000000');
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const imageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const size = parseInt(fontSize, 10);
    setInputValue(isNaN(size) ? '' : size.toString());
  }, [fontSize]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsHighlight(selection.hasFormat('highlight'));
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      );
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000000')
      );
      
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      
      const listNode = $findMatchingParent(anchorNode, $isListNode) as ListNode | null;
      setIsUnorderedList(listNode ? listNode.getListType() === 'bullet' : false);
      setIsOrderedList(listNode ? listNode.getListType() === 'number' : false);

      if (element) {
        const elementKey = element.getKey();
        const elementDOM = editor.getElementByKey(elementKey);
        if (elementDOM !== null) {
          setTextAlign(elementDOM.style.textAlign || 'left');
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);
  
  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    const newSize = inputValue ? `${inputValue}px` : '';
    applyStyleText({ 'font-size': newSize });
  };
  
  const onFontFamilySelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      applyStyleText({ 'font-family': e.target.value });
    },
    [applyStyleText],
  );

  const onFontColorSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setFontColor(newColor);
        applyStyleText({ color: newColor });
    },
    [applyStyleText],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataURL = reader.result as string;
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: imageDataURL,
          altText: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
    }
  };

  const handleImageButtonClick = () => {
    if (imageFileInputRef.current) {
      imageFileInputRef.current.click();
    }
  };

  const formatUnorderedList = () => {
    if (isUnorderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatOrderedList = () => {
    if (isOrderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };
  

  const onInsertVideo = () => {
    setIsVideoModalOpen(true);
  };

  // --- CORREÇÃO: Envolve o retorno em um Fragmento <>...</> ---
  return (
    <>
      <div className="toolbar">
        <input
          type="file"
          ref={imageFileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileSelect}
        />
        
        
        <Select
          className="toolbar-item font-family"
          onChange={onFontFamilySelect}
          options={FONT_FAMILY_OPTIONS}
          value={fontFamily}
        />
        <input
          type="number"
          className="toolbar-item font-size"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
        <div className="divider" />
        <input
          type="color"
          className="toolbar-item color-picker"
          value={fontColor}
          onChange={onFontColorSelect}
        />
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          className={'toolbar-item ' + (isBold ? 'active' : '')}
          aria-label="Bold"
        >
          <img 
            src={BoldIcon} 
            alt="Bold" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          className={'toolbar-item ' + (isItalic ? 'active' : '')}
          aria-label="Italic"
        >
          <img 
            src={ItalicIcon} 
            alt="Italic" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          className={'toolbar-item ' + (isUnderline ? 'active' : '')}
          aria-label="Underline"
        >
          <img 
            src={UnderIcon} 
            alt="Underline" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
          className={'toolbar-item ' + (isHighlight ? 'active' : '')}
          aria-label="Highlight"
        >
          <img 
            src={HighlightIcon} 
            alt="Highlight" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={handleImageButtonClick}
          className="toolbar-item"
          aria-label="Insert Image"
        >
          <img 
            src={ImageIcon} 
            alt="Insert Image" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={onInsertVideo}
          className="toolbar-item"
          aria-label="Insert Video"
        >
          <img 
            src={VideoIcon} 
            alt="Insert Video" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>

        {/* --- CORREÇÃO: Modal movido para fora do div.toolbar --- */}
        <div className="divider" />
        <button
          onClick={formatUnorderedList}
          className={'toolbar-item ' + (isUnorderedList ? 'active' : '')}
          aria-label="Unordered List"
        >
          <img 
            src={UnorderedListIcon} 
            alt="Unordered List" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={formatOrderedList}
          className={'toolbar-item ' + (isOrderedList ? 'active' : '')}
          aria-label="Ordered List"
        >
          <img 
            src={OrderedListIcon} 
            alt="Ordered List" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <div className="divider" />
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
          className={'toolbar-item ' + (textAlign === 'left' ? 'active' : '')}
          aria-label="Left Align"
        >
          <img 
            src={AlignL} 
            alt="Left Align" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
          className={'toolbar-item ' + (textAlign === 'center' ? 'active' : '')}
          aria-label="Center Align"
        >
          <img 
            src={AlignC} 
            alt="Center Align" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
          className={'toolbar-item ' + (textAlign === 'right' ? 'active' : '')}
          aria-label="Right Align"
        >
          <img 
            src={AlignR} 
            alt="Right Align" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
          className={'toolbar-item ' + (textAlign === 'justify' ? 'active' : '')}
          aria-label="Justify Align"
        >
          <img 
            src={AlignJ} 
            alt="Justify Align" 
            className="format" 
            width="18" 
            height="18" 
          />
        </button>
      </div>
      
      {/* Modal de Vídeo (agora do lado de fora) */}
      {isVideoModalOpen && (
        <VideoUploadModal
          onClose={() => setIsVideoModalOpen(false)}
          onSubmit={(payload) => {
            editor.dispatchCommand(TypedInsertVideoCommand, payload);
            setIsVideoModalOpen(false);
          }}
        />
      )}
    </>
  );
}