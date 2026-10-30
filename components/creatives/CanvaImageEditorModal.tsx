import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Save, Plus, Trash2, Copy, Type, Sparkles, 
  Move, Layers, AlignLeft, AlignCenter, AlignRight, Bold, 
  Italic, Palette, RotateCcw, Check, ChevronUp, ChevronDown, 
  Pencil, Eye, Layout, ShieldAlert, Zap, MessageSquare,
  RefreshCw, Loader2, ImageIcon, Smile, RotateCw,
  Sun, Contrast, Droplet, Sliders
} from 'lucide-react';
import { Creative, Language } from '../../types';
import { imageUrlToBase64 } from '../../services/aiCore';

export interface TextLayer {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontFamily: string;
  fontSize: number; // in px for canvas/preview
  color: string;
  bgColor: string;
  bgOpacity: number; // 0-1
  bgPadding: number; // px
  borderRadius: number; // px
  fontWeight: 'normal' | 'bold' | '900';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  uppercase: boolean;
  shadow: boolean;
  shadowColor: string;
  widthPercent: number; // max width % (e.g. 90)
  rotation?: number; // angle in degrees
}

interface CanvaImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creative: Creative;
  language: Language;
  onSaveToCreative: (creativeId: string, newImageUrl: string, targetIndex?: number) => void;
  handleDownloadImage: (url: string, filename: string) => void;
  onGenerateImage?: (id: string, prompt: string, base: string | string[] | undefined, comp: string | string[], style?: string) => void;
  onRefreshText?: (id: string, style: Creative['style']) => void;
  globalBaseImages?: string[];
  globalShotType?: string | string[];
  isImgLoading?: boolean;
  isTextLoading?: boolean;
}

export interface GoogleFontItem {
  name: string;
  family: string;
  category: string;
}

