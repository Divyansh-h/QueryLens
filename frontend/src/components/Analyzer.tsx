import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Database, AlertCircle, Loader2, CheckCircle2, ChevronRight, ChevronDown, HardDrive, Activity, Filter, Cpu, Info, Download, ClipboardPaste } from 'lucide-react';
import { apiClient } from '../api/client';

const EXAMPLES = [
  {
    name: "Heavy Join",
    query: `SELECT c.first_name, c.last_name, sum(o.total_amount)
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY sum(o.total_amount) DESC
LIMIT 100;`
  },
  {
    name: "Complex Aggregation",
    query: `SELECT p.category, count(oi.id) as items_sold, sum(oi.quantity * oi.unit_price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.order_date > NOW() - INTERVAL '1 year'
GROUP BY p.category
ORDER BY revenue DESC;`
  },
  {
    name: "No-Index Text Search",
    query: `SELECT * FROM customers 
WHERE email LIKE '%@example.com' 
  AND first_name LIKE '%5%';`
  },
  {
    name: "Large Seq Scan",
    query: `SELECT COUNT(*) FROM orders WHERE status = 'PENDING';`
  },
  {
    name: "Unoptimized CTE",
    query: `WITH recent_orders AS (
  SELECT * FROM orders WHERE order_date > NOW() - INTERVAL '30 days'
)
SELECT * FROM recent_orders ro
JOIN customers c ON c.id = ro.customer_id
WHERE c.email LIKE 'user10%';`
  }
];

const NODE_EXPLANATIONS: Record<string, string> = {
  'Seq Scan': 'Scans the entire table sequentially, reading every single row. Can be very slow for large tables without a selective index.',
  'Index Scan': 'Uses an index to find the exact rows that match the filter condition, then fetches those specific rows from the table.',
  'Index Only Scan': 'The most efficient scan. Uses an index to find the rows, and the index itself contains all the columns needed, so it does not even need to read the underlying table.',
  'Bitmap Heap Scan': 'Often paired with a Bitmap Index Scan. It takes a "bitmap" of page locations found by the index and fetches those pages in physical disk order to minimize random disk I/O.',
  'Bitmap Index Scan': 'Scans an index to build a memory bitmap of which table pages contain matching rows, rather than fetching them immediately.',
  'Hash Join': 'Builds a hash table in memory from the smaller input, then scans the larger input and probes the hash table to find matches. Excellent for equality joins on large datasets.',
  'Nested Loop': 'Iterates through every row of the first input, and for each row, searches the second input. Very fast if the first input is tiny or the second input is heavily indexed, but disastrously slow if both are large.',
  'Merge Join': 'Requires both inputs to be sorted. It zips them together in a single pass. Very efficient if data is already sorted by an index.',
  'Sort': 'Sorts rows in memory or spills to disk. Disk sorts are a major performance bottleneck and should be avoided by increasing work_mem or indexing the sorted columns.',
  'Limit': 'Stops execution as soon as a specified number of rows have been returned, saving time.',
  'Aggregate': 'Groups rows together and calculates aggregates like SUM, COUNT, or AVG.',
  'Hash': 'The build phase of a Hash Join. It loads rows into a memory hash table.',
  'CTE Scan': 'Scans the result of a Common Table Expression (WITH clause).'
};

const NodeIcon = ({ type }: { type: string }) => {
  if (type.includes('Scan')) return <HardDrive className="w-4 h-4" aria-hidden="true" />;
  if (type.includes('Join')) return <Activity className="w-4 h-4" aria-hidden="true" />;
  if (type.includes('Sort')) return <Filter className="w-4 h-4" aria-hidden="true" />;
  return <Cpu className="w-4 h-4" aria-hidden="true" />;
};

