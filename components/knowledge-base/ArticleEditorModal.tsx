import React, { useState, useEffect } from 'react';
import type { KnowledgeBaseArticle } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { generateKnowledgeBaseArticle } from '../../services/geminiService';
import { useAppContext } from '../../AppContext';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<KnowledgeBaseArticle, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'>) => void;
  onUpdate: (data: KnowledgeBaseArticle) => void;
  isSubmitting: boolean;
  articleToEdit: KnowledgeBaseArticle | null;
  onUpdateList: () => void;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";

const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({ isOpen, onClose, onAdd, onUpdate, isSubmitting, articleToEdit }) => {
  const isEditMode = !!articleToEdit;
  const { currentUser } = useAppContext();
  const [formData, setFormData] = useState({ title: '', category: 'HR Policies', content: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          title: articleToEdit.title,
          category: articleToEdit.category,
          content: articleToEdit.content,
        });
      } else {
        setFormData({ title: '', category: 'HR Policies', content: '' });
      }
    }
  }, [isOpen, articleToEdit, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateContent = async () => {
    if (!formData.title || !currentUser) return;
    setIsGenerating(true);
    const content = await generateKnowledgeBaseArticle(formData.title, currentUser.companyName);
    setFormData(prev => ({ ...prev, content }));
    setIsGenerating(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
        onUpdate({ ...articleToEdit, ...formData });
    } else {
        onAdd(formData);
    }
  };
  
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="article-editor-form" isLoading={isSubmitting}>
        {isEditMode ? 'Save Changes' : 'Publish Article'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Article' : 'Create New Article'} footer={modalFooter}>
      <form id="article-editor-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className={formLabelClasses}>Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="category" className={formLabelClasses}>Category</label>
          <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required className={formInputClasses} placeholder="e.g., HR Policies, IT Guides" />
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="content" className={formLabelClasses}>Content</label>
                <Button variant="secondary" size="sm" onClick={handleGenerateContent} isLoading={isGenerating}>Generate with Gemini</Button>
            </div>
            <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} required className={formInputClasses} />
        </div>
      </form>
    </Modal>
  );
};

export default ArticleEditorModal;
