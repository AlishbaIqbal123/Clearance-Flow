# Deployment Guide
## University Clearance Management System

This guide provides step-by-step instructions for deploying the University Clearance Management System to production environments.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Production Configuration](#production-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js v18+ 
- MongoDB v6+
- npm or yarn
- Git

### Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB SSD minimum
- **OS**: Ubuntu 22.04 LTS (recommended) or any Linux distribution

### Domain & DNS
- Registered domain name
- DNS access for subdomain configuration
- SSL certificate (Let's Encrypt recommended)

---

## Environment Setup

### 1. Server Preparation (Ubuntu)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx ufw

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Allow MongoDB (only from localhost or specific IPs)
sudo ufw allow from 127.0.0.1 to any port 27017

# Check status
sudo ufw status
```

---

## Database Deployment

### 1. MongoDB Configuration

```bash
# Create MongoDB admin user
mongosh
```

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use university_clearance
db.createUser({
  user: "clearance_app",
  pwd: "your-app-password",
  roles: [ { role: "readWrite", db: "university_clearance" } ]
})
```

### 2. Enable MongoDB Authentication

```bash
sudo nano /etc/mongod.conf
```

Add/modify:
```yaml
security:
  authorization: enabled

net:
  bindIp: 127.0.0.1
  port: 27017

storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
```

```bash
sudo systemctl restart mongod
```

### 3. Database Backup Script

```bash
sudo nano /opt/backup-mongodb.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="university_clearance"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mongodump --db $DB_NAME --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

# Log backup
echo "[$DATE] MongoDB backup completed: backup_$DATE.tar.gz" >> /var/log/mongodb-backup.log
```

```bash
sudo chmod +x /opt/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/backup-mongodb.sh" | sudo crontab -
```

---

## Backend Deployment

### 1. Clone Repository

```bash
cd /var/www
sudo git clone https://your-repo/university-clearance-system.git
sudo chown -R $USER:$USER university-clearance-system
```

### 2. Install Dependencies

```bash
cd university-clearance-system/backend
npm install --production
```

### 3. Environment Configuration

```bash
cp .env.example .env
nano .env
```

```env
# Production Environment
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://clearance.university.edu.pk

# Database
MONGODB_URI=mongodb://clearance_app:your-app-password@localhost:27017/university_clearance?authSource=university_clearance

# JWT (Use strong, random values)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Email (Use university SMTP)
SMTP_HOST=smtp.university.edu.pk
SMTP_PORT=587
SMTP_USER=clearance@university.edu.pk
SMTP_PASS=your-email-password
EMAIL_FROM=clearance@university.edu.pk
EMAIL_FROM_NAME="University Clearance System"

# Optional: Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional: Cloudinary for file storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
BCRYPT_SALT_ROUNDS=12
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. PM2 Configuration

```bash
pm2 init simple
```

Edit `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'university-clearance-api',
    script: './server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    watch: false,
    kill_timeout: 5000,
    listen_timeout: 10000,
    // Auto-restart on failure
    autorestart: true,
    // Don't restart if crashing too fast
    exp_backoff_restart_delay: 100
  }]
};
```

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup script
sudo pm2 startup systemd
```

