import React, { useState, useMemo } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getKnowledgeBaseArticles } from '../../services/api';
import type { KnowledgeBaseArticle } from '../../types';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import KnowledgeBaseIcon from '../icons/KnowledgeBaseIcon';

const ArticleViewer: React.FC<{
    article: KnowledgeBaseArticle;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canManage: boolean;
}> = ({ article, onBack, onEdit, onDelete, canManage }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <button onClick={onBack} className="text-sm font-semibold text-primary hover:underline mb-2">&larr; Back to All Articles</button>
                    <h2 className="text-3xl font-bold text-foreground">{article.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Last updated on {new Date(article.updatedAt).toLocaleDateString()} by {article.authorName}
                    </p>
                </div>
                {canManage && (
                    <div className="flex space-x-2">
                        <Button size="sm" variant="secondary" icon={<PencilIcon />} onClick={onEdit}>Edit</Button>
                        <Button size="sm" variant="danger" icon={<TrashIcon />} onClick={onDelete}>Delete</Button>
                    </div>
                )}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-secondary p-6 rounded-lg border border-border">
                <p>{article.content}</p>
            </div>
        </div>
    );
};

const KnowledgeBaseView: React.FC = () => {
    const { currentUser, openModal } = useAppContext();
    const { data: articles, loading, refresh } = useDataFetching(
        currentUser ? `kb-articles-${currentUser.tenantId}` : null,
        () => getKnowledgeBaseArticles(currentUser!.tenantId)
    );
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const canManage = currentUser?.role.permissions.includes('knowledgebase:manage');

    const filteredArticles = useMemo(() => {
        if (!articles) return [];
        return articles.filter(article => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [articles, searchTerm]);

    const groupedArticles = useMemo(() => {
        return filteredArticles.reduce((acc, article) => {
            const category = article.category || 'General';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(article);
            return acc;
        }, {} as Record<string, KnowledgeBaseArticle[]>);
    }, [filteredArticles]);

    if (loading) {
        return <div className="p-6"><LoadingSpinner /></div>;
    }

    if (selectedArticle) {
        return (
            <div className="p-6">
                <ArticleViewer 
                    article={selectedArticle} 
                    onBack={() => setSelectedArticle(null)}
                    onEdit={() => openModal('editArticle', { article: selectedArticle, onUpdate: () => { refresh(); setSelectedArticle(null); } })}
                    onDelete={() => openModal('deleteArticle', { ...selectedArticle, onUpdate: () => { refresh(); setSelectedArticle(null); } })}
                    canManage={!!canManage}
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex-grow">
                    <input
                        type="search"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-secondary border border-border text-foreground rounded-lg shadow-sm p-2 w-full max-w-md focus:ring-primary focus:border-primary"
                    />
                </div>
                {canManage && (
                    <Button icon={<PlusIcon />} onClick={() => openModal('addArticle', { onUpdate: refresh })}>
                        New Article
                    </Button>
                )}
            </div>
            {filteredArticles.length === 0 ? (
                <EmptyState 
                    icon={<KnowledgeBaseIcon className="w-16 h-16" />}
                    message={searchTerm ? 'No Articles Found' : 'Knowledge Base is Empty'}
                    description={searchTerm ? "Try a different search term." : "Get started by creating your first article."}
                    action={!searchTerm && canManage ? { label: "Create Article", onClick: () => openModal('addArticle', { onUpdate: refresh }) } : undefined}
                />
            ) : (
                <div className="space-y-8">
                    {/* FIX: Explicitly cast the result of Object.entries to fix 'map does not exist on type unknown' error. */}
                    {(Object.entries(groupedArticles) as [string, KnowledgeBaseArticle[]][]).map(([category, articlesInCategory]) => (
                        <div key={category}>
                            <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2 mb-4">{category}</h3>
                            <ul className="space-y-3">
                                {articlesInCategory.map(article => (
                                    <li 
                                        key={article.id} 
                                        className="p-4 bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => setSelectedArticle(article)}
                                    >
                                        <h4 className="font-bold text-primary">{article.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Updated {new Date(article.updatedAt).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KnowledgeBaseView;
