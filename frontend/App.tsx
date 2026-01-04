
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Sun, 
  Moon, 
  Edit3,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  X,
  Eraser
} from 'lucide-react';
import { Todo, FilterType, AIAnalysis } from './types';
import { todoService } from './services/todoService';


const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Todo Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Edit Todo State
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);

  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  }), [todos]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch Todos
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todoService.getAllTodos();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  }, [todos.length]);

  useEffect(() => {
    fetchTodos();
  }, []);

  // CRUD Operations
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsAiProcessing(true);
    try {
      const created = await todoService.createTodo({
        title: newTitle,
        description: newDescription
      });
      setTodos(prev => [created, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setIsModalOpen(false);
    } catch (err) {
      const mockTodo: Todo = {
        id: Date.now(),
        title: newTitle,
        description: newDescription,
        completed: false
      };
      setTodos(prev => [mockTodo, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setIsModalOpen(false);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !editTitle.trim()) return;

    try {
      const updated = await todoService.updateTodo(editingTodo.id, {
        title: editTitle,
        description: editDescription,
        completed: editCompleted
      });
      setTodos(prev => prev.map(t => t.id === editingTodo.id ? updated : t));
      setEditingTodo(null);
    } catch (err) {
      setTodos(prev => prev.map(t => t.id === editingTodo.id ? { ...t, title: editTitle, description: editDescription, completed: editCompleted } : t));
      setEditingTodo(null);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      if (todo.completed) {
        await todoService.updateTodo(todo.id, {
          title: todo.title,
          description: todo.description,
          completed: false
        });
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: false } : t));
      } else {
        await todoService.markAsComplete(todo.id);
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: true } : t));
      }
    } catch (err) {
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) return;

    if (confirm(`Are you sure you want to delete all ${completedTodos.length} completed tasks?`)) {
      try {
        // Sequentially delete on backend or at least try
        await Promise.all(completedTodos.map(t => todoService.deleteTodo(t.id)));
        setTodos(prev => prev.filter(t => !t.completed));
      } catch (err) {
        // Fallback to local deletion
        setTodos(prev => prev.filter(t => !t.completed));
      }
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditCompleted(todo.completed);
  };

  const filteredTodos = useMemo(() => {
    return todos
      .filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
      })
      .filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [todos, filter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-600 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">IntelliTask</h1>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-primary-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Backend Connection Issue</p>
              <p className="opacity-80">{error}</p>
            </div>
            <button onClick={fetchTodos} className="ml-auto p-1 hover:bg-amber-100 dark:hover:bg-amber-800/50 rounded">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Tasks" value={stats.total} icon={<ListIcon className="w-5 h-5" />} color="text-primary-600" bg="bg-primary-50 dark:bg-primary-900/20" />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5" />} color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
          <StatCard label="In Progress" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
              <FilterButton active={filter === 'active'} onClick={() => setFilter('active')}>Active</FilterButton>
              <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')}>Completed</FilterButton>
            </div>
            
            {stats.completed > 0 && (
              <button 
                onClick={handleClearCompleted}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                title="Clear Completed Tasks"
              >
                <Eraser className="w-4 h-4" />
                Clear Completed
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Todo List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-500">Loading your tasks...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs">Try adjusting your filters or search query to find what you're looking for.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 text-primary-600 font-semibold hover:underline"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredTodos.map((todo) => (
              <TodoCard 
                key={todo.id} 
                todo={todo} 
                viewMode={viewMode}
                onToggle={() => handleToggleComplete(todo)}
                onDelete={() => handleDeleteTodo(todo.id)}
                onEdit={() => openEditModal(todo)}
              />
            ))}
          </div>
        )}
      </main>


      {/* Create Modal */}
      {isModalOpen && (
        <Modal 
          title="Create New Task" 
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddTodo}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input 
                autoFocus
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="E.g. Design homepage layout"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea 
                rows={4}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe what needs to be done..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isAiProcessing || !newTitle.trim()}
              className="flex-[2] px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isAiProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Create Task</>}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingTodo && (
        <Modal 
          title="Edit Task" 
          onClose={() => setEditingTodo(null)}
          onSubmit={handleUpdateTodo}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input 
                autoFocus
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea 
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
              />
            </div>
            <div className="flex items-center gap-3 py-2">
              <button 
                type="button"
                onClick={() => setEditCompleted(!editCompleted)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${editCompleted ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
              >
                {editCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                {editCompleted ? 'Marked as Completed' : 'Mark as Completed'}
              </button>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button 
              type="button"
              onClick={() => setEditingTodo(null)}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// --- Helper Components ---

const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void; onSubmit: (e: React.FormEvent) => void }> = ({ title, children, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-6">
        {children}
      </form>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string; bg: string }> = ({ label, value, icon, color, bg }) => (
  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none mt-1">{value}</p>
    </div>
  </div>
);

const FilterButton: React.FC<{ children: React.ReactNode; active: boolean; onClick: () => void }> = ({ children, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500'}`}
  >
    {children}
  </button>
);

const TodoCard: React.FC<{ todo: Todo; viewMode: 'grid' | 'list'; onToggle: () => void; onDelete: () => void; onEdit: () => void }> = ({ todo, viewMode, onToggle, onDelete, onEdit }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setIsAnalyzing(false);
  }, [todo.title, todo.description]);

  useEffect(() => {
    if (!todo.completed) {
      fetchAnalysis();
    }
  }, [fetchAnalysis, todo.completed]);

  const priorityColors = {
    high: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    low: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };

  const actionButtons = (
    <div className="flex items-center gap-1">
      <button 
        onClick={onEdit}
        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        title="Edit Task"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button 
        onClick={onDelete}
        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
        title="Delete Task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className={`group flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:shadow-md ${todo.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
        <button 
          onClick={onToggle}
          className={`flex-shrink-0 mr-4 transition-transform active:scale-90 ${todo.completed ? 'text-primary-600' : 'text-slate-300 dark:text-slate-600'}`}
        >
          {todo.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-slate-900 dark:text-white truncate ${todo.completed ? 'line-through' : ''}`}>{todo.title}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{todo.description || 'No description provided'}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {!todo.completed && analysis && (
            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${priorityColors[analysis.priority]}`}>
              {analysis.priority}
            </span>
          )}
          {actionButtons}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:shadow-lg group ${todo.completed ? 'opacity-75 grayscale-[0.3]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <button 
          onClick={onToggle}
          className={`transition-all active:scale-90 ${todo.completed ? 'text-primary-600' : 'text-slate-300 dark:text-slate-600'}`}
        >
          {todo.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
        </button>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {actionButtons}
        </div>
      </div>

      <h4 className={`text-lg font-bold text-slate-900 dark:text-white mb-1 ${todo.completed ? 'line-through text-slate-500' : ''}`}>{todo.title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 h-[4.5rem] overflow-hidden">{todo.description || 'No description provided'}</p>

      {!todo.completed && (
        <div className="mt-auto space-y-3">
          {isAnalyzing ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
          ) : analysis ? (
            <>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${priorityColors[analysis.priority]}`}>
                  {analysis.priority} Priority
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  {analysis.estimatedTime}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  {analysis.category}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary-500" />
                  AI Smart Steps
                </p>
                <div className="space-y-1.5">
                  {analysis.subtasks.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <ChevronRight className="w-3 h-3 text-primary-400" />
                      <span className="truncate">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {todo.completed && (
        <div className="mt-auto flex items-center gap-2 py-2 text-green-600 dark:text-green-500 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Task Completed
        </div>
      )}
    </div>
  );
};

export default App;
