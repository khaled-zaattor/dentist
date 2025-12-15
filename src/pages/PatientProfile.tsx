import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { patientService, appointmentService } from "@/lib/api/services";
import { ArrowLeft, Calendar, Phone, MapPin, Briefcase, FileText, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function PatientProfile() {
  const { patientId, id } = useParams<{ patientId?: string; id?: string }>();
  const actualId = patientId || id;
  const navigate = useNavigate();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", actualId],
    queryFn: () => patientService.getById(actualId!),
    enabled: !!actualId,
  });

  const { data: appointmentsResponse, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["patient-appointments", actualId],
    queryFn: () => appointmentService.getAll({ patient_id: actualId, per_page: 100 }),
    enabled: !!actualId,
  });

  const { data: treatmentRecords = [], isLoading: treatmentsLoading } = useQuery({
    queryKey: ["patient-treatments", actualId],
    queryFn: () => patientService.getTreatmentRecords(actualId!),
    enabled: !!actualId,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["patient-payments", actualId],
    queryFn: () => patientService.getPayments(actualId!),
    enabled: !!actualId,
  });

  const appointments = appointmentsResponse?.data || [];

  if (patientLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!patient) {
    return <div className="text-center py-8">المريض غير موجود</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/patients")}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-3xl font-bold">{patient.full_name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المريض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">تاريخ الميلاد:</span>
              <span className="font-medium">
                {format(new Date(patient.date_of_birth), "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الهاتف:</span>
              <span className="font-medium">{patient.phone_number}</span>
            </div>
            {patient.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">العنوان:</span>
                <span className="font-medium">{patient.address}</span>
              </div>
            )}
            {patient.job && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">المهنة:</span>
                <span className="font-medium">{patient.job}</span>
              </div>
            )}
            {patient.contact && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">جهة الاتصال:</span>
                <span className="font-medium">{patient.contact}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical Notes */}
        {patient.medical_notes && (
          <Card>
            <CardHeader>
              <CardTitle>الملاحظات الطبية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <p className="text-sm">{patient.medical_notes}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs for Appointments, Treatments, and Payments */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appointments">المواعيد</TabsTrigger>
          <TabsTrigger value="treatments">العلاجات</TabsTrigger>
          <TabsTrigger value="payments">الدفعات</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>سجل المواعيد</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">لا توجد مواعيد</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الطبيب</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوقت</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.doctor?.full_name || "غير محدد"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(appointment.scheduled_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(appointment.scheduled_at), "HH:mm")}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {appointment.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <CardTitle>سجل العلاجات</CardTitle>
            </CardHeader>
            <CardContent>
              {treatmentsLoading ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : treatmentRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">لا توجد علاجات</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العلاج</TableHead>
                      <TableHead>العلاج الفرعي</TableHead>
                      <TableHead>السن</TableHead>
                      <TableHead>التكلفة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الطبيب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatmentRecords.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.treatment?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {record.sub_treatment?.name || "-"}
                        </TableCell>
                        <TableCell>{record.tooth_number}</TableCell>
                        <TableCell>
                          {record.actual_cost ? `${record.actual_cost} ج.م` : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              record.is_completed
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {record.is_completed ? "مكتمل" : "غير مكتمل"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.performed_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.appointment?.doctor?.full_name || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>سجل الدفعات</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">لا توجد دفعات</p>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>تاريخ الدفع</TableHead>
                        <TableHead>الطبيب</TableHead>
                        <TableHead>الموعد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-bold">
                                {payment.amount} ج.م
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.paid_at), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            {payment.appointment?.doctor?.full_name || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.appointment?.scheduled_at
                              ? format(new Date(payment.appointment.scheduled_at), "dd/MM/yyyy")
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Total Payments Summary */}
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">إجمالي الدفعات</p>
                      <p className="text-2xl font-bold text-green-600">
                        {payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0).toFixed(2)} ج.م
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
