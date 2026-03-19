import { Badge } from "@/components/ui/badge";

const DemoBadge = ({ className = "" }: { className?: string }) => (
  <Badge className={`bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px] uppercase tracking-wider font-bold ${className}`}>
    Demo
  </Badge>
);

export const DemoNotice = ({ message = "This is a demo — create your own to get started!" }: { message?: string }) => (
  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 mb-4">
    <p className="text-xs text-amber-400/80">{message}</p>
  </div>
);

export const DemoWatermark = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
    <span className="text-4xl font-bold text-amber-500/10 uppercase tracking-[0.3em] rotate-[-15deg] select-none">Demo Data</span>
  </div>
);

export default DemoBadge;
