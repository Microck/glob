import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Check } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-meta";

const Success = () => {
  useDocumentTitle('Upgrade Successful');
  const [searchParams] = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");

  useEffect(() => {
    if (checkoutId) {
      console.log("Checkout successful:", checkoutId);
    }
  }, [checkoutId]);

  return (
    <PageLayout isCentered>
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto p-8 bg-surface border-3 border-active shadow-brutal relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Check className="w-32 h-32" />
        </div>
        
        <div className="w-16 h-16 bg-active text-surface flex items-center justify-center mb-6">
          <Check className="w-8 h-8" />
        </div>
        
        <h1 className="font-display text-4xl text-reading uppercase tracking-brutal mb-4">
          UPGRADE COMPLETE
        </h1>
        
        <p className="font-ui text-sm text-muted uppercase tracking-widest mb-8">
          Your account has been upgraded to Globber status. You now have access to 500MB uploads, 48h retention, and priority processing.
        </p>
        
        <div className="flex flex-col gap-4 w-full">
          <Link 
            to="/" 
            className="bg-active text-surface font-ui font-bold text-sm py-4 uppercase hover:bg-reading transition-none w-full flex items-center justify-center gap-2"
          >
            START OPTIMIZING
          </Link>
          
          <Link 
            to="/history" 
            className="border-2 border-muted text-muted font-ui text-xs py-3 uppercase hover:text-active hover:border-active transition-none w-full block"
          >
            VIEW DASHBOARD
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Success;