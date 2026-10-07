import { BookOpen, HardDrive, Activity, Key, Search } from 'lucide-react';

export default function Learn() {
  return (
    <div className="flex flex-col h-full space-y-8 pb-8 overflow-y-auto pr-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="w-8 h-8 mr-3 opacity-90" aria-hidden="true" />
          Learn Query Optimization
        </h1>
        <p className="text-emerald-100 max-w-2xl text-lg">
          Master the fundamentals of PostgreSQL execution plans. Understand how the database finds, joins, and sorts your data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXPLAIN basics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-500" aria-hidden="true" />
            What is EXPLAIN?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-pink-600 dark:text-pink-400">EXPLAIN</code> shows the execution plan that the PostgreSQL planner generates for the supplied statement. The execution plan shows how the table(s) referenced by the statement will be scanned—by plain sequential scan, index scan, etc.
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Using <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-pink-600 dark:text-pink-400">EXPLAIN ANALYZE</code> actually executes the statement and displays true row counts and run times along with the estimated ones. This is crucial for diagnosing why a query is slow.
          </p>
        </div>

        {/* Scan Types */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-green-500" aria-hidden="true" />
            Scan Types
          </h2>
          <ul className="space-y-4">
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Sequential Scan</span>
              <span className="text-gray-600 dark:text-gray-400">Reads the table from disk sequentially block by block. Very slow for large tables because it must check every row.</span>
            </li>
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Index Scan</span>
              <span className="text-gray-600 dark:text-gray-400">Traverses an index tree to find matching rows, then fetches those specific rows from the table heap. Fast for small result sets.</span>
            </li>
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Index Only Scan</span>
              <span className="text-gray-600 dark:text-gray-400">The data is found entirely within the index. No need to visit the table heap at all. This is the fastest possible scan.</span>
            </li>
          </ul>
        </div>

        {/* Join Types */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" aria-hidden="true" />
            Join Algorithms
          </h2>
          <ul className="space-y-4">
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Nested Loop</span>
              <span className="text-gray-600 dark:text-gray-400">For every row in table A, scan table B. Extremely fast if table A has very few rows, but disastrously slow if both tables are large without indexes.</span>
            </li>
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Hash Join</span>
              <span className="text-gray-600 dark:text-gray-400">Loads table A into a memory hash table, then scans table B probing the hash table. Best for large equality joins (e.g., <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">A.id = B.a_id</code>).</span>
            </li>
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Merge Join</span>
              <span className="text-gray-600 dark:text-gray-400">Both inputs must be sorted first. It iterates through both inputs simultaneously. Very fast if data is already sorted by indexes.</span>
            </li>
          </ul>
        </div>

        {/* Index Types */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2 text-yellow-500" aria-hidden="true" />
            Index Types
          </h2>
          <ul className="space-y-4">
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">B-Tree (Default)</span>
              <span className="text-gray-600 dark:text-gray-400">Excellent for equality (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">=</code>) and range queries (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&gt;</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">BETWEEN</code>). This is what <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-pink-600 dark:text-pink-400">CREATE INDEX</code> makes.</span>
            </li>
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Composite (Multi-column)</span>
              <span className="text-gray-600 dark:text-gray-400">Indexes on multiple columns. Order matters! An index on <code>(A, B)</code> can answer queries filtering by <code>A</code>, or <code>A AND B</code>, but is useless for queries filtering only by <code>B</code>.</span>
            </li>
            <li className="text-sm">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">GIN / GiST</span>
              <span className="text-gray-600 dark:text-gray-400">Specialized indexes used for full-text search, arrays, JSONB, and spatial data.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
