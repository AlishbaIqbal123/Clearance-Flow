/**
 * Quran Ayah Routes
 * Fetches and caches authentic daily Quran verses in Supabase to maintain database activity
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/error.middleware');

/**
 * Fetch a random authentic Ayah from Alquran API
 * Returns simple Uthmani text and Sahih International English translation
 */
async function fetchRandomAyah() {
  // Total Ayahs in Quran = 6236
  const randomAyahNo = Math.floor(Math.random() * 6236) + 1;
  const url = `https://api.alquran.cloud/v1/ayah/${randomAyahNo}/editions/quran-simple,en.sahih`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Alquran API returned status ${response.status}`);
  }
  
  const result = await response.json();
  if (result.code !== 200 || !result.data || result.data.length < 2) {
    throw new Error('Invalid response structure from Alquran API');
  }
  
  const arabicEdition = result.data[0];
  const englishEdition = result.data[1];
  
  return {
    ayah_number: randomAyahNo,
    text: arabicEdition.text,
    translation: englishEdition.text,
    surah_name: englishEdition.surah?.englishName || 'Unknown',
    ayah_in_surah: englishEdition.numberInSurah || 1,
    updated_at: new Date().toISOString()
  };
}

/**
 * @route   GET /api/quran/daily
 * @desc    Get current daily Ayah (cached, refreshes every 24 hours)
 * @access  Public
 */
router.get('/daily', asyncHandler(async (req, res) => {
  // Query daily_ayah table for row id=1
  const { data: cached, error: selectError } = await supabase
    .from('daily_ayah')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (selectError) {
    console.error('Supabase query error for daily_ayah:', selectError);
  }

  const now = new Date();
  let useCached = false;

  if (cached) {
    const lastUpdate = new Date(cached.updated_at);
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    // Use cached if updated within last 24 hours
    if (diffHours < 24) {
      useCached = true;
    }
  }

  if (useCached && cached) {
    return res.status(200).json({
      success: true,
      data: cached
    });
  }

  // Stale or missing cache - fetch new Ayah
  try {
    const newAyah = await fetchRandomAyah();
    
    // Upsert into Supabase (performs a write operation to keep database alive)
    const { data: upserted, error: upsertError } = await supabase
      .from('daily_ayah')
      .upsert({ id: 1, ...newAyah })
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert new daily Ayah in Supabase:', upsertError);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: cached,
          message: 'Saved failed, returned stale cache fallback'
        });
      }
      throw upsertError;
    }

    return res.status(200).json({
      success: true,
      data: upserted
    });
  } catch (error) {
    console.error('Failed to refresh daily Ayah from API:', error);
    // API failure fallback
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        message: 'API failed, returned stale cache fallback'
      });
    }
    throw new AppError('Failed to retrieve Quran Ayah.', 500);
  }
}));

/**
 * @route   POST /api/quran/refresh
 * @desc    Force refresh the daily Ayah to keep Supabase active
 * @access  Protected (Key required)
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const keepAliveKey = process.env.KEEP_ALIVE_KEY || 'default-keep-alive-key';
  const providedKey = req.headers['x-keep-alive-key'] || req.query.key;

  if (providedKey !== keepAliveKey) {
    throw new AppError('Unauthorized keep-alive execution.', 401);
  }

  const newAyah = await fetchRandomAyah();
  
  const { data: upserted, error: upsertError } = await supabase
    .from('daily_ayah')
    .upsert({ id: 1, ...newAyah })
    .select()
    .single();

  if (upsertError) {
    throw upsertError;
  }

  return res.status(200).json({
    success: true,
    message: 'Quran Ayah refreshed successfully. Database state warmed.',
    data: upserted
  });
}));

module.exports = router;
