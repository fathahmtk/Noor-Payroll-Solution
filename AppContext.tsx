import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import type { Employee, PayrollRun, CompanySettings, LeaveRequest, User, InviteUser, AppContextType, Role, Permission, JobOpening, Candidate, AssetMaintenance, CompanyVehicle, VehicleLog, PettyCashTransaction, Tenant, Theme, KnowledgeBaseArticle } from './types';
import { useDataFetching } from './hooks/useDataFetching';
import { 
    getEmployees, addEmployee, updateEmployee, deleteEmployee, runPayroll, 
    getCompanySettings, addLeaveRequest, inviteUser,
    getRoles, updateUser, createRole, updateRole, addJobOpening, addCandidate, addAssetMaintenance,
    addVehicle, updateVehicle, addVehicleLog, addPettyCashTransaction,
    updateCandidateStatus, getTenant, addKnowledgeBaseArticle, updateKnowledgeBaseArticle, deleteKnowledgeBaseArticle
} from './services/api';
import { useToasts } from './hooks/useToasts.tsx';
import AddEmployeeModal from './components/employees/AddEmployeeModal';
import EditEmployeeModal from './components/employees/EditEmployeeModal';
import ConfirmDeleteModal from './components/common/ConfirmDeleteModal';
import PayrollRunModal from './components/payroll/PayrollRunModal';
import ViewWPSPayslipModal from './components/employees/PayslipModal';
import LeaveRequestModal from './components/time-attendance/LeaveRequestModal';
import InviteUserModal from './components/settings/InviteUserModal';
import EditUserModal from './components/settings/EditUserModal';
import EditRoleModal from './components/settings/EditRoleModal';
import AddJobOpeningModal from './components/recruitment/AddJobOpeningModal';
import AddCandidateModal from './components/recruitment/AddCandidateModal';
import ViewCandidateModal from './components/recruitment/ViewCandidateModal';
import AddMaintenanceModal from './components/assets/AddMaintenanceModal';
import AddVehicleModal from './components/vehicles/AddVehicleModal';
import AddVehicleLogModal from './components/vehicles/AddVehicleLogModal';
import AddPettyCashModal from './components/petty-cash/AddPettyCashModal';
import GeneratePayslipModal from './components/payslip/GeneratePayslipModal';
import ArticleEditorModal from './components/knowledge-base/ArticleEditorModal.tsx';

