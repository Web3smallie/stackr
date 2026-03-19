import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, Users, Vote, TrendingUp, X, BarChart3, Zap, Search, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PoolDetailsModal from "@/components/PoolDetailsModal";
import { toast } from "@/hooks/use-toast";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const allTokens = ["SOL", "USDC", "USDT", "BAGS"] as const;
type PoolToken = (typeof allTokens)[number];
type VoteDirection = "for" | "against";

interface VoteItem {
  id: string;
  token: string;
  votes_for: number;
  votes_against: number;
  total_voters: number;
  voted: number;
  status: "active" | "passed" | "rejected";
  user_voted?: VoteDirection | null;
}

interface DemoPool {
  id: string;
  name: string;
  description: string;
  total_value: number;
  member_count: number;
  token: PoolToken;
  target_tokens: string[];
  my_contribution?: number;
  my_share?: number;
  is_active: boolean;
  votes?: VoteItem[];
}

const initialPools: DemoPool[] = [
  {
    id: "1", name: "Solana Alpha Fund", description: "Community-driven pool targeting high-potential Solana tokens",
    total_value: 245.5, member_count: 12, token: "SOL", target_tokens: ["BAGS", "SOL"],
    my_contribution: 15.2, my_share: 6.2, is_active: true,
    votes: [
      { id: "v1", token: "BAGS", votes_for: 8, votes_against: 2, total_voters: 12, voted: 10, status: "active", user_voted: null },
      { id: "v2", token: "SOL", votes_for: 11, votes_against: 1, total_voters: 12, voted: 12, status: "passed", user_voted: "for" },
    ],
  },
  {
    id: "2", name: "Stablecoin Yield Pool", description: "Conservative pool focused on stablecoin yields",
    total_value: 12500, member_count: 28, token: "USDC", target_tokens: ["USDC", "USDT"],
    my_contribution: 500, my_share: 4, is_active: true,
    votes: [{ id: "v3", token: "USDT", votes_for: 18, votes_against: 6, total_voters: 28, voted: 24, status: "active", user_voted: null }],
  },
];

const browsePools: DemoPool[] = [
  { id: "4", name: "DeFi Explorers", description: "Exploring new DeFi protocols on Solana", total_value: 89.3, member_count: 7, token: "SOL", target_tokens: ["SOL", "BAGS"], is_active: true },
  { id: "5", name: "Micro Cap Gems", description: "Small cap token research and investment pool", total_value: 3200, member_count: 15, token: "USDC", target_tokens: ["BAGS", "SOL"], is_active: true },
];

type ViewMode = "active" | "create" | "join" | "voting";

