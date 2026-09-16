import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return (
      <Badge variant="outline" className="border-success text-success">
        {status}
      </Badge>
    );
  }

  if (status.startsWith("REJECTED") || status === "FAILED") {
    return <Badge variant="destructive">{status}</Badge>;
  }

  return <Badge variant="secondary">{status}</Badge>;
}
