const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('student_profiles').select('count').limit(1);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message,
        hint: error.hint,
        details: error.details
      });
    }

    res.status(200).json({
      success: true,
      message: 'Database connected successfully',
      count: data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error during DB test',
      error: err.message
    });
  }
});

module.exports = router;
