import requests
import sys
import time

def verify_deployment(base_url: str):
    print(f"Starting deployment verification against: {base_url}")
    print("-" * 50)
    
    passed = 0
    failed = 0
    
    def check(name, url, method='GET', json_data=None, expected_status=200):
        nonlocal passed, failed
        try:
            print(f"Testing {name} ({method} {url})... ", end="")
            if method == 'GET':
                res = requests.get(url, timeout=15)
            else:
                res = requests.post(url, json=json_data, timeout=15)
                
            if res.status_code == expected_status:
                print("✅ PASS")
                passed += 1
                return res.json()
            else:
                print(f"❌ FAIL (Status {res.status_code})")
                print(res.text)
                failed += 1
                return None
        except Exception as e:
            print(f"❌ FAIL (Error: {str(e)})")
            failed += 1
            return None

    # 1. Check Ping (Keep-warm)
    check("Ping", f"{base_url}/api/ping")
    
    # 2. Check Health
    check("Health Check", f"{base_url}/api/health")
    
    # 3. Check Dataset Status
    print("Waiting for dataset to be ready...", end="")
    ready = False
    for i in range(10):
        try:
            res = requests.get(f"{base_url}/api/dataset-status")
            if res.status_code == 200 and res.json().get("ready"):
                ready = True
                print(" ✅ PASS")
                passed += 1
                break
        except:
            pass
        time.sleep(2)
        print(".", end="", flush=True)
        
    if not ready:
        print(" ❌ FAIL (Dataset not seeded in time)")
        failed += 1

    # 4. Run Sample EXPLAIN
    explain_res = check("EXPLAIN Endpoint", f"{base_url}/api/explain", method='POST', json_data={
        "query": "SELECT * FROM customers LIMIT 10;"
    })

    # 5. Run HypoPG (Suggest Indexes)
    suggest_res = check("Suggest Indexes (HypoPG)", f"{base_url}/api/suggest-indexes", method='POST', json_data={
        "query": "SELECT * FROM orders WHERE customer_id = 5;"
    })

    # 6. Run Workload to populate pg_stat_statements
    check("Run Workload", f"{base_url}/api/run-workload", method='POST', json_data={})

    # 7. Check Slow Queries (pg_stat_statements)
    slow_res = check("Slow Queries (pg_stat_statements)", f"{base_url}/api/slow-queries")
    if slow_res and len(slow_res.get("queries", [])) == 0:
        print("⚠️  Warning: pg_stat_statements is empty. This might be a permissions issue or workload hasn't registered yet.")

    print("-" * 50)
    print(f"Verification Complete: {passed} Passed, {failed} Failed")
    
    if failed > 0:
        sys.exit(1)

    print("\nFinal Live URL List:")
    print(f"Frontend: {base_url}/")
    print(f"Health Check: {base_url}/api/health")
    print(f"Keep-Warm Ping: {base_url}/api/ping")
    print(f"EXPLAIN API: {base_url}/api/explain (POST)")
    print(f"Dataset Status: {base_url}/api/dataset-status")
    print(f"Slow Queries: {base_url}/api/slow-queries")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_deployment.py <base_url>")
        print("Example: python verify_deployment.py https://querylens-xxxx.onrender.com")
        sys.exit(1)
        
    verify_deployment(sys.argv[1].rstrip('/'))
