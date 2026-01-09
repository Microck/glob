import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Box, Trash } from "lucide-react";
import { deleteOptimization, getStorageUsage } from "@/lib/api";

interface Optimization {
  id: string;
  original_name: string;
  original_size: number;
  optimized_size: number;
  created_at: string;
  download_url: string;
}

const History = ({ userId }: { userId: string }) => {
  const [history, setHistory] = useState<Optimization[]>([]);
  const [storageUsage, setStorageUsage] = useState<{ used: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const handleDelete = async (id: string, size: number) => {
    if (!confirm("PERMANENTLY DELETE?")) return;
    
    try {
      await deleteOptimization(id, userId);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (storageUsage) {
        setStorageUsage(prev => prev ? { ...prev, used: Math.max(0, prev.used - size) } : null);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  if (isLoading) return <div className="font-ui text-xs text-muted uppercase tracking-widest">Loading History...</div>;
  if (history.length === 0) return null;

  const usagePercent = storageUsage ? Math.min(100, (storageUsage.used / storageUsage.total) * 100) : 0;

  return (
    <div className="w-full mt-12 border-3 border-muted bg-surface p-6 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl text-reading tracking-brutal uppercase">Recent Optimizations</h2>
        {storageUsage && (
          <div className="w-1/3">
             <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted mb-1">
               <span>Storage Used</span>
               <span>{(storageUsage.used / 1024 / 1024).toFixed(0)}MB / {(storageUsage.total / 1024 / 1024).toFixed(0)}MB</span>
             </div>
             <div className="h-2 bg-muted/30 w-full">
               <div 
                 className="h-full bg-active transition-all duration-500" 
                 style={{ width: `${usagePercent}%` }}
               />
             </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b-2 border-muted pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-4">
              <Box className="w-5 h-5 text-active" />
              <div>
                <div className="font-ui text-sm text-reading truncate max-w-[200px] uppercase tracking-tighter font-bold">{item.original_name}</div>
                <div className="font-ui text-[10px] text-muted uppercase tracking-widest">
                  {formatDistanceToNow(new Date(item.created_at))} ago // {(item.optimized_size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href={item.download_url} 
                className="p-2 border-2 border-muted hover:border-active hover:text-active transition-none"
                title="Download Again"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleDelete(item.id, item.optimized_size)}
                className="p-2 border-2 border-muted hover:border-destructive hover:text-destructive transition-none"
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
