import React, { useState } from 'react';
import { MediaIdentity, QuizQuestion, AppConfig } from '../types';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../data/defaultConfig';
import { testScriptConnection, getLocalBackupLogs, clearLocalBackupLogs, StoredLog } from '../services/apiService';
import { audioManager } from '../utils/audio';
import { 
  X, 
  Settings, 
  Copy, 
  Check, 
  Database, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Download,
  ShieldCheck,
  CheckSquare,
  Smartphone,
  Laptop,
  BarChart3
} from 'lucide-react';
import { StudentProgressReport } from '../types';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  questions: QuizQuestion[];
  onSaveQuestions: (newQuestions: QuizQuestion[]) => void;
}

type TabType = 'identity' | 'script' | 'guide' | 'checklist' | 'logs';

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  questions,
  onSaveQuestions
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>('identity');

  // Local identity form state
  const [identityForm, setIdentityForm] = useState<MediaIdentity>({ ...config.identity });
  const [scriptUrl, setScriptUrl] = useState(config.scriptUrl || '');

  // Copy states
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Connection Test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Local Logs
  const [logs, setLogs] = useState<StoredLog[]>(getLocalBackupLogs());

  // Stored Student Progress Report
  const storedReport: StudentProgressReport | null = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('mpi_progress_report_v2_math');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [isOpen, activeTab]);

  // Interactive QA Checklist state
  const [checkedList, setCheckedList] = useState<Record<string, boolean>>({
    'c1': true,
    'c2': true,
    'c3': true,
  });

  const handleCopyScript = () => {
    audioManager.playClick();
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleTestConnection = async () => {
    audioManager.playClick();
    setIsTesting(true);
    setTestResult(null);

    const res = await testScriptConnection(scriptUrl);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      audioManager.playVictory();
    } else {
      audioManager.playWrong();
    }
  };

  const handleSaveAll = () => {
    audioManager.playCorrect();
    onSaveConfig({
      ...config,
      identity: identityForm,
      scriptUrl: scriptUrl.trim()
    });
    onClose();
  };

  const toggleCheck = (id: string) => {
    audioManager.playClick();
    setCheckedList(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Export local logs to CSV
  const handleExportCsv = () => {
    audioManager.playClick();
    const rows = getLocalBackupLogs();
    if (rows.length === 0) {
      alert('Belum ada log data lokal yang tersimpan.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,ID,Aksi,Waktu,Status,Nama Siswa,Kelas,Topik,Skor,Detail\\n";
    rows.forEach(r => {
      const p = r.payload || {};
      const line = [
        `"${r.id}"`,
        `"${r.action}"`,
        `"${r.timestamp}"`,
        `"${r.status}"`,
        `"${p.studentName || '-'}"`,
        `"${p.studentClass || '-'}"`,
        `"${p.topic || '-'}"`,
        `"${p.score !== undefined ? p.score : '-'}"`,
        `"${(r.errorMessage || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += line + "\\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Backup_Data_MPI_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Settings className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl">
                Panel Guru & Integrasi Google Spreadsheet
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Konfigurasi identitas materi, kode Apps Script, deployment backend, dan diagnosa koneksi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 py-2">
          {[
            { id: 'identity', label: '1. Identitas & Materi', icon: '📝' },
            { id: 'script', label: '2. Kode Apps Script', icon: '💻' },
            { id: 'guide', label: '3. Panduan Pemasangan', icon: '📚' },
            { id: 'checklist', label: '4. Checklist Pengujian (QA)', icon: '✅' },
            { id: 'logs', label: '5. Cadangan Data Lokal', icon: '💾' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                audioManager.playClick();
                setActiveTab(tab.id as TabType);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* TAB 1: IDENTITAS & MATERI */}
          {activeTab === 'identity' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-medium leading-relaxed">
                ℹ️ Anda dapat mengubah seluruh identitas di bawah ini sesuai kurikulum, tema, kelas, atau sekolah tempat Anda mengajar. Seluruh perubahan akan otomatis tercermin di halaman pembuka, tujuan, kuis, dan piagam prestasi siswa.
              </div>

              {/* Endpoint URL Input with Real Connection Tester */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-heading font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>URL Web App Google Apps Script</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Diperoleh setelah deploy Web App di Google Apps Script
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    value={scriptUrl}
                    onChange={(e) => setScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    disabled={isTesting}
                    onClick={handleTestConnection}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menguji...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Uji Endpoint</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Connection Test Result */}
                {testResult && (
                  <div className={`p-3.5 rounded-xl text-xs font-semibold animate-fadeIn ${
                    testResult.success
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-red-100 text-red-900 border border-red-300'
                  }`}>
                    <p className="font-bold">{testResult.message}</p>
                    {testResult.details && (
                      <pre className="mt-1.5 p-2 bg-white/80 rounded-lg text-[10px] font-mono overflow-x-auto text-slate-800">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Media Pembelajaran Interaktif (MPI)
                  </label>
                  <input
                    type="text"
                    value={identityForm.mediaTitle}
                    onChange={(e) => setIdentityForm({ ...identityForm, mediaTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={identityForm.subject}
                    onChange={(e) => setIdentityForm({ ...identityForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas & Jenjang
                  </label>
                  <input
                    type="text"
                    value={identityForm.grade}
                    onChange={(e) => setIdentityForm({ ...identityForm, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fase Kurikulum
                  </label>
                  <input
                    type="text"
                    value={identityForm.phase}
                    onChange={(e) => setIdentityForm({ ...identityForm, phase: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Topik Materi Pokok
                  </label>
                  <input
                    type="text"
                    value={identityForm.topic}
                    onChange={(e) => setIdentityForm({ ...identityForm, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Satuan Pendidikan / Sekolah
                  </label>
                  <input
                    type="text"
                    value={identityForm.school}
                    onChange={(e) => setIdentityForm({ ...identityForm, school: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Guru Pengampu
                  </label>
                  <input
                    type="text"
                    value={identityForm.teacherName}
                    onChange={(e) => setIdentityForm({ ...identityForm, teacherName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nilai Kriteria Ketuntasan (KKTP / KKM)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={identityForm.passingScore}
                    onChange={(e) => setIdentityForm({ ...identityForm, passingScore: Number(e.target.value) || 75 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KODE GOOGLE APPS SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-950">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm block">
                    Kode Backend Google Apps Script (Code.gs)
                  </span>
                  <p className="text-xs text-indigo-800">
                    Salin seluruh kode di bawah ini lalu tempelkan ke editor Google Apps Script di Spreadsheet Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Semua Kode (.gs)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Viewer Container */}
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre">{GOOGLE_APPS_SCRIPT_TEMPLATE}</pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Fitur Keamanan & Reliabilitas Kode Ini:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Otomatis membuat 3 sheet: <code className="text-blue-700">DATA_SISWA</code>, <code className="text-blue-700">HASIL_LATIHAN</code>, dan <code className="text-blue-700">REFLEKSI</code> jika belum ada.</li>
                  <li>Menggunakan <code className="text-blue-700">LockService</code> untuk mencegah tabrakan data saat puluhan siswa mengirim nilai secara bersamaan.</li>
                  <li>Menghitung ulang rumus nilai di server: <code className="text-blue-700">Skor = (Benar / Total) * 100</code> untuk integritas nilai siswa.</li>
                  <li>Mendeteksi Session ID agar data siswa terhubung dan mencegah duplikasi baris.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN PEMASANGAN LENGKAP */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-base text-slate-800">
                  Langkah-Langkah Pembuatan Spreadsheet & Deploy Web App
                </h3>

                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h4 className="font-bold text-slate-800 text-sm">Buat Google Spreadsheet Baru</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> di browser Anda. Berikan judul pada file spreadsheet Anda, misalnya: <strong>"Rekap Pembelajaran MPI - Pecahan &amp; Desimal Kelas 6"</strong>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h4 className="font-bold text-slate-800 text-sm">Buka Apps Script</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                    Pada menu atas Spreadsheet, klik <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>. Tab baru editor skrip Google akan terbuka.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h4 className="font-bold text-slate-800 text-sm">Tempel Kode & Simpan</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                    Hapus kode bawaan di file <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">Code.gs</code>, kemudian salin seluruh kode dari Tab <strong>"2. Kode Apps Script"</strong> di atas dan tempelkan. Tekan ikon <strong>Simpan (Ctrl+S / Ikon Disket)</strong>.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                    <h4 className="font-bold text-slate-800 text-sm">Deploy sebagai Aplikasi Web (PENTING!)</h4>
                  </div>
                  <div className="text-xs text-slate-600 pl-8 space-y-1.5 leading-relaxed">
                    <p>Klik tombol biru <strong>Terapkan (Deploy)</strong> di pojok kanan atas &gt; pilih <strong>Penerapan baru (New deployment)</strong>.</p>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-950 font-medium">
                      <p className="font-bold">⚠️ Pastikan Konfigurasi Ini Sama Persis:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        <li>Pilih Jenis: <strong>Aplikasi web (Web app)</strong></li>
                        <li>Jalankan sebagai (Execute as): <strong>Saya (email Anda)</strong></li>
                        <li>Yang memiliki akses (Who has access): <strong className="text-red-700 font-extrabold underline">Siapa saja (Anyone)</strong>.</li>
                      </ul>
                      <p className="text-[10px] text-amber-800 italic mt-1">
                        *Catatan: Pilihan "Siapa saja" diperlukan agar siswa dapat mengirim hasil latihan tanpa harus dipaksa login akun Google terlebih dahulu.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">5</span>
                    <h4 className="font-bold text-slate-800 text-sm">Berikan Izin & Salin URL</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                    Saat pertama kali deploy, Google akan meminta persetujuan izin (Klik <em>Tinjau Izin / Review Permissions</em> &gt; pilih akun Google Anda &gt; klik <em>Lanjutan / Advanced</em> &gt; klik <em>Buka Skrip (tidak aman) / Go to script</em> &gt; klik <em>Izinkan / Allow</em>). Setelah selesai, salin <strong>URL Aplikasi Web (Web App URL)</strong> yang berakhiran <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">/exec</code> dan tempelkan ke kolom URL di Tab 1.
                  </p>
                </div>
              </div>

              {/* Troubleshooting Table */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Daftar Kendala Umum & Solusinya</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-red-600 block">1. Muncul pesan CORS Error atau Network Failure</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Penyebab: Saat deploy Web App, opsi "Who has access" masih disetel ke "Hanya saya". Solusi: Buka Apps Script &gt; Kelola Penerapan (Manage deployments) &gt; Edit &gt; ubah menjadi "Siapa saja" (Anyone) &gt; Terapkan versi baru.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-red-600 block">2. Siswa membuka di HP/Tablet dengan browser berbeda</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Aplikasi MPI ini dibuat 100% responsif mobile-first. Siswa cukup membuka link MPI melalui Chrome, Safari, atau Edge tanpa instalasi apapun. Jika sinyal putus, data siswa otomatis masuk ke antrean cadangan lokal!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST PENGUJIAN (QA) */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-medium leading-relaxed">
                Panduan pengujian mandiri oleh guru untuk memastikan setiap tombol, alur, penilaian rumus, dan integrasi spreadsheet berfungsi 100% sempurna sebelum digunakan di kelas.
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'q1', title: 'Validasi Nama Siswa', desc: 'Tombol Mulai Belajar tidak dapat diklik jika nama siswa belum diisi.' },
                  { id: 'q2', title: 'Pencatatan Kehadiran', desc: 'Sheet DATA_SISWA otomatis terisi saat siswa menekan Mulai Belajar.' },
                  { id: 'q3', title: 'Navigasi Multi-Halaman Materi', desc: 'Tombol Sebelumnya / Berikutnya dan indikator titik halaman materi berpindah dengan mulus.' },
                  { id: 'q4', title: 'Interaktivitas Mini-Game', desc: 'Mini-game mencocokkan, mengurutkan alur, dan cek kebiasaan memberikan umpan balik suara & visual.' },
                  { id: 'q5', title: 'Pencegahan Kirim Ganda (Anti-Double Submit)', desc: 'Tombol Kirim Hasil otomatis terkunci (disabled) setelah satu kali pengiriman.' },
                  { id: 'q6', title: 'Kebenaran Rumus Penilaian', desc: 'Skor terhitung akurat: (Benar / Total) * 100 dan status Tuntas sesuai KKTP.' },
                  { id: 'q7', title: 'Keterhubungan Session ID', desc: 'ID sesi pada DATA_SISWA, HASIL_LATIHAN, dan REFLEKSI cocok satu sama lain.' },
                  { id: 'q8', title: 'Penyimpanan Refleksi Nyata', desc: 'Status pengiriman menampilkan respon aktual dari server Apps Script.' },
                  { id: 'q9', title: 'Piagam Prestasi Siap Cetak', desc: 'Halaman Selesai menyajikan piagam penghargaan dengan nilai dan nama siswa lengkap.' },
                  { id: 'q10', title: 'Cadangan Data Offline', desc: 'Jika koneksi internet putus, seluruh data otomatis tersimpan di cadangan lokal browser.' },
                ].map(item => {
                  const isChecked = !!checkedList[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                        isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-800 block">
                          {item.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CADANGAN DATA LOKAL & LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Active Student Progress Card */}
              {storedReport && (
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-700" />
                      <span className="font-heading font-extrabold text-sm text-indigo-950">
                        Laporan Progres Pengerjaan Siswa Terkini
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      Update: {storedReport.lastUpdated}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Nama Siswa</span>
                      <span className="font-heading font-black text-xs text-slate-800 line-clamp-1 mt-0.5" title={storedReport.studentName}>
                        {storedReport.studentName}
                      </span>
                      <span className="text-[9px] text-blue-600 font-semibold block">{storedReport.studentClass}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-blue-600 block uppercase">Soal Dikerjakan</span>
                      <span className="font-heading font-black text-xl text-blue-900 mt-0.5 block">
                        {storedReport.totalQuestionsAttempted}
                      </span>
                      <span className="text-[9px] text-slate-400 block">Total Soal</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-emerald-600 block uppercase">Jawaban Benar</span>
                      <span className="font-heading font-black text-xl text-emerald-700 mt-0.5 block">
                        {storedReport.totalCorrect}
                      </span>
                      <span className="text-[9px] text-emerald-600 block">Poin Benar</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-red-600 block uppercase">Jawaban Salah</span>
                      <span className="font-heading font-black text-xl text-red-700 mt-0.5 block">
                        {storedReport.totalWrong}
                      </span>
                      <span className="text-[9px] text-red-600 block">Perlu Belajar</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-amber-600 block uppercase">Nilai Skor</span>
                      <span className="font-heading font-black text-xl text-amber-800 mt-0.5 block">
                        {storedReport.latestScore}
                      </span>
                      <span className="text-[9px] text-amber-700 font-bold block">
                        {storedReport.latestScore >= identityForm.passingScore ? '✓ TUNTAS' : '• REMEDIAL'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-indigo-600 block uppercase">Rata-rata</span>
                      <span className="font-heading font-black text-xl text-indigo-900 mt-0.5 block">
                        {storedReport.averageScore}
                      </span>
                      <span className="text-[9px] text-indigo-600 font-semibold block">Akurasi {storedReport.averageAccuracy}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="font-bold text-sm text-slate-800 block">
                    Riwayat Penyimpanan Lokal ({logs.length} Data)
                  </span>
                  <p className="text-xs text-slate-500">
                    Seluruh aktivitas siswa dicadangkan secara otomatis di memori lokal peramban sebagai perlindungan jika internet sekolah terputus.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor ke CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bersihkan seluruh log cadangan lokal?')) {
                        clearLocalBackupLogs();
                        setLogs([]);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Bersihkan
                  </button>
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-xs">
                  Belum ada catatan aktivitas siswa yang tersimpan. Mulai coba aplikasi dari halaman beranda!
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Aksi</th>
                        <th className="p-3">Siswa</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 font-bold">{log.payload?.studentName || '-'}</td>
                          <td className="p-3">{log.payload?.studentClass || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-500">
                            {log.payload?.score !== undefined ? `Skor: ${log.payload.score}` : log.payload?.topic || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