export const GOOGLE_FONTS: GoogleFontItem[] = [
  // 📱 Impacto & Poster Instagram
  { name: 'Bebas Neue', family: 'Bebas+Neue', category: '📱 Impacto & Poster Instagram' },
  { name: 'Anton', family: 'Anton', category: '📱 Impacto & Poster Instagram' },
  { name: 'Archivo Black', family: 'Archivo+Black', category: '📱 Impacto & Poster Instagram' },
  { name: 'Oswald', family: 'Oswald:wght@500;700;900', category: '📱 Impacto & Poster Instagram' },
  { name: 'Dela Gothic One', family: 'Dela+Gothic+One', category: '📱 Impacto & Poster Instagram' },
  { name: 'Lilita One', family: 'Lilita+One', category: '📱 Impacto & Poster Instagram' },
  { name: 'Alfa Slab One', family: 'Alfa+Slab+One', category: '📱 Impacto & Poster Instagram' },
  { name: 'Bungee', family: 'Bungee', category: '📱 Impacto & Poster Instagram' },
  { name: 'Teko', family: 'Teko:wght@600;700', category: '📱 Impacto & Poster Instagram' },
  { name: 'Rubik Mono One', family: 'Rubik+Mono+One', category: '📱 Impacto & Poster Instagram' },
  { name: 'Roboto Condensed', family: 'Roboto+Condensed:wght@700;900', category: '📱 Impacto & Poster Instagram' },
  { name: 'Black Ops One', family: 'Black+Ops+One', category: '📱 Impacto & Poster Instagram' },

  // ✨ Luxo, Editorial & Moda
  { name: 'Abril Fatface', family: 'Abril+Fatface', category: '✨ Luxo, Editorial & Moda' },
  { name: 'Playfair Display', family: 'Playfair+Display:ital,wght@0,700;1,700', category: '✨ Luxo, Editorial & Moda' },
  { name: 'Cinzel', family: 'Cinzel:wght@700;900', category: '✨ Luxo, Editorial & Moda' },
  { name: 'Syne', family: 'Syne:wght@700;800', category: '✨ Luxo, Editorial & Moda' },
  { name: 'Bodoni Moda', family: 'Bodoni+Moda:ital,opsz,wght@0,6..96,700;1,6..96,700', category: '✨ Luxo, Editorial & Moda' },
  { name: 'Cormorant Garamond', family: 'Cormorant+Garamond:ital,wght@0,700;1,700', category: '✨ Luxo, Editorial & Moda' },
  { name: 'Prata', family: 'Prata', category: '✨ Luxo, Editorial & Moda' },

  // 🚀 Trends & Criativos Instagram
  { name: 'Shrikhand', family: 'Shrikhand', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Unbounded', family: 'Unbounded:wght@700;900', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Righteous', family: 'Righteous', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Space Grotesk', family: 'Space+Grotesk:wght@700', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Montserrat', family: 'Montserrat:wght@400;700;900', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Poppins', family: 'Poppins:wght@400;600;800', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Plus Jakarta Sans', family: 'Plus+Jakarta+Sans:wght@700;800', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Outfit', family: 'Outfit:wght@700;900', category: '🚀 Trends & Criativos Instagram' },
  { name: 'Inter', family: 'Inter:wght@400;700;900', category: '🚀 Trends & Criativos Instagram' },

  // ✍️ Marcador, Caligrafia & Stories
  { name: 'Permanent Marker', family: 'Permanent+Marker', category: '✍️ Marcador, Caligrafia & Stories' },
  { name: 'Caveat', family: 'Caveat:wght@700', category: '✍️ Marcador, Caligrafia & Stories' },
  { name: 'Pacifico', family: 'Pacifico', category: '✍️ Marcador, Caligrafia & Stories' },
  { name: 'Lobster', family: 'Lobster', category: '✍️ Marcador, Caligrafia & Stories' },
  { name: 'Satisfy', family: 'Satisfy', category: '✍️ Marcador, Caligrafia & Stories' },
  { name: 'Kalam', family: 'Kalam:wght@700', category: '✍️ Marcador, Caligrafia & Stories' },
  { name: 'Dancing Script', family: 'Dancing+Script:wght@700', category: '✍️ Marcador, Caligrafia & Stories' },
];

export const loadGoogleFont = (fontName: string) => {
  const fontObj = GOOGLE_FONTS.find(f => f.name === fontName);
  if (!fontObj) return;
  const linkId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontObj.family}&display=swap`;
    document.head.appendChild(link);
  }
};

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#FACC15', '#EF4444', 
  '#10B981', '#3B82F6', '#6366F1', '#EC4899', 
  '#8B5CF6', '#F97316', '#1E293B', '#111827'
];

export const CanvaImageEditorModal: React.FC<CanvaImageEditorModalProps> = ({
  isOpen,
  onClose,
  creative,
  language,
  onSaveToCreative,
  handleDownloadImage,
  onGenerateImage,
  onRefreshText,
  globalBaseImages,
  globalShotType,
  isImgLoading,
  isTextLoading
}) => {
  if (!isOpen) return null;

  const activeIndex = creative.activeImageIndex || 0;
  const urlsList = creative.imageUrls && creative.imageUrls.length > 0 ? creative.imageUrls : [creative.imageUrl];
  const bgImageUrl = urlsList[activeIndex] || creative.imageUrl || '';

  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; layerX: number; layerY: number } | null>(null);

  // Background Image Scale, Offset, Rotation & Filters (Brightness, Contrast, Saturation)
  const [bgScale, setBgScale] = useState<number>(1);
  const [bgOffsetX, setBgOffsetX] = useState<number>(0);
  const [bgOffsetY, setBgOffsetY] = useState<number>(0);
  const [bgRotation, setBgRotation] = useState<number>(0);
  const [bgBrightness, setBgBrightness] = useState<number>(100);
  const [bgContrast, setBgContrast] = useState<number>(100);
  const [bgSaturation, setBgSaturation] = useState<number>(100);

  // Resizing layer state (width or font size)
  const [resizingLayer, setResizingLayer] = useState<{
    layerId: string;
    type: 'width' | 'fontSize';
    startX: number;
    startY: number;
    initialWidthPercent: number;
    initialFontSize: number;
  } | null>(null);

  const [promptText, setPromptText] = useState(() => creative.visualPrompt || '');

  const [negativeSpacePos, setNegativeSpacePos] = useState<'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center'>('auto');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const POPULAR_EMOJIS = [
    '🔥', '⚡', '🚀', '💥', '🎯', '✨', 
    '💰', '🎁', '⭐', '📌', '✅', '💡', 
    '🚨', '🛒', '🏷️', '📢', '🏆', '💎', 
    '⏳', '👇', '👉', '💯', '👑', '😱',
    '🌟', '📈', '🤩', '❤️', '👀', '🟢'
  ];

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectedLayerEditorRef = useRef<HTMLDivElement>(null);

  const prevHeadlineRef = useRef(creative.headline);

  useEffect(() => {
    setPromptText(creative.visualPrompt || '');
  }, [creative.id, creative.visualPrompt]);

  // Smooth scroll to selected layer editor when layer is selected
  useEffect(() => {
    if (selectedLayerId && selectedLayerEditorRef.current) {
      selectedLayerEditorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedLayerId]);

  const handleTriggerTextRefresh = () => {
    if (onRefreshText && creative) {
      onRefreshText(creative.id, creative.style);
    }
  };

  // Window level mouse drag listener for smooth, non-stretching dragging
  useEffect(() => {
    if (!draggedLayerId || !dragStartPos.current) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!dragStartPos.current || !previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const deltaXPixels = e.clientX - dragStartPos.current.x;
      const deltaYPixels = e.clientY - dragStartPos.current.y;

      const deltaXPercent = (deltaXPixels / rect.width) * 100;
      const deltaYPercent = (deltaYPixels / rect.height) * 100;

      const newX = Math.max(0, Math.min(100, dragStartPos.current.layerX + deltaXPercent));
      const newY = Math.max(0, Math.min(100, dragStartPos.current.layerY + deltaYPercent));

      const precisionX = Number(newX.toFixed(2));
      const precisionY = Number(newY.toFixed(2));

      setLayers(prev => prev.map(l => l.id === draggedLayerId ? { ...l, x: precisionX, y: precisionY } : l));
    };

    const handleWindowMouseUp = () => {
      setDraggedLayerId(null);
      dragStartPos.current = null;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggedLayerId]);

  // Window level resize listener for text box width and font size
  useEffect(() => {
    if (!resizingLayer || !previewContainerRef.current) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const rect = previewContainerRef.current?.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;

      if (resizingLayer.type === 'width') {
        const deltaXPixels = e.clientX - resizingLayer.startX;
        const deltaPercent = (deltaXPixels / rect.width) * 100 * 2; // scale factor
        const newWidth = Math.max(20, Math.min(100, Math.round(resizingLayer.initialWidthPercent + deltaPercent)));
        setLayers(prev => prev.map(l => l.id === resizingLayer.layerId ? { ...l, widthPercent: newWidth } : l));
      } else if (resizingLayer.type === 'fontSize') {
        const deltaYPixels = e.clientY - resizingLayer.startY;
        const newSize = Math.max(12, Math.min(100, Math.round(resizingLayer.initialFontSize + deltaYPixels * 0.4)));
        setLayers(prev => prev.map(l => l.id === resizingLayer.layerId ? { ...l, fontSize: newSize } : l));
      }
    };

    const handleWindowMouseUp = () => {
      setResizingLayer(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [resizingLayer]);

  // Keyboard shortcut listener to delete selected text layer on Delete / Backspace key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLayerId) return;
      const activeEl = document.activeElement;
      const isEditingInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isEditingInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteLayer(selectedLayerId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId]);

  const handleTriggerImageRefresh = () => {
    if (!onGenerateImage) return;

    let spaceInstruction = "";
    switch (negativeSpacePos) {
      case 'top':
        spaceInstruction = " IMPORTANT COMPOSITION REQUIREMENT: Create generous, clean, uncluttered negative space / copy space at the TOP of the image specifically intended for high-contrast text overlay.";
        break;
      case 'bottom':
        spaceInstruction = " IMPORTANT COMPOSITION REQUIREMENT: Create generous, clean, uncluttered negative space / copy space at the BOTTOM of the image specifically intended for text overlay.";
        break;
      case 'left':
        spaceInstruction = " IMPORTANT COMPOSITION REQUIREMENT: Position the main subject on the right, leaving clean negative space / copy space on the LEFT side specifically for text overlay.";
        break;
      case 'right':
        spaceInstruction = " IMPORTANT COMPOSITION REQUIREMENT: Position the main subject on the left, leaving clean negative space / copy space on the RIGHT side specifically for text overlay.";
        break;
      case 'center':
        spaceInstruction = " IMPORTANT COMPOSITION REQUIREMENT: Create a smooth, minimalist aesthetic background with clean contrast specifically designed to overlay text headlines.";
        break;
      case 'auto':
      default:
        spaceInstruction = " IMPORTANT COMPOSITION REQUIREMENT: Leave clean, uncluttered negative space / copy space at the most aesthetically optimal area in the image (top, bottom, or sides), designed specifically for overlaying bold text headlines clearly without obstructing the main product/subject.";
        break;
    }

    const basePrompt = promptText.trim() || creative.visualPrompt || 'Anúncio de alta conversão';
    const finalPrompt = basePrompt + spaceInstruction;

    const creativeBase = creative.selectedBaseImages !== undefined
      ? creative.selectedBaseImages 
      : (creative.selectedBaseImage !== undefined ? (creative.selectedBaseImage ? [creative.selectedBaseImage] : []) : (globalBaseImages || []));
    onGenerateImage(creative.id, finalPrompt, creativeBase, globalShotType || 'Close-up', creative.style);
  };

  // Load all google fonts on mount
  useEffect(() => {
    GOOGLE_FONTS.forEach(f => loadGoogleFont(f.name));
  }, []);

  // Initialize text layers based on direct response copy
  useEffect(() => {
    if (creative) {
      const initialLayers: TextLayer[] = [];

      // Layer 1: Hook / Headline Top Banner
      const hookText = creative.headline || creative.hook || 'ATENÇÃO: O SEGREDO REVELADO';
      initialLayers.push({
        id: 'layer-1',
        text: hookText,
        x: 50,
        y: 12,
        fontFamily: 'Montserrat',
        fontSize: 26,
        color: '#000000',
        bgColor: '#FACC15',
        bgOpacity: 0.95,
        bgPadding: 12,
        borderRadius: 12,
        fontWeight: '900',
        fontStyle: 'normal',
        textAlign: 'center',
        uppercase: true,
        shadow: false,
        shadowColor: '#000000',
        widthPercent: 90
      });

      // Layer 2: Subheadline / Value prop bottom
      if (creative.subheadline || creative.caption) {
        const subText = creative.subheadline || creative.caption?.slice(0, 80) || '';
        initialLayers.push({
          id: 'layer-2',
          text: subText,
          x: 50,
          y: 75,
          fontFamily: 'Inter',
          fontSize: 18,
          color: '#FFFFFF',
          bgColor: '#000000',
          bgOpacity: 0.85,
          bgPadding: 10,
          borderRadius: 10,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          uppercase: false,
          shadow: true,
          shadowColor: '#000000',
          widthPercent: 90
        });
      }

      setLayers(initialLayers);
      setSelectedLayerId(initialLayers[0]?.id || null);
    }
  }, [creative.id]);

  // Sync updated text layers when AI generates new headline/subheadline
  useEffect(() => {
    if (creative.headline && creative.headline !== prevHeadlineRef.current) {
      prevHeadlineRef.current = creative.headline;
      setLayers(prev => {
        if (prev.length === 0) {
          const newLayers: TextLayer[] = [
            {
              id: 'layer-1',
              text: creative.headline || creative.hook || 'ATENÇÃO',
              x: 50, y: 12,
              fontFamily: 'Montserrat', fontSize: 26, color: '#000000',
              bgColor: '#FACC15', bgOpacity: 0.95, bgPadding: 12, borderRadius: 12,
              fontWeight: '900', fontStyle: 'normal', textAlign: 'center', uppercase: true, shadow: false, shadowColor: '#000000', widthPercent: 90
            }
          ];
          if (creative.subheadline) {
            newLayers.push({
              id: 'layer-2',
              text: creative.subheadline,
              x: 50, y: 75,
              fontFamily: 'Inter', fontSize: 18, color: '#FFFFFF',
              bgColor: '#000000', bgOpacity: 0.85, bgPadding: 10, borderRadius: 10,
              fontWeight: 'bold', fontStyle: 'normal', textAlign: 'center', uppercase: false, shadow: true, shadowColor: '#000000', widthPercent: 90
            });
          }
          return newLayers;
        }
        return prev.map((layer, idx) => {
          if (idx === 0) {
            return { ...layer, text: creative.headline || creative.hook || layer.text };
          }
          if (idx === 1 && creative.subheadline) {
            return { ...layer, text: creative.subheadline };
          }
          return layer;
        });
      });
    }
  }, [creative.headline, creative.subheadline, creative.hook]);

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

  // Add layer
  const handleAddLayer = (presetText?: string, presetStyle?: Partial<TextLayer>) => {
    const newId = `layer-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      text: presetText || 'Novo Texto Impactante',
      x: 50,
      y: 50,
      fontFamily: 'Montserrat',
      fontSize: 24,
      color: '#FFFFFF',
      bgColor: '#000000',
      bgOpacity: 0.8,
      bgPadding: 10,
      borderRadius: 8,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      uppercase: true,
      shadow: true,
      shadowColor: '#000000',
      widthPercent: 85,
      ...presetStyle
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newId);
  };

  // Update selected layer
  const updateSelectedLayer = (updates: Partial<TextLayer>) => {
    if (!selectedLayerId) return;
    setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, ...updates } : l));
  };

  // Delete layer
  const handleDeleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
    if (editingLayerId === id) {
      setEditingLayerId(null);
    }
  };

  // Duplicate layer
  const handleDuplicateLayer = (id: string) => {
    const target = layers.find(l => l.id === id);
    if (!target) return;
    const newId = `layer-${Date.now()}`;
    const dup: TextLayer = {
      ...target,
      id: newId,
      y: Math.min(target.y + 8, 90)
    };
    setLayers(prev => [...prev, dup]);
    setSelectedLayerId(newId);
  };

  // Reorder layers
  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const idx = layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    const newLayers = [...layers];
    if (direction === 'up' && idx < newLayers.length - 1) {
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx + 1];
      newLayers[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx - 1];
      newLayers[idx - 1] = temp;
    }
    setLayers(newLayers);
  };

  // Presets / Direct Response Layout Angles
  const applyPresetAngle = (preset: 'hook_yellow' | 'tweet_card' | 'badge_offer' | 'headline_box' | 'clear') => {
    if (preset === 'clear') {
      setLayers([]);
      setSelectedLayerId(null);
      return;
    }

    if (preset === 'hook_yellow') {
      setLayers([
        {
          id: `layer-${Date.now()}-1`,
          text: creative.hook || creative.headline || '🚨 ATENÇÃO: ERRO FATAL DE MARKETING',
          x: 50,
          y: 12,
          fontFamily: 'Anton',
          fontSize: 28,
          color: '#000000',
          bgColor: '#FACC15',
          bgOpacity: 1,
          bgPadding: 14,
          borderRadius: 8,
          fontWeight: '900',
          fontStyle: 'normal',
          textAlign: 'center',
          uppercase: true,
          shadow: false,
          shadowColor: '#000000',
          widthPercent: 92
        },
        {
          id: `layer-${Date.now()}-2`,
          text: creative.subheadline || 'Descubra a fórmula exata usada pelos maiores players.',
          x: 50,
          y: 76,
          fontFamily: 'Montserrat',
          fontSize: 18,
          color: '#FFFFFF',
          bgColor: '#000000',
          bgOpacity: 0.85,
          bgPadding: 10,
          borderRadius: 10,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          uppercase: false,
          shadow: true,
          shadowColor: '#000000',
          widthPercent: 90
        }
      ]);
    } else if (preset === 'tweet_card') {
      setLayers([
        {
          id: `layer-${Date.now()}-1`,
          text: `💬 "${creative.headline || creative.hook}"`,
          x: 50,
          y: 50,
          fontFamily: 'Inter',
          fontSize: 20,
          color: '#111827',
          bgColor: '#FFFFFF',
          bgOpacity: 0.95,
          bgPadding: 20,
          borderRadius: 16,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          uppercase: false,
          shadow: true,
          shadowColor: 'rgba(0,0,0,0.25)',
          widthPercent: 88
        }
      ]);
    } else if (preset === 'badge_offer') {
      setLayers([
        {
          id: `layer-${Date.now()}-1`,
          text: '🔥 OFERTA EXCLUSIVA',
          x: 25,
          y: 10,
          fontFamily: 'Bebas Neue',
          fontSize: 22,
          color: '#FFFFFF',
          bgColor: '#EF4444',
          bgOpacity: 1,
          bgPadding: 8,
          borderRadius: 20,
          fontWeight: '900',
          fontStyle: 'normal',
          textAlign: 'center',
          uppercase: true,
          shadow: false,
          shadowColor: '#000000',
          widthPercent: 45
        },
        {
          id: `layer-${Date.now()}-2`,
          text: creative.headline || 'Acelerador de Vendas Online',
          x: 50,
          y: 76,
          fontFamily: 'Montserrat',
          fontSize: 26,
          color: '#FFFFFF',
          bgColor: '#111827',
          bgOpacity: 0.9,
          bgPadding: 12,
          borderRadius: 12,
          fontWeight: '900',
          fontStyle: 'normal',
          textAlign: 'center',
          uppercase: true,
          shadow: true,
          shadowColor: '#000000',
          widthPercent: 90
        }
      ]);
    } else if (preset === 'headline_box') {
      setLayers([
        {
          id: `layer-${Date.now()}-1`,
          text: creative.headline || 'O MÉTODO DEFINITIVO',
          x: 50,
          y: 20,
          fontFamily: 'Archivo Black',
          fontSize: 32,
          color: '#FFFFFF',
          bgColor: '#6366F1',
          bgOpacity: 0.95,
          bgPadding: 16,
          borderRadius: 10,
          fontWeight: '900',
          fontStyle: 'normal',
          textAlign: 'center',
          uppercase: true,
          shadow: true,
          shadowColor: '#000000',
          widthPercent: 90
        }
      ]);
    }
  };

  // Dragging logic on preview canvas
  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    setSelectedLayerId(layerId);
    setDraggedLayerId(layerId);

    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      layerX: layer.x,
      layerY: layer.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedLayerId || !dragStartPos.current || !previewContainerRef.current) return;

    const rect = previewContainerRef.current.getBoundingClientRect();
    const deltaXPixels = e.clientX - dragStartPos.current.x;
    const deltaYPixels = e.clientY - dragStartPos.current.y;

    const deltaXPercent = (deltaXPixels / rect.width) * 100;
    const deltaYPercent = (deltaYPixels / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, Math.round(dragStartPos.current.layerX + deltaXPercent)));
    const newY = Math.max(5, Math.min(95, Math.round(dragStartPos.current.layerY + deltaYPercent)));

    setLayers(prev => prev.map(l => l.id === draggedLayerId ? { ...l, x: newX, y: newY } : l));
  };

  const handleMouseUp = () => {
    setDraggedLayerId(null);
    dragStartPos.current = null;
  };

  // Render high resolution canvas output
  const renderCanvasOutput = async (): Promise<string> => {
    let finalSrc = bgImageUrl;
    if (bgImageUrl && bgImageUrl.startsWith('http')) {
      try {
        const b64 = await imageUrlToBase64(bgImageUrl);
        if (b64) {
          finalSrc = b64;
        }
      } catch (_) {}
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!finalSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = finalSrc;

      img.onload = () => {
        const canvas = hiddenCanvasRef.current || document.createElement('canvas');
        const targetWidth = 1080;
        const targetHeight = Math.round(1080 * (img.naturalHeight / img.naturalWidth || 1.25));

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        // Draw background image with zoom scale, offset and rotation
        const scaledW = targetWidth * bgScale;
        const scaledH = targetHeight * bgScale;
        const drawX = (targetWidth - scaledW) / 2 + (bgOffsetX / 100) * targetWidth;
        const drawY = (targetHeight - scaledH) / 2 + (bgOffsetY / 100) * targetHeight;

        ctx.save();
        if (bgBrightness !== 100 || bgContrast !== 100 || bgSaturation !== 100) {
          ctx.filter = `brightness(${bgBrightness}%) contrast(${bgContrast}%) saturate(${bgSaturation}%)`;
        }
        if (bgRotation) {
          const centerX = targetWidth / 2;
          const centerY = targetHeight / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((bgRotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
        }
        ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
        ctx.restore();

        // Draw each text layer
        layers.forEach(layer => {
          loadGoogleFont(layer.fontFamily);

          const posX = (layer.x / 100) * targetWidth;
          const posY = (layer.y / 100) * targetHeight;
          const scaleFactor = targetWidth / 480; // canvas preview scale
          const fontSize = Math.round(layer.fontSize * scaleFactor);
          const padding = Math.round(layer.bgPadding * scaleFactor);
          const radius = Math.round(layer.borderRadius * scaleFactor);

          ctx.save();

          if (layer.rotation) {
            ctx.translate(posX, posY);
            ctx.rotate((layer.rotation * Math.PI) / 180);
            ctx.translate(-posX, -posY);
          }

          const fontStyle = layer.fontStyle === 'italic' ? 'italic ' : '';
          const fontWeight = layer.fontWeight === '900' ? '900 ' : (layer.fontWeight === 'bold' ? 'bold ' : '');
          ctx.font = `${fontStyle}${fontWeight}${fontSize}px "${layer.fontFamily}", sans-serif`;

          const rawText = layer.uppercase ? layer.text.toUpperCase() : layer.text;
          const maxWidth = (layer.widthPercent / 100) * targetWidth;

          // Split by explicit newlines (\n) first to preserve Enter line breaks, then wrap per paragraph
          const paragraphs = (rawText || '').split('\n');
          const lines: string[] = [];

          paragraphs.forEach(paragraph => {
            const words = paragraph.split(' ');
            let currentLine = '';

            words.forEach(word => {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            });
            if (currentLine) {
              lines.push(currentLine);
            } else if (words.length === 0 || paragraph === '') {
              lines.push('');
            }
          });
          if (lines.length === 0) lines.push('');

          const lineHeight = fontSize * 1.2;
          const totalTextHeight = lines.length * lineHeight;
          const maxLineWidth = Math.min(
            maxWidth,
            Math.max(...lines.map(l => ctx.measureText(l).width))
          );

          // Draw background box if opacity > 0
          if (layer.bgOpacity > 0 && layer.bgColor) {
            ctx.fillStyle = hexToRgba(layer.bgColor, layer.bgOpacity);
            const boxWidth = maxLineWidth + padding * 2;
            const boxHeight = totalTextHeight + padding * 1.5;

            let boxX = posX - boxWidth / 2;
            if (layer.textAlign === 'left') boxX = posX - padding;
            if (layer.textAlign === 'right') boxX = posX - boxWidth + padding;

            const boxY = posY - padding;

            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
            } else {
              ctx.rect(boxX, boxY, boxWidth, boxHeight);
            }
            ctx.fill();
          }

          // Text alignment & position
          ctx.textAlign = layer.textAlign;
          ctx.fillStyle = layer.color;

          if (layer.shadow) {
            ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = Math.round(8 * scaleFactor);
            ctx.shadowOffsetX = Math.round(2 * scaleFactor);
            ctx.shadowOffsetY = Math.round(2 * scaleFactor);
          } else {
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          lines.forEach((line, index) => {
            const lineY = posY + (index + 0.8) * lineHeight;
            ctx.fillText(line, posX, lineY);
          });

          ctx.restore();
        });

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      };

      img.onerror = () => {
        // Fallback: try loading without crossOrigin
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          try {
            const canvas = hiddenCanvasRef.current || document.createElement('canvas');
            const targetWidth = 1080;
            const targetHeight = Math.round(1080 * (fallbackImg.naturalHeight / fallbackImg.naturalWidth || 1.25));

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('No canvas context');

            const scaledW = targetWidth * bgScale;
            const scaledH = targetHeight * bgScale;
            const drawX = (targetWidth - scaledW) / 2 + (bgOffsetX / 100) * targetWidth;
            const drawY = (targetHeight - scaledH) / 2 + (bgOffsetY / 100) * targetHeight;

            ctx.save();
            if (bgBrightness !== 100 || bgContrast !== 100 || bgSaturation !== 100) {
              ctx.filter = `brightness(${bgBrightness}%) contrast(${bgContrast}%) saturate(${bgSaturation}%)`;
            }
            if (bgRotation) {
              const centerX = targetWidth / 2;
              const centerY = targetHeight / 2;
              ctx.translate(centerX, centerY);
              ctx.rotate((bgRotation * Math.PI) / 180);
              ctx.translate(-centerX, -centerY);
            }
            ctx.drawImage(fallbackImg, drawX, drawY, scaledW, scaledH);
            ctx.restore();

            // Draw each text layer
            layers.forEach(layer => {
              loadGoogleFont(layer.fontFamily);

              const posX = (layer.x / 100) * targetWidth;
              const posY = (layer.y / 100) * targetHeight;
              const scaleFactor = targetWidth / 480;
              const fontSize = Math.round(layer.fontSize * scaleFactor);
              const padding = Math.round(layer.bgPadding * scaleFactor);
              const radius = Math.round(layer.borderRadius * scaleFactor);

              ctx.save();

              const rawText = layer.uppercase ? layer.text.toUpperCase() : layer.text;
              const maxWidth = (layer.widthPercent / 100) * targetWidth;

              const paragraphs = (rawText || '').split('\n');
              const lines: string[] = [];

              paragraphs.forEach(paragraph => {
                const words = paragraph.split(' ');
                let currentLine = '';

                words.forEach(word => {
                  const testLine = currentLine ? `${currentLine} ${word}` : word;
                  const metrics = ctx.measureText(testLine);
                  if (metrics.width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                  } else {
                    currentLine = testLine;
                  }
                });
                if (currentLine) {
                  lines.push(currentLine);
                } else if (words.length === 0 || paragraph === '') {
                  lines.push('');
                }
              });
              if (lines.length === 0) lines.push('');

              const lineHeight = fontSize * 1.2;
              const totalTextHeight = lines.length * lineHeight;

              if (layer.bgOpacity > 0) {
                const bgRgba = hexToRgba(layer.bgColor || '#000000', layer.bgOpacity);
                ctx.fillStyle = bgRgba;
                const rectX = posX - padding;
                const rectY = posY - padding;
                const rectW = maxWidth + (padding * 2);
                const rectH = totalTextHeight + (padding * 2);

                if (radius > 0) {
                  ctx.beginPath();
                  ctx.roundRect(rectX, rectY, rectW, rectH, radius);
                  ctx.fill();
                } else {
                  ctx.fillRect(rectX, rectY, rectW, rectH);
                }
              }

              ctx.font = `${layer.fontStyle === 'italic' ? 'italic ' : ''}${layer.fontWeight === '900' ? '900' : (layer.fontWeight === 'bold' ? 'bold' : 'normal')} ${fontSize}px "${layer.fontFamily}", sans-serif`;
              ctx.fillStyle = layer.color;
              ctx.textAlign = (layer.textAlign || 'left') as CanvasTextAlign;

              if (layer.shadow) {
                ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = Math.round(8 * scaleFactor);
                ctx.shadowOffsetX = Math.round(2 * scaleFactor);
                ctx.shadowOffsetY = Math.round(2 * scaleFactor);
              } else {
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
              }

              lines.forEach((line, index) => {
                const lineY = posY + (index + 0.8) * lineHeight;
                ctx.fillText(line, posX, lineY);
              });

              ctx.restore();
            });

            const dataUrl = canvas.toDataURL('image/png', 1.0);
            resolve(dataUrl);
          } catch (e) {
            reject(e);
          }
        };
        fallbackImg.onerror = (err) => reject(err);
        fallbackImg.src = finalSrc;
      };
    });
  };

  // Helper for hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  };

  // Download
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const dataUrl = await renderCanvasOutput();
      handleDownloadImage(dataUrl, `Canva-Ad-${creative.id}.png`);
    } catch (e) {
      console.error('Error rendering image', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Save to Creative
  const handleSave = async () => {
    try {
      setIsExporting(true);
      const dataUrl = await renderCanvasOutput();
      onSaveToCreative(creative.id, dataUrl, activeIndex);
      onClose();
    } catch (e) {
      console.error('Error saving image to creative', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-200 shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Canva Studio - Editor de Texto
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs font-semibold transition-all border border-gray-800 disabled:opacity-50"
            >
              <Download size={14} />
              <span>Baixar PNG</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-950 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isExporting ? 'Processando...' : 'Salvar no Criativo'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-all ml-2 border border-gray-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preset Angles Bar */}
        <div className="px-6 py-2.5 bg-gray-950 border-b border-gray-800/80 flex items-center gap-2.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
            <Zap size={12} className="text-gray-300" /> Angles Rápidos:
          </span>
          <button
            onClick={() => applyPresetAngle('hook_yellow')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 font-medium hover:border-gray-700 hover:text-white transition-all shrink-0 flex items-center gap-1.5"
          >
            Top Hook Amarelo
          </button>
          <button
            onClick={() => applyPresetAngle('tweet_card')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 font-medium hover:border-gray-700 hover:text-white transition-all shrink-0 flex items-center gap-1.5"
          >
            Tweet / Card Social
          </button>
          <button
            onClick={() => applyPresetAngle('badge_offer')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 font-medium hover:border-gray-700 hover:text-white transition-all shrink-0 flex items-center gap-1.5"
          >
            Oferta + Badge
          </button>
          <button
            onClick={() => applyPresetAngle('headline_box')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 font-medium hover:border-gray-700 hover:text-white transition-all shrink-0 flex items-center gap-1.5"
          >
            Headline Box
          </button>
          <button
            onClick={() => applyPresetAngle('clear')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-medium hover:text-white transition-all shrink-0 ml-auto flex items-center gap-1"
          >
            <RotateCcw size={12} /> Limpar
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Interactive Canvas Preview Area (Left Column) */}
          <div 
            className="flex-1 bg-gray-950 p-6 flex items-center justify-center relative overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div 
              ref={previewContainerRef}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800 max-h-[100%] max-w-[480px] aspect-[4/5] bg-gray-900 flex items-center justify-center group"
              onClick={() => {
                setSelectedLayerId(null);
                setEditingLayerId(null);
              }}
            >
              {bgImageUrl ? (
                <div className="w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
                  <img 
                    src={bgImageUrl} 
                    alt="Background preview" 
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-75 origin-center"
                    style={{
                      transform: `scale(${bgScale}) translate(${bgOffsetX}%, ${bgOffsetY}%) rotate(${bgRotation}deg)`,
                      filter: `brightness(${bgBrightness}%) contrast(${bgContrast}%) saturate(${bgSaturation}%)`
                    }}
                  />
                </div>
              ) : (
                <div className="text-gray-500 text-xs font-bold">Sem imagem de fundo</div>
              )}

              {/* Loading Overlay when generating image */}
              {isImgLoading && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-[40] animate-fade-in p-6 text-center">
                  <Loader2 size={36} className="text-indigo-400 animate-spin mb-3" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Gerando Nova Imagem AI...</p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-[260px]">Aguarde enquanto a IA renderiza o novo visual do seu anúncio.</p>
                </div>
              )}

              {/* Loading Overlay when refreshing copy text */}
              {isTextLoading && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-[40] animate-fade-in p-6 text-center">
                  <Loader2 size={36} className="text-emerald-400 animate-spin mb-3" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Escrevendo Novos Textos (IA)...</p>
                  <p className="text-[11px] text-gray-400 mt-1.5 max-w-[260px] leading-relaxed">A IA está gerando novos títulos e ganchos persuasivos alinhados com o contexto do seu produto.</p>
                </div>
              )}

              {/* Render Draggable Text Layers */}
              {layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const isEditing = editingLayerId === layer.id;
                loadGoogleFont(layer.fontFamily);

                const bgRgba = hexToRgba(layer.bgColor || '#000000', layer.bgOpacity);

                return (
                  <div
                    key={layer.id}
                    onMouseDown={(e) => {
                      if (!isEditing) {
                        handleMouseDown(e, layer.id);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLayerId(layer.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedLayerId(layer.id);
                      setEditingLayerId(layer.id);
                    }}
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg)`,
                      width: `${layer.widthPercent || 90}%`,
                      boxSizing: 'border-box',
                      textAlign: layer.textAlign,
                      backgroundColor: layer.bgOpacity > 0 ? bgRgba : 'transparent',
                      padding: `${layer.bgPadding}px`,
                      borderRadius: `${layer.borderRadius}px`,
                      cursor: isEditing ? 'text' : (draggedLayerId === layer.id ? 'grabbing' : 'grab'),
                      userSelect: isEditing ? 'text' : 'none',
                      touchAction: isEditing ? 'auto' : 'none'
                    }}
                    className={`absolute z-10 ${
                      isSelected 
                        ? 'outline outline-2 outline-white ring-1 ring-black/80 shadow-2xl' 
                        : 'hover:outline hover:outline-1 hover:outline-white/40 cursor-pointer'
                    }`}
                  >
                    {isEditing ? (
                      <textarea
                        autoFocus
                        value={layer.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, text: val } : l));
                        }}
                        onBlur={() => setEditingLayerId(null)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
                            setEditingLayerId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onFocus={(e) => {
                          const len = e.target.value.length;
                          e.target.setSelectionRange(len, len);
                        }}
                        style={{
                          fontFamily: `"${layer.fontFamily}", sans-serif`,
                          fontSize: `${layer.fontSize}px`,
                          color: layer.color,
                          fontWeight: layer.fontWeight === '900' ? 900 : (layer.fontWeight === 'bold' ? 'bold' : 'normal'),
                          fontStyle: layer.fontStyle,
                          textTransform: layer.uppercase ? 'uppercase' : 'none',
                          textShadow: layer.shadow ? `2px 2px 8px ${layer.shadowColor || 'rgba(0,0,0,0.8)'}` : 'none',
                          lineHeight: 1.25,
                          textAlign: layer.textAlign,
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          resize: 'none',
                          padding: 0,
                          margin: 0,
                          overflow: 'hidden',
                          whiteSpace: 'pre-wrap',
                          minHeight: `${Math.max(16, layer.fontSize * 1.25)}px`
                        }}
                        className="w-full font-sans select-text pointer-events-auto cursor-text focus:outline-none focus:ring-0 whitespace-pre-wrap"
                        rows={Math.max(1, (layer.text || '').split('\n').length)}
                      />
                    ) : (
                      <p
                        style={{
                          fontFamily: `"${layer.fontFamily}", sans-serif`,
                          fontSize: `${layer.fontSize}px`,
                          color: layer.color,
                          fontWeight: layer.fontWeight === '900' ? 900 : (layer.fontWeight === 'bold' ? 'bold' : 'normal'),
                          fontStyle: layer.fontStyle,
                          textTransform: layer.uppercase ? 'uppercase' : 'none',
                          textShadow: layer.shadow ? `2px 2px 8px ${layer.shadowColor || 'rgba(0,0,0,0.8)'}` : 'none',
                          lineHeight: 1.25,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          minHeight: layer.text ? 'auto' : `${Math.max(16, layer.fontSize * 1.2)}px`
                        }}
                        className="m-0 select-none pointer-events-none font-sans whitespace-pre-wrap"
                      >
                        {layer.text}
                      </p>
                    )}

                    {isSelected && (
                      <>
                        {/* Bounding Box Corner Nodes */}
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-gray-950 rounded-xs pointer-events-none shadow" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-gray-950 rounded-xs pointer-events-none shadow" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-gray-950 rounded-xs pointer-events-none shadow" />

                        {/* Top Action Buttons (Refresh AI + Delete) */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-auto z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTriggerTextRefresh();
                            }}
                            disabled={isTextLoading}
                            title="Gerar novo texto com IA (Refresh)"
                            className="w-6 h-6 rounded-full bg-white hover:bg-gray-100 text-gray-950 flex items-center justify-center shadow-md border border-gray-900 cursor-pointer transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                          >
                            <RefreshCw size={11} className={isTextLoading ? 'animate-spin' : ''} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLayer(layer.id);
                            }}
                            title="Apagar elemento de texto (Delete)"
                            className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md border border-gray-900 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Right Side Handle - Resize Width (Multiline) */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingLayer({
                              layerId: layer.id,
                              type: 'width',
                              startX: e.clientX,
                              startY: e.clientY,
                              initialWidthPercent: layer.widthPercent || 90,
                              initialFontSize: layer.fontSize
                            });
                          }}
                          className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-white hover:bg-gray-100 rounded-md border border-gray-900 cursor-ew-resize shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                          title="Arraste para ajustar a largura da caixa (multilinha)"
                        />

                        {/* Left Side Handle - Resize Width (Multiline) */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingLayer({
                              layerId: layer.id,
                              type: 'width',
                              startX: e.clientX,
                              startY: e.clientY,
                              initialWidthPercent: layer.widthPercent || 90,
                              initialFontSize: layer.fontSize
                            });
                          }}
                          className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-white hover:bg-gray-100 rounded-md border border-gray-900 cursor-ew-resize shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                          title="Arraste para ajustar a largura da caixa (multilinha)"
                        />

                        {/* Bottom-Right Corner Handle - Resize Font Size */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingLayer({
                              layerId: layer.id,
                              type: 'fontSize',
                              startX: e.clientX,
                              startY: e.clientY,
                              initialWidthPercent: layer.widthPercent || 90,
                              initialFontSize: layer.fontSize
                            });
                          }}
                          className="absolute -right-2.5 -bottom-2.5 w-5 h-5 bg-white hover:bg-gray-100 rounded-full border border-gray-950 cursor-se-resize shadow-xl flex items-center justify-center text-gray-950 transition-transform hover:scale-110"
                          title="Arraste para aumentar/diminuir o tamanho do texto"
                        >
                          <Move size={10} />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Editor Panel */}
          <div className="w-[380px] bg-gray-950 border-l border-gray-800 p-5 flex flex-col gap-4 overflow-y-auto shrink-0">
            
            {/* Background Image Zoom, Rotation, Position & Filters Controls */}
            <div className="p-3.5 bg-gray-900 border border-gray-800/90 rounded-2xl space-y-3 shrink-0 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sliders size={14} className="text-gray-400" /> Tamanho, Rotação & Filtros
                </label>
                {(bgScale !== 1 || bgOffsetX !== 0 || bgOffsetY !== 0 || bgRotation !== 0 || bgBrightness !== 100 || bgContrast !== 100 || bgSaturation !== 100) && (
                  <button
                    onClick={() => { 
                      setBgScale(1); 
                      setBgOffsetX(0); 
                      setBgOffsetY(0); 
                      setBgRotation(0); 
                      setBgBrightness(100);
                      setBgContrast(100);
                      setBgSaturation(100);
                    }}
                    className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                  >
                    <RotateCcw size={10} /> Resetar
                  </button>
                )}
              </div>

              {/* Brightness / Brilho */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1">
                    <Sun size={11} className="text-gray-400" />
                    <span>Brilho</span>
                  </span>
                  <span className="text-gray-200 font-mono text-[11px]">{bgBrightness}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={180}
                  step={1}
                  value={bgBrightness}
                  onChange={(e) => setBgBrightness(Number(e.target.value))}
                  className="w-full accent-gray-200 cursor-pointer"
                />
              </div>

              {/* Contrast / Contraste */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1">
                    <Contrast size={11} className="text-gray-400" />
                    <span>Contraste</span>
                  </span>
                  <span className="text-gray-200 font-mono text-[11px]">{bgContrast}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={180}
                  step={1}
                  value={bgContrast}
                  onChange={(e) => setBgContrast(Number(e.target.value))}
                  className="w-full accent-gray-200 cursor-pointer"
                />
              </div>

              {/* Saturation / Saturação */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1">
                    <Droplet size={11} className="text-gray-400" />
                    <span>Saturação</span>
                  </span>
                  <span className="text-gray-200 font-mono text-[11px]">{bgSaturation}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={bgSaturation}
                  onChange={(e) => setBgSaturation(Number(e.target.value))}
                  className="w-full accent-gray-200 cursor-pointer"
                />
              </div>

              <div className="border-t border-gray-800/80 pt-2 space-y-3">
                {/* Zoom / Escala */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                    <span>Zoom / Escala</span>
                    <span className="text-gray-200 font-mono text-[11px]">{Math.round(bgScale * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBgScale(prev => Math.max(1, Number((prev - 0.1).toFixed(2))))}
                      className="w-7 h-7 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 hover:text-white text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer"
                      title="Diminuir Zoom"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={1.0}
                      max={2.5}
                      step={0.05}
                      value={bgScale}
                      onChange={(e) => setBgScale(Number(e.target.value))}
                      className="w-full accent-gray-200 cursor-pointer"
                    />
                    <button
                      onClick={() => setBgScale(prev => Math.min(2.5, Number((prev + 0.1).toFixed(2))))}
                      className="w-7 h-7 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 hover:text-white text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer"
                      title="Aumentar Zoom"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Background Rotation */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-1">
                      <RotateCw size={11} className="text-gray-400" />
                      <span>Rotação da Imagem</span>
                    </span>
                    <span className="text-gray-200 font-mono text-[11px]">{bgRotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={bgRotation}
                    onChange={(e) => setBgRotation(Number(e.target.value))}
                    className="w-full accent-gray-200 cursor-pointer"
                  />
                </div>

                {bgScale > 1 && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-800/80 animate-fade-in">
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 uppercase mb-1">
                        <span>Posição X</span>
                        <span className="font-mono text-[9px] text-gray-500">{bgOffsetX}%</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={bgOffsetX}
                        onChange={(e) => setBgOffsetX(Number(e.target.value))}
                        className="w-full accent-gray-200 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 uppercase mb-1">
                        <span>Posição Y</span>
                        <span className="font-mono text-[9px] text-gray-500">{bgOffsetY}%</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={bgOffsetY}
                        onChange={(e) => setBgOffsetY(Number(e.target.value))}
                        className="w-full accent-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Background Image AI Refresh Card */}
            <div className="p-3.5 bg-gray-900 border border-gray-800/90 rounded-2xl space-y-3 shrink-0 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-gray-400" /> Refresh Imagem AI
                </label>
                {isImgLoading && (
                  <span className="text-[10px] text-gray-300 font-semibold flex items-center gap-1 animate-pulse">
                    <Loader2 size={12} className="animate-spin" /> Gerando...
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Prompt da Imagem</span>
                  <span className="text-gray-500 font-mono text-[9px]">{promptText.length} chars</span>
                </label>
                <textarea
                  rows={5}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Descreva o estilo e conteúdo da imagem..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-gray-600 transition-all resize-y min-h-[90px] max-h-[350px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Espaço Vazio para Texto</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {[
                    { id: 'auto', label: 'Auto / Ideal' },
                    { id: 'top', label: 'Topo' },
                    { id: 'bottom', label: 'Base' },
                    { id: 'left', label: 'Esquerda' },
                    { id: 'right', label: 'Direita' },
                    { id: 'center', label: 'Minimalista' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setNegativeSpacePos(opt.id as any)}
                      className={`py-1.5 px-1.5 rounded-lg border font-medium transition-all text-center ${
                        negativeSpacePos === opt.id
                          ? 'bg-white text-gray-950 border-white shadow-sm font-semibold'
                          : 'bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTriggerImageRefresh}
                disabled={isImgLoading || !onGenerateImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-white text-xs font-semibold border border-gray-700 transition-all shadow-sm hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isImgLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>Gerar Nova Imagem (Refresh)</span>
              </button>

              {urlsList.length > 1 && (
                <div className="pt-2 border-t border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-gray-400 font-medium uppercase shrink-0">Variações:</span>
                  {urlsList.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSaveToCreative(creative.id, url, idx)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border shrink-0 ${
                        activeIndex === idx ? 'border-white ring-2 ring-white/20 scale-105' : 'border-gray-700 opacity-60 hover:opacity-100'
                      }`}
                      title={`Variação ${idx + 1}`}
                    >
                      <img src={url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Text Refresh Card */}
            <div className="p-3.5 bg-gray-900 border border-gray-800/90 rounded-2xl space-y-3 shrink-0 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Type size={14} className="text-gray-400" /> Refresh Textos AI
                </label>
                {isTextLoading && (
                  <span className="text-[10px] text-gray-300 font-semibold flex items-center gap-1 animate-pulse">
                    <Loader2 size={12} className="animate-spin" /> Gerando Textos...
                  </span>
                )}
              </div>

              <button
                onClick={handleTriggerTextRefresh}
                disabled={isTextLoading || !onRefreshText}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-white text-xs font-semibold border border-gray-700 transition-all shadow-sm hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isTextLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>Gerar Novos Textos (Refresh IA)</span>
              </button>

              {/* Fast Copy Snippet Chips */}
              <div className="pt-2 border-t border-gray-800/80 space-y-1.5">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block">Inserir Partes do Anúncio</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleAddLayer(creative.headline || creative.hook || 'Headline Impactante', { fontSize: 26, bgColor: '#FACC15', color: '#000000', uppercase: true })}
                    className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-[10px] text-gray-300 hover:text-white font-medium flex items-center gap-1 transition-all hover:border-gray-700"
                    title="Inserir Headline como camada"
                  >
                    <Plus size={10} /> Headline
                  </button>
                  <button
                    onClick={() => handleAddLayer(creative.subheadline || 'Subheadline de Apoio', { fontSize: 18, bgColor: '#000000', color: '#FFFFFF', uppercase: false })}
                    className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-[10px] text-gray-300 hover:text-white font-medium flex items-center gap-1 transition-all hover:border-gray-700"
                    title="Inserir Subheadline como camada"
                  >
                    <Plus size={10} /> Subheadline
                  </button>
                  <button
                    onClick={() => handleAddLayer(creative.cta || 'SAIBA MAIS AGORA ➔', { fontSize: 16, bgColor: '#2563EB', color: '#FFFFFF', uppercase: true })}
                    className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-[10px] text-gray-300 hover:text-white font-medium flex items-center gap-1 transition-all hover:border-gray-700"
                    title="Inserir Call to Action"
                  >
                    <Plus size={10} /> CTA
                  </button>
                </div>
              </div>
            </div>
            
            {/* Layers List Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-gray-400" /> Camadas de Texto ({layers.length})
                </label>
                <button
                  onClick={() => handleAddLayer()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>

              {/* Layer Cards */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {layers.length === 0 && (
                  <div className="text-center py-4 text-xs text-gray-500 bg-gray-950/50 rounded-xl border border-dashed border-gray-800">
                    Nenhuma camada. Clique em "+ Adicionar" acima.
                  </div>
                )}
                {layers.map((layer, idx) => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedLayerId === layer.id
                        ? 'bg-gray-800 border-gray-600 text-white shadow-sm'
                        : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                      <span className="text-[10px] font-mono text-gray-500 w-4">#{idx + 1}</span>
                      <span className="text-xs font-medium truncate">{layer.text || 'Camada de Texto'}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleTriggerTextRefresh()}
                        title="Gerar novo texto com IA (Refresh)"
                        className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
                      >
                        <RefreshCw size={12} className={isTextLoading ? 'animate-spin text-emerald-400' : ''} />
                      </button>
                      <button
                        onClick={() => moveLayer(layer.id, 'up')}
                        title="Mover para cima"
                        className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => moveLayer(layer.id, 'down')}
                        title="Mover para baixo"
                        className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        onClick={() => handleDuplicateLayer(layer.id)}
                        title="Duplicar"
                        className="p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteLayer(layer.id)}
                        title="Excluir"
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Layer Properties Editor */}
            {selectedLayer ? (
              <div ref={selectedLayerEditorRef} className="space-y-4 pt-4 border-t border-gray-800/80 animate-fade-in">
                
                {/* Text Content */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Conteúdo do Texto</span>
                      <button
                        type="button"
                        onClick={handleTriggerTextRefresh}
                        disabled={isTextLoading}
                        title="Gerar novo texto com IA (Refresh)"
                        className="px-1.5 py-0.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-all flex items-center gap-1 text-[9px] font-medium border border-gray-800"
                      >
                        <RefreshCw size={10} className={isTextLoading ? 'animate-spin text-emerald-400' : ''} />
                        <span>Refresh IA</span>
                      </button>
                    </span>
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteLayer(selectedLayer.id)}
                        title="Apagar elemento de texto (Delete)"
                        className="px-2 py-0.5 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-100 rounded transition-all flex items-center gap-1 text-[9px] font-medium border border-red-800/80 cursor-pointer"
                      >
                        <Trash2 size={10} />
                        <span>Apagar</span>
                      </button>
                      <span className="text-gray-500 font-mono text-[9px]">{selectedLayer.text.length} chars</span>
                    </span>
                  </label>
                  
                  <div className="flex gap-2 items-start relative">
                    <textarea
                      rows={Math.max(2, (selectedLayer.text || '').split('\n').length)}
                      value={selectedLayer.text}
                      onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                      placeholder="Digite o texto do anúncio... (Enter para quebra de linha)"
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-gray-600 transition-all resize-none min-h-[64px] whitespace-pre-wrap"
                    />
                    
                    {/* Emoji Picker Selector Box next to input */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Selecionar Emojis"
                        className={`h-[64px] px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          showEmojiPicker 
                            ? 'bg-white text-gray-950 border-white shadow-lg' 
                            : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        <Smile size={18} className={showEmojiPicker ? 'text-gray-950' : 'text-amber-400'} />
                        <span className="text-[9px] font-bold">Emoji</span>
                      </button>

                      {/* Popover Emoji Picker Box */}
                      {showEmojiPicker && (
                        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 animate-fade-in">
                          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-800">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                              <Smile size={12} className="text-amber-400" /> Selecionar Emoji
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(false)}
                              className="text-gray-500 hover:text-white p-0.5 rounded"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                            {POPULAR_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  updateSelectedLayer({ text: selectedLayer.text + ' ' + emoji });
                                }}
                                className="w-8 h-8 flex items-center justify-center text-base hover:bg-gray-800 rounded-lg transition-transform hover:scale-125 active:scale-95"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Emoji Bar */}
                  <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    <span className="text-[9px] font-semibold text-gray-500 mr-1 shrink-0">Rápidos:</span>
                    {['🔥', '⚡', '🚀', '💥', '🎯', '✨', '💰', '🚨'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => updateSelectedLayer({ text: selectedLayer.text + ' ' + emoji })}
                        className="text-xs p-1 hover:bg-gray-800 rounded transition-transform hover:scale-110 active:scale-95 shrink-0"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Fonte (Google Fonts)
                  </label>
                  <select
                    value={selectedLayer.fontFamily}
                    onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs font-semibold text-white outline-none focus:border-gray-600 cursor-pointer"
                  >
                    {Array.from(new Set(GOOGLE_FONTS.map(f => f.category))).map(category => (
                      <optgroup key={category} label={category} className="bg-gray-900 text-gray-400 font-bold">
                        {GOOGLE_FONTS.filter(f => f.category === category).map(f => (
                          <option key={f.name} value={f.name} className="bg-gray-950 text-white font-normal py-1">
                            {f.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Font Size, Box Width & Rotation Controls */}
                <div className="space-y-3">
                  {/* Font Size */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      <span>Tamanho do Texto</span>
                      <span className="text-gray-200 font-mono text-[11px]">{selectedLayer.fontSize}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSelectedLayer({ fontSize: Math.max(10, selectedLayer.fontSize - 2) })}
                        className="w-7 h-7 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 hover:text-white text-xs font-bold shrink-0 flex items-center justify-center"
                        title="Diminuir Fonte"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min={12}
                        max={80}
                        value={selectedLayer.fontSize}
                        onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                        className="w-full accent-gray-200 cursor-pointer"
                      />
                      <button
                        onClick={() => updateSelectedLayer({ fontSize: Math.min(100, selectedLayer.fontSize + 2) })}
                        className="w-7 h-7 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 hover:text-white text-xs font-bold shrink-0 flex items-center justify-center"
                        title="Aumentar Fonte"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Text Rotation */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1">
                        <RotateCw size={11} className="text-gray-400" />
                        <span>Rotação do Texto</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200 font-mono text-[11px]">{selectedLayer.rotation || 0}°</span>
                        <button
                          onClick={() => updateSelectedLayer({ rotation: 0 })}
                          className="text-[9px] text-gray-500 hover:text-white transition-colors flex items-center gap-0.5"
                          title="Resetar para 0°"
                        >
                          <RotateCcw size={10} /> Reset
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={selectedLayer.rotation || 0}
                      onChange={(e) => updateSelectedLayer({ rotation: Number(e.target.value) })}
                      className="w-full accent-gray-200 cursor-pointer"
                    />
                  </div>

                  {/* Box Width (Multiline) */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      <span>Largura da Caixa (Multilinha)</span>
                      <span className="text-gray-200 font-mono text-[11px]">{selectedLayer.widthPercent || 90}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={selectedLayer.widthPercent || 90}
                      onChange={(e) => updateSelectedLayer({ widthPercent: Number(e.target.value) })}
                      className="w-full accent-gray-200 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Estilo de Texto
                  </label>
                  <div className="flex bg-gray-950 border border-gray-800 rounded-xl p-1 justify-around">
                    <button
                      onClick={() => updateSelectedLayer({ fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      className={`p-1.5 rounded-lg text-xs font-bold ${selectedLayer.fontWeight === 'bold' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                      title="Negrito"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      onClick={() => updateSelectedLayer({ fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      className={`p-1.5 rounded-lg text-xs font-bold ${selectedLayer.fontStyle === 'italic' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                      title="Itálico"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      onClick={() => updateSelectedLayer({ uppercase: !selectedLayer.uppercase })}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-black ${selectedLayer.uppercase ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                      title="Maiúsculas"
                    >
                      AA
                    </button>
                  </div>
                </div>

                {/* Alignment & Quick Position */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Alinhamento & Posição
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex bg-gray-950 border border-gray-800 rounded-xl p-1 gap-1">
                      <button
                        onClick={() => updateSelectedLayer({ textAlign: 'left' })}
                        className={`p-1.5 rounded-lg ${selectedLayer.textAlign === 'left' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                      >
                        <AlignLeft size={14} />
                      </button>
                      <button
                        onClick={() => updateSelectedLayer({ textAlign: 'center' })}
                        className={`p-1.5 rounded-lg ${selectedLayer.textAlign === 'center' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                      >
                        <AlignCenter size={14} />
                      </button>
                      <button
                        onClick={() => updateSelectedLayer({ textAlign: 'right' })}
                        className={`p-1.5 rounded-lg ${selectedLayer.textAlign === 'right' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                      >
                        <AlignRight size={14} />
                      </button>
                    </div>

                    <div className="flex gap-1 text-[10px]">
                      <button
                        onClick={() => updateSelectedLayer({ y: 12, x: 50 })}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
                      >
                        Topo
                      </button>
                      <button
                        onClick={() => updateSelectedLayer({ y: 50, x: 50 })}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
                      >
                        Centro
                      </button>
                      <button
                        onClick={() => updateSelectedLayer({ y: 76, x: 50 })}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
                      >
                        Base
                      </button>
                    </div>
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Cor do Texto
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => updateSelectedLayer({ color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border border-gray-700 transition-transform ${
                          selectedLayer.color === c ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                      className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border-0"
                      title="Cor customizada"
                    />
                  </div>
                </div>

                {/* High Impact Background Box (Highlight Box) */}
                <div className="p-3 bg-gray-900 border border-gray-800/90 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Layout size={14} className="text-gray-300" /> Caixa de Fundo (Highlight)
                    </label>
                    <input
                      type="checkbox"
                      checked={selectedLayer.bgOpacity > 0}
                      onChange={(e) => updateSelectedLayer({ bgOpacity: e.target.checked ? 0.9 : 0 })}
                      className="accent-gray-200 rounded cursor-pointer"
                    />
                  </div>

                  {selectedLayer.bgOpacity > 0 && (
                    <div className="space-y-3 pt-2 border-t border-gray-800 text-xs">
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Cor do Fundo</label>
                        <div className="flex items-center gap-2">
                          {['#FACC15', '#000000', '#FFFFFF', '#EF4444', '#2563EB'].map(c => (
                            <button
                              key={c}
                              onClick={() => updateSelectedLayer({ bgColor: c })}
                              style={{ backgroundColor: c }}
                              className={`w-6 h-6 rounded-full border border-gray-700 ${
                                selectedLayer.bgColor === c ? 'ring-2 ring-white/50 scale-110' : ''
                              }`}
                            />
                          ))}
                          <input
                            type="color"
                            value={selectedLayer.bgColor}
                            onChange={(e) => updateSelectedLayer({ bgColor: e.target.value })}
                            className="w-6 h-6 rounded bg-transparent cursor-pointer border-0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">
                            Opacidade ({Math.round(selectedLayer.bgOpacity * 100)}%)
                          </label>
                          <input
                            type="range"
                            min={0.1}
                            max={1}
                            step={0.05}
                            value={selectedLayer.bgOpacity}
                            onChange={(e) => updateSelectedLayer({ bgOpacity: Number(e.target.value) })}
                            className="w-full accent-gray-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase mb-1">
                            Arredondamento ({selectedLayer.borderRadius}px)
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={24}
                            value={selectedLayer.borderRadius}
                            onChange={(e) => updateSelectedLayer({ borderRadius: Number(e.target.value) })}
                            className="w-full accent-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Drop Shadow & Stroke */}
                <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800/90 rounded-2xl text-xs">
                  <span className="font-semibold text-gray-300">Sombra de Texto</span>
                  <button
                    onClick={() => updateSelectedLayer({ shadow: !selectedLayer.shadow })}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedLayer.shadow ? 'bg-white text-gray-950 font-bold' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {selectedLayer.shadow ? 'Ativada' : 'Desativada'}
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-6 border-t border-gray-800/80">
                <Pencil size={24} className="mb-2 opacity-40 text-gray-400" />
                <p className="text-xs font-semibold text-gray-400">Selecione uma camada de texto</p>
                <p className="text-[11px] mt-1">Clique em um elemento na imagem ou na lista de camadas para editar fonte, cores e posições.</p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Hidden Canvas element for high-res export */}
      <canvas ref={hiddenCanvasRef} className="hidden" />
    </div>
  );
};
