import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { useRef, type JSX } from 'react';
import type { LexicalCommand } from 'lexical';
import { INSERT_IMAGE_COMMAND } from '../../plugin/ImagePlugin';
import type { CreateImageNodePayload } from './ImageNode'; // Importa o tipo do payload
import ImageIcon from '../icons/image.svg';

// Tipamos o comando importado para que o dispatch saiba qual payload esperar
const TypedInsertImageCommand: LexicalCommand<CreateImageNodePayload> = INSERT_IMAGE_COMMAND;

export default function InsertControls(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataURL = reader.result as string; // Faz o cast do resultado
        editor.dispatchCommand(TypedInsertImageCommand, {
          src: imageDataURL,
          altText: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleImageButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
      />
      <button
        onClick={handleImageButtonClick}
  	  className="toolbar-item"
        aria-label="Insert Image"
      >
        <i className="format" style={{ backgroundImage: `url(${ImageIcon})` }} />
      </button>
    </>
  );
}