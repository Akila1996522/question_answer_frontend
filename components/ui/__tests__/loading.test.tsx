import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Loading from "../loading";

describe("Loading Component", () => {
  it("renders the loading text correctly", () => {
    // Act
    render(<Loading />);

    // Assert
    const container = screen.getByText("Loading...");
    expect(container).toBeInTheDocument();
  });

  it("contains the spinner animation class", () => {
    // Act
    const { container } = render(<Loading />);

    // Assert
    // The component has a visual spinning SVG, so we verify its structural presence
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
