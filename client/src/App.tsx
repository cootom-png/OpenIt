import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminStats from "./pages/AdminStats";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminFiles = lazy(() => import("./pages/AdminFiles"));
const Profile = lazy(() => import("./pages/Profile"));
const ShareView = lazy(() => import("./pages/ShareView"));
const PartsGallery = lazy(() => import("./pages/PartsGallery"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const HelpGuide = lazy(() => import("./pages/HelpGuide"));

const LazyFallback = (
  <div className="min-h-screen flex items-center justify-center text-slate-400">加载中...</div>
);

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"}>
        <Suspense fallback={LazyFallback}><ResetPassword /></Suspense>
      </Route>
      <Route path={"/parts"}>
        <Suspense fallback={LazyFallback}><PartsGallery /></Suspense>
      </Route>
      <Route path={"/help"}>
        <Suspense fallback={LazyFallback}><HelpGuide /></Suspense>
      </Route>
      <Route path={"/profile"}>
        <Suspense fallback={LazyFallback}><Profile /></Suspense>
      </Route>
      <Route path={"/share/:token"}>
        <Suspense fallback={LazyFallback}><ShareView /></Suspense>
      </Route>
      <Route path={"/admin/stats"} component={AdminStats} />
      <Route path={"/admin/users"}>
        <Suspense fallback={LazyFallback}><AdminUsers /></Suspense>
      </Route>
      <Route path={"/admin/files"}>
        <Suspense fallback={LazyFallback}><AdminFiles /></Suspense>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
