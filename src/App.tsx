import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, scale } from 'motion/react';
import { Sparkles, Image as ImageIcon, Layout, Download, Loader2, Palette, Type, FileJson, Library, X, ChevronRight, ChevronLeft } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import * as fabric from 'fabric';

const API_BASE = 'https://api.inhoto.com';

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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [prompt, setPrompt] = useState('Wedding Invitation for Aisha & Ibrahim. Luxe gold style, elegant fonts, names at the top. Date: Saturday 15 July 2026 at Central Mosque Hall, Abuja.');
  const [dynamicDimensions, setDynamicDimensions] = useState({ width: 1024, height: 1365 });
  
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
  }, []);

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
  }, [dynamicDimensions]);

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
    // if (result.background) {
    //   loadBackgroundImage(result.background);
    // }
    if (imageUrl) {
      loadBackgroundImage(imageUrl);
    }

    if (result.layout?.blocks) {
      result.layout.blocks.forEach((block: any) => {
        if (block.type === 'divider') {
          const line = new fabric.Line([block.x, block.y, block.x + block.width, block.y], {
            stroke: block.color,
            strokeWidth: block.height,
            originX: block.origin?.x || 'center',
            originY: block.origin?.y || 'center',
          });
          canvas.add(line);
          return;
        }
        if (block.text || block.content || block.lines) {
          const text = new fabric.Textbox(block.text || block.content, {
            left: block.x,
            top: block.y,
            fontSize: block.fontSize,
            fontFamily: block.fontFamily,
            fill: block.color,
            textAlign: block.alignment || 'center',
            originX: block.origin?.x || 'center',
            originY: block.origin?.y || 'center',
            width: block.width || 300,
            splitByGrapheme: false,
          });
          canvas.add(text);
        }
      });
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

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('type', 'wedding');
      formData.append('prompt', prompt);

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



    //lowercase the objects type for fabric.js v5
    json.objects.forEach((obj: any) => {
      obj.type = obj.type.toLowerCase();
    });
    if(json.backgroundImage){
      json.backgroundImage.type = json.backgroundImage.type.toLowerCase();
    }

    // Ensure backgroundImage has the src for restoration
    // if (canvas.backgroundImage && canvas.backgroundImage instanceof fabric.FabricImage) {
    //   json.backgroundImage = canvas.backgroundImage.toObject();
    // }

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
              onClick={handleGenerate}
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {file ? (result ? 'Update Design' : 'Generate with BG') : 'Generate Sample'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info & Controls */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h1 className="text-6xl font-medium tracking-tighter leading-[0.9]">
                AI Invitation <br />
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
                  <p className="text-amber-600 font-bold uppercase tracking-widest text-[10px]">Architect is thinking...</p>
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
