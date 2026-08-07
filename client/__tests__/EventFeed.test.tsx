import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EventFeed } from "../components/EventFeed";

describe("EventFeed Component", () => {
  it("renders live contract event stream header", () => {
    render(<EventFeed />);
    expect(screen.getByText("Live Contract Event Stream")).toBeInTheDocument();
    expect(screen.getByText("Soroban RPC Events")).toBeInTheDocument();
  });

  it("renders initial events", () => {
    render(<EventFeed />);
    expect(screen.getByText(/Campaign #0 created/i)).toBeInTheDocument();
    expect(screen.getByText(/Contribution of 250 XLM/i)).toBeInTheDocument();
  });
});
