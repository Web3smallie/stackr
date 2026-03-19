import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, UserPlus, Users, Vote, TrendingUp, X, BarChart3, Zap,
} from "lucide-react";
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

interface VoteItem {
  id: string; token: string; votes_for: number; votes_against: number;
  total_voters: number; voted: number; status: "active" | "passed" | "rejected";
  user_voted?: "for" | "against" | null;
}

interface DemoPool {
  id: string; name: string; description: string; total_value: number;
  member_count: number; token: PoolToken; target_tokens: string[];
  my_contribution?: number; my_share?: number; is_active: boolean;
  votes?: VoteItem[];
}

const initialPools: DemoPool[] = [
  {
    id: "1", name: "Solana Alpha Fund",
    description: "Community-driven pool targeting high-potential Solana tokens",
    total_value: 245.5, member_count: 12, token: "SOL",
    target_tokens: ["BAGS", "SOL"], my_contribution: 15.2, my_share: 6.2, is_active: true,
    votes: [
      { id: "v1", token: "BAGS", votes_for: 8, votes_against: 2, total_voters: 12, voted: 10, status: "active", user_voted: null },
      { id: "v2", token: "SOL", votes_for: 11, votes_against: 1, total_voters: 12, voted: 12, status: "passed", user_voted: "for" },
    ],
  },
  {
    id: "2", name: "Stablecoin Yield Pool",
    description: "Conservative pool focused on stablecoin yields",
    total_value: 12500, member_count: 28, token: "USDC",
    target_tokens: ["USDC", "USDT"], my_contribution: 500, my_share: 4.0, is_active: true,
    votes: [
      { id: "v3", token: "USDT", votes_for: 18, votes_against: 6, total_voters: 28, voted: 24, status: "active", user_voted: null },
    ],
  },
  {
    id: "3", name: "Bags Maximalist",
    description: "All-in on BAGS token long term hold",
    total_value: 85000, member_count: 45, token: "BAGS",
    target_tokens: ["BAGS"], my_contribution: 2000, my_share: 2.35, is_active: true,
    votes: [],
  },
];

const availablePools: DemoPool[] = [
  { id: "4", name: "DeFi Explorers", description: "Exploring new DeFi protocols on Solana", total_value: 89.3, member_count: 7, token: "SOL", target_tokens: ["SOL", "BAGS"], is_active: true },
  { id: "5", name: "Micro Cap Gems", description: "Small cap token research and investment pool", total_value: 3200, member_count: 15, token: "USDC", target_tokens: ["BAGS", "SOL"], is_active: true },
];

type ViewMode = "active" | "create" | "join" | "voting";

