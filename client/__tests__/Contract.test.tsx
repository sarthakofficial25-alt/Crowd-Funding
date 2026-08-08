import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContractUI from "../components/Contract";

describe("ContractUI Component", () => {
  it("renders tabs and default view section", () => {
    render(
      <ContractUI
        walletAddress={null}
        onConnect={vi.fn()}
        isConnecting={false}
      />
    );

    expect(screen.getByText("Crowd Funding")).toBeDefined();
    expect(screen.getByText("View")).toBeDefined();
    expect(screen.getByText("Create")).toBeDefined();
    expect(screen.getAllByText("Contribute").length).toBeGreaterThan(0);
    expect(screen.getByText("Campaign Creator Address")).toBeDefined();
  });

  it("switches to Create tab and shows prompt when wallet disconnected", () => {
    render(
      <ContractUI
        walletAddress={null}
        onConnect={vi.fn()}
        isConnecting={false}
      />
    );

    const createTab = screen.getByText("Create");
    fireEvent.click(createTab);

    expect(screen.getByText("Funding Goal (XLM)")).toBeDefined();
    expect(screen.getByText("Connect wallet to create campaign")).toBeDefined();
  });

  it("switches to Create tab and shows button when wallet connected", () => {
    render(
      <ContractUI
        walletAddress="GBXKKRIDJ4Q2DGJKQXBRBF22BZFRLMEEK722LGDQBBOGRPF4IUS65KSHJ"
        onConnect={vi.fn()}
        isConnecting={false}
      />
    );

    const createTab = screen.getByText("Create");
    fireEvent.click(createTab);

    expect(screen.getByText("Create Campaign")).toBeDefined();
  });

  it("switches to Contribute tab and displays input fields", () => {
    render(
      <ContractUI
        walletAddress="GBXKKRIDJ4Q2DGJKQXBRBF22BZFRLMEEK722LGDQBBOGRPF4IUS65KSHJ"
        onConnect={vi.fn()}
        isConnecting={false}
      />
    );

    const contributeTab = screen.getAllByText("Contribute")[0];
    fireEvent.click(contributeTab);

    expect(screen.getByText("Contribution Amount (XLM)")).toBeDefined();
    expect(screen.getAllByText("Contribute").length).toBeGreaterThan(1);
  });
});
