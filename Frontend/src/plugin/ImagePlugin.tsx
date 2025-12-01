import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createImageNode, type CreateImageNodePayload, $isImageNode } from '../components/node/ImageNode';
import {
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    createCommand,
    $getSelection,
    $isRangeSelection,
    PASTE_COMMAND,
    $createParagraphNode,
    $isNodeSelection,
    //@ts-ignore
    $getRoot,
    FORMAT_ELEMENT_COMMAND, // <-- Importe isso
    type ElementFormatType,     // <-- Importe isso
    //@ts-ignore
    $getNodeByKey
} from 'lexical';

export const INSERT_IMAGE_COMMAND = createCommand<CreateImageNodePayload>();

export default function ImagePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // --- COMANDO DE INSERÇÃO (MANTIDO IGUAL) ---
        const unregisterInsertCommand = editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) || $isNodeSelection(selection)) {
                        
                        // Lógica de contagem (mantida)
                        const allNodes = editor.getEditorState()._nodeMap;
                        let imageCount = 0;
                        //@ts-ignore
                        for (const [key, node] of allNodes) {
                            if ($isImageNode(node)) imageCount++;
                        }
                        
                        const nextIndex = imageCount + 1;
                        const defaultCaption = `Imagem ${nextIndex}`;

                        const imageNode = $createImageNode({
                            ...payload,
                            caption: payload.caption || defaultCaption,
                            format: 'center' // Define padrão ao criar
                        });
                        
                        selection.insertNodes([imageNode]);
                        const paragraphNode = $createParagraphNode();
                        imageNode.insertAfter(paragraphNode);
                        
                        setTimeout(() => {
                            editor.update(() => { paragraphNode.select(); });
                        }, 0);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );

        // --- NOVO: INTERCEPTA COMANDO DE FORMATAÇÃO (ALINHAMENTO) ---
        const unregisterFormatCommand = editor.registerCommand<ElementFormatType>(
            FORMAT_ELEMENT_COMMAND,
            (formatType) => {
                const selection = $getSelection();
                
                // Se a seleção for um Nó (imagem clicada), aplica o formato nela
                if ($isNodeSelection(selection)) {
                    const nodes = selection.getNodes();
                    const node = nodes[0];
                    if ($isImageNode(node)) {
                        editor.update(() => {
                            node.setFormat(formatType);
                        });
                        return true; // Impede que o comando propague e formate o parágrafo pai
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // --- COMANDO DE COLAR (MANTIDO IGUAL) ---
        const unregisterPasteCommand = editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const clipboardData = event.clipboardData;
                if (!clipboardData || !clipboardData.files || clipboardData.files.length === 0) return false;

                const files = Array.from(clipboardData.files);
                for (const file of files) {
                    if (file.type.startsWith('image/')) {
                        event.preventDefault();
                        const reader = new FileReader();
                        reader.onload = () => {
                            const imageDataURL = reader.result as string;
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
            unregisterFormatCommand(); // <-- Limpa o novo listener
            unregisterPasteCommand();
        };
    }, [editor]);

    return null;
}