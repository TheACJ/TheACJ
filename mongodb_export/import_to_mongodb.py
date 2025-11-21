#!/usr/bin/env python3
"""
One-Click MongoDB Import Script
===============================

This script automatically imports all exported JSON files to MongoDB.
Replace the MONGODB_URI with your connection string.

Usage:
    python import_to_mongodb.py

Requirements:
    - pymongo: pip install pymongo
"""

import json
import sys
from pathlib import Path
import pymongo
from pymongo import MongoClient


def import_to_mongodb():
    """Import all JSON files to MongoDB"""
    
    print("🚀 One-Click MongoDB Import Starting...")
    print("=" * 50)
    
    # Configuration
    MONGODB_URI = "mongodb+srv://theacj:0953Amanda@theacj.lejvcy0.mongodb.net/?appName=TheACJ"
    DATABASE_NAME = "portfolio"
    
    try:
        # Connect to MongoDB
        print("📡 Connecting to MongoDB...")
        client = MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        
        # Test connection
        client.admin.command('ping')
        print("   ✅ Connected to MongoDB successfully")
        
        # Import collections in order (dependencies first)
        collections = [
            ('categories', 'categories.json'),
            ('blog_posts', 'blog_posts.json'),
            ('work_items', 'work_items.json'),
            ('contacts', 'contacts.json')
        ]
        
        import_stats = {'imported': 0, 'errors': 0}
        
        for collection_name, filename in collections:
            print(f"\n📁 Importing {collection_name}...")
            
            # Check if file exists
            if not Path(filename).exists():
                print(f"   ⚠️  File {filename} not found, skipping...")
                continue
            
            # Load JSON data
            try:
                with open(filename, 'r') as f:
                    data = json.load(f)
            except Exception as e:
                print(f"   ❌ Error reading {filename}: {e}")
                import_stats['errors'] += 1
                continue
            
            if not data:
                print(f"   ℹ️  No data in {filename}, skipping...")
                continue
            
            # Import to MongoDB
            try:
                collection = db[collection_name]
                
                # Clear existing data (optional - remove if you want to keep existing)
                # collection.delete_many({})
                
                # Insert data
                if isinstance(data, list):
                    result = collection.insert_many(data)
                    count = len(result.inserted_ids)
                else:
                    result = collection.insert_one(data)
                    count = 1
                
                print(f"   ✅ Imported {count} {collection_name}")
                import_stats['imported'] += count
                
            except Exception as e:
                print(f"   ❌ Error importing {collection_name}: {e}")
                import_stats['errors'] += 1
        
        # Create indexes for better performance
        print("\n🔧 Creating MongoDB indexes...")
        try:
            # Blog posts indexes
            db.blog_posts.create_index([('slug', 1)], unique=True)
            db.blog_posts.create_index([('status', 1)])
            db.blog_posts.create_index([('created_at', -1)])
            
            # Work items indexes
            db.work_items.create_index([('slug', 1)], unique=True)
            db.work_items.create_index([('status', 1)])
            db.work_items.create_index([('category', 1)])
            
            # Contacts indexes
            db.contacts.create_index([('email', 1)])
            db.contacts.create_index([('created_at', -1)])
            db.contacts.create_index([('is_read', 1)])
            
            # Categories indexes
            db.categories.create_index([('slug', 1)], unique=True)
            db.categories.create_index([('type', 1)])
            
            print("   ✅ Indexes created successfully")
            
        except Exception as e:
            print(f"   ⚠️  Error creating indexes: {e}")
        
        # Summary
        print("\n" + "=" * 50)
        print("✅ MONGODB IMPORT COMPLETED!")
        print(f"📊 Total imported: {import_stats['imported']} records")
        print(f"❌ Total errors: {import_stats['errors']}")
        print(f"🏆 Database: {DATABASE_NAME}")
        print("\nNext steps:")
        print("1. Start your Node.js admin server: npm start")
        print("2. Access admin: http://localhost:5000/admin/login")
        print("3. Login with: admin@theacj.com / admin123")
        print("4. Check your dashboard - all content should be visible!")
        print("=" * 50)
        
        # Close connection
        client.close()
        return import_stats['errors'] == 0
        
    except Exception as e:
        print(f"❌ MongoDB import failed: {e}")
        return False


def main():
    """Main function"""
    
    # Change to the script's directory
    script_dir = Path(__file__).parent
    import os
    os.chdir(script_dir)
    
    success = import_to_mongodb()
    
    if success:
        print("\n🎉 Migration successful! Enjoy your new admin interface!")
        sys.exit(0)
    else:
        print("\n💥 Migration failed! Check the errors above.")
        sys.exit(1)


if __name__ == '__main__':
    main()