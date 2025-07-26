import { Switch, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import AuthPage from "@/pages/auth";
import RoleSelectionPage from "@/pages/role-selection";
import DashboardPage from "@/pages/dashboard";
import MentorsPage from "@/pages/mentors";
import MentorProfilePage from "@/pages/mentor-profile";
import BuddyTimelinePage from "@/pages/buddy-timeline";
import BuddiesPage from "@/pages/buddies";
import BuddyDetailPage from "@/pages/buddy-detail";
import TasksPage from "@/pages/tasks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/role-selection" component={RoleSelectionPage} />
        
        {/* Protected Routes */}
        <Route path="/" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/mentors" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MentorsPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/buddies" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BuddiesPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/buddies/:id" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BuddyDetailPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/tasks" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TasksPage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />

        <Route path="/mentors/:id" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MentorProfilePage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        <Route path="/buddies/:id" component={() => (
          <ProtectedRoute>
            <Layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BuddyTimelinePage />
              </motion.div>
            </Layout>
          </ProtectedRoute>
        )} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
