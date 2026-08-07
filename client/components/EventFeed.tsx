"use client";

import { useEventStream, ContractEvent } from "@/hooks/useEventStream";
import { Badge } from "@/components/ui/badge";

function EventIcon({ type }: { type: ContractEvent["type"] }) {
  switch (type) {
    case "campaign_created":
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f472b6]/20 text-[#f472b6]">
          🚀
        </span>
      );
    case "contribution_made":
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fbbf24]/20 text-[#fbbf24]">
          💎
        </span>
      );
    case "campaign_funded":
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#34d399]/20 text-[#34d399]">
          🎉
        </span>
      );
    case "reward_minted":
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4fc3f7]/20 text-[#4fc3f7]">
          🎁
        </span>
      );
  }
}

export function EventFeed() {
  const { events, isConnected } = useEventStream();

  return (
    <div className="w-full max-w-2xl mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white/90">Live Contract Event Stream</h4>
          <Badge variant={isConnected ? "success" : "warning"}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-ping" />
            Live
          </Badge>
        </div>
        <span className="text-xs text-white/30 font-mono">Soroban RPC Events</span>
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-xs transition-all hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              <EventIcon type={evt.type} />
              <div>
                <p className="font-medium text-white/80">
                  {evt.type === "campaign_created" && `Campaign #${evt.data.campaignId} created by ${evt.data.creator}`}
                  {evt.type === "contribution_made" && `Contribution of ${evt.data.amount} XLM by ${evt.data.contributor}`}
                  {evt.type === "reward_minted" && `Minted ${evt.data.amount} CRWD tokens to ${evt.data.contributor}`}
                  {evt.type === "campaign_funded" && `Campaign #${evt.data.campaignId} fully funded!`}
                </p>
                <p className="text-[10px] text-white/30">{evt.timestamp}</p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-[#4fc3f7]">Soroban Event</span>
          </div>
        ))}
      </div>
    </div>
  );
}
