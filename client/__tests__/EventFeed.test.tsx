import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EventFeed } from "../components/EventFeed";

describe("EventFeed Component", () => {
  it("renders live contract event stream header", () => {
    render(<EventFeed />);
    expect(screen.getByText("Live Contract Event Stream")).toBeDefined();
    expect(screen.getByText("Soroban RPC Events")).toBeDefined();
  });

  it("renders initial events", () => {
    render(<EventFeed />);
    expect(screen.getByText(/Campaign #0 created/i)).toBeDefined();
    expect(screen.getByText(/Contribution of 250 XLM/i)).toBeDefined();
  });
});
