"use client";

import { AccountInfo } from "@/components/AccountInfo";
import { Header } from "@/components/Header";
import { MessageBoard } from "@/components/MessageBoard";
import { NetworkInfo } from "@/components/NetworkInfo";
import { TopBanner } from "@/components/TopBanner";
import { TransferAPT } from "@/components/TransferAPT";
import { WalletDetails } from "@/components/WalletDetails";
import { FeedbackForm } from "@/components/FeedbackForm";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

function App() {
  const { connected } = useWallet();

  return (
    <>
    <TopBanner />
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-10 pt-6">
              <WalletDetails />
              <NetworkInfo />
              <AccountInfo />
              <TransferAPT />
              <MessageBoard />
            </CardContent>
          </Card>
        ) : (
          <CardHeader>
            <CardTitle>To get started Connect a wallet</CardTitle>
          </CardHeader>
        )}
      </div>
      <div className="p-4 flex items-center justify-center flex-col">
        <h2 className="text-lg font-medium">Feedback</h2>
        <FeedbackForm />
      </div>
    </>
  );
}

export default App;
