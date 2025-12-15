import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { waitingListService } from "@/lib/api/services/waitingList.service";
import { patientService } from "@/lib/api/services";
import { WaitingListStatus } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function WaitingListManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    patient_id: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: waitingList, isLoading } = useQuery({
    queryKey: ["waiting-list"],
    queryFn: () => waitingListService.getAll(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: patientsResponse } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.getAll({ per_page: 1000 }),
  });
  const patients = patientsResponse?.data || [];

  const addToWaitingListMutation = useMutation({
    mutationFn: (data: typeof newEntry) => waitingListService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-list"] });
      setIsDialogOpen(false);
      setNewEntry({ patient_id: "" });
      toast({
        title: "نجح",
        description: "تم إضافة المريض إلى قائمة الانتظار",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة المريض",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WaitingListStatus }) =>
      waitingListService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-list"] });
      toast({
        title: "نجح",
        description: "تم تحديث الحالة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث الحالة",
        variant: "destructive",
      });
    },
  });

  const removeFromListMutation = useMutation({
    mutationFn: (id: string) => waitingListService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-list"] });
      toast({
        title: "نجح",
        description: "تم إزالة المريض من القائمة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إزالة المريض",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: WaitingListStatus) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "in_examination":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: WaitingListStatus) => {
    switch (status) {
      case "waiting":
        return "في الانتظار";
      case "in_examination":
        return "في الفحص";
      case "completed":
        return "مكتمل";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl lg:text-3xl font-bold">إدارة قائمة الانتظار</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مريض
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مريض إلى قائمة الانتظار</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>المريض</Label>
                <Select
                  value={newEntry.patient_id}
                  onValueChange={(value) => setNewEntry({ patient_id: value })}
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
              <Button
                onClick={() => addToWaitingListMutation.mutate(newEntry)}
                disabled={!newEntry.patient_id || addToWaitingListMutation.isPending}
              >
                {addToWaitingListMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الانتظار الحالية</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <div className="space-y-4">
              {waitingList?.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{entry.patient?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        وقت الوصول: {format(new Date(entry.clinic_arrival_time), "HH:mm")}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${getStatusBadge(entry.status)}`}>
                        {getStatusText(entry.status)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {entry.status === "waiting" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: entry.id,
                              status: "in_examination",
                            })
                          }
                        >
                          <ArrowRight className="ml-2 h-4 w-4" />
                          نقل للفحص
                        </Button>
                      )}
                      {entry.status === "in_examination" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: entry.id,
                              status: "completed",
                            })
                          }
                        >
                          إكمال
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromListMutation.mutate(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
