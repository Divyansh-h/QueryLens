#!/bin/bash

# Usage: sudo ./wp_cli_setup.sh yourdomain.com
# This script uses WP-CLI to download, install, and configure WordPress.

DOMAIN=${1:-"[DOMAIN]"}
WP_PATH="/var/www/$DOMAIN"
EVIDENCE_DIR="/evidence"
LOG_FILE="${EVIDENCE_DIR}/wordpress_setup.log"

# Site settings
ADMIN_USER="querylens_admin"
ADMIN_PASSWORD="SecureAdminPassword123!"
ADMIN_EMAIL="admin@$DOMAIN"
SITE_TITLE="QueryLens - Postgres EXPLAIN Visualizer & Optimizer"

# DB Settings (matching wp_domain_setup.sh)
DB_NAME="wordpress_db"
DB_USER="wordpress_user"
DB_PASS="SecurePassword123!"

# Ensure the script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo"
  exit 1
fi

mkdir -p "$EVIDENCE_DIR"

# Redirect all output to log file and console
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=========================================================="
echo "Starting WP-CLI Setup for $DOMAIN - $(date)"
echo "=========================================================="

# 1. Install WP-CLI if it doesn't exist
if ! command -v wp &> /dev/null; then
    echo "Installing WP-CLI..."
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x wp-cli.phar
    mv wp-cli.phar /usr/local/bin/wp
fi

# Switch to the web directory
cd "$WP_PATH" || exit

# 2. Download WordPress core
echo "[1/6] Downloading WordPress..."
sudo -u www-data wp core download

# 3. Create wp-config.php
echo "[2/6] Generating wp-config.php..."
sudo -u www-data wp config create --dbname="$DB_NAME" --dbuser="$DB_USER" --dbpass="$DB_PASS" --dbhost="localhost" --dbprefix="ql_"

# 4. Install WordPress
echo "[3/6] Installing WordPress Database..."
sudo -u www-data wp core install --url="https://$DOMAIN" --title="$SITE_TITLE" --admin_user="$ADMIN_USER" --admin_password="$ADMIN_PASSWORD" --admin_email="$ADMIN_EMAIL" --skip-email

# 5. Configure Permalinks
echo "[4/6] Configuring Permalinks (/%postname%/)..."
sudo -u www-data wp rewrite structure '/%postname%/' --hard
sudo -u www-data wp rewrite flush

# 6. Install Lightweight Theme
echo "[5/6] Installing and activating Astra theme..."
# Astra or GeneratePress are standard lightweight themes for SEO sites
sudo -u www-data wp theme install astra --activate
# Remove default themes
sudo -u www-data wp theme delete twentytwentytwo twentytwentythree twentytwentyfour

# 7. Clean up default content
echo "[6/6] Removing default content & setting up Architecture Tree..."
sudo -u www-data wp post delete 1 --force # Hello World post
sudo -u www-data wp post delete 2 --force # Sample Page
sudo -u www-data wp post delete 3 --force # Privacy Policy
sudo -u www-data wp plugin delete hello akismet

# Create Primary Pages
echo "Creating Primary Pages..."
HOME_ID=$(sudo -u www-data wp post create --post_type=page --post_title="Home" --post_status=publish --porcelain)
ABOUT_ID=$(sudo -u www-data wp post create --post_type=page --post_title="About Us" --post_status=publish --porcelain)
VISUALIZER_ID=$(sudo -u www-data wp post create --post_type=page --post_title="Postgres EXPLAIN Visualizer" --post_name="visualizer" --post_status=publish --porcelain)
GLOSSARY_ID=$(sudo -u www-data wp post create --post_type=page --post_title="Glossary" --post_name="glossary" --post_status=publish --porcelain)

# Set "Home" as the front page
sudo -u www-data wp option update show_on_front 'page'
sudo -u www-data wp option update page_on_front "$HOME_ID"

# Create Blog Categories based on Architecture Tree
echo "Creating Blog Categories..."
sudo -u www-data wp term create category "EXPLAIN Guides" --slug=explain
sudo -u www-data wp term create category "Indexing" --slug=indexing
sudo -u www-data wp term create category "Performance Tuning" --slug=performance
sudo -u www-data wp term create category "Tools" --slug=tools
# Delete default "Uncategorized" category (usually term ID 1)
sudo -u www-data wp term delete category 1

echo "=========================================================="
echo "WP-CLI Setup Complete!"
echo "Your WordPress site is now structured and ready for content."
echo "Log saved to: $LOG_FILE"
echo "=========================================================="
