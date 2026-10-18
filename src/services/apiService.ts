export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  isOfflineSaved?: boolean;
}

export interface StoredLog {
  id: string;
  action: 'SAVE_STUDENT' | 'SAVE_QUIZ' | 'SAVE_REFLECTION';
  timestamp: string;
  payload: any;
  status: 'sent' | 'pending' | 'failed';
  errorMessage?: string;
}

const LOCAL_STORAGE_LOG_KEY = 'mpi_data_sync_logs';

/**
 * Menyimpan data ke riwayat lokal sebagai cadangan permanen jika koneksi gagal atau offline
 */
export function saveLocalBackupLog(action: StoredLog['action'], payload: any, status: StoredLog['status'], errorMessage?: string) {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_LOG_KEY);
    const logs: StoredLog[] = existingStr ? JSON.parse(existingStr) : [];
    
    // Check if session ID with same action already exists
    const sessionId = payload.sessionId;
    const existingIndex = logs.findIndex(l => l.action === action && l.payload?.sessionId === sessionId);

    const logEntry: StoredLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      timestamp: new Date().toLocaleString('id-ID'),
      payload,
      status,
      errorMessage
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = logEntry;
    } else {
      logs.unshift(logEntry);
    }

    localStorage.setItem(LOCAL_STORAGE_LOG_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Gagal menyimpan backup lokal:', e);
  }
}

export function getLocalBackupLogs(): StoredLog[] {
  try {
    const str = localStorage.getItem(LOCAL_STORAGE_LOG_KEY);
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
}

export function clearLocalBackupLogs(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_LOG_KEY);
  } catch {}
}

/**
 * Menguji konektivitas endpoint Google Apps Script Web App
 */
export async function testScriptConnection(scriptUrl: string): Promise<{ success: boolean; message: string; details?: any }> {
  if (!scriptUrl || !scriptUrl.trim()) {
    return {
      success: false,
      message: 'URL Google Apps Script belum diisi. Masukkan URL Web App deployment terlebih dahulu.'
    };
  }

  const cleanUrl = scriptUrl.trim();
  if (!cleanUrl.includes('script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL tidak valid. URL harus berawalan "https://script.google.com/macros/s/.../exec"'
    };
  }

  try {
    // Lakukan pengujian GET
    const response = await fetch(cleanUrl, {
      method: 'GET',
      mode: 'cors'
    });

    if (response.ok) {
      try {
        const json = await response.json();
        return {
          success: true,
          message: 'Koneksi Berhasil! Google Apps Script aktif dan merespons.',
          details: json
        };
      } catch {
        return {
          success: true,
          message: 'Koneksi Terhubung! Endpoint merespons dengan status 200 OK.',
        };
      }
    } else {
      return {
        success: false,
        message: `Server merespons dengan status ${response.status} (${response.statusText}). Pastikan deployment disetel ke "Anyone" (Siapa saja).`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi endpoint: ${err.message || 'CORS / Network Error'}. Pastikan saat Deploy Web App, Anda memilih "Who has access: Anyone" (Siapa saja).`
    };
  }
}

/**
 * Mengirim payload data ke Google Apps Script Web App
 * Menggunakan teknik text/plain untuk menghindari preflight CORS
 */
export async function sendToGoogleAppsScript(
  scriptUrl: string | undefined,
  action: 'SAVE_STUDENT' | 'SAVE_QUIZ' | 'SAVE_REFLECTION',
  data: any
): Promise<ApiResponse> {
  const payload = {
    action,
    data,
    clientTimestamp: new Date().toISOString()
  };

  if (!scriptUrl || !scriptUrl.trim()) {
    // Mode offline / belum disetel URL
    saveLocalBackupLog(action, data, 'pending', 'URL Google Apps Script belum dikonfigurasi guru');
    return {
      success: true,
      isOfflineSaved: true,
      message: 'Tersimpan di Cadangan Lokal (URL Google Apps Script belum dikonfigurasi oleh Guru di menu Pengaturan).'
    };
  }

  const cleanUrl = scriptUrl.trim();

  try {
    // Kirim menggunakan POST dengan Content-Type: text/plain
    // Ini adalah standar utama pengiriman ke Google Apps Script untuk menghindari CORS preflight block
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    let resData: any = null;
    try {
      resData = await response.json();
    } catch {
      // Beberapa browser atau redirect Google Apps Script tidak mengembalikan JSON terbaca di client
      resData = null;
    }

    if (response.ok && (!resData || resData.status !== 'error')) {
      saveLocalBackupLog(action, data, 'sent');
      return {
        success: true,
        message: resData?.message || 'Data berhasil disimpan ke Google Spreadsheet!',
        data: resData
      };
    } else {
      const errMsg = resData?.message || `Gagal mengirim data (Status HTTP: ${response.status})`;
      saveLocalBackupLog(action, data, 'failed', errMsg);
      return {
        success: false,
        message: errMsg
      };
    }
  } catch (networkError: any) {
    // Jika fetch terhambat karena redirect cors atau jaringan putus,
    // coba no-cors mode sebagai fallback kirim ke Google Apps Script
    try {
      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      // No-cors mode sukses terkirim ke server Google Apps Script
      saveLocalBackupLog(action, data, 'sent');
      return {
        success: true,
        message: 'Data berhasil dikirim ke Google Apps Script (Mode Kompatibilitas Aman) & dicadangkan secara lokal.'
      };
    } catch (secondError: any) {
      const err = networkError.message || 'Koneksi gagal atau terputus';
      saveLocalBackupLog(action, data, 'failed', err);
      return {
        success: false,
        message: `Terjadi kendala pengiriman: ${err}. Data telah disimpan di memori cadangan lokal agar tidak hilang.`
      };
    }
  }
}
