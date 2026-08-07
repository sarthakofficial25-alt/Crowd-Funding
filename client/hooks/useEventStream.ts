"use client";

import { useState, useEffect } from "react";

export interface ContractEvent {
  id: string;
  type: "campaign_created" | "contribution_made" | "campaign_funded" | "reward_minted";
  timestamp: string;
  data: {
    campaignId?: number;
    creator?: string;
    contributor?: string;
    amount?: number;
    goal?: number;
  };
}

export function useEventStream() {
  const [events, setEvents] = useState<ContractEvent[]>([
    {
      id: "evt-1",
      type: "campaign_created",
      timestamp: "2 mins ago",
      data: { campaignId: 0, creator: "GBX...9K2P", goal: 5000 },
    },
    {
      id: "evt-2",
      type: "contribution_made",
      timestamp: "1 min ago",
      data: { campaignId: 0, contributor: "GD7...1M4X", amount: 250 },
    },
    {
      id: "evt-3",
      type: "reward_minted",
      timestamp: "Just now",
      data: { contributor: "GD7...1M4X", amount: 25 },
    },
  ]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Simulate real-time event polling on Soroban Testnet
    const interval = setInterval(() => {
      const types: ContractEvent["type"][] = ["contribution_made", "reward_minted"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: randomType,
        timestamp: "Just now",
        data: {
          campaignId: 0,
          contributor: `G${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          amount: Math.floor(Math.random() * 100) + 10,
        },
      };
      setEvents((prev) => [newEvt, ...prev.slice(0, 9)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return { events, isConnected };
}
