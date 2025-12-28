import api from '../core-api';
import type { Classification, 
  CreateDocument, 
  Document, 
  DocumentList, 
  ResponseStructure, 
  UpdateDocumentPayload, 
  UpdateClassificationPayload, 
  Category, 
  AddCategoriesPayload, 
  CreateCategoryPayload, 
  UpdateCategoryPayload, 
  AttachedFile, 
  DocumentHistory, 
  DocumentFilters, 
  AvailableCategorySearch, 
  PaginatedResponse, 
  MediaAssetStatusResponse, 
  ImportDocumentPayload
} from '../core-api';

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
  getDocuments(page: number = 1): Promise<{ data: ResponseStructure<PaginatedResponse<DocumentList>> }> {
     return api.get(`/documento/visualizar/?page=${page}`);
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

  /**
   * Anexa um arquivo ao documento.
   * Nota: O payload deve ser um objeto FormData.
   */
  attachFile(document_id: number, formData: FormData): Promise<{ data: ResponseStructure<any> }> {
    return api.post(`/documento/${document_id}/anexar-arquivo/`, formData);
  },

  /**
   * Remove (desvincula) um arquivo do documento.
   * @param attached_file_id O ID do anexo (não do documento).
   */
  detachFile(attached_file_id: number): Promise<{ data: ResponseStructure<null> }> {
    // Endpoint estimado com base na sua view. 
    // Ajuste a URL se o seu urls.py for diferente (ex: /anexo/excluir/...)
    return api.patch(`/documento/${attached_file_id}/desanexar-arquivo/`, {});
  },

  /**
   * Busca documentos usando RI e filtros avançados.
   * @param filters O objeto com todos os filtros.
   */
  searchDocuments(filters: DocumentFilters, page: number = 1): Promise<{ data: ResponseStructure<PaginatedResponse<DocumentList>> }> {
    const params = new URLSearchParams();

    params.append('page', page.toString());

    if (filters.searchTerm) params.append('q', filters.searchTerm);
    if (filters.isReviewed && filters.isReviewed !== '') params.append('is_reviewed', filters.isReviewed);
    if (filters.statusId && filters.statusId !== '') params.append('status_id', filters.statusId);
    if (filters.privacityId && filters.privacityId !== '') params.append('privacity_id', filters.privacityId);
    if (filters.reviewer && filters.reviewer.trim() !== '') params.append('reviewer_name', filters.reviewer);
    if (filters.categories && filters.categories.trim() !== '') params.append('categories', filters.categories);

    const queryString = params.toString();
    return api.get(`/documento/buscar/?${queryString}`);
  },

  /**
   * Retorna todas as categorias às quais o usuário tem acesso.
   */
  listAvailableCategories(): Promise<{ data: ResponseStructure<AvailableCategorySearch[]> }> {
    // (Ajuste a URL se for diferente)
    return api.get('/documento/categoria/visualizar/disponiveis/');
  },

  /**
   * Busca o histórico de alterações do documento.
   */
  getDocumentHistory(document_id: number): Promise<{ data: ResponseStructure<DocumentHistory[]> }> {
    return api.get(`/documento-auditoria/${document_id}/historico/`);
  },

  /**
   * Reverte o documento para uma versão específica do histórico.
   */
  revertDocument(document_id: number, history_id: number): Promise<{ data: ResponseStructure<Document> }> {
    return api.post(`/documento-auditoria/${document_id}/reverter/${history_id}/`, {});
  },

  /**
   * (PATCH) Ativa ou desativa um documento (toggle).
   * Endpoint: /api/documento/ativar-desativar/<pk>/
   */
  toggleDocumentStatus(document_id: number): Promise<{ data: ResponseStructure<any> }> {
    // A view PATCH não parece esperar um body, apenas a ação
    return api.patch(`/documento/ativar-desativar/${document_id}/`);
  },

  /**
   * (DELETE) Exclui permanentemente um documento.
   * Endpoint: /api/documento/excluir/<pk>/
   */
  deleteDocument(document_id: number): Promise<{ data: ResponseStructure<null> }> {
    return api.delete(`/documento/excluir/${document_id}/`);
  },

  // IMPORTAÇÃO DE DOCUMENTOS VIA MEDIA ASSET

  /**
   * Passo 1: Envia o arquivo físico para processamento.
   */
  uploadMedia(file: File, sector_id?: number, privacity_id: number = 1, selectedUserIds: number[] = []): Promise<{ data: ResponseStructure<any> }> {
    const formData = new FormData();
    formData.append('file', file);
    if (sector_id !== undefined) {
      formData.append('sector', sector_id.toString());
      formData.append('content', JSON.stringify({}));
      formData.append('privacity_id', privacity_id.toString());
      formData.append('users_exclusive_access', JSON.stringify(selectedUserIds));
    }
    
    return api.post('/documento/importar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Passo 2: Verifica o status do processamento (Polling).
   */
  checkMediaStatus(mediaAssetId: string) {
    return api.get<MediaAssetStatusResponse>(`/documento/importar/status/${mediaAssetId}/`);
  },

  /**
   * Passo 3: Cria o documento oficial vinculando o asset processado.
   */
  createDocumentFromImport(payload: ImportDocumentPayload) {
    return api.post('/documento/importar/criar/', payload);
  }
};

export default documentService;