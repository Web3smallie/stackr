import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Link2,
  ArrowDownUp,
  Settings,
  LogOut,
  Plus,
  Copy,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Link2, label: "My Stacks" },
  { icon: ArrowDownUp, label: "Transactions" },
  { icon: Settings, label: "Settings" },
];

const transactions = [
  { id: 1, from: "@bags_user", amount: "4.20", currency: "SOL", time: "2 mins ago", status: "success" as const },
  { id: 2, from: "@cryptodev", amount: "12.50", currency: "USDC", time: "15 mins ago", status: "success" as const },
  { id: 3, from: "@nft_queen", amount: "1.00", currency: "SOL", time: "1 hour ago", status: "pending" as const },
  { id: 4, from: "@web3_builder", amount: "25.00", currency: "USDC", time: "3 hours ago", status: "success" as const },
  { id: 5, from: "@solana_fan", amount: "0.50", currency: "SOL", time: "5 hours ago", status: "success" as const },
];

const stacks = [
  { id: 1, name: "Tips", description: "General tips", earned: "42.50", currency: "SOL", link: "stackr.fm/tips" },
  { id: 2, name: "Commissions", description: "Design work", earned: "180.00", currency: "USDC", link: "stackr.fm/commissions" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const Dashboard = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [stackName, setStackName] = useState("");
  const [stackDesc, setStackDesc] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border flex-col justify-between py-6 px-4 bg-background fixed h-screen">
        <div>
          <span
            className="font-display text-xl font-bold text-foreground px-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            STACKR
          </span>
          <nav className="mt-8 flex flex-col gap-1">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  link.active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3">
          <div className="ledger-divider mb-4" />
          <button className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-60">
        {/* Top Bar */}
        <header className="border-b border-border px-6 md:px-8 h-16 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <span className="md:hidden font-display text-lg font-bold text-foreground" onClick={() => navigate("/")}>STACKR</span>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">@creator_handle</span>
            <Button variant="wallet" size="sm">
              <Wallet className="w-4 h-4 mr-1" />
              7xK...4mD
            </Button>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-5xl">
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Balance Section */}
            <motion.div variants={item} className="mb-8">
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-6xl font-bold text-foreground tabular-nums">
                  43.20
                </span>
                <span className="text-xl text-muted-foreground font-medium">SOL</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 tabular-nums">≈ $6,912.00 USD</p>
            </motion.div>

            <div className="ledger-divider mb-8" />

            {/* My Stacks */}
            <motion.div variants={item} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">My Stacks</h2>
                <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
                  <Plus className="w-4 h-4 mr-1" />
                  New Stack
                </Button>
              </div>

              {/* Create Stack Form */}
              {showCreate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-border rounded-xl p-5 mb-4 bg-card"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground mb-4">Create Payment Link</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Stack name (e.g. Tips)"
                      value={stackName}
                      onChange={(e) => setStackName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={stackDesc}
                      onChange={(e) => setStackDesc(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setShowCreate(false)}>Create Stack</Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stack Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {stacks.map((stack) => (
                  <div
                    key={stack.id}
                    className="border border-border rounded-xl p-5 bg-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out-expo cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display text-sm font-semibold text-foreground">{stack.name}</h4>
                        <p className="text-xs text-muted-foreground">{stack.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="ledger-divider mb-3" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-2xl font-bold text-foreground tabular-nums">{stack.earned}</span>
                      <span className="text-xs text-muted-foreground">{stack.currency}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stack.link}</p>
                  </div>
                ))}
              </div>

              {stacks.length === 0 && (
                <div className="border border-dashed border-border rounded-xl p-8 text-center">
                  <p className="text-sm text-muted-foreground">No stacks yet. Create your first payment link to start earning.</p>
                </div>
              )}
            </motion.div>

            <div className="ledger-divider mb-8" />

            {/* Recent Transactions */}
            <motion.div variants={item}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                {transactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between px-5 py-3.5 ${
                      i < transactions.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          tx.status === "success" ? "bg-success" : "bg-pending animate-pulse-slow"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-foreground">
                          Received <span className="font-medium tabular-nums">{tx.amount} {tx.currency}</span> from{" "}
                          <span className="font-medium">{tx.from}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.time}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        tx.status === "success"
                          ? "bg-success/10 text-success"
                          : "bg-pending/10 text-pending"
                      }`}
                    >
                      {tx.status === "success" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
