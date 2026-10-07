#!/bin/bash

# Usage: sudo ./wp_domain_setup.sh yourdomain.com
# This script sets up MariaDB for WordPress, configures Nginx, issues SSL via Certbot, and verifies the setup.

DOMAIN=${1:-"[DOMAIN]"}
DB_NAME="wordpress_db"
DB_USER="wordpress_user"
# Replace this with a strong, secure password in production!
DB_PASS="SecurePassword123!"

EVIDENCE_DIR="/evidence"
VERIFICATION_LOG="${EVIDENCE_DIR}/wp_setup_verification.txt"

# Ensure the script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo"
  exit 1
fi

mkdir -p "$EVIDENCE_DIR"

echo "=========================================================="
echo "Starting WordPress Domain Setup for $DOMAIN"
echo "=========================================================="

echo "[1/4] Configuring MariaDB Database..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "GRANT ALL ON ${DB_NAME}.* TO '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "FLUSH PRIVILEGES;"
echo "Database created successfully."

echo "[2/4] Configuring Nginx Server Block..."
# Create web root
mkdir -p /var/www/$DOMAIN
chown -R www-data:www-data /var/www/$DOMAIN

NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/$DOMAIN;
    index index.php index.html index.htm;

    # Caching Headers for Static Assets
    location ~* \.(jpg|jpeg|gif|png|webp|svg|woff|woff2|ttf|css|js|ico|xml)$ {
        access_log off;
        log_not_found off;
        expires 365d;
        add_header Cache-Control "public, no-transform";
    }

    # WordPress Permalinks
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }

    # Pass PHP scripts to FastCGI server
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to hidden files (e.g. .htaccess)
    location ~ /\.ht {
        deny all;
    }
}
EOF

# Enable the site
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
# Remove default Nginx page if it exists
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo "[3/4] Issuing SSL Certificate via Certbot..."
# Install certbot if missing
apt-get install -y certbot python3-certbot-nginx

# Request certificate
# Note: In a real run, you should add an email address: --email your@email.com --agree-tos
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --register-unsafely-without-email --agree-tos

echo "[4/4] Running Verification Checks..."

echo "==========================================================" >> "$VERIFICATION_LOG"
echo "Verification for $DOMAIN - $(date)" >> "$VERIFICATION_LOG"
echo "==========================================================" >> "$VERIFICATION_LOG"

echo "-> Checking HTTP Headers (curl -I)..."
echo "--- CURL HEADERS ---" >> "$VERIFICATION_LOG"
curl -I -L "https://$DOMAIN" >> "$VERIFICATION_LOG" 2>&1

echo "-> Checking SSL Certificate details (openssl)..."
echo -e "\n--- SSL CERTIFICATE INFO ---" >> "$VERIFICATION_LOG"
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates -issuer -subject >> "$VERIFICATION_LOG"

echo -e "\nSetup Complete!"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "Web Root: /var/www/$DOMAIN"
echo "Verification results saved to $VERIFICATION_LOG"
