import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToStackrDataChanged } from "@/lib/dataSync";

interface Metric {
  label: string;
  value: string;
}

interface ChartDatum {
  day: string;
  views: number;
  payments: number;
}

interface BreakdownDatum {
  name?: string;
  token?: string;
  pct: number;
}

interface BestDayDatum {
  day: string;
  revenue: string;
}

export interface UserAnalyticsData {
  hasRealData: boolean;
  metrics: Metric[];
  weeklyData: ChartDatum[];
  trafficSources: BreakdownDatum[];
  tokenBreakdown: BreakdownDatum[];
  bestDays: BestDayDatum[];
}

const emptyState: UserAnalyticsData = {
  hasRealData: false,
  metrics: [],
  weeklyData: [],
  trafficSources: [],
  tokenBreakdown: [],
  bestDays: [],
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatRevenue = (amount: number, token: string) => `${amount.toFixed(amount % 1 === 0 ? 0 : 2)} ${token}`;

export const useUserAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState<UserAnalyticsData>(emptyState);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setData(emptyState);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [pagesResult, receivedPaymentsResult] = await Promise.all([
      supabase.from("payment_pages").select("id").eq("user_id", user.id),
      supabase
        .from("payments")
        .select("id, amount, token, from_wallet, created_at, status, page_id, to_wallet")
        .eq("status", "confirmed")
        .eq("to_wallet", user.wallet_address),
    ]);

    const pageIds = (pagesResult.data ?? []).map((page) => page.id);

    const pagePaymentsResult = pageIds.length > 0
      ? await supabase
          .from("payments")
          .select("id, amount, token, from_wallet, created_at, status, page_id, to_wallet")
          .eq("status", "confirmed")
          .in("page_id", pageIds)
      : { data: [], error: null };

    const paymentMap = new Map<string, (typeof receivedPaymentsResult.data)[number]>();

    [...(receivedPaymentsResult.data ?? []), ...(pagePaymentsResult.data ?? [])].forEach((payment) => {
      if (payment) paymentMap.set(payment.id, payment);
    });

    const payments = Array.from(paymentMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    if (payments.length === 0) {
      setData(emptyState);
      setLoading(false);
      return;
    }

    const supporters = new Set(payments.map((payment) => payment.from_wallet));
    const tokenTotals = payments.reduce<Record<string, number>>((accumulator, payment) => {
      accumulator[payment.token] = (accumulator[payment.token] ?? 0) + Number(payment.amount);
      return accumulator;
    }, {});

    const tokenCounts = payments.reduce<Record<string, number>>((accumulator, payment) => {
      accumulator[payment.token] = (accumulator[payment.token] ?? 0) + 1;
      return accumulator;
    }, {});

    const primaryToken = Object.entries(tokenTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "SOL";
    const primaryRevenue = tokenTotals[primaryToken] ?? 0;

    const weeklyCounts = weekdays.map((day) => ({ day, views: 0, payments: 0 }));
    payments.forEach((payment) => {
      const index = new Date(payment.created_at).getDay();
      weeklyCounts[index].payments += 1;
      weeklyCounts[index].views += 1;
    });

    const totalPayments = payments.length;
    const tokenBreakdown = Object.entries(tokenCounts).map(([token, count]) => ({
      token,
      pct: Math.round((count / totalPayments) * 100),
    }));

    const bestDays = Object.entries(
      payments.reduce<Record<string, Record<string, number>>>((accumulator, payment) => {
        const key = format(new Date(payment.created_at), "EEEE");
        if (!accumulator[key]) accumulator[key] = {};
        accumulator[key][payment.token] = (accumulator[key][payment.token] ?? 0) + Number(payment.amount);
        return accumulator;
      }, {}),
    )
      .map(([day, totals]) => {
        const [token, amount] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0] ?? ["SOL", 0];
        return { day, revenue: formatRevenue(amount, token) };
      })
      .slice(0, 3);

    setData({
      hasRealData: true,
      metrics: [
        { label: "Page Views", value: String(totalPayments) },
        { label: "Conversion Rate", value: `${Math.max(1, Math.round((totalPayments / Math.max(pageIds.length, 1)) * 100))}%` },
        { label: "Revenue", value: formatRevenue(primaryRevenue, primaryToken) },
        { label: "Top Supporters", value: String(supporters.size) },
      ],
      weeklyData: weeklyCounts,
      trafficSources: [{ name: "Direct", pct: 100 }],
      tokenBreakdown,
      bestDays,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchAnalytics();

    const unsubscribe = subscribeToStackrDataChanged(() => {
      void fetchAnalytics();
    });

    const interval = window.setInterval(() => {
      void fetchAnalytics();
    }, 5000);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [fetchAnalytics]);

  return {
    ...data,
    loading,
    refreshAnalytics: fetchAnalytics,
  };
};
