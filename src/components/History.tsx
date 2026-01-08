import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Box } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/history`, {
          headers: {
            'x-member-id': userId
          }
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchHistory();
  }, [userId]);

  if (isLoading) return <div className="font-ui text-xs text-muted uppercase tracking-widest">Loading History...</div>;
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-12 border-3 border-muted bg-surface p-6 relative z-10">
      <h2 className="font-display text-xl text-reading mb-6 tracking-brutal uppercase">Recent Optimizations</h2>
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
            <a 
              href={item.download_url} 
              className="p-2 border-2 border-muted hover:border-active hover:text-active transition-none"
              title="Download Again"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