type ModalType = 'addEmployee' | 'editEmployee' | 'deleteEmployee' | 'runPayroll' | 'viewWPSPayslip' | 'generatePayslip' | 'requestLeave' | 'inviteUser' | 'editUser' | 'createRole' | 'editRole' | 'addJobOpening' | 'addCandidate' | 'viewCandidate' | 'addMaintenance' | 'addVehicle' | 'addVehicleLog' | 'addPettyCash' | 'addArticle' | 'editArticle' | 'deleteArticle';

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
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('noor-hr-theme') as Theme) || 'dark');
    
    const { addToast } = useToasts();
    
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('noor-hr-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const tenantId = currentUser?.tenantId;
    const { data: employees, refresh: refreshEmployees, loading: employeesLoading } = useDataFetching(
        tenantId ? `employees-${tenantId}` : null,
        () => tenantId ? getEmployees(tenantId) : Promise.resolve([])
    );

    const { data: tenant, refresh: refreshTenant } = useDataFetching(
        tenantId ? `tenant-${tenantId}` : null,
        () => tenantId ? getTenant(tenantId) : Promise.resolve(null)
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
        if (!tenantId || !currentUser) return;
        setIsSubmitting(true);
        try {
            await addEmployee(tenantId, employeeData, { id: currentUser.id, name: currentUser.name });
            addToast('Employee added successfully!', 'success');
            
            if (employeeData._candidateId) {
                await updateCandidateStatus(tenantId, employeeData._candidateId, 'Converted');
                addToast('Candidate status updated to Converted.', 'info');
            }
            
            closeModal();
            await refreshEmployees();
            if (modalData?.onUpdate) {
                modalData.onUpdate(); // This will refresh candidates list
            }
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
        if (!modalData || !tenantId || !currentUser) return;
        setIsSubmitting(true);
        try {
            await deleteEmployee(tenantId, modalData.id, modalData.name, { id: currentUser.id, name: currentUser.name });
            addToast(`Employee "${modalData.name}" deleted.`, 'success');
            closeModal();
            await refreshEmployees();
        } catch (e) { addToast('Failed to delete employee.', 'error'); }
        finally { setIsSubmitting(false); }
    };
    
    const handleRunPayroll = async (month: string, year: number) => {
        if (!tenantId || !currentUser) throw new Error("Tenant not found");
        const result = await runPayroll(tenantId, month, year, { id: currentUser.id, name: currentUser.name });
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
            await inviteUser(tenantId, currentUser.companyName, userData, { id: currentUser.id, name: currentUser.name });
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
        if (!tenantId || !currentUser) return;
        setIsSubmitting(true);
        const isUpdating = 'id' in roleData;
        try {
            if (isUpdating) {
                await updateRole(tenantId, roleData as Role, { id: currentUser.id, name: currentUser.name });
            } else {
                await createRole(tenantId, roleData, { id: currentUser.id, name: currentUser.name });
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

    const handleAddMaintenance = async (maintenanceData: Omit<AssetMaintenance, 'id' | 'assetName' | 'tenantId'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await addAssetMaintenance(tenantId, maintenanceData);
            addToast('Maintenance record added successfully!', 'success');
            modalData?.onUpdate(); // Refresh maintenance list
            closeModal();
        } catch (e) { addToast('Failed to add maintenance record.', 'error'); } 
        finally { setIsSubmitting(false); }
    };

    const handleAddOrUpdateVehicle = async (vehicleData: CompanyVehicle | Omit<CompanyVehicle, 'id' | 'tenantId'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        const isUpdating = 'id' in vehicleData;
        try {
            if (isUpdating) {
                await updateVehicle(tenantId, vehicleData as CompanyVehicle);
            } else {
                await addVehicle(tenantId, vehicleData as Omit<CompanyVehicle, 'id' | 'tenantId'>);
            }
            addToast(`Vehicle ${isUpdating ? 'updated' : 'added'} successfully!`, 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) { addToast(`Failed to ${isUpdating ? 'update' : 'add'} vehicle.`, 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleAddVehicleLog = async (logData: Omit<VehicleLog, 'id' | 'tenantId' | 'vehicleName' | 'employeeName'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await addVehicleLog(tenantId, logData);
            addToast('Vehicle log added successfully!', 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) { addToast('Failed to add vehicle log.', 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleAddPettyCash = async (transData: Omit<PettyCashTransaction, 'id' | 'tenantId' | 'employeeName' | 'status'>) => {
        if (!tenantId) return;
        setIsSubmitting(true);
        try {
            await addPettyCashTransaction(tenantId, transData);
            addToast('Petty cash transaction submitted.', 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) { addToast('Failed to submit transaction.', 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleConvertToEmployee = (candidate: Candidate) => {
        openModal('addEmployee', { 
          initialData: {
              name: candidate.name,
              position: candidate.jobTitle,
              _candidateId: candidate.id
          },
          onUpdate: modalData?.onUpdate
        });
    };
    
    const handleAddArticle = async (articleData: Omit<KnowledgeBaseArticle, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'>) => {
        if (!tenantId || !currentUser) return;
        setIsSubmitting(true);
        try {
            await addKnowledgeBaseArticle(tenantId, articleData, { id: currentUser.id, name: currentUser.name });
            addToast('Article published successfully!', 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) { addToast('Failed to publish article.', 'error'); }
        finally { setIsSubmitting(false); }
    };
    
    const handleUpdateArticle = async (articleData: KnowledgeBaseArticle) => {
        if (!tenantId || !currentUser) return;
        setIsSubmitting(true);
        try {
            await updateKnowledgeBaseArticle(tenantId, articleData, { id: currentUser.id, name: currentUser.name });
            addToast('Article updated successfully!', 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) {
            addToast('Failed to update article.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteArticle = async () => {
        if (!modalData || !tenantId || !currentUser) return;
        setIsSubmitting(true);
        try {
            await deleteKnowledgeBaseArticle(tenantId, modalData.id, { id: currentUser.id, name: currentUser.name });
            addToast(`Article "${modalData.title}" deleted.`, 'success');
            modalData?.onUpdate();
            closeModal();
        } catch (e) {
            addToast('Failed to delete article.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isManager = useMemo(() => {
        if (!employees || !currentUser?.employeeId) return false;
        return employees.some(e => e.managerId === currentUser.employeeId);
    }, [employees, currentUser]);

    const renderModals = () => {
        if (!activeModal) return null;
        
        switch(activeModal) {
            case 'addEmployee':
                return <AddEmployeeModal isOpen={true} onClose={closeModal} onAddEmployee={handleAddEmployee} isSubmitting={isSubmitting} initialData={modalData?.initialData} />;
            case 'editEmployee':
                return <EditEmployeeModal isOpen={true} onClose={closeModal} employee={modalData} onUpdateEmployee={handleUpdateEmployee} isSubmitting={isSubmitting} />;
            case 'deleteEmployee':
                return <ConfirmDeleteModal isOpen={true} onClose={closeModal} onConfirm={handleDeleteEmployee} isDeleting={isSubmitting} title="Delete Employee" message={`Are you sure you want to delete ${modalData.name}? This action is permanent.`} />;
            case 'runPayroll':
                return <PayrollRunModal isOpen={true} onClose={closeModal} employees={employees || []} onRunPayroll={handleRunPayroll} />;
            case 'viewWPSPayslip':
                return <ViewWPSPayslipModal isOpen={true} onClose={closeModal} {...modalData} />;
            case 'requestLeave':
                 return <LeaveRequestModal isOpen={true} onClose={closeModal} onSubmit={handleRequestLeave} employeeId={currentUser!.employeeId!} isSubmitting={isSubmitting} />;
            case 'inviteUser':
                return <InviteUserModal isOpen={true} onClose={closeModal} onInvite={handleInviteUser} isSubmitting={isSubmitting} tenantId={tenantId} />;
            case 'editUser':
                return <EditUserModal isOpen={true} onClose={closeModal} onUpdate={handleUpdateUser} user={modalData} isSubmitting={isSubmitting} tenantId={tenantId} />;
            case 'createRole':
                 return <EditRoleModal isOpen={true} onClose={closeModal} onSubmit={handleCreateOrUpdateRole} role={null} isSubmitting={isSubmitting} />;
            case 'editRole':
                return <EditRoleModal isOpen={true} onClose={closeModal} onSubmit={handleCreateOrUpdateRole} role={modalData} isSubmitting={isSubmitting} />;
            case 'addJobOpening':
                return <AddJobOpeningModal isOpen={true} onClose={closeModal} onAddJob={handleAddJobOpening} isSubmitting={isSubmitting} onUpdate={modalData.onUpdate} />;
            case 'addCandidate':
                return <AddCandidateModal isOpen={true} onClose={closeModal} onAddCandidate={handleAddCandidate} isSubmitting={isSubmitting} jobOpening={modalData.jobOpening} onUpdate={modalData.onUpdate} />;
            case 'viewCandidate':
                return <ViewCandidateModal isOpen={true} onClose={closeModal} candidate={modalData} onConvertToEmployee={handleConvertToEmployee} />;
            case 'addMaintenance':
                return <AddMaintenanceModal isOpen={true} onClose={closeModal} onSubmit={handleAddMaintenance} assets={modalData.assets} isSubmitting={isSubmitting} />;
            case 'addVehicle':
                return <AddVehicleModal isOpen={true} onClose={closeModal} onSubmit={handleAddOrUpdateVehicle} isSubmitting={isSubmitting} vehicleToEdit={modalData?.vehicle} employees={employees || []} onUpdate={modalData.onUpdate} />;
            case 'addVehicleLog':
                 return <AddVehicleLogModal isOpen={true} onClose={closeModal} onSubmit={handleAddVehicleLog} isSubmitting={isSubmitting} vehicles={modalData.vehicles} employees={employees || []} />;
            case 'addPettyCash':
                return <AddPettyCashModal isOpen={true} onClose={closeModal} onSubmit={handleAddPettyCash} isSubmitting={isSubmitting} employees={employees || []} onUpdate={modalData.onUpdate} />;
            case 'generatePayslip':
                return <GeneratePayslipModal isOpen={true} onClose={closeModal} employee={modalData?.employee} />;
            case 'addArticle':
                return (
                    <ArticleEditorModal
                        isOpen={true}
                        onClose={closeModal}
                        onAdd={handleAddArticle}
                        onUpdate={() => {}} // Not used in add mode
                        isSubmitting={isSubmitting}
                        articleToEdit={null}
                        onUpdateList={modalData?.onUpdate}
                    />
                );
            case 'editArticle':
                return (
                    <ArticleEditorModal
                        isOpen={true}
                        onClose={closeModal}
                        onAdd={() => {}} // Not used in edit mode
                        onUpdate={handleUpdateArticle}
                        isSubmitting={isSubmitting}
                        articleToEdit={modalData?.article}
                        onUpdateList={modalData?.onUpdate}
                    />
                );
            case 'deleteArticle':
                 return (
                    <ConfirmDeleteModal
                        isOpen={true}
                        onClose={closeModal}
                        onConfirm={handleDeleteArticle}
                        isDeleting={isSubmitting}
                        title="Delete Article"
                        message={`Are you sure you want to permanently delete the article "${modalData?.title}"?`}
                    />
                );
            default:
                return null;
        }
    };

    const value = useMemo(() => ({
        openModal,
        closeModal,
        employees: employees || [],
        refreshEmployees,
        loading: employeesLoading,
        currentUser,
        tenant: tenant as Tenant | null,
        refreshTenant,
        isManager,
        theme,
        toggleTheme,
    }), [openModal, closeModal, employees, refreshEmployees, employeesLoading, currentUser, tenant, refreshTenant, isManager, theme, toggleTheme]);
    
    return (
        <AppContext.Provider value={value}>
            {children}
            {renderModals()}
        </AppContext.Provider>
    );
};
