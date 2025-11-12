import api from '../core-api';
import type { Classification, CreateDocument, Document, DocumentList, ResponseStructure, UpdateDocumentPayload, UpdateClassificationPayload, Category, AddCategoriesPayload, CreateCategoryPayload, UpdateCategoryPayload, AttachedFile} from '../core-api';

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

  /**
   * Retorna as categorias vinculadas ao documento.
   * @param document_id - O ID (pk) do documento.
   */
  listCategoriesByDocument(document_id: number): Promise<{ data: ResponseStructure<Category[]> }> {
    return api.get(`/documento/categoria/visualizar/vinculos/${document_id}/`);
  },
  
  /**
   * Vincula a lista de categorias para o documento.
   * @param document_id - Documento a ser vinculado.
   * @param payload - Lista de categorias.
   * @returns 
   */
  linkCategoriesToDocument(document_id: number, payload: AddCategoriesPayload): Promise<{ data: ResponseStructure<Category[]> }> {
    return api.post(`/documento/categoria/vincular-categorias/${document_id}/`, payload);
  },

  /**
   * Retorna a pesquisa por Categorias.
   * @param document_id - ID do documento. 
   */
  listDiponibleCategories(document_id: number): Promise<{ data: ResponseStructure<Category[]> }> {
    return api.get(`/documento/categoria/visualizar/disponiveis/${document_id}/`);
  },

    /**
   * Busca a lista de categorias filtradas para um setor específico.
   * (Baseado na ListCategoryView)
   * @param sector_id O ID (pk) do setor.
   */
  listCategoriesBySector(sector_id: number): Promise<{ data: ResponseStructure<Category[]> }> {
    // A URL é baseada na sua view que espera um 'pk'
    return api.get(`/documento/categoria/visualizar/${sector_id}/`); 
  },

    /**
   * Cria uma nova categoria para o setor.
   * @param sector_id O ID do setor (usado na URL).
   * @param payload Os dados da nova categoria.
   */
  createCategory(sector_id: number, payload: CreateCategoryPayload): Promise<{ data: ResponseStructure<{ category_id: number }> }> {
    return api.post(`/documento/categoria/criar/${sector_id}/`, payload);
  },

  /**
   * Exclui uma categoria.
   * @param categoryId O ID da categoria a ser excluída (pk).
   * @param sectorId O ID do setor (necessário para permissão).
   */
  deleteCategory(categoryId: number, sectorId: number): Promise<{ data: ResponseStructure<null> }> {
    // DELETE request com body
    return api.delete(`/documento/categoria/excluir/${categoryId}/`, { 
      data: { sector_id: sectorId } 
    });
  },

  /**
   * Atualiza parcialmente uma categoria.
   * @param categoryId O ID da categoria.
   * @param payload Os dados a serem atualizados (incluindo sector_id).
   */
  updateCategory(categoryId: number, payload: UpdateCategoryPayload): Promise<{ data: ResponseStructure<Category> }> {
    return api.patch(`/documento/categoria/alterar/${categoryId}/`, payload);
  },

  /**
   * Lista os arquivos anexados a um documento.
   */
  listAttachedFiles(document_id: number): Promise<{ data: ResponseStructure<AttachedFile[]> }> {
    return api.get(`/documento/${document_id}/arquivos-anexados/`);
  },
};

export default documentService;