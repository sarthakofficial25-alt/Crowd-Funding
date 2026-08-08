"use client";

import { useState, useCallback } from "react";
import {
  createCampaign,
  contribute,
  getCampaign,
  getCampaignCount,
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
  Funded: { color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20", dot: "bg-[#fbbf24]", variant: "warning" },
  Withdrawn: { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", variant: "info" },
  Completed: { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", variant: "info" },
  Cancelled: { color: "text-[#f87171]", bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", dot: "bg-[#f87171]", variant: "warning" },
};

// ── Campaign status label helper ─────────────────────────────

function getCampaignStatusLabel(status: unknown): string {
  if (typeof status === "string") return status;
  if (status && typeof status === "object" && "tag" in (status as Record<string, unknown>)) {
    return (status as { tag: string }).tag;
  }
  // Soroban may return status as an object like { Active: undefined }
  if (status && typeof status === "object") {
    const keys = Object.keys(status as Record<string, unknown>);
    if (keys.length > 0) return keys[0];
  }
  return "Active";
}

// ── Main Component ───────────────────────────────────────────

type Tab = "view" | "create" | "contribute";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

interface CampaignData {
  creator: string;
  title: string;
  goal: bigint;
  raised: bigint;
  deadline: number;
  status: string;
  contributor_count: number;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Create campaign
  const [campaignTitle, setCampaignTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Contribute
  const [contributeCampaignId, setContributeCampaignId] = useState("");
  const [contributeAmount, setContributeAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);

  // View campaign
  const [viewCampaignId, setViewCampaignId] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [campaignCount, setCampaignCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleCreateCampaign = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!campaignTitle.trim()) return setError("Enter a campaign title");
    if (!goalAmount.trim()) return setError("Enter a goal amount");
    const goal = BigInt(goalAmount.trim());
    if (goal <= BigInt(0)) return setError("Goal must be greater than 0");
    // Compute deadline as current ledger timestamp + days in seconds
    const days = parseInt(deadlineDays.trim() || "30", 10);
    if (days <= 0) return setError("Deadline must be at least 1 day");
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + days * 86400;
    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      await createCampaign(walletAddress, campaignTitle.trim(), goal, deadlineTimestamp);
      setTxStatus("Campaign created on-chain!");
      setCampaignTitle("");
      setGoalAmount("");
      setDeadlineDays("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, campaignTitle, goalAmount, deadlineDays]);

  const handleContribute = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (contributeCampaignId.trim() === "") return setError("Enter a Campaign ID");
    const campaignId = parseInt(contributeCampaignId.trim(), 10);
    if (isNaN(campaignId) || campaignId < 0) return setError("Campaign ID must be a non-negative number");
    if (!contributeAmount.trim()) return setError("Enter contribution amount");
    const amount = BigInt(contributeAmount.trim());
    if (amount <= BigInt(0)) return setError("Amount must be greater than 0");
    setError(null);
    setIsContributing(true);
    setTxStatus("Awaiting signature...");
    try {
      await contribute(walletAddress, campaignId, amount);
      setTxStatus("Contribution sent on-chain!");
      setContributeAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsContributing(false);
    }
  }, [walletAddress, contributeCampaignId, contributeAmount]);

  const handleViewCampaign = useCallback(async () => {
    if (viewCampaignId.trim() === "") return setError("Enter a Campaign ID");
    const campaignId = parseInt(viewCampaignId.trim(), 10);
    if (isNaN(campaignId) || campaignId < 0) return setError("Campaign ID must be a non-negative number");
    setError(null);
    setIsViewing(true);
    setCampaignData(null);
    try {
      const raw = await getCampaign(campaignId, walletAddress || undefined);
      if (!raw) {
        setError("Campaign not found");
      } else {
        // Parse the raw result from Soroban
        const data: CampaignData = {
          creator: typeof raw.creator === "string" ? raw.creator : String(raw.creator),
          title: typeof raw.title === "string" ? raw.title : String(raw.title ?? ""),
          goal: BigInt(raw.goal ?? 0),
          raised: BigInt(raw.raised ?? 0),
          deadline: Number(raw.deadline ?? 0),
          status: getCampaignStatusLabel(raw.status),
          contributor_count: Number(raw.contributor_count ?? 0),
        };
        setCampaignData(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [viewCampaignId, walletAddress]);

  const handleLoadCampaignCount = useCallback(async () => {
    setIsLoadingCount(true);
    try {
      const count = await getCampaignCount(walletAddress || undefined);
      setCampaignCount(count);
    } catch {
      setCampaignCount(null);
    } finally {
      setIsLoadingCount(false);
    }
  }, [walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "view", label: "View", icon: <TargetIcon />, color: "#4fc3f7" },
    { key: "create", label: "Create", icon: <PlusIcon />, color: "#f472b6" },
    { key: "contribute", label: "Contribute", icon: <HeartIcon />, color: "#fbbf24" },
  ];

  const formatAmount = (amount: bigint) => {
    return amount.toLocaleString("en-US");
  };

  const formatDeadline = (timestamp: number) => {
    if (timestamp === 0) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
                <MethodSignature name="get_campaign" params="(campaign_id: u32)" returns="-> Campaign" color="#4fc3f7" />
                
                {/* Campaign count helper */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleLoadCampaignCount} 
                    disabled={isLoadingCount}
                    className="text-xs text-[#4fc3f7]/60 hover:text-[#4fc3f7] border border-[#4fc3f7]/15 hover:border-[#4fc3f7]/30 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
                  >
                    {isLoadingCount ? "Loading..." : "Check Total Campaigns"}
                  </button>
                  {campaignCount !== null && (
                    <span className="text-xs text-white/50 font-mono">
                      {campaignCount} campaign{campaignCount !== 1 ? "s" : ""} found (IDs: 0 – {Math.max(0, campaignCount - 1)})
                    </span>
                  )}
                </div>

                <Input label="Campaign ID" value={viewCampaignId} onChange={(e) => setViewCampaignId(e.target.value)} placeholder="e.g. 0" type="number" />
                <ShimmerButton onClick={handleViewCampaign} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                  {isViewing ? <><SpinnerIcon /> Fetching...</> : <><TargetIcon /> View Campaign</>}
                </ShimmerButton>

                {campaignData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Campaign Details</span>
                      {(() => {
                        const statusKey = campaignData.status;
                        const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.Active;
                        return (
                          <Badge variant={cfg.variant}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                            {statusKey}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="p-4 space-y-4">
                      {campaignData.title && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/35">Title</span>
                          <span className="text-sm text-white/80 font-medium">{campaignData.title}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Creator</span>
                        <span className="font-mono text-xs text-white/60">{truncate(campaignData.creator)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Goal</span>
                        <span className="font-mono text-sm text-white/80">{formatAmount(campaignData.goal)} XLM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Raised</span>
                        <span className="font-mono text-sm text-white/80">{formatAmount(campaignData.raised)} XLM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Deadline</span>
                        <span className="text-xs text-white/60">{formatDeadline(campaignData.deadline)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Contributors</span>
                        <span className="font-mono text-sm text-white/80">{campaignData.contributor_count}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/35">Progress</span>
                          <span className="text-white/70 font-mono">
                            {campaignData.goal > BigInt(0) ? Number((campaignData.raised * BigInt(100)) / campaignData.goal) : 0}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#f472b6] to-[#fbbf24] transition-all duration-500"
                            style={{ 
                              width: `${campaignData.goal > BigInt(0) ? Math.min(100, Number((campaignData.raised * BigInt(100)) / campaignData.goal)) : 0}%` 
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
                <MethodSignature name="create_campaign" params="(creator, title, goal, deadline)" color="#f472b6" />
                <p className="text-xs text-white/40">
                  Start a new crowdfunding campaign. Set your funding goal in XLM and a deadline.
                </p>
                <Input 
                  label="Campaign Title" 
                  value={campaignTitle} 
                  onChange={(e) => setCampaignTitle(e.target.value)} 
                  placeholder="e.g. Build a Community Library" 
                />
                <Input 
                  label="Funding Goal (XLM)" 
                  value={goalAmount} 
                  onChange={(e) => setGoalAmount(e.target.value)} 
                  placeholder="e.g. 1000" 
                  type="number"
                />
                <Input 
                  label="Deadline (days from now)" 
                  value={deadlineDays} 
                  onChange={(e) => setDeadlineDays(e.target.value)} 
                  placeholder="e.g. 30" 
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
                <MethodSignature name="contribute" params="(from, campaign_id, amount)" color="#fbbf24" />
                <p className="text-xs text-white/40">
                  Support a campaign by contributing XLM. Enter the campaign ID and amount.
                </p>
                <Input 
                  label="Campaign ID" 
                  value={contributeCampaignId} 
                  onChange={(e) => setContributeCampaignId(e.target.value)} 
                  placeholder="e.g. 0" 
                  type="number"
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
              {["Active", "Funded", "Withdrawn"].map((s, i) => (
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
