import { useState, useEffect, useMemo } from 'react';
import { Database, Search, ArrowUpDown, Play, Trash2, Activity, ChevronRight, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';

export default function SlowQueries({ darkMode, onAnalyzeQuery }: { darkMode: boolean, onAnalyzeQuery: (query: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("total_time");
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
  const [workloading, setWorkloading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/slow-queries?limit=100');
      setData(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunWorkload = async () => {
    setWorkloading(true);
    try {
      await apiClient.post('/run-workload', {});
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setWorkloading(false);
    }
  };

  const handleReset = async () => {
    try {
      await apiClient.post('/reset-stats', {});
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = data.filter(d => 
      !d.query.includes("pg_stat_statements") && 
      !d.query.includes("EXPLAIN") &&
      d.query.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, search, sortField, sortOrder]);

  const maxTotalTime = Math.max(...filteredAndSorted.map(d => d.total_time), 1);

  return (
    <div className="flex flex-col h-full space-y-6 pb-4">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">pg_stat_statements</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Historical performance data from your database.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search queries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-white w-64"
            />
          </div>
          <button
            onClick={handleRunWorkload}
            disabled={workloading}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {workloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run Demo Workload
          </button>
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 text-sm font-medium rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset Stats
          </button>
        </div>
      </div>

      {/* Bar Chart Section */}
      {filteredAndSorted.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Total Time Distribution (Top 5)</h3>
          <div className="space-y-4 mt-4">
            {filteredAndSorted.slice(0, 5).map((q, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-24 truncate font-mono text-gray-500 mr-4 text-xs bg-gray-50 dark:bg-gray-900 p-1 rounded text-center" title={q.queryid}>{q.queryid}</div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden flex items-center group relative shadow-inner">
                  <div 
                    className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max((q.total_time / maxTotalTime) * 100, 1)}%` }}
                  />
                  <div className="absolute opacity-0 group-hover:opacity-100 pl-3 text-xs font-bold text-gray-800 dark:text-gray-200">
                    {q.total_time.toFixed(1)}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">SQL Query</th>
                {['calls', 'mean_time', 'total_time'].map((field) => (
                  <th 
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{field.replace('_', ' ')}</span>
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></td></tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">No queries found. Click "Run Demo Workload" to generate data.</td></tr>
              ) : (
                filteredAndSorted.map((q, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-100 dark:border-gray-800 truncate max-w-[500px]">
                        {q.query}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                      {q.calls.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                      {q.mean_time.toFixed(2)}ms
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
                      {q.total_time.toFixed(2)}ms
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onAnalyzeQuery(q.query)}
                        className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        Analyze <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
