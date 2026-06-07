import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, Loader2, ArrowLeft, CheckCircle2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { uploadService } from '@/services';
import { ROUTES } from '@/constants';

export default function ImportBooksPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!selected.name.match(/\.(csv|xlsx|xls)$/)) {
        toast.error('Please select a valid CSV or Excel file');
        return;
      }
      setFile(selected);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadService.importLibrary(file);
      setResult(res.data.data.summary);
      toast.success('Books imported successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to import books');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "title,author,genre,publisher,language,pages,shelfType,rating,notes,review\n"
      + "The Great Gatsby,F. Scott Fitzgerald,Fiction,Scribner,English,180,READ,5,A classic masterpiece!,Amazing book with beautiful symbolism.\n"
      + "Atomic Habits,James Clear,Self-Help,Avery,English,320,READING,4,Developing good routines.,Very practical advice on habit formation.\n"
      + "Dune,Frank Herbert,Science Fiction,Chilton Books,English,600,WISHLIST,,,Planning to read next month.";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookverse_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Template downloaded!');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LIBRARY)} className="mb-4 -ml-2 text-[#8A7F74] hover:text-[#8B4513]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
        </Button>
        <h1 className="font-display text-3xl font-bold text-[#1C1A17] tracking-tight">Import Books</h1>
        <p className="text-[#8A7F74] mt-1">Upload an Excel (.xlsx) or CSV file to bulk import books into your library.</p>
      </div>

      {!result ? (
        <Card className="border-[#DDD4C4] bg-white shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B4513] to-[#C0622F]" />
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-[#1C1A17] font-semibold">Upload Document</CardTitle>
                <CardDescription className="text-[#8A7F74] mt-1">
                  Ensure your file structure matches the template format.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="self-start sm:self-auto border-[#DDD4C4] text-[#8B4513] hover:bg-[#F5F0E8] gap-1.5">
                <Download className="w-4 h-4" /> Download Sample CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guidelines */}
            <div className="rounded-xl bg-[#F5F0E8] p-5 border border-[#DDD4C4] space-y-3">
              <h3 className="text-sm font-semibold text-[#3D3530]">File Format Guidelines</h3>
              <div className="grid gap-2 sm:grid-cols-2 text-xs text-[#8A7F74]">
                <div>
                  <span className="font-semibold text-[#3D3530]">Required Columns:</span>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <Badge className="bg-[#8B4513]/10 text-[#8B4513] border-none font-medium">title</Badge>
                    <Badge className="bg-[#8B4513]/10 text-[#8B4513] border-none font-medium">author</Badge>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-[#3D3530]">Optional Columns:</span>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <Badge className="bg-[#8A7F74]/10 text-[#8A7F74] border-none font-medium">genre</Badge>
                    <Badge className="bg-[#8A7F74]/10 text-[#8A7F74] border-none font-medium">publisher</Badge>
                    <Badge className="bg-[#8A7F74]/10 text-[#8A7F74] border-none font-medium">pages</Badge>
                    <Badge className="bg-[#8A7F74]/10 text-[#8A7F74] border-none font-medium">shelfType</Badge>
                    <Badge className="bg-[#8A7F74]/10 text-[#8A7F74] border-none font-medium">rating</Badge>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#8A7F74] italic mt-2">
                * Note: shelfType can be: READ, READING, WISHLIST, or DROPPED (defaults to READ). rating can be 1 to 5.
              </p>
            </div>

            {/* Dropzone */}
            <div className="flex justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-56 border-2 border-[#DDD4C4] border-dashed rounded-2xl cursor-pointer bg-[#F5F0E8]/40 hover:bg-[#F5F0E8]/70 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <div className="h-12 w-12 rounded-xl bg-[#8B4513]/10 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-6 h-6 text-[#8B4513]" />
                  </div>
                  <p className="mb-1.5 text-sm text-[#3D3530]">
                    <span className="font-semibold text-[#8B4513]">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-[#8A7F74]">CSV, XLS, or XLSX files up to 10MB</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
              </label>
            </div>
            
            {/* Selected File Action Bar */}
            {file && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-[#F5F0E8] rounded-xl border border-[#DDD4C4]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center border border-[#DDD4C4] shadow-sm">
                    <FileSpreadsheet className="w-5 h-5 text-[#8B4513]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#1C1A17]">{file.name}</p>
                    <p className="text-xs text-[#8A7F74]">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button onClick={handleImport} disabled={isUploading} className="bg-[#8B4513] hover:bg-[#C0622F] text-white">
                  {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</> : 'Import Now'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-[#5C7A3E]/30 bg-[#5C7A3E]/5 overflow-hidden">
            <div className="h-1.5 w-full bg-[#5C7A3E]" />
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#5C7A3E]/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#5C7A3E]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1C1A17]">Import Complete</h3>
                <p className="text-[#8A7F74] mt-1">Your book list has been successfully parsed and updated in your collection.</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
                <div className="p-4 rounded-xl bg-white border border-[#DDD4C4] shadow-sm">
                  <p className="text-xs text-[#8A7F74] font-medium uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-[#1C1A17] mt-1">{result.total}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DDD4C4] shadow-sm">
                  <p className="text-xs text-[#8A7F74] font-medium uppercase tracking-wider">Imported</p>
                  <p className="text-2xl font-bold text-[#5C7A3E] mt-1">{result.imported}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DDD4C4] shadow-sm">
                  <p className="text-xs text-[#8A7F74] font-medium uppercase tracking-wider">Skipped</p>
                  <p className="text-2xl font-bold text-[#8A7F74] mt-1">{result.skipped}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => { setFile(null); setResult(null); }} className="border-[#DDD4C4] text-[#3D3530] hover:bg-[#F5F0E8]">
                  Import Another
                </Button>
                <Button onClick={() => navigate(ROUTES.LIBRARY)} className="bg-[#8B4513] hover:bg-[#C0622F] text-white">
                  View My Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
