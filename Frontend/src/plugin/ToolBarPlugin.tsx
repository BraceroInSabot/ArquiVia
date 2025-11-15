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

// --- NOVOS ÍCONES (Lucide) ---
import { 
  Bold, Italic, Underline, Highlighter, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Video, List, ListOrdered
} from 'lucide-react';

import VideoUploadModal from './VideoUploadModal';
import type { CreateVideoNodePayload } from '../components/node/VideoNode';

import '../assets/css/ToolBarPlugin.css';

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

  return (
    <>
      <div className="toolbar">
        {/* Input de arquivo oculto */}
        <input
          type="file"
          ref={imageFileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileSelect}
        />
        
        {/* Seletores de Fonte e Cor */}
        <div className='d-flex'>
          <Select
            className="form-select form-select-sm toolbar-font-family"
            onChange={onFontFamilySelect}
            options={FONT_FAMILY_OPTIONS}
            value={fontFamily}
          />
          
          <input
            type="number"
            className="form-control form-control-sm toolbar-font-size"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            title="Tamanho da fonte"
          />
        </div>

        <input
          type="color"
          className="form-control form-control-color form-control-color-sm"
          value={fontColor}
          onChange={onFontColorSelect}
          title="Cor do texto"
        />

        <div className="toolbar-divider" />

        {/* Formatação de Texto */}
        <div className="btn-group" role="group">
          <button
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            className={`btn btn-sm toolbar-btn ${isBold ? 'btn-secondary' : 'btn-light'}`}
            title="Negrito"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            className={`btn btn-sm toolbar-btn ${isItalic ? 'btn-secondary' : 'btn-light'}`}
            title="Itálico"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
            className={`btn btn-sm toolbar-btn ${isUnderline ? 'btn-secondary' : 'btn-light'}`}
            title="Sublinhado"
          >
            <Underline size={18} />
          </button>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
            className={`btn btn-sm toolbar-btn ${isHighlight ? 'btn-secondary' : 'btn-light'}`}
            title="Marca-texto"
          >
            <Highlighter size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Mídia */}
        <div className="btn-group" role="group">
          <button
            onClick={handleImageButtonClick}
            className="btn btn-sm btn-light toolbar-btn"
            title="Inserir Imagem"
          >
            <ImageIcon size={18} />
          </button>
          <button
            onClick={onInsertVideo}
            className="btn btn-sm btn-light toolbar-btn"
            title="Inserir Vídeo"
          >
            <Video size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Listas */}
        <div className="btn-group" role="group">
          <button
            onClick={formatUnorderedList}
            className={`btn btn-sm toolbar-btn ${isUnorderedList ? 'btn-secondary' : 'btn-light'}`}
            title="Lista com marcadores"
          >
            <List size={18} />
          </button>
          <button
            onClick={formatOrderedList}
            className={`btn btn-sm toolbar-btn ${isOrderedList ? 'btn-secondary' : 'btn-light'}`}
            title="Lista numerada"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Alinhamento */}
        <div className="btn-group" role="group">
          <button
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
            className={`btn btn-sm toolbar-btn ${textAlign === 'left' ? 'btn-secondary' : 'btn-light'}`}
            title="Alinhar à esquerda"
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
            className={`btn btn-sm toolbar-btn ${textAlign === 'center' ? 'btn-secondary' : 'btn-light'}`}
            title="Centralizar"
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
            className={`btn btn-sm toolbar-btn ${textAlign === 'right' ? 'btn-secondary' : 'btn-light'}`}
            title="Alinhar à direita"
          >
            <AlignRight size={18} />
          </button>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
            className={`btn btn-sm toolbar-btn ${textAlign === 'justify' ? 'btn-secondary' : 'btn-light'}`}
            title="Justificar"
          >
            <AlignJustify size={18} />
          </button>
        </div>
      </div>
      
      {/* Modal de Vídeo */}
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