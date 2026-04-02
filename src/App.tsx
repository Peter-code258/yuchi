import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { 
  Settings, 
  Layers, 
  Box, 
  Monitor, 
  FolderOpen, 
  Save, 
  Undo, 
  Redo, 
  Play, 
  Pause,
  Printer,
  ChevronDown,
  ChevronUp,
  Scan,
  Camera,
  Maximize,
  Info,
  Thermometer,
  Wind,
  Zap,
  RotateCcw,
  Home,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Video,
  Database,
  Grid3X3,
  List,
  Plus,
  Trash2,
  Copy,
  Cpu,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck,
  Code,
  Users,
  CheckCircle2,
  RefreshCcw,
  Newspaper,
  Bell,
  X,
  AlertCircle,
  BarChart2,
  XCircle,
  MinusCircle
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, Reorder } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Types ---
type Tab = '准备' | '预览' | '设备' | '项目';

const TABS: { id: Tab, icon: React.ReactNode, label: string }[] = [
  { id: '准备', icon: <Layers size={24} />, label: '准备' },
  { id: '预览', icon: <Box size={24} />, label: '预览' },
  { id: '设备', icon: <Monitor size={24} />, label: '设备' },
  { id: '项目', icon: <FolderOpen size={24} />, label: '项目' },
];

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, x: 50, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed top-20 right-8 z-[110] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 min-w-[300px] ${
      type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
      type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
      'bg-nb-blue-light border-nb-blue-primary/20 text-nb-blue-primary'
    }`}
  >
    <div className={`w-2 h-2 rounded-full ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-rose-500' :
      'bg-nb-blue-primary'
    } animate-pulse`} />
    <span className="flex-1 text-sm font-bold">{message}</span>
    <Button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
      <X size={16} />
    </Button>
  </motion.div>
);

const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    className={className}
    {...props}
  >
    {children}
  </motion.button>
);

const SidebarWheel = ({ activeTab, setActiveTab, onSettingsClick }: { activeTab: Tab, setActiveTab: (t: Tab) => void, onSettingsClick: () => void }) => {
  const activeIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <div className="w-24 bg-nb-surface border-r border-nb-border flex flex-col items-center py-8 relative z-50">
      {/* Logo */}
      <div className="w-12 h-12 bg-nb-blue-primary rounded-full flex items-center justify-center text-white font-display font-bold text-2xl mb-12 shadow-lg shadow-nb-blue-primary/20 hover:scale-110 transition-transform cursor-pointer">
        巧
      </div>

      {/* Wheel Container */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-nb-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-nb-surface to-transparent z-10 pointer-events-none" />
        
        <div className="flex flex-col gap-12 py-20 transition-transform duration-500 ease-out"
             style={{ transform: `translateY(${(1.5 - activeIndex) * 80}px)` }}>
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const distance = Math.abs(index - activeIndex);
            const scale = 1 - distance * 0.2;
            const opacity = 1 - distance * 0.5;
            const rotateX = (index - activeIndex) * 30;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group relative flex flex-col items-center justify-center w-full outline-none"
                style={{ 
                  transform: `scale(${scale}) rotateX(${rotateX}deg)`,
                  opacity: Math.max(0, opacity),
                  transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <motion.div 
                  whileHover={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-nb-blue-primary text-white shadow-xl shadow-nb-blue-primary/30' 
                    : 'text-nb-text-muted group-hover:text-nb-blue-primary group-hover:bg-nb-blue-light'
                }`}>
                  {tab.icon}
                </motion.div>
                <span className={`mt-2 text-xs font-display font-bold tracking-widest transition-opacity duration-300 ${
                  isActive ? 'opacity-100 text-nb-blue-primary' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={onSettingsClick}
          className="p-3 text-nb-text-muted hover:text-nb-blue-primary hover:scale-110 transition-all"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

const Header = ({ activeTab, isDarkMode, setIsDarkMode, onStartAction, onUndo, onRedo, canUndo, canRedo }: { 
  activeTab: Tab, 
  isDarkMode: boolean, 
  setIsDarkMode: (v: boolean) => void,
  onStartAction: () => void,
  onUndo: () => void,
  onRedo: () => void,
  canUndo: boolean,
  canRedo: boolean
}) => (
  <header className="h-16 bg-white border-b border-nb-border flex items-center px-8 justify-between z-40">
    <div className="flex items-center gap-6">
      <h1 className="font-display font-bold text-lg tracking-tight text-nb-text">
        灵寻 <span className="text-nb-blue-primary">巧度</span>
      </h1>
      <div className="h-6 w-[1px] bg-nb-border" />
      <div className="flex items-center gap-2 px-3 py-1 bg-nb-surface rounded-full border border-nb-border">
        <div className="w-2 h-2 rounded-full bg-nb-blue-primary animate-pulse" />
        <span className="text-xs font-medium text-nb-text-muted">测量系统_01</span>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2 text-nb-text-muted hover:bg-nb-surface hover:scale-110 rounded-lg transition-all"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="flex items-center gap-2 mr-4">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-nb-text-muted hover:bg-nb-surface hover:scale-110 rounded-lg transition-all disabled:opacity-30 disabled:scale-100"
        >
          <Undo size={18} />
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-nb-text-muted hover:bg-nb-surface hover:scale-110 rounded-lg transition-all disabled:opacity-30 disabled:scale-100"
        >
          <Redo size={18} />
        </button>
      </div>
      <button 
        onClick={onStartAction}
        className="px-6 py-2 bg-nb-blue-primary text-white font-display font-bold text-sm rounded-full shadow-lg shadow-nb-blue-primary/20 hover:bg-nb-blue-dark transition-all active:scale-95 flex items-center gap-2"
      >
        {activeTab === '准备' ? <Zap size={16} /> : <Printer size={16} />}
        {activeTab === '准备' ? '开始测量' : '开始任务'}
      </button>
    </div>
  </header>
);

const SettingsModal = ({ isOpen, onClose, isDarkMode, setIsDarkMode }: { isOpen: boolean, onClose: () => void, isDarkMode: boolean, setIsDarkMode: (v: boolean) => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-nb-text/40 backdrop-blur-md"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-nb-border overflow-hidden"
        >
          <div className="p-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-display font-bold text-nb-text">系统<span className="text-nb-blue-primary">设置</span></h2>
              <button onClick={onClose} className="p-3 hover:bg-nb-surface rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 bg-nb-surface rounded-3xl border border-nb-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-nb-blue-primary">
                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-nb-text">深色模式</h4>
                    <p className="text-xs text-nb-text-muted font-bold uppercase tracking-widest">切换界面主题颜色</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-nb-blue-primary' : 'bg-nb-border'}`}
                >
                  <motion.div 
                    animate={{ x: isDarkMode ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: <Cpu size={18} />, label: '硬件加速', desc: '启用 GPU 渲染 3D 预览' },
                  { icon: <ShieldCheck size={18} />, label: '安全模式', desc: '开启三级碰撞防护' },
                  { icon: <Bell size={18} />, label: '系统通知', desc: '接收测量完成提醒' },
                  { icon: <Database size={18} />, label: '云端同步', desc: '自动备份测量数据' },
                ].map((item) => (
                  <div key={item.label} className="p-6 bg-nb-surface rounded-3xl border border-nb-border flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-nb-blue-primary">
                        {item.icon}
                      </div>
                      <button className="w-10 h-6 bg-nb-blue-primary rounded-full relative">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-nb-text">{item.label}</h4>
                      <p className="text-xs text-nb-text-muted font-bold leading-tight mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 flex justify-end gap-4">
              <button onClick={onClose} className="px-8 py-3 text-xs font-bold text-nb-text-muted hover:text-nb-text transition-all">取消</button>
              <button onClick={onClose} className="px-10 py-3 bg-nb-blue-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-nb-blue-primary/20 hover:scale-105 transition-all">保存更改</button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const DependencyGraph = ({ steps }: { steps: any[] }) => {
  const levels: Record<string, number> = {};
  steps.forEach(s => levels[s.id] = 0);
  let changed = true;
  let iterations = 0;
  while(changed && iterations < 100) {
    changed = false;
    steps.forEach(s => {
      const maxDepLevel = s.dependsOn.length === 0 ? -1 : Math.max(...s.dependsOn.map((depId: string) => levels[depId] ?? -1));
      if (levels[s.id] !== maxDepLevel + 1) {
        levels[s.id] = maxDepLevel + 1;
        changed = true;
      }
    });
    iterations++;
  }

  const levelGroups: Record<number, any[]> = {};
  steps.forEach(s => {
    const l = levels[s.id];
    if (!levelGroups[l]) levelGroups[l] = [];
    levelGroups[l].push(s);
  });

  const maxLevel = Math.max(0, ...Object.values(levels));
  const height = (maxLevel + 1) * 100;

  const positions: Record<string, {x: number, y: number}> = {};
  Object.entries(levelGroups).forEach(([levelStr, levelSteps]) => {
    const level = parseInt(levelStr);
    levelSteps.forEach((step, idx) => {
      positions[step.id] = {
        x: (idx + 1) * (100 / (levelSteps.length + 1)),
        y: level * 100 + 50
      };
    });
  });

  return (
    <div className="w-full relative overflow-visible mt-4" style={{ height: `${height}px` }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {steps.map(step => 
          step.dependsOn.map((depId: string) => {
            const p1 = positions[depId];
            const p2 = positions[step.id];
            if (!p1 || !p2) return null;
            return (
              <path 
                key={`${depId}-${step.id}`}
                d={`M ${p1.x}% ${p1.y + 20} C ${p1.x}% ${p1.y + 60}, ${p2.x}% ${p2.y - 60}, ${p2.x}% ${p2.y - 20}`}
                fill="none"
                stroke="#0055FF"
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
              />
            );
          })
        )}
      </svg>
      {steps.map(step => {
        const pos = positions[step.id];
        let statusClasses = 'bg-white border-2 border-nb-blue-primary text-nb-blue-primary';
        if (step.status === 'done' || step.status === 'completed') statusClasses = 'bg-emerald-500 text-white';
        else if (step.status === 'failed') statusClasses = 'bg-red-500 text-white';
        else if (step.status === 'skipped') statusClasses = 'bg-gray-400 text-white';

        return (
          <div 
            key={step.id} 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: `${pos.x}%`, top: `${pos.y}px` }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10 ${statusClasses}`}>
              {step.id}
            </div>
            <span className="text-xs font-bold text-nb-text-muted whitespace-nowrap bg-white/80 px-1 rounded">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const PreviewView = ({ config }: { config: any }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [isARMode, setIsARMode] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelFormat, setModelFormat] = useState('STL');
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const videoRef = useRef<HTMLVideoElement>(null);

  const [steps, setSteps] = useState([
    { id: '01', label: '基准面 A 测量', status: 'done', dependsOn: [] as string[] },
    { id: '02', label: '圆孔 D1 直径', status: 'pending', dependsOn: ['01'] },
    { id: '03', label: '圆孔 D2 直径', status: 'pending', dependsOn: ['01'] },
    { id: '04', label: '平面度检测', status: 'pending', dependsOn: ['02', '03'] },
  ]);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const toggleDependency = (stepId: string, depId: string) => {
    setSteps(steps.map(s => {
      if (s.id === stepId) {
        const newDeps = s.dependsOn.includes(depId)
          ? s.dependsOn.filter(id => id !== depId)
          : [...s.dependsOn, depId];
        return { ...s, dependsOn: newDeps };
      }
      return s;
    }));
  };

  const updateStepStatus = (stepId: string, newStatus: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, status: newStatus } : s));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsModelLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isARMode) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } else {
      videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
    }
  }, [isARMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    
    if (e.buttons === 1) { // Left click: Rotate
      setRotation(prev => ({ x: prev.x + dy * 0.5, y: prev.y + dx * 0.5 }));
    } else if (e.buttons === 2) { // Right click: Pan
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev - e.deltaY * 0.001)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastPos.x;
    const dy = e.touches[0].clientY - lastPos.y;
    setRotation(prev => ({ x: prev.x + dy * 0.5, y: prev.y + dx * 0.5 }));
    setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div className="flex-1 p-12 neo-gradient overflow-hidden flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-display font-bold tracking-tighter text-nb-text">路径<br/><span className="text-nb-blue-primary">预览</span></h2>
          <div className="flex gap-4">
            <select 
              value={modelFormat}
              onChange={(e) => {
                setModelFormat(e.target.value);
                setIsModelLoaded(false);
                setTimeout(() => setIsModelLoaded(true), 1500);
              }}
              className="px-4 py-3 bg-white border border-nb-border rounded-2xl text-xs font-bold text-nb-text uppercase tracking-widest outline-none appearance-none cursor-pointer"
            >
              <option value="STL">STL 格式</option>
              <option value="OBJ">OBJ 格式</option>
              <option value="GLTF">glTF 格式</option>
            </select>
            <button 
              onClick={() => setIsARMode(!isARMode)}
              disabled={!isModelLoaded}
              className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                isARMode ? 'bg-nb-blue-primary text-white' : 'bg-white border border-nb-border text-nb-text'
              } ${!isModelLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Camera size={16} />
              {isARMode ? '退出 AR 模式' : '进入 AR 模式'}
            </button>
            <div className={`px-6 py-3 bg-white border border-nb-border rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isModelLoaded ? 'text-emerald-600' : 'text-amber-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isModelLoaded ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {isModelLoaded ? '模型已就绪' : '模型加载中...'}
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
          <div 
            className="col-span-8 bg-nb-text rounded-3xl shadow-2xl relative overflow-hidden group cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isARMode && (
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,85,255,0.1),transparent)]" />
            
            {/* Simulated 3D Viewport */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-96 h-96" style={{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)` }}>
                {/* Grid Floor */}
                {!isARMode && <div className="absolute inset-0 border border-white/5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_rotateZ(45deg)]" />}
                
                {/* Simulated Part */}
                <motion.div 
                  animate={{ rotateX: rotation.x, rotateY: rotation.y }}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 rounded-3xl backdrop-blur-sm [transform-style:preserve-3d] ${
                    modelFormat === 'STL' ? 'bg-nb-blue-primary/20 border-nb-blue-primary/40' :
                    modelFormat === 'OBJ' ? 'bg-emerald-500/20 border-emerald-500/40' :
                    'bg-purple-500/20 border-purple-500/40'
                  }`}
                >
                  <div className={`absolute inset-0 border flex flex-col items-center justify-center ${
                    modelFormat === 'STL' ? 'border-nb-blue-primary/40 text-nb-blue-primary/40' :
                    modelFormat === 'OBJ' ? 'border-emerald-500/40 text-emerald-500/40' :
                    'border-purple-500/40 text-purple-500/40'
                  }`}>
                    <Box size={64} />
                    <span className="mt-4 text-sm font-bold tracking-widest">{modelFormat}</span>
                  </div>
                </motion.div>

                {/* Probe Path */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                  <motion.path 
                    d="M 100 100 L 200 150 L 300 100 L 250 250 L 150 300 Z"
                    fill="none"
                    stroke="rgba(0, 85, 255, 0.5)"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                  />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 flex gap-4">
              <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
                <RotateCcw size={20} />
              </button>
              <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="col-span-4 space-y-8 overflow-y-auto pr-4">
            <div className="bg-white border border-nb-border rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase">测量序列</h3>
                <div className="flex bg-nb-surface p-1 rounded-lg">
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-nb-blue-primary' : 'text-nb-text-muted hover:text-nb-text'}`}>
                    <List size={14} />
                  </button>
                  <button onClick={() => setViewMode('graph')} className={`p-1.5 rounded-md transition-all ${viewMode === 'graph' ? 'bg-white shadow-sm text-nb-blue-primary' : 'text-nb-text-muted hover:text-nb-text'}`}>
                    <Grid3X3 size={14} />
                  </button>
                </div>
              </div>
              
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex flex-col p-4 bg-nb-surface rounded-2xl border border-transparent hover:border-nb-blue-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-nb-blue-primary">{step.id}</span>
                        <span className="text-xs font-bold text-nb-text flex-1">{step.label}</span>
                        <button 
                          onClick={() => setEditingStepId(editingStepId === step.id ? null : step.id)} 
                          className={`p-1.5 rounded-lg transition-colors ${editingStepId === step.id ? 'bg-nb-blue-primary text-white' : 'bg-white border border-nb-border text-nb-text-muted hover:text-nb-blue-primary'}`}
                        >
                          <Layers size={14} />
                        </button>
                        <div className="relative flex items-center justify-center w-6 h-6">
                          <select
                            value={step.status}
                            onChange={(e) => updateStepStatus(step.id, e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            title="更改状态"
                          >
                            <option value="pending">等待中 (Pending)</option>
                            <option value="done">已完成 (Completed)</option>
                            <option value="failed">失败 (Failed)</option>
                            <option value="skipped">跳过 (Skipped)</option>
                          </select>
                          {(step.status === 'done' || step.status === 'completed') && <CheckCircle2 size={16} className="text-emerald-500" />}
                          {step.status === 'failed' && <XCircle size={16} className="text-red-500" />}
                          {step.status === 'skipped' && <MinusCircle size={16} className="text-gray-400" />}
                          {step.status === 'pending' && <div className="w-3 h-3 rounded-full border-2 border-nb-border" />}
                        </div>
                      </div>
                      
                      {step.dependsOn.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
                          <span className="text-xs font-bold text-nb-text-muted uppercase mr-1 flex items-center">依赖:</span>
                          {step.dependsOn.map(dep => (
                            <span key={dep} className="px-2 py-0.5 bg-white border border-nb-border rounded-md text-xs font-bold text-nb-text-muted">
                              {dep}
                            </span>
                          ))}
                        </div>
                      )}

                      {editingStepId === step.id && (
                        <div className="mt-4 pt-4 border-t border-nb-border pl-8">
                          <p className="text-xs font-bold text-nb-text-muted mb-3">配置前置依赖:</p>
                          <div className="flex flex-wrap gap-2">
                            {steps.filter(s => s.id !== step.id).map(s => (
                              <button
                                key={s.id}
                                onClick={() => toggleDependency(step.id, s.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  step.dependsOn.includes(s.id) 
                                    ? 'bg-nb-blue-primary text-white shadow-md shadow-nb-blue-primary/20' 
                                    : 'bg-white border border-nb-border text-nb-text-muted hover:border-nb-blue-primary hover:text-nb-blue-primary'
                                }`}
                              >
                                {s.id} {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <DependencyGraph steps={steps} />
              )}
            </div>

            <div className="bg-nb-blue-primary rounded-3xl p-8 text-white shadow-xl shadow-nb-blue-primary/20">
              <h3 className="text-xs font-display font-bold tracking-widest text-white/50 uppercase mb-6">统计摘要</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase mb-1">测点总数</p>
                  <p className="text-2xl font-display font-bold">1,248</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase mb-1">预计误差</p>
                  <p className="text-2xl font-display font-bold">±0.002</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectView = ({ projects, setProjects, onAction }: { projects: any[], setProjects: (p: any[]) => void, onAction: (a: string, p?: any) => void }) => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedProject) {
      setAnalysisData([
        { name: '平均值', value: parseFloat((Math.random() * 100).toFixed(2)) },
        { name: '最大值', value: parseFloat((Math.random() * 100 + 50).toFixed(2)) },
        { name: '最小值', value: parseFloat((Math.random() * 50).toFixed(2)) },
      ]);
    }
  }, [selectedProject]);

  return (
    <div className="flex-1 p-12 neo-gradient overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-display font-bold tracking-tighter text-nb-text">项目<br/><span className="text-nb-blue-primary">存档</span></h2>
          <button 
            onClick={() => onAction('新建项目')}
            className="flex items-center gap-2 px-8 py-4 bg-nb-blue-primary text-white rounded-2xl text-xs font-bold shadow-xl shadow-nb-blue-primary/20 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={18} /> 新建项目
          </button>
        </div>

        {selectedProject ? (
          <div className="bg-white border border-nb-border rounded-3xl p-8 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-display font-bold text-nb-text">{selectedProject.name} - 数据分析</h3>
              <button onClick={() => setSelectedProject(null)} className="text-xs font-bold text-nb-text-muted hover:text-nb-blue-primary">返回</button>
            </div>

            <div className="flex gap-8">
              <div className="w-64 h-48 bg-nb-surface rounded-2xl overflow-hidden border border-nb-border">
                <img src={`https://picsum.photos/seed/${selectedProject.id}/400/300`} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-nb-surface rounded-2xl">
                  <p className="text-xs font-bold text-nb-text-muted uppercase mb-1">最后修改日期</p>
                  <p className="text-sm font-bold text-nb-text">{selectedProject.date}</p>
                </div>
                <div className="p-4 bg-nb-surface rounded-2xl">
                  <p className="text-xs font-bold text-nb-text-muted uppercase mb-1">文件大小</p>
                  <p className="text-sm font-bold text-nb-text">{(Math.random() * 10 + 2).toFixed(1)} MB</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {analysisData.map((item) => (
                <div key={item.name} className="p-6 bg-nb-surface rounded-2xl">
                  <p className="text-xs font-bold text-nb-text-muted uppercase mb-1">{item.name}</p>
                  <p className="text-2xl font-display font-bold text-nb-text">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0055FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <Reorder.Group axis="x" values={projects} onReorder={setProjects} className="grid grid-cols-3 gap-8">
            {projects.map((project) => (
              <Reorder.Item key={project.id} value={project} className="cursor-grab active:cursor-grabbing">
                <div className="bg-white border border-nb-border rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-nb-surface rounded-2xl text-nb-blue-primary group-hover:scale-110 transition-transform">
                      <FolderOpen size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedProject(project)} className="p-2 hover:bg-nb-blue-light rounded-lg text-nb-text-muted hover:text-nb-blue-primary"><BarChart2 size={16} /></button>
                      <button onClick={() => onAction('复制项目', project)} className="p-2 hover:bg-nb-blue-light rounded-lg text-nb-text-muted hover:text-nb-blue-primary"><Copy size={16} /></button>
                      <button onClick={() => onAction('删除项目', project)} className="p-2 hover:bg-rose-50 rounded-lg text-nb-text-muted hover:text-rose-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-bold text-nb-text mb-2">{project.name}</h3>
                  <p className="text-xs text-nb-text-muted mb-6 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-nb-border">
                    <span className="text-xs font-bold text-nb-text-muted uppercase tracking-widest">{project.date}</span>
                    <span className="px-3 py-1 bg-nb-blue-light text-nb-blue-primary rounded-full text-xs font-bold uppercase">
                      {project.type}
                    </span>
                  </div>
                </div>
              </Reorder.Item>
            ))}
            
            <div 
              onClick={() => onAction('导入资产')}
              className="bg-nb-surface border-4 border-dashed border-nb-border rounded-3xl flex flex-col items-center justify-center gap-6 hover:border-nb-blue-primary/50 transition-all group cursor-pointer aspect-[4/3]"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-nb-text-muted group-hover:scale-110 group-hover:text-nb-blue-primary transition-all shadow-sm">
                <Plus size={28} />
              </div>
              <p className="text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase">导入外部资产</p>
            </div>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
};
const PrepareView = ({ config, setConfig, onAction }: { config: any, setConfig: (c: any) => void, onAction: (a: string) => void }) => {
  return (
    <div className="flex-1 p-12 neo-gradient overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-display font-bold tracking-tighter text-nb-text">任务<br/><span className="text-nb-blue-primary">配置</span></h2>
          <div className="flex gap-4">
            <button onClick={() => onAction('保存配置')} className="flex items-center gap-2 px-6 py-3 bg-white border border-nb-border rounded-2xl text-xs font-bold text-nb-text hover:bg-nb-surface transition-all active:scale-95">
              <Save size={16} /> 保存预设
            </button>
            <button onClick={() => onAction('导入配置')} className="flex items-center gap-2 px-6 py-3 bg-white border border-nb-border rounded-2xl text-xs font-bold text-nb-text hover:bg-nb-surface transition-all active:scale-95">
              <FolderOpen size={16} /> 导入
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 space-y-8">
            <div className="bg-white border border-nb-border rounded-3xl p-10 shadow-sm">
              <h3 className="text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase mb-8">基础参数</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-xs font-display font-bold tracking-widest text-nb-text-muted mb-3 block">测量名称</label>
                  <input 
                    type="text" 
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                    placeholder="请输入任务名称..." 
                    className="w-full bg-nb-surface border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-nb-blue-primary outline-none transition-all" 
                  />
                </div>
                <div className="group">
                  <label className="text-xs font-display font-bold tracking-widest text-nb-text-muted mb-3 block">采样频率 (Hz)</label>
                  <select 
                    value={config.frequency}
                    onChange={(e) => setConfig({...config, frequency: e.target.value})}
                    className="w-full bg-nb-surface border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-nb-blue-primary outline-none transition-all appearance-none"
                  >
                    <option>1000</option>
                    <option>2000</option>
                    <option>5000</option>
                  </select>
                </div>
                <div className="group">
                  <label className="text-xs font-display font-bold tracking-widest text-nb-text-muted mb-3 block">精度等级</label>
                  <div className="flex gap-2">
                    {['标准', '精细', '极致'].map((level) => (
                      <button 
                        key={level}
                        onClick={() => setConfig({...config, precision: level})}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                          config.precision === level 
                            ? 'bg-nb-blue-primary text-white shadow-lg shadow-nb-blue-primary/20' 
                            : 'bg-nb-surface text-nb-text-muted hover:bg-nb-border'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="group">
                  <label className="text-xs font-display font-bold tracking-widest text-nb-text-muted mb-3 block">测头选择</label>
                  <div className="relative">
                    <select 
                      value={config.probe}
                      onChange={(e) => setConfig({...config, probe: e.target.value})}
                      className="w-full bg-nb-surface border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-nb-blue-primary outline-none transition-all appearance-none"
                    >
                      <option>触发式探针 TP20</option>
                      <option>激光扫描测头 LS-100</option>
                      <option>影像测头 VIS-500</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-nb-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-nb-border rounded-3xl p-10 shadow-sm">
              <h3 className="text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase mb-8">快速操作</h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: <Zap size={18} />, label: '自动对焦', action: 'AF' },
                  { icon: <RotateCcw size={18} />, label: '坐标归零', action: 'ZERO' },
                  { icon: <ShieldCheck size={18} />, label: '一键校准', action: 'CALIB' },
                ].map((item) => (
                  <button 
                    key={item.label} 
                    onClick={() => onAction(item.label)}
                    className="flex flex-col items-center gap-4 p-6 bg-nb-surface rounded-3xl hover:bg-nb-blue-light hover:text-nb-blue-primary transition-all group"
                  >
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="bg-nb-text rounded-3xl p-10 text-white h-full relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-nb-blue-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Info size={20} className="text-nb-blue-primary" />
                  <h3 className="text-xs font-display font-bold tracking-widest text-white/50 uppercase">配置说明</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold mb-2">精度优先模式</h4>
                    <p className="text-xs text-white/60 leading-relaxed">当前选择的“极致”精度将启用 0.0001mm 光栅尺闭环控制，建议在恒温环境下进行。</p>
                  </div>
                  <div className="h-[1px] bg-white/10" />
                  <div>
                    <h4 className="text-sm font-bold mb-2">测头兼容性</h4>
                    <p className="text-xs text-white/60 leading-relaxed">TP20 探针已通过 HSK-T 接口自动识别，校准参数已加载。</p>
                  </div>
                </div>
                <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-white/40 uppercase">预计耗时</span>
                    <span className="text-lg font-display font-bold">12:45</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-nb-blue-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const NewsCard = () => {
  const [news, setNews] = useState<{ id: number, title: string, time: string, details?: string }[]>([
    { id: 1, title: '系统固件 V1.9.1 已发布，优化了扫描路径算法。', time: '10:30', details: '本次更新包含：1. 路径规划效率提升 20%；2. 修复了 Z 轴回零时的抖动问题；3. 增加了对新型激光测头的支持。' },
    { id: 2, title: '传感器校准提醒：建议每 24 小时进行一次球校准。', time: '09:15' },
    { id: 3, title: '社区动态：用户 @巧度专家 分享了新型测头校准方案。', time: '昨天', details: '该方案利用 3D 打印的校准块，在 5 分钟内即可完成 21 点全量程校准，精度偏差小于 0.002mm。' },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNews, setSelectedNews] = useState<{ title: string, details: string } | null>(null);

  const refreshNews = () => {
    setIsRefreshing(true);
    // Simulate API fetch
    setTimeout(() => {
      const newNews = [
        { id: Date.now(), title: '最新：测量系统已成功连接至云端同步服务。', time: '刚刚', details: '云端同步现已支持实时备份测量配置与项目存档，确保数据在多台设备间无缝流转。' },
        ...news.slice(0, 2)
      ];
      setNews(newNews);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="bg-white border border-nb-border rounded-3xl p-8 shadow-sm flex flex-col h-full relative">
      <AnimatePresence>
        {selectedNews && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="absolute inset-0 bg-nb-text/20 backdrop-blur-sm rounded-3xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="relative w-full bg-white rounded-3xl shadow-xl border border-nb-border p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-nb-text">{selectedNews.title}</h4>
                <button onClick={() => setSelectedNews(null)} className="p-1 hover:bg-nb-surface rounded-lg">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-nb-text-muted leading-relaxed font-medium">
                {selectedNews.details}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-nb-blue-light rounded-xl text-nb-blue-primary">
            <Newspaper size={20} />
          </div>
          <h3 className="text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase">系统快讯</h3>
        </div>
        <button 
          onClick={refreshNews}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-nb-surface border border-nb-border rounded-full text-xs font-bold text-nb-blue-primary hover:bg-nb-blue-light transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          刷新快讯
        </button>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto">
        {news.map((item) => (
          <div key={item.id} className="p-4 bg-nb-surface rounded-2xl border border-transparent hover:border-nb-blue-primary/20 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-nb-text group-hover:text-nb-blue-primary transition-colors">{item.title}</span>
              <span className="text-xs text-nb-text-muted whitespace-nowrap ml-4">{item.time}</span>
            </div>
            {item.details && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNews({ title: item.title, details: item.details! });
                }}
                className="text-xs font-bold text-nb-blue-primary uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <Info size={12} /> 更多详情
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Joystick = ({ onMove }: { onMove: (x: number, y: number) => void }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const hasVibratedRef = useRef(false);

  const handleDrag = (_: any, info: any) => {
    const x = info.offset.x / 50; // Normalize to -1 to 1
    const y = -info.offset.y / 50;
    onMove(x, y);

    // Check for extreme position
    const isExtreme = Math.abs(info.offset.x) >= 45 || Math.abs(info.offset.y) >= 45;
    if (isExtreme && !hasVibratedRef.current) {
      if (navigator.vibrate) navigator.vibrate(50);
      hasVibratedRef.current = true;
    } else if (!isExtreme) {
      hasVibratedRef.current = false;
    }
  };

  return (
    <div className="relative w-48 h-48 bg-nb-surface rounded-full border-4 border-nb-border flex items-center justify-center shadow-inner group">
      {/* Direction Indicators */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-nb-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">+Y</div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-nb-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">-Y</div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-nb-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">-X</div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-nb-text-muted uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">+X</div>
      
      {/* Center Ring */}
      <div className="w-24 h-24 rounded-full border border-nb-border opacity-20" />
      
      {/* Stick */}
      <motion.div
        drag
        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={() => {
          setPosition({ x: 0, y: 0 });
          if (navigator.vibrate) navigator.vibrate(30);
        }}
        animate={position}
        className="w-16 h-16 bg-nb-blue-primary rounded-full shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center z-20 relative"
      >
        <div className="w-8 h-8 rounded-full border-2 border-white/20" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </motion.div>
      
      {/* Base Shadow */}
      <div className="absolute w-12 h-12 bg-black/10 blur-xl rounded-full translate-y-2" />
    </div>
  );
};

const DeviceView = ({ state, onAxisMove, onHome }: { state: any, onAxisMove: (axis: string, dir: number) => void, onHome: () => void }) => {
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await cocossd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              if (videoRef.current) await videoRef.current.play();
            } catch (err) {
              console.error("Play interrupted: ", err);
            }
          };
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };
    startStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    const detect = async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        if (canvasRef.current.width !== videoRef.current.videoWidth || canvasRef.current.height !== videoRef.current.videoHeight) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
        const predictions = await model.detect(videoRef.current);
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          predictions.forEach(prediction => {
            const getColor = (className: string) => {
              let hash = 0;
              for (let i = 0; i < className.length; i++) {
                hash = className.charCodeAt(i) + ((hash << 5) - hash);
              }
              return `hsl(${hash % 360}, 70%, 50%)`;
            };

            const color = getColor(prediction.class);
            ctx.beginPath();
            ctx.rect(...prediction.bbox);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.stroke();
            ctx.font = '14px Arial';
            ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
          });
        }
      }
      requestAnimationFrame(detect);
    };
    detect();
  }, [model]);

  const captureImage = async () => {
    if (canvasRef.current) {
      setCapturedImage(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-8 bg-nb-surface overflow-y-auto">
      <div className="grid grid-cols-4 gap-8">
        {[
          { icon: <Thermometer size={20} />, label: '环境温度', value: `${state.temp}°C`, color: 'text-rose-500' },
          { icon: <Wind size={20} />, label: '气压状态', value: '0.52 MPa', color: 'text-emerald-500' },
          { icon: <Zap size={20} />, label: '系统负载', value: '12%', color: 'text-nb-blue-primary' },
          { icon: <Database size={20} />, label: '存储空间', value: '85.2 GB', color: 'text-nb-text' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-nb-border p-8 rounded-3xl shadow-sm flex items-center gap-6">
            <div className={`p-4 bg-nb-surface rounded-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-display font-bold tracking-wider text-nb-text-muted uppercase mb-1">{stat.label}</p>
              <p className="text-xl font-display font-bold text-nb-text">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <motion.div layout className={`flex ${isFullScreen ? 'flex-col' : 'flex-row'} gap-8`}>
        <motion.div layout className={`${isFullScreen ? 'order-2 flex flex-row gap-8' : 'flex-1 flex flex-col gap-8'}`}>
          <div className="bg-white border border-nb-border rounded-3xl p-10 shadow-sm flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase">实时坐标与控制</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsAutoScanning(!isAutoScanning)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isAutoScanning 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                      : 'bg-nb-surface border-nb-border text-nb-text hover:bg-nb-blue-light'
                  }`}
                >
                  <Scan size={14} className={isAutoScanning ? 'animate-pulse' : ''} />
                  {isAutoScanning ? '自动扫描中' : '自动扫描'}
                </button>
                <button 
                  onClick={onHome}
                  className="flex items-center gap-2 px-4 py-2 bg-nb-surface border border-nb-border rounded-xl text-xs font-bold text-nb-text hover:bg-nb-blue-light hover:text-nb-blue-primary transition-all active:scale-95"
                >
                  <Home size={14} /> 全轴归零
                </button>
              </div>
            </div>
            
            <div className="flex gap-12 items-center flex-1">
              <div className="space-y-6 flex-1">
                {['X', 'Y', 'Z'].map((axis) => (
                  <div key={axis} className="flex items-center gap-6">
                    <div className="w-10 h-10 bg-nb-text text-white rounded-xl flex items-center justify-center font-display font-bold text-sm shadow-lg">
                      {axis}
                    </div>
                    <div className="flex-1 bg-nb-surface rounded-xl px-6 py-3 flex items-center justify-between border border-nb-border">
                      <span className="text-xl font-display font-bold tracking-tight text-nb-text">
                        {state.axes[axis as keyof typeof state.axes].toFixed(4)}
                      </span>
                      <span className="text-xs font-bold text-nb-text-muted uppercase">MM</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <Joystick onMove={(x, y) => {
                  if (Math.abs(x) > 0.5) onAxisMove('X', x > 0 ? 1 : -1);
                  if (Math.abs(y) > 0.5) onAxisMove('Y', y > 0 ? 1 : -1);
                }} />
                <div className="flex gap-2">
                  <button 
                    onClick={() => onAxisMove('Z', -1)}
                    className="w-12 h-12 bg-nb-surface border border-nb-border rounded-xl flex flex-col items-center justify-center text-nb-text hover:bg-nb-blue-light hover:text-nb-blue-primary transition-all active:scale-90"
                  >
                    <ChevronDown size={20} />
                    <span className="text-xs font-bold">Z-</span>
                  </button>
                  <button 
                    onClick={() => onAxisMove('Z', 1)}
                    className="w-12 h-12 bg-nb-surface border border-nb-border rounded-xl flex flex-col items-center justify-center text-nb-text hover:bg-nb-blue-light hover:text-nb-blue-primary transition-all active:scale-90"
                  >
                    <ChevronUp size={20} />
                    <span className="text-xs font-bold">Z+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <NewsCard />
        </motion.div>

        <div className={`${isFullScreen ? 'order-1 flex-1 flex items-center justify-center' : 'flex-1 flex flex-col gap-8'}`}>
          <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className={`bg-nb-text rounded-3xl ${isFullScreen ? 'p-4' : 'p-10'} text-white ${isFullScreen ? 'w-full aspect-[16/9] scale-[1.05]' : 'flex-1'} relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 blur-[80px] rounded-full" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-display font-bold tracking-widest text-white/50 uppercase">实时视觉反馈</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">LIVE</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={captureImage} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Camera size={14} /></button>
                  <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Maximize size={14} /></button>
                </div>
              </div>
              
              <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative">
                {/* Camera Feed */}
                <video ref={videoRef} className="hidden" />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain" />
                {capturedImage && (
                  <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-contain opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* HUD Overlays */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Resolution</div>
                      <div className="text-xs font-bold text-white/80">4K @ 60FPS</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Latency</div>
                      <div className="text-xs font-bold text-emerald-400">12ms</div>
                    </div>
                  </div>
                  
                  {/* Crosshair */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center">
                    <div className="absolute w-full h-[1px] bg-white/20" />
                    <div className="absolute h-full w-[1px] bg-white/20" />
                    <div className="w-4 h-4 border border-nb-blue-primary rounded-full" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-8 border border-nb-blue-primary/30 rounded-full" 
                    />
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-nb-blue-primary rounded-full animate-ping" />
                        <span className="text-xs font-bold tracking-widest text-white">AUTO_FOCUS: ON</span>
                      </div>
                      <div className="text-xs font-bold text-white/40">ISO 400 | F2.8 | 1/125</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <div className="text-xs font-bold text-white/40 uppercase tracking-widest">X_POS</div>
                        <div className="text-xs font-bold text-white">{state.axes.X.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Y_POS</div>
                        <div className="text-xs font-bold text-white">{state.axes.Y.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scanning Line */}
                <motion.div 
                  animate={isPlaying ? { y: [-200, 200] } : { y: 0 }}
                  transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                  className="absolute inset-x-0 h-[1px] bg-nb-blue-primary/40 shadow-[0_0_20px_rgba(0,85,255,0.6)] z-10"
                />

                {/* Playback Controls */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md rounded-xl p-3 flex items-center gap-4 z-20">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-nb-blue-primary transition-colors">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress} 
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-nb-blue-primary"
                  />
                  <span className="text-xs font-mono text-white">{progress}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* AMS Section */}
      <div className="bg-white border border-nb-border rounded-3xl p-10 shadow-sm">
        <h3 className="text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase mb-8">传感器系统</h3>
        <div className="grid grid-cols-4 gap-8">
          {[
            { id: 'S1', color: 'blue-gradient', label: '高精度探针 A' },
            { id: 'S2', color: 'bg-white border border-nb-border', label: '激光扫描仪' },
            { id: 'S3', color: 'bg-nb-text', label: '影像传感器' },
            { id: 'S4', color: 'bg-nb-blue-light border border-nb-blue-primary/20', label: '辅助对焦' },
          ].map((slot) => (
            <div key={slot.id} className="group cursor-pointer">
              <div className={`aspect-square rounded-3xl ${slot.color} mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-nb-text">
                  {slot.id}
                </div>
              </div>
              <p className="text-xs font-bold text-nb-text text-center">{slot.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ onStart }: { onStart: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-nb-bg flex flex-col overflow-y-auto"
  >
    <div className="max-w-6xl mx-auto px-8 py-20 w-full">
      <div className="flex flex-col items-center text-center mb-20">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-nb-blue-primary rounded-3xl flex items-center justify-center text-white font-display font-bold text-4xl mb-8 shadow-2xl shadow-nb-blue-primary/40"
        >
          巧
        </motion.div>
        <h1 className="text-6xl font-display font-bold tracking-tighter text-nb-text mb-4">
          灵寻巧度 <span className="text-nb-blue-primary">——桌面级智能三坐标测量系统</span>
        </h1>
        <p className="text-xl text-nb-text-muted max-w-2xl">
          工业级精度，桌面级体验。为创客、教育与中小企业打造的闭环测量解决方案。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {[
          {
            title: "核心基础测量",
            icon: <Grid3X3 className="text-nb-blue-primary" />,
            content: "标准测量范围 250×250×200mm，重复精度 ±0.005mm。采用天然花岗岩基座，C5级滚珠丝杠，保障极致稳定性。"
          },
          {
            title: "智能软件支持",
            icon: <Layers className="text-nb-blue-primary" />,
            content: "CMM Desktop Suite 全流程覆盖。支持 CAD 导入、自动路径规划、SPC 统计分析，新手/专家双模式切换。"
          },
          {
            title: "加工-测量闭环",
            icon: <RotateCcw className="text-nb-blue-primary" />,
            content: "支持 Modbus TCP/EtherCAT 协议，实时反馈测量数据至 CNC/3D 打印机，自动生成补偿 G 代码，良率提升 30%。"
          },
          {
            title: "自动校准与安全",
            icon: <ShieldCheck className="text-nb-blue-primary" />,
            content: "一键 21 点球校准，内置温度补偿算法。三级碰撞防护（限位、电流监测、力感应），全方位保障安全。"
          },
          {
            title: "开源与社区共享",
            icon: <Code className="text-nb-blue-primary" />,
            content: "提供 Python/MATLAB SDK，支持二次开发。专属社区共享测量程序与路径案例，构建可持续共享生态。"
          },
          {
            title: "多测头兼容",
            icon: <Zap className="text-nb-blue-primary" />,
            content: "HSK-T 快速换装接口，自动识别触发式、扫描式、光学测头。兼容雷尼绍 TP20，适配多种测量场景。"
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * i + 0.5 }}
            className="bg-nb-surface border border-nb-border p-8 rounded-3xl hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-lg font-display font-bold text-nb-text mb-3">{feature.title}</h3>
            <p className="text-sm text-nb-text-muted leading-relaxed">{feature.content}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-nb-blue-primary/5 border border-nb-blue-primary/10 rounded-3xl p-12 mb-20">
        <h2 className="text-3xl font-display font-bold text-nb-text mb-10 text-center">产品型号定位</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "玉尺・基础版",
              desc: "搭载接触式测头，面向创客与个人工作室。",
              features: ["手动测量", "数据导出", "基础报告"]
            },
            {
              name: "玉尺・专业版",
              desc: "接触+光学双测头，面向中小企业与科研院所。",
              features: ["SPC 统计", "CAD 导入", "CNC 联动", "路径规划"],
              highlight: true
            },
            {
              name: "玉尺・教育套装",
              desc: "包含多台设备与教学课程，面向院校实训室。",
              features: ["实训指导书", "师资培训", "多机联动"]
            }
          ].map((model, i) => (
            <div key={i} className={`p-8 rounded-3xl ${model.highlight ? 'bg-nb-blue-primary text-white shadow-2xl shadow-nb-blue-primary/30' : 'bg-white border border-nb-border'}`}>
              <h4 className={`text-xl font-display font-bold mb-4 ${model.highlight ? 'text-white' : 'text-nb-text'}`}>{model.name}</h4>
              <p className={`text-sm mb-6 ${model.highlight ? 'text-white/80' : 'text-nb-text-muted'}`}>{model.desc}</p>
              <ul className="space-y-3">
                {model.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs font-bold">
                    <CheckCircle2 size={14} className={model.highlight ? 'text-white' : 'text-nb-blue-primary'} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onStart}
          className="px-12 py-5 bg-nb-blue-primary text-white font-display font-bold text-lg tracking-widest rounded-full shadow-2xl shadow-nb-blue-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          立即进入系统
        </button>
      </div>
    </div>
  </motion.div>
);

export default function NeoBambu() {
  const [activeTab, setActiveTab] = useState<Tab>('准备');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'error' | 'info' }[]>([]);
  const [projects, setProjects] = useState([
    { id: 1, name: 'QIAODU_BENCHMARK_V1', description: '标准基准测试项目，用于验证系统重复精度。', date: '2026-03-20', type: '测试', data: {} },
    { id: 2, name: 'ENGINE_BLOCK_SCAN', description: '发动机缸体扫描任务，包含 12 个关键孔位测量。', date: '2026-03-18', type: '生产', data: {} },
    { id: 3, name: 'TURBINE_BLADE_QC', description: '涡轮叶片质量控制，极致精度模式。', date: '2026-03-15', type: '质检', data: {} },
  ]);
  
  // App State
  const [measurementConfig, setMeasurementConfig] = useState({
    name: 'QIAODU_BENCHMARK_V1',
    frequency: '2000',
    precision: '精细',
    probe: '触发式探针 TP20'
  });

  const [deviceState, setDeviceState] = useState({
    temp: 22.4,
    axes: { X: 124.5023, Y: 89.1205, Z: 45.0012 }
  });

  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleAction = (action: string, payload?: any) => {
    if (action === '开始测量') {
      if (isMeasuring) return;
      setIsMeasuring(true);
      setProgress(0);
      addToast('测量任务已启动，正在规划路径...', 'info');
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsMeasuring(false);
            addToast('测量任务已完成', 'success');
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return;
    }

    if (action === '新建项目') {
      const newProject = {
        id: Date.now(),
        name: `NEW_PROJECT_${projects.length + 1}`,
        description: '新建的测量项目描述...',
        date: new Date().toISOString().split('T')[0],
        type: '自定义',
        data: {}
      };
      setProjects([newProject, ...projects]);
      addToast('已创建新项目', 'success');
      return;
    }

    if (action === '删除项目' && payload) {
      setProjects(projects.filter(p => p.id !== payload.id));
      addToast(`项目 ${payload.name} 已删除`, 'error');
      return;
    }

    if (action === '复制项目' && payload) {
      const copy = { ...payload, id: Date.now(), name: `${payload.name}_COPY` };
      setProjects([copy, ...projects]);
      addToast(`已复制项目 ${payload.name}`, 'success');
      return;
    }

    addToast(`正在执行: ${action}`, 'info');
    // Simulate action
    setTimeout(() => {
      if (action === '一键校准') {
        setDeviceState(prev => ({ ...prev, temp: 22.5 }));
        addToast('校准完成: 21点球校准成功', 'success');
      } else {
        addToast(`${action} 已成功执行`, 'success');
      }
    }, 1000);
  };

  const handleAxisMove = (axis: string, dir: number) => {
    setDeviceState(prev => ({
      ...prev,
      axes: {
        ...prev.axes,
        [axis]: prev.axes[axis as keyof typeof prev.axes] + (dir * 0.1)
      }
    }));
  };

  const handleHome = () => {
    addToast('正在回零所有轴...', 'info');
    setTimeout(() => {
      setDeviceState(prev => ({
        ...prev,
        axes: { X: 0, Y: 0, Z: 0 }
      }));
      addToast('全轴已归零', 'success');
    }, 1500);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setRedoStack(prevStack => [...prevStack, measurementConfig]);
      setMeasurementConfig(prev);
      setHistory(prevHistory => prevHistory.slice(0, -1));
      addToast('已撤销更改', 'info');
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      setHistory(prevHistory => [...prevHistory, measurementConfig]);
      setMeasurementConfig(next);
      setRedoStack(prevStack => prevStack.slice(0, -1));
      addToast('已重做更改', 'info');
    }
  };

  const updateConfig = (newConfig: any) => {
    setHistory(prev => [...prev, measurementConfig]);
    setRedoStack([]);
    setMeasurementConfig(newConfig);
  };

  return (
    <div className={`flex h-screen w-screen bg-nb-bg overflow-hidden text-nb-text font-sans ${isDarkMode ? 'dark' : ''}`}>
      <AnimatePresence>
        {showWelcome && <WelcomeScreen onStart={() => setShowWelcome(false)} />}
      </AnimatePresence>

      <SidebarWheel 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          activeTab={activeTab} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          onStartAction={() => handleAction('开始测量')}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={history.length > 0}
          canRedo={redoStack.length > 0}
        />

        {isMeasuring && (
          <div className="h-1 bg-nb-blue-light overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-nb-blue-primary shadow-[0_0_10px_rgba(0,85,255,0.5)]"
            />
          </div>
        )}
        
        <main className="flex-1 flex overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, cubicBezier: [0.2, 0.8, 0.2, 1] }}
              className="flex-1 flex overflow-hidden"
            >
              {activeTab === '准备' && (
                <PrepareView 
                  config={measurementConfig} 
                  setConfig={updateConfig} 
                  onAction={handleAction} 
                />
              )}
              {activeTab === '设备' && (
                <DeviceView 
                  state={deviceState} 
                  onAxisMove={handleAxisMove} 
                  onHome={handleHome} 
                />
              )}
              {activeTab === '预览' && (
                <PreviewView config={measurementConfig} />
              )}
              {activeTab === '项目' && (
                <ProjectView projects={projects} setProjects={setProjects} onAction={handleAction} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="h-10 bg-white border-t border-nb-border flex items-center px-8 justify-between text-xs font-display font-bold tracking-widest text-nb-text-muted uppercase">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-nb-blue-primary" />
              <span>系统在线</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell size={12} className="text-nb-blue-primary" />
              <span>无未处理警报</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span>CPU: 12%</span>
            <span>MEM: 1.2GB</span>
            <span className="text-nb-text font-bold">V1.9.1</span>
          </div>
        </footer>
      </div>

      {/* Toasts Container */}
      <div className="fixed bottom-12 right-12 z-[200] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
