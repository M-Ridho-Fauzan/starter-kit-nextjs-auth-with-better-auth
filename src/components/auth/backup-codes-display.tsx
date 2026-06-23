"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Props for the {@link BackupCodesDisplay} component.
 *
 * @param codes - Array of backup code strings to display.
 */
interface BackupCodesDisplayProps {
  codes: string[];
}

/**
 * Backup codes display card.
 *
 * Renders a list of backup codes with a copy-to-clipboard button.
 * Returns null when the codes array is empty.
 */
export function BackupCodesDisplay({ codes }: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (codes.length === 0) {
    return null;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Backup codes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1">
          {codes.map((code, index) => (
            <li
              key={index}
              className="bg-muted text-muted-foreground rounded px-2 py-1 font-mono text-xs tracking-wider"
            >
              {code}
            </li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy all codes"}
        </Button>
      </CardContent>
    </Card>
  );
}
