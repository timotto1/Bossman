type Field = { name: string; value: string | undefined };

export const validateRequiredFields = (fields: Field[]): string | null => {
  const missingFields = fields.filter((field) => !field.value);
  if (missingFields.length) {
    return `Missing required fields: ${missingFields.map((f) => f.name).join(", ")}.`;
  }
  return null;
};
