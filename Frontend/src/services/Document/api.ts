import api from '../core-api';
import type { CreateDocument, Document, DocumentList, ResponseStructure} from '../core-api';

const documentService = {
    /**
     * Cria um objeto de documento.
     * @param sector_id - Define o setor (e empresa) que vai ser vinculado ao documento.
     */
  createDocument(data: CreateDocument): Promise<{ data: ResponseStructure<Document> }> {
    console.log(data);
    return api.post('/documento/criar/', data);
  },

  /**
   * Consulta o documento pelo id.
   */
  getDocumentById(document_id: number): Promise<{ data: ResponseStructure<Document> }> {
    return api.get(`/documento/consultar/${document_id}/`);
  },

  /**
   * Consulta os documentos vinculados ao usuário.
   */
  getDocuments(): Promise<{ data: ResponseStructure<DocumentList[]> }> {
    return api.get('/documento/visualizar/');
  },

  /** 
   * Edita o documento já criado.
   * @param document_id - ID do documento.
   * @param title - Titulo do documento.
   * @param content - Conteúdo do documento.
   */
  editDocument(document_id: number, title: string, content: string): Promise<{ data: ResponseStructure<Document> }> {
    return api.put(`/documento/editar/${document_id}/`, { title, content });
  },
};

export default documentService;