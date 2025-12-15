import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "@/lib/api/services/statistics.service";
import { patientService, doctorService, appointmentService } from "@/lib/api/services";
import { Users, UserCheck, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  // Fetch basic counts since statistics endpoint might not exist yet
  const { data: patientsResponse } = useQuery({
    queryKey: ["patients-count"],
    queryFn: () => patientService.getAll({ per_page: 1 }),
  });

  const { data: doctorsResponse } = useQuery({
    queryKey: ["doctors-count"],
    queryFn: () => doctorService.getAll({ per_page: 1 }),
  });

  const { data: appointmentsResponse } = useQuery({
    queryKey: ["appointments-count"],
    queryFn: () => appointmentService.getAll({ per_page: 1 }),
  });

  const totalPatients = patientsResponse?.total || 0;
  const totalDoctors = doctorsResponse?.total || 0;
  const totalAppointments = appointmentsResponse?.total || 0;

  const stats = [
    {
      title: "إجمالي المرضى",
      value: totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "إجمالي الأطباء",
      value: totalDoctors,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "إجمالي المواعيد",
      value: totalAppointments,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>نظرة عامة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي المرضى المسجلين</span>
              <span className="font-semibold">{totalPatients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي الأطباء</span>
              <span className="font-semibold">{totalDoctors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي المواعيد</span>
              <span className="font-semibold">{totalAppointments}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الإحصائيات</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            مرحباً بك في لوحة التحكم. يمكنك من هنا إدارة جميع جوانب العيادة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