const PlanNodeItem = ({ node, onSelect, selectedNodeId, id }: { node: any, onSelect: (n: any) => void, selectedNodeId: string | null, id: string }) => {
  const [expanded, setExpanded] = useState(true);
  const children = node.Plans || [];
  const isSelected = selectedNodeId === id;

  return (
    <div className="pl-4 border-l border-gray-200 dark:border-gray-700 ml-2 mt-2 relative">
      <div className="absolute w-4 h-px bg-gray-200 dark:bg-gray-700 left-0 top-6 -ml-4" />
      <div 
        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-300 dark:ring-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({...node, _id: id});
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect({...node, _id: id});
          }
        }}
        tabIndex={0}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={expanded}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="mr-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 focus:outline-none"
          aria-label={expanded ? "Collapse node" : "Expand node"}
        >
          {children.length > 0 ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <span className="w-4 h-4 inline-block"></span>}
        </button>
        <NodeIcon type={node["Node Type"]} />
        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {node["Node Type"]}
        </span>
        {node["Relation Name"] && (
          <span className="ml-2 text-xs font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
            {node["Relation Name"]}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500 font-mono">
          {node["Actual Total Time"] ? `${node["Actual Total Time"].toFixed(2)}ms` : ''}
        </span>
      </div>
      
      {expanded && children.length > 0 && (
        <div className="mt-1" role="group">
          {children.map((child: any, idx: number) => (
            <PlanNodeItem 
              key={idx} 
              id={`${id}-${idx}`} 
              node={child} 
              onSelect={onSelect} 
              selectedNodeId={selectedNodeId} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NodeDetails = ({ node }: { node: any }) => {
  if (!node) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm p-6 text-center border-l border-gray-200 dark:border-gray-700 w-full md:w-96 bg-gray-50 dark:bg-gray-900/30">
      <Info className="w-8 h-8 mb-3 opacity-50" aria-hidden="true" />
      <p>Select a node from the execution plan to view its properties and explanation.</p>
    </div>
  );

  const explanation = NODE_EXPLANATIONS[node["Node Type"]] || `A ${node["Node Type"]} operation.`;
  const excludeKeys = ['Node Type', 'Relation Name', 'Plans', '_id', 'Filter', 'Hash Cond', 'Index Cond', 'Merge Cond', 'Sort Key'];
  const properties = Object.entries(node).filter(([k, v]) => !excludeKeys.includes(k) && typeof v !== 'object' && v !== null);
  const buffers = Object.entries(node).filter(([k, v]) => k.includes('Blocks') && typeof v === 'number' && v > 0);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 overflow-y-auto w-full md:w-96 flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <NodeIcon type={node["Node Type"]} />
          <span className="ml-2">{node["Node Type"]}</span>
        </h3>
        {node["Relation Name"] && (
          <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mt-1">ON {node["Relation Name"]}</p>
        )}
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center mb-2">
            <Info className="w-3 h-3 mr-1" aria-hidden="true" /> How it works
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
            {explanation}
          </p>
        </div>

        {node["Filter"] && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Filter</h4>
            <code className="text-xs font-mono text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 p-2 rounded block break-all">
              {node["Filter"]}
            </code>
          </div>
        )}

        {node["Index Cond"] && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Index Condition</h4>
            <code className="text-xs font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded block break-all">
              {node["Index Cond"]}
            </code>
          </div>
        )}

        {node["Hash Cond"] && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Hash Condition</h4>
            <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded block break-all">
              {node["Hash Cond"]}
            </code>
          </div>
        )}

        {node["Sort Key"] && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sort Key</h4>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {Array.isArray(node["Sort Key"]) ? node["Sort Key"].map((k: string, i: number) => (
                <div key={i} className="text-xs font-mono text-gray-800 dark:text-gray-200">{k}</div>
              )) : (
                <div className="text-xs font-mono text-gray-800 dark:text-gray-200">{node["Sort Key"]}</div>
              )}
            </div>
          </div>
        )}

        {buffers.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Buffers</h4>
            <div className="grid grid-cols-2 gap-2">
              {buffers.map(([k, v]) => (
                <div key={k} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{v as number}</div>
                  <div className="text-[10px] text-gray-500 uppercase truncate" title={k}>{k.replace('Blocks', '').trim()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Properties</h4>
          <div className="space-y-1">
            {properties.map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400 truncate mr-2" title={k}>{k}</span>
                <span className="font-mono text-gray-800 dark:text-gray-200 text-right break-all">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Analyzer({ darkMode, initialQuery }: { darkMode: boolean, initialQuery?: string }) {
  const [mode, setMode] = useState<'query' | 'paste'>('query');
  const [query, setQuery] = useState(initialQuery || EXAMPLES[0].query);
  const [pastedPlan, setPastedPlan] = useState('');
  
  useEffect(() => {
    if (initialQuery) {
      setMode('query');
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState('ecommerce');
  const [result, setResult] = useState<any>(null); 
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleFindingClick = (finding: any) => {
    const findNode = (node: any, currentId: string): {id: string, node: any} | null => {
        if (node["Node Type"] === finding.node_type) {
            if (!finding.relation || node["Relation Name"] === finding.relation) {
                return { id: currentId, node };
            }
        }
        const children = node.Plans || [];
        for (let i = 0; i < children.length; i++) {
            const found = findNode(children[i], `${currentId}-${i}`);
            if (found) return found;
        }
        return null;
    };
    
    if (result?.raw_plan?.Plan) {
        const found = findNode(result.raw_plan.Plan, 'root');
        if (found) {
            setSelectedNode({...found.node, _id: found.id});
        }
    }
  };

  const handleRun = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedNode(null);

    try {
      const response = await apiClient.post<any>('/explain', { query });
      setResult(response);
      if (response.raw_plan?.Plan) {
          setSelectedNode({...response.raw_plan.Plan, _id: 'root'});
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the query.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePasted = async () => {
    if (!pastedPlan.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedNode(null);

    try {
      let raw_plan;
      try {
        raw_plan = JSON.parse(pastedPlan);
      } catch (e) {
        throw new Error("Invalid JSON format. Please paste a valid output from EXPLAIN (FORMAT JSON).");
      }
      
      const response = await apiClient.post<any>('/analyze-plan', { raw_plan });
      setResult(response);
      if (response.raw_plan?.Plan) {
          setSelectedNode({...response.raw_plan.Plan, _id: 'root'});
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    
    let md = `# QueryLens Analysis Report\n\n`;
    
    md += `## Summary\n`;
    md += `- **Execution Time**: ${result.execution_time?.toFixed(2) || 0}ms\n`;
    md += `- **Planning Time**: ${result.raw_plan?.["Planning Time"]?.toFixed(2) || 0}ms\n`;
    md += `- **Issues Detected**: ${result.findings?.length || 0}\n\n`;
    
    if (result.findings?.length > 0) {
      md += `## Findings\n`;
      result.findings.forEach((f: any) => {
        md += `### ${f.node_type} ${f.relation ? `on ${f.relation}` : ''}\n`;
        md += `- **Severity**: ${f.severity}\n`;
        md += `- **Explanation**: ${f.explanation}\n`;
        md += `- **Fix**: ${f.suggestion}\n\n`;
      });
    }
    
    md += `## Raw Plan JSON\n`;
    md += `\`\`\`json\n${JSON.stringify(result.raw_plan, null, 2)}\n\`\`\`\n`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `querylens_analysis_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      {/* Top Banner Options */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Database className="w-5 h-5 text-gray-500" aria-hidden="true" />
          <select 
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            aria-label="Select database connection"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          >
            <option value="ecommerce">E-Commerce (Local PostgreSQL)</option>
          </select>
        </div>

        {mode === 'query' && (
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Try this slow query:</span>
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(ex.query)}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded-full transition-colors whitespace-nowrap border border-transparent dark:border-gray-600"
              >
                {ex.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Section */}
      <div className="min-h-[300px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3">
          
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-md" role="tablist">
            <button
              onClick={() => setMode('query')}
              role="tab"
              aria-selected={mode === 'query'}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${mode === 'query' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              SQL Query
            </button>
            <button
              onClick={() => setMode('paste')}
              role="tab"
              aria-selected={mode === 'paste'}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${mode === 'paste' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <ClipboardPaste className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Paste JSON Plan
            </button>
          </div>

          {mode === 'query' ? (
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Run Explain
            </button>
          ) : (
            <button
              onClick={handleAnalyzePasted}
              disabled={loading || !pastedPlan.trim()}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
              Analyze Plan
            </button>
          )}
        </div>
        
        <div className="flex-1 relative min-h-[250px]">
          {mode === 'query' ? (
            <Editor
              height="100%"
              language="sql"
              theme={darkMode ? 'vs-dark' : 'light'}
              value={query}
              onChange={(value) => setQuery(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            />
          ) : (
            <Editor
              height="100%"
              language="json"
              theme={darkMode ? 'vs-dark' : 'light'}
              value={pastedPlan}
              onChange={(value) => setPastedPlan(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            />
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md shadow-sm" role="alert">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">Error</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="flex flex-col flex-1 min-h-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          {/* Summary Banner */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-6 flex-wrap gap-y-2">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mr-4">Analysis Summary</h3>
               
               <div className="flex items-center space-x-2">
                 <span className="text-xs text-gray-500 uppercase font-semibold">Exec Time:</span>
                 <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                   {result.raw_plan?.["Execution Time"]?.toFixed(2) || result.execution_time?.toFixed(2) || 0}ms
                 </span>
               </div>
               
               <div className="flex items-center space-x-2">
                 <span className="text-xs text-gray-500 uppercase font-semibold">Plan Time:</span>
                 <span className="text-sm font-mono bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded font-medium">
                   {result.raw_plan?.["Planning Time"]?.toFixed(2) || 0}ms
                 </span>
               </div>
               
               <button 
                  onClick={handleExportMarkdown}
                  className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-md shadow-sm transition-colors ml-4"
                >
                  <Download className="w-3 h-3 mr-1.5" aria-hidden="true" /> 
                  Export Markdown
               </button>
            </div>
            
            <div className="flex items-center">
                {result.findings.length === 0 ? (
                    <span className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" aria-hidden="true" /> 0 Issues Detected
                    </span>
                ) : (
                    <span className="flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4 mr-1.5" aria-hidden="true" /> {result.findings.length} Issue{result.findings.length > 1 ? 's' : ''} Detected
                    </span>
                )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Tree View Column */}
            <div className="flex-1 overflow-y-auto p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700" role="tree">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Query Execution Tree</h4>
                <div className="pb-8">
                    <PlanNodeItem 
                        id="root" 
                        node={result.raw_plan.Plan} 
                        onSelect={setSelectedNode} 
                        selectedNodeId={selectedNode?._id} 
                    />
                </div>
                
                {/* Findings List below tree */}
                {result.findings.length > 0 && (
                    <div className="mt-6 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Automated Findings</h4>
                        {[...result.findings].sort((a, b) => (a.severity === 'high' ? -1 : 1)).map((f: any, i: number) => (
                            <button 
                                key={i} 
                                onClick={() => handleFindingClick(f)}
                                className={`w-full text-left p-4 rounded-md border-l-4 shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5 ${f.severity === 'high' ? 'bg-red-50 border-red-500 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20' : 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'}`}
                            >
                                <div className="flex items-start">
                                    <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${f.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} aria-hidden="true" />
                                    <div className="ml-3">
                                        <h5 className={`text-sm font-bold ${f.severity === 'high' ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                                            {f.node_type} {f.relation ? `on ${f.relation}` : ''}
                                        </h5>
                                        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{f.explanation}</p>
                                        <p className="text-sm mt-2 font-medium text-gray-900 dark:text-gray-100"><span className="opacity-70">💡 Fix:</span> {f.suggestion}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Node Detail Side Panel */}
            <NodeDetails node={selectedNode} />
          </div>
        </div>
      )}
    </div>
  );
}
