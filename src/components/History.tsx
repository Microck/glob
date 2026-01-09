import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Box, Trash, Share2, Info, ArrowUpRight } from "lucide-react";
import { deleteOptimization, getStorageUsage, getLocalHistory, deleteLocalHistoryItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Optimization {
  id: string;
  original_name: string;
  original_size: number;
  optimized_size: number;
  created_at: string;
  download_url: string;
  is_local?: boolean;
}

const History = ({ userId }: { userId?: string }) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<Optimization[]>([]);
  const [storageUsage, setStorageUsage] = useState<{ used: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId) {
          const [historyRes, usageRes] = await Promise.all([
            fetch(`/api/history`, { headers: { 'x-member-id': userId } }),
            getStorageUsage(userId).catch(() => null)
          ]);

          if (historyRes.ok) {
            const data = await historyRes.json();
            setHistory(data);
          }
          
          if (usageRes) {
            setStorageUsage(usageRes);
          }
        } else {
          const localData = getLocalHistory();
          setHistory(localData);
          setStorageUsage(null);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleShare = (downloadUrl: string) => {
    const jobId = downloadUrl.split('/').pop();
    if (!jobId) return;
    
    const shareUrl = `${window.location.origin}/share/${jobId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "LINK COPIED",
      description: "Share link is ready to paste.",
    });
  };

  const handleDelete = async (id: string, size: number) => {
    if (!confirm("PERMANENTLY DELETE?")) return;
    
    try {
      if (userId && !id.startsWith('local-')) {
        await deleteOptimization(id, userId);
      } else {
        deleteLocalHistoryItem(id);
      }
      
      setHistory(prev => prev.filter(item => item.id !== id));
      if (storageUsage && userId) {
        setStorageUsage(prev => prev ? { ...prev, used: Math.max(0, prev.used - size) } : null);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  if (isLoading) return (
    <div className="w-full mt-12 border-3 border-muted bg-surface p-12 flex flex-col items-center justify-center relative z-10">
      <div className="font-display text-2xl text-muted animate-pulse uppercase tracking-widest">Loading...</div>
    </div>
  );

  const usagePercent = storageUsage ? Math.min(100, (storageUsage.used / storageUsage.total) * 100) : 0;

  if (history.length === 0) {
    return (
      <div className="w-full mt-12 border-3 border-muted bg-surface p-12 flex flex-col items-center justify-center relative z-10 text-center">
        <Box className="w-12 h-12 text-muted mb-6 opacity-20" />
        <h2 className="font-display text-3xl text-reading uppercase tracking-brutal mb-2">Empty Stash</h2>
        <p className="font-ui text-sm text-muted uppercase tracking-widest max-w-md">
          {userId 
            ? "You haven't optimized any models yet. Start by dropping a file on the home page."
            : "No local optimizations found. Sign in to save your work permanently."}
        </p>
        {!userId && (
          <Link to="/signup" className="mt-8 bg-active text-surface px-6 py-3 font-ui font-bold uppercase hover:bg-reading transition-none flex items-center gap-2">
            Create Account <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full mt-12 border-3 border-muted bg-surface p-6 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b-3 border-muted pb-6">
        <div>
          <h2 className="font-display text-2xl text-reading tracking-brutal uppercase">
            {userId ? "Recent Optimizations" : "Guest Stash"}
          </h2>
          {!userId && (
            <div className="flex items-center gap-2 text-active font-ui text-[10px] uppercase tracking-widest mt-1">
              <Info className="w-3 h-3" />
              Temporary browser storage (last 10 models)
            </div>
          )}
        </div>
        
        {storageUsage && userId ? (
          <div className="w-full md:w-1/3">
             <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted mb-1 font-bold">
               <span>Vault Capacity</span>
               <span>{(storageUsage.used / 1024 / 1024).toFixed(0)}MB / {(storageUsage.total / 1024 / 1024).toFixed(0)}MB</span>
             </div>
             <div className="h-3 bg-muted/30 w-full border-2 border-muted p-[2px]">
               <div 
                 className="h-full bg-active transition-all duration-500" 
                 style={{ width: `${usagePercent}%` }}
               />
             </div>
          </div>
        ) : (
          <Link to="/signup" className="border-2 border-active text-active px-4 py-2 font-ui text-xs font-bold uppercase hover:bg-active hover:text-surface transition-none">
            Upgrade to persistent vault
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b-2 border-muted/50 pb-4 last:border-0 last:pb-0 group">
            <div className="flex items-center gap-4">
              <Box className="w-5 h-5 text-active group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-ui text-sm text-reading truncate max-w-[200px] md:max-w-md uppercase tracking-tighter font-bold">{item.original_name}</div>
                <div className="font-ui text-[10px] text-muted uppercase tracking-widest">
                  {formatDistanceToNow(new Date(item.created_at))} ago // {(item.optimized_size / 1024 / 1024).toFixed(2)} MB
                  {item.is_local && " // LOCAL"}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleShare(item.download_url)}
                className="p-2 border-2 border-muted hover:border-active hover:text-active transition-none bg-surface"
                title="Copy Share Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <a 
                href={item.download_url} 
                className="p-2 border-2 border-muted hover:border-active hover:text-active transition-none bg-surface"
                title="Download Again"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleDelete(item.id, item.optimized_size)}
                className="p-2 border-2 border-muted hover:border-destructive hover:text-destructive transition-none bg-surface"
                title="Delete Forever"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
