import { describe, it, expect } from "vitest";
import { registerAdapter, resolveAdapter, hasAdapter } from "./index";
import type { CreateAdapter } from "./types";
import type { DatabaseConfig } from "../config/types";

describe("adapter registry", () => {
  it("hasAdapter returns false for unknown adapter", () => {
    expect(hasAdapter("prisma")).toBe(false);
  });

  it("registers and resolves an adapter", () => {
    const mockFactory: CreateAdapter = () => ({ mock: true });

    registerAdapter("testdb", mockFactory);

    expect(hasAdapter("testdb")).toBe(true);
    const result = resolveAdapter({ adapter: "testdb" } as unknown as DatabaseConfig);
    expect(result).toEqual({ mock: true });
  });

  it("throws for unknown adapter on resolve", () => {
    expect(() =>
      resolveAdapter({ adapter: "nonexistent" } as unknown as DatabaseConfig),
    ).toThrow(/Unknown database adapter.*nonexistent/);
  });

  it("can register and resolve multiple adapters", () => {
    const factoryA: CreateAdapter = () => ({ type: "A" });
    const factoryB: CreateAdapter = () => ({ type: "B" });

    registerAdapter("a", factoryA);
    registerAdapter("b", factoryB);

    expect(resolveAdapter({ adapter: "a" } as unknown as DatabaseConfig)).toEqual({
      type: "A",
    });
    expect(resolveAdapter({ adapter: "b" } as unknown as DatabaseConfig)).toEqual({
      type: "B",
    });
  });
});
