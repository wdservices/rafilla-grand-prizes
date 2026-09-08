import { useCallback, useMemo, useRef, useState } from "react";
import {
  Upload,
  Link2,
  X,
  FileImage,
  Cloud,
  Info,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  cloudinaryThumb,
  getCloudinaryEnv,
  uploadToCloudinary,
  type CloudinaryUploadResult,
} from "@/lib/cloudinary-upload";

type PendingItem = {
  id: string;
  source: "cloudinary" | "link";
  url: string;
  name?: string;
  progress?: number;
  size?: number;
  done: boolean;
  error?: string;
};

const validImageMime = /^image\/(png|jpe?g|gif|webp|avif)$/i;
const validUrl = (u: string) => {
  try {
    const p = new URL(u);
    return p.protocol === "https:" || p.protocol === "http:";
  } catch {
    return false;
  }
};

export type AssetUploaderProps = {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
  mode?: "compact" | "expanded";
  disabled?: boolean;
  size?: "sm" | "md";
};

export function AssetUploader({
  value,
  onChange,
  max = 12,
  label = "Prize assets",
  hint = "Upload from device via Cloudinary, or paste direct image URLs.",
  mode = "expanded",
  disabled,
  size = "md",
}: AssetUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const linkInputRef = useRef<HTMLInputElement | null>(null);

  const env = useMemo(() => getCloudinaryEnv(), []);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  function appendUrls(urls: string[]) {
    const remaining = Math.max(0, max - value.length);
    const take = urls.slice(0, remaining);
    const deduped = [...value, ...take.filter((u) => u && !value.includes(u))];
    onChange(deduped);
    if (urls.length > remaining) {
      toast.warning(`Only ${remaining} of ${urls.length} added (max ${max}).`, {
        description: "Remove existing images to free slots.",
      });
    }
  }

  function removeAt(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
  }

  function setAt(i: number, url: string) {
    const next = value.slice();
    next[i] = url;
    onChange(next);
  }

  async function handleFiles(files: FileList | File[]) {
    if (value.length >= max) {
      toast.error("Upload limit reached", { description: `Max ${max} assets per competition. Remove some first.` });
      return;
    }
    const array = Array.from(files).filter((f) => validImageMime.test(f.type));
    if (!array.length) {
      toast.error("Invalid file", { description: "Supported: PNG, JPG, GIF, WebP, AVIF." });
      return;
    }
    const items: PendingItem[] = array.slice(0, max - value.length).map((f, k) => ({
      id: `${Date.now()}-${k}-${f.name}`,
      source: "cloudinary",
      url: "",
      name: f.name,
      progress: 0,
      size: f.size,
      done: false,
    }));
    setPending((p) => [...p, ...items]);
    await Promise.all(
      items.map((item) => {
        const f = array[items.indexOf(item)]!;
        return uploadToCloudinary(f, (pct) => {
          setPending((arr) =>
            arr.map((x) => (x.id === item.id ? { ...x, progress: pct } : x)),
          );
        })
          .then((res: CloudinaryUploadResult) => {
            appendUrls([res.secure_url]);
            setPending((arr) =>
              arr.map((x) => (x.id === item.id ? { ...x, done: true, url: res.secure_url, progress: 100 } : x)),
            );
          })
          .catch((err) => {
            const msg = err instanceof Error ? err.message : "Upload failed";
            setPending((arr) =>
              arr.map((x) => (x.id === item.id ? { ...x, done: true, error: msg } : x)),
            );
            toast.error("Upload failed", { description: msg });
          });
      }),
    );
    setTimeout(() => {
      setPending((arr) => arr.filter((x) => !x.done));
    }, 1200);
  }

  function addLink() {
    const raw = linkValue
      .split(/[,\n ]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!raw.length) {
      setLinkError("Paste at least one https image URL.");
      return;
    }
    const bad = raw.find((u) => !validUrl(u));
    if (bad) {
      setLinkError(`Invalid URL: ${bad.slice(0, 60)} — must start with https:// or http://`);
      return;
    }
    setLinkError(null);
    appendUrls(raw);
    setLinkValue("");
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
  }, [value.length, max]);

  const hasItems = value.length > 0 || pending.length > 0;

  const compactUi = (
    <div className="space-y-3">
      {hasItems ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {value.map((u, i) => (
            <div
              key={`${u}-${i}`}
              className="group relative overflow-hidden rounded-[18px] ring-1 ring-ink/10"
            >
              <img
                src={cloudinaryThumb(u, 480, 320)}
                alt=""
                className="aspect-[4/3] w-full object-cover"
                onError={(e) => ((e.currentTarget.style.visibility = "hidden"))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(i)}
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/95 text-ink ring-1 ring-ink/10 opacity-0 transition-opacity hover:bg-coral hover:text-white group-hover:opacity-100 disabled:opacity-30"
                aria-label="Remove asset"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-2 text-xs font-extrabold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {u.includes("cloudinary.com") ? "Cloudinary" : "Remote URL"}
              </div>
            </div>
          ))}
          {pending.filter((p) => !p.done || p.url).map((p) => (
            <div
              key={p.id}
              className="relative aspect-[4/3] overflow-hidden rounded-[18px] ring-1 ring-ink/10 bg-cream"
            >
              {p.url ? (
                <img src={cloudinaryThumb(p.url, 480, 320)} alt="" className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-ink/40">
                  <FileImage className="size-8" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-coral transition-[width]"
                    style={{ width: `${Math.min(100, p.progress ?? 0)}%` }}
                  />
                </div>
                <p className="mt-1 truncate text-[10px] font-extrabold text-white/90">
                  {p.error ? <span className="text-coral">{p.error}</span> : p.name}
                </p>
              </div>
            </div>
          ))}
          {value.length < max && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="grid aspect-[4/3] w-full place-items-center rounded-[18px] border-2 border-dashed border-ink/15 bg-cream/60 text-ink/55 transition-all hover:border-coral hover:bg-white hover:text-coral disabled:opacity-40"
            >
              <Plus className="size-6" />
            </button>
          )}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size={size} onClick={() => setOpen(true)} disabled={disabled}>
          <Upload className="size-4" /> Add assets
        </Button>
        <Button type="button" variant="ghost" size={size} onClick={() => inputRef.current?.focus()} disabled={disabled}>
          <Link2 className="size-4" /> Paste URLs
        </Button>
        {!env.hasConfig && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lemon/30 px-2.5 py-1 text-[11px] font-extrabold text-ink ring-1 ring-ink/10">
            <AlertCircle className="size-3" /> Demo mode (local files)
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={cn(
            "text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50",
            size === "sm" ? "text-[9px]" : "",
          )}>{label}</p>
          {hint ? <p className="mt-1 text-xs font-bold text-ink/55">{hint}</p> : null}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="grid size-6 place-items-center rounded-lg bg-ink/5">
            {env.hasConfig ? <Cloud className="size-3.5 text-coral" /> : <FileImage className="size-3.5 text-ink/50" />}
          </span>
          <span className="text-[11px] font-extrabold text-ink/55">{value.length} / {max}</span>
        </div>
      </div>

      {mode === "expanded" ? (
        <div
          className={cn(
            "space-y-3 rounded-[22px] p-4 transition-colors",
            dragging ? "bg-coral/6 ring-2 ring-coral/40" : "bg-white ring-1 ring-ink/10",
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div
            className={cn(
              "rounded-[18px] border-2 border-dashed px-5 py-6 text-center transition-all",
              dragging ? "border-coral/60 bg-coral/5" : "border-ink/15 bg-cream/50 hover:border-coral/40 hover:bg-white",
            )}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-coral/15 text-coral">
              <Upload className="size-5" />
            </div>
            <p className="mt-3 text-sm font-extrabold text-ink">Drag images here, or click to browse</p>
            <p className="mt-1 text-xs font-bold text-ink/55">Cloudinary upload · PNG, JPG, GIF, WebP, AVIF · up to 20MB each</p>
            {!env.hasConfig ? (
              <p className="mt-3 inline-flex items-start gap-2 rounded-xl bg-lemon/30 px-3 py-2 text-left text-[11px] font-bold text-ink ring-1 ring-ink/10">
                <Info className="mt-0.5 size-3.5 shrink-0 text-ink/70" />
                <span>
                  <span className="font-extrabold">Cloudinary not configured.</span> Set{" "}
                  <code className="rounded bg-white px-1 py-0.5 ring-1 ring-ink/10">VITE_CLOUDINARY_CLOUD_NAME</code>{" "}
                  and{" "}
                  <code className="rounded bg-white px-1 py-0.5 ring-1 ring-ink/10">VITE_CLOUDINARY_UPLOAD_PRESET</code>{" "}
                  in <code className="rounded bg-white px-1 py-0.5 ring-1 ring-ink/10">.env</code> to enable. Demo mode stores images locally on your device only.
                </span>
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button type="button" variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} disabled={disabled}>
                <Upload className="size-3.5" /> Browse files
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setOpen(true); }} disabled={disabled}>
                <Link2 className="size-3.5" /> Paste link
              </Button>
            </div>
          </div>

          <div className="space-y-2.5 rounded-[18px] bg-cream/60 p-3 ring-1 ring-ink/5">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-ink/55" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/50">Or add image URLs directly</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                ref={inputRef}
                placeholder="https://cdn.raffila.ng/car.jpg, https://cdn.raffila.ng/inside.jpg"
                value={linkValue}
                onChange={(e) => { setLinkValue(e.target.value); if (linkError) setLinkError(null); }}
                className="min-h-11 flex-1 rounded-2xl border-0 bg-white pl-4 pr-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
              />
              <Button type="button" variant="outline" size="sm" onClick={addLink} disabled={disabled}>
                <Plus className="size-3.5" /> Add URLs
              </Button>
            </div>
            {linkError ? <p className="px-1 text-xs font-extrabold text-coral">{linkError}</p> : null}
          </div>

          {compactUi}

          {pending.some((p) => !p.done) ? (
            <div className="space-y-2 rounded-[18px] bg-ink/[0.03] p-3 ring-1 ring-ink/10">
              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                <Loader2 className="size-3.5 animate-spin text-coral" /> Uploads in progress
              </p>
              <ul className="space-y-1.5">
                {pending.filter((p) => !p.done).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-ink/5">
                    <FileImage className="size-4 shrink-0 text-ink/50" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-extrabold text-ink">{p.name}</p>
                        <span className="text-[10px] font-extrabold text-ink/50">{Math.min(100, p.progress ?? 0)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream">
                        <div
                          className="h-full rounded-full bg-coral transition-[width]"
                          style={{ width: `${Math.min(100, p.progress ?? 0)}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild className="hidden">
              <button type="button" aria-hidden />
            </DialogTrigger>
            <DialogContent className="rounded-[28px] bg-paper p-0 sm:max-w-lg overflow-hidden">
              <DialogHeader className="border-b border-ink/10 px-6 py-5">
                <DialogTitle className="flex items-center gap-3 font-display text-2xl font-extrabold text-ink">
                  <span className="grid size-10 place-items-center rounded-2xl bg-sky/25">
                    <Link2 className="size-5 text-ink" />
                  </span>
                  Add image URL
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm font-bold text-ink/55">
                  Paste one or more public image URLs. Comma or newline separated.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 px-6 py-5">
                <textarea
                  ref={linkInputRef}
                  placeholder="https://cdn.raffila.ng/asset1.jpg&#10;https://cdn.raffila.ng/asset2.jpg"
                  value={linkValue}
                  onChange={(e) => { setLinkValue(e.target.value); if (linkError) setLinkError(null); }}
                  rows={4}
                  className="w-full rounded-2xl border-0 bg-white p-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:outline-none focus-visible:ring-coral"
                />
                {linkError ? <p className="px-1 text-xs font-extrabold text-coral">{linkError}</p> : null}
              </div>
              <DialogFooter className="border-t border-ink/10 px-6 py-4">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    addLink();
                    if (!linkError) setOpen(false);
                  }}
                >
                  Add URLs
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              placeholder="https://cdn.raffila.ng/asset1.jpg, …"
              value={linkValue}
              onChange={(e) => { setLinkValue(e.target.value); if (linkError) setLinkError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
              className="h-11 rounded-2xl border-0 bg-white pl-4 pr-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
            />
            <Button variant="outline" size="sm" onClick={addLink} disabled={disabled}>
              <Plus className="size-3.5" /> Add URL
            </Button>
          </div>
          {linkError ? <p className="px-1 text-xs font-extrabold text-coral">{linkError}</p> : null}
          {compactUi}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
        multiple
        disabled={disabled}
        className="hidden"
        onChange={(e) => e.target.files && void handleFiles(e.target.files)}
      />
    </div>
  );
}
