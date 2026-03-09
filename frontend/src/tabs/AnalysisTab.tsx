export default function AnalysisTab() {
  const metrics = [
    {
      label: "Total Applications",
      value: "142",
      color: "text-blue-400",
      bg: "border-blue-900",
    },
    {
      label: "Interviews Scheduled",
      value: "18",
      color: "text-green-400",
      bg: "border-green-900",
    },
    {
      label: "Offers Received",
      value: "3",
      color: "text-yellow-400",
      bg: "border-yellow-900",
    },
    {
      label: "Rejected",
      value: "47",
      color: "text-red-400",
      bg: "border-red-900",
    },
  ];
  const bars = [
    { label: "Jan", value: 60, color: "bg-blue-600" },
    { label: "Feb", value: 85, color: "bg-blue-500" },
    { label: "Mar", value: 45, color: "bg-blue-600" },
    { label: "Apr", value: 90, color: "bg-blue-400" },
    { label: "May", value: 70, color: "bg-blue-600" },
    { label: "Jun", value: 55, color: "bg-blue-600" },
  ];
  const pipeline = [
    { stage: "Applied", count: 142, pct: 100 },
    { stage: "Reviewed", count: 89, pct: 63 },
    { stage: "Phone Screen", count: 34, pct: 24 },
    { stage: "Interview", count: 18, pct: 13 },
    { stage: "Offer", count: 3, pct: 2 },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-5">Analysis</h2>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`bg-[#0d0d0d] border ${m.bg} rounded-lg p-4`}
          >
            <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-4 mb-4">
        <div className="text-sm text-gray-400 mb-3 font-medium">
          Monthly Applications
        </div>
        <div className="flex items-end gap-2 h-28">
          {bars.map((b) => (
            <div
              key={b.label}
              className="flex flex-col items-center flex-1 gap-1"
            >
              <div
                className={`w-full ${b.color} hover:opacity-80 rounded-t transition-opacity`}
                style={{ height: `${b.value}%` }}
              />
              <span className="text-xs text-gray-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-3 font-medium">
          Application Pipeline
        </div>
        <div className="space-y-2">
          {pipeline.map((p) => (
            <div key={p.stage}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{p.stage}</span>
                <span>{p.count}</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
