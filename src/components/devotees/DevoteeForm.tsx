"use client";

import { Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ZodIssue } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { devoteeCreateSchema, devoteeUpdateSchema } from "@/lib/validations/devotee";
import type { DevoteeRecord } from "@/types/devotee";

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
] as const;

type DevoteeFormFieldName = (typeof DEVOTEE_FORM_FIELD_NAMES)[number];
type DevoteeFormValues = Record<DevoteeFormFieldName, string>;
type DevoteeFormErrors = Partial<Record<DevoteeFormFieldName, string>>;
type DevoteeFormInitialValues = Partial<Pick<DevoteeRecord, DevoteeFormFieldName>>;

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

const FORM_SECTIONS: { title: string; description?: string; fields: FieldConfig[] }[] = [
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
];

function buildInitialValues(initialValues?: DevoteeFormInitialValues): DevoteeFormValues {
  return DEVOTEE_FORM_FIELD_NAMES.reduce((values, fieldName) => {
    values[fieldName] = initialValues?.[fieldName] ?? "";
    return values;
  }, {} as DevoteeFormValues);
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

export function DevoteeForm(props: DevoteeFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<DevoteeFormValues>(() => buildInitialValues(props.initialValues));
  const [errors, setErrors] = useState<DevoteeFormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cancelHref = props.cancelHref ?? (props.mode === "edit" ? `/devotees/${props.devoteeId}` : "/devotees");

  function updateField(fieldName: DevoteeFormFieldName, value: string) {
    setValues((current) => ({ ...current, [fieldName]: value }));
    setErrors((current) => ({ ...current, [fieldName]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage(null);

    const schema = props.mode === "create" ? devoteeCreateSchema : devoteeUpdateSchema;
    const parsed = schema.safeParse(values);

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
      const body = (await response.json().catch(() => null)) as { error?: string; id?: string; devotee?: { id: string } } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? `Request failed (${response.status})`);
      }

      const nextId = props.mode === "create" ? body?.id : props.devoteeId;
      if (!nextId) {
        throw new Error("Không xác định được hồ sơ vừa lưu.");
      }

      router.push(`/devotees/${nextId}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu hồ sơ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}

      {FORM_SECTIONS.map((section) => (
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
                <div key={field.name} className={field.name === "address" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
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
      ))}

      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild type="button" variant="outline">
          <Link href={cancelHref}>
            <X aria-hidden />
            Hủy
          </Link>
        </Button>
        <Button type="submit" disabled={loading}>
          <Save aria-hidden />
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  );
}
