"use client";

import { useState, useEffect } from "react";
import { OrbitProvider, useOrbit } from "@/components/orbit/orbit-provider";
import { ToastProvider } from "@/components/orbit/toast-provider";
import { CommandDock, type ViewType } from "@/components/orbit/command-dock";
import { AccountList } from "@/components/orbit/account-list";
import { CommandStage } from "@/components/orbit/command-stage";
import { PortfolioPulse } from "@/components/orbit/portfolio-pulse";
import { AccountDeepDive } from "@/components/orbit/account-deep-dive";
import { CommandKMenu } from "@/components/orbit/command-k-menu";
import { AccountModal } from "@/components/orbit/modals/account-modal";
import { AnalyticsView } from "@/components/orbit/analytics-view";
import { SettingsView } from "@/components/orbit/settings-view";
import type { Account } from "@/lib/mock-data";

function OrbitAppContent() {
  const {
    selectedAccountId,
    selectAccount,
    getAccountById,
    activeView,
    setActiveView,
  } = useOrbit();

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(
    undefined
  );

  const selectedAccount = selectedAccountId
    ? getAccountById(selectedAccountId)
    : null;

  const handleSelectAccount = (account: Account) => {
    selectAccount(account.id);
    setActiveView("accounts");
  };

  const handleBackToDashboard = () => {
    selectAccount(null);
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    // Clear selected account when navigating to a different main view
    if (view !== "accounts") {
      selectAccount(null);
    }
  };

  const handleNewAccount = () => {
    setEditingAccount(undefined);
    setShowAccountModal(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountModal(true);
  };

  const handleAccountCreated = (account: Account) => {
    // Navigate to the new account
    selectAccount(account.id);
    setActiveView("accounts");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to deselect account
      if (e.key === "Escape" && selectedAccountId) {
        selectAccount(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedAccountId, selectAccount]);

  // Determine what to show in the Command Stage
  const renderStageContent = () => {
    // If an account is selected, show the deep dive
    if (selectedAccount) {
      return (
        <AccountDeepDive
          account={selectedAccount}
          onBack={handleBackToDashboard}
          onEdit={() => handleEditAccount(selectedAccount)}
        />
      );
    }

    // Otherwise show based on active view
    switch (activeView) {
      case "dashboard":
        return <PortfolioPulse />;
      case "accounts":
        return <PortfolioPulse />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <PortfolioPulse />;
    }
  };

  // Determine the key for animations
  const stageKey = selectedAccount
    ? `account-${selectedAccount.id}`
    : `view-${activeView}`;

  // Get title for top bar
  const getTitle = () => {
    if (selectedAccount) return selectedAccount.name;
    switch (activeView) {
      case "analytics":
        return "Analytics";
      case "settings":
        return "Settings";
      default:
        return "Portfolio Overview";
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Command Dock (Left Navigation) */}
      <CommandDock activeView={activeView} onViewChange={handleViewChange} />

      {/* Account List (Center-Left Panel) */}
      <AccountList
        selectedAccountId={selectedAccountId}
        onSelectAccount={handleSelectAccount}
        onNewAccount={handleNewAccount}
      />

      {/* Command Stage (Main Content Area) */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Top bar - minimal, borderless */}
        <div className="h-12 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-medium text-foreground tracking-tight">{getTitle()}</h2>
            {selectedAccount && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/8 text-primary font-medium">
                {selectedAccount.tier}
              </span>
            )}
          </div>

          {/* Command-K Search */}
          <CommandKMenu
            onSelectView={handleViewChange}
            onSelectAccount={handleSelectAccount}
            onCreateAccount={handleNewAccount}
          />
        </div>

        {/* Stage Content */}
        <CommandStage viewKey={stageKey}>{renderStageContent()}</CommandStage>
      </div>

      {/* Account Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => {
          setShowAccountModal(false);
          setEditingAccount(undefined);
        }}
        account={editingAccount}
        onSuccess={handleAccountCreated}
      />
    </div>
  );
}

export default function OrbitApp() {
  return (
    <OrbitProvider>
      <ToastProvider>
        <OrbitAppContent />
      </ToastProvider>
    </OrbitProvider>
  );
}
