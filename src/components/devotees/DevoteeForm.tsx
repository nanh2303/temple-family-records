"use client";

// File: src/components/devotees/DevoteeForm.tsx

import { Plus, Save, Trash2, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ZodIssue } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEVOTEE_TRAINING_CATEGORIES,
  DEVOTEE_TRAINING_RECORD_DEFINITIONS,
  getTrainingRecordDefinitionForRecord,
  type DevoteeTrainingCategory,
  type DevoteeTrainingRecordKey,
} from "@/lib/devotees/profile-sections";
import { createLocalPreviewUrl, resizeImageFile } from "@/lib/image/resizeImage";
import {
  devoteeProfileCreateSchema,
  devoteeProfileUpdateSchema,
  type DevoteeNoteFormRecordInput,
  type DevoteeRoleFormRecordInput,
  type DevoteeTrainingFormRecordInput,
} from "@/lib/validations/devotee";
import type {
  DevoteeAfterlifeInfo,
  DevoteeNote,
  DevoteeRecord,
  DevoteeRole,
  DevoteeTrainingRecord,
} from "@/types/devotee";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEVOTEE_FORM_FIELD_NAMES = [
  "family_registry_no",
  "bhd_registry_no",
  "full_name",
  "birth_date",
  "birth_place",
  "dharma_name",
  "hometown",
  "address",
  "joined_unit_date",
  "vow_date",
  "refuge_date",
  "preceptor",
  "father_name",
  "mother_name",
  "death_date",
  "grave_location",
  "afterlife_note",
  "profile_picture_url",
] as const;

const NOTE_SECTIONS = [
  { note_type: "achievement", title: "Thành tích cá nhân", addLabel: "Thêm thành tích" },
  { note_type: "comment", title: "Các nhận xét khác", addLabel: "Thêm nhận xét" },
  { note_type: "other", title: "Ghi chú khác", addLabel: "Thêm ghi chú" },
] as const;

