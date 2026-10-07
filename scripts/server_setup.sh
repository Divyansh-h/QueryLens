#!/bin/bash

# Execute this script with sudo: sudo ./server_setup.sh
# This script installs a LEMP stack (Nginx, MariaDB, PHP 8.3-FPM) on Ubuntu 24.04

EVIDENCE_DIR="/evidence"
LOG_FILE="${EVIDENCE_DIR}/server_setup.log"

# Ensure the script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo"
  exit 1
fi

# Ensure the evidence directory exists
mkdir -p "$EVIDENCE_DIR"

# Redirect all output (stdout and stderr) to the log file, while also printing to console
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================================="
echo "Starting LEMP Stack Installation - $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "=========================================================="

echo "[1/6] Updating system packages..."
apt-get update -y
apt-get upgrade -y

echo "[2/6] Adding PHP repository..."
# Ubuntu 24.04 natively supports newer PHP, but we add ondrej/php to guarantee 8.3 and all extensions
apt-get install -y software-properties-common curl ca-certificates unzip
add-apt-repository -y ppa:ondrej/php
apt-get update -y

echo "[3/6] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

echo "[4/6] Installing MariaDB..."
apt-get install -y mariadb-server mariadb-client
systemctl enable mariadb
systemctl start mariadb

echo "[5/6] Installing PHP 8.3-FPM and common extensions (for WordPress/CMS)..."
apt-get install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-mbstring php8.3-xml php8.3-xmlrpc php8.3-soap php8.3-intl php8.3-zip

echo "[6/6] Securing MariaDB Installation..."
# This automates the mysql_secure_installation process
mysql -e "UPDATE mysql.global_priv SET priv=json_set(priv, '$.plugin', 'mysql_native_password', '$.authentication_string', PASSWORD('root_password_placeholder')) WHERE User='root';"
mysql -e "DELETE FROM mysql.global_priv WHERE User='';"
mysql -e "DELETE FROM mysql.global_priv WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

echo "=========================================================="
echo "Installation Complete."
echo "Nginx Version: $(nginx -v 2>&1)"
echo "MariaDB Version: $(mariadb --version)"
echo "PHP Version: $(php -v | head -n 1)"
echo "Log file saved to $LOG_FILE"
echo "=========================================================="
