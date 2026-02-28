import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import useAuthStore from './admin/store/authStore';
import AppLayout from './admin/components/Layout';

// Lazy load pages
const Login = lazy(() => import('./admin/pages/Login'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const CreateJob = lazy(() => import('./admin/pages/CreateJob'));
const JobDetails = lazy(() => import('./admin/pages/JobDetails'));
const AssignMechanic = lazy(() => import('./admin/pages/AssignMechanic'));
const InspectionChecklist = lazy(() => import('./admin/pages/InspectionChecklist'));
const FaultList = lazy(() => import('./admin/pages/FaultList'));
const CustomerApproval = lazy(() => import('./admin/pages/CustomerApproval'));
const RepairCost = lazy(() => import('./admin/pages/RepairCost'));
const Invoice = lazy(() => import('./admin/pages/Invoice'));
const MechanicManagement = lazy(() => import('./admin/pages/MechanicManagement'));
const UserManagement = lazy(() => import('./admin/pages/UserManagement'));
const PublicJobApproval = lazy(() => import('./admin/pages/PublicJobApproval'));

// Manager Layout
const ManagerLayout = lazy(() => import('./manager/components/ManagerLayout'));

// Accountant Layout & Pages
const AccountantLayout = lazy(() => import('./accountant/components/AccountantLayout'));
const AccountantDashboard = lazy(() => import('./accountant/pages/AccountantDashboard'));

// Store Layout & Pages
const StoreLayout = lazy(() => import('./store/components/StoreLayout'));
const StoreDashboard = lazy(() => import('./store/pages/StoreDashboard'));
const InventoryPage = lazy(() => import('./store/pages/InventoryPage'));
const UploadPartsPage = lazy(() => import('./store/pages/UploadPartsPage'));
const PartsRequestsPage = lazy(() => import('./store/pages/PartsRequestsPage'));

// Receptionist Layout & Pages
const ReceptionistLayout = lazy(() => import('./receptionist/components/ReceptionistLayout'));
const ReceptionistDashboard = lazy(() => import('./receptionist/pages/ReceptionistDashboard'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  );
}

/**
 * Admin Routes — full access to everything
 */
function AdminRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/approve/:jobId" element={<PublicJobApproval />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Dashboard />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            <Route path="/job/:jobId/assign" element={<AssignMechanic />} />
            <Route path="/job/:jobId/inspection" element={<InspectionChecklist />} />
            <Route path="/job/:jobId/faults" element={<FaultList />} />
            <Route path="/job/:jobId/approval" element={<CustomerApproval />} />
            <Route path="/job/:jobId/repair-cost" element={<RepairCost />} />
            <Route path="/job/:jobId/invoice" element={<Invoice />} />
            <Route path="/mechanics" element={<MechanicManagement />} />
            <Route path="/users" element={<UserManagement />} />
            {/* Catch-all: redirect back to dashboard */}
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

/**
 * Manager Routes — Everything except Inspection (mechanic does inspection)
 */
function ManagerRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<ManagerLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Dashboard />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            <Route path="/job/:jobId/assign" element={<AssignMechanic />} />
            {/* No inspection route — mechanic does inspection */}
            <Route path="/job/:jobId/faults" element={<FaultList />} />
            <Route path="/job/:jobId/approval" element={<CustomerApproval />} />
            <Route path="/job/:jobId/repair-cost" element={<RepairCost />} />
            <Route path="/job/:jobId/invoice" element={<Invoice />} />
          </Route>
          {/* Catch-all: redirect back to dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

/**
 * Accountant Routes — Only completed jobs + invoice
 */
function AccountantRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<AccountantLayout />}>
            <Route path="/" element={<AccountantDashboard />} />
            <Route path="/jobs" element={<AccountantDashboard />} />
            <Route path="/invoices" element={<AccountantDashboard />} />
            <Route path="/job/:jobId/invoice" element={<Invoice />} />
          </Route>
          {/* Catch-all: redirect back to accountant dashboard */}
          <Route path="*" element={<AccountantDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

/**
 * Store Routes — Inventory management, parts upload
 */
function StoreRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route path="/" element={<StoreDashboard />} />
            <Route path="/dashboard" element={<StoreDashboard />} />
            <Route path="/parts-requests" element={<PartsRequestsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/upload" element={<UploadPartsPage />} />
          </Route>
          {/* Catch-all: redirect back to store dashboard */}
          <Route path="*" element={<StoreDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

/**
 * Receptionist Routes — Search records by number + assign drivers
 */
function ReceptionistRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<ReceptionistLayout />}>
            <Route path="/" element={<ReceptionistDashboard />} />
            <Route path="/search" element={<ReceptionistDashboard />} />
            {/* Catch-all: redirect back to receptionist dashboard */}
            <Route path="*" element={<ReceptionistDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { isLoggedIn, user, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    );
  }

  // Route based on user role
  const role = user?.role;

  switch (role) {
    case 'manager':
      return <ManagerRoutes />;
    case 'accountant':
      return <AccountantRoutes />;
    case 'store':
      return <StoreRoutes />;
    case 'receptionist':
      return <ReceptionistRoutes />;
    case 'admin':
    default:
      return <AdminRoutes />;
  }
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 10,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          colorBgContainer: '#ffffff',
          fontSize: 14,
        },
        components: {
          Table: {
            headerBg: '#f8fafc',
            rowHoverBg: '#f8fafc',
          },
          Card: {
            paddingLG: 24,
          },
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}
