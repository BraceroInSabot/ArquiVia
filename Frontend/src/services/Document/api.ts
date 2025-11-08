import api from '../core-api';
import type { Classification, CreateDocument, Document, DocumentList, ResponseStructure, UpdateDocumentPayload, UpdateClassificationPayload} from '../core-api';

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

  /**    * Atualiza parcialmente um documento (título ou conteúdo).
   * Usa o método PATCH.
   */
  updateDocument(document_id: number, payload: UpdateDocumentPayload): Promise<{ data: ResponseStructure<Document> }> {
    return api.patch(`/documento/alterar/${document_id}/`, payload);
  },

  /**
   * Recupera os dados de classificação de um documento.
   * @param document_id - O ID (pk) do documento.
   */
  getClassification(document_id: number): Promise<{ data: ResponseStructure<Classification> }> {
  	return api.get(`/documento/classificacao/consultar/${document_id}/`);
  },

  /**
   * Altera os dados da classificação do documento parcialmente.
   * @param document_id 
   * @param payload 
   * @returns 
   */
  updateClassification(document_id: number, payload: UpdateClassificationPayload): Promise<{ data: ResponseStructure<Classification> }> {
    return api.patch(`/documento/classificacao/alterar/${document_id}/`, payload);
  },
};

export default documentService;