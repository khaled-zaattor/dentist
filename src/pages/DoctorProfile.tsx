import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { doctorService, appointmentService } from "@/lib/api/services";
import { ArrowLeft, Mail, Phone, Stethoscope, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function DoctorProfile() {
  const { doctorId, id } = useParams<{ doctorId?: string; id?: string }>();
  const actualId = doctorId || id;
  const navigate = useNavigate();

  const { data: doctor, isLoading: doctorLoading } = useQuery({
    queryKey: ["doctor", actualId],
    queryFn: () => doctorService.getById(actualId!),
    enabled: !!actualId,
  });

  const { data: appointmentsResponse, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["doctor-appointments", actualId],
    queryFn: () => appointmentService.getAll({ doctor_id: actualId, per_page: 100 }),
    enabled: !!actualId,
  });

  const appointments = appointmentsResponse?.data || [];

  if (doctorLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!doctor) {
    return <div className="text-center py-8">الطبيب غير موجود</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/doctors")}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-3xl font-bold">{doctor.full_name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الطبيب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">التخصص:</span>
              <span className="font-medium">{doctor.specialty}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">البريد الإلكتروني:</span>
              <span className="font-medium">{doctor.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الهاتف:</span>
              <span className="font-medium">{doctor.phone_number}</span>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>الإحصائيات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">إجمالي المواعيد</span>
              <span className="text-2xl font-bold">{appointments.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">المواعيد المكتملة</span>
              <span className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "Completed").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">المواعيد المجدولة</span>
              <span className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "Scheduled").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>المواعيد</CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">لا توجد مواعيد</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {appointment.patient?.full_name || "غير محدد"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.scheduled_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {appointment.status === "Scheduled" && "مجدول"}
                    {appointment.status === "Completed" && "مكتمل"}
                    {appointment.status === "Cancelled" && "ملغي"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
