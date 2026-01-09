import PageLayout from "@/components/PageLayout";
import History from "@/components/History";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const HistoryPage = () => {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!userId) return <Navigate to="/login" replace />;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto w-full py-12 px-6">
        <h1 className="font-display text-4xl text-active uppercase tracking-brutal mb-8">
          Your Dashboard
        </h1>
        <History userId={userId} />
      </div>
    </PageLayout>
  );
};

export default HistoryPage;
