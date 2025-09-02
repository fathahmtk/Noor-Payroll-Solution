import React, { useState } from 'react';
import type { Employee, OnboardingTask } from '../../types';
import { updateOnboardingTaskStatus } from '../../services/api';
import { useToasts } from '../../hooks/useToasts';

interface OnboardingTabProps {
  employee: Employee;
  onUpdate: () => void;
}

const OnboardingTab: React.FC<OnboardingTabProps> = ({ employee, onUpdate }) => {
  const [tasks, setTasks] = useState<OnboardingTask[]>(employee.onboardingTasks || []);
  const { addToast } = useToasts();

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const updatedTasks = await updateOnboardingTaskStatus(employee.tenantId, employee.id, taskId, !currentStatus);
      setTasks(updatedTasks);
      addToast('Onboarding task updated.', 'success');
      onUpdate();
    } catch (error) {
      addToast('Failed to update task.', 'error');
    }
  };
  
  if (!tasks || tasks.length === 0) {
      return <div className="text-center p-8 text-gray-500">No onboarding tasks have been configured for this employee.</div>
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-brand-dark mb-2">Onboarding Checklist</h3>
      <p className="text-sm text-gray-500 mb-4">Track the progress of new hire orientation and setup.</p>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
              className="bg-accent h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
          ></div>
      </div>

      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id}>
            <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id, task.completed)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className={`ml-3 text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {task.description}
                    </span>
                </div>
                <span className="text-xs text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingTab;
