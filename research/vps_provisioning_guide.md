# VPS Provisioning Guide (Ubuntu 24.04)

This guide walks you through securing a freshly provisioned Ubuntu 24.04 VPS. These are manual steps you should perform immediately after the server is created by your cloud provider (DigitalOcean, Linode, Hetzner, etc.).

## 1. Initial Login via SSH
You should have added your SSH public key to your cloud provider when creating the droplet/server.
```bash
ssh root@YOUR_VPS_IP
```

## 2. Create a Non-Root Sudo User
Working as root is dangerous. We will create a new user (replace `sysadmin` with your preferred username).

```bash
# Create the user
adduser sysadmin

# Add the user to the sudo group so they can perform admin tasks
usermod -aG sudo sysadmin
```

## 3. Copy SSH Keys to the New User
We need to copy the authorized SSH keys from root so you can log in as the new user securely.

```bash
rsync --archive --chown=sysadmin:sysadmin ~/.ssh /home/sysadmin
```

## 4. Test the New User Login
**Do not close your root terminal yet.** Open a **new** terminal tab on your local machine and ensure you can log in:

```bash
ssh sysadmin@YOUR_VPS_IP
```
Verify you can use sudo: `sudo ls -la /root`

## 5. Disable Root Login and Password Authentication
Once you confirm your new user works, switch back to your `root` terminal (or use `sudo` on your new user) to lock down SSH.

Open the SSH daemon configuration:
```bash
sudo nano /etc/ssh/sshd_config
```

Find and modify the following lines (uncomment them if they have a `#` in front):
```text
PermitRootLogin no
PasswordAuthentication no
```

Save the file and restart the SSH service:
```bash
sudo systemctl restart ssh
```

## 6. Configure UFW (Uncomplicated Firewall)
By default, block all incoming traffic except SSH, HTTP, and HTTPS.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (very important to do this before enabling UFW!)
sudo ufw allow OpenSSH

# Allow Nginx web traffic
sudo ufw allow 'Nginx Full'

# Enable the firewall
sudo ufw enable

# Check status
sudo ufw status
```
Your server is now locked down and ready to run the automated LEMP stack setup script.
