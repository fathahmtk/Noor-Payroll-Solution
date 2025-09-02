import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import type { Employee, PayrollRun, CompanySettings, LeaveRequest, User, InviteUser, AppContextType, Role, Permission, JobOpening, Candidate } from './types';
import { useDataFetching } from './hooks/useDataFetching';
import { 
    getEmployees, addEmployee, updateEmployee, deleteEmployee, runPayroll, 
    getCompanySettings, addLeaveRequest, inviteUser,
    getRoles, updateUser, createRole, updateRole, addJobOpening, addCandidate
} from './services/api';
import { useToasts } from './hooks/useToasts';
import AddEmployeeModal from './components/employees/AddEmployeeModal';
import EditEmployeeModal from './components/employees/EditEmployeeModal';
import ConfirmDeleteModal from './components/common/ConfirmDeleteModal';
import PayrollRunModal from './components/payroll/PayrollRunModal';
import PayslipModal from './components/employees/PayslipModal';
import LeaveRequestModal from './components/time-attendance/LeaveRequestModal';
import InviteUserModal from './components/settings/InviteUserModal';
import EditUserModal from './components/settings/EditUserModal';
import EditRoleModal from './components/settings/EditRoleModal';
import AddJobOpeningModal from './components/recruitment/AddJobOpeningModal';
import AddCandidateModal from './components/recruitment/AddCandidateModal';

