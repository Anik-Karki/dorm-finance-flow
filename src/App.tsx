
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { AppProvider } from "./contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import NewInvoice from "./pages/NewInvoice";
import Payments from "./pages/Payments";
import Ledger from "./pages/Ledger";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
            <Route path="/students/:id" element={<MainLayout><StudentDetail /></MainLayout>} />
            <Route path="/invoices" element={<MainLayout><Invoices /></MainLayout>} />
            <Route path="/invoices/:id" element={<MainLayout><InvoiceDetail /></MainLayout>} />
            <Route path="/invoices/new" element={<MainLayout><NewInvoice /></MainLayout>} />
            <Route path="/payments" element={<MainLayout><Payments /></MainLayout>} />
            <Route path="/ledger" element={<MainLayout><Ledger /></MainLayout>} />
            <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
