import React, { useState } from 'react';
import type { Employee, OffboardingTask } from '../../types';
import { updateOffboardingTaskStatus } from '../../services/api';
import { useToasts } from '../../hooks/useToasts';

interface OffboardingTabProps {
  employee: Employee;
  onUpdate: () => void;
}

const OffboardingTab: React.FC<OffboardingTabProps> = ({ employee, onUpdate }) => {
  const [tasks, setTasks] = useState<OffboardingTask[]>(employee.offboardingTasks || []);
  const { addToast } = useToasts();

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const updatedTasks = await updateOffboardingTaskStatus(employee.tenantId, employee.id, taskId, !currentStatus);
      setTasks(updatedTasks);
      addToast('Offboarding task updated.', 'success');
      onUpdate();
    } catch (error) {
      addToast('Failed to update task.', 'error');
    }
  };

  if (!tasks || tasks.length === 0) {
      return <div className="text-center p-8 text-muted-foreground">No offboarding tasks have been configured.</div>
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-foreground mb-2">Offboarding Checklist</h3>
      <p className="text-sm text-muted-foreground mb-4">Manage tasks for the employee's departure.</p>
      
      <div className="w-full bg-secondary rounded-full h-2.5 mb-6">
          <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
          ></div>
      </div>

      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id}>
            <label className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-muted/50">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id, task.completed)}
                        className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                    />
                    <span className={`ml-3 text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.description}
                    </span>
                </div>
                <span className="text-xs text-foreground font-semibold px-2 py-1 rounded-full bg-muted">
                    {task.responsible}
                </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OffboardingTab;