const TRAINING_CATEGORY_ORDER: DevoteeTrainingCategory[] = ["long_term", "camp", "ordination_level"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DevoteeFormFieldName = (typeof DEVOTEE_FORM_FIELD_NAMES)[number];
type DevoteeFormValues = Record<DevoteeFormFieldName, string>;
type DevoteeFormErrors = Partial<Record<DevoteeFormFieldName, string>>;
type DevoteeCoreFormFieldName = Exclude<
  DevoteeFormFieldName,
  "death_date" | "grave_location" | "afterlife_note"
>;
type DevoteeTrainingFormValues = Record<DevoteeTrainingRecordKey, { completed_date: string; decision_no: string }>;
type DevoteeRoleFormValues = {
  role_title: string;
  organization: string;
  start_date: string;
  end_date: string;
  note: string;
};
type DevoteeNoteType = (typeof NOTE_SECTIONS)[number]["note_type"];
type DevoteeNoteFormValues = Record<DevoteeNoteType, { content: string }[]>;
type TrainingDefinition = (typeof DEVOTEE_TRAINING_RECORD_DEFINITIONS)[number];

type DevoteeFormInitialValues = Partial<Pick<DevoteeRecord, DevoteeCoreFormFieldName>> & {
  death_date?: DevoteeAfterlifeInfo["death_date"];
  grave_location?: DevoteeAfterlifeInfo["grave_location"];
  afterlife_note?: DevoteeAfterlifeInfo["note"];
  profile_picture_url?: DevoteeRecord["profile_picture_url"];
  training?: DevoteeTrainingRecord[];
  roles?: DevoteeRole[];
  notes?: DevoteeNote[];
};

type DevoteeFormProps =
  | {
      mode: "create";
      initialValues?: DevoteeFormInitialValues;
      cancelHref?: string;
    }
  | {
      mode: "edit";
      devoteeId: string;
      initialValues: DevoteeFormInitialValues;
      cancelHref?: string;
    };

type FieldConfig = {
  name: DevoteeFormFieldName;
  label: string;
  type?: "date" | "text";
  required?: boolean;
};

// ---------------------------------------------------------------------------
// Form-section layout config (avatar section has no fields — rendered separately)
// ---------------------------------------------------------------------------

const FORM_SECTIONS: { title: string; description?: string; fields: FieldConfig[] }[] = [
  {
    title: "Ảnh đại diện",
    fields: [],
  },
  {
    title: "Thông tin danh bộ",
    fields: [
      { name: "family_registry_no", label: "Số danh bộ gia đình" },
      { name: "bhd_registry_no", label: "Số danh bộ BHD" },
    ],
  },
  {
    title: "Thông tin cá nhân",
    fields: [
      { name: "full_name", label: "Họ và tên", required: true },
      { name: "birth_date", label: "Ngày tháng năm sinh", type: "date" },
      { name: "birth_place", label: "Nơi sinh" },
      { name: "dharma_name", label: "Pháp danh" },
      { name: "hometown", label: "Quê quán" },
      { name: "address", label: "Địa chỉ" },
    ],
  },
  {
    title: "Thông tin sinh hoạt / tu học cơ bản",
    fields: [
      { name: "joined_unit_date", label: "Ngày vào Đơn vị", type: "date" },
      { name: "vow_date", label: "Ngày Phát nguyện", type: "date" },
      { name: "refuge_date", label: "Ngày Quy y", type: "date" },
      { name: "preceptor", label: "Bổn Sư truyền giới" },
    ],
  },
  {
    title: "Gia đình",
    fields: [
      { name: "father_name", label: "Tên Cha" },
      { name: "mother_name", label: "Tên Mẹ" },
    ],
  },
  {
    title: "Hậu thế",
    description: "Mục I trên mẫu Gia Phả.",
    fields: [
      { name: "death_date", label: "Tạ thế ngày", type: "date" },
      { name: "grave_location", label: "Mộ chí tại" },
      { name: "afterlife_note", label: "Ghi chú" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInitialValues(initialValues?: DevoteeFormInitialValues): DevoteeFormValues {
  return DEVOTEE_FORM_FIELD_NAMES.reduce((values, fieldName) => {
    if (fieldName === "afterlife_note") {
      values[fieldName] = initialValues?.afterlife_note ?? "";
      return values;
    }
    if (fieldName === "profile_picture_url") {
      values[fieldName] = initialValues?.profile_picture_url ?? "";
      return values;
    }
    values[fieldName] =
      (initialValues?.[fieldName as keyof DevoteeFormInitialValues] as string | null | undefined) ?? "";
    return values;
  }, {} as DevoteeFormValues);
}

function buildInitialTrainingValues(initialValues?: DevoteeFormInitialValues): DevoteeTrainingFormValues {
  const values = DEVOTEE_TRAINING_RECORD_DEFINITIONS.reduce((current, definition) => {
    current[definition.key] = { completed_date: "", decision_no: "" };
    return current;
  }, {} as DevoteeTrainingFormValues);

  for (const record of initialValues?.training ?? []) {
    const definition = getTrainingRecordDefinitionForRecord(record);
    if (!definition) continue;
    values[definition.key] = {
      completed_date: record.completed_date ?? "",
      decision_no: record.decision_no ?? "",
    };
  }

  return values;
}

function buildInitialRoles(initialValues?: DevoteeFormInitialValues): DevoteeRoleFormValues[] {
  return (initialValues?.roles ?? []).map((role) => ({
    role_title: role.role_title,
    organization: role.organization ?? "",
    start_date: role.start_date ?? "",
    end_date: role.end_date ?? "",
    note: role.note ?? "",
  }));
}

function buildInitialNotes(initialValues?: DevoteeFormInitialValues): DevoteeNoteFormValues {
  const values: DevoteeNoteFormValues = { achievement: [], comment: [], other: [] };
  for (const note of initialValues?.notes ?? []) {
    values[note.note_type].push({ content: note.content });
  }
  return values;
}

function mapIssuesToErrors(issues: ZodIssue[]) {
  const fieldErrors: DevoteeFormErrors = {};
  const formErrors: string[] = [];

  for (const issue of issues) {
    const fieldName = issue.path[0];
    if (typeof fieldName === "string" && DEVOTEE_FORM_FIELD_NAMES.includes(fieldName as DevoteeFormFieldName)) {
      fieldErrors[fieldName as DevoteeFormFieldName] ??= issue.message;
    } else {
      formErrors.push(issue.message);
    }
  }

  return { fieldErrors, formError: formErrors.join(" ") || null };
}

function hasRoleContent(role: DevoteeRoleFormValues) {
  return Boolean(role.role_title || role.organization || role.start_date || role.end_date || role.note);
}

function buildTrainingPayload(values: DevoteeTrainingFormValues): DevoteeTrainingFormRecordInput[] {
  return DEVOTEE_TRAINING_RECORD_DEFINITIONS.flatMap((definition) => {
    const record = values[definition.key];
    if (!record.completed_date && !record.decision_no) return [];
    return [{ key: definition.key, completed_date: record.completed_date, decision_no: record.decision_no }];
  });
}

function buildRolesPayload(roles: DevoteeRoleFormValues[]): DevoteeRoleFormRecordInput[] {
  return roles.filter(hasRoleContent).map((role) => ({
    role_title: role.role_title,
    organization: role.organization,
    start_date: role.start_date,
    end_date: role.end_date,
    note: role.note,
  }));
}

function buildNotesPayload(notes: DevoteeNoteFormValues): DevoteeNoteFormRecordInput[] {
  return NOTE_SECTIONS.flatMap((section) =>
    notes[section.note_type]
      .filter((note) => note.content.trim().length > 0)
      .map((note) => ({ note_type: section.note_type, content: note.content })),
  );
}

function groupTrainingDefinitions(category: DevoteeTrainingCategory) {
  const groups = new Map<string, TrainingDefinition[]>();
  for (const definition of DEVOTEE_TRAINING_RECORD_DEFINITIONS.filter((item) => item.category === category)) {
    const current = groups.get(definition.group) ?? [];
    groups.set(definition.group, [...current, definition]);
  }
  return [...groups.entries()];
}

/**
 * Upload a (possibly resized) File to the upload-picture endpoint.
 * Returns the public URL on success, throws on failure.
 */
async function uploadPictureFile(devoteeId: string, file: File): Promise<string> {
  let fileToUpload: File;
  try {
    fileToUpload = await resizeImageFile(file);
  } catch {
    // If resize fails (e.g. unsupported environment), fall back to original.
    fileToUpload = file;
  }

  const formData = new FormData();
  formData.append("file", fileToUpload);

  const response = await fetch(`/api/devotees/${devoteeId}/upload-picture`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!response.ok) {
    throw new Error(data?.error ?? `Upload failed (${response.status})`);
  }
  if (!data?.url) {
    throw new Error("No URL returned from upload");
  }
  return data.url;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DevoteeForm(props: DevoteeFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<DevoteeFormValues>(() => buildInitialValues(props.initialValues));
  const [trainingValues, setTrainingValues] = useState<DevoteeTrainingFormValues>(() =>
    buildInitialTrainingValues(props.initialValues),
  );
  const [roles, setRoles] = useState<DevoteeRoleFormValues[]>(() => buildInitialRoles(props.initialValues));
  const [notes, setNotes] = useState<DevoteeNoteFormValues>(() => buildInitialNotes(props.initialValues));
  const [errors, setErrors] = useState<DevoteeFormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Avatar-specific state
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadPictureError, setUploadPictureError] = useState<string | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    props.initialValues?.profile_picture_url || null,
  );
  // In create mode we hold the pending File until the devotee ID is known.
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  // Ref for revoking the local object-URL when it is replaced or the component unmounts.
  const localPreviewUrlRef = useRef<string | null>(null);

  const cancelHref = props.cancelHref ?? (props.mode === "edit" ? `/devotees/${props.devoteeId}` : "/devotees");

  // Revoke any pending object-URL on unmount.
  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Field helpers
  // ---------------------------------------------------------------------------

  function updateField(fieldName: DevoteeFormFieldName, value: string) {
    setValues((current) => ({ ...current, [fieldName]: value }));
    setErrors((current) => ({ ...current, [fieldName]: undefined }));
  }

  function updateTrainingField(
    key: DevoteeTrainingRecordKey,
    field: keyof DevoteeTrainingFormValues[DevoteeTrainingRecordKey],
    value: string,
  ) {
    setTrainingValues((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  }

  function updateRole(index: number, field: keyof DevoteeRoleFormValues, value: string) {
    setRoles((current) =>
      current.map((role, roleIndex) => (roleIndex === index ? { ...role, [field]: value } : role)),
    );
  }

  function updateNote(noteType: DevoteeNoteType, index: number, value: string) {
    setNotes((current) => ({
      ...current,
      [noteType]: current[noteType].map((note, noteIndex) => (noteIndex === index ? { content: value } : note)),
    }));
  }

  // ---------------------------------------------------------------------------
  // Avatar handlers
  // ---------------------------------------------------------------------------

  /**
   * Shared file-selection handler.
   *  - edit mode  → resize + upload immediately.
   *  - create mode → resize, set local preview, store file for post-create upload.
   */
  async function handleProfilePictureSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadPictureError(null);

    if (props.mode === "create") {
      // Build a local preview and queue the file for upload after save.
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
      const previewUrl = createLocalPreviewUrl(file);
      localPreviewUrlRef.current = previewUrl;
      setProfilePicturePreview(previewUrl);
      setPendingAvatarFile(file);
      // Reset the input so the same file can be re-selected if the user changes their mind.
      event.target.value = "";
      return;
    }

    // edit mode — upload right away.
    setUploadingPicture(true);
    try {
      const url = await uploadPictureFile(props.devoteeId, file);
      setValues((current) => ({ ...current, profile_picture_url: url }));
      setProfilePicturePreview(url);
    } catch (error) {
      setUploadPictureError(error instanceof Error ? error.message : "Failed to upload profile picture");
    } finally {
      setUploadingPicture(false);
      event.target.value = "";
    }
  }

  async function handleRemoveProfilePicture() {
    setUploadPictureError(null);

    if (props.mode === "create") {
      // Just clear the pending file and local preview.
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
        localPreviewUrlRef.current = null;
      }
      setPendingAvatarFile(null);
      setProfilePicturePreview(null);
      return;
    }

    // edit mode — delete from server.
    setUploadingPicture(true);
    try {
      const response = await fetch(`/api/devotees/${props.devoteeId}/upload-picture`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Delete failed (${response.status})`);
      }

      setValues((current) => ({ ...current, profile_picture_url: "" }));
      setProfilePicturePreview(null);
    } catch (error) {
      setUploadPictureError(error instanceof Error ? error.message : "Failed to delete profile picture");
    } finally {
      setUploadingPicture(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage(null);

    const payload = {
      ...values,
      training_records: buildTrainingPayload(trainingValues),
      roles: buildRolesPayload(roles),
      notes: buildNotesPayload(notes),
    };
    const schema = props.mode === "create" ? devoteeProfileCreateSchema : devoteeProfileUpdateSchema;
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      const { fieldErrors, formError } = mapIssuesToErrors(parsed.error.issues);
      setErrors(fieldErrors);
      setMessage(formError);
      setLoading(false);
      return;
    }

    const endpoint = props.mode === "create" ? "/api/devotees" : `/api/devotees/${props.devoteeId}`;
    const method = props.mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        id?: string;
        devotee?: { id: string };
      } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? `Request failed (${response.status})`);
      }

      const nextId = props.mode === "create" ? body?.id : props.devoteeId;
      if (!nextId) {
        throw new Error("Không xác định được hồ sơ vừa lưu.");
      }

      // If we are in create mode and the user pre-selected an avatar, upload it now.
      if (props.mode === "create" && pendingAvatarFile) {
        setUploadingPicture(true);
        try {
          await uploadPictureFile(nextId, pendingAvatarFile);
        } catch (uploadErr) {
          // Non-fatal: the devotee record was saved. Report the upload failure but still navigate.
          console.error("Post-create avatar upload failed:", uploadErr);
        } finally {
          setUploadingPicture(false);
        }
      }

      router.push(`/devotees/${nextId}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu hồ sơ.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderAvatarSection() {
    const isCreateMode = props.mode === "create";

    return (
      <Card key="Ảnh đại diện">
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
          {isCreateMode ? (
            <CardDescription>
              Chọn ảnh ngay bây giờ — ảnh sẽ được tải lên tự động sau khi lưu hồ sơ.
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadPictureError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {uploadPictureError}
            </p>
          ) : null}

          {profilePicturePreview ? (
            <div className="space-y-2">
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profilePicturePreview}
                  alt="Ảnh đại diện xem trước"
                  className="h-32 w-32 rounded-lg object-cover shadow-sm"
                />
                {isCreateMode ? (
                  <span className="absolute -bottom-2 left-0 right-0 text-center text-[10px] text-zinc-500">
                    Xem trước — sẽ được tải lên khi lưu
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="profile-picture-input">
              {profilePicturePreview ? "Thay đổi ảnh đại diện" : "Tải lên ảnh đại diện"}
            </Label>
            <Input
              id="profile-picture-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingPicture}
              onChange={handleProfilePictureSelect}
            />
            <p className="text-xs text-zinc-500">
              Hỗ trợ JPEG, PNG, WebP. Tối đa 5MB. Ảnh sẽ được tự động thu nhỏ về 800×800 px trước khi lưu.
            </p>
          </div>

          {profilePicturePreview ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingPicture}
              onClick={handleRemoveProfilePicture}
            >
              {uploadingPicture ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
              {isCreateMode ? "Huỷ chọn ảnh" : "Xóa ảnh đại diện"}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}

      {FORM_SECTIONS.map((section) => {
        if (section.title === "Ảnh đại diện") {
          return renderAvatarSection();
        }

        return (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.description ? <CardDescription>{section.description}</CardDescription> : null}
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => {
                const error = errors[field.name];
                const inputId = `devotee-${field.name}`;

                return (
                  <div
                    key={field.name}
                    className={
                      field.name === "address" || field.name === "grave_location" || field.name === "afterlife_note"
                        ? "space-y-2 sm:col-span-2"
                        : "space-y-2"
                    }
                  >
                    <Label htmlFor={inputId}>{field.label}</Label>
                    <Input
                      id={inputId}
                      name={field.name}
                      type={field.type ?? "text"}
                      required={field.required}
                      value={values[field.name]}
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? `${inputId}-error` : undefined}
                      onChange={(event) => updateField(field.name, event.target.value)}
                    />
                    {error ? (
                      <p id={`${inputId}-error`} className="text-xs text-red-600">
                        {error}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {TRAINING_CATEGORY_ORDER.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{DEVOTEE_TRAINING_CATEGORIES[category]}</CardTitle>
            <CardDescription>Nhập ngày hoàn thành và số quyết định tương ứng trên mẫu Gia Phả.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {groupTrainingDefinitions(category).map(([group, definitions]) => (
              <div key={group} className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-900">{group}</h4>
                <div className="space-y-3">
                  {definitions.map((definition) => {
                    const dateInputId = `training-${definition.key}-date`;
                    const decisionInputId = `training-${definition.key}-decision`;
                    return (
                      <div
                        key={definition.key}
                        className="grid gap-3 rounded-md border border-zinc-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)_minmax(0,1fr)]"
                      >
                        <div className="flex items-center text-sm font-medium text-zinc-900">{definition.label}</div>
                        <div className="space-y-2">
                          <Label htmlFor={dateInputId}>Ngày</Label>
                          <Input
                            id={dateInputId}
                            type="date"
                            value={trainingValues[definition.key].completed_date}
                            onChange={(event) =>
                              updateTrainingField(definition.key, "completed_date", event.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={decisionInputId}>Quyết định số</Label>
                          <Input
                            id={decisionInputId}
                            value={trainingValues[definition.key].decision_no}
                            onChange={(event) =>
                              updateTrainingField(definition.key, "decision_no", event.target.value)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Các chức vụ từng đảm nhận</CardTitle>
          <CardDescription>Các dòng này được in vào mục E trên mẫu Gia Phả.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.length === 0 ? <p className="text-sm text-zinc-500">Chưa có chức vụ nào.</p> : null}
          {roles.map((role, index) => (
            <div key={index} className="grid gap-3 rounded-md border border-zinc-200 p-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`role-${index}-title`}>Chức vụ</Label>
                <Input
                  id={`role-${index}-title`}
                  value={role.role_title}
                  onChange={(event) => updateRole(index, "role_title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`role-${index}-organization`}>Đơn vị / tổ chức</Label>
                <Input
                  id={`role-${index}-organization`}
                  value={role.organization}
                  onChange={(event) => updateRole(index, "organization", event.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`role-${index}-start`}>Từ ngày</Label>
                  <Input
                    id={`role-${index}-start`}
                    type="date"
                    value={role.start_date}
                    onChange={(event) => updateRole(index, "start_date", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`role-${index}-end`}>Đến ngày</Label>
                  <Input
                    id={`role-${index}-end`}
                    type="date"
                    value={role.end_date}
                    onChange={(event) => updateRole(index, "end_date", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`role-${index}-note`}>Ghi chú</Label>
                <Input
                  id={`role-${index}-note`}
                  value={role.note}
                  onChange={(event) => updateRole(index, "note", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRoles((current) => current.filter((_, roleIndex) => roleIndex !== index))}
                >
                  <Trash2 aria-hidden />
                  Xóa chức vụ
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setRoles((current) => [
                ...current,
                { role_title: "", organization: "", start_date: "", end_date: "", note: "" },
              ])
            }
          >
            <Plus aria-hidden />
            Thêm chức vụ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thành tích và nhận xét</CardTitle>
          <CardDescription>Các dòng này được in vào mục G và H trên mẫu Gia Phả.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {NOTE_SECTIONS.map((section) => (
            <div key={section.note_type} className="space-y-3">
              <h4 className="text-sm font-semibold text-zinc-900">{section.title}</h4>
              {notes[section.note_type].length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có dữ liệu.</p>
              ) : null}
              {notes[section.note_type].map((note, index) => (
                <div key={index} className="space-y-2 rounded-md border border-zinc-200 p-3">
                  <Label htmlFor={`note-${section.note_type}-${index}`}>Nội dung</Label>
                  <Textarea
                    id={`note-${section.note_type}-${index}`}
                    value={note.content}
                    onChange={(event) => updateNote(section.note_type, index, event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNotes((current) => ({
                        ...current,
                        [section.note_type]: current[section.note_type].filter(
                          (_, noteIndex) => noteIndex !== index,
                        ),
                      }))
                    }
                  >
                    <Trash2 aria-hidden />
                    Xóa dòng
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setNotes((current) => ({
                    ...current,
                    [section.note_type]: [...current[section.note_type], { content: "" }],
                  }))
                }
              >
                <Plus aria-hidden />
                {section.addLabel}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {uploadingPicture ? (
          <span className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Đang tải ảnh…
          </span>
        ) : null}
        <Button asChild type="button" variant="outline">
          <Link href={cancelHref}>
            <X aria-hidden />
            Hủy
          </Link>
        </Button>
        <Button type="submit" disabled={loading || uploadingPicture}>
          <Save aria-hidden />
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  );
}
