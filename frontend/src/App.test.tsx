import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom";

describe("App Component", () => {
  it("renders the title", () => {
    render(<App />);
    const titleElement = screen.getByText(/Sea Surface Temperature Display/i);
    expect(titleElement).toBeInTheDocument();
  });

  it("shows error message when no file is selected", async () => {
    render(<App />);
    const submitButton = screen.getByText(/Download and Generate/i);
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/Please select a file./i);
    expect(errorMessage).toBeInTheDocument();
  });
});
