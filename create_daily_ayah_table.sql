-- Create daily_ayah table in Supabase to cache the daily Quran Ayah
CREATE TABLE IF NOT EXISTS daily_ayah (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    ayah_number INT NOT NULL,
    text TEXT NOT NULL,
    translation TEXT NOT NULL,
    surah_name TEXT NOT NULL,
    ayah_in_surah INT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Seed initial Quran Ayah (Surah Al-Baqara 2:262)
INSERT INTO daily_ayah (id, ayah_number, text, translation, surah_name, ayah_in_surah, updated_at)
VALUES (
    1, 
    262, 
    'الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ ثُمَّ لَا يُتْبِعُونَ مَا أَنفَقُوا مَنًّا وَلَا أَذًى ۙ لَّهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ', 
    'Those who spend their wealth in the Cause of Allah, and do not follow up their gifts with reminders of their generosity or with injury, their reward is with their Lord. On them shall be no fear, nor shall they grieve.', 
    'Al-Baqara', 
    262, 
    NOW()
)
ON CONFLICT (id) DO NOTHING;
