# SQLite to MongoDB Migration Guide

This guide provides instructions for migrating your existing SQLite3 data to MongoDB for The ACJ Portfolio admin system.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [SQLite Database Structure](#sqlite-database-structure)
4. [Usage](#usage)
5. [Examples](#examples)
6. [Troubleshooting](#troubleshooting)
7. [Data Mapping](#data-mapping)

---

## 🔧 Prerequisites

### Required Software
- **Python 3.7+**
- **MongoDB Atlas account** or local MongoDB instance
- **SQLite3 database** with your portfolio data

### Required Python Packages
```bash
pip install -r requirements.txt
```

---

## 📦 Installation

### 1. Install Python Dependencies
```bash
cd nodejs-backend
pip install -r requirements.txt
```

### 2. Verify MongoDB Connection
Ensure your `.env` file contains the correct MongoDB URI:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

---

## 🗃️ SQLite Database Structure

The migration script expects your SQLite database to have the following tables:

### `blog_posts` table
```sql
CREATE TABLE blog_posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    slug TEXT UNIQUE,
    status TEXT DEFAULT 'draft',
    author TEXT,
    featured_image TEXT,
    tags TEXT, -- Comma-separated values
    category_id INTEGER,
    created_at DATETIME,
    updated_at DATETIME,
    published_at DATETIME
);
```

### `work_items` table
```sql
CREATE TABLE work_items (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    technologies TEXT, -- Comma-separated values
    project_url TEXT,
    github_url TEXT,
    status TEXT DEFAULT 'draft',
    featured_image TEXT,
    gallery_images TEXT, -- Comma-separated values
    category_id INTEGER,
    start_date DATE,
    end_date DATE,
    created_at DATETIME,
    updated_at DATETIME
);
```

### `contacts` table
```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    replied INTEGER DEFAULT 0,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME,
    updated_at DATETIME
);
```

### `categories` table
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    type TEXT DEFAULT 'blog', -- 'blog' or 'work'
    parent_id INTEGER,
    created_at DATETIME,
    updated_at DATETIME
);
```

---

## 🚀 Usage

### Basic Usage
```bash
python migrate_from_sqlite.py
```

This will:
1. Connect to `portfolio.db` (default)
2. Use MongoDB URI from `.env` file
3. Migrate all data from SQLite to MongoDB

### Advanced Usage

#### Specify SQLite Database
```bash
python migrate_from_sqlite.py --sqlite-db /path/to/your/database.db
```

#### Specify MongoDB URI
```bash
python migrate_from_sqlite.py --mongodb-uri "mongodb+srv://user:pass@cluster.mongodb.net/db"
```

#### Specify Environment File
```bash
python migrate_from_sqlite.py --env-file production.env
```

### Command Line Options
```
--sqlite-db       Path to SQLite database file (default: portfolio.db)
--mongodb-uri     MongoDB connection URI (overrides .env file)
--env-file        Path to environment file (default: .env)
```

---

## 📖 Examples

### Example 1: Basic Migration
```bash
# Install dependencies
pip install -r requirements.txt

# Run migration with default settings
python migrate_from_sqlite.py
```

### Example 2: Custom Database Path
```bash
python migrate_from_sqlite.py --sqlite-db /home/user/old_portfolio.db
```

### Example 3: Production Environment
```bash
python migrate_from_sqlite.py --env-file production.env --mongodb-uri "mongodb+srv://prod-user:pass@prod-cluster.mongodb.net/portfolio"
```

---

## 🔍 Data Mapping

### SQLite → MongoDB Transformations

#### Blog Posts
- `tags` (string) → `tags` (array)
- `category_id` → `category` (ObjectId)
- `created_at` (string) → `created_at` (Date)

#### Work Items
- `technologies` (string) → `technologies` (array)
- `gallery_images` (string) → `gallery_images` (array)
- `start_date` (string) → `start_date` (Date)

#### Contacts
- `is_read` (0/1) → `is_read` (boolean)
- `replied` (0/1) → `replied` (boolean)

#### Categories
- `parent_id` → `parent_id` (ObjectId)
- `type` → `type` (enum: 'blog', 'work')

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
**Error**: `Failed to connect to MongoDB`
**Solutions**:
- Check MongoDB URI in `.env` file
- Verify IP whitelist in MongoDB Atlas
- Ensure MongoDB cluster is running

#### 2. SQLite Database Not Found
**Error**: `SQLite database file not found`
**Solutions**:
- Verify the database file path
- Check file permissions
- Ensure the database file exists

#### 3. Import Errors
**Error**: `ModuleNotFoundError: No module named 'pymongo'`
**Solutions**:
```bash
pip install -r requirements.txt
```

#### 4. Column Not Found
**Error**: `Column 'column_name' not found`
**Solutions**:
- Check SQLite table schema matches expected structure
- Modify script if your database has different column names

#### 5. Data Type Conversion Errors
**Error**: `Could not parse datetime`
**Solutions**:
- Check datetime format in SQLite database
- The script supports multiple formats: `%Y-%m-%d %H:%M:%S`, `%Y-%m-%dT%H:%M:%S`, etc.

### Log Files
The migration script creates detailed logs:
- **Console output**: Real-time migration progress
- **migration.log**: Detailed log file with all operations

### Debug Mode
To see detailed debug information, modify the logging level in the script:
```python
logging.basicConfig(level=logging.DEBUG)
```

---

## 📊 Migration Statistics

After migration, you'll see a summary like this:
```
==================================================
MIGRATION SUMMARY
==================================================
blog_posts: 25 migrated, 0 errors
work_items: 12 migrated, 0 errors
contacts: 8 migrated, 0 errors
categories: 5 migrated, 0 errors

Total: 50 records migrated, 0 errors
✅ Migration completed successfully!
==================================================
```

---

## 🔒 Security Notes

1. **Backup Your Data**: Always backup your SQLite database before migration
2. **MongoDB Security**: Ensure your MongoDB instance is properly secured
3. **Environment Variables**: Never commit `.env` files to version control
4. **Access Control**: Use read-only credentials when possible

---

## 🎯 Post-Migration Steps

After successful migration:

1. **Verify Data**: Check MongoDB collections contain correct data
2. **Update Connection**: Ensure your Node.js app uses the new MongoDB URI
3. **Test Application**: Verify the admin interface works with migrated data
4. **Remove Old Data**: Delete SQLite database (after verification)
5. **Create Indexes**: The script automatically creates MongoDB indexes

---

## 📞 Support

If you encounter issues during migration:

1. Check the `migration.log` file for detailed error messages
2. Verify your SQLite database structure matches the expected schema
3. Ensure MongoDB connection details are correct
4. Review this troubleshooting section

---

**Migration Script Version**: 1.0.0  
**Last Updated**: November 19, 2025  
**Author**: The ACJ