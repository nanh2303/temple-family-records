import { MAU_GIA_PHA_TEMPLATE_FILENAME } from "@/lib/pdf/pdfFieldMap";

export type FormTemplateId = "mau-gia-pha-05";

export type FormTemplateDefinition = {
  id: FormTemplateId;
  name: string;
  description: string;
  templateFileName: string;
};

export const DEFAULT_FORM_TEMPLATE_ID: FormTemplateId = "mau-gia-pha-05";

export const FORM_TEMPLATES: FormTemplateDefinition[] = [
  {
    id: "mau-gia-pha-05",
    name: "Mẫu Gia Phả",
    description: "Mẫu số 05.BHD Trung Ương",
    templateFileName: MAU_GIA_PHA_TEMPLATE_FILENAME,
  },
];

export function isFormTemplateId(value: string): value is FormTemplateId {
  return FORM_TEMPLATES.some((template) => template.id === value);
}

export function getFormTemplateDefinition(id: FormTemplateId) {
  return FORM_TEMPLATES.find((template) => template.id === id);
}
