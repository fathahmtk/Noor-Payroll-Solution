import React from 'react';
import type { Employee } from '../../types';

// Define and export a recursive type for the tree node for type safety.
export type EmployeeWithChildren = Employee & { children: EmployeeWithChildren[] };

interface OrgChartNodeProps {
  node: EmployeeWithChildren;
}

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node }) => {
  return (
    <li>
      <div className="inline-block bg-white p-3 rounded-lg shadow-md border border-slate-200 min-w-[180px]">
        <img src={node.avatarUrl} alt={node.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
        <h4 className="font-bold text-brand-dark">{node.name}</h4>
        <p className="text-xs text-slate-500">{node.position}</p>
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="flex justify-center">
          {node.children.map(child => (
            <OrgChartNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default OrgChartNode;