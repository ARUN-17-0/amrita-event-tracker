import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { AcademicEvent, EventType, UserProfile, Subject, Section } from "@/types";

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AcademicEvent, "id" | "createdAt" | "updatedAt">) => Promise<{ ok: boolean; message: string }>;
  currentUser: UserProfile;
  subjects: Subject[];
  sections: Section[];
  defaultDate?: Date;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "exam", label: "Exam" },
  { value: "lab", label: "Lab" },
  { value: "project", label: "Project" },
  { value: "announcement", label: "Announcement" },
  { value: "other", label: "Other" },
];

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

export function AddEventDialog({ open, onClose, onSubmit, currentUser, subjects, sections, defaultDate }: AddEventDialogProps) {
  const isAdmin = currentUser.role === "admin";
  const isMentor = currentUser.role === "course_mentor";

  const [form, setForm] = useState({
    title: "",
    type: "quiz" as EventType,
    description: "",
    subjectId: "",
    sectionId: "",
    eventDate: toDateInput(defaultDate ?? new Date()),
    eventTime: "09:00",
  });
  const [loading, setLoading] = useState(false);
  const [ruleError, setRuleError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ title: "", type: "quiz", description: "", subjectId: "", sectionId: "", eventDate: toDateInput(defaultDate ?? new Date()), eventTime: "09:00" });
      setRuleError("");
    }
  }, [open, defaultDate]);

  const availableSections = isAdmin ? sections : sections.filter(s => s.departmentId === currentUser.departmentId);
  const selectedSection = sections.find(s => s.id === form.sectionId);
  const availableSubjects = selectedSection
    ? subjects.filter(sub => sub.departmentId === selectedSection.departmentId)
    : subjects.filter(sub => sub.departmentId === currentUser.departmentId);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleError("");
    if (!form.sectionId || !form.subjectId) { setRuleError("Please select a section and subject."); return; }

    const section = sections.find(s => s.id === form.sectionId);
    const subject = subjects.find(s => s.id === form.subjectId);

    if (form.sectionId === '__all__') {
      setLoading(true);
      const deptSections = sections.filter(s => s.departmentId === currentUser.departmentId);
      let anyError = '';
      for (const sec of deptSections) {
        const result = await onSubmit({
          title: form.title,
          type: form.type,
          description: form.description,
          subjectId: form.subjectId,
          sectionId: sec.id,
          departmentId: sec.departmentId,
          semesterId: subject?.semesterId ?? "",
          eventDate: new Date(form.eventDate + "T00:00:00"),
          eventTime: form.eventTime,
          createdBy: currentUser.uid,
          isActive: true,
        });
        if (!result.ok) { anyError = result.message; break; }
      }
      setLoading(false);
      if (anyError) { setRuleError(anyError); return; }
      onClose();
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      title: form.title,
      type: form.type,
      description: form.description,
      subjectId: form.subjectId,
      sectionId: form.sectionId,
      departmentId: section?.departmentId ?? currentUser.departmentId ?? "",
      semesterId: subject?.semesterId ?? "",
      eventDate: new Date(form.eventDate + "T00:00:00"),
      eventTime: form.eventTime,
      createdBy: currentUser.uid,
      isActive: true,
    });
    setLoading(false);

    if (!result.ok) { setRuleError(result.message); return; }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Event</h2>
          {isMentor && (
            <span className="ml-3 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
              Dept View — Quiz conflicts enforced
            </span>
          )}
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {ruleError && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{ruleError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. DBMS Quiz 1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" value={form.type} onChange={e => set("type", e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" value={form.sectionId} onChange={e => { set("sectionId", e.target.value); set("subjectId", ""); }}>
                <option value="">Select Section</option>
                {isMentor && form.type === 'quiz' && <option value="__all__">All Classes (Dept-wide)</option>}
                {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" value={form.subjectId} onChange={e => set("subjectId", e.target.value)}>
              <option value="">Select Subject</option>
              {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input required type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" value={form.eventDate} onChange={e => set("eventDate", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input required type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" value={form.eventTime} onChange={e => set("eventTime", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional details..." />
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1 border border-gray-100">
            <p>📋 Max 3 quiz/assignment per section per Mon-Sun week</p>
            <p>⏱ Events in the same section must be at least 25 min apart</p>
            {isMentor && <p>🏫 Department quizzes must be at least 1 hour apart</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-light disabled:opacity-60">
              {loading ? "Saving..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
