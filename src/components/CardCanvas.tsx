import React, { useRef, useEffect, useState } from "react";
import { Layer, StudentData } from "../types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const getFieldValue = (data: StudentData, field: string): { found: boolean; value: string; key?: string } => {
  if (!data || !field) return { found: false, value: '', key: field };
  
  const targetLower = field.trim().toLowerCase();
  const keys = Object.keys(data).filter(k => k !== '_id');
  if (keys.length === 0) return { found: false, value: '', key: field };

  // 1. Direct match (e.g. matching case)
  if (data[field] !== undefined) {
    return { found: true, value: String(data[field]), key: field };
  }
  
  // 2. Case-insensitive and trimmed lookup
  const foundKey = keys.find(k => k.trim().toLowerCase() === targetLower);
  if (foundKey !== undefined) {
    return { found: true, value: String(data[foundKey]), key: foundKey };
  }
  
  // 3. Fallbacks for ID Card fields with common header variations
  let matchKey: string | undefined;
  if (targetLower === 'roll no' || targetLower === 'roll' || targetLower === 'rollno' || targetLower === 'রোল' || targetLower === 'রোল নং' || targetLower === 'রোল নম্বর' || targetLower === 'আইডি') {
    matchKey = keys.find(k => {
      const lk = k.trim().toLowerCase();
      return lk === 'roll' || lk === 'roll no' || lk === 'roll_no' || lk === 'rollno' || lk === 'id' || lk.includes('roll') ||
             lk === 'রোল' || lk === 'রোল নং' || lk === 'রোল নম্বর' || lk === 'আইডি' || lk === 'ক্রমিক' || lk === 'ক্রমিক নং' || lk.includes('রোল');
    });
  } else if (targetLower === 'section' || targetLower === 'sec' || targetLower === 'শাখা' || targetLower === 'বিভাগ' || targetLower === 'গ্রুপ') {
    matchKey = keys.find(k => {
      const lk = k.trim().toLowerCase();
      return lk === 'section' || lk === 'sec' || lk === 'group' || lk === 'dept' ||
             lk === 'শাখা' || lk === 'বিভাগ' || lk === 'গ্রুপ' || lk === 'সেকশন';
    });
  } else if (targetLower === 'mobile' || targetLower === 'phone' || targetLower === 'phone no' || targetLower === 'mobile no' || targetLower === 'মোবাইল' || targetLower === 'ফোন' || targetLower === 'যোগাযোগ') {
    matchKey = keys.find(k => {
      const lk = k.trim().toLowerCase();
      return lk === 'mobile' || lk === 'phone' || lk === 'phone no' || lk === 'phone_no' || lk === 'phoneno' || lk === 'mobile no' || lk === 'mobile_no' || lk === 'mobileno' || lk === 'contact' ||
             lk === 'মোবাইল' || lk === 'মোবাইল নং' || lk === 'মোবাইল নম্বর' || lk === 'ফোন' || lk === 'যোগাযোগ' || lk.includes('মোবাইল') || lk.includes('ফোন');
    });
  } else if (targetLower === 'class' || targetLower === 'cls' || targetLower === 'শ্রেণী' || targetLower === 'শ্রেণি' || targetLower === 'শ্রেণী ও বিভাগ' || targetLower === 'ক্লাস') {
    matchKey = keys.find(k => {
      const lk = k.trim().toLowerCase();
      return lk === 'class' || lk === 'cls' || lk === 'grade' || lk === 'standard' ||
             lk === 'শ্রেণী' || lk === 'শ্রেণি' || lk === 'শ্রেণী ও বিভাগ' || lk === 'শ্রেণি ও বিভাগ' || lk === 'ক্লাস' || lk.includes('শ্রেণ');
    });
  } else if (targetLower === 'year' || targetLower === 'session' || targetLower === 'শিক্ষাবর্ষ' || targetLower === 'সেশন' || targetLower === 'সাল' || targetLower === 'সন') {
    matchKey = keys.find(k => {
      const lk = k.trim().toLowerCase();
      return lk === 'year' || lk === 'session' || lk === 'academic year' || lk === 'academic_year' ||
             lk === 'শিক্ষাবর্ষ' || lk === 'সেশন' || lk === 'বছর' || lk === 'সন' || lk === 'সাল' || lk.includes('কর্ষ') || lk.includes('সেশন');
    });
  } else if (targetLower === 'name' || targetLower === 'student name' || targetLower === 'নাম' || targetLower === 'ছাত্রের নাম' || targetLower === 'শিক্ষার্থীর নাম') {
    matchKey = keys.find(k => {
      const lk = k.trim().toLowerCase();
      return lk === 'name' || lk === 'student name' || lk === 'student' || lk === 'full name' ||
             lk === 'নাম' || lk === 'ছাত্রের নাম' || lk === 'ছাত্রীর নাম' || lk === 'শিক্ষার্থীর নাম' || lk === 'নাম:';
    });
  }

  if (matchKey !== undefined) {
    return { found: true, value: String(data[matchKey]), key: matchKey };
  }

  // 4. Loose substring match
  const partialMatch = keys.find(k => {
    const lk = k.trim().toLowerCase();
    return lk.includes(targetLower) || targetLower.includes(lk);
  });
  if (partialMatch !== undefined) {
    return { found: true, value: String(data[partialMatch]), key: partialMatch };
  }

  return { found: false, value: '', key: field };
};

