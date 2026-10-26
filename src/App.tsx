import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomeRedirect from './components/layout/HomeRedirect';
import AppSessionProvider from './features/auth/components/AppSessionProvider';
import RequirePermission from './features/auth/components/RequirePermission';
import RequireSignedIn from './features/auth/components/RequireSignedIn';
import { PATHS } from './routes/paths';
import FullPageLoader from './shared/components/FullPageLoader';
import type { PermissionModule, ViewScope } from './types/index';
import LoginView from './views/LoginView';
import PortalView from './views/PortalView';

// Las vistas internas se cargan bajo demanda: el portal abre rápido.
const AcademicPeriodsView = lazy(() => import('./views/AcademicPeriodsView'));
const AttendanceView = lazy(() => import('./views/AttendanceView'));
const CatalogsView = lazy(() => import('./views/CatalogsView'));
const CourseCostsView = lazy(() => import('./views/CourseCostsView'));
const DashboardView = lazy(() => import('./views/DashboardView'));
const EnrollmentsView = lazy(() => import('./views/EnrollmentsView'));
const MyPaymentsView = lazy(() => import('./views/MyPaymentsView'));
const MyProfileView = lazy(() => import('./views/MyProfileView'));
const PaymentsView = lazy(() => import('./views/PaymentsView'));
const RolesView = lazy(() => import('./views/RolesView'));
const StudentDetailView = lazy(() => import('./views/StudentDetailView'));
const StudentsView = lazy(() => import('./views/StudentsView'));
const TeacherAssignmentsView = lazy(() => import('./views/TeacherAssignmentsView'));
const UsersView = lazy(() => import('./views/UsersView'));

interface ProtectedRoute {
  element: ReactNode;
  modules: PermissionModule[];
  path: string;
  scope?: ViewScope;
}

// Cada vista con el módulo de permisos que la controla (lo mismo que decide el menú).
const PROTECTED_ROUTES: ProtectedRoute[] = [
  { element: <DashboardView />, modules: ['dashboard'], path: PATHS.dashboard },
  { element: <MyProfileView />, modules: ['students'], path: PATHS.myProfile, scope: 'own' },
  { element: <StudentsView />, modules: ['students'], path: PATHS.students, scope: 'all' },
  { element: <StudentDetailView />, modules: ['students'], path: PATHS.studentDetail, scope: 'all' },
  { element: <EnrollmentsView />, modules: ['enrollments'], path: PATHS.enrollments },
  { element: <TeacherAssignmentsView />, modules: ['teacherAssignments'], path: PATHS.teacherAssignments },
  { element: <AttendanceView />, modules: ['attendance', 'grades'], path: PATHS.attendance },
  { element: <PaymentsView />, modules: ['payments'], path: PATHS.payments, scope: 'all' },
  { element: <MyPaymentsView />, modules: ['payments'], path: PATHS.myPayments, scope: 'own' },
  { element: <AcademicPeriodsView />, modules: ['academicPeriods'], path: PATHS.academicPeriods },
  { element: <CourseCostsView />, modules: ['courseCosts'], path: PATHS.courseCosts },
  { element: <CatalogsView />, modules: ['catalogs'], path: PATHS.catalogs },
  { element: <UsersView />, modules: ['users'], path: PATHS.users },
  { element: <RolesView />, modules: ['roles'], path: PATHS.roles },
];

const App = () => (
  <AppSessionProvider>
    <BrowserRouter>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route element={<PortalView />} path={PATHS.portal} />
          <Route element={<LoginView />} path={PATHS.login} />
          <Route
            element={
              <RequireSignedIn>
                <AppLayout />
              </RequireSignedIn>
            }
            path={PATHS.app}
          >
            <Route element={<HomeRedirect />} index />
            {PROTECTED_ROUTES.map(({ element, modules, path, scope }) => (
              <Route
                element={
                  <RequirePermission modules={modules} scope={scope}>
                    {element}
                  </RequirePermission>
                }
                key={path}
                path={path}
              />
            ))}
          </Route>
          <Route element={<Navigate replace to={PATHS.portal} />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AppSessionProvider>
);

export default App;
