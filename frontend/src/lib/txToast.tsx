import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

const EXPLORER_BASE_URL = "https://sepolia.etherscan.io/tx/";

/**
 * Get explorer URL for a transaction hash
 */
export function getExplorerUrl(hash: string): string {
  return `${EXPLORER_BASE_URL}${hash}`;
}

/**
 * Create a clickable link component for explorer
 */
function ExplorerLink({ hash }: { hash: string }) {
  return (
    <a
      href={getExplorerUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
      onClick={(e) => e.stopPropagation()}
    >
      View on Explorer
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

/**
 * Show toast when transaction is submitted (pending)
 */
export function showTxSubmitted(hash: string, message: string = "Transaction Submitted") {
  return toast.loading(message, {
    description: (
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
          {hash.slice(0, 10)}...{hash.slice(-8)}
        </span>
        <ExplorerLink hash={hash} />
      </div>
    ),
    duration: Infinity, // Keep showing until confirmed
    id: hash, // Use hash as ID to update this specific toast
  });
}

/**
 * Show toast when transaction is confirmed successfully
 */
export function showTxSuccess(hash: string, message: string = "Transaction Confirmed") {
  return toast.success(message, {
    description: (
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Transaction confirmed on chain</span>
        <ExplorerLink hash={hash} />
      </div>
    ),
    duration: 5000,
    id: hash, // Replace the pending toast
  });
}

/**
 * Show toast when transaction fails
 */
export function showTxError(hash: string, message: string = "Transaction Failed", errorMsg?: string) {
  return toast.error(message, {
    description: (
      <div className="flex flex-col">
        {errorMsg && (
          <span className="text-xs text-destructive/80 truncate max-w-[250px]">{errorMsg}</span>
        )}
        <ExplorerLink hash={hash} />
      </div>
    ),
    duration: 8000,
    id: hash, // Replace the pending toast
  });
}

/**
 * Show error toast when transaction submission fails (before hash)
 */
export function showSubmitError(message: string = "Transaction Failed", errorMsg?: string) {
  return toast.error(message, {
    description: errorMsg ? (
      <span className="text-xs text-destructive/80">{errorMsg}</span>
    ) : undefined,
    duration: 5000,
  });
}

/**
 * Show info toast (no transaction)
 */
export function showInfo(message: string, description?: string) {
  return toast.info(message, {
    description: description,
    duration: 3000,
  });
}

/**
 * Dismiss a specific toast by hash
 */
export function dismissTx(hash: string) {
  toast.dismiss(hash);
}
