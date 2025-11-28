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

import { 
  Bold, Italic, Underline, Highlighter, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Video, List, ListOrdered, 
  ChevronUp, Maximize2
} from 'lucide-react';

import VideoUploadModal from './VideoUploadModal';
import type { CreateVideoNodePayload } from '../components/node/VideoNode';

// --- Componentes Auxiliares ---
const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
  ['Inter', 'Inter'],
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
  
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('15px');
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
      setFontFamily($getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'));
      setFontSize($getSelectionStyleValueForProperty(selection, 'font-size', '15px'));
      setFontColor($getSelectionStyleValueForProperty(selection, 'color', '#000000'));
      
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      
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
  
  const applyStyleText = useCallback((styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  }, [editor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value);
  
  const handleInputBlur = () => {
    const newSize = inputValue ? `${inputValue}px` : '';
    applyStyleText({ 'font-size': newSize });
  };
  
  const onFontFamilySelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    applyStyleText({ 'font-family': e.target.value });
  }, [applyStyleText]);

  const onFontColorSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      setFontColor(newColor);
      applyStyleText({ color: newColor });
  }, [applyStyleText]);

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
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  const handleImageButtonClick = () => imageFileInputRef.current?.click();

  const formatUnorderedList = () => {
    if (isUnorderedList) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    else editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatOrderedList = () => {
    if (isOrderedList) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    else editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const onInsertVideo = () => setIsVideoModalOpen(true);

  const getBtnClass = (isActive: boolean) => 
    `btn btn-sm join-item border-base-300 ${isActive ? 'btn-active bg-primary/10 text-primary border-primary' : 'btn-ghost text-gray-600'}`;

  // --- RENDERIZAÇÃO ---

  if (isMinimized) {
    // Botão Flutuante Minimizado (Canto Superior Direito)
    return (
      <div className="sticky mt-3 mr-3 z-50">
        <div className="tooltip tooltip-right" data-tip="Expandir Ferramentas">
          <button
            onClick={() => setIsMinimized(false)}
            className="btn btn-circle btn-primary shadow-lg text-white hover:scale-110 transition-transform"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar Container (Sticky no topo do papel) */}
      <div className="sticky flex w-full justify-center items-center top-0 z-30 bg-white/95 backdrop-blur transition-all duration-300 animate-fade-in-down">
        
        <input type="file" ref={imageFileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

        <div className="flex items-center justify-between bg-base-100 border border-base-200 rounded-lg shadow-sm">

          {/* ÁREA CENTRAL: Ferramentas (Scroll horizontal em telas pequenas) */}
          <div className="">
            
            {/* TIPOGRAFIA */}
            <div className="flex items-center gap-2 bg-base-200/50 p-1 rounded-lg border border-base-200">
                <Select
                    className="select select-ghost select-sm w-28 focus:outline-none text-sm font-medium"
                    onChange={onFontFamilySelect}
                    options={FONT_FAMILY_OPTIONS}
                    value={fontFamily}
                />
                <div className="h-4 w-px bg-base-300 mx-1"></div>
                <input
                    type="number"
                    className="input input-ghost input-sm w-16 text-center focus:outline-none font-mono"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    title="Tamanho da fonte"
                />
                <div className="h-4 w-px bg-base-300 mx-1"></div>
                <div className="tooltip tooltip-bottom" data-tip="Cor do texto">
                    <label className="btn btn-xs btn-circle btn-ghost border border-base-300 overflow-hidden relative cursor-pointer shadow-sm">
                        <input type="color" value={fontColor} onChange={onFontColorSelect} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: fontColor }}></div>
                    </label>
                </div>
            </div>

            {/* FORMATAÇÃO */}
            <div className="join border border-base-200 rounded-lg shadow-sm bg-white">
                <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={getBtnClass(isBold)} title="Negrito"><Bold size={18} /></button>
                <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={getBtnClass(isItalic)} title="Itálico"><Italic size={18} /></button>
                <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={getBtnClass(isUnderline)} title="Sublinhado"><Underline size={18} /></button>
                <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')} className={getBtnClass(isHighlight)} title="Marca-texto"><Highlighter size={18} /></button>
            </div>

            {/* ALINHAMENTO */}
            <div className="join border border-base-200 rounded-lg shadow-sm bg-white xl:inline-flex">
                <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} className={getBtnClass(textAlign === 'left')}><AlignLeft size={18} /></button>
                <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} className={getBtnClass(textAlign === 'center')}><AlignCenter size={18} /></button>
                <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} className={getBtnClass(textAlign === 'right')}><AlignRight size={18} /></button>
                <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} className={getBtnClass(textAlign === 'justify')}><AlignJustify size={18} /></button>
            </div>

            {/* LISTAS */}
            <div className="join border border-base-200 rounded-lg shadow-sm bg-white">
                <button onClick={formatUnorderedList} className={getBtnClass(isUnorderedList)}><List size={18} /></button>
                <button onClick={formatOrderedList} className={getBtnClass(isOrderedList)}><ListOrdered size={18} /></button>
            </div>

            {/* MÍDIA */}
            <div className="join border border-base-200 rounded-lg shadow-sm bg-white">
                <button onClick={handleImageButtonClick} className="btn btn-sm btn-ghost join-item text-gray-600 hover:text-primary"><ImageIcon size={18} /></button>
                <button onClick={onInsertVideo} className="btn btn-sm btn-ghost join-item text-gray-600 hover:text-primary"><Video size={18} /></button>
            </div>

          </div>

          {/* BOTÃO MINIMIZAR (Direita) */}
          <div className="tooltip tooltip-left ml-2" data-tip="Minimizar">
            <button 
                onClick={() => setIsMinimized(true)}
                className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-secondary hover:bg-base-200"
            >
                <ChevronUp size={20} />
            </button>
          </div>

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