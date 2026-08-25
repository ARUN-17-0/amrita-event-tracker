import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useStudents } from '@/hooks/useStudents';
import { useDepartments } from '@/hooks/useDepartments';
import { useSemesters } from '@/hooks/useSemesters';
import { useSections } from '@/hooks/useSections';
import { ValidatedImportRow, BulkImportRow, BulkImportResult } from '@/types';
import { Upload, ArrowLeft, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function BulkImportPage() {
  const navigate = useNavigate();
  const { bulkImportStudents } = useStudents();
  const { departments } = useDepartments();
  const { semesters } = useSemesters();
  const { sections } = useSections();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ValidatedImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [classPassword, setClassPassword] = useState('Amrita@123');
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Full Name,College Email,Roll Number,Department Code,Semester,Section\nJohn Doe,john.doe@blr.students.amrita.edu,BLR.EN.U4CSE20001,CSE,2024,A";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateRow = (row: string[], index: number): ValidatedImportRow => {
    const [fullName = '', email = '', rollNo = '', departmentCode = '', semesterName = '', sectionName = ''] = row;
    const errors: string[] = [];

    if (!fullName.trim()) errors.push('Name is required');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email is required');
    if (!rollNo.trim()) errors.push('Roll No is required');

    const cleanDept = departmentCode.trim().toLowerCase();
    const dept = departments.find(d => 
      d.code.toLowerCase() === cleanDept || 
      d.name.toLowerCase() === cleanDept ||
      d.id === departmentCode.trim()
    );
    if (!dept) errors.push(`Invalid Dept: ${departmentCode || 'Empty'}`);

    const cleanSem = semesterName.trim().toLowerCase();
    const sem = semesters.find(s => 
      s.name.toLowerCase() === cleanSem || 
      s.year.toLowerCase() === cleanSem ||
      s.name.toLowerCase().includes(cleanSem) ||
      cleanSem.includes(s.year.toLowerCase()) ||
      s.id === semesterName.trim()
    );
    if (!sem) errors.push(`Invalid Batch/Sem: ${semesterName || 'Empty'}`);

    const cleanSec = sectionName.trim().toLowerCase();
    const sec = sections.find(s => {
      const sName = s.name.toLowerCase();
      const matchesName = sName === cleanSec || 
        (dept && sName === `${dept.code.toLowerCase()}-${cleanSec}`) ||
        (dept && cleanSec === `${dept.code.toLowerCase()}-${sName}`) ||
        s.id === sectionName.trim();
      const matchesDept = !dept || s.departmentId === dept.id;
      return matchesName && matchesDept;
    }) || sections.find(s => s.name.toLowerCase() === cleanSec);

    if (!sec) errors.push(`Invalid Section: ${sectionName || 'Empty'}`);

    return {
      rowIndex: index + 1,
      fullName: fullName.trim(),
      email: email.trim(),
      rollNo: rollNo.trim(),
      departmentCode: departmentCode.trim(),
      semesterName: semesterName.trim(),
      sectionName: sectionName.trim(),
      departmentId: dept?.id,
      semesterId: sem?.id,
      sectionId: sec?.id,
      isValid: errors.length === 0,
      isDuplicate: false,
      errors
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          const dataRows = lines.slice(1).map(l => {
            return l.split(',').map(v => v.replace(/^"|"$/g, '').trim());
          });
          const validated = dataRows.map((r, i) => validateRow(r, i));
          setParsedRows(validated);
          setStep(2);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          const dataRows = lines.slice(1).map(l => l.split(',').map(v => v.replace(/^"|"$/g, '').trim()));
          const validated = dataRows.map((r, i) => validateRow(r, i));
          setParsedRows(validated);
          setStep(2);
        }
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportError(null);

    const validRows: BulkImportRow[] = parsedRows.filter(r => r.isValid).map(r => ({
      fullName: r.fullName,
      email: r.email,
      rollNo: r.rollNo,
      departmentCode: r.departmentCode,
      semesterName: r.semesterName,
      sectionName: r.sectionName,
      departmentId: r.departmentId,
      semesterId: r.semesterId,
      sectionId: r.sectionId,
      password: classPassword || 'Amrita@123'
    }));

    try {
      const res = await bulkImportStudents(validRows);
      setResult(res);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || 'Import failed. Please try again.');
      setResult({
        imported: 0,
        skipped: 0,
        failed: validRows.length,
        errors: [{ row: 0, field: 'general', message: err.message || 'Import failed' }]
      });
      setStep(3);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/students')} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import Students</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 flex items-center ${s < 3 ? 'after:content-[""] after:flex-1 after:h-[2px] after:bg-gray-200 after:mx-4' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step === s ? 'bg-primary text-white' : 
                step > s ? 'bg-primary-light text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {s}
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                {s === 1 ? 'Upload CSV' : s === 2 ? 'Preview & Validate' : 'Result'}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Upload Data File</h2>
              <button onClick={handleDownloadTemplate} className="flex items-center text-sm font-medium text-primary hover:text-primary-light">
                <Download className="w-4 h-4 mr-1" /> Template CSV
              </button>
            </div>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary transition-colors bg-gray-50"
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-light focus-within:outline-none px-2 py-1">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileUpload} />
                  </label>
                  <p className="pl-1 py-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV file only, max 5MB</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Preview Data</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Found {parsedRows.length} rows. {parsedRows.filter(r => r.isValid).length} valid, {parsedRows.filter(r => !r.isValid).length} invalid.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Class Password:</label>
                  <input
                    type="text"
                    value={classPassword}
                    onChange={e => setClassPassword(e.target.value)}
                    placeholder="e.g. Amrita@123"
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono w-36 focus:ring-primary focus:border-primary"
                  />
                </div>
                <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button 
                  onClick={handleImport} 
                  disabled={importing || parsedRows.filter(r => r.isValid).length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50 flex items-center gap-2"
                >
                  {importing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {importing ? 'Importing...' : 'Start Import'}
                </button>
              </div>
            </div>

            {importError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
            
            <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Row</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Full Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Roll No</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Dept Code</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Sem / Batch & Section</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Errors</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedRows.map((row) => (
                    <tr key={row.rowIndex} className={row.isValid ? '' : 'bg-red-50/50'}>
                      <td className="px-4 py-3">
                        {row.isValid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.rowIndex}</td>
                      <td className="px-4 py-3">{row.fullName}</td>
                      <td className="px-4 py-3">{row.email}</td>
                      <td className="px-4 py-3">{row.rollNo}</td>
                      <td className="px-4 py-3">{row.departmentCode}</td>
                      <td className="px-4 py-3">{row.semesterName} - {row.sectionName}</td>
                      <td className="px-4 py-3 text-red-600 text-xs">
                        {row.errors.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="max-w-xl mx-auto text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete</h2>
            <p className="text-gray-500 mb-6">Successfully processed {result.imported + result.skipped + result.failed} records.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-100 flex gap-4 divide-x divide-gray-200">
              <div className="flex-1 px-4 text-center">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-gray-500">Imported / Assigned</div>
              </div>
              <div className="flex-1 px-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                <div className="text-sm text-gray-500">Skipped</div>
              </div>
              <div className="flex-1 px-4 text-center">
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>

            <button onClick={() => navigate('/students')} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light">
              Return to Students
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
