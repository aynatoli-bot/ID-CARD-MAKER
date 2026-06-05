import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, Package, Eye, Sparkles, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./components/Sidebar";
import { CardCanvas, getFieldValue } from "./components/CardCanvas";
import { ProjectState, Layer, DEFAULT_CSV_DATA, DEFAULT_TEMPLATE_IMAGE } from "./types";
import { jsPDF } from "jspdf";
import { TRANSLATIONS } from "./locales";

export default function App() {
  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    try {
      const saved = localStorage.getItem("card_maker_lang");
      return (saved === 'en' || saved === 'bn') ? saved : 'bn';
    } catch {
      return 'bn';
    }
  });

  const handleSetLang = (newLang: 'bn' | 'en') => {
    setLang(newLang);
    try {
      localStorage.setItem("card_maker_lang", newLang);
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  };

  const t = TRANSLATIONS[lang];

  const photosInputRef = useRef<HTMLInputElement>(null);
  const singlePhotoInputRef = useRef<HTMLInputElement>(null);
  const activePhotoKeyRef = useRef<string | null>(null);
  const [activePhotoKeyState, setActivePhotoKeyState] = useState<string | null>(null); // Keep for UI if needed

  const [projectStateValue, rawSetProject] = useState<ProjectState>({
    templateImage: DEFAULT_TEMPLATE_IMAGE,
    csvData: DEFAULT_CSV_DATA,
    photos: {},
    photoKeyColumn: 'Roll No',
    institutionName: "BALSHID HAZI AKUB ALI HIGH SCHOOL",
    institutionAddress: "BALSHID, SHAHRASTI, CHANDPUR",
    institutionLogo: null,
    institutionColor: "#ffffff",
    useCustomHeader: true,
    layers: [
      { id: 'l1', type: 'photo', x: 50, y: 35, width: 124, height: 155, borderRadius: 8 },
      { id: 'l2', type: 'text', field: 'Name', x: 50, y: 57, fontSize: 33, color: '#009639', fontWeight: 'bold', alignment: 'center' },
      { id: 'l3', type: 'text', field: 'Class', x: 50, y: 62.2, fontSize: 28, color: '#27272a', fontWeight: 'bold', alignment: 'center' },
      { id: 'l4', type: 'text', field: 'Section', x: 50, y: 66.4, fontSize: 28, color: '#27272a', fontWeight: 'bold', alignment: 'center' },
      { id: 'l5', type: 'text', field: 'Roll No', x: 50, y: 70.6, fontSize: 28, color: '#27272a', fontWeight: 'bold', alignment: 'center' },
      { id: 'l6', type: 'text', field: 'Year', x: 50, y: 74.8, fontSize: 28, color: '#27272a', fontWeight: 'bold', alignment: 'center' },
      { id: 'l7', type: 'text', field: 'Mobile', x: 50, y: 79, fontSize: 28, color: '#27272a', fontWeight: 'bold', alignment: 'center' }
    ]
  });

  const setProject = (
    value: ProjectState | ((prev: ProjectState) => ProjectState)
  ) => {
    rawSetProject(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      
      const oldPhoto = prev.layers.find(l => l.type === 'photo');
      if (oldPhoto) {
        const newPhoto = next.layers.find(l => l.id === oldPhoto.id);
        if (newPhoto && (oldPhoto.x !== newPhoto.x || oldPhoto.y !== newPhoto.y)) {
          const deltaX = newPhoto.x - oldPhoto.x;
          const deltaY = newPhoto.y - oldPhoto.y;
          
          if (deltaX !== 0 || deltaY !== 0) {
            const updatedLayers = next.layers.map(l => {
              if (l.type === 'photo') return l;
              if (l.type === 'text') {
                return {
                  ...l,
                  x: Math.max(0, Math.min(100, Number((l.x + deltaX).toFixed(3)))),
                  y: Math.max(0, Math.min(100, Number((l.y + deltaY).toFixed(3))))
                };
              }
              return l;
            });
            return { ...next, layers: updatedLayers };
          }
        }
      }
      return next;
    });
  };

  const project = projectStateValue;

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingIndices, setExportingIndices] = useState<number[]>([]);

  const handleLayerUpdate = (id: string, updates: Partial<Layer>) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const handleSinglePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const activePhotoKey = activePhotoKeyRef.current;
    
    if (file && activePhotoKey !== null) {
      const reader = new FileReader();
      reader.onload = () => {
        setProject(prev => ({
          ...prev,
          photos: {
            ...prev.photos,
            [`record_${activePhotoKey}`]: reader.result as string
          }
        }));
        activePhotoKeyRef.current = null;
        setActivePhotoKeyState(null);
        if (e.target) e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualAdd = () => {
    const recordId = Math.random().toString(36).substr(2, 9);
    const newRecord: any = { _id: recordId };
    if (project.csvData.length > 0) {
      Object.keys(project.csvData[0]).forEach(key => {
        if (key === '_id') return;
        newRecord[key] = key === project.photoKeyColumn ? (project.csvData.length + 1).toString() : "";
      });
    } else {
      newRecord["Name"] = "New Student";
      newRecord["Roll"] = (project.csvData.length + 1).toString();
      newRecord["Class"] = "N/A";
    }
    setProject(prev => ({ ...prev, csvData: [...prev.csvData, newRecord] }));
  };

  const handleExportAll = async (type: 'zip' | 'pdf' | 'a3') => {
    if (project.csvData.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);

    const CONCURRENCY_LIMIT = 3; // Process 3 cards at a time for stability

    const processCard = async (i: number) => {
      // Small timeout to ensure browser has painted the element
      await new Promise(r => setTimeout(r, 100));
      
      const element = document.getElementById(`bulk-card-${i}`);
      if (!element) {
        console.warn(`Element bulk-card-${i} not found`);
        return null;
      }

      try {
        const dataUrl = await toPng(element as HTMLElement, { 
          pixelRatio: 3, 
          cacheBust: true,
          backgroundColor: '#ffffff',
          width: 280,
          height: 432,
          style: {
            borderRadius: '0',
            border: 'none',
            boxShadow: 'none',
            transform: 'none'
          }
        });
        return { index: i, dataUrl };
      } catch (err) {
        console.error(`Error processing card ${i}:`, err);
        return null;
      }
    };

    try {
      if (type === 'zip') {
        const zip = new JSZip();
        for (let i = 0; i < project.csvData.length; i += CONCURRENCY_LIMIT) {
          const chunk = Array.from({ length: Math.min(CONCURRENCY_LIMIT, project.csvData.length - i) }, (_, k) => i + k);
          
          // Set visible indices for rendering
          setExportingIndices(chunk);
          
          // Wait for React to render the batch
          await new Promise(r => setTimeout(r, 150));
          
          const results = await Promise.all(chunk.map(processCard));
          
          results.forEach((res) => {
            if (res) {
              const rowData = project.csvData[res.index];
              const rollRes = getFieldValue(rowData, project.photoKeyColumn);
              const nameRes = getFieldValue(rowData, 'Name');
              const identifier = rollRes.found ? rollRes.value : (nameRes.found ? nameRes.value : 'id');
              const fileName = `${res.index + 1}_${identifier}.png`;
              const base64Data = res.dataUrl.split(",")[1];
              zip.file(fileName, base64Data, { base64: true });
            }
          });
          setExportProgress(Math.min(100, Math.round(((i + CONCURRENCY_LIMIT) / project.csvData.length) * 100)));
        }
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `CardForge_Batch_PNG_${new Date().getTime()}.zip`);
        
      } else if (type === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const cardWidth = 55.9;
        const cardHeight = 86.4;
        const margin = 10;
        
        for (let i = 0; i < project.csvData.length; i += CONCURRENCY_LIMIT) {
          const chunk = Array.from({ length: Math.min(CONCURRENCY_LIMIT, project.csvData.length - i) }, (_, k) => i + k);
          
          setExportingIndices(chunk);
          await new Promise(r => setTimeout(r, 150));
          
          const results = await Promise.all(chunk.map(processCard));
          
          results.forEach((res) => {
            if (res) {
              const col = res.index % 3;
              const row = Math.floor(res.index / 3) % 3;
              if (res.index > 0 && res.index % 9 === 0) pdf.addPage();
              const x = margin + col * (cardWidth + 5);
              const y = margin + row * (cardHeight + 5);
              pdf.addImage(res.dataUrl, 'PNG', x, y, cardWidth, cardHeight);
            }
          });
          setExportProgress(Math.min(100, Math.round(((i + CONCURRENCY_LIMIT) / project.csvData.length) * 100)));
        }
        pdf.save(`CardForge_A4_Bundle_${new Date().getTime()}.pdf`);

      } else if (type === 'a3') {
        const pdf = new jsPDF('p', 'mm', 'a3');
        const cardWidth = 55.9;
        const cardHeight = 86.4;
        const marginX = 15;
        const marginY = 15;
        const gap = 4;
        const cardsPerRow = 4;
        const cardsPerCol = 4;
        const cardsPerPage = cardsPerRow * cardsPerCol;

        for (let i = 0; i < project.csvData.length; i += CONCURRENCY_LIMIT) {
          const chunk = Array.from({ length: Math.min(CONCURRENCY_LIMIT, project.csvData.length - i) }, (_, k) => i + k);
          
          setExportingIndices(chunk);
          await new Promise(r => setTimeout(r, 150));
          
          const results = await Promise.all(chunk.map(processCard));

          results.forEach((res) => {
            if (res) {
              const cardInPageIdx = res.index % cardsPerPage;
              const col = cardInPageIdx % cardsPerRow;
              const row = Math.floor(cardInPageIdx / cardsPerRow);

              if (res.index > 0 && cardInPageIdx === 0) pdf.addPage();

              const x = marginX + (col * (cardWidth + gap));
              const y = marginY + (row * (cardHeight + gap));

              pdf.addImage(res.dataUrl, 'PNG', x, y, cardWidth, cardHeight);
            }
          });
          setExportProgress(Math.min(100, Math.round(((i + CONCURRENCY_LIMIT) / project.csvData.length) * 100)));
        }
        pdf.save(`CardForge_A3_Print_Sheet_${new Date().getTime()}.pdf`);
      }
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportingIndices([]);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      <Sidebar 
        project={project} 
        setProject={setProject} 
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        photosInputRef={photosInputRef}
        onManualAdd={handleManualAdd}
        lang={lang}
        setLang={handleSetLang}
      />

      <input 
        type="file" 
        ref={singlePhotoInputRef} 
        className="hidden" 
        onChange={handleSinglePhotoUpload} 
        accept="image/*" 
      />

      <main className="flex-1 overflow-y-auto bg-[#F1F3F5] p-8 custom-scrollbar">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg text-slate-400 border border-slate-200 shadow-sm">
               <Eye size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-800">{t.activeCanvas}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">{t.realtimePreview}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right mr-2 hidden md:block">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.totalStudents}</p>
               <p className="text-xl font-black text-orange-600 leading-none">{project.csvData.length}</p>
             </div>
             
             <div className="flex gap-2">
                <Button 
                  onClick={() => handleExportAll('zip')} 
                  disabled={isExporting || project.csvData.length === 0}
                  variant="outline"
                  className="border-2 border-zinc-200 hover:bg-white text-zinc-700 font-bold h-12 px-6 rounded-sm shadow-sm group"
                >
                  <Package className="mr-2 h-5 w-5" />
                  PNG
                </Button>

                <Button 
                  onClick={() => handleExportAll('pdf')} 
                  disabled={isExporting || project.csvData.length === 0}
                  variant="outline"
                  className="border-2 border-zinc-200 hover:bg-white text-zinc-700 font-bold h-12 px-6 rounded-sm shadow-sm group"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  A4 Sheet
                </Button>
                
                <Button 
                  onClick={() => handleExportAll('a3')} 
                  disabled={isExporting || project.csvData.length === 0}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-8 rounded-sm shadow-lg shadow-orange-900/20 group"
                >
                  {isExporting ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      {exportProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                      A3 Sheet
                    </>
                  )}
                </Button>
             </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="max-w-screen-xl mx-auto">
          {project.csvData.length === 0 ? (
            <div className="h-[70vh] border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center bg-white shadow-sm group">
               <div className="w-24 h-24 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 border border-slate-100">
                 <CreditCard size={48} className="text-slate-300" />
               </div>
               <h3 className="text-2xl font-bold text-slate-400 italic">{t.emptyWorkspace}</h3>
               <p className="text-slate-500 mt-2 text-center max-w-sm">
                 {t.emptyWorkspaceDesc}
               </p>
               <div className="mt-8 flex gap-2">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />)}
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 place-items-center pb-32">
              <AnimatePresence>
                {project.csvData.map((data, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative"
                  >
                    <div className="absolute -left-12 top-6 text-slate-200 font-black text-3xl rotate-[-90deg] select-none pointer-events-none">
                      #{String(idx + 1).padStart(3, '0')}
                    </div>
                    <CardCanvas 
                      id={`display-card-${idx}`}
                      template={project.templateImage}
                      data={data}
                      photos={project.photos}
                      photoKeyColumn={project.photoKeyColumn}
                      layers={project.layers}
                      onLayerSelect={setSelectedLayerId}
                      onLayerUpdate={handleLayerUpdate}
                      selectedLayerId={selectedLayerId}
                      onPhotoClick={(keyOrId) => {
                        activePhotoKeyRef.current = keyOrId;
                        setActivePhotoKeyState(keyOrId);
                        setTimeout(() => {
                           singlePhotoInputRef.current?.click();
                        }, 10);
                      }}
                      isDraggable={idx === 0} 
                      institutionName={project.institutionName}
                      institutionAddress={project.institutionAddress}
                      institutionLogo={project.institutionLogo}
                      institutionColor={project.institutionColor}
                      useCustomHeader={project.useCustomHeader}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer info requested by user */}
        <div className="mt-16 pt-8 border-t border-slate-200/80 max-w-screen-xl mx-auto text-center md:flex md:items-center md:justify-between text-xs text-slate-500 font-medium pb-12">
          <div className="text-left">
            <span className="font-extrabold text-slate-705 tracking-wider">{t.appTitle}</span>
            <span className="mx-2 text-slate-300">|</span>
            <span>{t.bulkSolution}</span>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right flex flex-col md:items-end gap-1 text-[11.5px] text-zinc-500 font-medium">
            <div>{t.copyright}</div>
            <div>{t.address}</div>
            <div className="text-orange-600 font-bold">{t.phone}</div>
          </div>
        </div>
      </main>

      <div id="bulk-export-batch" className="absolute top-0 left-[-9999px] pointer-events-none overflow-visible">
        {exportingIndices.map((idx) => (
           <CardCanvas 
             key={`bulk-${idx}`}
             id={`bulk-card-${idx}`}
             template={project.templateImage}
             data={project.csvData[idx]}
             photos={project.photos}
             photoKeyColumn={project.photoKeyColumn}
             layers={project.layers}
             institutionName={project.institutionName}
             institutionAddress={project.institutionAddress}
             institutionLogo={project.institutionLogo}
             institutionColor={project.institutionColor}
             useCustomHeader={project.useCustomHeader}
           />
        ))}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}

