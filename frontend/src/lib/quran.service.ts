import api from './api';

export interface QuranAyah {
  ayah_number: number;
  text: string;
  translation: string;
  surah_name: string;
  ayah_in_surah: number;
  updated_at: string;
}

export const quranService = {
  getDailyAyah: async (): Promise<{ success: boolean; data: QuranAyah; message?: string }> => {
    const response = await api.get('/quran/daily');
    return response.data;
  }
};