interface CardCanvasProps {
  template: string | null;
  data: StudentData;
  photos: Record<string, string>;
  photoKeyColumn: string;
  layers: Layer[];
  id?: string;
  className?: string;
  onLayerSelect?: (id: string) => void;
  onLayerUpdate?: (id: string, updates: Partial<Layer>) => void;
  onPhotoClick?: (key: string) => void;
  selectedLayerId?: string | null;
  isDraggable?: boolean;
  institutionName?: string;
  institutionAddress?: string;
  institutionLogo?: string | null;
  institutionColor?: string;
  useCustomHeader?: boolean;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({ 
  template, 
  data, 
  photos, 
  photoKeyColumn, 
  layers, 
  id, 
  className,
  onLayerSelect,
  onLayerUpdate,
  onPhotoClick,
  selectedLayerId,
  isDraggable = false,
  institutionName = "BALSHID HAZI AKUB ALI HIGH SCHOOL",
  institutionAddress = "BALSHID, SHAHRASTI, CHANDPUR",
  institutionLogo = null,
  institutionColor = "#ffffff",
  useCustomHeader = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const getPhotoUrl = () => {
    // 1. Try individual photo first using _id
    if (data._id && photos[`record_${data._id}`]) {
      return photos[`record_${data._id}`];
    }

    // 2. Fallback to bulk matching if photoKeyColumn is provided
    if (!photoKeyColumn) return null;
    const res = getFieldValue(data, photoKeyColumn);
    if (!res.found) return null;
    const val = res.value;
    if (val === undefined || val === null) return null;
    
    const key = String(val).trim();
    if (!key && !photos[key]) return null;
    
    // Direct match
    if (photos[key]) return photos[key];
    
    // Case-insensitive fallback
    const lowerKey = key.toLowerCase();
    const photoKeys = Object.keys(photos);
    const matchedKey = photoKeys.find(k => k.toLowerCase() === lowerKey);
    return matchedKey ? photos[matchedKey] : null;
  };

  const studentPhoto = getPhotoUrl();
  const photoKeyRes = getFieldValue(data, photoKeyColumn);
  const photoKey = photoKeyRes.found ? photoKeyRes.value.trim() : '';

  // Find the maximum length of resolved labels among all text layers that are not 'name'
  const textLayersWithColons = layers.filter(l => l.type === 'text' && l.field && l.field.toLowerCase() !== 'name');
  
  const getLabelVisualWidth = (lbl: string): number => {
    let total = 0;
    for (const char of lbl) {
      if (/[\u0980-\u09FF]/.test(char)) {
        total += 0.82; // Bengali average character width
      } else {
        const c = char.toUpperCase();
        if (c === 'I') total += 0.28;
        else if (c === 'M' || c === 'W') total += 0.85;
        else if (c === 'G' || c === 'O' || c === 'Q' || c === 'D' || c === 'H' || c === 'U') total += 0.68;
        else if (c === ' ' || c === '.' || c === '-' || c === ':') total += 0.3;
        else if (c === 'F' || c === 'J' || c === 'L' || c === 'T') total += 0.52;
        else total += 0.60; // default average uppercase
      }
    }
    return total;
  };

  let maxVisualWidth = 4; // minimum fallback (about 4em wide)
  let isBengali = false;
  
  textLayersWithColons.forEach(l => {
    const f = l.field || '';
    const res = getFieldValue(data, f);
    const label = (res.key || f).trim().replace(/\s+/g, ' ').toUpperCase();
    if (/[\u0980-\u09FF]/.test(label)) {
      isBengali = true;
    }
    const visualWidth = getLabelVisualWidth(label);
    if (visualWidth > maxVisualWidth) {
      maxVisualWidth = visualWidth;
    }
  });

  // Precise calculated label width in em units with tiny safety threshold
  const labelWidth = `${maxVisualWidth + 0.1}em`;

  const handleDragEnd = (layerId: string, info: any) => {
    if (!containerRef.current || !onLayerUpdate) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    // Calculate center point in pixels
    const currentXPixels = (layer.x / 100) * rect.width;
    const currentYPixels = (layer.y / 100) * rect.height;

    // Add drag delta
    const newXPixels = currentXPixels + info.offset.x;
    const newYPixels = currentYPixels + info.offset.y;

    // Convert back to percentage
    const newXPercent = (newXPixels / rect.width) * 100;
    const newYPercent = (newYPixels / rect.height) * 100;

    onLayerUpdate(layerId, {
      x: Math.max(0, Math.min(100, newXPercent)),
      y: Math.max(0, Math.min(100, newYPercent))
    });
  };

  return (
    <div 
      id={id}
      ref={containerRef}
      onClick={() => id && onLayerSelect?.(id)}
      className={cn(
        "relative bg-white shadow-2xl overflow-hidden select-none shrink-0 cursor-pointer",
        "w-[280px] h-[432px]", 
        className
      )}
    >
      {/* Template Background */}
      {template ? (
        <img src={template} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" alt="Template" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-zinc-300 border-2 border-dashed border-zinc-200 m-2 pointer-events-none">
           <p className="text-xs uppercase font-bold tracking-widest">No Template</p>
        </div>
      )}



      {/* Layers */}
      {layers.map(layer => {
        const isSelected = selectedLayerId === layer.id;
        const isLeftAligned = layer.alignment === 'left';
        const isRightAligned = layer.alignment === 'right';
        const transformValue = isLeftAligned 
          ? 'translate(0, -50%)' 
          : isRightAligned 
            ? 'translate(-100%, -50%)' 
            : 'translate(-50%, -50%)';

        if (layer.type === 'photo') {
          return (
            <motion.div 
              key={layer.id}
              drag={isDraggable && isSelected}
              dragMomentum={false}
              onDragEnd={(_, info) => handleDragEnd(layer.id, info)}
              onClick={(e) => {
                e.stopPropagation();
                onLayerSelect?.(layer.id);
              }}
              style={{
                position: 'absolute',
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${layer.width || 124}px`,
                height: `${layer.height || 155}px`,
                borderRadius: `${layer.borderRadius || 0}px`,
                zIndex: 10,
                border: isSelected ? '2px solid #f97316' : '1px solid transparent',
                cursor: isDraggable ? 'move' : 'pointer'
              }}
              className={cn(
                "bg-zinc-100 overflow-hidden flex items-center justify-center transition-shadow group shrink-0",
                isSelected && "shadow-xl z-50",
                !studentPhoto && "border-dashed border-zinc-300"
              )}
            >
              {studentPhoto ? (
                <>
                  <img src={studentPhoto} className="w-full h-full object-cover pointer-events-none" alt="Student" />
                  {isSelected && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); onPhotoClick?.(data._id || photoKey); }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
                        <span className="text-[10px] text-white font-bold uppercase">Change</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div 
                  onClick={(e) => { e.stopPropagation(); onPhotoClick?.(data._id || photoKey); }}
                  className="text-[10px] text-zinc-400 font-bold uppercase text-center p-2 flex flex-col items-center gap-1 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center">
                    <span className="text-zinc-500 text-xs">+</span>
                  </div>
                  Click to Add
                </div>
              )}
            </motion.div>
          );
        }

        return (
          <motion.div 
            key={layer.id}
            drag={isDraggable && isSelected}
            dragMomentum={false}
            onDragEnd={(_, info) => handleDragEnd(layer.id, info)}
            onClick={(e) => {
              e.stopPropagation();
              onLayerSelect?.(layer.id);
            }}
            style={{
              position: 'absolute',
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              transform: transformValue,
              color: layer.color,
              fontSize: `${(layer.fontSize || 24) * 0.5}px`,
              fontWeight: 'bold',
              textAlign: layer.alignment as any,
              zIndex: 20,
              padding: '2px 8px',
              border: isSelected ? '1px solid #f97316' : '1px solid transparent',
              cursor: isDraggable ? 'move' : 'pointer',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.05)' : 'transparent',
              borderRadius: '4px',
              width: layer.field && layer.field.toLowerCase() !== 'name' ? `calc(${labelWidth} + 12em)` : undefined,
              display: layer.field && layer.field.toLowerCase() !== 'name' ? 'flex' : 'block',
              alignItems: 'center',
              fontFamily: "'Outfit', 'Inter', sans-serif"
            }}
          >
             {(() => {
               const field = layer.field || '';
               if (!field) return '';
               const res = getFieldValue(data, field);
               const val = res.found ? res.value : `[${field}]`;
               if (field.toLowerCase() === 'name') {
                 return <span style={{ letterSpacing: '-0.025em', fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 'bold' }}>{val}</span>;
               }
               const label = (res.key || field).trim().replace(/\s+/g, ' ').toUpperCase();
               return (
                 <span className="flex items-center w-full shadow-none bg-transparent" style={{ letterSpacing: '-0.025em', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                   <span 
                     className="inline-block shrink-0 truncate font-bold text-left" 
                     style={{ 
                       width: labelWidth, 
                       lineHeight: 1.1,
                       marginRight: '0.25em'
                     }} 
                     title={label}
                   >
                     {label}
                   </span>
                   <span className="shrink-0 select-none font-bold text-left">:</span>
                   <span className="flex-grow text-left truncate font-bold" style={{ paddingLeft: '0.45em' }}>{val}</span>
                 </span>
               );
             })()}
          </motion.div>
        );
      })}

      {/* Grid Overlay (Optional - for alignment) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:20px_20px]" />
    </div>
  );
};
