import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Database, AlertCircle, Loader2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';

export default function IndexLab({ darkMode }: { darkMode: boolean }) {
  const [query, setQuery] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [baselineTime, setBaselineTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [applyingIndex, setApplyingIndex] = useState<string | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<{name: string, statement: string, newTime: number} | null>(null);

  const extractIndexName = (stmt: string) => {
    const match = stmt.match(/CREATE INDEX ([a-zA-Z0-9_]+) ON/i);
    return match ? match[1] : 'unknown_index';
  };

  const handleGetSuggestions = async () => {
    if (!query.trim()) return;
    setLoadingSuggestions(true);
    setError(null);
    setSuggestions([]);
    setBaselineTime(null);
    setAppliedIndex(null);
    try {
      const explainRes = await apiClient.post<any>('/explain', { query });
      setBaselineTime(explainRes.execution_time);
      
      const res = await apiClient.post<any>('/suggest-indexes', { query });
      setSuggestions(res.suggestions);
    } catch (err: any) {
      setError(err.message || 'Error fetching suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApply = async (statement: string) => {
    const idxName = extractIndexName(statement);
    if (!confirm(`Are you sure you want to create real index: ${idxName}?`)) return;
    
    setApplyingIndex(idxName);
    setError(null);
    try {
      const res = await apiClient.post<any>('/indexes/apply', {
        statement,
        index_name: idxName,
        query
      });
      setAppliedIndex({
        name: idxName,
        statement,
        newTime: res.execution_time
      });
    } catch (err: any) {
      setError(err.message || 'Error applying index');
    } finally {
      setApplyingIndex(null);
    }
  };

  const handleDrop = async () => {
    if (!appliedIndex) return;
    try {
      await apiClient.post('/indexes/drop', { index_name: appliedIndex.name });
      setAppliedIndex(null);
    } catch (err: any) {
      setError(err.message || 'Error dropping index');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      <div className="min-h-[250px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target Query</span>
          <button
            onClick={handleGetSuggestions}
            disabled={loadingSuggestions}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 shadow-sm"
          >
            {loadingSuggestions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Analyze for Indexes
          </button>
        </div>
        
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language="sql"
            theme={darkMode ? 'vs-dark' : 'light'}
            value={query}
            onChange={(value) => setQuery(value || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md shadow-sm border-l-4 border-red-500">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">Operation Failed</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {baselineTime !== null && !appliedIndex && (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Baseline Execution Time</h3>
           <p className="text-3xl font-mono text-gray-900 dark:text-white">{baselineTime.toFixed(2)}ms</p>
         </div>
      )}

      {suggestions.length > 0 && !appliedIndex && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Suggested Indexes</h3>
          {suggestions.map((s, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mb-3 inline-block">Priority Rank {s.rank}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">{s.reasoning}</p>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded block break-all border border-gray-100 dark:border-gray-700">
                  {s.statement}
                </code>
              </div>
              <button
                onClick={() => handleApply(s.statement)}
                disabled={!!applyingIndex}
                className="flex items-center justify-center px-5 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 text-sm font-bold rounded-md transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {applyingIndex === extractIndexName(s.statement) ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                Apply & Measure
              </button>
            </div>
          ))}
        </div>
      )}

      {appliedIndex && baselineTime !== null && (
        <div className="flex-1 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center space-y-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none"></div>
          
          <div className="text-center z-10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Performance Impact</h3>
            <p className="text-gray-500 dark:text-gray-400">Comparing execution times for your target query.</p>
          </div>

          <div className="flex items-end space-x-12 w-full max-w-2xl justify-center h-56 border-b-2 border-gray-100 dark:border-gray-700 pb-4 z-10">
            <div className="flex flex-col items-center justify-end h-full">
              <span className="text-xl font-mono text-gray-900 dark:text-white mb-3">{baselineTime.toFixed(2)}ms</span>
              <div className="w-24 bg-gray-300 dark:bg-gray-600 rounded-t-md transition-all" style={{ height: '100%' }}></div>
              <span className="mt-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">Baseline</span>
            </div>

            <ArrowRight className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-10" />

            <div className="flex flex-col items-center justify-end h-full">
              <span className="text-xl font-mono text-indigo-600 dark:text-indigo-400 mb-3">{appliedIndex.newTime.toFixed(2)}ms</span>
              <div 
                className="w-24 bg-indigo-500 dark:bg-indigo-600 rounded-t-md transition-all duration-1000 ease-out shadow-lg" 
                style={{ height: \`\${Math.max((appliedIndex.newTime / baselineTime) * 100, 5)}%\` }}
              ></div>
              <span className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">With Index</span>
            </div>
          </div>
          
          <div className="text-center z-10">
             {(() => {
                 const diff = baselineTime - appliedIndex.newTime;
                 const percent = (diff / baselineTime) * 100;
                 if (percent > 0) {
                     return <div className="text-3xl font-black text-green-600 dark:text-green-400">\${percent.toFixed(1)}% Faster! 🚀</div>
                 } else {
                     return <div className="text-3xl font-black text-red-600 dark:text-red-400">\${Math.abs(percent).toFixed(1)}% Slower</div>
                 }
             })()}
             <code className="text-sm font-mono bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 p-3 rounded-lg block mt-6 border border-gray-200 dark:border-gray-700">
               {appliedIndex.statement}
             </code>
          </div>

          <button
            onClick={handleDrop}
            className="flex items-center px-6 py-3 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 text-sm font-bold rounded-md transition-colors z-10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Drop Index & Reset Environment
          </button>
        </div>
      )}
    </div>
  );
}
