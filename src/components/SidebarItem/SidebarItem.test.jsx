/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import SidebarItem from "./SidebarItem.jsx";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  value: jest.fn(),
  writable: true,
  configurable: true,
});
function renderWithRouter(ui, { route = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe("SidebarItem", () => {
  const defaultProps = {
    title: "Getting Started",
    url: "/guides/getting-started/",
    currentPage: "/guides/",
    anchors: [],
  };

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView.mockClear();
  });

  it("renders the title", () => {
    renderWithRouter(<SidebarItem {...defaultProps} />);
    expect(screen.getByText("Getting Started")).toBeTruthy();
  });

  it("renders collapsed by default when not matching currentPage", () => {
    const { container } = renderWithRouter(<SidebarItem {...defaultProps} />);
    const wrapper = container.firstChild;
    expect(wrapper.getAttribute("data-open")).toBeNull();
  });

  it("renders expanded when url matches currentPage", () => {
    const { container } = renderWithRouter(
      <SidebarItem {...defaultProps} currentPage="/guides/getting-started" />,
    );
    const wrapper = container.firstChild;
    expect(wrapper.getAttribute("data-open")).toBe("true");
  });

  it("toggles open state when chevron button is clicked", () => {
    const anchors = [
      {
        id: "introduction",
        title: "Introduction",
        title2: "Introduction",
        level: 2,
      },
      { id: "setup", title: "Setup", title2: "Setup", level: 2 },
    ];

    const { container } = renderWithRouter(
      <SidebarItem {...defaultProps} anchors={anchors} />,
    );

    const wrapper = container.firstChild;
    expect(wrapper.getAttribute("data-open")).toBeNull();

    const toggleButton = screen.getByRole("button", {
      name: /toggle getting started section/i,
    });

    fireEvent.click(toggleButton);
    expect(wrapper.getAttribute("data-open")).toBe("true");

    fireEvent.click(toggleButton);
    expect(wrapper.getAttribute("data-open")).toBeNull();
  });

  it("renders anchor links when anchors are provided", () => {
    const anchors = [
      { id: "intro", title: "Introduction", title2: "Introduction", level: 2 },
      {
        id: "basic-setup",
        title: "Basic Setup",
        title2: "Basic Setup",
        level: 2,
      },
    ];

    renderWithRouter(<SidebarItem {...defaultProps} anchors={anchors} />);
    expect(screen.getByText("Introduction")).toBeTruthy();
    expect(screen.getByText("Basic Setup")).toBeTruthy();
  });

  it("renders a bar icon when no anchors are provided", () => {
    const { container } = renderWithRouter(
      <SidebarItem {...defaultProps} anchors={[]} />,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(container.firstChild).toBeTruthy();
  });

  it("restores focus when clicking the current anchor link again", async () => {
    window.history.replaceState(
      {},
      "",
      "/guides/getting-started/#introduction",
    );

    const anchors = [
      {
        id: "introduction",
        title: "Introduction",
        title2: "Introduction",
        level: 2,
      },
    ];

    renderWithRouter(
      <>
        <SidebarItem {...defaultProps} anchors={anchors} />
        <h2>
          <span id="introduction" />
          Introduction
        </h2>
      </>,
      { route: "/guides/getting-started/#introduction" },
    );

    fireEvent.click(screen.getByRole("link", { name: "Introduction" }));

    const heading = screen.getByRole("heading", { name: "Introduction" });

    await waitFor(() => {
      expect(document.activeElement).toBe(heading);
    });

    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(
      document.getElementById("introduction").scrollIntoView,
    ).toHaveBeenCalled();
  });

  it("handles encoded special characters in anchor IDs", async () => {
    window.history.replaceState({}, "", "/guides/getting-started/#caf%C3%A9");

    const anchors = [
      {
        id: "café",
        title: "Cafe",
        title2: "Cafe",
        level: 2,
      },
    ];

    renderWithRouter(
      <>
        <SidebarItem {...defaultProps} anchors={anchors} />
        <h2>
          <span id="café" />
          Cafe
        </h2>
      </>,
      { route: "/guides/getting-started/#caf%C3%A9" },
    );

    fireEvent.click(screen.getByRole("link", { name: "Cafe" }));
    const heading = screen.getByRole("heading", { name: "Cafe" });

    await waitFor(() => {
      expect(document.activeElement).toBe(heading);
    });

    expect(document.getElementById("café").scrollIntoView).toHaveBeenCalled();
  });

  it("does not perform custom focus or scrolling on modified clicks", () => {
    window.history.replaceState(
      {},
      "",
      "/guides/getting-started/#introduction",
    );

    const anchors = [
      {
        id: "introduction",
        title: "Introduction",
        title2: "Introduction",
        level: 2,
      },
    ];

    renderWithRouter(
      <>
        <SidebarItem {...defaultProps} anchors={anchors} />
        <h2>
          <span id="introduction" />
          Introduction
        </h2>
      </>,
      { route: "/guides/getting-started/#introduction" },
    );

    fireEvent.click(screen.getByRole("link", { name: "Introduction" }), {
      ctrlKey: true,
    });
    expect(
      document.getElementById("introduction").scrollIntoView,
    ).not.toHaveBeenCalled();
  });

  it("scrolls to a non-heading anchor when clicking the current link", async () => {
    window.history.replaceState({}, "", "/guides/getting-started/#example");

    const anchors = [
      {
        id: "example",
        title: "Example",
        title2: "Example",
        level: 2,
      },
    ];

    renderWithRouter(
      <>
        <SidebarItem {...defaultProps} anchors={anchors} />
        <div id="example">Example content</div>
      </>,
      { route: "/guides/getting-started/#example" },
    );
    fireEvent.click(screen.getByRole("link", { name: "Example" }));

    await waitFor(() => {
      expect(
        document.getElementById("example").scrollIntoView,
      ).toHaveBeenCalled();
    });
  });

  it("matches snapshot", () => {
    const anchors = [
      { id: "step-1", title: "Step 1", title2: "Step 1", level: 2 },
    ];

    const { container } = renderWithRouter(
      <SidebarItem {...defaultProps} anchors={anchors} />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