const PoolsSection = () => {
  const [view, setView] = useState<ViewMode>("active");
  const [pools, setPools] = useState<DemoPool[]>(initialPools);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [detailsPool, setDetailsPool] = useState<DemoPool | null>(null);
  const [joinAmounts, setJoinAmounts] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", token: "SOL" as PoolToken, target_tokens: [] as string[], min_contribution: "", pool_size_limit: "" });

  const selectedPool = useMemo(() => pools.find((pool) => pool.id === selectedPoolId) ?? null, [pools, selectedPoolId]);

  const filteredPools = useMemo(() => {
    if (!searchQuery.trim()) return pools;
    return pools.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pools, searchQuery]);

  const toggleTargetToken = (token: string) => {
    setCreateForm((prev) => ({
      ...prev,
      target_tokens: prev.target_tokens.includes(token) ? prev.target_tokens.filter((item) => item !== token) : [...prev.target_tokens, token],
    }));
  };

  const createPool = () => {
    if (!createForm.name) {
      toast({ title: "Add a pool name", variant: "destructive" });
      return;
    }
    setCreating(true);
    setTimeout(() => {
      toast({ title: "Pool created!", description: `${createForm.name} is ready to share.` });
      setCreateForm({ name: "", description: "", token: "SOL", target_tokens: [], min_contribution: "", pool_size_limit: "" });
      setView("active");
      setCreating(false);
    }, 600);
  };

  const joinPool = (pool: DemoPool) => {
    const amount = joinAmounts[pool.id];
    if (!amount || Number(amount) <= 0) {
      toast({ title: "Enter a valid contribution", variant: "destructive" });
      return;
    }
    toast({ title: "Pool joined!", description: `${amount} ${pool.token} committed to ${pool.name}.` });
  };

  const handleVote = (poolId: string, voteId: string, direction: VoteDirection) => {
    setPools((prev) =>
      prev.map((pool) => {
        if (pool.id !== poolId) return pool;
        return {
          ...pool,
          votes: pool.votes?.map((vote) => {
            if (vote.id !== voteId || vote.user_voted) return vote;
            const votesFor = direction === "for" ? vote.votes_for + 1 : vote.votes_for;
            const votesAgainst = direction === "against" ? vote.votes_against + 1 : vote.votes_against;
            const voted = vote.voted + 1;
            const status = voted >= vote.total_voters ? (votesFor > votesAgainst ? "passed" : "rejected") : vote.status;
            return { ...vote, votes_for: votesFor, votes_against: votesAgainst, voted, status, user_voted: direction };
          }),
        };
      }),
    );
    toast({ title: "Vote recorded!", description: `You voted ${direction}. Progress bar updated.` });
  };

  const leavePool = (poolId: string) => {
    setPools((prev) => prev.filter((pool) => pool.id !== poolId));
    setSelectedPoolId(null);
    setConfirmLeaveId(null);
    toast({ title: "Pool left!", description: "Your contribution will be returned." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <PoolDetailsModal pool={detailsPool} onClose={() => setDetailsPool(null)} onLeavePool={leavePool} />

      {/* Leave pool confirmation dialog */}
      {confirmLeaveId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-destructive/30 bg-card p-6 shadow-[0_0_40px_hsl(var(--destructive)/0.15)]">
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Leave Pool?</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to leave this pool? Your contribution will be returned.</p>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmLeaveId(null)}>Cancel</Button>
              <button
                type="button"
                onClick={() => leavePool(confirmLeaveId)}
                className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Confirm Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">My Pools</h2>
          <p className="text-sm text-muted-foreground mt-1">Pool money, vote on token moves and track your share.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setView(view === "join" ? "active" : "join")}><UserPlus className="w-4 h-4 mr-1.5" />Join Pool</Button>
          <Button size="sm" onClick={() => setView(view === "create" ? "active" : "create")}><Plus className="w-4 h-4 mr-1.5" />Create Pool</Button>
        </div>
      </div>

      {/* Search bar */}
      {(view === "active" || view === "voting") && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary border-border pl-10"
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "create" && (
          <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-bold text-foreground">Create New Pool</h3>
                <Button variant="ghost" size="sm" onClick={() => setView("active")}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Input placeholder="Pool name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="bg-secondary border-border" />
                <Input placeholder="Minimum contribution" type="number" value={createForm.min_contribution} onChange={(e) => setCreateForm({ ...createForm, min_contribution: e.target.value })} className="bg-secondary border-border" />
              </div>
              <Input placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="bg-secondary border-border mb-4" />
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="grid grid-cols-4 gap-2">
                  {allTokens.map((token) => (
                    <button key={token} type="button" onClick={() => setCreateForm({ ...createForm, token })} className={`rounded-lg px-2 py-2 text-xs font-semibold border transition-all ${createForm.token === token ? "border-primary/60 bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground hover:border-primary/40"}`}>{token}</button>
                  ))}
                </div>
                <Input placeholder="Pool size limit" type="number" value={createForm.pool_size_limit} onChange={(e) => setCreateForm({ ...createForm, pool_size_limit: e.target.value })} className="bg-secondary border-border" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">Target tokens to invest in:</p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {allTokens.map((token) => (
                  <button key={token} type="button" onClick={() => toggleTargetToken(token)} className={`rounded-lg px-2 py-2 text-xs font-semibold border transition-all ${createForm.target_tokens.includes(token) ? "border-primary/60 bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.24)]" : "border-border bg-secondary text-muted-foreground hover:border-primary/40"}`}>{token}</button>
                ))}
              </div>
              <Button className="w-full" onClick={createPool} disabled={creating}>
                {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Pool"}
              </Button>
            </div>
          </motion.div>
        )}

        {view === "join" && (
          <motion.div key="join" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
            <div className="space-y-3">
              {browsePools.map((pool) => (
                <div key={pool.id} className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-70" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div><h4 className="font-display text-base font-bold text-foreground">{pool.name}</h4><p className="text-xs text-muted-foreground mt-0.5">{pool.description}</p></div>
                      <Badge variant="outline" className={`text-xs border ${tokenColors[pool.token]}`}>{pool.token}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                      <span>{pool.total_value.toLocaleString()} {pool.token}</span>
                      <span>{pool.member_count} members</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">{pool.target_tokens.map((token) => <Badge key={token} variant="outline" className={`text-[10px] border ${tokenColors[token]}`}>{token}</Badge>)}</div>
                    <div className="flex gap-2">
                      <Input placeholder={`Amount (${pool.token})`} type="number" className="bg-secondary border-border flex-1" value={joinAmounts[pool.id] ?? ""} onChange={(e) => setJoinAmounts((prev) => ({ ...prev, [pool.id]: e.target.value }))} />
                      <Button size="sm" onClick={() => joinPool(pool)}><UserPlus className="w-4 h-4 mr-1" />Join</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === "voting" && selectedPool && (
          <motion.div key="voting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2"><Vote className="w-5 h-5 text-primary" />Votes — {selectedPool.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Members vote on which tokens the pool should buy next.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setView("active")}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              {selectedPool.votes?.map((vote) => {
                const totalVotes = vote.votes_for + vote.votes_against;
                const forPct = totalVotes > 0 ? (vote.votes_for / totalVotes) * 100 : 0;
                const participationPct = (vote.voted / vote.total_voters) * 100;
                return (
                  <div key={vote.id} className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2"><span className="text-sm font-semibold text-foreground">Buy {vote.token}?</span><Badge variant="outline" className={`text-[10px] border ${tokenColors[vote.token]}`}>{vote.token}</Badge></div>
                        <Badge variant="outline" className={`text-[10px] border-primary/30 ${vote.status === "passed" ? "bg-green-500/10 text-green-400" : vote.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-accent"}`}>{vote.status}</Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>For: {vote.votes_for}</span><span>Against: {vote.votes_against}</span></div>
                        <div className="h-3 rounded-full bg-secondary overflow-hidden flex"><motion.div className="h-full bg-primary" initial={false} animate={{ width: `${forPct}%` }} transition={{ duration: 0.5 }} /><motion.div className="h-full bg-muted" initial={false} animate={{ width: `${100 - forPct}%` }} transition={{ duration: 0.5 }} /></div>
                      </div>
                      <div className="flex items-center justify-between mb-4"><span className="text-xs text-muted-foreground">Participation: {vote.voted}/{vote.total_voters}</span><Progress value={participationPct} className="w-24 h-1.5 bg-secondary" /></div>
                      <div className="flex gap-2">
                        {!vote.user_voted && vote.status === "active" && (
                          <>
                            <Button size="sm" className="flex-1" onClick={() => handleVote(selectedPool.id, vote.id, "for")}>Vote For</Button>
                            <Button size="sm" className="flex-1" onClick={() => handleVote(selectedPool.id, vote.id, "against")}>Vote Against</Button>
                          </>
                        )}
                        {vote.user_voted && <div className="w-full text-center py-2 text-sm text-muted-foreground">✓ You voted {vote.user_voted}</div>}
                        {vote.status === "passed" && (
                          <Button size="sm" className="w-full" onClick={() => toast({ title: "Trade executed!", description: `Buy ${vote.token} trade submitted to the pool.` })}>
                            <Zap className="w-4 h-4 mr-1.5" />Execute Trade
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(view === "active" || view === "voting") && (
        <>
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />My Active Pools</h3>
          {filteredPools.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No pools found matching "{searchQuery}"</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredPools.map((pool) => (
              <motion.div key={pool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-70" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div><h4 className="font-display text-base font-bold text-foreground">{pool.name}</h4><p className="text-xs text-muted-foreground mt-0.5">{pool.description}</p></div>
                    <Badge variant="outline" className={`text-xs border ${tokenColors[pool.token]}`}>{pool.token}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-secondary p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">My Contribution</p><p className="text-sm font-bold text-foreground">{pool.my_contribution} {pool.token}</p></div>
                    <div className="rounded-xl bg-secondary p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">My Share</p><p className="text-sm font-bold text-foreground">{pool.my_share}%</p></div>
                    <div className="rounded-xl bg-secondary p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pool Value</p><p className="text-sm font-bold text-foreground">{pool.total_value.toLocaleString()} {pool.token}</p></div>
                    <div className="rounded-xl bg-secondary p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Members</p><p className="text-sm font-bold text-foreground flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground" />{pool.member_count}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">{pool.target_tokens.map((token) => <Badge key={token} variant="outline" className={`text-[10px] border ${tokenColors[token]}`}>{token}</Badge>)}</div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => { setSelectedPoolId(pool.id); setView("voting"); }}><Vote className="w-4 h-4 mr-1" />Vote</Button>
                    <Button size="sm" className="flex-1" onClick={() => setDetailsPool(pool)}><TrendingUp className="w-4 h-4 mr-1" />Details</Button>
                    <button
                      type="button"
                      onClick={() => setConfirmLeaveId(pool.id)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />Leave
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PoolsSection;