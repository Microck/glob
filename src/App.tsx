import { Toaster } from "@/components/ui/toaster";
import { useLayoutEffect, useRef } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import gsap from "gsap";
import Index from "./pages/Index";
import SharePage from "./pages/SharePage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import HistoryPage from "./pages/History";
import NotFound from "./pages/NotFound";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key - auth features disabled");
}

const queryClient = new QueryClient();

const clerkAppearance = {
  variables: {
    colorPrimary: "#FC6E83",
    colorText: "#E7D9D5",
    colorBackground: "#332D3B",
    colorInputBackground: "#3B363F",
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
    footerAction: "w-full flex justify-center flex-wrap gap-2",
    footerActionLink: "text-active hover:underline",
    footerActionText: "text-muted text-sm",
    identityPreviewText: "text-reading",
    identityPreviewEditButtonIcon: "text-active",
    formFieldInput: "rounded-none border-2 border-muted focus:border-active transition-none bg-background text-reading font-mono",
    formFieldLabel: "font-ui uppercase text-muted tracking-widest text-[10px]",
    userButtonPopoverCard: "bg-surface border-3 border-muted rounded-none shadow-brutal",
    userButtonPopoverActionButton: "text-reading hover:text-active hover:bg-muted transition-none",
    userButtonPopoverActionButtonText: "font-ui uppercase tracking-widest text-reading",
    userButtonPopoverActionButtonIcon: "text-active",
    userButtonPopoverFooter: "hidden",
    userPreviewMainIdentifier: "text-reading",
    userPreviewSecondaryIdentifier: "text-reading opacity-50",
    dividerRow: "hidden",
    dividerText: "hidden"
  }
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    gsap.killTweensOf(containerRef.current);
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [location.pathname]);

  return (
    <div ref={containerRef}>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/share/:id" element={<SharePage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => {
  if (!PUBLISHABLE_KEY) {
    return <AppContent />;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <AppContent />
    </ClerkProvider>
  );
};

export default App;
