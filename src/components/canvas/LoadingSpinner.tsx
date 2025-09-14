import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
    </div>
  );
}
