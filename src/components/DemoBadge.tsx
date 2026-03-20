import { Badge } from "@/components/ui/badge";

const DemoBadge = ({ className = "" }: { className?: string }) => (
  <Badge className={`bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px] uppercase tracking-wider font-bold ${className}`}>
    Demo
  </Badge>
);

export default DemoBadge;
