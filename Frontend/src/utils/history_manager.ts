// Define a "forma" de uma entrada do histórico
export interface HistoryEntry {
  state: string; // O EditorState serializado como string JSON
  timestamp: Date; // A data de quando foi salvo
}

// Chave do localStorage
const LOCAL_STORAGE_KEY = 'lexicalEditorHistory';
// Limite da pilha
const MAX_HISTORY_ENTRIES = 12;

/**
 * Adiciona uma nova entrada de estado ao histórico no localStorage.
 * Gerencia a lógica da pilha FILO/LIFO.
 * @param newState A nova string JSON do EditorState a ser salva.
 */
export function addHistoryEntry(newState: string): void {
  if (!newState || newState.length < 10) return; // Ignora estados vazios

  const newEntry: HistoryEntry = {
    state: newState,
    timestamp: new Date(),
  };

  // 1. Pega o histórico atual
  const currentHistory = getHistoryEntries();

  // 2. Evita duplicatas (não salva se for idêntico ao último estado)
  if (currentHistory.length > 0 && currentHistory[0].state === newState) {
    console.log("HistoryManager: Estado idêntico, pulando salvamento.");
    return;
  }

  // 3. Adiciona o novo item no topo da pilha (FILO/LIFO)
  let newHistory = [newEntry, ...currentHistory];

  // 4. Garante o limite de 12 entradas
  if (newHistory.length > MAX_HISTORY_ENTRIES) {
    newHistory = newHistory.slice(0, MAX_HISTORY_ENTRIES); // Mantém os 12 mais recentes
  }

  // 5. Salva de volta no localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    console.log(`HistoryManager: Snapshot salvo. Total: ${newHistory.length}`);
  } catch (error) {
    console.error("HistoryManager: Falha ao salvar no localStorage.", error);
  }
}

/**
 * Busca todas as entradas do histórico salvas no localStorage.
 * @returns Um array de HistoryEntry, ordenado do mais novo para o mais antigo.
 */
export function getHistoryEntries(): HistoryEntry[] {
  try {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedHistory) {
      // É crucial converter as strings de data de volta para objetos Date
      return (JSON.parse(storedHistory) as any[]).map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    }
  } catch (error) {
    console.error("HistoryManager: Falha ao ler o localStorage.", error);
    return [];
  }
  return [];
}

/**
 * Busca a entrada mais recente do histórico.
 * @returns O HistoryEntry mais recente, ou null se não houver.
 */
export function getLatestHistoryEntry(): HistoryEntry | null {
  const entries = getHistoryEntries();
  return entries.length > 0 ? entries[0] : null;
}