"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PaymentProofForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const form = formRef.current;
    if (!form?.reportValidity()) return;
    startTransition(() => {
      form.requestSubmit();
    });
  };

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="proof">Unggah bukti transfer</Label>
        <div className="rounded-lg border-2 border-dashed bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className="size-4" />
            JPG / PNG, maks 5MB
          </div>
          <input
            id="proof"
            name="proof"
            type="file"
            accept="image/*"
            required
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
            className="block w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/85"
          />
          {fileName && (
            <p className="mt-2 text-xs text-muted-foreground">
              File dipilih: <span className="font-medium text-foreground">{fileName}</span>
            </p>
          )}
        </div>
      </div>
      <Button type="button" className="w-full" onClick={submit} disabled={pending}>
        {pending ? "Mengirim..." : "Kirim Bukti Pembayaran"}
      </Button>
    </form>
  );
}
