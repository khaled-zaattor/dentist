import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Save, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentService, subTreatmentService } from "@/lib/api/services";
import { Treatment, SubTreatment, SubTreatmentStepData } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
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

export default function Treatments() {
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubTreatmentDialogOpen, setIsSubTreatmentDialogOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());
  const [expandedSubTreatments, setExpandedSubTreatments] = useState<Set<string>>(new Set());
  const [editingSteps, setEditingSteps] = useState<{ [key: string]: SubTreatmentStepData[] }>({});
  
  const [newTreatment, setNewTreatment] = useState({
    name: "",
    description: "",
  });

  const [newSubTreatment, setNewSubTreatment] = useState({
    name: "",
    estimated_cost: "",
    tooth_association: "not_related" as "not_related" | "related" | "required",
  });

  const [newSteps, setNewSteps] = useState<{ [key: string]: { step_name: string; step_description: string; completion_percentage: number } }>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: treatmentsResponse, isLoading, error } = useQuery({
    queryKey: ["treatments"],
    queryFn: () => treatmentService.getAll({ per_page: 100 }),
  });

  const treatments = treatmentsResponse?.data || [];

  const createTreatmentMutation = useMutation({
    mutationFn: async (treatment: typeof newTreatment) => {
      return await treatmentService.create(treatment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      setIsTreatmentDialogOpen(false);
      setNewTreatment({ name: "", description: "" });
      toast({
        title: "نجح",
        description: "تم إضافة العلاج بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة العلاج",
        variant: "destructive",
      });
    },
  });

  const updateTreatmentMutation = useMutation({
    mutationFn: async (treatment: Treatment) => {
      return await treatmentService.update(treatment.id, treatment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      setIsEditDialogOpen(false);
      setEditingTreatment(null);
      toast({
        title: "نجح",
        description: "تم تحديث العلاج بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث العلاج",
        variant: "destructive",
      });
    },
  });

  const deleteTreatmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await treatmentService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      toast({
        title: "نجح",
        description: "تم حذف العلاج بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حذف العلاج",
        variant: "destructive",
      });
    },
  });

  const createSubTreatmentMutation = useMutation({
    mutationFn: async ({ treatmentId, data }: { treatmentId: string; data: typeof newSubTreatment }) => {
      return await subTreatmentService.create(treatmentId, {
        ...data,
        estimated_cost: data.estimated_cost ? parseFloat(data.estimated_cost) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      setIsSubTreatmentDialogOpen(false);
      setNewSubTreatment({ name: "", estimated_cost: "", tooth_association: "not_related" });
      setSelectedTreatmentId(null);
      toast({
        title: "نجح",
        description: "تم إضافة العلاج الفرعي بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة العلاج الفرعي",
        variant: "destructive",
      });
    },
  });

  const deleteSubTreatmentMutation = useMutation({
    mutationFn: async ({ treatmentId, subTreatmentId }: { treatmentId: string; subTreatmentId: string }) => {
      return await subTreatmentService.delete(treatmentId, subTreatmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      toast({
        title: "نجح",
        description: "تم حذف العلاج الفرعي بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حذف العلاج الفرعي",
        variant: "destructive",
      });
    },
  });

  const updateSubTreatmentStepsMutation = useMutation({
    mutationFn: async ({ treatmentId, subTreatmentId, steps }: { 
      treatmentId: string; 
      subTreatmentId: string; 
      steps: SubTreatmentStepData[] 
    }) => {
      return await subTreatmentService.update(treatmentId, subTreatmentId, {
        sub_treatment_steps: steps,
      });
    },
    onSuccess: async (data, variables) => {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["treatments"] });
      
      // Clear editing state after a short delay to allow refetch
      const key = `${variables.treatmentId}-${variables.subTreatmentId}`;
      setTimeout(() => {
        setEditingSteps(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 200);
      
      toast({
        title: "نجح",
        description: "تم تحديث خطوات العلاج بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث خطوات العلاج",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTreatmentMutation.mutate(newTreatment);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTreatment) {
      updateTreatmentMutation.mutate(editingTreatment);
    }
  };

  const handleSubTreatmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTreatmentId) {
      createSubTreatmentMutation.mutate({
        treatmentId: selectedTreatmentId,
        data: newSubTreatment,
      });
    }
  };

  const toggleTreatmentExpansion = (treatmentId: string) => {
    const newExpanded = new Set(expandedTreatments);
    if (newExpanded.has(treatmentId)) {
      newExpanded.delete(treatmentId);
    } else {
      newExpanded.add(treatmentId);
    }
    setExpandedTreatments(newExpanded);
  };

  const toggleSubTreatmentExpansion = (subTreatmentId: string) => {
    const newExpanded = new Set(expandedSubTreatments);
    if (newExpanded.has(subTreatmentId)) {
      newExpanded.delete(subTreatmentId);
    } else {
      newExpanded.add(subTreatmentId);
    }
    setExpandedSubTreatments(newExpanded);
  };

  const getStepsKey = (treatmentId: string, subTreatmentId: string) => `${treatmentId}-${subTreatmentId}`;

  const getNewStepKey = (subTreatmentId: string) => `new-${subTreatmentId}`;

  const initializeStepsEditing = (treatmentId: string, subTreatment: SubTreatment) => {
    const key = getStepsKey(treatmentId, subTreatment.id);
    const existingSteps = Array.isArray(subTreatment.sub_treatment_steps) 
      ? subTreatment.sub_treatment_steps.map((step: any) => ({
          step_name: step.step_name,
          step_description: step.step_description || "",
          step_order: step.step_order,
          completion_percentage: step.completion_percentage || 0,
        }))
      : [];
    setEditingSteps(prev => ({ ...prev, [key]: existingSteps }));
  };

  const handleAddStep = (treatmentId: string, subTreatmentId: string) => {
    const newStepKey = getNewStepKey(subTreatmentId);
    const newStepData = newSteps[newStepKey];
    
    if (!newStepData?.step_name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الخطوة",
        variant: "destructive",
      });
      return;
    }

    const key = getStepsKey(treatmentId, subTreatmentId);
    const currentSteps = editingSteps[key] || [];
    
    const newStep: SubTreatmentStepData = {
      step_name: newStepData.step_name,
      step_description: newStepData.step_description,
      step_order: currentSteps.length + 1,
      completion_percentage: newStepData.completion_percentage || 0,
    };
    
    setEditingSteps(prev => ({
      ...prev,
      [key]: [...currentSteps, newStep],
    }));
    
    setNewSteps(prev => {
      const updated = { ...prev };
      delete updated[newStepKey];
      return updated;
    });
  };

  const handleRemoveStep = (treatmentId: string, subTreatmentId: string, index: number) => {
    const key = getStepsKey(treatmentId, subTreatmentId);
    const currentSteps = editingSteps[key] || [];
    const updatedSteps = currentSteps.filter((_, i) => i !== index);
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      step_order: i + 1,
    }));
    setEditingSteps(prev => ({ ...prev, [key]: reorderedSteps }));
  };

  const handleMoveStep = (treatmentId: string, subTreatmentId: string, index: number, direction: 'up' | 'down') => {
    const key = getStepsKey(treatmentId, subTreatmentId);
    const currentSteps = editingSteps[key] || [];
    
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === currentSteps.length - 1)
    ) {
      return;
    }

    const newSteps = [...currentSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      step_order: i + 1,
    }));
    setEditingSteps(prev => ({ ...prev, [key]: reorderedSteps }));
  };

  const handleUpdateStepPercentage = (treatmentId: string, subTreatmentId: string, index: number, percentage: number) => {
    const key = getStepsKey(treatmentId, subTreatmentId);
    const currentSteps = editingSteps[key] || [];
    const updatedSteps = [...currentSteps];
    updatedSteps[index] = { ...updatedSteps[index], completion_percentage: percentage };
    setEditingSteps(prev => ({ ...prev, [key]: updatedSteps }));
  };

  const handleSaveSteps = (treatmentId: string, subTreatmentId: string) => {
    const key = getStepsKey(treatmentId, subTreatmentId);
    const steps = editingSteps[key] || [];
    
    updateSubTreatmentStepsMutation.mutate({
      treatmentId,
      subTreatmentId,
      steps,
    });
  };

  const handleCancelStepsEditing = (treatmentId: string, subTreatmentId: string) => {
    const key = getStepsKey(treatmentId, subTreatmentId);
    setEditingSteps(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">العلاجات</h1>
        <Dialog open={isTreatmentDialogOpen} onOpenChange={setIsTreatmentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="ml-2 h-4 w-4" />
              إضافة علاج
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة علاج جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم العلاج</Label>
                <Input
                  id="name"
                  value={newTreatment.name}
                  onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={createTreatmentMutation.isPending}>
                {createTreatmentMutation.isPending ? "جاري الإضافة..." : "إضافة علاج"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة العلاجات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري تحميل العلاجات...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              حدث خطأ في تحميل العلاجات. يرجى المحاولة مرة أخرى.
            </div>
          ) : treatments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد علاجات. اضغط على "إضافة علاج" لإضافة علاج جديد.
            </div>
          ) : (
            <div className="space-y-4">
              {treatments.map((treatment) => (
                <Card key={treatment.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {treatment.sub_treatments && treatment.sub_treatments.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTreatmentExpansion(treatment.id)}
                          >
                            {expandedTreatments.has(treatment.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <h3 className="font-semibold text-lg">{treatment.name}</h3>
                      </div>
                      {treatment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {treatment.description}
                        </p>
                      )}
                      {treatment.sub_treatments && treatment.sub_treatments.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          عدد العلاجات الفرعية: {treatment.sub_treatments.length}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTreatmentId(treatment.id);
                          setIsSubTreatmentDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        علاج فرعي
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTreatment(treatment);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف العلاج "{treatment.name}"؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTreatmentMutation.mutate(treatment.id)}
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Sub-treatments list */}
                  {expandedTreatments.has(treatment.id) && treatment.sub_treatments && treatment.sub_treatments.length > 0 && (
                    <div className="mt-4 mr-8 space-y-3">
                      {treatment.sub_treatments.map((subTreatment) => {
                        const stepsKey = getStepsKey(treatment.id, subTreatment.id);
                        const isEditingSteps = !!editingSteps[stepsKey];
                        
                        // Get steps from editing state or from the subTreatment data
                        let currentSteps: SubTreatmentStepData[] = [];
                        if (isEditingSteps) {
                          currentSteps = editingSteps[stepsKey];
                        } else if (subTreatment.sub_treatment_steps) {
                          if (Array.isArray(subTreatment.sub_treatment_steps)) {
                            currentSteps = subTreatment.sub_treatment_steps.map((step: any) => ({
                              step_name: step.step_name || '',
                              step_description: step.step_description || '',
                              step_order: step.step_order || 0,
                              completion_percentage: step.completion_percentage || 0,
                            }));
                          }
                        }
                        
                        const newStepKey = getNewStepKey(subTreatment.id);
                        const isExpanded = expandedSubTreatments.has(subTreatment.id);

                        return (
                          <Card key={subTreatment.id} className="p-3 bg-muted/50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSubTreatmentExpansion(subTreatment.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                <div className="flex-1">
                                  <h4 className="font-medium">{subTreatment.name}</h4>
                                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                    {subTreatment.estimated_cost && (
                                      <span>التكلفة: {subTreatment.estimated_cost} ج.م</span>
                                    )}
                                    <span>
                                      {subTreatment.tooth_association === 'not_related' ? 'لا يوجد' :
                                       subTreatment.tooth_association === 'required' ? 'مطلوب' :
                                       'مرتبط'}
                                    </span>
                                    {currentSteps.length > 0 && (
                                      <span>الخطوات: {currentSteps.length}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {isEditingSteps ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSaveSteps(treatment.id, subTreatment.id)}
                                      disabled={updateSubTreatmentStepsMutation.isPending}
                                    >
                                      <Save className="h-4 w-4 ml-1" />
                                      حفظ
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCancelStepsEditing(treatment.id, subTreatment.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        initializeStepsEditing(treatment.id, subTreatment);
                                        if (!isExpanded) {
                                          toggleSubTreatmentExpansion(subTreatment.id);
                                        }
                                      }}
                                    >
                                      <Edit className="h-4 w-4 ml-1" />
                                      تعديل الخطوات
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            هل أنت متأكد من حذف العلاج الفرعي "{subTreatment.name}"؟
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => deleteSubTreatmentMutation.mutate({
                                              treatmentId: treatment.id,
                                              subTreatmentId: subTreatment.id,
                                            })}
                                          >
                                            حذف
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Steps Section */}
                            {isExpanded && (
                              <div className="mt-3 mr-6 space-y-2 border-r-2 border-muted pr-3">
                                {currentSteps.length === 0 && !isEditingSteps ? (
                                  <p className="text-sm text-muted-foreground">لا توجد خطوات</p>
                                ) : (
                                  currentSteps.map((step: any, index: number) => (
                                    <div key={index} className="bg-background p-3 rounded-md border">
                                      <div className="flex items-start gap-2">
                                        {isEditingSteps && (
                                          <div className="flex flex-col gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleMoveStep(treatment.id, subTreatment.id, index, 'up')}
                                              disabled={index === 0}
                                              className="h-5 w-5 p-0"
                                            >
                                              <ChevronUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleMoveStep(treatment.id, subTreatment.id, index, 'down')}
                                              disabled={index === currentSteps.length - 1}
                                              className="h-5 w-5 p-0"
                                            >
                                              <ChevronDown className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded">
                                              #{step.step_order}
                                            </span>
                                            <span className="font-medium text-sm">{step.step_name}</span>
                                          </div>
                                          {step.step_description && (
                                            <p className="text-xs text-muted-foreground mb-2">
                                              {step.step_description}
                                            </p>
                                          )}
                                          <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground min-w-[60px]">
                                              الإنجاز: {step.completion_percentage || 0}%
                                            </span>
                                            {isEditingSteps ? (
                                              <Slider
                                                value={[step.completion_percentage || 0]}
                                                onValueChange={(value) => handleUpdateStepPercentage(treatment.id, subTreatment.id, index, value[0])}
                                                max={100}
                                                step={10}
                                                className="flex-1"
                                              />
                                            ) : (
                                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                  className="h-full bg-primary transition-all"
                                                  style={{ width: `${step.completion_percentage || 0}%` }}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {isEditingSteps && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveStep(treatment.id, subTreatment.id, index)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}

                                {/* Add New Step Form */}
                                {isEditingSteps && (
                                  <div className="bg-background p-3 rounded-md border border-dashed">
                                    <div className="space-y-2">
                                      <Input
                                        placeholder="اسم الخطوة الجديدة"
                                        value={newSteps[newStepKey]?.step_name || ""}
                                        onChange={(e) => setNewSteps(prev => ({
                                          ...prev,
                                          [newStepKey]: { 
                                            ...prev[newStepKey], 
                                            step_name: e.target.value,
                                            step_description: prev[newStepKey]?.step_description || "",
                                            completion_percentage: prev[newStepKey]?.completion_percentage || 0,
                                          }
                                        }))}
                                        className="text-sm"
                                      />
                                      <Textarea
                                        placeholder="وصف الخطوة (اختياري)"
                                        value={newSteps[newStepKey]?.step_description || ""}
                                        onChange={(e) => setNewSteps(prev => ({
                                          ...prev,
                                          [newStepKey]: { 
                                            ...prev[newStepKey], 
                                            step_name: prev[newStepKey]?.step_name || "",
                                            step_description: e.target.value,
                                            completion_percentage: prev[newStepKey]?.completion_percentage || 0,
                                          }
                                        }))}
                                        rows={2}
                                        className="text-sm"
                                      />
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground min-w-[60px]">
                                          الإنجاز: {newSteps[newStepKey]?.completion_percentage || 0}%
                                        </span>
                                        <Slider
                                          value={[newSteps[newStepKey]?.completion_percentage || 0]}
                                          onValueChange={(value) => setNewSteps(prev => ({
                                            ...prev,
                                            [newStepKey]: { 
                                              ...prev[newStepKey], 
                                              step_name: prev[newStepKey]?.step_name || "",
                                              step_description: prev[newStepKey]?.step_description || "",
                                              completion_percentage: value[0],
                                            }
                                          }))}
                                          max={100}
                                          step={10}
                                          className="flex-1"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        onClick={() => handleAddStep(treatment.id, subTreatment.id)}
                                        size="sm"
                                        className="w-full"
                                      >
                                        <Plus className="h-4 w-4 ml-1" />
                                        إضافة خطوة
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل العلاج</DialogTitle>
          </DialogHeader>
          {editingTreatment && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">اسم العلاج</Label>
                <Input
                  id="edit_name"
                  value={editingTreatment.name}
                  onChange={(e) => setEditingTreatment({ ...editingTreatment, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_description">الوصف</Label>
                <Textarea
                  id="edit_description"
                  value={editingTreatment.description || ""}
                  onChange={(e) => setEditingTreatment({ ...editingTreatment, description: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={updateTreatmentMutation.isPending}>
                {updateTreatmentMutation.isPending ? "جاري التحديث..." : "تحديث"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Sub-treatment Dialog */}
      <Dialog open={isSubTreatmentDialogOpen} onOpenChange={setIsSubTreatmentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة علاج فرعي</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubTreatmentSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sub_name">اسم العلاج الفرعي</Label>
              <Input
                id="sub_name"
                value={newSubTreatment.name}
                onChange={(e) => setNewSubTreatment({ ...newSubTreatment, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="estimated_cost">التكلفة المقدرة (ج.م)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                value={newSubTreatment.estimated_cost}
                onChange={(e) => setNewSubTreatment({ ...newSubTreatment, estimated_cost: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tooth_association">ارتباط الأسنان</Label>
              <Select
                value={newSubTreatment.tooth_association}
                onValueChange={(value: any) => setNewSubTreatment({ ...newSubTreatment, tooth_association: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_related">لا يوجد</SelectItem>
                  <SelectItem value="related">مرتبط</SelectItem>
                  <SelectItem value="required">مطلوب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createSubTreatmentMutation.isPending}>
              {createSubTreatmentMutation.isPending ? "جاري الإضافة..." : "إضافة علاج فرعي"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>


    </div>
  );
}
