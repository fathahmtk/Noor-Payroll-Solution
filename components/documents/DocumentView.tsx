import React, { useState } from 'react';
import { getDocuments, addDocument as apiAddDocument, deleteDocument as apiDeleteDocument, getEmployees } from '../../services/api';
import type { EmployeeDocument, Employee } from '../../types';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import DocumentTable from './DocumentTable';
import AddDocumentModal from './AddDocumentModal';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import { useDataFetching } from '../../hooks/useDataFetching';
import { useAppContext } from '../../AppContext';

const DocumentView: React.FC = () => {
  const { currentUser } = useAppContext();
  const { data: documents, loading: loadingDocs, refresh: fetchDocuments } = useDataFetching(() => getDocuments(currentUser!.tenantId));
  const { data: employees, loading: loadingEmps } = useDataFetching(() => getEmployees(currentUser!.tenantId));
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDocument(null);
  };

  const handleAddDocument = async (docData: Omit<EmployeeDocument, 'id' | 'employeeName' | 'tenantId'>) => {
    if (!currentUser?.tenantId) return;
    setIsSubmitting(true);
    await apiAddDocument(currentUser.tenantId, docData);
    setIsSubmitting(false);
    handleCloseModals();
    await fetchDocuments();
  };

  const handleOpenDeleteModal = (doc: EmployeeDocument) => {
    setSelectedDocument(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument || !currentUser?.tenantId) return;
    setIsSubmitting(true);
    await apiDeleteDocument(currentUser.tenantId, selectedDocument.id);
    setIsSubmitting(false);
    handleCloseModals();
    await fetchDocuments();
  };
  
  const loading = loadingDocs || loadingEmps;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-brand-dark">Document Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)} icon={<PlusIcon />}>
          Add Document
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><p>Loading documents...</p></div>
      ) : (
        <DocumentTable documents={documents || []} onDelete={handleOpenDeleteModal} />
      )}
      
      <AddDocumentModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModals} 
        onAddDocument={handleAddDocument}
        employees={employees || []}
        isSubmitting={isSubmitting}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteDocument}
        isDeleting={isSubmitting}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the document "${selectedDocument?.documentType}" for ${selectedDocument?.employeeName}? This action is permanent.`}
      />
    </div>
  );
};

export default DocumentView;
