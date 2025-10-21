import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus, UserCheck, UserX, Clock, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  full_name: string;
  phone_number: string;
}

interface Appointment {
  id: string;
  scheduled_at: string;
  patient_id: string;
  patients: {
    full_name: string;
  };
}

interface WaitingPatient {
  id: string;
  patient_id: string;
  clinic_arrival_time: string;
  examination_room_entry_time: string | null;
  status: string;
  appointment_id: string | null;
  patients: {
    full_name: string;
    phone_number: string;
  };
  appointments: {
    scheduled_at: string;
  } | null;
}

export default function WaitingListManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchTodayAppointments();
    fetchWaitingList();

    const channel = supabase
      .channel('waiting-list-management')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_list'
        },
        () => {
          fetchWaitingList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, phone_number')
      .order('full_name');

    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }

    setPatients(data || []);
  };

  const fetchTodayAppointments = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('appointments')
      .select('id, scheduled_at, patient_id, patients(full_name)')
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())
      .order('scheduled_at');

    if (error) {
      console.error('Error fetching appointments:', error);
      return;
    }

    setTodayAppointments(data || []);
  };

  const fetchWaitingList = async () => {
    const { data, error } = await supabase
      .from('waiting_list')
      .select(`
        *,
        patients(full_name, phone_number),
        appointments(scheduled_at)
      `)
      .order('clinic_arrival_time', { ascending: true });

    if (error) {
      console.error('Error fetching waiting list:', error);
      return;
    }

    setWaitingList(data || []);
  };

  const addPatientToWaitingList = async () => {
    if (!selectedPatient) {
      toast.error("الرجاء اختيار مريض");
      return;
    }

    // Find if patient has appointment today
    const appointment = todayAppointments.find(apt => apt.patient_id === selectedPatient);

    const { error } = await supabase
      .from('waiting_list')
      .insert({
        patient_id: selectedPatient,
        appointment_id: appointment?.id || null,
        clinic_arrival_time: new Date().toISOString(),
        status: 'waiting'
      });

    if (error) {
      toast.error("حدث خطأ أثناء إضافة المريض");
      console.error('Error adding patient:', error);
      return;
    }

    toast.success("تم إضافة المريض إلى لائحة الانتظار");
    setSelectedPatient("");
  };

  const moveToExamination = async (id: string) => {
    const { error } = await supabase
      .from('waiting_list')
      .update({
        examination_room_entry_time: new Date().toISOString(),
        status: 'in_examination'
      })
      .eq('id', id);

    if (error) {
      toast.error("حدث خطأ");
      console.error('Error updating status:', error);
      return;
    }

    toast.success("تم نقل المريض إلى غرفة الفحص");
  };

  const completeVisit = async (id: string) => {
    const { error } = await supabase
      .from('waiting_list')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) {
      toast.error("حدث خطأ");
      console.error('Error completing visit:', error);
      return;
    }

    toast.success("تم إنهاء الزيارة");
  };

  const removeFromWaitingList = async (id: string) => {
    const { error } = await supabase
      .from('waiting_list')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("حدث خطأ");
      console.error('Error removing patient:', error);
      return;
    }

    toast.success("تم إزالة المريض من لائحة الانتظار");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="default">في الانتظار</Badge>;
      case 'in_examination':
        return <Badge variant="secondary">في الفحص</Badge>;
      case 'completed':
        return <Badge variant="outline">منتهي</Badge>;
      default:
        return null;
    }
  };

  const activeWaitingList = waitingList.filter(p => p.status !== 'completed');
  const completedList = waitingList.filter(p => p.status === 'completed');

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">إدارة لائحة الانتظار</h1>

      <Card>
        <CardHeader>
          <CardTitle>إضافة مريض إلى لائحة الانتظار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="flex-1 justify-between"
                >
                  {selectedPatient
                    ? patients.find((patient) => patient.id === selectedPatient)?.full_name
                    : "ابحث عن مريض..."}
                  <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0">
                <Command>
                  <CommandInput placeholder="ابحث عن مريض بالاسم أو رقم الهاتف..." />
                  <CommandList>
                    <CommandEmpty>لم يتم العثور على مرضى</CommandEmpty>
                    <CommandGroup>
                      {patients.map((patient) => (
                        <CommandItem
                          key={patient.id}
                          value={`${patient.full_name} ${patient.phone_number}`}
                          onSelect={() => {
                            setSelectedPatient(patient.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              selectedPatient === patient.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {patient.full_name} - {patient.phone_number}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button onClick={addPatientToWaitingList}>
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المرضى الحاليون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeWaitingList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                لا يوجد مرضى في الانتظار
              </p>
            ) : (
              activeWaitingList.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {patient.patients.full_name}
                      </h3>
                      {getStatusBadge(patient.status)}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium">وقت الموعد</p>
                        <p>
                          {patient.appointments
                            ? format(new Date(patient.appointments.scheduled_at), "p", { locale: ar })
                            : "غير محدد"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium">وقت الوصول</p>
                        <p>{format(new Date(patient.clinic_arrival_time), "p", { locale: ar })}</p>
                      </div>
                      
                      {patient.examination_room_entry_time && (
                        <div>
                          <p className="font-medium">وقت الدخول للفحص</p>
                          <p>
                            {format(new Date(patient.examination_room_entry_time), "p", { locale: ar })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {patient.status === 'waiting' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => moveToExamination(patient.id)}
                      >
                        <UserCheck className="ml-2 h-4 w-4" />
                        نقل للفحص
                      </Button>
                    )}
                    
                    {patient.status === 'in_examination' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => completeVisit(patient.id)}
                      >
                        <Clock className="ml-2 h-4 w-4" />
                        إنهاء الزيارة
                      </Button>
                    )}
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromWaitingList(patient.id)}
                    >
                      <UserX className="ml-2 h-4 w-4" />
                      إزالة
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {completedList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الزيارات المنتهية اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedList.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{patient.patients.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(patient.clinic_arrival_time), "p", { locale: ar })} - 
                      {patient.examination_room_entry_time && 
                        ` ${format(new Date(patient.examination_room_entry_time), "p", { locale: ar })}`}
                    </p>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
