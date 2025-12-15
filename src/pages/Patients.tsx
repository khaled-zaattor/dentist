import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Calendar, FileText, Edit, Trash2, FileDown, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/lib/api/services";
import { Patient } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from "date-fns";
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

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({
    full_name: "",
    date_of_birth: "",
    phone_number: "",
    contact: "",
    medical_notes: "",
    address: "",
    job: "",
  });
  const [importingFile, setImportingFile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const exportToExcel = async () => {
    try {
      // Fetch all patients for export
      const response = await patientService.getAll({ per_page: 1000 });
      const allPatients = response.data;

      if (!allPatients || allPatients.length === 0) {
        toast({ title: "لا توجد بيانات", description: "لا يوجد مرضى للتصدير" });
        return;
      }
      
      // Convert data to Excel format
      const dataForExcel = allPatients.map((patient) => ({
        'الاسم': patient.full_name,
        'تاريخ الميلاد': format(new Date(patient.date_of_birth), 'dd/MM/yyyy'),
        'الهاتف': patient.phone_number,
        'العنوان': patient.address || '-',
        'المهنة': patient.job || '-',
        'جهة الاتصال': patient.contact || '-',
        'الملاحظات الطبية': patient.medical_notes || '-',
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataForExcel, { 
        header: ['الاسم', 'تاريخ الميلاد', 'الهاتف', 'العنوان', 'المهنة', 'جهة الاتصال', 'الملاحظات الطبية'] 
      });
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'المرضى');
      
      // Convert to file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      // Save file
      saveAs(fileData, `قائمة_المرضى_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
      
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${allPatients.length} مريضًا إلى ملف إكسل`,
      });
    } catch (error) {
      console.error('Error exporting patients:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير قائمة المرضى",
        variant: "destructive",
      });
    }
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportingFile(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip first row (headers)
        const rows = jsonData.slice(1) as any[][];
        const validPatients = [];
        
        for (const row of rows) {
          if (!row[0] || !row[1] || !row[2]) continue;
          
          const patientData = {
            full_name: row[0]?.toString() || '',
            date_of_birth: row[1] ? new Date(row[1]).toISOString().split('T')[0] : '',
            phone_number: row[2]?.toString() || '',
            address: row[3]?.toString() === '-' ? '' : row[3]?.toString() || '',
            job: row[4]?.toString() === '-' ? '' : row[4]?.toString() || '',
            contact: row[5]?.toString() === '-' ? '' : row[5]?.toString() || '',
            medical_notes: row[6]?.toString() === '-' ? '' : row[6]?.toString() || '',
          };
          
          if (patientData.full_name && patientData.date_of_birth && patientData.phone_number) {
            validPatients.push(patientData);
          }
        }
        
        if (validPatients.length === 0) {
          toast({
            title: "خطأ في الاستيراد",
            description: "لا توجد بيانات صالحة في الملف",
            variant: "destructive",
          });
          setImportingFile(false);
          return;
        }
        
        // Insert data into database
        let successCount = 0;
        for (const patient of validPatients) {
          try {
            await patientService.create(patient);
            successCount++;
          } catch (error) {
            console.error('Error importing patient:', error);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        toast({
          title: "نجح الاستيراد",
          description: `تم استيراد ${successCount} مريض بنجاح`,
        });
      } catch (error) {
        toast({
          title: "خطأ في قراءة الملف",
          description: "تأكد من أن الملف بتنسيق إكسل صحيح",
          variant: "destructive",
        });
      } finally {
        setImportingFile(false);
        event.target.value = '';
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: patientsResponse, isLoading } = useQuery({
    queryKey: ["patients", searchTerm, currentPage],
    queryFn: async () => {
      return await patientService.getAll({
        search: searchTerm,
        per_page: 15,
        page: currentPage,
      });
    },
  });

  const patients = patientsResponse?.data || [];

  const createPatientMutation = useMutation({
    mutationFn: async (patient: typeof newPatient) => {
      return await patientService.create(patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setIsAddDialogOpen(false);
      setNewPatient({
        full_name: "",
        date_of_birth: "",
        phone_number: "",
        contact: "",
        medical_notes: "",
        address: "",
        job: "",
      });
      toast({
        title: "تم إضافة المريض",
        description: "تم إضافة المريض بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء إضافة المريض",
        variant: "destructive",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (patient: Patient) => {
      return await patientService.update(patient.id, patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setIsEditDialogOpen(false);
      setEditingPatient(null);
      toast({
        title: "تم تحديث المريض",
        description: "تم تحديث بيانات المريض بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء تحديث المريض",
        variant: "destructive",
      });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await patientService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: "تم حذف المريض",
        description: "تم حذف المريض بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء حذف المريض",
        variant: "destructive",
      });
    },
  });

  const handleAddPatient = () => {
    createPatientMutation.mutate(newPatient);
  };

  const handleEditPatient = () => {
    if (editingPatient) {
      updatePatientMutation.mutate(editingPatient);
    }
  };

  const handleDeletePatient = (id: string) => {
    deletePatientMutation.mutate(id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المرضى</h1>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            <FileDown className="ml-2 h-4 w-4" />
            تصدير إلى Excel
          </Button>
          <label htmlFor="import-excel">
            <Button variant="outline" asChild disabled={importingFile}>
              <span>
                <Upload className="ml-2 h-4 w-4" />
                {importingFile ? "جاري الاستيراد..." : "استيراد من Excel"}
              </span>
            </Button>
          </label>
          <input
            id="import-excel"
            type="file"
            accept=".xlsx,.xls"
            onChange={importFromExcel}
            className="hidden"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مريض جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة مريض جديد</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  <Input
                    id="full_name"
                    value={newPatient.full_name}
                    onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newPatient.date_of_birth}
                    onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone_number">رقم الهاتف</Label>
                  <Input
                    id="phone_number"
                    value={newPatient.phone_number}
                    onChange={(e) => setNewPatient({ ...newPatient, phone_number: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="job">المهنة</Label>
                  <Input
                    id="job"
                    value={newPatient.job}
                    onChange={(e) => setNewPatient({ ...newPatient, job: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">جهة الاتصال</Label>
                  <Input
                    id="contact"
                    value={newPatient.contact}
                    onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medical_notes">الملاحظات الطبية</Label>
                  <Textarea
                    id="medical_notes"
                    value={newPatient.medical_notes}
                    onChange={(e) => setNewPatient({ ...newPatient, medical_notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddPatient} disabled={createPatientMutation.isPending}>
                  {createPatientMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن مريض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>تاريخ الميلاد</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                    <TableCell>{format(new Date(patient.date_of_birth), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{patient.phone_number}</TableCell>
                    <TableCell>{patient.address || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPatient(patient);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف جميع بيانات المريض بشكل نهائي
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePatient(patient.id)}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المريض</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_full_name">الاسم الكامل</Label>
                <Input
                  id="edit_full_name"
                  value={editingPatient.full_name}
                  onChange={(e) => setEditingPatient({ ...editingPatient, full_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_date_of_birth">تاريخ الميلاد</Label>
                <Input
                  id="edit_date_of_birth"
                  type="date"
                  value={editingPatient.date_of_birth}
                  onChange={(e) => setEditingPatient({ ...editingPatient, date_of_birth: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_phone_number">رقم الهاتف</Label>
                <Input
                  id="edit_phone_number"
                  value={editingPatient.phone_number}
                  onChange={(e) => setEditingPatient({ ...editingPatient, phone_number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_address">العنوان</Label>
                <Input
                  id="edit_address"
                  value={editingPatient.address || ''}
                  onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_job">المهنة</Label>
                <Input
                  id="edit_job"
                  value={editingPatient.job || ''}
                  onChange={(e) => setEditingPatient({ ...editingPatient, job: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_contact">جهة الاتصال</Label>
                <Input
                  id="edit_contact"
                  value={editingPatient.contact || ''}
                  onChange={(e) => setEditingPatient({ ...editingPatient, contact: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_medical_notes">الملاحظات الطبية</Label>
                <Textarea
                  id="edit_medical_notes"
                  value={editingPatient.medical_notes || ''}
                  onChange={(e) => setEditingPatient({ ...editingPatient, medical_notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditPatient} disabled={updatePatientMutation.isPending}>
              {updatePatientMutation.isPending ? "جاري التحديث..." : "تحديث"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
