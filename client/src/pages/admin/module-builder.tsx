import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Save, Type, Mail, Lock, Hash, Phone, Link, AlignLeft, ChevronDown, CheckSquare,
  ToggleLeft, Calendar, Star, Paperclip, ChevronUp, Trash2, Copy, Settings, Eye, Database,
  Code, RefreshCw, Download, Search, Plus, GripVertical, X
} from "lucide-react";

// ─── Field type definitions ───────────────────────────────────────────────────
const FIELD_TYPES = [
  { type: "text", label: "Text", icon: Type, color: "text-blue-600 bg-blue-50" },
  { type: "email", label: "Email", icon: Mail, color: "text-purple-600 bg-purple-50" },
  { type: "password", label: "Password", icon: Lock, color: "text-red-600 bg-red-50" },
  { type: "number", label: "Number", icon: Hash, color: "text-green-600 bg-green-50" },
  { type: "phone", label: "Phone", icon: Phone, color: "text-teal-600 bg-teal-50" },
  { type: "url", label: "URL", icon: Link, color: "text-indigo-600 bg-indigo-50" },
  { type: "textarea", label: "Textarea", icon: AlignLeft, color: "text-gray-600 bg-gray-50" },
  { type: "dropdown", label: "Dropdown", icon: ChevronDown, color: "text-orange-600 bg-orange-50" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, color: "text-cyan-600 bg-cyan-50" },
  { type: "toggle", label: "Toggle", icon: ToggleLeft, color: "text-pink-600 bg-pink-50" },
  { type: "date", label: "Date", icon: Calendar, color: "text-yellow-600 bg-yellow-50" },
  { type: "rating", label: "Rating", icon: Star, color: "text-amber-600 bg-amber-50" },
  { type: "file", label: "File", icon: Paperclip, color: "text-violet-600 bg-violet-50" },
];

function getFieldTypeMeta(type: string) {
  return FIELD_TYPES.find(f => f.type === type) || FIELD_TYPES[0];
}

function toFieldName(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
}

function generateFieldId() {
  return `field_${Math.random().toString(36).substring(2, 9)}`;
}

interface Field {
  id: string;
  type: string;
  label: string;
  name: string;
  required: boolean;
  placeholder: string;
  options: string[];
  defaultValue: string;
}

interface ModuleSettings {
  successAction: string;
  successMessage: string;
  redirectUrl: string;
  maxEntries: number;
  maxPerUser: number;
  requireLogin: boolean;
  allowMultiple: boolean;
  notifyAdmin: boolean;
  notifyEmails: string;
  emailSubject: string;
  notificationFormat: string;
  sendConfirmation: boolean;
  honeypot: boolean;
  rateLimiting: boolean;
  maxPerIpPerHour: number;
  recaptcha: boolean;
}

interface DynamicModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  fields: Field[];
  settings: ModuleSettings;
  entryCount: number;
}

interface Entry {
  id: string;
  data: Record<string, any>;
  status: string;
  submittedAt: string;
  submitterIp: string;
}

const defaultSettings: ModuleSettings = {
  successAction: "message",
  successMessage: "Thank you for your submission!",
  redirectUrl: "",
  maxEntries: 0,
  maxPerUser: 0,
  requireLogin: false,
  allowMultiple: true,
  notifyAdmin: true,
  notifyEmails: "",
  emailSubject: "",
  notificationFormat: "plain",
  sendConfirmation: false,
  honeypot: true,
  rateLimiting: true,
  maxPerIpPerHour: 5,
  recaptcha: false,
};

