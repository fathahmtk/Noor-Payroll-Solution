import React, { useState } from 'react';
import { getDocuments, addDocument as apiAddDocument, deleteDocument as apiDeleteDocument, getEmployees } from '../../services/api';
import type { EmployeeDocument, Employee } from '../../types';
import Button from '../common/Button.tsx';
import PlusIcon from '../icons/PlusIcon.tsx';
import DocumentTable from './DocumentTable.tsx';
import AddDocumentModal from './AddDocumentModal.tsx';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal.tsx';
import { useDataFetching } from '../../hooks/useDataFetching.tsx';
import { useAppContext } from '../../AppContext.tsx';
import LoadingSpinner from '../common/LoadingSpinner.tsx';

const DocumentView: React.FC = () => {
  const { currentUser } = useAppContext();
  const { data: documents, loading: loadingDocs, refresh: fetchDocuments } = useDataFetching(
    currentUser ? `documents-${currentUser.tenantId}` : null,
    () => getDocuments(currentUser!.tenantId)
  );
  const { data: employees, loading: loadingEmps } = useDataFetching(
    currentUser ? `employees-${currentUser.tenantId}` : null,
    () => getEmployees(currentUser!.tenantId)
  );
  
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
        <h2 className="text-xl font-semibold text-foreground">Document Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)} icon={<PlusIcon />}>
          Add Document
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DocumentTable 
            documents={documents || []} 
            employees={employees || []} 
            onDelete={handleOpenDeleteModal} 
            onAdd={() => setIsAddModalOpen(true)}
        />
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