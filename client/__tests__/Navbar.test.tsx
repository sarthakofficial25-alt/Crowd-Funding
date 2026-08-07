import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Navbar from "../components/Navbar";

describe("Navbar Component", () => {
  it("renders app logo title and network badge", () => {
    render(
      <Navbar
        walletAddress={null}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        isConnecting={false}
      />
    );
    expect(screen.getByText("CrowdFund")).toBeInTheDocument();
    expect(screen.getByText("TESTNET")).toBeInTheDocument();
  });

  it("renders connect wallet button when disconnected", () => {
    render(
      <Navbar
        walletAddress={null}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        isConnecting={false}
      />
    );
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("displays truncated address when wallet is connected", () => {
    const mockAddress = "GBXKKRIDJ4Q2DGJKQXBRBF22BZFRLMEEK722LGDQBBOGRPF4IUS65KSHJ";
    render(
      <Navbar
        walletAddress={mockAddress}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        isConnecting={false}
      />
    );
    expect(screen.getByText("GBXK...KSHJ")).toBeInTheDocument();
  });
});
