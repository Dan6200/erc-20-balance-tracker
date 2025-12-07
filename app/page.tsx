"use client"; // This component will be a client component

import { BalanceChecker } from "../components/balance-tracker"; // Correct path to BalanceChecker

export default function Page() {
  return (
    <main>
      <BalanceChecker />
    </main>
  );
}
