import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Pencil, Trash2, MoreVertical, FileText, PlayCircle, ClipboardList, Eye, User } from "lucide-react";
import TreatmentRecordDialog from "@/components/TreatmentRecordDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService, patientService, doctorService, treatmentService, unfinishedTreatmentService } from "@/lib/api/services";
import { Appointment, AppointmentStatus } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Appointments() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Filter states
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "">("");

  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    doctor_id: "",
    scheduled_at: "",
    notes: "",
  });



  // Resume Treatment states
  const [selectedUnfinishedTreatment, setSelectedUnfinishedTreatment] = useState<string>("");
  const [resumeSteps, setResumeSteps] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments with filters
  const { data: appointmentsResponse, isLoading } = useQuery({
    queryKey: ["appointments", filterDoctor, filterStartDate, filterEndDate, filterStatus],
    queryFn: async () => {
      return await appointmentService.getAll({
        doctor_id: filterDoctor || undefined,
        date_from: filterStartDate || undefined,
        date_to: filterEndDate || undefined,
        status: filterStatus || undefined,
        per_page: 100,
      });
    },
  });

  const appointments = appointmentsResponse?.data || [];

  // Fetch patients for dropdown
  const { data: patientsResponse } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.getAll({ per_page: 1000 }),
  });
  const patients = patientsResponse?.data || [];

  // Fetch doctors for dropdown
  const { data: doctorsResponse } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorService.getAll({ per_page: 100 }),
  });
  const doctors = doctorsResponse?.data || [];

  // Fetch treatments for record dialog
  const { data: treatmentsResponse } = useQuery({
    queryKey: ["treatments"],
    queryFn: () => treatmentService.getAll({ per_page: 100 }),
    enabled: isRecordDialogOpen,
  });
  const treatments = treatmentsResponse?.data || [];



  // Fetch unfinished treatments for resume dialog
  const { data: unfinishedTreatments = [] } = useQuery({
    queryKey: ["unfinished-treatments", selectedAppointment?.patient_id],
    queryFn: () => unfinishedTreatmentService.getByPatient(selectedAppointment!.patient_id),
    enabled: isResumeDialogOpen && !!selectedAppointment?.patient_id,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointment: typeof newAppointment) => {
      return await appointmentService.create(appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsDialogOpen(false);
      setNewAppointment({
        patient_id: "",
        doctor_id: "",
        scheduled_at: "",
        notes: "",
      });
      toast({
        title: "نجح",
        description: "تم إضافة الموعد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة الموعد",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (appointment: Appointment) => {
      return await appointmentService.update(appointment.id, appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      toast({
        title: "نجح",
        description: "تم تحديث الموعد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث الموعد",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await appointmentService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "نجح",
        description: "تم حذف الموعد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حذف الموعد",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { appointmentId: string; status: AppointmentStatus }) => {
      return await appointmentService.updateStatus(data.appointmentId, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "نجح",
        description: "تم تحديث حالة الموعد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث حالة الموعد",
        variant: "destructive",
      });
    },
  });

  const resumeTreatmentMutation = useMutation({
    mutationFn: async (data: {
      appointmentId: string;
      treatment_record_id: string;
      completed_steps?: string[];
    }) => {
      const { appointmentId, ...treatmentData } = data;
      return await appointmentService.resumeTreatment(appointmentId, treatmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["unfinished-treatments"] });
      setIsResumeDialogOpen(false);
      setSelectedUnfinishedTreatment("");
      setResumeSteps([]);
      setSelectedAppointment(null);
      toast({
        title: "نجح",
        description: "تم استكمال العلاج بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في استكمال العلاج",
        variant: "destructive",
      });
    },
  });

  const recordTreatmentMutation = useMutation({
    mutationFn: async (data: {
      appointmentId: string;
      treatment_id: string;
      sub_treatment_id: string;
      tooth_numbers: string[];
      actual_cost?: number;
      payment_amount?: number;
      notes?: string;
      completed_steps?: string[];
    }) => {
      const { appointmentId, ...treatmentData } = data;
      return await appointmentService.recordTreatment(appointmentId, treatmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsRecordDialogOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "نجح",
        description: "تم تسجيل العلاج بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تسجيل العلاج",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert local datetime to UTC for storage
    const appointmentData = {
      ...newAppointment,
      scheduled_at: newAppointment.scheduled_at ? 
        new Date(newAppointment.scheduled_at).toISOString() : 
        newAppointment.scheduled_at
    };
    createAppointmentMutation.mutate(appointmentData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointment) {
      // Convert local datetime to UTC for storage
      const appointmentData = {
        ...editingAppointment,
        scheduled_at: editingAppointment.scheduled_at ? 
          (editingAppointment.scheduled_at.length === 16 ? 
            new Date(editingAppointment.scheduled_at).toISOString() : 
            editingAppointment.scheduled_at) : 
          editingAppointment.scheduled_at
      };
      updateAppointmentMutation.mutate(appointmentData);
    }
  };

  const clearFilters = () => {
    setFilterDoctor("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterStatus("");
  };

  const getStatusBadgeColor = (status: AppointmentStatus) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">المواعيد</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="ml-2 h-4 w-4" />
              إضافة موعد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة موعد جديد</DialogTitle>
              <DialogDescription>
                قم بإضافة موعد جديد للمريض
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patient_id">المريض</Label>
                <Select
                  value={newAppointment.patient_id}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, patient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المريض" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doctor_id">الطبيب</Label>
                <Select
                  value={newAppointment.doctor_id}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, doctor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduled_at">التاريخ والوقت</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={newAppointment.scheduled_at}
                  onChange={(e) => setNewAppointment({ ...newAppointment, scheduled_at: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={createAppointmentMutation.isPending}>
                {createAppointmentMutation.isPending ? "جاري الإضافة..." : "إضافة موعد"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>تصفية المواعيد</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>الطبيب</Label>
              <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأطباء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأطباء</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as AppointmentStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="Scheduled">مجدول</SelectItem>
                  <SelectItem value="Completed">مكتمل</SelectItem>
                  <SelectItem value="Cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المواعيد</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل المواعيد...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المريض</TableHead>
                  <TableHead>الطبيب</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوقت</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.patient?.full_name || "غير محدد"}
                    </TableCell>
                    <TableCell>
                      {appointment.doctor?.full_name || "غير محدد"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.scheduled_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.scheduled_at), "HH:mm")}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(appointment.status)}`}>
                        {appointment.status === "Scheduled" && "مجدول"}
                        {appointment.status === "Completed" && "مكتمل"}
                        {appointment.status === "Cancelled" && "ملغي"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsRecordDialogOpen(true);
                            }}
                          >
                            <FileText className="ml-2 h-4 w-4" />
                            تسجيل علاج
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsResumeDialogOpen(true);
                            }}
                          >
                            <PlayCircle className="ml-2 h-4 w-4" />
                            استكمال علاج
                          </DropdownMenuItem>

                          <DropdownMenuItem disabled>
                            <ClipboardList className="ml-2 h-4 w-4" />
                            تنفيذ خطة علاج
                          </DropdownMenuItem>

                          <DropdownMenuItem disabled>
                            <Eye className="ml-2 h-4 w-4" />
                            عرض الخطوات
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              تغيير الحالة
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({
                                  appointmentId: appointment.id,
                                  status: "Scheduled"
                                })}
                                disabled={appointment.status === "Scheduled"}
                              >
                                مجدول
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({
                                  appointmentId: appointment.id,
                                  status: "Completed"
                                })}
                                disabled={appointment.status === "Completed"}
                              >
                                مكتمل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({
                                  appointmentId: appointment.id,
                                  status: "Cancelled"
                                })}
                                disabled={appointment.status === "Cancelled"}
                              >
                                ملغي
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuItem
                            onClick={() => navigate(`/patients/${appointment.patient_id}`)}
                          >
                            <User className="ml-2 h-4 w-4" />
                            عرض ملف المريض
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setEditingAppointment(appointment);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="ml-2 h-4 w-4 text-destructive" />
                                <span className="text-destructive">حذف</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذا الموعد؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Treatment Dialog */}
      <TreatmentRecordDialog
        open={isRecordDialogOpen}
        onOpenChange={(open) => {
          setIsRecordDialogOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
        selectedAppointment={selectedAppointment}
        treatments={treatments}
        onSubmit={(record, selectedSteps) => {
          if (!selectedAppointment) return;
          
          recordTreatmentMutation.mutate({
            appointmentId: selectedAppointment.id,
            treatment_id: record.treatment_id,
            sub_treatment_id: record.sub_treatment_id,
            tooth_numbers: record.tooth_numbers.length > 0 ? record.tooth_numbers : ['0'],
            actual_cost: record.actual_cost ? parseFloat(record.actual_cost) : undefined,
            payment_amount: record.payment_amount ? parseFloat(record.payment_amount) : undefined,
            notes: record.notes,
            completed_steps: selectedSteps,
          });
        }}
        isSubmitting={recordTreatmentMutation.isPending}
      />

      {/* Resume Treatment Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={(open) => {
        setIsResumeDialogOpen(open);
        if (!open) {
          setSelectedUnfinishedTreatment("");
          setResumeSteps([]);
          setSelectedAppointment(null);
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              استكمال علاج - {selectedAppointment?.patient?.full_name}
            </DialogTitle>
            <DialogDescription>
              اختر العلاج غير المكتمل واستكمل الخطوات المتبقية
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {unfinishedTreatments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد علاجات غير مكتملة لهذا المريض
              </div>
            ) : (
              <>
                <div>
                  <Label>اختر العلاج غير المكتمل</Label>
                  <Select value={selectedUnfinishedTreatment} onValueChange={setSelectedUnfinishedTreatment}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العلاج" />
                    </SelectTrigger>
                    <SelectContent>
                      {unfinishedTreatments.map((ut) => (
                        <SelectItem key={ut.id} value={ut.id}>
                          {ut.treatment?.name} - {ut.sub_treatment?.name} (سن {ut.tooth_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUnfinishedTreatment && (() => {
                  const selectedUT = unfinishedTreatments.find(ut => ut.id === selectedUnfinishedTreatment);
                  const steps = Array.isArray(selectedUT?.sub_treatment?.sub_treatment_steps) 
                    ? selectedUT.sub_treatment.sub_treatment_steps 
                    : [];
                  const completedSteps = selectedUT?.completed_steps || [];
                  
                  // Debug: log completed steps
                  console.log('Completed steps:', completedSteps);
                  console.log('Completed steps types:', completedSteps.map((s: any) => typeof s));
                  
                  return steps.length > 0 ? (
                    <div className="space-y-2">
                      <Label>اختر الخطوات المكتملة في هذا الموعد:</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        تم إكمال {completedSteps.length} من {steps.length} خطوات
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {steps.map((step: any, index: number) => {
                          // Check if step is completed (handle both string and number types)
                          const isAlreadyCompleted = completedSteps.some((s: any) => 
                            Number(s) === index || s === index || s === index.toString()
                          );
                          return (
                            <div key={index} className={`flex items-center space-x-2 space-x-reverse p-2 border rounded ${isAlreadyCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                              <input
                                type="checkbox"
                                id={`resume-step-${index}`}
                                checked={isAlreadyCompleted || resumeSteps.includes(index.toString())}
                                disabled={isAlreadyCompleted}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setResumeSteps([...resumeSteps, index.toString()]);
                                  } else {
                                    setResumeSteps(resumeSteps.filter(s => s !== index.toString()));
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <label htmlFor={`resume-step-${index}`} className={`flex-1 ${isAlreadyCompleted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <div className="font-medium">
                                  {step.step_name}
                                  {isAlreadyCompleted && <span className="text-green-600 text-xs mr-2">✓ مكتمل</span>}
                                </div>
                                {step.step_description && (
                                  <div className="text-sm text-muted-foreground">{step.step_description}</div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                  الإنجاز: {step.completion_percentage || 0}%
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد خطوات لهذا العلاج
                    </div>
                  );
                })()}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsResumeDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedAppointment || !selectedUnfinishedTreatment) return;
                      
                      resumeTreatmentMutation.mutate({
                        appointmentId: selectedAppointment.id,
                        treatment_record_id: selectedUnfinishedTreatment,
                        completed_steps: resumeSteps,
                      });
                    }}
                    disabled={!selectedUnfinishedTreatment || resumeTreatmentMutation.isPending}
                  >
                    {resumeTreatmentMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الموعد</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الموعد
            </DialogDescription>
          </DialogHeader>
          {editingAppointment && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>المريض</Label>
                <Select
                  value={editingAppointment.patient_id}
                  onValueChange={(value) => setEditingAppointment({ ...editingAppointment, patient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الطبيب</Label>
                <Select
                  value={editingAppointment.doctor_id}
                  onValueChange={(value) => setEditingAppointment({ ...editingAppointment, doctor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>التاريخ والوقت</Label>
                <Input
                  type="datetime-local"
                  value={(() => {
                    // Convert UTC to local time for display
                    const date = new Date(editingAppointment.scheduled_at);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                  })()}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, scheduled_at: e.target.value })}
                />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select
                  value={editingAppointment.status}
                  onValueChange={(value) => setEditingAppointment({ ...editingAppointment, status: value as AppointmentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">مجدول</SelectItem>
                    <SelectItem value="Completed">مكتمل</SelectItem>
                    <SelectItem value="Cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={editingAppointment.notes || ""}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={updateAppointmentMutation.isPending}>
                {updateAppointmentMutation.isPending ? "جاري التحديث..." : "تحديث"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
