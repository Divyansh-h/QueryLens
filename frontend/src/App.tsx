import { useState, useEffect } from 'react';
import { Database, Search, ListFilter, Activity, GraduationCap, Sun, Moon, Server } from 'lucide-react';
import { apiClient } from './api/client';
import Analyzer from './components/Analyzer';
import IndexLab from './components/IndexLab';
import SlowQueries from './components/SlowQueries';
import Datasets from './components/Datasets';
import Learn from './components/Learn';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [activeTab, setActiveTab] = useState('analyzer');
  const [targetQuery, setTargetQuery] = useState("");

  const handleAnalyzeQuery = (query: string) => {
    setTargetQuery(query);
    setActiveTab('analyzer');
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navigation = [
    { id: 'analyzer', name: 'Plan Analyzer', icon: Search },
    { id: 'index-lab', name: 'Index Lab', icon: ListFilter },
    { id: 'slow-queries', name: 'Slow Queries', icon: Activity },
    { id: 'datasets', name: 'Datasets', icon: Database },
    { id: 'learn', name: 'Learn', icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Server className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            QueryLens
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 capitalize">
            {navigation.find(n => n.id === activeTab)?.name}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {activeTab === 'analyzer' && <Analyzer darkMode={darkMode} initialQuery={targetQuery} />}
            {activeTab === 'index-lab' && <IndexLab darkMode={darkMode} />}
            {activeTab === 'slow-queries' && <SlowQueries darkMode={darkMode} onAnalyzeQuery={handleAnalyzeQuery} />}
            {activeTab === 'datasets' && <Datasets onAnalyzeQuery={handleAnalyzeQuery} />}
            {activeTab === 'learn' && <Learn />}
            
            {activeTab !== 'analyzer' && activeTab !== 'index-lab' && activeTab !== 'slow-queries' && activeTab !== 'datasets' && activeTab !== 'learn' && (
              <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {navigation.find(n => n.id === activeTab)?.name} Component Area
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
