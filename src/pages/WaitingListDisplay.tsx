import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { waitingListService } from "@/lib/api/services/waitingList.service";
import { Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function WaitingListDisplay() {
  const { data: waitingList } = useQuery({
    queryKey: ["waiting-list-display"],
    queryFn: () => waitingListService.getPublicDisplay(),
    refetchInterval: 3000, // Refresh every 3 seconds for real-time display
  });

  const waitingPatients = waitingList?.filter((entry) => entry.status === "waiting") || [];
  const inExamination = waitingList?.filter((entry) => entry.status === "in_examination") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">قائمة الانتظار</h1>
          <p className="text-gray-600">يرجى الانتظار حتى يتم استدعاؤك</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Waiting List */}
          <Card className="shadow-lg">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Clock className="h-6 w-6" />
                في الانتظار ({waitingPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {waitingPatients.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-yellow-800">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{entry.patient?.full_name}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(entry.clinic_arrival_time), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
                {waitingPatients.length === 0 && (
                  <p className="text-center text-gray-500 py-8">لا يوجد مرضى في الانتظار</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* In Examination */}
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <User className="h-6 w-6" />
                في الفحص ({inExamination.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {inExamination.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-800" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{entry.patient?.full_name}</h3>
                      <p className="text-sm text-gray-500">
                        دخل الفحص:{" "}
                        {entry.examination_room_entry_time
                          ? format(new Date(entry.examination_room_entry_time), "HH:mm")
                          : "-"}
                      </p>
                    </div>
                  </div>
                ))}
                {inExamination.length === 0 && (
                  <p className="text-center text-gray-500 py-8">لا يوجد مرضى في الفحص</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>يتم تحديث القائمة تلقائياً كل 3 ثواني</p>
        </div>
      </div>
    </div>
  );
}
