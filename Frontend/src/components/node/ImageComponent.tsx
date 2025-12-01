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
  maxWidth, // Esse valor (ex: 1000) serve para limitar o resize, não o display CSS
  caption,
  format,
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

  let justifyContent = 'center'; 
  if (format === 'left' || format === 'start') justifyContent = 'flex-start';
  else if (format === 'right' || format === 'end') justifyContent = 'flex-end';
  
  const showCaption = isSelected || captionText.trim().length > 0;

  return (
    <div style={{ display: 'flex', justifyContent: justifyContent, width: '100%', height: '100%', margin: '5px 0' }}>
      
      {/* Container que envolve Imagem + Legenda */}
      {/* Adicionei 'max-w-full' aqui também para garantir que o wrapper não estoure */}
      <div className="relative inline-flex flex-col items-center group max-w-full max-h-full">
        
        <div className={`w-full transition-opacity duration-200 ${showCaption ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <input
              type="text"
              value={captionText}
              onChange={handleCaptionChange}
              placeholder="Legenda..."
              className="input input-ghost input-sm w-full text-center font-medium text-gray-600 focus:bg-base-200 focus:outline-none bg-transparent px-0 h-auto min-h-[24px]"
              onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="relative max-w-full max-h-full" style={{ lineHeight: 0 }}>
            <img
              // A classe 'max-w-full' do Tailwind já está aqui, mas o style inline sobrescrevia.
              className={`max-w-full h-auto object-contain block ${isSelected ? 'ring-2 ring-primary ring-offset-2 cursor-default' : 'cursor-pointer hover:opacity-95'}`}
              src={src}
              alt={altText}
              ref={imageRef}
              style={{
                width: width === 'inherit' ? 'auto' : width,
                height: 'auto',
                // --- CORREÇÃO AQUI ---
                // Removemos 'maxWidth: maxWidth' (que era 1000px fixo)
                // Definimos 'maxWidth: 100%' para respeitar o tamanho da tela/pai
                maxWidth: '100%', 
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