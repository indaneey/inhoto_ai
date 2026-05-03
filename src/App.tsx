import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, scale } from 'motion/react';
import { Sparkles, Image as ImageIcon, Layout, Download, Loader2, Palette, Type, FileJson, Library, X, ChevronRight, ChevronLeft, ArrowLeft, Wand2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import * as fabric from 'fabric';

const API_BASE = 'https://api.inhoto.com';

const DESIGN_CATEGORIES = [
  {
    id: 'wedding',
    title: 'Wedding',
    icon: '💍',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    prompt: 'Elegant Wedding Invitation. Luxe gold style, elegant serif fonts, names at the top. Minimal decorations.',
    styles: ['Elegant Luxury', 'Romantic', 'Vintage', 'Minimalist', 'Floral', 'Classic'],
    formats: ['Standard', 'Hausa (Wedding Fatiha)', 'Islamic (Nikkah)', 'Modern African', 'Traditional Cultural']
  },
  {
    id: 'birthday',
    title: 'Birthday',
    icon: '🎂',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    prompt: 'Fun and vibrant Birthday Party Invitation. Playful fonts, bright colors, party elements.',
    styles: ['Fun & Vibrant', 'Theme Party', 'Elegant Adult', 'Minimalist', 'Neon', 'Playful']
  },
  {
    id: 'corporate',
    title: 'Corporate',
    icon: '🏢',
    color: 'bg-slate-50 text-slate-600 border-slate-100',
    prompt: 'Professional Corporate Event Invitation. Clean, modern, minimalist, corporate blue and gray colors.',
    styles: ['Professional', 'Modern Minimalist', 'Executive', 'Tech Startup', 'Classic Formal', 'Geometric']
  },
  {
    id: 'baby-shower',
    title: 'Baby Shower',
    icon: '👶',
    color: 'bg-green-50 text-green-600 border-green-100',
    prompt: 'Cute and gentle Baby Shower Invitation. Pastel colors, soft watercolor elements, playful yet elegant.',
    styles: ['Cute Pastel', 'Watercolor Animals', 'Gentle Floral', 'Minimalist Sweet', 'Storybook', 'Playful']
  },
  {
    id: 'new-born',
    title: 'New Born',
    icon: '👶',
    color: 'bg-green-50 text-green-600 border-green-100',
    prompt: 'Cute and gentle New Born Invitation. Pastel colors, soft watercolor elements, playful yet elegant.',
    styles: ['Cute Pastel', 'Watercolor Animals', 'Gentle Floral', 'Minimalist Sweet', 'Storybook', 'Playful'],
    formats: ['Standard', 'Islamic (Aqiqah)','Naming ceremony', 'First Cry']
  },
  {
    id: 'save-the-date',
    title: 'Save the Date',
    icon: '🗓️',
    color: 'bg-teal-50 text-teal-600 border-teal-100',
    prompt: 'Save the Date invitation background.',
    styles: ['Romantic', 'Photo-centric Minimalist', 'Rustic', 'Modern', 'Vintage', 'Floral']
  },
  {
    id: 'wedding-dinner',
    title: 'Wedding Dinner',
    icon: '🍽️',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    prompt: 'Elegant Wedding Dinner invitation background.',
    styles: ['Elegant Evening', 'Intimate Romantic', 'Classic Formal', 'Rustic Charm', 'Modern Minimalist', 'Luxe Gold']
  },
  {
    id: 'bridal-shower',
    title: 'Bridal Shower',
    icon: '👰',
    color: 'bg-pink-50 text-pink-600 border-pink-100',
    prompt: 'Beautiful Bridal Shower invitation background.',
    styles: ['Soft Floral', 'Chic Modern', 'Vintage Tea Party', 'Pastel Watercolor', 'Elegant Rose Gold', 'Minimalist']
  },
  {
    id: 'walima',
    title: 'Walima',
    icon: '🕌',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    prompt: 'Traditional Walima invitation background.',
    styles: ['Traditional Islamic', 'Elegant Luxury', 'Floral Arabesque', 'Modern Minimalist', 'Classic Gold', 'Majestic']
  },
  {
    id: 'engagement',
    title: 'Engagement',
    icon: '💍',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    prompt: 'Romantic Engagement invitation background.',
    styles: ['Romantic', 'Chic Modern', 'Vintage', 'Minimalist', 'Floral', 'Luxe Gold']
  }
];

function BackgroundLibrary({ onSelect, onClose }: { onSelect: (file: File, url: string) => void, onClose: () => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 18;

  useEffect(() => {
    fetch(`${API_BASE}/api/categories?type=background`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
          if (data.categories.length > 0) setActiveCategory(data.categories[0].id);
        }
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/backgrounds?category=${activeCategory}&page=${page}&limit=${perPage}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBackgrounds(data.backgrounds);
          setTotal(data.total || data.backgrounds.length);
        }
        setLoading(false);
      });
  }, [activeCategory, page]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  const handleSelect = async (bg: any) => {
    const url = `${API_BASE}/b/${bg.shortURLCode}.${bg.extension}`;
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const file = new File([blob], `${bg.title || 'background'}.${bg.extension}`, { type: blob.type });
      onSelect(file, url);
    } catch (err) {
      console.error('Failed to load library image', err);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-lg text-zinc-800">Background Library</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200/50 rounded-full transition-all group">
            <X className="w-5 h-5 text-zinc-400 group-hover:text-zinc-800" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-black/5 bg-zinc-50/50 p-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 mb-2">Categories</p>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-between group ${activeCategory === cat.id ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'hover:bg-zinc-200/50 text-zinc-600'}`}
              >
                <span>{cat.title}</span>
                <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${activeCategory === cat.id ? 'opacity-100' : ''}`} />
              </button>
            ))}
          </div>

          {/* Backgrounds Grid Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="flex-1 p-6 overflow-y-auto min-h-0">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                    <p className="text-xs font-bold text-amber-600/60 uppercase tracking-wide">Loading backgrounds...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {backgrounds.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => handleSelect(bg)}
                      className="aspect-[3/4] group relative rounded-2xl overflow-hidden border border-black/5 hover:ring-2 hover:ring-amber-600 transition-all shadow-sm hover:shadow-xl bg-zinc-100"
                    >
                      <img 
                        src={`${API_BASE}/b/${bg.shortURLCode}.${bg.extension}?view=true`} 
                        alt={bg.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[10px] font-bold uppercase tracking-widest truncate">{bg.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-black/5 bg-zinc-50/50 flex items-center justify-between">
              <div className="text-xs font-medium text-zinc-400">
                Page <span className="text-zinc-800">{page}</span> of <span className="text-zinc-800">{totalPages || 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(prev => prev - 1)}
                  className="p-2 rounded-xl bg-white border border-black/5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(prev => prev + 1)}
                  className="p-2 rounded-xl bg-white border border-black/5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'categories' | 'setup' | 'editor'>('categories');
  const [selectedStyle, setSelectedStyle] = useState<string>('Elegant Luxury');
  const STYLES = ['Elegant Luxury', 'Romantic', 'Minimalist', 'Floral', 'Vintage', 'Modern'];
  const SCHEDULE_STYLES = ['Timeline (With Icons)', 'Minimalist List', 'Grid Layout', 'None'];
  const TITLE_STYLES = ['Large & Bold', 'Elegant Calligraphy', 'Modern & Sleek', 'Classic Standard'];
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [imageCount, setImageCount] = useState<number>(0);
  const [selectedScheduleStyle, setSelectedScheduleStyle] = useState<string>('Timeline (With Icons)');
  const [selectedTitleStyle, setSelectedTitleStyle] = useState<string>('Elegant Calligraphy');
  const [additionalPrompt, setAdditionalPrompt] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [prompt, setPrompt] = useState('Wedding Invitation for Aisha & Ibrahim. Luxe gold style, elegant fonts, names at the top. Date: Saturday 15 July 2026 at Central Mosque Hall, Abuja.');
  const [dynamicDimensions, setDynamicDimensions] = useState({ width: 1024, height: 1365 });
  const [dimension, setDimension] = useState<'portrait' | 'landscape' | 'square'>('portrait');
  
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  // Initialize Fabric Canvas once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      allowTouchScrolling: true,
    });
    
    setCanvasInstance(canvas);

    canvas.on('object:modified', (e) => {
      console.log('object:modified', e.target);
    });

    return () => {
      canvas.dispose();
      setCanvasInstance(null);
    };
  }, [currentView]);

  // Handle Resize and Scaling when dimensions or container changes
  useEffect(() => {
    if (!canvasInstance || !containerRef.current) return;
    const canvas = canvasInstance;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!entries[0]) return;
      
      const { width } = entries[0].contentRect;
      if (width <= 0) return;

      const designWidth = dynamicDimensions.width || 1024;
      const designHeight = dynamicDimensions.height || 1365;
      const scale = width / designWidth;

      canvas.setDimensions({ 
        width: width, 
        height: width * (designHeight / designWidth) 
      });
      canvas.setZoom(scale);
      canvas.requestRenderAll();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    
    // Trigger initial resize
    const rect = containerRef.current.getBoundingClientRect();
    handleResize([{ contentRect: rect } as ResizeObserverEntry]);

    return () => {
      observer.disconnect();
    };
  }, [dynamicDimensions, canvasInstance]);

  // Helper to load background image onto canvas
  const loadBackgroundImage = (source: string | File) => {
    if (!canvasInstance) return;
    const canvas = canvasInstance;
    
    if (source instanceof File) {
      const reader = new FileReader();
      reader.readAsDataURL(source);
      reader.onload = (e) => {
        fabric.FabricImage.fromURL(e.target?.result as string, { crossOrigin: 'anonymous' }).then((img) => {
          const imgWidth = img.width || 1024;
          const imgHeight = img.height || 1024;
          
          setDynamicDimensions({ width: imgWidth, height: imgHeight });
          
          img.set({
            originX: 'left',
            originY: 'top',
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1,
            selectable: false,
            evented: false,
            type: 'image'
          });
                  
          canvas.set({ backgroundImage: img });
          canvas.requestRenderAll();
        });
      };
    } else {
      fabric.FabricImage.fromURL(source, { crossOrigin: 'anonymous' }).then((img) => {
        const imgWidth = img.width || 1024;
        const imgHeight = img.height || 1024;
        
        setDynamicDimensions({ width: imgWidth, height: imgHeight });

        img.set({
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          scaleX: 1,
          scaleY: 1,
          selectable: false,
          evented: false,
          type: 'image'
        });

        canvas.set({ backgroundImage: img });
        canvas.requestRenderAll();
      });
    };
  };

  // Immediate preview when file changes
  useEffect(() => {
    if (file && canvasInstance) {
      loadBackgroundImage(file);
    }
  }, [file, canvasInstance]);

  // Update Canvas when result changes
  useEffect(() => {
    if (!result || !canvasInstance) return;

    const canvas = canvasInstance;
    // canvas.clear();
    canvas.getObjects().forEach((obj) => {
      canvas.remove(obj);
    });

    // Load background from result if available
    if (result.background) {
      loadBackgroundImage(result.background);
    } else if (imageUrl) {
      loadBackgroundImage(imageUrl);
    }

    if (result.layout?.blocks) {
      result.layout.blocks.forEach((block: any) => {
        const type = block.type ? block.type.toLowerCase() : '';
        const commonProps = {
          left: block.left || block.x,
          top: block.top || block.y,
          fill: block.fill || block.color || '#000000',
          stroke: block.stroke,
          strokeWidth: block.strokeWidth || 0,
          originX: block.origin?.x || block.originX || 'center',
          originY: block.origin?.y || block.originY || 'center',
          width: block.width,
          height: block.height,
          opacity: block.opacity !== undefined ? block.opacity : 1,
        };

        if (type === 'rect') {
          canvas.add(new fabric.Rect({
            ...commonProps,
            rx: block.rx || 0,
            ry: block.ry || 0,
          }));
        } else if (type === 'image' || type === 'image_placeholder') {
          canvas.add(new fabric.Rect({
            ...commonProps,
            width: block.width || 250,
            height: block.height || 250,
            fill: block.fill || '#f3f4f6',
            stroke: block.stroke || '#9ca3af',
            strokeWidth: block.strokeWidth || 2,
            strokeDashArray: [5, 5],
            rx: block.rx || 16,
            ry: block.ry || 16,
          }));
        } else if (type === 'circle') {
          canvas.add(new fabric.Circle({
            ...commonProps,
            radius: block.radius || (block.width ? block.width / 2 : 50),
          }));
        } else if (type === 'line' || type === 'divider') {
          const x2 = block.width ? block.x + block.width : block.x + 100;
          const y2 = block.height ? block.y + block.height : block.y;
          canvas.add(new fabric.Line([block.x, block.y, x2, y2], {
            ...commonProps,
            stroke: block.stroke || block.fill || block.color || '#000000',
            strokeWidth: block.strokeWidth || block.height || 2,
          }));
        } else if (type === 'i-text' || type === 'text' || block.text || block.content || block.lines) {
          canvas.add(new fabric.Textbox(block.text || block.content || '', {
            ...commonProps,
            fontSize: block.fontSize || 32,
            fontFamily: block.fontFamily || 'Arial',
            textAlign: block.alignment || 'center',
            width: block.width || 300,
            splitByGrapheme: false,
          }));
        }
      });
    }

    // Helper: load SVG from URL and add to canvas
    const loadSVGAsset = (url: string, posConfig: any) => {
      fetch(url)
        .then(r => r.text())
        .then(async (svgString) => {
          try {
            const { objects, options } = await fabric.loadSVGFromString(svgString);
            if (!objects || objects.length === 0) return;
            const group = fabric.util.groupSVGElements(objects, options);
            
            const targetSize = posConfig.targetSize || 120;
            const scaleFactor = targetSize / Math.max(group.width || 100, group.height || 100);
            group.scale(scaleFactor);
            
            group.set({
              left: posConfig.left,
              top: posConfig.top,
              originX: posConfig.originX || 'center',
              originY: posConfig.originY || 'center',
            });
            
            canvas.add(group);
            canvas.requestRenderAll();
          } catch (err) {
            console.warn('Failed to load SVG asset:', err);
          }
        })
        .catch(err => console.warn('Failed to fetch SVG:', err));
    };

    const designW = dynamicDimensions.width || 1024;
    const designH = dynamicDimensions.height || 1024;

    // Load sticker assets (decorative corners)
    if (result.assets?.stickers?.length > 0) {
      const cornerPositions = [
        { left: 60, top: 60, originX: 'left', originY: 'top', targetSize: designW * 0.15 },
        { left: designW - 60, top: 60, originX: 'right', originY: 'top', targetSize: designW * 0.15 },
        { left: 60, top: designH - 60, originX: 'left', originY: 'bottom', targetSize: designW * 0.15 },
        { left: designW - 60, top: designH - 60, originX: 'right', originY: 'bottom', targetSize: designW * 0.15 },
      ];

      const freeStickers = result.assets.stickers.filter((s: any) => s.license !== 'premium');
      freeStickers.slice(0, 4).forEach((sticker: any, idx: number) => {
        loadSVGAsset(sticker.url, cornerPositions[idx % cornerPositions.length]);
      });
    }

    // Load divider assets (placed horizontally between sections)
    if (result.assets?.dividers?.length > 0) {
      const freeDividers = result.assets.dividers.filter((s: any) => s.license !== 'premium');
      if (freeDividers.length > 0) {
        const divider = freeDividers[0];
        loadSVGAsset(divider.url, {
          left: designW / 2,
          top: designH * 0.55,
          originX: 'center',
          originY: 'center',
          targetSize: designW * 0.5,
        });
      }
    }

    if (containerRef.current) {
      const scaleFactor = containerRef.current.clientWidth / dynamicDimensions.width;
      canvas.setZoom(scaleFactor);
      canvas.setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientWidth * (dynamicDimensions.height / dynamicDimensions.width)
      });
    }
    
    canvas.requestRenderAll();
  }, [result, canvasInstance]);

  const handleGenerate = async (overridePrompt?: string, overrideType?: string) => {
    const currentPrompt = overridePrompt || prompt;
    const currentType = overrideType || (selectedCategory ? selectedCategory.id : 'custom');

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('type', currentType);
      formData.append('prompt', currentPrompt);
      formData.append('dimension', dimension);

      if (file) {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        formData.append('backgroundImage', compressedFile, file.name);
      }

      const response = await fetch('/api/generate-invitation', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to generate invitation');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setCurrentView('setup');
    if (category.styles && category.styles.length > 0) {
      setSelectedStyle(category.styles[0]);
    } else {
      setSelectedStyle('Elegant Luxury');
    }
    
    if (category.formats && category.formats.length > 0) {
      setSelectedFormat(category.formats[0]);
    } else {
      setSelectedFormat('');
    }
    
    setImageCount(0);
    setSelectedScheduleStyle('None');
    setSelectedTitleStyle('Elegant Calligraphy');
    setAdditionalPrompt('');
    
    // Clear previous
    setFile(null);
    setImageUrl(null);
    setResult(null);
  };

  const handleProceed = async () => {
    const formatText = selectedFormat ? `Tradition/Format: ${selectedFormat}. ` : '';
    const imagesText = imageCount > 0 ? `Please include ${imageCount} image placeholder(s) for photos in the layout (use type: 'image_placeholder'). ` : '';
    const scheduleText = selectedScheduleStyle !== 'None' ? `Schedule Layout: ${selectedScheduleStyle}. ` : '';
    const titleText = selectedTitleStyle ? `Title Style: ${selectedTitleStyle}. ` : '';
    const additionalText = additionalPrompt.trim() ? `Additional details: ${additionalPrompt.trim()}. ` : '';
    const designPrompt = `${selectedCategory.title} Invitation. ${formatText}Style: ${selectedStyle}. ${titleText}${scheduleText}${imagesText}${additionalText}Please include elegant typography, relevant dates, names, and venue details appropriately.`;
    setPrompt(designPrompt);
    setCurrentView('editor');
    await handleGenerate(designPrompt, selectedCategory.id);
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  const handleDownloadJSON = () => {
    if (!canvasInstance || !result) return;
    
    const canvas = canvasInstance;
    
    // Explicitly include backgroundImage and its properties
    const json: any = canvas.toJSON();
    
    // Augment with dimension metadata as requested in sample.json
    json.dimension = {
      width: result.dimensions?.width || 1024,
      height: result.dimensions?.height || 1024
    };

    //lowercase the objects type for fabric.js v5 recursively
    const lowerCaseType = (obj: any) => {
      if (obj.type) obj.type = obj.type.toLowerCase();
      if (obj.objects) obj.objects.forEach(lowerCaseType);
      if (obj.clipPath) lowerCaseType(obj.clipPath);
    };
    json.objects.forEach(lowerCaseType);
    if(json.backgroundImage){
      lowerCaseType(json.backgroundImage);
      if (canvas.backgroundImage && typeof (canvas.backgroundImage as any).toDataURL === 'function') {
        try {
          json.backgroundImage.src = (canvas.backgroundImage as any).toDataURL({ format: 'png' });
        } catch (err) {
          console.error("Failed to convert background image to base64", err);
        }
      }
    }

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitation_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSVG = () => {
    if (!canvasInstance) return;
    const svg = canvasInstance.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitation_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] font-sans">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span className="font-semibold tracking-tight text-xl">Architect AI</span>
          </div>

          <div className="flex items-center gap-4">
            {currentView === 'editor' && (
              <>
                <button 
                  onClick={handleBackToCategories}
                  className="flex items-center gap-2 bg-white border border-black/5 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-50 transition-all mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Categories</span>
                </button>
                <button 
                  onClick={() => setShowLibrary(true)}
                  className="flex items-center gap-2 bg-white border border-black/5 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-50 transition-all"
                >
                  <Library className="w-4 h-4 text-amber-600" />
                  <span>Library</span>
                </button>
                <label className="flex items-center gap-2 cursor-pointer bg-white border border-black/5 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-50 transition-all">
                  <ImageIcon className="w-4 h-4 text-zinc-400" />
                  <span className="max-w-[100px] truncate">{file ? file.name : 'Upload'}</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => { setFile(e.target.files?.[0] || null); setImageUrl(null); }}
                  />
                </label>
                <button 
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {file ? (result ? 'Update Design' : 'Generate with BG') : 'Randomize Design'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'categories' ? (
          <div className="space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 max-w-2xl mx-auto pt-12">
              <h1 className="text-6xl font-medium tracking-tighter leading-[0.9]">
                Choose a <br />
                <span className="text-amber-600 italic font-serif">Category</span>
              </h1>
              <p className="text-zinc-500 text-lg">Let AI generate the perfect background, layout, and text for your event. Just select a style to begin.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {DESIGN_CATEGORIES.map((cat, idx) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleCategorySelect(cat)}
                  className="group flex flex-col items-center p-8 bg-white rounded-3xl border border-black/5 hover:border-amber-600/30 hover:shadow-xl transition-all text-center"
                >
                  <div className={`w-20 h-20 flex items-center justify-center rounded-2xl text-4xl mb-6 ${cat.color} border transition-transform group-hover:scale-110`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-800 mb-2">{cat.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">{cat.prompt}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : currentView === 'setup' && selectedCategory ? (
          <div className="max-w-2xl mx-auto pt-12 space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-2xl text-4xl mb-6 border bg-white shadow-sm">
                {selectedCategory.icon}
              </div>
              <h1 className="text-5xl font-medium tracking-tighter leading-[0.9]">
                Setting up <br />
                <span className="text-amber-600 italic font-serif">{selectedCategory.title}</span>
              </h1>
              <p className="text-zinc-500 text-lg">Choose a style and dimension to get started.</p>
            </motion.div>

            <div className="space-y-8 bg-white p-8 rounded-3xl border border-black/5 shadow-xl">
              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Select Style</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(selectedCategory?.styles || STYLES).map((style: string) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-4 py-3 text-sm font-semibold rounded-2xl transition-all border ${selectedStyle === style ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20' : 'bg-zinc-50 text-zinc-600 border-black/5 hover:border-amber-600/30'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Select Dimension</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['portrait', 'landscape', 'square'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDimension(d)}
                      className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded-2xl transition-all border ${dimension === d ? 'bg-zinc-800 text-white border-zinc-800 shadow-md' : 'bg-zinc-50 text-zinc-600 border-black/5 hover:border-zinc-800/30'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedCategory?.formats && selectedCategory.formats.length > 0 && (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Select Format / Tradition</label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCategory.formats.map((format: string) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`px-4 py-3 text-sm font-semibold rounded-2xl transition-all border ${selectedFormat === format ? 'bg-zinc-800 text-white border-zinc-800 shadow-md' : 'bg-zinc-50 text-zinc-600 border-black/5 hover:border-zinc-800/30'}`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Title Style</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TITLE_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedTitleStyle(style)}
                      className={`px-4 py-3 text-sm font-semibold rounded-2xl transition-all border ${selectedTitleStyle === style ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20' : 'bg-zinc-50 text-zinc-600 border-black/5 hover:border-amber-600/30'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Schedule Layout</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SCHEDULE_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedScheduleStyle(style)}
                      className={`px-4 py-3 text-sm font-semibold rounded-2xl transition-all border ${selectedScheduleStyle === style ? 'bg-zinc-800 text-white border-zinc-800 shadow-md' : 'bg-zinc-50 text-zinc-600 border-black/5 hover:border-zinc-800/30'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Image Placeholders (Photos)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map(count => (
                    <button
                      key={count}
                      onClick={() => setImageCount(count)}
                      className={`px-4 py-3 text-sm font-semibold rounded-2xl transition-all border ${imageCount === count ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20' : 'bg-zinc-50 text-zinc-600 border-black/5 hover:border-amber-600/30'}`}
                    >
                      {count === 0 ? 'None' : `${count} Image${count > 1 ? 's' : ''}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Additional Instructions</label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="e.g. Names: Aisha & Ibrahim. Date: Saturday 15 July 2026. Venue: Central Mosque Hall, Abuja. Use gold and white colors."
                className="w-full p-4 border border-black/10 rounded-2xl text-sm text-zinc-700 bg-zinc-50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600/50 transition-all placeholder:text-zinc-400"
                rows={3}
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleProceed}
                className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Wand2 className="w-5 h-5" />
                Generate Invitation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Info & Controls */}
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tighter leading-[0.9]">
                  {selectedCategory ? selectedCategory.title : 'AI Invitation'} <br />
                  <span className="text-amber-600 italic font-serif">Architect</span>
                </h1>
              </motion.div>

              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2 text-zinc-600">
                  <Sparkles className="w-4 h-4" /> Design Instructions
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-40 p-4 bg-white rounded-2xl border border-black/5 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all text-sm"
                  placeholder="Describe your invitation..."
                />
              </div>

              {result?.designSuggestions && (
                <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs text-zinc-400 font-medium uppercase">Palette</span>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full border border-black/5" style={{ backgroundColor: result.designSuggestions.primaryColor }} />
                      <div className="w-8 h-8 rounded-full border border-black/5" style={{ backgroundColor: result.designSuggestions.accentColor }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400 font-medium uppercase">Fonts</span>
                    <p className="text-xs font-semibold">{result.designSuggestions.titleFont}</p>
                  </div>
                </div>
              )}

              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
            </div>

            {/* Right: Interactive Canvas Area */}
            <div className="space-y-4">
              <div 
                ref={containerRef}
                className="relative bg-zinc-100 rounded-3xl border border-black/5 shadow-2xl overflow-hidden flex items-center justify-center mx-auto"
                style={{ 
                  aspectRatio: `${dynamicDimensions.width} / ${dynamicDimensions.height}`,
                  maxHeight: '75vh',
                  width: '100%'
                }}
              >
                <canvas ref={canvasRef} className="absolute inset-0" />
                
                {!result && !loading && (
                  <div className="text-center pointer-events-none z-0">
                    <p className="text-zinc-400 font-medium">Click generate to start designing</p>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                    <p className="text-amber-600 font-bold uppercase tracking-widest text-[10px]">Architect is generating layout & background...</p>
                  </div>
                )}
              </div>

              {result && (
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={handleDownloadJSON}
                    className="bg-white border border-black/5 text-black px-6 py-2 rounded-full font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm"
                  >
                    <FileJson className="w-4 h-4 text-amber-600" />
                    Save JSON
                  </button>
                  <button 
                    onClick={handleDownloadSVG}
                    className="bg-black text-white px-6 py-2 rounded-full font-semibold shadow-sm hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Save SVG
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showLibrary && (
          <BackgroundLibrary 
            onClose={() => setShowLibrary(false)} 
            onSelect={(selectedFile, url) => {
              setFile(selectedFile);
              setImageUrl(url);
              setShowLibrary(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
