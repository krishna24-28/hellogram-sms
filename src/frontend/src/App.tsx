import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "./store/authStore";
import { UserRole } from "./types";

// Lazy-load pages to keep bundle chunks reasonable
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const StudentDashboard = lazy(() =>
  import("./pages/student/StudentDashboard").then((m) => ({
    default: m.StudentDashboard,
  })),
);
const TeacherDashboard = lazy(() =>
  import("./pages/teacher/TeacherDashboard").then((m) => ({
    default: m.TeacherDashboard,
  })),
);
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);

// Page-level loading fallback
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <LoadingSpinner size="lg" label="LOADING PORTAL" />
    </div>
  );
}

// ── Root Route ─────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  ),
});

// ── Guard helpers ──────────────────────────────────────────────────────────────

function requireAuth(role?: UserRole) {
  const { isAuthenticated, role: userRole } = useAuthStore.getState();
  if (!isAuthenticated) throw redirect({ to: "/login" });
  if (role && userRole !== role) {
    // Redirect to correct dashboard
    if (userRole === UserRole.student) throw redirect({ to: "/student" });
    if (userRole === UserRole.teacher) throw redirect({ to: "/teacher" });
    if (userRole === UserRole.admin) throw redirect({ to: "/admin" });
    throw redirect({ to: "/login" });
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student",
  beforeLoad: () => requireAuth(UserRole.student),
  component: StudentDashboard,
});

const teacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teacher",
  beforeLoad: () => requireAuth(UserRole.teacher),
  component: TeacherDashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => requireAuth(UserRole.admin),
  component: AdminDashboard,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  studentRoute,
  teacherRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
