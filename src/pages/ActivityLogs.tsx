import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "@/lib/api/services/activityLog.service";
import { format } from "date-fns";

export default function ActivityLogs() {
  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: () => activityLogService.getAll({ per_page: 100 }),
  });

  const logs = logsResponse?.data || [];

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold">سجل النشاطات</h1>

      <Card>
        <CardHeader>
          <CardTitle>سجل النشاطات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل السجل...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سجلات نشاط حتى الآن. سيتم تسجيل النشاطات تلقائياً عند استخدام النظام.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الإجراء</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user_name}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity_type || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
