#!/bin/bash

# Usage: ./check_dns.sh yourdomain.com
# If no domain is provided, it defaults to the placeholder [DOMAIN]

DOMAIN=${1:-"[DOMAIN]"}
EVIDENCE_DIR="evidence"
EVIDENCE_FILE="$EVIDENCE_DIR/dns_propagation.txt"

# Ensure the evidence directory exists
mkdir -p "$EVIDENCE_DIR"

# Add a timestamped header
echo "==========================================================" >> "$EVIDENCE_FILE"
echo "DNS Propagation Check - $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$EVIDENCE_FILE"
echo "Checking Domain: $DOMAIN" >> "$EVIDENCE_FILE"
echo "==========================================================" >> "$EVIDENCE_FILE"

# 1. Check A record for the root domain using dig
echo -e "\n[DIG] A Record for $DOMAIN:" >> "$EVIDENCE_FILE"
dig A "$DOMAIN" +short >> "$EVIDENCE_FILE" 2>&1

# 2. Check CNAME for the app subdomain using dig
echo -e "\n[DIG] CNAME Record for app.$DOMAIN:" >> "$EVIDENCE_FILE"
dig CNAME "app.$DOMAIN" +short >> "$EVIDENCE_FILE" 2>&1

# 3. Check full resolution for app subdomain using dig
echo -e "\n[DIG] A Record resolution for app.$DOMAIN:" >> "$EVIDENCE_FILE"
dig A "app.$DOMAIN" +short >> "$EVIDENCE_FILE" 2>&1

# 4. Fallback/Alternative check using nslookup for root domain
echo -e "\n[NSLOOKUP] Resolution for $DOMAIN:" >> "$EVIDENCE_FILE"
nslookup "$DOMAIN" >> "$EVIDENCE_FILE" 2>&1

# 5. Fallback/Alternative check using nslookup for app subdomain
echo -e "\n[NSLOOKUP] Resolution for app.$DOMAIN:" >> "$EVIDENCE_FILE"
nslookup "app.$DOMAIN" >> "$EVIDENCE_FILE" 2>&1

echo -e "\n----------------------------------------------------------\n" >> "$EVIDENCE_FILE"

echo "DNS propagation check completed for $DOMAIN."
echo "Results have been appended to $EVIDENCE_FILE"
