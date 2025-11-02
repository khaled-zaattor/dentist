import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function SystemStatistics() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );

  const { data: stats, isLoading } = useQuery({
    queryKey: ["system-stats", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      const [patients, appointments, treatments, treatmentRecords, payments] = await Promise.all([
        supabase
          .from("patients")
          .select("id", { count: "exact" })
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase
          .from("appointments")
          .select("id", { count: "exact" })
          .gte("scheduled_at", startDate.toISOString())
          .lte("scheduled_at", endDate.toISOString()),
        supabase
          .from("treatment_records")
          .select("id", { count: "exact" })
          .gte("performed_at", startDate.toISOString())
          .lte("performed_at", endDate.toISOString()),
        supabase
          .from("treatment_records")
          .select("actual_cost")
          .gte("performed_at", startDate.toISOString())
          .lte("performed_at", endDate.toISOString()),
        supabase
          .from("payments")
          .select("amount")
          .gte("paid_at", startDate.toISOString())
          .lte("paid_at", endDate.toISOString()),
      ]);

      const totalTreatmentCost = treatmentRecords.data?.reduce(
        (sum, record) => sum + Number(record.actual_cost || 0), 
        0
      ) || 0;

      const totalPayments = payments.data?.reduce(
        (sum, payment) => sum + Number(payment.amount), 
        0
      ) || 0;

      return {
        patientsCount: patients.count || 0,
        appointmentsCount: appointments.count || 0,
        treatmentsCount: treatments.count || 0,
        treatmentCost: totalTreatmentCost,
        totalPayments: totalPayments,
        totalRevenue: totalPayments - totalTreatmentCost,
      };
    },
  });

  // Generate month options for the last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    const label = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
    return { value, label };
  });

  const statCards = [
    {
      title: "المرضى الجدد",
      value: stats?.patientsCount?.toString() || "0",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "المواعيد",
      value: stats?.appointmentsCount?.toString() || "0",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "العلاجات المنفذة",
      value: stats?.treatmentsCount?.toString() || "0",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "كلفة العلاجات",
      value: `$${stats?.treatmentCost?.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "المدفوعات",
      value: `$${stats?.totalPayments?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "الإيرادات",
      value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إحصائيات النظام</h2>
          <p className="text-muted-foreground">عرض الإحصائيات الشهرية للنظام</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="اختر الشهر" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
