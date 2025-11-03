import { useState, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import jsPDF from 'jspdf'; // A biblioteca jspdf
import { type EditorState } from 'lexical';

import PDFIcon from '../assets/icons/pdf-export.svg';
import HistoryIcon from '../assets/icons/history.svg';

// --- MUDANÇA: Define a "forma" de um item do histórico ---
interface HistoryEntry {
  state: string; // O EditorState serializado como string JSON
  timestamp: Date; // O objeto Date de quando foi salvo
}

// --- MUDANÇA: Define as props do componente ---
interface ActionsPluginProps {
  history: HistoryEntry[];
}

// --- MUDANÇA: Aplica os tipos nas props e no retorno da função ---
export default function ActionsPlugin({ history }: ActionsPluginProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const handleExportToPdf = (): void => {
                editor.getEditorState().read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          
          const pdf = new jsPDF('p', 'mm', 'a4');
    
          pdf.html(htmlString, {
            // --- MUDANÇA: Tipamos o 'doc' do callback ---
            callback: function (doc: jsPDF) {
              doc.save('documento.pdf');
            },
            margin: [15, 15, 15, 15],
            autoPaging: 'text',
            width: 180,
            windowWidth: 700,
          });
        });

    };

    const handleHistoryClick = (): void => {
        setIsHistoryVisible(!isHistoryVisible);
    };

    // --- MUDANÇA: Tipamos o parâmetro 'stateToRestore' ---
    const handleRestore = (stateToRestore: string): void => {
        // Converte a string JSON de volta para um EditorState
        const editorState: EditorState = editor.parseEditorState(stateToRestore);
        // Aplica o estado restaurado ao editor
        editor.setEditorState(editorState);
        // Fecha o painel de histórico
        setIsHistoryVisible(false);
    };

    return (
        <div>
            <div className="actions-container">
                <button
                    onClick={handleHistoryClick}
                    className="toolbar-item history-btn"
                    aria-label="Toggle History"
                >
                    <img 
                        src={HistoryIcon} 
                        alt="Bold" 
                        className="format" 
                        width="18" 
                        height="18" 
                        />
                </button>
                <button
                    onClick={handleExportToPdf}
                    className="toolbar-item export-btn"
                    aria-label="Export to PDF"
                >
                    <img 
                        src={PDFIcon} 
                        alt="Bold" 
                        className="format" 
                        width="18" 
                        height="18" 
                        />
                </button>
            </div>
            
            {/* O map agora sabe que 'entry' é do tipo 'HistoryEntry' */}
            {isHistoryVisible && (
                <div className="history-panel">
                    {history.length > 0 ? (
                        <ul className="history-list">
                            {history.map((entry: HistoryEntry, index: number) => (
                                <li key={index} className="history-item">
                                    <button onClick={() => handleRestore(entry.state)}>
                                        Restaurar para {entry.timestamp.toLocaleTimeString()}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nenhum ponto de histórico salvo ainda. Continue digitando.</p>
                     )}
                </div>
            )}
        </div>
    );
}