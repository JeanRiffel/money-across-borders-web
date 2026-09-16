import { StatusBadge } from "@/components/remittances/status-badge";
import { formatDateTime, formatMinorUnits } from "@/lib/money";
import type { RemittanceSearchDocument } from "@/lib/schemas/remittance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RemittanceTable({
  remittances,
  viewerAccountId,
}: {
  remittances: RemittanceSearchDocument[];
  viewerAccountId: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Direction</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Received</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {remittances.map((remittance) => (
          <TableRow key={remittance.remittanceId}>
            <TableCell className="text-muted-foreground text-xs">
              {remittance.senderAccountId === viewerAccountId ? "Sent" : "Received"}
            </TableCell>
            <TableCell className="font-mono">
              {formatMinorUnits(remittance.sourceAmountMinorUnits, remittance.sourceCurrency)}
            </TableCell>
            <TableCell className="font-mono">
              {formatMinorUnits(remittance.convertedAmountMinorUnits, remittance.destinationCurrency)}
            </TableCell>
            <TableCell>
              <StatusBadge status={remittance.status} />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDateTime(remittance.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
