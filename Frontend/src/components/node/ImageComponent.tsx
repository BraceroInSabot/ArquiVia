import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $getNodeByKey, type NodeKey, type ElementFormatType } from 'lexical';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { X, ZoomIn } from 'lucide-react'; 
import ImageResizer from './ImageResizer';
import { $isImageNode } from './ImageNode';

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  //@ts-ignore
  height,
  maxWidth,
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

  // Ref para detectar duplo clique manualmente (funciona em mobile e desktop)
  const lastClickTimeRef = useRef<number>(0);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCaptionText(caption);
  }, [caption]);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    if (isFullscreen) {
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
    };
  }, [isFullscreen]);

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

  // --- LÓGICA HÍBRIDA (CLIQUE + DUPLO CLIQUE) ---
  const handleInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Impede propagação para o editor não roubar foco
      e.stopPropagation(); 
      
      if (isResizing) return;

      const now = Date.now();
      const timeDiff = now - lastClickTimeRef.current;
      
      // Se o segundo clique ocorreu em menos de 300ms, é um Double Click
      if (timeDiff < 300 && timeDiff > 0) {
          e.preventDefault(); // Evita zoom nativo do mobile
          setIsFullscreen(true);
          lastClickTimeRef.current = 0; // Reseta
      } else {
          // É um clique simples (Seleção)
          lastClickTimeRef.current = now;
          
          // Lógica original de seleção
          if ('shiftKey' in e && e.shiftKey) { // shiftKey só existe em MouseEvent
            setSelected(!isSelected);
          } else {
            clearSelection();
            setSelected(true);
          }
      }
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
    <>
      <div style={{ display: 'flex', justifyContent: justifyContent, width: '100%', height: '100%', margin: '5px 0' }}>
        
        <div className="relative inline-flex flex-col items-center group max-w-full max-h-full">
          
          {/* Legenda */}
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

          {/* Área da Imagem no Editor */}
          <div className="relative max-w-full max-h-full" style={{ lineHeight: 0 }}>
              <img
                className={`max-w-full h-auto object-contain block transition-all duration-200 
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2 cursor-default' : 'cursor-pointer hover:opacity-95'}`}
                src={src}
                alt={altText}
                ref={imageRef}
                style={{
                  width: width === 'inherit' ? 'auto' : width,
                  height: 'auto',
                  maxWidth: '100%', 
                  display: 'block',
                  touchAction: 'manipulation' // Ajuda browsers mobile a não dar zoom no duplo toque
                }}
                // Usamos onClick para Desktop e onTouchEnd para Mobile (híbrido)
                // O handleInteraction lida com o tempo para detectar duplo toque
                onClick={handleInteraction} 
                draggable="false"
                title="Duplo clique para expandir"
              />
              
              {/* Dica Visual de Zoom */}
              {!isResizing && !isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                        <ZoomIn size={20} />
                    </div>
                </div>
              )}
              
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

      {/* Portal de Fullscreen (Lightbox) */}
      {isFullscreen && createPortal(
        <div 
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 animate-fade-in touch-none"
            onClick={() => setIsFullscreen(false)}
        >
            <button 
                className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full z-50"
                onClick={() => setIsFullscreen(false)}
            >
                <X size={32} />
            </button>

            <img 
                src={src} 
                alt={altText} 
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()} 
            />

            {captionText && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-6 py-3 rounded-full text-center max-w-[90vw]">
                    {captionText}
                </div>
            )}
        </div>,
        document.body
      )}
    </>
  );
}