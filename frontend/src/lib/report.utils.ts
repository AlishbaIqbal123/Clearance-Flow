import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportAdminReport = (data: any) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-PK', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Header
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text('UNIVERSITY CLEARANCE SYSTEM', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text('INSTITUTIONAL ANALYTICS REPORT', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${date}`, 105, 38, { align: 'center' });
  
  // Stats Summary
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Summary Statistics:', 14, 50);
  
  const counts = data.counts || {};
  const stats = [
    ['Total Students', counts.totalStudents || 0],
    ['Total Departments', counts.totalDepartments || 0],
    ['Total Staff', counts.totalStaff || 0],
    ['Clearance Requests', counts.totalClearanceRequests || 0]
  ];

  autoTable(doc, {
    startY: 55,
    head: [['Metric', 'Value']],
    body: stats,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }
  });

  // Departmental Backlog
  doc.text('Departmental Pending Requests:', 14, (doc as any).lastAutoTable.finalY + 15);
  
  const pendingStats = (data.departmentPendingStats || []).map((d: any) => [
    d.department?.name || d.departmentName || 'N/A',
    d.department?.code || 'N/A',
    d.count || 0
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Department', 'Code', 'Pending Requests']],
    body: pendingStats,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] } // Blue-500
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Authorized Institutional Document - System Generated',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`University_Clearance_Report_${new Date().getTime()}.pdf`);
};

export const exportStudentStatus = (student: any, request: any) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-PK', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });

  // Header
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Blue-500
  doc.text('CLEARANCE STATUS REPORT', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Official Document - Generated ${date}`, 105, 28, { align: 'center' });

  // Student Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Student Identification:', 14, 45);
  
  const studentInfo = [
    ['Name', `${student.first_name} ${student.last_name}`],
    ['Reg Number', student.registration_number],
    ['Department', student.discipline || student.department?.name],
    ['Program', student.program],
    ['Batch', student.batch]
  ];

  autoTable(doc, {
    startY: 50,
    body: studentInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 }
  });

  // Clearance Progress
  doc.text('Departmental Clearances:', 14, (doc as any).lastAutoTable.finalY + 15);
  
  const statuses = (request.clearance_status || []).map((s: any) => [
    s.department?.name || 'N/A',
    s.status.toUpperCase(),
    s.due_amount > 0 ? `Rs. ${s.due_amount.toLocaleString()}` : 'Cleared',
    s.cleared_at ? new Date(s.cleared_at).toLocaleDateString() : '---'
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Department', 'Status', 'Dues/Remarks', 'Cleared Date']],
    body: statuses,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      1: { fontStyle: 'bold' }
    }
  });

  // Overall Status
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Overall Progress: ${request.progress?.percentage || 0}%`, 14, finalY);
  
  if (request.status === 'cleared') {
    doc.setTextColor(16, 185, 129);
    doc.text('FINAL CLEARANCE GRANTED', 14, finalY + 10);
  } else {
    doc.setTextColor(245, 158, 11);
    doc.text('CLEARANCE IN PROGRESS', 14, finalY + 10);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    'This is a system-generated document. For verification, contact the Registrar Office.',
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 15,
    { align: 'center' }
  );

  doc.save(`Clearance_Status_${student.registration_number}.pdf`);
};
