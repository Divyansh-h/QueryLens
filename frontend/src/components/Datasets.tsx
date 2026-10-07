import { Database, Table, Zap, Target, Lightbulb, Play, ArrowRight, Activity, Users, Box, ShoppingCart } from 'lucide-react';

const TABLES = [
  {
    name: 'customers',
    icon: Users,
    rows: '50,000',
    description: 'User accounts with personal information and emails.',
    schema: `id SERIAL PRIMARY KEY
first_name VARCHAR(50)
last_name VARCHAR(50)
email VARCHAR(100) UNIQUE
created_at TIMESTAMP`,
    sample: `{ id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' }`
  },
  {
    name: 'products',
    icon: Box,
    rows: '5,000',
    description: 'E-commerce inventory with pricing and categories.',
    schema: `id SERIAL PRIMARY KEY
name VARCHAR(100)
category VARCHAR(50)
price DECIMAL(10,2)
stock_quantity INT`,
    sample: `{ id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99 }`
  },
  {
    name: 'orders',
    icon: ShoppingCart,
    rows: '1,000,000',
    description: 'Order headers linking customers to their purchases.',
    schema: `id SERIAL PRIMARY KEY
customer_id INT (FK)
order_date TIMESTAMP
status VARCHAR(20)
total_amount DECIMAL(10,2)`,
    sample: `{ id: 1, customer_id: 432, status: 'DELIVERED', total_amount: 149.50 }`
  },
  {
    name: 'order_items',
    icon: Activity,
    rows: '2,000,000',
    description: 'Line items for every order, linking to products.',
    schema: `id SERIAL PRIMARY KEY
order_id INT (FK)
product_id INT (FK)
quantity INT
unit_price DECIMAL(10,2)`,
    sample: `{ id: 1, order_id: 1, product_id: 89, quantity: 2, unit_price: 29.99 }`
  }
];

const CHALLENGES = [
  {
    id: 1,
    title: 'The Slow Join',
    difficulty: 'Easy',
    goal: '< 50ms',
    query: `SELECT c.first_name, c.last_name, sum(o.total_amount)
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY sum(o.total_amount) DESC
LIMIT 100;`,
    hint: 'Joining customers to orders currently requires scanning the entire 1M row orders table. What index would speed up finding orders for a specific customer?'
  },
  {
    id: 2,
    title: 'The Missing Lookup',
    difficulty: 'Easy',
    goal: '< 1ms',
    query: `SELECT * FROM orders WHERE status = 'PENDING' AND total_amount > 1000;`,
    hint: 'We are scanning 1,000,000 orders just to find a few high-value pending ones. A composite index might be perfect here.'
  },
  {
    id: 3,
    title: 'The Heavy Aggregation',
    difficulty: 'Medium',
    goal: '< 100ms',
    query: `SELECT p.category, sum(oi.quantity * oi.unit_price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.category
ORDER BY revenue DESC;`,
    hint: 'Aggregating across 2 million order items is tough. Indexing the foreign key (product_id) in order_items will optimize the join.'
  },
  {
    id: 4,
    title: 'The Date Filter',
    difficulty: 'Medium',
    goal: '< 10ms',
    query: `SELECT COUNT(*) FROM orders 
WHERE order_date >= NOW() - INTERVAL '7 days';`,
    hint: 'Filtering by date without an index forces the database to check every single order sequentially.'
  },
  {
    id: 5,
    title: 'The Unoptimized CTE',
    difficulty: 'Hard',
    goal: '< 5ms',
    query: `WITH recent_orders AS (
  SELECT * FROM orders WHERE status = 'SHIPPED'
)
SELECT * FROM recent_orders ro
JOIN customers c ON c.id = ro.customer_id
WHERE c.email = 'user5000@example.com';`,
    hint: 'PostgreSQL might evaluate the CTE or fold it into the main query. Ensure that both the email lookup and the status filter are properly indexed to avoid sequential scans.'
  }
];

export default function Datasets({ onAnalyzeQuery }: { onAnalyzeQuery: (query: string) => void }) {
  return (
    <div className="flex flex-col h-full space-y-8 pb-8 overflow-y-auto pr-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Database className="w-8 h-8 mr-3 opacity-90" />
          E-Commerce Sandbox Dataset
        </h1>
        <p className="text-blue-100 max-w-2xl text-lg">
          A realistic PostgreSQL database generated with 3 million+ rows. Designed deliberately without indexes (except primary keys) so you can practice query optimization.
        </p>
      </div>

      {/* Schema Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Table className="w-6 h-6 mr-2 text-blue-500" />
          Table Schemas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TABLES.map((table) => {
            const Icon = table.icon;
            return (
              <div key={table.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-mono">{table.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{table.description}</p>
                    </div>
                  </div>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold px-3 py-1 rounded-full">
                    {table.rows} rows
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Schema</h4>
                    <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-300 h-32 overflow-y-auto">
                      {table.schema}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sample Row</h4>
                    <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-indigo-600 dark:text-indigo-400 whitespace-pre-wrap break-words h-32 overflow-y-auto">
                      {table.sample}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Mode */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              Challenge Mode
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Test your optimization skills. Send these slow queries to the Analyzer, use the Index Lab to fix them, and beat the goal time.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {CHALLENGES.map((challenge) => (
            <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md">
              
              {/* Left sidebar info */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">#{challenge.id}</span>
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${
                      challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                      challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    }\`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h3>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Target className="w-4 h-4 mr-2 text-red-500" />
                    Goal: <span className="ml-1 font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 rounded">{challenge.goal}</span>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 overflow-x-auto">
                    {challenge.query}
                  </pre>
                  
                  <div className="mt-4 flex items-start text-sm">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      <span className="font-semibold not-italic text-gray-700 dark:text-gray-300">Hint:</span> {challenge.hint}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => onAnalyzeQuery(challenge.query)}
                    className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Solve Challenge <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
