import React, { useRef, useState, useCallback, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getNodeByKey, 
  type LexicalEditor, 
  type NodeKey } from 'lexical';
import { $isImageNode } from './ImageNode';

interface ImageResizerProps {
  imageRef: React.RefObject<HTMLImageElement>;
  editor: LexicalEditor;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

function ImageResizer({ 
  imageRef,
  //@ts-ignore 
  editor, 
  onResizeStart, 
  onResizeEnd 
}: ImageResizerProps): JSX.Element {
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(
    (event: MouseEvent) => {
      const button = buttonRef.current;
      const image = imageRef.current;
      if (button && image) {
        const { width, height } = image.getBoundingClientRect();
        const { clientX, clientY } = event;
        const buttonRect = button.getBoundingClientRect();
        const newWidth = width + (clientX - buttonRect.right);
        const newHeight = height + (clientY - buttonRect.bottom);
        image.style.width = `${newWidth}px`;
        image.style.height = `${newHeight}px`;
      }
    },
    [imageRef],
  );

  const handleMouseUp = useCallback(() => {
    onResizeEnd();
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleResize, onResizeEnd]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      onResizeStart();
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleResize, handleMouseUp, onResizeStart],
  );

  return <div className="image-resizer" ref={buttonRef} onMouseDown={handleMouseDown} />;
}

interface ImageComponentProps {
  src: string;
  altText: string;
  width: string | number;
  height: string | number;
  nodeKey: NodeKey;
}

export default function ImageComponent({ 
  src, 
  altText, 
  width, 
  height, 
  nodeKey 
}: ImageComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef<HTMLImageElement>(null);
  const [isSelected, setIsSelected] = useState(false);

  const onResizeEnd = () => {
    const image = imageRef.current;
    if (image) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setWidthAndHeight(image.style.width, image.style.height);
        }
      });
    }
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsSelected(!isSelected);
  };

  return (
    <div className="editor-image-container" draggable="false" onClick={onClick}>
      <img
        src={src}
        alt={altText}
        ref={imageRef}
        style={{ width, height, maxWidth: '100%' }}
        draggable="false"
      />
      {isSelected && (
        <ImageResizer
          imageRef={imageRef}
          editor={editor}
          onResizeStart={() => setIsSelected(true)}
          onResizeEnd={onResizeEnd}
        />
      )}
    </div>
  );
}