type ModalType = 'addEmployee' | 'editEmployee' | 'deleteEmployee' | 'runPayroll' | 'viewPayslip' | 'requestLeave' | 'inviteUser' | 'editUser' | 'createRole' | 'editRole' | 'addJobOpening' | 'addCandidate';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode; currentUser: User | null }> = ({ children, currentUser }) => {
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);
    const [modalData, setModalData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { addToast } = useToasts();
    
    const tenantId = currentUser?.tenantId;
    const { data: employees, refresh: refreshEmployees, loading: employeesLoading } = useDataFetching(
        () => tenantId ? getEmployees(tenantId) : Promise.resolve([])
    );
    
    const openModal = useCallback((modal: ModalType, data: any = null) => {
        setModalData(data);
        setActiveModal(modal);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setModalData(null);
    }, []);

    const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'tenantId'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await addEmployee(tenantId, employeeData);
            addToast('Employee added successfully!', 'success');
            closeModal();
            await refreshEmployees();
        } catch (e) { addToast('Failed to add employee.', 'error'); } 
        finally { setIsSubmitting(false); }
    };

    const handleUpdateEmployee = async (employeeData: Employee) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await updateEmployee(tenantId, employeeData);
            addToast('Employee updated successfully!', 'success');
            closeModal();
            await refreshEmployees();
        } catch (e) { addToast('Failed to update employee.', 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteEmployee = async () => {
        if (!modalData || !tenantId) return;
        setIsSubmitting(true);
        try {
            await deleteEmployee(tenantId, modalData.id);
            addToast(`Employee "${modalData.name}" deleted.`, 'success');
            closeModal();
            await refreshEmployees();
        } catch (e) { addToast('Failed to delete employee.', 'error'); }
        finally { setIsSubmitting(false); }
    };
    
    const handleRunPayroll = async (month: string, year: number) => {
        if (!tenantId) throw new Error("Tenant not found");
        const result = await runPayroll(tenantId, month, year);
        closeModal();
        addToast(`Payroll for ${month} ${year} processed successfully!`, 'success');
        return result;
    };

    const handleRequestLeave = async (requestData: Omit<LeaveRequest, 'id' | 'status' | 'employeeName' | 'tenantId'>) => {
        if (!currentUser || !currentUser.employeeId || !tenantId) return;
        setIsSubmitting(true);
        try {
            await addLeaveRequest(tenantId, { ...requestData, employeeId: currentUser.employeeId });
            addToast('Leave request submitted successfully!', 'success');
            closeModal();
        } catch (e) {
            addToast('Failed to submit leave request.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteUser = async (userData: InviteUser) => {
        if (!tenantId || !currentUser) return;
        setIsSubmitting(true);
        try {
            await inviteUser(tenantId, currentUser.companyName, userData);
            addToast('User invited successfully!', 'success');
            modalData?.onUpdate(); // Refresh user list
            closeModal();
        } catch(e) { addToast('Failed to invite user.', 'error'); }
        finally { setIsSubmitting(false); }
    };
    
    const handleUpdateUser = async (userData: Pick<User, 'id' | 'name' | 'role'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await updateUser(tenantId, userData);
            addToast('User updated successfully', 'success');
            modalData?.onUpdate(); // Refresh user list
            closeModal();
        } catch(e) { addToast('Failed to update user.', 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleCreateOrUpdateRole = async (roleData: Role | Omit<Role, 'id'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        const isUpdating = 'id' in roleData;
        try {
            if (isUpdating) {
                await updateRole(tenantId, roleData as Role);
            } else {
                await createRole(tenantId, roleData);
            }
            addToast(`Role ${isUpdating ? 'updated' : 'created'} successfully!`, 'success');
            modalData?.onUpdate(); // Refresh role list
            closeModal();
        } catch(e) { addToast(`Failed to ${isUpdating ? 'update' : 'create'} role.`, 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleAddJobOpening = async (jobData: Omit<JobOpening, 'id' | 'datePosted' | 'tenantId'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await addJobOpening(tenantId, jobData);
            addToast('Job opening posted successfully!', 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) { addToast('Failed to post job opening.', 'error'); } 
        finally { setIsSubmitting(false); }
    };

    const handleAddCandidate = async (candidateData: Omit<Candidate, 'id' | 'appliedDate' | 'avatarUrl' | 'tenantId' | 'jobTitle'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await addCandidate(tenantId, candidateData);
            addToast('Candidate added successfully!', 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) { addToast('Failed to add candidate.', 'error'); } 
        finally { setIsSubmitting(false); }
    };

    const contextValue = useMemo(() => ({
        openModal, closeModal, employees, refreshEmployees, loading: employeesLoading, currentUser
    }), [openModal, closeModal, employees, refreshEmployees, employeesLoading, currentUser]);

    const { data: companySettings } = useDataFetching(() => tenantId ? getCompanySettings(tenantId) : Promise.resolve(null));

    return (
        <AppContext.Provider value={contextValue}>
            {children}

            <AddEmployeeModal isOpen={activeModal === 'addEmployee'} onClose={closeModal} onAddEmployee={handleAddEmployee} isSubmitting={isSubmitting} />
            <EditEmployeeModal isOpen={activeModal === 'editEmployee'} onClose={closeModal} onUpdateEmployee={handleUpdateEmployee} employee={modalData} isSubmitting={isSubmitting} />
            <ConfirmDeleteModal isOpen={activeModal === 'deleteEmployee'} onClose={closeModal} onConfirm={handleDeleteEmployee} isDeleting={isSubmitting} title={`Delete ${modalData?.name}`} message="Are you sure you want to delete this employee? This action is permanent." />
            <PayrollRunModal isOpen={activeModal === 'runPayroll'} onClose={closeModal} employees={employees || []} onRunPayroll={handleRunPayroll} />
            <PayslipModal isOpen={activeModal === 'viewPayslip'} onClose={closeModal} employee={modalData?.employee} payrollRun={modalData?.payrollRun} companySettings={companySettings} />
            <LeaveRequestModal isOpen={activeModal === 'requestLeave'} onClose={closeModal} onSubmit={handleRequestLeave} employeeId={currentUser?.employeeId || ''} isSubmitting={isSubmitting} />
            <InviteUserModal isOpen={activeModal === 'inviteUser'} onClose={closeModal} onInvite={handleInviteUser} isSubmitting={isSubmitting} />
            <EditUserModal isOpen={activeModal === 'editUser'} onClose={closeModal} onUpdate={handleUpdateUser} isSubmitting={isSubmitting} user={modalData} tenantId={tenantId} />
            <EditRoleModal isOpen={activeModal === 'createRole' || activeModal === 'editRole'} onClose={closeModal} onSubmit={handleCreateOrUpdateRole} isSubmitting={isSubmitting} role={modalData} />
            <AddJobOpeningModal isOpen={activeModal === 'addJobOpening'} onClose={closeModal} onAddJob={handleAddJobOpening} isSubmitting={isSubmitting} onUpdate={modalData?.onUpdate} />
            <AddCandidateModal isOpen={activeModal === 'addCandidate'} onClose={closeModal} onAddCandidate={handleAddCandidate} isSubmitting={isSubmitting} jobOpening={modalData?.jobOpening} onUpdate={modalData?.onUpdate} />

        </AppContext.Provider>
    );
};
