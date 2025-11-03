import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand
} from 'lexical';
// Importa tanto a função quanto o tipo do payload que criamos no outro arquivo
import { $createVideoNode } from '../components/node/VideoNode';
import type { CreateVideoNodePayload } from '../components/node/VideoNode';

// Define explicitamente o tipo do payload que este comando espera
export const INSERT_VIDEO_COMMAND: LexicalCommand<CreateVideoNodePayload> = createCommand();

export default function VideoPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const unregisterCommand = editor.registerCommand(
          INSERT_VIDEO_COMMAND,
            // Adiciona o tipo ao payload
            (payload: CreateVideoNodePayload) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const videoNode = $createVideoNode(payload);
                    selection.insertNodes([videoNode]);
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
        
        return unregisterCommand;

    }, [editor]);

    return null;
}