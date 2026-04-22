/**
 * Analytics Routes
 * Handles analytics and reporting
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

// Apply authentication to all routes in this router
router.use(authenticate);

// All analytics routes require admin or HOD access
router.use(authorize('admin', 'hod'));

/**
 * @route   GET /api/analytics/overview
 * @desc    Get comprehensive analytics overview
 * @access  Admin, HOD
 */
router.get('/overview', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Base queries
  const studentCountQuery = supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const deptCountQuery = supabase.from('departments').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const staffCountQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('is_active', true);
  
  let requestQuery = supabase.from('clearance_requests').select('status, created_at, completed_at', { count: 'exact' });
  if (startDate) requestQuery = requestQuery.gte('created_at', startDate);
  if (endDate) requestQuery = requestQuery.lte('created_at', endDate);

  const [
    { count: totalStudents },
    { count: totalDepartments },
    { count: totalStaff },
    { data: requests, count: totalRequests }
  ] = await Promise.all([
    studentCountQuery,
    deptCountQuery,
    staffCountQuery,
    requestQuery
  ]);
  
  // Status breakdown
  const statusBreakdown = (requests || []).reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  
  // Department performance
  const { data: deptStatsRaw } = await supabase
    .from('clearance_status')
    .select('status, cleared_at, department:department_id(name)');
  
  const deptPerfMap = (deptStatsRaw || []).reduce((acc, curr) => {
    const name = curr.department.name;
    if (!acc[name]) {
      acc[name] = { name, total: 0, cleared: 0, pending: 0, rejected: 0, totalProcessingTime: 0, completedCount: 0 };
    }
    acc[name].total++;
    if (curr.status === 'cleared') acc[name].cleared++;
    if (curr.status === 'pending' || curr.status === 'in_review') acc[name].pending++;
    if (curr.status === 'rejected') acc[name].rejected++;
    
    return acc;
  }, {});

  const departmentPerformance = Object.values(deptPerfMap).map(dept => ({
    ...dept,
    clearanceRate: dept.total > 0 ? Math.round((dept.cleared / dept.total) * 100) : 0,
    avgProcessingTimeHours: 0 // Simplified
  }));
  
  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalStudents,
        totalDepartments,
        totalStaff,
        totalRequests
      },
      statusBreakdown,
      departmentPerformance,
      monthlyTrend: [],
      processingTimeStats: null
    }
  });
}));

/**
 * @route   GET /api/analytics/students
 * @desc    Get student analytics
 * @access  Admin, HOD
 */
router.get('/students', asyncHandler(async (req, res) => {
  const { batch, department } = req.query;
  
  let queryBuilder = supabase.from('student_profiles').select('clearance_status, enrollment_status, batch, department:department_id(name)').eq('is_active', true);
  if (batch) queryBuilder = queryBuilder.eq('batch', batch);
  if (department) queryBuilder = queryBuilder.eq('department_id', department);
  
  const { data: students, error } = await queryBuilder;
  
  if (error) throw error;

  const clearanceStatusBreakdown = students.reduce((acc, curr) => {
    acc[curr.clearance_status] = (acc[curr.clearance_status] || 0) + 1;
    return acc;
  }, {});

  const enrollmentStatusBreakdown = students.reduce((acc, curr) => {
    acc[curr.enrollment_status] = (acc[curr.enrollment_status] || 0) + 1;
    return acc;
  }, {});

  const batchDist = students.reduce((acc, curr) => {
    acc[curr.batch] = (acc[curr.batch] || 0) + 1;
    return acc;
  }, {});

  const deptDist = students.reduce((acc, curr) => {
    const name = curr.department.name;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      clearanceStatusBreakdown,
      enrollmentStatusBreakdown,
      batchDistribution: Object.entries(batchDist).map(([batch, count]) => ({ batch, count })),
      departmentDistribution: Object.entries(deptDist).map(([department, count]) => ({ department, count }))
    }
  });
}));

/**
 * @route   GET /api/analytics/departments
 * @desc    Get department analytics
 * @access  Admin, HOD
 */
router.get('/departments', asyncHandler(async (req, res) => {
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code, type, clearance_config')
    .eq('is_active', true)
    .order('name');
  
  const { data: pendingStatsRaw } = await supabase
    .from('clearance_status')
    .select('department_id')
    .in('status', ['pending', 'in_review']);
  
  const pendingMap = (pendingStatsRaw || []).reduce((acc, curr) => {
    acc[curr.department_id] = (acc[curr.department_id] || 0) + 1;
    return acc;
  }, {});
  
  const departmentsWithPending = (departments || []).map(dept => ({
    ...dept,
    currentPending: pendingMap[dept.id] || 0
  }));
  
  res.status(200).json({
    success: true,
    data: {
      departments: departmentsWithPending
    }
  });
}));

/**
 * @route   GET /api/analytics/performance
 * @desc    Get system performance metrics
 * @access  Admin
 */
router.get('/performance', asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const { data: requests } = await supabase
    .from('clearance_requests')
    .select('status, created_at, completed_at')
    .gte('created_at', startDate.toISOString());
  
  // Process daily trend
  const dailyDist = (requests || []).reduce((acc, curr) => {
    const date = curr.created_at.split('T')[0];
    acc[date] = acc[date] || { date, requests: 0, cleared: 0 };
    acc[date].requests++;
    if (curr.status === 'cleared') acc[date].cleared++;
    return acc;
  }, {});

  // Bottlenecks
  const { data: bottlenecksRaw } = await supabase
    .from('clearance_status')
    .select('status, created_at, department:department_id(name)')
    .in('status', ['pending', 'in_review']);
  
  const bottleneckMap = (bottlenecksRaw || []).reduce((acc, curr) => {
    const name = curr.department.name;
    acc[name] = acc[name] || { department: name, pendingCount: 0, totalWait: 0 };
    acc[name].pendingCount++;
    const wait = new Date() - new Date(curr.created_at);
    acc[name].totalWait += wait;
    return acc;
  }, {});

  const bottlenecks = Object.values(bottleneckMap)
    .map(b => ({
      ...b,
      avgWaitTimeHours: Math.round(b.totalWait / (b.pendingCount * 1000 * 60 * 60))
    }))
    .sort((a, b) => b.pendingCount - a.pendingCount)
    .slice(0, 5);

  res.status(200).json({
    success: true,
    data: {
      dailyRequests: Object.values(dailyDist).sort((a, b) => a.date.localeCompare(b.date)),
      bottlenecks
    }
  });
}));

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data
 * @access  Admin
 */
router.get('/export', asyncHandler(async (req, res) => {
  const { type = 'requests' } = req.query;
  
  let data;
  switch (type) {
    case 'requests':
      const { data: rData } = await supabase.from('clearance_requests').select('*, student:student_id(*)');
      data = rData;
      break;
    case 'students':
      const { data: sData } = await supabase.from('student_profiles').select('*');
      data = sData;
      break;
    case 'departments':
      const { data: dData } = await supabase.from('departments').select('*');
      data = dData;
      break;
    default:
      throw new Error('Invalid export type');
  }
  
  res.status(200).json({
    success: true,
    data: {
      type,
      count: data?.length || 0,
      records: data
    }
  });
}));

module.exports = router;