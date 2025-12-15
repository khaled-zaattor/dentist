import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Treatment, Appointment } from "@/lib/api/types";

export type TreatmentRecord = {
  treatment_id: string;
  sub_treatment_id: string;
  tooth_numbers: string[];
  actual_cost: string;
  payment_amount: string;
  notes: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAppointment?: Appointment | null;
  treatments: Treatment[];
  onSubmit: (record: TreatmentRecord, selectedSteps: string[]) => void;
  isSubmitting?: boolean;
}

export default function TreatmentRecordDialog({
  open,
  onOpenChange,
  selectedAppointment,
  treatments,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const [teethType, setTeethType] = useState<"adult" | "child">("adult");
  const [treatmentRecord, setTreatmentRecord] = useState<TreatmentRecord>({
    treatment_id: "",
    sub_treatment_id: "",
    tooth_numbers: [],
    actual_cost: "",
    payment_amount: "",
    notes: "",
  });
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);

  // Get sub-treatments for selected treatment
  const selectedTreatment = treatments.find(t => t.id === treatmentRecord.treatment_id);
  const subTreatments = selectedTreatment?.sub_treatments || [];

  // Get steps for selected sub-treatment
  const selectedSubTreatment = subTreatments.find(st => st.id === treatmentRecord.sub_treatment_id);
  const treatmentSteps = Array.isArray(selectedSubTreatment?.sub_treatment_steps) 
    ? selectedSubTreatment.sub_treatment_steps 
    : [];

  useEffect(() => {
    if (open && selectedAppointment) {
      setTreatmentRecord(prev => ({ 
        ...prev, 
        notes: selectedAppointment.notes || "" 
      }));
    }
  }, [open, selectedAppointment]);

  useEffect(() => {
    // If sub treatment changes, set estimated cost if available
    const selected = subTreatments.find(st => st.id === treatmentRecord.sub_treatment_id);
    if (selected && selected.estimated_cost != null) {
      setTreatmentRecord(prev => ({ 
        ...prev, 
        actual_cost: selected.estimated_cost!.toString().replace(/,/g, "") 
      }));
    }
    // Reset selected steps when sub treatment changes
    setSelectedSteps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentRecord.sub_treatment_id]);

  const formatNumberWithCommas = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "");
    const parts = cleanValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const removeCommas = (value: string) => value.replace(/,/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((treatmentRecord.notes || "").length > 2000) {
      alert("الملاحظات يجب أن لا تتجاوز 2000 حرف");
      return;
    }

    if (treatmentRecord.tooth_numbers.length === 0) {
      alert("يرجى اختيار رقم السن");
      return;
    }

    onSubmit(treatmentRecord, selectedSteps);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تسجيل علاج</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Treatment Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="treatment_id">العلاج</Label>
              <Select
                value={treatmentRecord.treatment_id}
                onValueChange={(value) => setTreatmentRecord({ 
                  ...treatmentRecord, 
                  treatment_id: value, 
                  sub_treatment_id: "" 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر علاج" />
                </SelectTrigger>
                <SelectContent>
                  {treatments.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sub_treatment_id">العلاج الفرعي</Label>
              <Select
                value={treatmentRecord.sub_treatment_id}
                onValueChange={(value) => {
                  const selectedSubTreatment = subTreatments.find(st => st.id === value);
                  setTreatmentRecord({
                    ...treatmentRecord,
                    sub_treatment_id: value,
                    actual_cost: selectedSubTreatment?.estimated_cost?.toString().replace(/,/g, "") || "",
                  });
                }}
                disabled={!treatmentRecord.treatment_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر علاج فرعي" />
                </SelectTrigger>
                <SelectContent>
                  {subTreatments.map(st => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.name} - {formatNumberWithCommas(String(st.estimated_cost || 0))} ج.م
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Teeth Selection and Cost */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Teeth Chart */}
            <div className="lg:col-span-2">
              <Label>رقم السن</Label>
              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center text-xs font-medium flex-1">
                    مخطط الأسنان - النظام العالمي
                  </div>
                </div>

                {/* Teeth Type Selection */}
                <div className="mb-3">
                  <RadioGroup 
                    value={teethType} 
                    onValueChange={(value: "adult" | "child") => {
                      setTeethType(value);
                      setTreatmentRecord({ ...treatmentRecord, tooth_numbers: [] });
                    }} 
                    className="flex gap-4 justify-center"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="adult" id="adult" />
                      <Label htmlFor="adult" className="cursor-pointer">أسنان البالغين</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="child" id="child" />
                      <Label htmlFor="child" className="cursor-pointer">أسنان الأطفال</Label>
                    </div>
                  </RadioGroup>
                </div>

                {teethType === "adult" ? (
                  <>
                    {/* Upper Jaw */}
                    <div className="mb-3">
                      <div className="text-xs text-center text-muted-foreground mb-1">الفك العلوي</div>
                      <div className="grid grid-cols-8 gap-1 mb-1">
                        {[18, 17, 16, 15, 14, 13, 12, 11].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {[21, 22, 23, 24, 25, 26, 27, 28].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lower Jaw */}
                    <div>
                      <div className="text-xs text-center text-muted-foreground mb-1">الفك السفلي</div>
                      <div className="grid grid-cols-8 gap-1 mb-1">
                        {[48, 47, 46, 45, 44, 43, 42, 41].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {[31, 32, 33, 34, 35, 36, 37, 38].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Child Teeth - Upper Jaw */}
                    <div className="mb-3">
                      <div className="text-xs text-center text-muted-foreground mb-1">الفك العلوي</div>
                      <div className="grid grid-cols-5 gap-1 mb-1 max-w-[250px] mx-auto">
                        {[55, 54, 53, 52, 51].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-5 gap-1 max-w-[250px] mx-auto">
                        {[61, 62, 63, 64, 65].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Child Teeth - Lower Jaw */}
                    <div>
                      <div className="text-xs text-center text-muted-foreground mb-1">الفك السفلي</div>
                      <div className="grid grid-cols-5 gap-1 mb-1 max-w-[250px] mx-auto">
                        {[85, 84, 83, 82, 81].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-5 gap-1 max-w-[250px] mx-auto">
                        {[71, 72, 73, 74, 75].map(n => {
                          const toothStr = n.toString();
                          const active = treatmentRecord.tooth_numbers.includes(toothStr);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const newTeeth = active
                                  ? treatmentRecord.tooth_numbers.filter(t => t !== toothStr)
                                  : [...treatmentRecord.tooth_numbers, toothStr];
                                setTreatmentRecord({ ...treatmentRecord, tooth_numbers: newTeeth });
                              }}
                              className={`h-8 w-full text-xs font-medium border rounded transition-colors ${
                                active 
                                  ? 'bg-primary text-primary-foreground border-primary' 
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {treatmentRecord.tooth_numbers.length > 0 && (
                  <div className="mt-2 text-center text-xs text-primary">
                    الأسنان المحددة: {treatmentRecord.tooth_numbers.sort((a, b) => parseInt(a) - parseInt(b)).join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Cost Section */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="actual_cost">التكلفة الحقيقية</Label>
                <Input
                  id="actual_cost"
                  type="text"
                  value={treatmentRecord.actual_cost ? formatNumberWithCommas(treatmentRecord.actual_cost) : ""}
                  onChange={(e) => setTreatmentRecord({ 
                    ...treatmentRecord, 
                    actual_cost: removeCommas(e.target.value) 
                  })}
                  placeholder="أدخل التكلفة الحقيقية"
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment_amount">مبلغ الدفعة (اختياري)</Label>
                <Input
                  id="payment_amount"
                  type="text"
                  value={treatmentRecord.payment_amount ? formatNumberWithCommas(treatmentRecord.payment_amount) : ""}
                  onChange={(e) => setTreatmentRecord({ 
                    ...treatmentRecord, 
                    payment_amount: removeCommas(e.target.value) 
                  })}
                  placeholder="أدخل مبلغ الدفعة إن وجد"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  اترك فارغاً إذا لم يتم الدفع
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="treatment_notes">الملاحظات</Label>
            <Textarea
              id="treatment_notes"
              value={treatmentRecord.notes}
              onChange={(e) => setTreatmentRecord({ ...treatmentRecord, notes: e.target.value })}
              placeholder="أضف ملاحظات حول العلاج..."
              rows={3}
              className="resize-none"
            />
            {selectedAppointment?.notes && (
              <p className="text-xs text-muted-foreground mt-1">
                الملاحظة السابقة: {selectedAppointment.notes}
              </p>
            )}
          </div>

          {/* Treatment Steps */}
          {treatmentRecord.sub_treatment_id && treatmentSteps.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                خطوات العلاج المنجزة في هذا الموعد
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-muted/30">
                {treatmentSteps.map((step: any) => {
                  const stepId = step.id || `step-${step.step_order}`;
                  const selected = selectedSteps.includes(stepId);
                  return (
                    <div
                      key={stepId}
                      className={`flex items-start space-x-2 space-x-reverse p-2 border rounded transition-colors ${
                        selected ? 'bg-blue-50 border-blue-200' : 'bg-card'
                      }`}
                    >
                      <Checkbox
                        id={stepId}
                        checked={selected}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedSteps(prev => [...prev, stepId]);
                          else setSelectedSteps(prev => prev.filter(id => id !== stepId));
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={stepId} 
                          className="cursor-pointer text-xs font-medium block"
                        >
                          {step.step_name || step.step_description || `خطوة ${step.step_order ?? ""}`}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                ({selectedSteps.length} من {treatmentSteps.length} خطوات محددة)
              </p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "جاري التسجيل..." : "تسجيل العلاج والخطوات"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
