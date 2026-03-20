import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, ExternalLink } from "lucide-react";

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

  useEffect(() => {
    const fetchPage = async () => {
      if (!username) { setNotFound(true); setLoading(false); return; }

      // Look up payment page by slug
      const { data: pageData } = await supabase
        .from("payment_pages")
        .select("*")
        .eq("slug", username)
        .eq("is_active", true)
        .maybeSingle();

      if (!pageData) { setNotFound(true); setLoading(false); return; }

      setPage(pageData as PaymentPageData);

      // Fetch creator profile
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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

          {/* Accepted tokens */}
          <div className="flex flex-wrap gap-1.5 justify-center mb-5">
            {page.accepted_tokens.map((token) => (
              <Badge key={token} variant="outline" className={`text-xs border ${tokenColors[token] || ""}`}>
                {token}
              </Badge>
            ))}
          </div>

          {/* Suggested amounts */}
          {page.suggested_amounts && page.suggested_amounts.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-5">
              {page.suggested_amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
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

          {/* Pay button */}
          <Button className="w-full h-12 text-base font-semibold" size="lg">
            <Wallet className="w-5 h-5 mr-2" />
            {selectedAmount ? `Send ${selectedAmount} SOL` : "Connect Wallet to Pay"}
          </Button>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1">
              Powered by STACKR <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
