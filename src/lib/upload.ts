export const ALLOWED_DELIVERABLE_EXTENSIONS = ["zip", "fig", "pdf", "png", "jpg", "jpeg"];
export const MAX_DELIVERABLE_SIZE = 100 * 1024 * 1024;

export const ALLOWED_PROOF_EXTENSIONS = ["jpg", "jpeg", "png"];
export const MAX_PROOF_SIZE = 5 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
export const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024;

export function validateFile(
  file: File,
  allowedExtensions: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Ukuran file "${file.name}" melebihi batas ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Format file .${ext} tidak didukung. Gunakan: ${allowedExtensions.map((e) => `.${e}`).join(", ")}`,
    };
  }

  return { valid: true };
}
