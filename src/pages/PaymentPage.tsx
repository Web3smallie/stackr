import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wallet, ExternalLink, Check, PartyPopper, Share2, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { processPayment } from "@/lib/payments";
import { APP_URL } from "@/lib/appUrl";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

interface PaymentPageData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  accepted_tokens: string[];
  suggested_amounts: number[] | null;
  is_active: boolean;
  user_id: string;
}

interface CreatorProfile {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  wallet_address: string;
}

const PaymentPage = () => {
  const { username } = useParams<{ username: string }>();
  const [page, setPage] = useState<PaymentPageData | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string>("SOL");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const { publicKey, connected, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  useEffect(() => {
    const fetchPage = async () => {
      if (!username) { setNotFound(true); setLoading(false); return; }

      const { data: pageData } = await supabase
        .from("payment_pages")
        .select("*")
        .eq("slug", username)
        .eq("is_active", true)
        .maybeSingle();

      if (!pageData) { setNotFound(true); setLoading(false); return; }

      setPage(pageData as PaymentPageData);
      if (pageData.accepted_tokens?.length) {
        setSelectedToken(pageData.accepted_tokens[0]);
      }

      const { data: userData } = await supabase
        .from("users")
        .select("display_name, username, avatar_url, wallet_address")
        .eq("id", pageData.user_id)
        .maybeSingle();

      if (userData) setCreator(userData);
      setLoading(false);
    };

    fetchPage();
  }, [username]);

  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);
  const platformFee = finalAmount * 0.01;
  const treasuryFee = finalAmount * 0.005;
  const bagsFee = finalAmount * 0.005;
  const creatorAmount = finalAmount - platformFee;

  const handleConnectOrPay = useCallback(async () => {
    if (!connected) {
      setVisible(true);
      return;
    }

    if (!finalAmount || finalAmount <= 0 || !creator || !publicKey || !signTransaction) return;

    setSending(true);
    try {
      // 1. Register with backend (Bags fee sharing + record payment)
      const result = await processPayment({
        amount: finalAmount,
        token: selectedToken as "SOL" | "USDC" | "USDT" | "BAGS",
        from_wallet: publicKey.toBase58(),
        to_wallet: creator.wallet_address,
        page_id: page?.id,
        message: message || undefined,
        is_anonymous: false,
      });

      if (!result.success) throw new Error("Payment registration failed");

      // 2. Build and sign Solana transaction (SOL only for now)
      const creatorPubkey = new PublicKey(creator.wallet_address);
      const treasuryPubkey = new PublicKey(result.transactionPlan.treasuryWallet);

      const transaction = new Transaction();

      // Creator transfer (99%)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: creatorPubkey,
          lamports: Math.round(creatorAmount * LAMPORTS_PER_SOL),
        })
      );

      // Platform fee transfer (0.5% to treasury — other 0.5% handled via Bags API)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports: Math.round(treasuryFee * LAMPORTS_PER_SOL),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      setTxSignature(signature);
      setSuccess(true);
    } catch (err: any) {
      console.error("Payment error:", err);
      // Don't show error for user rejection
      if (err?.message?.includes("User rejected")) return;
    } finally {
      setSending(false);
    }
  }, [connected, finalAmount, creator, publicKey, signTransaction, selectedToken, message, page, connection, setVisible, creatorAmount, platformFee, treasuryFee]);

  const handleShare = async () => {
    const text = `I just supported ${creator?.display_name || creator?.username || "a creator"} on STACKR! 🚀`;
    const url = `${APP_URL}/${page?.slug}`;
    if (navigator.share) {
      await navigator.share({ title: "STACKR Payment", text, url });
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          The payment page <span className="font-mono text-accent">/{username}</span> doesn't exist or has been deactivated.
        </p>
        <Link to="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go to STACKR
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-primary/30 bg-card p-8 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Sent! 🎉</h1>
            <p className="text-muted-foreground mb-1">
              You sent <span className="font-semibold text-foreground">{finalAmount} {selectedToken}</span> to{" "}
              <span className="font-semibold text-foreground">{creator?.display_name || creator?.username || "creator"}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Platform fee: {platformFee.toFixed(4)} {selectedToken} (1%)
            </p>

            {txSignature && (
              <a
                href={`https://solscan.io/tx/${txSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mb-6"
              >
                View on Solscan <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="flex gap-3 mt-4">
              <Button className="flex-1" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
              Powered by STACKR <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Left: Payment Form */}
        <div className="w-full lg:w-[420px] shrink-0">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          {/* Creator info */}
          <div className="text-center mb-6">
            {creator?.avatar_url ? (
              <img src={creator.avatar_url} alt="" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary/30" />
            ) : (
              <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-primary/20 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-primary" />
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground">{page.title}</h1>
            {creator && (
              <p className="text-sm text-muted-foreground mt-1">
                by {creator.display_name || creator.username || creator.wallet_address.slice(0, 8) + "..."}
              </p>
            )}
            {page.description && (
              <p className="text-sm text-muted-foreground mt-2">{page.description}</p>
            )}
          </div>

          {/* Token selector */}
          <div className="flex flex-wrap gap-1.5 justify-center mb-5">
            {page.accepted_tokens.map((token) => (
              <button
                key={token}
                onClick={() => setSelectedToken(token)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedToken === token
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : `border ${tokenColors[token] || "border-border"}`
                }`}
              >
                {token}
              </button>
            ))}
          </div>

          {/* Suggested amounts */}
          {page.suggested_amounts && page.suggested_amounts.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {page.suggested_amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    selectedAmount === amount
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-secondary text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          )}

          {/* Custom amount */}
          <Input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            className="mb-4 bg-secondary border-border"
            min="0"
            step="0.01"
          />

          {/* Optional message */}
          <Input
            placeholder="Add a message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-4 bg-secondary border-border"
            maxLength={200}
          />

          {/* Fee breakdown */}
          {connected && finalAmount > 0 && (
            <div className="rounded-xl bg-secondary/60 border border-border p-3 mb-4 text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Creator receives</span>
                <span className="text-foreground font-medium">{creatorAmount.toFixed(4)} {selectedToken}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform fee (1%)</span>
                <span>{platformFee.toFixed(4)} {selectedToken}</span>
              </div>
              <div className="pl-3 space-y-0.5 text-[11px] text-muted-foreground/70">
                <div className="flex justify-between">
                  <span>↳ Treasury (0.5%)</span>
                  <span>{treasuryFee.toFixed(4)} {selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>↳ Bags.fm (0.5%)</span>
                  <span>{bagsFee.toFixed(4)} {selectedToken}</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1 mt-1">
                <span>Total</span>
                <span>{finalAmount} {selectedToken}</span>
              </div>
            </div>
          )}

          {/* Pay button */}
          <Button
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={handleConnectOrPay}
            disabled={sending || (connected && finalAmount <= 0)}
          >
            {sending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Confirming...</>
            ) : !connected ? (
              <><Wallet className="w-5 h-5 mr-2" />Connect Wallet to Pay</>
            ) : finalAmount > 0 ? (
              <><Check className="w-5 h-5 mr-2" />Send {finalAmount} {selectedToken}</>
            ) : (
              "Select an amount"
            )}
          </Button>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
              Powered by STACKR <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
        </div>

        {/* Right: Jupiter Swap Widget */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="text-center mb-4">
            <p className="text-sm font-semibold text-foreground">Support the Bags.fm ecosystem</p>
            <p className="text-xs text-muted-foreground mt-1">Swap here to pay with BAGS</p>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div id="jupiter-terminal" className="min-h-[400px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
