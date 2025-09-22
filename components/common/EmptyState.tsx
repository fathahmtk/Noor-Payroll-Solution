import React from 'react';
import Button from './Button.tsx';
import PlusIcon from '../icons/PlusIcon.tsx';
import FolderIcon from '../icons/FolderIcon.tsx';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, description, icon, action }) => {
  return (
    <div className="text-center py-16 px-6 border-2 border-dashed border-border rounded-lg bg-secondary/50">
      <div className="mx-auto h-12 w-12 text-muted-foreground">
        {icon || <FolderIcon />}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{message}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick} icon={<PlusIcon />}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
