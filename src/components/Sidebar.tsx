import React, { useRef } from "react";
import { ProjectState, Layer, STUDENT_CSV_TEMPLATE, TEMPLATE_PRESETS } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, Trash2, Image as ImageIcon, FileSpreadsheet, Layers, Download, ChevronUp, ChevronDown, Sparkles, Languages } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { TRANSLATIONS } from "../locales";
import { generateChatHistoryWordDoc } from "../lib/chatExporter";

interface SidebarProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  photosInputRef: React.RefObject<HTMLInputElement>;
  onManualAdd: () => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
}

export function Sidebar({ 
  project, 
  setProject, 
  selectedLayerId, 
  setSelectedLayerId,
  photosInputRef,
  onManualAdd,
  lang,
  setLang
}: SidebarProps) {
  const templateInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProject(prev => ({ ...prev, templateImage: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const findBestFieldMatch = (field: string, columns: string[]): string | null => {
    const targetLower = field.trim().toLowerCase();
    
    // 1. Direct match
    const direct = columns.find(c => c.trim().toLowerCase() === targetLower);
    if (direct) return direct;

    // 2. Map groups
    const mappings: Record<string, string[]> = {
      roll: ['roll', 'roll no', 'roll_no', 'rollno', 'id', 'id no', 'id_no', 'idno', 'رول', 'রোল', 'রোল নং', 'রোল নম্বর', 'আইডি', 'ক্রমিক', 'ক্রমিক নং'],
      section: ['section', 'sec', 'group', 'dept', 'শাখা', 'বিভাগ', 'গ্রুপ', 'সেকশন'],
      mobile: ['mobile', 'phone', 'phone no', 'phone_no', 'phoneno', 'mobile no', 'mobile_no', 'mobileno', 'contact', 'guardian mobile', 'মোবাইল', 'মোবাইল নং', 'মোবাইল নম্বর', 'ফোন', 'যোগাযোগ'],
      class: ['class', 'cls', 'grade', 'standard', 'শ্রেণী', 'শ্রেণি', 'শ্রেণী ও বিভাগ', 'শ্রেণি ও বিভাগ', 'ক্লাস'],
      year: ['year', 'session', 'academic year', 'academic_year', 'academic session', 'শিক্ষাবর্ষ', 'সেশন', 'বছর', 'সন', 'সাল'],
      name: ['name', 'student name', 'student', 'full name', 'নাম', 'ছাত্রের নাম', 'ছাত্রীর নাম', 'শিক্ষার্থীর নাম', 'নাম:']
    };

    // Find which category the given field belongs to
    let category: string | null = null;
    for (const [cat, words] of Object.entries(mappings)) {
      if (words.some(w => targetLower === w || targetLower.includes(w) || w.includes(targetLower)) || cat === targetLower) {
        category = cat;
        break;
      }
    }

    if (category) {
      const fallbackWords = mappings[category];
      const match = columns.find(c => {
        const colLower = c.trim().toLowerCase();
        return fallbackWords.some(w => colLower === w || colLower.includes(w) || w.includes(colLower));
      });
      if (match) return match;
    }

    // 3. Fallback to loose contains
    const loose = columns.find(c => {
      const colLower = c.trim().toLowerCase();
      return colLower.includes(targetLower) || targetLower.includes(colLower);
    });
    return loose || null;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const withIds = (results.data as any[]).map(item => ({
            ...item,
            _id: item._id || Math.random().toString(36).substr(2, 9)
          }));
          
          setProject(prev => {
            const cols = withIds.length > 0 ? Object.keys(withIds[0]).filter(c => c !== '_id') : [];
            if (cols.length === 0) return { ...prev, csvData: withIds };

            const updatedLayers = prev.layers.map(layer => {
              if (layer.type === 'photo') return layer;
              const matchedCol = findBestFieldMatch(layer.field || '', cols);
              if (matchedCol) {
                return { ...layer, field: matchedCol };
              }
              return layer;
            });

            const matchedPhotoCol = findBestFieldMatch('Roll No', cols) || cols[0] || prev.photoKeyColumn;

            return {
              ...prev,
              csvData: withIds,
              layers: updatedLayers,
              photoKeyColumn: matchedPhotoCol
            };
          });
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = (evt.target as any).result as string;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        const withIds = (data as any[]).map(item => ({
          ...item,
          _id: item._id || Math.random().toString(36).substr(2, 9)
        }));
        
        setProject(prev => {
          const cols = withIds.length > 0 ? Object.keys(withIds[0]).filter(c => c !== '_id') : [];
          if (cols.length === 0) return { ...prev, csvData: withIds };

          const updatedLayers = prev.layers.map(layer => {
            if (layer.type === 'photo') return layer;
            const matchedCol = findBestFieldMatch(layer.field || '', cols);
            if (matchedCol) {
              return { ...layer, field: matchedCol };
            }
            return layer;
          });

          const matchedPhotoCol = findBestFieldMatch('Roll No', cols) || cols[0] || prev.photoKeyColumn;

          return {
            ...prev,
            csvData: withIds,
            layers: updatedLayers,
            photoKeyColumn: matchedPhotoCol
          };
        });
      };
      reader.readAsBinaryString(file);
    }
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newPhotos: Record<string, string> = { ...project.photos };
    
    const uploadPromises = files.map((file: File) => {
      return new Promise<void>((resolve) => {
        const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            newPhotos[nameWithoutExt] = reader.result;
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    await Promise.all(uploadPromises);
    setProject((prev: ProjectState) => ({ ...prev, photos: newPhotos }));
  };

  const addTextLayer = () => {
    const columns = project.csvData.length > 0 ? Object.keys(project.csvData[0]) : [];
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      field: columns[0] || 'Name',
      x: 50,
      y: 80,
      fontSize: 24,
      color: '#000000',
      fontWeight: 'bold',
      alignment: 'center'
    };
    setProject(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
    setSelectedLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    setProject(prev => ({ ...prev, layers: prev.layers.filter(l => l.id !== id) }));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const columns = project.csvData.length > 0 ? Object.keys(project.csvData[0]).filter(c => c !== '_id') : [];
  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
  const selectedRecordIndex = selectedLayerId?.startsWith('display-card-') ? parseInt(selectedLayerId.replace('display-card-', '')) : -1;
  const selectedRecord = selectedRecordIndex !== -1 ? project.csvData[selectedRecordIndex] : null;

  const updateRecord = (index: number, field: string, value: string) => {
    const newData = [...project.csvData];
    newData[index] = { ...newData[index], [field]: value };
    setProject(prev => ({ ...prev, csvData: newData }));
  };

  return (
    <div className="w-[380px] border-r h-screen bg-white text-zinc-700 overflow-hidden flex flex-col shrink-0">
      <div className="p-6 border-b border-zinc-100 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
            <div className="bg-orange-600 w-2 h-5 rounded-full shrink-0" />
            {t.appTitle}
          </h1>
          <p className="text-[9px] text-zinc-450 font-medium tracking-tight mt-0.5">{t.appSubtitle}</p>
        </div>
        
        {/* Language Selector Toggle */}
        <button
          onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
          type="button"
          className="flex items-center gap-1 text-[10px] font-black uppercase bg-zinc-100 hover:bg-orange-100 text-zinc-650 hover:text-orange-700 px-2.5 py-1.5 rounded-full transition-all border border-zinc-200 cursor-pointer shrink-0"
        >
          <Languages size={12} className="text-zinc-500 group-hover:text-orange-600" />
          {lang === 'bn' ? 'English' : 'বাংলা'}
        </button>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        {/* Step 1: Template */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-500 animate-pulse" /> {t.chooseTemplate}
            </h2>
          </div>

          {/* Interactive Preset Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {TEMPLATE_PRESETS.map((preset) => {
              const isActive = project.templateImage === preset.dataUrl;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setProject(prev => ({ ...prev, templateImage: preset.dataUrl }))}
                  className={`relative flex flex-col items-center p-2 rounded-xl border text-left transition-all overflow-hidden ${
                    isActive 
                      ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/10' 
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white'
                  }`}
                >
                  {/* Miniature Live Preview */}
                  <div className="w-full h-24 bg-zinc-100 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-100 shadow-sm relative group mb-1.5">
                    <img 
                      src={preset.dataUrl || ''} 
                      className="w-full h-full object-cover select-none" 
                      alt={preset.name} 
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-orange-600/10 flex items-center justify-center">
                        <span className="bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md uppercase tracking-wider scale-95">{t.activeText}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-800 leading-tight w-full truncate text-center">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Upload Area */}
          <div className="space-y-2 pt-1">
            <Label className="text-[10px] uppercase font-bold text-zinc-400">{t.orUploadCustom}</Label>
            <div 
              onClick={() => templateInputRef.current?.click()}
              className="border border-dashed border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 rounded-lg py-2 px-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Upload size={12} className="text-zinc-550" />
              <span className="text-[11px] font-bold text-zinc-650">{t.chooseCustomFile}</span>
              <input type="file" ref={templateInputRef} onChange={handleTemplateUpload} accept="image/*,.svg" className="hidden" />
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <FileSpreadsheet size={14} /> {t.studentData}
            </h2>
            <Button variant="ghost" size="sm" onClick={onManualAdd} className="h-7 text-[10px] text-orange-500 hover:text-orange-600">
              <Plus size={14} className="mr-1" /> {t.addRecord}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1 bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800" 
              onClick={() => csvInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> {t.csvExcel}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="border-zinc-200 hover:bg-zinc-50 text-zinc-650"
              onClick={() => {
                const blob = new Blob([STUDENT_CSV_TEMPLATE], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sample.csv";
                a.click();
              }}
            >
              <Download size={16} />
            </Button>
          </div>
          <input type="file" ref={csvInputRef} onChange={handleCSVUpload} accept=".csv, .xlsx, .xls" className="hidden" />
          
          {project.csvData.length > 0 && (
             <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-100 flex items-center justify-between">
                <div className="text-xs text-zinc-700">
                  <span className="text-orange-600 font-bold">{project.csvData.length}</span> {t.recordsLoaded}
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500" onClick={() => setProject(p => ({ ...p, csvData: [] }))}>{t.clear}</Button>
             </div>
          )}
        </section>

        {/* Project Persistence */}
        <section className="p-4 bg-orange-50/30 rounded-xl border border-orange-100 space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-orange-400">{t.projectConfig}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CardForge_Config.cf`;
                a.click();
              }}
              className="flex-1 h-8 text-[10px] border-orange-200 text-orange-600 hover:bg-orange-100 font-bold"
            >
              {t.saveSetting}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.cf';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const data = JSON.parse(evt.target?.result as string);
                      setProject(data);
                    } catch (err) {
                      alert(t.invalidConfig);
                    }
                  };
                  reader.readAsText(file);
                };
                input.click();
              }}
              className="flex-1 h-8 text-[10px] border-orange-200 text-orange-600 hover:bg-orange-100 font-bold"
            >
              {t.loadSetting}
            </Button>
          </div>
          <Button
            variant="default"
            onClick={() => {
              const htmlContent = generateChatHistoryWordDoc();
              const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Chat_History_and_Instructions_মাসুদ_আইডি_মেকার.doc`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full h-8 text-[10px] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download size={12} /> {t.downloadChatLog}
          </Button>
        </section>

        {/* Step 3: Photos */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <ImageIcon size={14} /> {t.studentPhotos}
          </h2>
          
          <div className="space-y-3">
            <Label className="text-[10px] uppercase font-bold text-zinc-500">{t.bulkMatchCol}</Label>
            <Select 
              value={project.photoKeyColumn} 
              onValueChange={(val) => setProject(prev => ({ ...prev, photoKeyColumn: val }))}
            >
              <SelectTrigger className="bg-zinc-50 border-zinc-200 text-xs">
                <SelectValue placeholder={t.bulkMatchCol} />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-700">
                {columns.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tight">{t.proTip}</p>
            <p className="text-[10px] text-blue-600 leading-relaxed">
              {t.proTipDesc}
            </p>
          </div>

          <Button 
            variant="secondary" 
            className="w-full bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-805"
            onClick={() => photosInputRef.current?.click()}
          >
            <Plus className="mr-2 h-4 w-4" /> {t.bulkUploadBtn}
          </Button>
          <input type="file" multiple ref={photosInputRef} onChange={handlePhotosUpload} accept="image/*" className="hidden" />
          
          <div className="flex items-center justify-between px-1">
             <span className="text-xs font-medium text-zinc-650">{Object.keys(project.photos).length} {t.photosStored}</span>
             <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-400" onClick={() => setProject(p => ({...p, photos: {}}))}>{t.clearAllPhotos}</Button>
          </div>
        </section>

        {/* Record Editor (When a card is selected) */}
        {selectedRecord && (
          <section className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase text-orange-600">{t.editRecord} #{selectedRecordIndex + 1}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLayerId(null)} className="h-4 p-0">×</Button>
            </div>
            <div className="space-y-3">
              {columns.map(col => (
                <div key={col} className="space-y-1">
                  <Label className="text-[10px] text-zinc-500 font-bold uppercase">{col}</Label>
                  <Input 
                    value={selectedRecord[col] || ''} 
                    onChange={(e) => updateRecord(selectedRecordIndex, col, e.target.value)}
                    className="h-8 text-xs bg-white border-zinc-200"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Step 4: Layers */}
      <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Layers size={14} /> Elements
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => {
                const newLayer: Layer = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'photo',
                  x: 50,
                  y: 35,
                  width: 124,
                  height: 155,
                  borderRadius: 0,
                };
                setProject(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
                setSelectedLayerId(newLayer.id);
              }} className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                + Photo
              </Button>
              <Button variant="ghost" size="sm" onClick={addTextLayer} className="h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                + Text
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {project.layers.map((layer, index) => (
              <div 
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedLayerId === layer.id ? 'bg-orange-50 border-orange-500/50 shadow-sm' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index === 0) return;
                        const newLayers = [...project.layers];
                        [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
                        setProject(p => ({ ...p, layers: newLayers }));
                      }}
                      className="text-zinc-300 hover:text-zinc-500"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index === project.layers.length - 1) return;
                        const newLayers = [...project.layers];
                        [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
                        setProject(p => ({ ...p, layers: newLayers }));
                      }}
                      className="text-zinc-300 hover:text-zinc-500"
                    >
                      <ChevronDown size={10} />
                    </button>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${layer.type === 'photo' ? 'bg-blue-500' : 'bg-green-500'}`} />
                  <span className="text-xs font-semibold text-zinc-900">
                    {layer.type === 'photo' ? 'Primary Photo' : (layer.field || 'Text Field')}
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                  className="text-zinc-300 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Layer Editor Subview */}
        {selectedLayer && (
          <section className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-xl shadow-zinc-200/50 space-y-5 animate-in slide-in-from-bottom-2 duration-200 sticky bottom-6 z-20">
            <div className="flex items-center justify-between border-b border-zinc-50 pb-3 mb-1">
              <h3 className="text-[10px] font-black uppercase tracking-tighter text-orange-600">Attributes</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-300" onClick={() => setSelectedLayerId(null)}>×</Button>
            </div>
            
            {selectedLayer.type === 'photo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-400">Width</Label>
                    <Input 
                      type="number" 
                      value={selectedLayer.width || 124} 
                      onChange={(e) => updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
                      className="h-9 bg-zinc-50 border-zinc-100 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-400">Height</Label>
                    <Input 
                      type="number" 
                      value={selectedLayer.height || 155} 
                      onChange={(e) => updateLayer(selectedLayer.id, { height: Number(e.target.value) })}
                      className="h-9 bg-zinc-50 border-zinc-100 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] uppercase font-bold text-zinc-400">Shape / Corners</Label>
                    <span className="text-[10px] font-mono text-zinc-500">{selectedLayer.borderRadius || 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="150" 
                    value={selectedLayer.borderRadius || 0} 
                    onChange={(e) => updateLayer(selectedLayer.id, { borderRadius: Number(e.target.value) })}
                    className="w-full accent-orange-500 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-7 text-[10px] flex-1 border-zinc-100" onClick={() => updateLayer(selectedLayer.id, { borderRadius: 0 })}>Sharp</Button>
                    <Button variant="outline" className="h-7 text-[10px] flex-1 border-zinc-100" onClick={() => updateLayer(selectedLayer.id, { borderRadius: 12 })}>Rounded</Button>
                    <Button variant="outline" className="h-7 text-[10px] flex-1 border-zinc-100" onClick={() => updateLayer(selectedLayer.id, { borderRadius: 999 })}>Circle</Button>
                  </div>
                </div>
              </div>
            )}

            {selectedLayer.type === 'text' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-zinc-400">Dynamic Source</Label>
                  <Select value={selectedLayer.field} onValueChange={(val) => updateLayer(selectedLayer.id, { field: val })}>
                    <SelectTrigger className="h-9 bg-zinc-50 border-zinc-100 text-zinc-900 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-200 text-zinc-700">
                      {columns.length > 0 ? (
                        columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
                      ) : (
                        <SelectItem value="Name">Name (Static)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-400">Font Size</Label>
                    <Input 
                      type="number" 
                      value={selectedLayer.fontSize} 
                      onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                      className="h-9 bg-zinc-50 border-zinc-100 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-400">Weight</Label>
                    <Select value={selectedLayer.fontWeight} onValueChange={(val) => updateLayer(selectedLayer.id, { fontWeight: val })}>
                      <SelectTrigger className="h-9 bg-zinc-50 border-zinc-100 text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-zinc-200">
                        <SelectItem value="normal">Regular</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="black">Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-zinc-400">Fill Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-9 h-9 rounded-lg border border-zinc-200 shadow-inner overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: selectedLayer.color }}
                    >
                      <input 
                        type="color" 
                        value={selectedLayer.color} 
                        onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                        className="w-full h-full p-0 border-none scale-150 cursor-pointer"
                      />
                    </div>
                    <Input 
                      type="text" 
                      value={selectedLayer.color} 
                      onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                      className="h-9 flex-1 bg-zinc-50 border-zinc-100 font-mono text-xs text-zinc-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-zinc-400">Alignment</Label>
                  <div className="flex bg-zinc-50 rounded-lg p-1 border border-zinc-100">
                    {['left', 'center', 'right'].map(align => (
                      <Button 
                        key={align}
                        variant="ghost" 
                        size="sm" 
                        className={`flex-1 h-7 capitalize text-[10px] ${selectedLayer.alignment === align ? 'bg-white shadow-sm font-bold' : 'text-zinc-400'}`}
                        onClick={() => updateLayer(selectedLayer.id, { alignment: align as any })}
                      >
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-zinc-50">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-[10px] uppercase font-bold text-zinc-400">Transform Position</Label>
                <div className="flex gap-1">
                   <Button variant="ghost" className="h-4 p-0 text-[8px] text-orange-500 uppercase font-black" onClick={() => updateLayer(selectedLayer.id, { x: 50 })}>Center X</Button>
                   <Button variant="ghost" className="h-4 p-0 text-[8px] text-orange-500 uppercase font-black" onClick={() => updateLayer(selectedLayer.id, { y: 50 })}>Center Y</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-zinc-50 px-3 h-9 rounded-lg border border-zinc-100">
                  <span className="text-[10px] font-black text-zinc-300">X%</span>
                  <Input 
                    type="number" 
                    value={selectedLayer.x} 
                    onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                    className="h-full border-none bg-transparent text-sm font-bold p-0 text-zinc-800"
                  />
                </div>
                <div className="flex items-center gap-3 bg-zinc-50 px-3 h-9 rounded-lg border border-zinc-100">
                  <span className="text-[10px] font-black text-zinc-300">Y%</span>
                  <Input 
                    type="number" 
                    value={selectedLayer.y} 
                    onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                    className="h-full border-none bg-transparent text-sm font-bold p-0 text-zinc-800"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Brand & Copyright Footer */}
      <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex-shrink-0 text-[10px] leading-relaxed text-zinc-400 font-medium">
        <div className="text-zinc-600 font-bold uppercase tracking-wide text-[9px] mb-1">
          MASUD ID CARD MAKER
        </div>
        <div className="text-zinc-500 font-semibold mb-1">
          COPYRIGHT © ENGR. MD MASUD ALAM
        </div>
        <div className="text-zinc-400">
          Aynatoli, Shahrasti, Chandpur.
        </div>
        <div className="mt-1 flex items-center justify-between text-[9px] text-zinc-400 font-bold border-t border-zinc-200/60 pt-1">
          <span>CONTACT</span>
          <span className="text-orange-600">01714-804392</span>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E2E8F0; }
      `}</style>
    </div>
  );
}
