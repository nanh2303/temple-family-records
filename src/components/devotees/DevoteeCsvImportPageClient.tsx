"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CSV_PREVIEW_ROW_LIMIT,
  DEVOTEE_CSV_FIELD_CONFIG,
  type DevoteeCsvImportPreview,
  type DevoteeCsvImportRow,
} from "@/lib/import/devotee-csv";

const STATUS_LABELS: Record<DevoteeCsvImportRow["status"], string> = {
  ready: "Sẵn sàng",
  warning: "Cảnh báo",
  error: "Lỗi",
};

type ImportResponse = DevoteeCsvImportPreview & {
  action: "preview" | "commit";
  truncated?: boolean;
  insertedCount?: number;
  inserted?: { id: string; full_name: string }[];
  error?: string;
};

function statusClassName(status: DevoteeCsvImportRow["status"]) {
  if (status === "error") return "bg-red-50 text-red-700 ring-red-200";
  if (status === "warning") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

function formatDelimiter(delimiter?: string) {
  if (!delimiter) return "-";
  if (delimiter === "\t") return "tab";
  if (delimiter === ",") return "dấu phẩy ,";
  if (delimiter === ";") return "dấu chấm phẩy ;";
  return delimiter;
}

function RowMessages({ row }: { row: DevoteeCsvImportRow }) {
  const messages = [...row.errors, ...row.warnings];
  if (messages.length === 0) return <span className="text-zinc-400">-</span>;
  return (
    <ul className="space-y-1">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

export function DevoteeCsvImportPageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "preview" | "commit" | null
  >(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const canImport = useMemo(
    () => Boolean(file && result && result.summary.importableRows > 0),
    [file, result],
  );

  async function submitCsv(action: "preview" | "commit") {
    if (!file) {
      setMessage("Hãy chọn một file CSV trước.");
      return;
    }

    setLoadingAction(action);
    setMessage(null);
    const formData = new FormData();
    formData.set("action", action);
    formData.set("file", file);

    try {
      const response = await fetch("/api/devotees/import", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const body = (await response
        .json()
        .catch(() => null)) as ImportResponse | null;
      if (!response.ok)
        throw new Error(body?.error ?? `Request failed (${response.status})`);
      setResult(body);
      if (action === "commit")
        setMessage(`Đã import ${body?.insertedCount ?? 0} hồ sơ vào database.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể xử lý file CSV.",
      );
      if (action === "commit") setResult(null);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Import hồ sơ từ CSV
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Upload CSV để kiểm tra header, validate từng dòng, phát hiện trùng,
            rồi mới ghi các dòng hợp lệ vào database.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/devotees">Quay lại tra cứu</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chọn file CSV</CardTitle>
          <CardDescription>
            File nên có header ở dòng đầu. App tự nhận dấu phẩy, chấm phẩy hoặc
            tab; ngày có thể nhập dạng YYYY-MM-DD hoặc DD/MM/YYYY.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">File CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
                setMessage(null);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!file || Boolean(loadingAction)}
              onClick={() => void submitCsv("preview")}
            >
              <FileSpreadsheet aria-hidden />
              {loadingAction === "preview"
                ? "Đang kiểm tra..."
                : "Kiểm tra CSV"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canImport || Boolean(loadingAction)}
              onClick={() => void submitCsv("commit")}
            >
              <Upload aria-hidden />
              {loadingAction === "commit"
                ? "Đang import..."
                : `Import ${result?.summary.importableRows ?? 0} dòng hợp lệ`}
            </Button>
          </div>
          {message ? (
            <p
              className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
              role="status"
            >
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Header được hỗ trợ</CardTitle>
          <CardDescription>
            Tên cột có thể viết có dấu, không dấu, snake_case hoặc tiếng Anh.
            Cột bắt buộc duy nhất là Họ và tên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEVOTEE_CSV_FIELD_CONFIG.map((field) => (
              <div
                key={field.field}
                className="rounded-md border border-zinc-200 p-3"
              >
                <p className="text-sm font-medium text-zinc-900">
                  {field.label}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Ví dụ: {field.examples.slice(0, 3).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {result ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-zinc-500">Tổng dòng</p>
                <p className="mt-1 text-2xl font-semibold">
                  {result.summary.totalRows}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-zinc-500">Có thể import</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">
                  {result.summary.importableRows}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-zinc-500">Cảnh báo</p>
                <p className="mt-1 text-2xl font-semibold text-amber-700">
                  {result.summary.warningRows}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-zinc-500">Lỗi</p>
                <p className="mt-1 text-2xl font-semibold text-red-700">
                  {result.summary.errorRows}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kết quả đọc file</CardTitle>
              <CardDescription>
                Delimiter: {formatDelimiter(result.delimiter)}. Chỉ hiển thị tối
                đa {CSV_PREVIEW_ROW_LIMIT} dòng preview đầu tiên.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.globalErrors.length > 0 ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="mb-2 flex items-center gap-2 font-medium">
                    <AlertTriangle aria-hidden className="size-4" />
                    Lỗi cấp file
                  </div>
                  <ul className="list-disc space-y-1 pl-5">
                    {result.globalErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 aria-hidden className="size-4" />
                    Header đọc được. Các dòng không lỗi có thể import.
                  </div>
                </div>
              )}

              {result.unmappedHeaders.length > 0 ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  Các cột chưa map và sẽ bị bỏ qua:{" "}
                  {result.unmappedHeaders.join(", ")}.
                </p>
              ) : null}
              {result.truncated ? (
                <p className="text-sm text-zinc-500">
                  Preview đang bị rút gọn. File có nhiều hơn{" "}
                  {CSV_PREVIEW_ROW_LIMIT} dòng, nhưng summary vẫn tính trên toàn
                  bộ file.
                </p>
              ) : null}

              <div className="overflow-x-auto rounded-md border border-zinc-200">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Dòng</th>
                      <th className="px-3 py-2">Trạng thái</th>
                      <th className="px-3 py-2">Họ tên</th>
                      <th className="px-3 py-2">Pháp danh</th>
                      <th className="px-3 py-2">Ngày sinh</th>
                      <th className="px-3 py-2">Số danh bộ</th>
                      <th className="px-3 py-2">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {result.rows.map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-500">
                          {row.rowNumber}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ${statusClassName(row.status)}`}
                          >
                            {STATUS_LABELS[row.status]}
                          </span>
                        </td>
                        <td className="min-w-48 px-3 py-3 font-medium text-zinc-900">
                          {row.values.full_name || "-"}
                        </td>
                        <td className="min-w-36 px-3 py-3 text-zinc-700">
                          {row.values.dharma_name || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-700">
                          {row.values.birth_date || "-"}
                        </td>
                        <td className="min-w-40 px-3 py-3 text-zinc-700">
                          {row.values.family_registry_no ||
                            row.values.bhd_registry_no ||
                            "-"}
                        </td>
                        <td className="min-w-80 px-3 py-3 text-xs text-zinc-600">
                          <RowMessages row={row} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
