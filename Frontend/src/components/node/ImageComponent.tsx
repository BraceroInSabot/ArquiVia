import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $getNodeByKey, type NodeKey, type ElementFormatType } from 'lexical';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import ImageResizer from './ImageResizer';
import { $isImageNode } from './ImageNode';

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  caption,
  format, // <-- Recebe o formato
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  width: number | 'inherit';
  height: number | 'inherit';
  maxWidth: number;
  caption: string;
  format?: ElementFormatType;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [captionText, setCaptionText] = useState(caption);

  useEffect(() => {
    setCaptionText(caption);
  }, [caption]);

  const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
    setTimeout(() => { setIsResizing(false); }, 200);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => { setIsResizing(true); };

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); 
      if (isResizing) return;
      
      if (e.shiftKey) {
        setSelected(!isSelected);
      } else {
        clearSelection();
        setSelected(true);
      }
      return true;
    },
    [isResizing, isSelected, setSelected, clearSelection],
  );

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setCaptionText(newText);
    editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) node.setCaption(newText);
    });
  };

  const showCaption = isSelected || captionText.trim().length > 0;

  // --- LÓGICA DE ALINHAMENTO ---
  // Mapeia o 'format' do Lexical para classes Flexbox do Tailwind
  let alignmentClass = 'justify-center'; // Padrão
  if (format === 'left' || format === 'start') alignmentClass = 'justify-start';
  if (format === 'right' || format === 'end') alignmentClass = 'justify-end';
  // 'justify' para imagem geralmente é tratado como centro ou esquerda, mantemos centro ou start

  return (
    // O Container precisa ser flex e ocupar largura total para permitir o alinhamento
    <div className={`flex w-full my-4 ${alignmentClass}`}>
      
      <div className="relative inline-block select-none group flex flex-col items-center">
        
        {/* LEGENDA */}
        <div className="w-full mb-1 flex justify-center">
          <input
              type="text"
              value={captionText}
              onChange={handleCaptionChange}
              placeholder="Adicionar legenda..."
              className={`
                  input input-ghost input-sm w-full text-center font-medium text-gray-600
                  focus:bg-base-200 focus:outline-none transition-opacity duration-200
                  ${showCaption ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}
              onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* IMAGEM */}
        <div className="relative" style={{ lineHeight: 0 }}>
            <img
              className={`max-w-full h-auto object-contain block ${isSelected ? 'ring-2 ring-primary ring-offset-2 cursor-default' : 'cursor-pointer hover:opacity-90'}`}
              src={src}
              alt={altText}
              ref={imageRef}
              style={{
                width: width === 'inherit' ? 'auto' : width,
                height: height === 'inherit' ? 'auto' : height,
                maxWidth: maxWidth,
                display: 'block',
              }}
              onClick={onClick}
              draggable="false"
            />
            
            {isSelected && (
              <ImageResizer
                editor={editor}
                imageRef={imageRef}
                maxWidth={maxWidth}
                onResizeStart={onResizeStart}
                onResizeEnd={onResizeEnd}
              />
            )}
        </div>
      </div>
    </div>
  );
}