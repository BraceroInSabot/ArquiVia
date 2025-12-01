import React, { useRef } from 'react';
import type { LexicalEditor } from 'lexical';

const Direction = {
  east: 1 << 0,
  north: 1 << 3,
  south: 1 << 1,
  west: 1 << 2,
};

interface ImageResizerProps {
  editor: LexicalEditor;
  imageRef: React.RefObject<HTMLElement>;
  maxWidth?: number;
  onResizeStart: () => void;
  onResizeEnd: (width: 'inherit' | number, height: 'inherit' | number) => void;
}

export default function ImageResizer({
  editor,
  imageRef,
  maxWidth,
  onResizeEnd,
  onResizeStart,
}: ImageResizerProps): JSX.Element {
  const controlWrapperRef = useRef<HTMLDivElement>(null);
  const positioningRef = useRef<{
    currentHeight: number;
    currentWidth: number;
    direction: number;
    isResizing: boolean;
    ratio: number;
    startHeight: number;
    startWidth: number;
    startX: number;
    startY: number;
  }>({
    currentHeight: 0,
    currentWidth: 0,
    direction: 0,
    isResizing: false,
    ratio: 0,
    startHeight: 0,
    startWidth: 0,
    startX: 0,
    startY: 0,
  });

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, direction: number) => {
    if (!editor.isEditable()) return;

    event.preventDefault();
    event.stopPropagation(); 

    const image = imageRef.current;
    if (image) {
      const { width, height } = image.getBoundingClientRect();
      //@ts-ignore
      positioningRef.current = {
        startWidth: width,
        startHeight: height,
        startX: event.clientX,
        startY: event.clientY,
        ratio: width / height,
        direction: direction,
        isResizing: true,
      };

      onResizeStart();

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      
      document.body.style.cursor = 'nwse-resize';
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const image = imageRef.current;
    const positioning = positioningRef.current;

    if (image && positioning.isResizing) {
      const diffX = event.clientX - positioning.startX;
      
      if (positioning.direction & Direction.east) {
          positioning.currentWidth = positioning.startWidth + diffX;
      } else if (positioning.direction & Direction.west) {
          positioning.currentWidth = positioning.startWidth - diffX;
      }

      // Limite Mínimo
      if (positioning.currentWidth < 50) positioning.currentWidth = 50;

      // Limite Máximo Inteligente:
      // Usa o menor valor entre o maxWidth do nó (ex: 1000) e a largura do editor real
      let effectiveMaxWidth = maxWidth || 1000;
      const editorRoot = editor.getRootElement();
      if (editorRoot) {
          // Subtrai padding aproximado (ex: 64px de margem) para não estourar o papel
          const containerWidth = editorRoot.clientWidth - 64; 
          effectiveMaxWidth = Math.min(effectiveMaxWidth, containerWidth);
      }

      if (positioning.currentWidth > effectiveMaxWidth) {
          positioning.currentWidth = effectiveMaxWidth;
      }

      positioning.currentHeight = positioning.currentWidth / positioning.ratio;

      image.style.width = `${positioning.currentWidth}px`;
      image.style.height = `${positioning.currentHeight}px`;
    }
  };

  const handlePointerUp = () => {
    const image = imageRef.current;
    const positioning = positioningRef.current;

    if (image && positioning.isResizing) {
      const finalWidth = parseFloat(image.style.width);
      const finalHeight = parseFloat(image.style.height);
      
      onResizeEnd(finalWidth, finalHeight);
      
      positioning.isResizing = false;
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
    }
  };

  const handleClass = "absolute w-4 h-4 bg-[#008C99] bg-primary border-2 border-white shadow-md z-50 pointer-events-auto rounded-sm hover:scale-110 transition-transform";

  return (
    <div 
      ref={controlWrapperRef} 
      className="absolute inset-0 pointer-events-none border-2 border-[#008C99] border-primary"
    >
      <div
        className={`${handleClass} -top-2 -left-2 cursor-nwse-resize`}
        onPointerDown={(e) => handlePointerDown(e, Direction.north | Direction.west)}
      />
      <div
        className={`${handleClass} -top-2 -right-2 cursor-nesw-resize`}
        onPointerDown={(e) => handlePointerDown(e, Direction.north | Direction.east)}
      />
      <div
        className={`${handleClass} -bottom-2 -left-2 cursor-nesw-resize`}
        onPointerDown={(e) => handlePointerDown(e, Direction.south | Direction.west)}
      />
      <div
        className={`${handleClass} -bottom-2 -right-2 cursor-nwse-resize`}
        onPointerDown={(e) => handlePointerDown(e, Direction.south | Direction.east)}
      />
    </div>
  );
}