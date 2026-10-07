import requests
from bs4 import BeautifulSoup
import json
import re

urls = {
    "postgres explain visualizer": [
        "https://pgexplain.dev/",
        "https://explain.dalibo.com/",
        "https://github.com/dalibo/pev2"
    ],
    "how to read postgres explain": [
        "https://www.postgresql.org/docs/current/using-explain.html",
        "https://thoughtbot.com/blog/reading-an-explain-analyze-query-plan",
        "https://medium.easyread.co/today-i-learned-understanding-postgres-explain-query-5670dd042c99"
    ],
    "fix slow query postgres": [
        "https://www.reddit.com/r/dataengineering/comments/15jlrkd/fixing_slow_queries_in_postgresql/",
        "https://render.com/blog/postgresql-top-cause-slow-queries",
        "https://dev.to/piteradyson/postgresql-slow-queries-7-ways-to-find-and-fix-performance-bottlenecks-2app"
    ],
    "tools to find slow queries postgres": [
        "https://www.reddit.com/r/PostgreSQL/comments/1wnr08i/any_good_tools_for_identifying_slow_or/",
        "https://www.linkedin.com/pulse/how-capture-slow-query-postgres-database-prateek-jain-plirc",
        "https://aiven.io/docs/products/postgresql/howto/identify-pg-slow-queries"
    ],
    "hypopg tutorial": [
        "https://www.cybrosys.com/research-and-development/postgres/how-to-use-postgresql-hypopg-extension-to-test-indexes-without-creating-them",
        "https://valerieparhamthompson.com/posts/query-optimization-with-hypopg/",
        "https://hypopg.readthedocs.io/en/rel1_stable/usage.html"
    ]
}

results = {}
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

for keyword, url_list in urls.items():
    results[keyword] = []
    for url in url_list:
        try:
            print(f"Fetching {url}...")
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                text = soup.get_text(separator=' ')
                word_count = len(re.findall(r'\w+', text))
                headings = len(soup.find_all(['h1', 'h2', 'h3']))
                code_blocks = len(soup.find_all(['pre', 'code']))
                images = len(soup.find_all('img'))
                
                # Check for schema
                schemas = soup.find_all('script', type='application/ld+json')
                has_schema = len(schemas) > 0
                
                # Check for forms/interactive elements
                has_tools = len(soup.find_all(['form', 'textarea'])) > 0 or 'explain' in url or 'pev2' in url
                
                results[keyword].append({
                    "url": url,
                    "word_count": word_count,
                    "headings": headings,
                    "code_blocks": code_blocks,
                    "images": images,
                    "has_schema": has_schema,
                    "has_interactive_tool": has_tools
                })
            else:
                results[keyword].append({"url": url, "error": f"Status {resp.status_code}"})
        except Exception as e:
            results[keyword].append({"url": url, "error": str(e)})

with open('/Users/divyansh/code/QueryLens/research/competitor_analysis.json', 'w') as f:
    json.dump(results, f, indent=2)
print("Analysis complete.")
