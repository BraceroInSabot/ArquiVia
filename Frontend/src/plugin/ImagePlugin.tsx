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
    FORMAT_ELEMENT_COMMAND, // Importe
    type ElementFormatType // Importe
} from 'lexical';

export const INSERT_IMAGE_COMMAND = createCommand<CreateImageNodePayload>();

export default function ImagePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // --- COMANDO DE INSERÇÃO (Criação) ---
        const unregisterInsertCommand = editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) || $isNodeSelection(selection)) {
                        
                        // Contagem de imagens
                        let imageCount = 0;
                        const nodes = editor.getEditorState()._nodeMap;
                        //@ts-ignore
                        for (const [key, node] of nodes) {
                            if ($isImageNode(node)) imageCount++;
                        }
                        
                        // Cria o nó JÁ com formato 'center'
                        const imageNode = $createImageNode({
                            ...payload,
                            caption: payload.caption || `Imagem ${imageCount + 1}`,
                            format: 'center' 
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

        // --- COMANDO DE ALINHAMENTO (Formatação) ---
        // Isso captura o clique nos botões Esquerda/Centro/Direita da toolbar
        const unregisterFormatCommand = editor.registerCommand<ElementFormatType>(
            FORMAT_ELEMENT_COMMAND,
            (formatType) => {
                const selection = $getSelection();
                
                // Verifica se o que está selecionado é a Imagem (NodeSelection)
                if ($isNodeSelection(selection)) {
                    const nodes = selection.getNodes();
                    const node = nodes[0];
                    if ($isImageNode(node)) {
                        editor.update(() => {
                            // Atualiza a propriedade 'format' do nó
                            node.setFormat(formatType);
                        });
                        return true; // Impede que o comando formate o texto em volta
                    }
                }
                return false;
            },
            COMMAND_PRIORITY_EDITOR
        );

        // --- COMANDO DE COLAR (Paste) ---
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
                            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                src: reader.result as string,
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
            unregisterFormatCommand();
            unregisterPasteCommand();
        };
    }, [editor]);

    return null;
}