import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import SharePage from "./pages/SharePage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key");
}

const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY || ""}
    appearance={{
      variables: {
        colorPrimary: "#FC6E83",
        colorText: "#E7D9D5",
        colorBackground: "#2D2833",
        colorInputBackground: "#1A161E",
        colorInputText: "#E7D9D5",
        borderRadius: "0",
        fontFamily: "Chakra Petch",
      },
      elements: {
        card: "bg-surface border-3 border-muted shadow-brutal mx-auto",
        headerTitle: "font-display uppercase tracking-tight text-reading",
        headerSubtitle: "font-ui uppercase opacity-60 text-reading",
        socialButtonsBlockButton: "rounded-none border-2 border-muted hover:border-active transition-none bg-surface",
        socialButtonsBlockButtonText: "font-ui uppercase tracking-widest text-reading",
        formButtonPrimary: "rounded-none bg-active hover:bg-reading transition-none uppercase font-bold text-surface",
        footerActionLink: "text-active hover:underline",
        identityPreviewText: "text-reading",
        identityPreviewEditButtonIcon: "text-active",
        formFieldInput: "rounded-none border-2 border-muted focus:border-active transition-none bg-background text-reading font-mono",
        formFieldLabel: "font-ui uppercase text-muted tracking-widest text-[10px]",
        userButtonPopoverCard: "bg-surface border-3 border-muted rounded-none shadow-brutal",
        userButtonPopoverActionButtonText: "font-ui uppercase tracking-widest text-reading",
        userButtonPopoverFooter: "hidden",
        dividerRow: "hidden",
        dividerText: "hidden"
      }
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/share/:id" element={<SharePage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