### 6. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/clearance-api
```

```nginx
upstream clearance_backend {
    least_conn;
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    # Add more instances if scaling
    # server 127.0.0.1:5001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.clearance.university.edu.pk;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy to Node.js
    location / {
        proxy_pass http://clearance_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://clearance_backend/health;
        limit_req off;
    }

    # Logs
    access_log /var/log/nginx/clearance-api-access.log;
    error_log /var/log/nginx/clearance-api-error.log;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/clearance-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Frontend Deployment

### 1. Build Frontend

```bash
cd /var/www/university-clearance-system/frontend

# Install dependencies
npm install

# Create production environment
cp .env.example .env.production
```

Edit `.env.production`:

```env
VITE_API_URL=https://api.clearance.university.edu.pk/api
VITE_SOCKET_URL=https://api.clearance.university.edu.pk
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

```bash
# Build for production
npm run build
```

### 2. Nginx Configuration for Frontend

```bash
sudo nano /etc/nginx/sites-available/clearance-frontend
```

```nginx
server {
    listen 80;
    server_name clearance.university.edu.pk;
    root /var/www/university-clearance-system/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.clearance.university.edu.pk;" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }

    # Logs
    access_log /var/log/nginx/clearance-frontend-access.log;
    error_log /var/log/nginx/clearance-frontend-error.log;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/clearance-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates for both domains
sudo certbot --nginx -d clearance.university.edu.pk -d api.clearance.university.edu.pk

# Auto-renewal test
sudo certbot renew --dry-run
```

### Manual SSL Configuration

If using custom certificates:

```bash
# Copy certificates
sudo mkdir -p /etc/nginx/ssl
sudo cp your-certificate.crt /etc/nginx/ssl/clearance.crt
sudo cp your-private.key /etc/nginx/ssl/clearance.key

# Update Nginx config
sudo nano /etc/nginx/sites-available/clearance-api
```

Add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name api.clearance.university.edu.pk;

    ssl_certificate /etc/nginx/ssl/clearance.crt;
    ssl_certificate_key /etc/nginx/ssl/clearance.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.clearance.university.edu.pk;
    return 301 https://$server_name$request_uri;
}
```

---

## Production Configuration

### 1. Environment Variables Checklist

```bash
# Backend .env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://clearance.university.edu.pk
MONGODB_URI=mongodb://user:pass@localhost:27017/university_clearance
JWT_SECRET=minimum-32-characters-random-string
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.university.edu.pk
SMTP_PORT=587
SMTP_USER=clearance@university.edu.pk
SMTP_PASS=secure-password
EMAIL_FROM=clearance@university.edu.pk
```

### 2. Security Hardening

```bash
# Secure .env files
chmod 600 /var/www/university-clearance-system/backend/.env

# Disable server tokens
sudo nano /etc/nginx/nginx.conf
```

Add:
```nginx
http {
    server_tokens off;
    # ...
}
```

### 3. Log Rotation

```bash
sudo nano /etc/logrotate.d/university-clearance
```

```
/var/www/university-clearance-system/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        pm2 reload university-clearance-api
    endscript
}
```

---

## Monitoring & Logging

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs university-clearance-api

# Monitor in real-time
pm2 monit

# View status
pm2 status

# Restart application
pm2 restart university-clearance-api
```

### 2. Application Health Check

```bash
# Test API health
curl https://api.clearance.university.edu.pk/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### 3. MongoDB Monitoring

```bash
# Check MongoDB status
sudo systemctl status mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Check database stats
mongosh university_clearance --eval "db.stats()"
```

### 4. Nginx Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/clearance-api-access.log

# View error logs
sudo tail -f /var/log/nginx/clearance-api-error.log
```

### 5. Setup Log Aggregation (Optional)

For centralized logging, consider:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Graylog
- Datadog
- New Relic

---

## Backup Strategy

### 1. Database Backups

Already configured in [Database Deployment](#database-deployment) section.

### 2. Application Backups

```bash
sudo nano /opt/backup-application.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/university-clearance-system"

mkdir -p $BACKUP_DIR

# Backup application code
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Backup environment files
cp $APP_DIR/backend/.env $BACKUP_DIR/env_backup_$DATE

# Backup Nginx configs
tar -czf $BACKUP_DIR/nginx_backup_$DATE.tar.gz /etc/nginx/sites-available/

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "env_backup_*" -mtime +30 -delete
```

```bash
sudo chmod +x /opt/backup-application.sh
echo "0 3 * * * /opt/backup-application.sh" | sudo crontab -
```

### 3. Offsite Backups

Sync to cloud storage:

```bash
# Using rclone for cloud sync
sudo apt install rclone

# Configure rclone
rclone config

# Add to backup script
rclone sync /var/backups/ remote:university-clearance-backups
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh --username clearance_app --password --authenticationDatabase university_clearance
```

#### 2. Application Won't Start

```bash
# Check PM2 logs
pm2 logs

# Check for port conflicts
sudo netstat -tlnp | grep 5000

# Test manually
cd /var/www/university-clearance-system/backend
node server.js
```

#### 3. Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/clearance-api-error.log

# Test backend directly
curl http://localhost:5000/health
```

#### 4. SSL Certificate Issues

```bash
# Test SSL
openssl s_client -connect clearance.university.edu.pk:443

# Renew certificates
sudo certbot renew

# Check certificate expiry
echo | openssl s_client -servername clearance.university.edu.pk -connect clearance.university.edu.pk:443 2>/dev/null | openssl x509 -noout -dates
```

### Emergency Recovery

```bash
# 1. Stop application
pm2 stop all

# 2. Restore from backup
sudo tar -xzf /var/backups/application/app_backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/university-clearance-system

# 3. Restore database
mongorestore --db university_clearance /var/backups/mongodb/backup_YYYYMMDD_HHMMSS/university_clearance

# 4. Restart services
pm2 start all
sudo systemctl restart nginx
```

---

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple Backend Instances**: Run on different ports
3. **MongoDB Replica Set**: For high availability
4. **Redis**: For session management and caching

### Vertical Scaling

1. **Increase Server Resources**: CPU, RAM
2. **Database Optimization**: Indexes, query optimization
3. **CDN**: For static assets

---

*Last Updated: April 2024*