import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, ShieldCheck, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { profileDetailsQueryOptions, type ProfileDocument } from "@/lib/profile-data";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsSection() {
  const user = useCurrentUser();
  const { documents } = useProfileDetails();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [docType, setDocType] = useState<"cv" | "certificate">("cv");
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: profileDetailsQueryOptions(user.id).queryKey });

  const onUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a file to upload.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File must be 10 MB or smaller.");
      return;
    }
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      toast.error("Upload a PDF, Word document, or PNG/JPEG image.");
      return;
    }
    const cleanTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${docType}-${Date.now()}-${safeName}`;

    setUploading(true);
    const uploadRes = await supabase.storage.from("profile-documents").upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadRes.error) {
      setUploading(false);
      toast.error("File upload failed. Please try again.");
      return;
    }

    const insertRes = await supabase.from("profile_documents").insert({
      user_id: user.id,
      doc_type: docType,
      title: cleanTitle.slice(0, 140),
      issuer: issuer.trim().slice(0, 140),
      file_path: filePath,
      file_name: file.name.slice(0, 200),
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
    });
    setUploading(false);
    if (insertRes.error) {
      await supabase.storage.from("profile-documents").remove([filePath]);
      toast.error("Could not save document record.");
      return;
    }
    setTitle("");
    setIssuer("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    await refresh();
    toast.success(docType === "cv" ? "CV uploaded" : "Certificate uploaded");
  };

  const openDocument = async (doc: ProfileDocument) => {
    setBusyId(doc.id);
    const { data, error } = await supabase.storage.from("profile-documents").createSignedUrl(doc.file_path, 120);
    setBusyId(null);
    if (error || !data?.signedUrl) {
      toast.error("Could not open document.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const removeDocument = async (doc: ProfileDocument) => {
    setBusyId(doc.id);
    const { error } = await supabase.from("profile_documents").delete().eq("id", doc.id).eq("user_id", user.id);
    if (!error) {
      await supabase.storage.from("profile-documents").remove([doc.file_path]);
    }
    setBusyId(null);
    if (error) {
      toast.error("Could not remove document.");
      return;
    }
    await refresh();
    toast.success("Document removed");
  };

  const cvs = documents.filter((d) => d.doc_type === "cv");
  const certs = documents.filter((d) => d.doc_type === "certificate");

  const renderList = (items: ProfileDocument[], empty: string) =>
    items.length === 0 ? (
      <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
    ) : (
      <ul className="mt-3 space-y-2.5">
        {items.map((doc) => (
          <li key={doc.id} className="flex flex-col gap-2 rounded-2xl border bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{doc.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {doc.issuer ? `${doc.issuer} · ` : ""}{doc.file_name} · {formatBytes(doc.file_size)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="ghost" size="sm" disabled={busyId === doc.id} onClick={() => openDocument(doc)}>
                <Download className="size-4" /> View
              </Button>
              <Button type="button" variant="ghost" size="sm" disabled={busyId === doc.id} onClick={() => removeDocument(doc)} aria-label={`Remove ${doc.title}`}>
                {busyId === doc.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <section className="space-y-6 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-navy">CV & certificates</h2>
        <p className="mt-1 text-sm text-muted-foreground">Upload your CV and supporting certificates. Files are stored privately in your account.</p>
      </div>

      <form onSubmit={onUpload} className="space-y-4 rounded-2xl border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {(["cv", "certificate"] as const).map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={docType === type}
              onClick={() => setDocType(type)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                docType === type ? "border-teal bg-navy text-navy-foreground" : "bg-card text-navy",
              )}
            >
              {type === "cv" ? "CV / Resume" : "Certificate"}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="doc-title">Document title</Label>
            <Input
              id="doc-title"
              className="mt-1.5 h-11 bg-card"
              placeholder={docType === "cv" ? "e.g. Updated CV 2026" : "e.g. Nursing License, AWS Certificate"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {docType === "certificate" && (
            <div>
              <Label htmlFor="doc-issuer">Issuing organisation (optional)</Label>
              <Input
                id="doc-issuer"
                className="mt-1.5 h-11 bg-card"
                placeholder="e.g. Ministry of Health, Coursera"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
            </div>
          )}
          <div className={docType === "cv" ? "" : "sm:col-span-2"}>
            <Label htmlFor="doc-file">File (PDF, Word, PNG or JPEG · max 10 MB)</Label>
            <Input
              ref={fileRef}
              id="doc-file"
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
              className="mt-1.5 h-11 bg-card pt-2"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-teal" aria-hidden="true" />
            Private storage · Only you can open your uploaded files.
          </p>
          <Button type="submit" variant="teal" size="pill" disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload
          </Button>
        </div>
      </form>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium text-navy">No documents uploaded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload your CV or certificates to attach to applications and show on your Skills Passport.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-navy">CVs & resumes ({cvs.length})</h3>
            {renderList(cvs, "No CV uploaded yet.")}
          </div>
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-navy">Certificates ({certs.length})</h3>
            {renderList(certs, "No certificates uploaded yet.")}
          </div>
        </div>
      )}
    </section>
  );
}