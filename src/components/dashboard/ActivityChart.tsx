export default function ActivityChart({ attempts }: { attempts: { createdAt: Date; stars: number }[] }) {
  // Simple 4-week bar chart (accessible SVG/CSS)
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const end = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    const count = attempts.filter(a => a.createdAt > start && a.createdAt <= end).length;
    return { label: `Minggu ${4 - i}`, count };
  }).reverse();

  const maxCount = Math.max(...weeks.map(w => w.count), 1);

  return (
    <div className="flex items-end h-40 gap-4" role="img" aria-label="Grafik aktivitas 4 minggu terakhir">
      {weeks.map((w, i) => {
        const height = (w.count / maxCount) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col justify-end h-full group">
            <div 
              className="bg-leaf-700 w-full rounded-t-md transition-all relative"
              style={{ height: `${Math.max(height, 5)}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-navy opacity-0 group-hover:opacity-100 transition-opacity">
                {w.count}
              </div>
            </div>
            <div className="text-center text-xs text-ink mt-2">{w.label}</div>
          </div>
        );
      })}
    </div>
  );
}
