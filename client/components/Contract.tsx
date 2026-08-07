"use client";

import { useState, useCallback } from "react";
import {
  createCampaign,
  contribute,
  getFunds,
  getGoal,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-3H9a2 2 0 0 0-2 2H5" />
      <path d="M12 12v.01" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#f472b6]/30 focus-within:shadow-[0_0_20px_rgba(244,114,182,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Campaign Status Config ────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; variant: "success" | "warning" | "info" }> = {
  Active: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" },
  Funding: { color: "text-[#f472b6]", bg: "bg-[#f472b6]/10", border: "border-[#f472b6]/20", dot: "bg-[#f472b6]", variant: "warning" },
  Completed: { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", variant: "info" },
};

// ── Main Component ───────────────────────────────────────────

type Tab = "view" | "create" | "contribute";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Create campaign
  const [goalAmount, setGoalAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Contribute
  const [contributeTo, setContributeTo] = useState("");
  const [contributeAmount, setContributeAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);

  // View campaign
  const [viewCreator, setViewCreator] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [campaignData, setCampaignData] = useState<{ goal: bigint; funds: bigint } | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleCreateCampaign = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!goalAmount.trim()) return setError("Enter a goal amount");
    const goal = BigInt(goalAmount.trim());
    if (goal <= BigInt(0)) return setError("Goal must be greater than 0");
    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      await createCampaign(walletAddress, goal);
      setTxStatus("Campaign created on-chain!");
      setGoalAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, goalAmount]);

  const handleContribute = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!contributeTo.trim()) return setError("Enter campaign creator address");
    if (!contributeAmount.trim()) return setError("Enter contribution amount");
    const amount = BigInt(contributeAmount.trim());
    if (amount <= BigInt(0)) return setError("Amount must be greater than 0");
    setError(null);
    setIsContributing(true);
    setTxStatus("Awaiting signature...");
    try {
      await contribute(walletAddress, contributeTo.trim(), amount);
      setTxStatus("Contribution sent on-chain!");
      setContributeAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsContributing(false);
    }
  }, [walletAddress, contributeTo, contributeAmount]);

  const handleViewCampaign = useCallback(async () => {
    if (!viewCreator.trim()) return setError("Enter campaign creator address");
    setError(null);
    setIsViewing(true);
    setCampaignData(null);
    try {
      const [goal, funds] = await Promise.all([
        getGoal(viewCreator.trim(), walletAddress || undefined),
        getFunds(viewCreator.trim(), walletAddress || undefined),
      ]);
      if (goal === BigInt(0) && funds === BigInt(0)) {
        setError("Campaign not found");
      } else {
        setCampaignData({ goal, funds });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [viewCreator, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "view", label: "View", icon: <TargetIcon />, color: "#4fc3f7" },
    { key: "create", label: "Create", icon: <PlusIcon />, color: "#f472b6" },
    { key: "contribute", label: "Contribute", icon: <HeartIcon />, color: "#fbbf24" },
  ];

  const formatAmount = (amount: bigint) => {
    return amount.toLocaleString("en-US");
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("sent") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f472b6]/20 to-[#fbbf24]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f472b6]">
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                  <path d="M12 3v.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Crowd Funding</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setCampaignData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_campaign" params="(creator: Address)" returns="-> (goal, funds)" color="#4fc3f7" />
                <Input label="Campaign Creator Address" value={viewCreator} onChange={(e) => setViewCreator(e.target.value)} placeholder="G..." />
                <ShimmerButton onClick={handleViewCampaign} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                  {isViewing ? <><SpinnerIcon /> Fetching...</> : <><TargetIcon /> View Campaign</>}
                </ShimmerButton>

                {campaignData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Campaign Details</span>
                      {(() => {
                        const progress = campaignData.goal > BigInt(0) ? Number((campaignData.funds * BigInt(100)) / campaignData.goal) : 0;
                        const cfg = progress >= 100 ? STATUS_CONFIG.Completed : STATUS_CONFIG.Funding;
                        return (
                          <Badge variant={cfg.variant}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                            {progress >= 100 ? "Completed" : "Funding"}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Goal</span>
                        <span className="font-mono text-sm text-white/80">{formatAmount(campaignData.goal)} XLM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Raised</span>
                        <span className="font-mono text-sm text-white/80">{formatAmount(campaignData.funds)} XLM</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/35">Progress</span>
                          <span className="text-white/70 font-mono">
                            {campaignData.goal > BigInt(0) ? Number((campaignData.funds * BigInt(100)) / campaignData.goal) : 0}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#f472b6] to-[#fbbf24] transition-all duration-500"
                            style={{ 
                              width: `${campaignData.goal > BigInt(0) ? Math.min(100, Number((campaignData.funds * BigInt(100)) / campaignData.goal)) : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create */}
            {activeTab === "create" && (
              <div className="space-y-5">
                <MethodSignature name="create_campaign" params="(creator: Address, goal: i128)" color="#f472b6" />
                <p className="text-xs text-white/40">
                  Start a new crowdfunding campaign. Set your funding goal in XLM.
                </p>
                <Input 
                  label="Funding Goal (XLM)" 
                  value={goalAmount} 
                  onChange={(e) => setGoalAmount(e.target.value)} 
                  placeholder="e.g. 1000" 
                  type="number"
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleCreateCampaign} disabled={isCreating} shimmerColor="#f472b6" className="w-full">
                    {isCreating ? <><SpinnerIcon /> Creating...</> : <><PlusIcon /> Create Campaign</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f472b6]/20 bg-[#f472b6]/[0.03] py-4 text-sm text-[#f472b6]/60 hover:border-[#f472b6]/30 hover:text-[#f472b6]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to create campaign
                  </button>
                )}
              </div>
            )}

            {/* Contribute */}
            {activeTab === "contribute" && (
              <div className="space-y-5">
                <MethodSignature name="contribute" params="(from, creator, amount)" color="#fbbf24" />
                <p className="text-xs text-white/40">
                  Support a campaign by contributing XLM.
                </p>
                <Input 
                  label="Campaign Creator Address" 
                  value={contributeTo} 
                  onChange={(e) => setContributeTo(e.target.value)} 
                  placeholder="G..." 
                />
                <Input 
                  label="Contribution Amount (XLM)" 
                  value={contributeAmount} 
                  onChange={(e) => setContributeAmount(e.target.value)} 
                  placeholder="e.g. 50" 
                  type="number"
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleContribute} disabled={isContributing} shimmerColor="#fbbf24" className="w-full">
                    {isContributing ? <><SpinnerIcon /> Contributing...</> : <><HeartIcon /> Contribute</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to contribute
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Crowd Funding &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["Funding", "Active", "Completed"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn("h-1 w-1 rounded-full", STATUS_CONFIG[s]?.dot ?? "bg-white/20")} />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 2 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
