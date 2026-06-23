// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AuthLayout } from "./auth-layout";

afterEach(cleanup);

describe("AuthLayout", () => {
  it("renders the title", () => {
    render(<AuthLayout title="Sign in"><div>content</div></AuthLayout>);

    expect(screen.getByText("Sign in")).toBeDefined();
  });

  it("renders the description when provided", () => {
    render(
      <AuthLayout title="Reset" description="Enter your email">
        <div>content</div>
      </AuthLayout>,
    );

    expect(screen.getByText("Enter your email")).toBeDefined();
  });

  it("renders children", () => {
    render(
      <AuthLayout title="Test">
        <form data-testid="form" />
      </AuthLayout>,
    );

    expect(screen.getByTestId("form")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    render(<AuthLayout title="Test"><div>content</div></AuthLayout>);

    expect(screen.queryByRole("paragraph")).toBeNull();
  });
});
