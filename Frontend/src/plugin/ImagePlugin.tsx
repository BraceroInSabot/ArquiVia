import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createImageNode } from '../components/node/ImageNode';
import {
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    createCommand,
    $getSelection,
    $isRangeSelection,
    PASTE_COMMAND,
} from 'lexical';

export const INSERT_IMAGE_COMMAND = createCommand();

export default function ImagePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unregisterInsertCommand = editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const imageNode = $createImageNode(payload);
                    selection.insertNodes([imageNode]);
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );

        const unregisterPasteCommand = editor.registerCommand(
            PASTE_COMMAND,
            (event) => {
                const clipboardData = event.clipboardData;

                // --- CORREÇÃO AQUI ---
                // Adicionamos uma verificação para garantir que clipboardData e clipboardData.files existem.
                if (!clipboardData || !clipboardData.files || clipboardData.files.length === 0) {
                    return false; // Se não houver arquivos, não fazemos nada e deixamos o Lexical colar o texto.
                }

                const files = clipboardData.files;

                for (const file of files) {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const imageDataURL = reader.result;
                            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                src: imageDataURL,
                                altText: 'Imagem colada',
                            });
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                
                return false;
            },
            COMMAND_PRIORITY_HIGH,
        );

        return () => {
            unregisterInsertCommand();
            unregisterPasteCommand();
        };
    }, [editor]);

    return null;
}