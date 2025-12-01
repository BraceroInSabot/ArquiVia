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
  format, // <--- Recebe 'left', 'center', 'right'
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

  // Atualiza tamanho
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

  // Lógica de seleção
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

  // Atualiza legenda
  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setCaptionText(newText);
    editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) node.setCaption(newText);
    });
  };

  // --- DEFINIÇÃO DO ALINHAMENTO ---
  let justifyContent = 'center'; // Padrão
  if (format === 'left' || format === 'start') justifyContent = 'flex-start';
  else if (format === 'right' || format === 'end') justifyContent = 'flex-end';
  
  // Exibe input se selecionado ou tiver texto
  const showCaption = isSelected || captionText.trim().length > 0;

  return (
    // Wrapper Principal com Flexbox para Alinhamento
    <div style={{ 
        display: 'flex', 
        width: '100%', 
        justifyContent: justifyContent, // Aplica o alinhamento horizontal
        margin: '12px 0' 
    }}>
      
      {/* Bloco da Imagem + Legenda */}
      <div className="relative inline-flex flex-col items-center group" style={{ maxWidth: '100%' }}>
        
        {/* Input de Legenda */}
        <div className={`w-full mb-1 transition-opacity duration-200 ${showCaption ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <input
              type="text"
              value={captionText}
              onChange={handleCaptionChange}
              placeholder="Legenda..."
              className="input input-ghost input-sm w-full text-center font-medium text-gray-600 focus:bg-base-200 focus:outline-none bg-transparent px-0 h-auto min-h-[24px]"
              onClick={(e) => e.stopPropagation()} 
          />
        </div>

        {/* Área da Imagem */}
        <div className="relative" style={{ lineHeight: 0 }}>
            <img
              className={`max-w-full h-auto object-contain block ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'cursor-pointer hover:opacity-95'}`}
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
            
            {/* Redimensionador */}
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