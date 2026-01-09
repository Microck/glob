import PageLayout from "@/components/PageLayout";
import History from "@/components/History";
import { useSafeAuth } from "@/hooks/use-safe-auth";
import { Navigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-meta";

const HistoryPage = () => {
  const { userId, isLoaded } = useSafeAuth();
  useDocumentTitle('Dashboard - Optimization History');

  if (!isLoaded) return null;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto w-full py-12 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h1 className="font-display text-5xl md:text-6xl text-active uppercase tracking-brutal leading-none">
              DASHBOARD
            </h1>
            <p className="font-ui text-sm text-muted mt-4 uppercase tracking-widest">
              {userId 
                ? "Manage your optimized assets and storage quota." 
                : "View your local session optimizations."}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <History userId={userId || undefined} />
          
          <div className="border-3 border-muted p-6 bg-surface/50">
             <h3 className="font-display text-lg text-reading uppercase tracking-wider mb-3">Storage Info</h3>
             <ul className="space-y-2 font-ui text-[11px] text-muted uppercase tracking-widest">
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-active" />
                 {userId ? "Globber tier grants 1GB persistent storage" : "Create account for 1GB persistent storage"}
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-active" />
                 Assets are kept for 48 hours or until quota full
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-active" />
                 {userId ? "Delete old models to process larger batches" : "Local session stores up to 10 recent models"}
               </li>
             </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HistoryPage;