const PoolsSection = () => {
  const [view, setView] = useState<ViewMode>("active");
  const [pools, setPools] = useState<DemoPool[]>(initialPools);
  const [selectedPool, setSelectedPool] = useState<DemoPool | null>(null);
  const [detailsPool, setDetailsPool] = useState<DemoPool | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "", description: "", token: "SOL" as PoolToken,
    target_tokens: [] as string[], min_contribution: "", pool_size_limit: "",
  });

  const toggleTargetToken = (t: string) => {
    setCreateForm(prev => ({
      ...prev,
      target_tokens: prev.target_tokens.includes(t) ? prev.target_tokens.filter(x => x !== t) : [...prev.target_tokens, t],
    }));
  };

  const handleVote = (poolId: string, voteId: string, direction: "for" | "against") => {
    setPools(prev => prev.map(pool => {
      if (pool.id !== poolId) return pool;
      return {
        ...pool,
        votes: pool.votes?.map(vote => {
          if (vote.id !== voteId || vote.user_voted) return vote;
          const newVote = {
            ...vote,
            votes_for: direction === "for" ? vote.votes_for + 1 : vote.votes_for,
            votes_against: direction === "against" ? vote.votes_against + 1 : vote.votes_against,
            voted: vote.voted + 1,
            user_voted: direction as "for" | "against",
          };
          // Check if vote should be resolved
          if (newVote.voted >= newVote.total_voters) {
            newVote.status = newVote.votes_for > newVote.votes_against ? "passed" : "rejected";
          }
          return newVote;
        }),
      };
    }));
    // Update selectedPool too
    setSelectedPool(prev => {
      if (!prev || prev.id !== poolId) return prev;
      return pools.find(p => p.id === poolId) || prev;
    });
    toast({ title: `Vote ${direction === "for" ? "For" : "Against"} registered!`, description: "Your vote has been recorded." });
  };

  // Keep selectedPool in sync
  const currentSelectedPool = selectedPool ? pools.find(p => p.id === selectedPool.id) || selectedPool : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      {/* Pool Details Modal */}
      <PoolDetailsModal pool={detailsPool} onClose={() => setDetailsPool(null)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">My Pools</h2>
          <p className="text-sm text-muted-foreground mt-1">Community investment pools — pool money, vote on tokens, share profits</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "join" ? "default" : "outline"} size="sm" onClick={() => setView(view === "join" ? "active" : "join")}>
            <UserPlus className="w-4 h-4 mr-1.5" />Join Pool
          </Button>
          <Button variant={view === "create" ? "default" : "secondary"} size="sm" onClick={() => setView(view === "create" ? "active" : "create")}>
            <Plus className="w-4 h-4 mr-1.5" />Create Pool
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Create Pool */}
        {view === "create" && (
          <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-bold text-foreground">Create New Pool</h3>
                <button onClick={() => setView("active")} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pool Name</label>
                  <Input placeholder="e.g. Solana Alpha Fund" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Pool Token</label>
                  <div className="flex gap-2">
                    {allTokens.map(t => (
                      <button key={t} onClick={() => setCreateForm({ ...createForm, token: t })} className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${createForm.token === t ? tokenColors[t] + " border-current" : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <Input placeholder="What's this pool about?" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Tokens to Invest In</label>
                <div className="flex gap-2">
                  {allTokens.map(t => (
                    <button key={t} onClick={() => toggleTargetToken(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${createForm.target_tokens.includes(t) ? tokenColors[t] + " border-current" : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Contribution ({createForm.token})</label>
                  <Input type="number" placeholder="0.5" value={createForm.min_contribution} onChange={e => setCreateForm({ ...createForm, min_contribution: e.target.value })} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Members</label>
                  <Input type="number" placeholder="50" value={createForm.pool_size_limit} onChange={e => setCreateForm({ ...createForm, pool_size_limit: e.target.value })} className="bg-secondary border-border" />
                </div>
              </div>
              <Button className="w-full" disabled={!createForm.name}>
                <Plus className="w-4 h-4 mr-1.5" />Create Pool
              </Button>
            </div>
          </motion.div>
        )}

        {/* Join Pool */}
        {view === "join" && (
          <motion.div key="join" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Available Pools</h3>
              <button onClick={() => setView("active")} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {availablePools.map(pool => (
                <div key={pool.id} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display text-base font-bold text-foreground">{pool.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{pool.description}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs border ${tokenColors[pool.token]}`}>{pool.token}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{pool.total_value.toLocaleString()} {pool.token}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pool.member_count} members</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-muted-foreground">Targets:</span>
                      {pool.target_tokens.map(t => (
                        <Badge key={t} variant="outline" className={`text-[10px] px-1.5 py-0 border ${tokenColors[t]}`}>{t}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder={`Amount (${pool.token})`} type="number" className="bg-secondary border-border flex-1" />
                      <Button size="sm"><UserPlus className="w-4 h-4 mr-1" />Join</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Voting */}
        {view === "voting" && currentSelectedPool && (
          <motion.div key="voting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Vote className="w-5 h-5 text-primary" />Votes — {currentSelectedPool.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Members vote on which tokens the pool should invest in</p>
              </div>
              <button onClick={() => { setView("active"); setSelectedPool(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            {currentSelectedPool.votes && currentSelectedPool.votes.length > 0 ? (
              <div className="space-y-3">
                {currentSelectedPool.votes.map(vote => {
                  const totalVoted = vote.votes_for + vote.votes_against;
                  const forPct = totalVoted > 0 ? (vote.votes_for / totalVoted) * 100 : 0;
                  const participationPct = (vote.voted / vote.total_voters) * 100;

                  return (
                    <div key={vote.id} className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">Buy {vote.token}?</span>
                            <Badge variant="outline" className={`text-[10px] border ${tokenColors[vote.token]}`}>{vote.token}</Badge>
                          </div>
                          <Badge variant="outline" className={`text-[10px] border ${
                            vote.status === "passed" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                            vote.status === "rejected" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}>{vote.status}</Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>For: {vote.votes_for}</span>
                            <span>Against: {vote.votes_against}</span>
                          </div>
                          <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
                            <motion.div className="h-full bg-green-500 rounded-l-full" initial={false} animate={{ width: `${forPct}%` }} transition={{ duration: 0.5 }} />
                            <motion.div className="h-full bg-red-500 rounded-r-full" initial={false} animate={{ width: `${100 - forPct}%` }} transition={{ duration: 0.5 }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs text-muted-foreground">
                            Participation: {vote.voted}/{vote.total_voters} voted ({participationPct.toFixed(0)}%)
                          </span>
                          <Progress value={participationPct} className="w-24 h-1.5 bg-secondary" />
                        </div>

                        <div className="flex gap-2">
                          {vote.status === "active" ? (
                            vote.user_voted ? (
                              <div className="w-full text-center py-2 text-sm text-muted-foreground">
                                ✓ You voted <span className={vote.user_voted === "for" ? "text-green-400" : "text-red-400"}>{vote.user_voted}</span>
                              </div>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => handleVote(currentSelectedPool.id, vote.id, "for")}>
                                  👍 Vote For
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => handleVote(currentSelectedPool.id, vote.id, "against")}>
                                  👎 Vote Against
                                </Button>
                              </>
                            )
                          ) : vote.status === "passed" ? (
                            <Button size="sm" className="w-full"><Zap className="w-4 h-4 mr-1.5" />Execute Trade</Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">No active votes for this pool.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Active Pools */}
      {(view === "active" || view === "voting") && (
        <>
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />My Active Pools
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {pools.map(pool => (
              <motion.div key={pool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-display text-base font-bold text-foreground">{pool.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{pool.description}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs border ${tokenColors[pool.token]}`}>{pool.token}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">My Contribution</p>
                      <p className="text-sm font-bold text-foreground tabular-nums">{pool.my_contribution} {pool.token}</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">My Share</p>
                      <p className="text-sm font-bold text-foreground tabular-nums">{pool.my_share}%</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pool Value</p>
                      <p className="text-sm font-bold text-foreground tabular-nums">{pool.total_value.toLocaleString()} {pool.token}</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Members</p>
                      <p className="text-sm font-bold text-foreground tabular-nums flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />{pool.member_count}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Targets:</span>
                    {pool.target_tokens.map(t => (
                      <Badge key={t} variant="outline" className={`text-[10px] px-1.5 py-0 border ${tokenColors[t]}`}>{t}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedPool(pool); setView("voting"); }}>
                      <Vote className="w-4 h-4 mr-1" />Vote
                      {pool.votes && pool.votes.filter(v => v.status === "active").length > 0 && (
                        <span className="ml-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                          {pool.votes.filter(v => v.status === "active").length}
                        </span>
                      )}
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => setDetailsPool(pool)}>
                      <TrendingUp className="w-4 h-4 mr-1" />Details
                    </Button>
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