// ─── Field Config Panel ───────────────────────────────────────────────────────
function FieldConfig({ field, onChange, onClose }: { field: Field; onChange: (f: Field) => void; onClose: () => void }) {
  const meta = getFieldTypeMeta(field.type);
  return (
    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Configure Field</span>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Label *</Label>
          <Input
            value={field.label}
            onChange={e => onChange({ ...field, label: e.target.value, name: toFieldName(e.target.value) })}
            className="h-8 text-sm"
            placeholder="Field label"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Field Name</Label>
          <Input value={field.name} readOnly className="h-8 text-sm font-mono bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Placeholder</Label>
        <Input
          value={field.placeholder}
          onChange={e => onChange({ ...field, placeholder: e.target.value })}
          className="h-8 text-sm"
          placeholder="Hint text shown inside field"
        />
      </div>
      {field.type === "dropdown" && (
        <div className="space-y-1">
          <Label className="text-xs">Options (one per line)</Label>
          <Textarea
            value={field.options.join("\n")}
            onChange={e => onChange({ ...field, options: e.target.value.split("\n").filter(Boolean) })}
            rows={3}
            className="text-sm"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Switch
          checked={field.required}
          onCheckedChange={v => onChange({ ...field, required: v })}
          id={`req-${field.id}`}
        />
        <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer">Required field</Label>
      </div>
    </div>
  );
}

// ─── Live Form Preview ────────────────────────────────────────────────────────
function FormPreview({ module }: { module: DynamicModule }) {
  const fields = module.fields || [];
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{module.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Live preview — hidden fields are not shown</p>
          </div>
          {fields.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No fields added yet. Go to Form Fields tab to add fields.</p>
          )}
          {fields.map(field => {
            const meta = getFieldTypeMeta(field.type);
            return (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea placeholder={field.placeholder || `Write your ${field.label.toLowerCase()}...`} rows={3} readOnly />
                ) : field.type === "dropdown" ? (
                  <Select disabled>
                    <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                    <SelectContent>
                      {field.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" disabled />
                    <span className="text-sm text-gray-600">{field.placeholder || field.label}</span>
                  </div>
                ) : field.type === "toggle" ? (
                  <Switch disabled />
                ) : field.type === "rating" ? (
                  <div className="flex gap-1">{[1,2,3,4,5].map(n => <Star key={n} className="h-6 w-6 text-gray-300" />)}</div>
                ) : (
                  <Input type={field.type === "password" ? "password" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} placeholder={field.placeholder} readOnly />
                )}
              </div>
            );
          })}
          {fields.length > 0 && (
            <Button className="w-full">Submit</Button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">FIELD SUMMARY</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {fields.map((f, i) => {
              const meta = getFieldTypeMeta(f.type);
              const Icon = meta.icon;
              return (
                <div key={f.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-4 text-xs">{i + 1}</span>
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{f.label}</span>
                  {f.required && <span className="text-red-400 text-xs">*</span>}
                </div>
              );
            })}
            {fields.length === 0 && <p className="text-sm text-gray-400">No fields</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">LEGEND</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2"><span className="text-red-400">*</span> Required field</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── API Docs Tab ─────────────────────────────────────────────────────────────
function ApiDocsTab({ module }: { module: DynamicModule }) {
  const base = `/api/dynamic-modules`;
  const endpoints = [
    { method: "GET", path: `${base}/${module.id}/entries`, desc: "List all entries (paginated)", auth: true },
    { method: "POST", path: `${base}/submit/${module.slug}`, desc: "Submit a new entry (public)", auth: false },
    { method: "GET", path: `${base}/${module.id}/entries/:id`, desc: "Get single entry by ID", auth: true },
    { method: "PATCH", path: `${base}/${module.id}/entries/:id`, desc: "Update entry status", auth: true },
    { method: "DELETE", path: `${base}/${module.id}/entries/:id`, desc: "Delete an entry", auth: true },
    { method: "GET", path: `${base}/${module.id}/export`, desc: "Export all entries as CSV", auth: true },
  ];
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700", POST: "bg-green-100 text-green-700",
    PATCH: "bg-orange-100 text-orange-700", DELETE: "bg-red-100 text-red-700",
  };
  return (
    <div className="space-y-4 max-w-3xl">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{module.name} — API Reference</p>
              <p className="text-xs text-gray-400 font-mono">{`/api/dynamic-modules/${module.slug}`}</p>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded px-3 py-2 text-xs text-amber-800 dark:text-amber-300 font-mono">
            Auth: Authorization: Bearer &lt;your_api_key&gt; (admin endpoints only)
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold text-gray-900 dark:text-white">Endpoints</h3>
      <div className="space-y-2">
        {endpoints.map((ep, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-900">
            <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono w-16 text-center ${colors[ep.method]}`}>
              {ep.method}
            </span>
            <code className="text-xs flex-1 text-gray-700 dark:text-gray-300 font-mono">{ep.path}</code>
            <span className="text-xs text-gray-500">{ep.desc}</span>
            {!ep.auth && <Badge variant="outline" className="text-xs text-green-600">Public</Badge>}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">JSON Schema for this module</CardTitle></CardHeader>
        <CardContent>
          <pre className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
{JSON.stringify({
  name: module.name,
  slug: module.slug,
  fields: (module.fields || []).map((f: Field) => ({
    name: f.name, type: f.type, label: f.label, required: f.required,
    ...(f.options?.length ? { options: f.options } : {}),
  }))
}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ module, settings, setSettings, onSave, onDelete, isSaving }: {
  module: DynamicModule;
  settings: ModuleSettings;
  setSettings: (s: ModuleSettings) => void;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://wytnet.com";
  const [showDelete, setShowDelete] = useState(false);
  const jsEmbed = `<!-- WytNet Module: ${module.name} -->
<div id="wyt-module-${module.slug}"></div>
<script src="${origin}/embed/module.js"
  data-module="${module.slug}"
  data-key="pub_your_key">
</script>`;
  const iframeEmbed = `<iframe
  src="${origin}/m/${module.slug}"
  width="100%"
  height="600"
  frameborder="0"
  allow="camera">
</iframe>`;

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Module Info */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Module Info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Module Name</Label>
            <Input value={module.name} readOnly className="bg-gray-50 dark:bg-gray-800" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={module.description || ""} readOnly rows={2} className="bg-gray-50 dark:bg-gray-800" />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={settings.successAction === "message" ? "sameOk" : "sameOk"} disabled>
              <SelectTrigger>
                <SelectValue placeholder={`${module.status.charAt(0).toUpperCase() + module.status.slice(1)} — edit status in builder header`} />
              </SelectTrigger>
              <SelectContent><SelectItem value="sameOk">Current: {module.status}</SelectItem></SelectContent>
            </Select>
            <p className="text-xs text-gray-400">Change the status using the status dropdown in the page header.</p>
          </div>
        </CardContent>
      </Card>

      {/* Submission Settings */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Submission Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Success Action</Label>
            <Select value={settings.successAction} onValueChange={v => setSettings({ ...settings, successAction: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="message">Show success message</SelectItem>
                <SelectItem value="redirect">Redirect to URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {settings.successAction === "message" && (
            <div className="space-y-1">
              <Label>Success Message</Label>
              <Input value={settings.successMessage} onChange={e => setSettings({ ...settings, successMessage: e.target.value })} />
            </div>
          )}
          {settings.successAction === "redirect" && (
            <div className="space-y-1">
              <Label>Redirect URL</Label>
              <Input value={settings.redirectUrl} onChange={e => setSettings({ ...settings, redirectUrl: e.target.value })} placeholder="https://yoursite.com/thank-you" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Max Entries (0 = unlimited)</Label>
              <Input type="number" value={settings.maxEntries} onChange={e => setSettings({ ...settings, maxEntries: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1">
              <Label>Max Per User (0 = unlimited)</Label>
              <Input type="number" value={settings.maxPerUser} onChange={e => setSettings({ ...settings, maxPerUser: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: "requireLogin", label: "Require Login to Submit", desc: "Only authenticated users can submit" },
              { key: "allowMultiple", label: "Allow Multiple Submissions", desc: "Same user can submit more than once" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <Switch checked={(settings as any)[key]} onCheckedChange={v => setSettings({ ...settings, [key]: v })} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Email Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notify admin on new submission</p>
            </div>
            <Switch checked={settings.notifyAdmin} onCheckedChange={v => setSettings({ ...settings, notifyAdmin: v })} />
          </div>
          {settings.notifyAdmin && (
            <>
              <div className="space-y-1">
                <Label>Notify Email(s)</Label>
                <Input value={settings.notifyEmails} onChange={e => setSettings({ ...settings, notifyEmails: e.target.value })} placeholder="admin@example.com" />
                <p className="text-xs text-gray-400">Comma-separated emails for multiple recipients</p>
              </div>
              <div className="space-y-1">
                <Label>Email Subject</Label>
                <Input value={settings.emailSubject} onChange={e => setSettings({ ...settings, emailSubject: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Notification Format</Label>
                <Select value={settings.notificationFormat} onValueChange={v => setSettings({ ...settings, notificationFormat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain summary of submitted fields</SelectItem>
                    <SelectItem value="html">HTML formatted email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Send confirmation to submitter</p>
                  <p className="text-xs text-gray-400">Requires an email field in the form</p>
                </div>
                <Switch checked={settings.sendConfirmation} onCheckedChange={v => setSettings({ ...settings, sendConfirmation: v })} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Spam Protection */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Spam Protection</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "honeypot", label: "Honeypot Field", desc: "Invisible field that catches bots automatically" },
            { key: "rateLimiting", label: "Rate Limiting", desc: "Limit submissions per IP address per hour" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <Switch checked={(settings as any)[key]} onCheckedChange={v => setSettings({ ...settings, [key]: v })} />
            </div>
          ))}
          {settings.rateLimiting && (
            <div className="space-y-1">
              <Label>Max submissions per IP per hour</Label>
              <Input type="number" value={settings.maxPerIpPerHour} onChange={e => setSettings({ ...settings, maxPerIpPerHour: parseInt(e.target.value) || 5 })} className="w-32" />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Google reCAPTCHA</p>
              <p className="text-xs text-gray-400">Requires reCAPTCHA configured in System Settings</p>
            </div>
            <Switch checked={settings.recaptcha} onCheckedChange={v => setSettings({ ...settings, recaptcha: v })} />
          </div>
        </CardContent>
      </Card>

      {/* Embed Code */}
      {module.status === "active" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Embed Code</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">JAVASCRIPT EMBED (RECOMMENDED)</p>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyText(jsEmbed)}>Copy</Button>
              </div>
              <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">{jsEmbed}</pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">IFRAME EMBED</p>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyText(iframeEmbed)}>Copy</Button>
              </div>
              <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">{iframeEmbed}</pre>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              The JS embed auto-resizes, supports dark mode, and handles CORS. Replace <code>pub_your_key</code> with your public embed key from Admin → API Keys.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={onSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="destructive" onClick={() => setShowDelete(true)} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete Module
        </Button>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this module?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{module.name}" and all its entries. Cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onDelete}>Delete Module</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Builder Page ────────────────────────────────────────────────────────
export default function ModuleBuilderPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [fields, setFields] = useState<Field[]>([]);
  const [settings, setSettings] = useState<ModuleSettings>(defaultSettings);
  const [configFieldId, setConfigFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("fields");
  const [entrySearch, setEntrySearch] = useState("");
  const [entryPage, setEntryPage] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const [moduleStatus, setModuleStatus] = useState("draft");

  const { data: modData, isLoading } = useQuery<{ module: DynamicModule }>({
    queryKey: [`/api/dynamic-modules/${moduleId}`],
    enabled: !!moduleId,
  });

  const mod = modData?.module;

  useEffect(() => {
    if (mod) {
      setFields((mod.fields as Field[]) || []);
      setSettings({ ...defaultSettings, ...(mod.settings as ModuleSettings) });
      setModuleStatus(mod.status);
    }
  }, [mod]);

  const { data: entriesData, refetch: refetchEntries } = useQuery<{ entries: Entry[]; total: number }>({
    queryKey: [`/api/dynamic-modules/${moduleId}/entries`, entryPage],
    enabled: !!moduleId && activeTab === "entries",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(`/api/dynamic-modules/${moduleId}`, "PUT", {
        fields,
        settings,
        status: moduleStatus,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/dynamic-modules/${moduleId}`] });
      qc.invalidateQueries({ queryKey: ["/api/dynamic-modules"] });
      setIsDirty(false);
      toast({ title: "Module saved successfully" });
    },
    onError: () => toast({ title: "Failed to save module", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/dynamic-modules/${moduleId}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Module deleted" });
      setLocation("/engine/module-builder");
    },
    onError: () => toast({ title: "Failed to delete module", variant: "destructive" }),
  });

  const updateEntryStatusMutation = useMutation({
    mutationFn: async ({ entryId, status }: { entryId: string; status: string }) => {
      await apiRequest(`/api/dynamic-modules/${moduleId}/entries/${entryId}`, "PATCH", { status });
    },
    onSuccess: () => refetchEntries(),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await apiRequest(`/api/dynamic-modules/${moduleId}/entries/${entryId}`, "DELETE");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/dynamic-modules/${moduleId}`] });
      refetchEntries();
    },
  });

  const addField = (type: string) => {
    const meta = getFieldTypeMeta(type);
    const label = meta.label + " Field";
    const newField: Field = {
      id: generateFieldId(),
      type,
      label,
      name: toFieldName(label),
      required: false,
      placeholder: "",
      options: type === "dropdown" ? ["Option 1", "Option 2"] : [],
      defaultValue: "",
    };
    setFields(prev => [...prev, newField]);
    setConfigFieldId(newField.id);
    setIsDirty(true);
  };

  const updateField = (updated: Field) => {
    setFields(prev => prev.map(f => f.id === updated.id ? updated : f));
    setIsDirty(true);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (configFieldId === id) setConfigFieldId(null);
    setIsDirty(true);
  };

  const moveField = (id: string, dir: "up" | "down") => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
    setIsDirty(true);
  };

  const duplicateField = (field: Field) => {
    const dup: Field = { ...field, id: generateFieldId(), label: field.label + " (Copy)", name: toFieldName(field.label + "_copy") };
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === field.id);
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
    setIsDirty(true);
  };

  const handleExport = () => {
    window.open(`/api/dynamic-modules/${moduleId}/export`, "_blank");
  };

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center"><div className="text-gray-400">Loading module...</div></div>;
  }

  if (!mod) {
    return <div className="p-6 text-center text-gray-400">Module not found. <Button variant="link" onClick={() => setLocation("/engine/module-builder")}>Back to Modules</Button></div>;
  }

  const entries = entriesData?.entries || [];
  const totalEntries = entriesData?.total || mod.entryCount || 0;
  const configField = fields.find(f => f.id === configFieldId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/engine/module-builder")} className="gap-1 text-gray-500">
            <ArrowLeft className="h-4 w-4" /> Back to Modules
          </Button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <h1 className="font-semibold text-gray-900 dark:text-white">{mod.name}</h1>
          <Select value={moduleStatus} onValueChange={v => { setModuleStatus(v); setIsDirty(true); }}>
            <SelectTrigger className={`w-auto h-6 text-xs px-2 border-0 rounded-full ${moduleStatus === "active" ? "bg-green-100 text-green-700" : moduleStatus === "archived" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">draft</SelectItem>
              <SelectItem value="active">active</SelectItem>
              <SelectItem value="archived">archived</SelectItem>
            </SelectContent>
          </Select>
          <code className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{mod.slug}</code>
          {isDirty && <span className="text-xs text-orange-500 font-medium">Unsaved changes</span>}
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Module"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-6 pt-2 bg-white dark:bg-gray-900 flex-shrink-0">
            <TabsList className="bg-transparent border-0 h-auto p-0 gap-0">
              {[
                { id: "fields", label: "Form Fields", count: fields.length, icon: null },
                { id: "preview", label: "Preview", count: null, icon: Eye },
                { id: "entries", label: "Created Data", count: totalEntries, icon: Database },
                { id: "apidocs", label: "API Docs", count: null, icon: Code },
                { id: "settings", label: "Settings", count: null, icon: Settings },
              ].map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`rounded-none border-b-2 px-4 py-2 text-sm font-medium transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500 bg-transparent`}
                >
                  {tab.icon && <tab.icon className="h-4 w-4 mr-1.5" />}
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Form Fields Tab */}
          <TabsContent value="fields" className="flex-1 m-0 overflow-auto">
            <div className="flex h-full">
              {/* Field Types Sidebar */}
              <div className="w-56 border-r bg-gray-50 dark:bg-gray-900 flex-shrink-0 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">FIELD TYPES</p>
                <div className="space-y-1">
                  {FIELD_TYPES.map(ft => {
                    const Icon = ft.icon;
                    return (
                      <button
                        key={ft.type}
                        onClick={() => addField(ft.type)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all text-left group"
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${ft.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        {ft.label}
                        <Plus className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fields List */}
              <div className="flex-1 p-4 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    FORM FIELDS <span className="ml-1 bg-gray-100 dark:bg-gray-800 px-1.5 rounded text-gray-600 normal-case">{fields.length}</span>
                  </p>
                  <p className="text-xs text-gray-400">Click a field type on the left to add it</p>
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <AlignLeft className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No fields yet</p>
                    <p className="text-xs mt-1">Click a field type on the left to add it here</p>
                  </div>
                )}

                <div className="space-y-2 max-w-2xl">
                  {fields.map((field, idx) => {
                    const meta = getFieldTypeMeta(field.type);
                    const Icon = meta.icon;
                    const isConfiguring = configFieldId === field.id;
                    return (
                      <div key={field.id}>
                        <div className={`flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-900 group transition-colors ${isConfiguring ? "border-blue-400 ring-1 ring-blue-300" : "hover:border-gray-300"}`}>
                          <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1 text-xs">Required</span>}
                            </p>
                            <p className="text-xs text-gray-400">{meta.label}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveField(field.id, "up")} disabled={idx === 0}>
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveField(field.id, "down")} disabled={idx === fields.length - 1}>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => duplicateField(field)} title="Duplicate">
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 w-7 p-0 ${isConfiguring ? "text-blue-600" : ""}`}
                              onClick={() => setConfigFieldId(isConfiguring ? null : field.id)}
                              title="Configure"
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => removeField(field.id)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {isConfiguring && configField && (
                          <div className="ml-12 mt-1">
                            <FieldConfig
                              field={configField}
                              onChange={updateField}
                              onClose={() => setConfigFieldId(null)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 m-0 overflow-auto p-6">
            <FormPreview module={{ ...mod, fields, status: moduleStatus }} />
          </TabsContent>

          {/* Entries Tab */}
          <TabsContent value="entries" className="flex-1 m-0 overflow-auto p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search entries..."
                    value={entrySearch}
                    onChange={e => setEntrySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchEntries()} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Database className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No entries yet</p>
                  <p className="text-xs mt-1">Entries will appear here once the form is submitted</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left w-10">#</th>
                        {fields.slice(0, 4).map(f => (
                          <th key={f.id} className="px-4 py-3 text-left">{f.label}</th>
                        ))}
                        <th className="px-4 py-3 text-left">STATUS</th>
                        <th className="px-4 py-3 text-left">SUBMITTED</th>
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {entries
                        .filter(e => !entrySearch || JSON.stringify(e.data).toLowerCase().includes(entrySearch.toLowerCase()))
                        .map((entry, i) => (
                          <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-gray-400">{(entryPage - 1) * 20 + i + 1}</td>
                            {fields.slice(0, 4).map(f => (
                              <td key={f.id} className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                                {String((entry.data as any)[f.name] ?? "")}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <Select
                                value={entry.status}
                                onValueChange={v => updateEntryStatusMutation.mutate({ entryId: entry.id, status: v })}
                              >
                                <SelectTrigger className="h-7 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">new</SelectItem>
                                  <SelectItem value="read">read</SelectItem>
                                  <SelectItem value="replied">replied</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                              {new Date(entry.submittedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                                onClick={() => deleteEntryMutation.mutate(entry.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 border-t text-xs text-gray-400 flex items-center justify-between">
                    <span>{totalEntries} total entries</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={entryPage === 1} onClick={() => setEntryPage(p => p - 1)}>Prev</Button>
                      <span className="flex items-center px-2">{entryPage}</span>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={entries.length < 20} onClick={() => setEntryPage(p => p + 1)}>Next</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* API Docs Tab */}
          <TabsContent value="apidocs" className="flex-1 m-0 overflow-auto p-6">
            <ApiDocsTab module={{ ...mod, fields }} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 m-0 overflow-auto p-6">
            <SettingsTab
              module={{ ...mod, fields, status: moduleStatus }}
              settings={settings}
              setSettings={s => { setSettings(s); setIsDirty(true); }}
              onSave={() => saveMutation.mutate()}
              onDelete={() => deleteMutation.mutate()}
              isSaving={saveMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
