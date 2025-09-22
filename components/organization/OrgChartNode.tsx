import React from 'react';
import type { Employee } from '../../types';

// Define and export a recursive type for the tree node for type safety.
export type EmployeeWithChildren = Employee & { children: EmployeeWithChildren[] };

interface OrgChartNodeProps {
  node: EmployeeWithChildren;
  onViewProfile: (employeeId: string) => void;
}

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node, onViewProfile }) => {
  return (
    <li>
      <div 
        className="inline-block bg-secondary p-3 rounded-lg shadow-md border border-border min-w-[180px] cursor-pointer hover:shadow-lg hover:border-primary transition-all"
        onClick={() => onViewProfile(node.id)}
      >
        <img src={node.avatarUrl} alt={node.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
        <h4 className="font-bold text-foreground">{node.name}</h4>
        <p className="text-xs text-muted-foreground">{node.position}</p>
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="flex justify-center">
          {node.children.map(child => (
            <OrgChartNode key={child.id} node={child} onViewProfile={onViewProfile} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default OrgChartNode;