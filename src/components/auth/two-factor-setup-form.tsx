"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTwoFactorSetupForm } from "@/hooks/use-two-factor-setup-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackupCodesDisplay } from "./backup-codes-display";

export function TwoFactorSetupForm() {
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useTwoFactorSetupForm();

  const setupData = state?.success ? state.data : undefined;

  if (setupData) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Two-factor authentication enabled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm">
                Scan this QR code with your authenticator app
              </p>
              <div className="flex justify-center">
                <QRCodeSVG value={setupData.totpURI} size={200} />
              </div>
            </div>

            <BackupCodesDisplay codes={setupData.backupCodes} />

            <p className="text-muted-foreground text-xs">
              Save these backup codes in a secure place. You can use them to
              access your account if you lose your authenticator device.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="setup-password">Confirm your password</Label>
        <Input
          id="setup-password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {state && !state.success && (
        <p className="text-destructive text-sm">{state.error.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enabling..." : "Enable two-factor authentication"}
      </Button>
    </form>
  );
}
