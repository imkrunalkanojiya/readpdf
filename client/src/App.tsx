import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "./pages/home";
import Reader from "./pages/reader";
import { Sidebar } from './components/Sidebar';
import { SidebarProvider } from './contexts/SidebarContext';
import Favorites from "./pages/favorites"; 

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reader/:id" component={Reader} />
      {/* Uncomment once Favorites component is created */}
      <Route path="/favorites" component={Favorites} />
      <Route component={NotFound} />
    </Switch>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {/* Render Router inside main content area */}
              <Router />
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Removed stray toggleSidebar function and misplaced return statement

export default App;
