#!/usr/bin/env python3
"""
Django to MongoDB Migration Script
==================================

This script migrates data from Django SQLite database to MongoDB.
Specifically handles Django models: Home_blogpost, Home_workitem, Home_contact, Home_category.

Usage:
    python migrate_django_to_mongodb.py [options]

Requirements:
    - pymongo: pip install pymongo
    - python-dotenv: pip install python-dotenv

Author: The ACJ
Date: November 2025
"""

import sqlite3
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
import pymongo
from pymongo import MongoClient
from bson import ObjectId
import argparse


class DjangoToMongoDBMigrator:
    """Migrator for Django SQLite to MongoDB"""
    
    def __init__(self, sqlite_db_path, mongodb_uri):
        self.sqlite_db_path = sqlite_db_path
        self.mongodb_uri = mongodb_uri
        self.sqlite_conn = None
        self.mongo_client = None
        self.mongo_db = None
        self.migration_stats = {
            'blog_posts': {'migrated': 0, 'errors': 0},
            'work_items': {'migrated': 0, 'errors': 0},
            'contacts': {'migrated': 0, 'errors': 0},
            'categories': {'migrated': 0, 'errors': 0}
        }
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('django_migration.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def connect_sqlite(self):
        """Connect to SQLite database"""
        try:
            self.sqlite_conn = sqlite3.connect(self.sqlite_db_path)
            self.sqlite_conn.row_factory = sqlite3.Row
            self.logger.info(f"Connected to Django SQLite database: {self.sqlite_db_path}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to connect to SQLite: {e}")
            return False
    
    def connect_mongodb(self):
        """Connect to MongoDB"""
        try:
            self.mongo_client = MongoClient(self.mongodb_uri)
            self.mongo_db = self.mongo_client.get_database()
            
            # Test connection
            self.mongo_client.admin.command('ping')
            self.logger.info("Connected to MongoDB successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to connect to MongoDB: {e}")
            return False
    
    def close_connections(self):
        """Close database connections"""
        if self.sqlite_conn:
            self.sqlite_conn.close()
            self.logger.info("SQLite connection closed")
        
        if self.mongo_client:
            self.mongo_client.close()
            self.logger.info("MongoDB connection closed")
    
    def execute_query(self, query, params=None):
        """Execute a SQL query and return results"""
        try:
            cursor = self.sqlite_conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            return cursor.fetchall()
        except Exception as e:
            self.logger.error(f"SQL query failed: {e}")
            return []
    
    def migrate_categories(self):
        """Migrate Django categories to MongoDB"""
        self.logger.info("Starting categories migration...")
        
        categories = self.execute_query("SELECT * FROM Home_category")
        
        if not categories:
            self.logger.info("No categories found in Django database")
            return
        
        collection = self.mongo_db.categories
        
        for category in categories:
            try:
                category_data = dict(category)
                
                mongo_category = {
                    'name': category_data.get('name', ''),
                    'friendly_name': category_data.get('friendly_name', ''),
                    'slug': category_data.get('friendly_name', ''),
                    'type': 'blog',  # Default to blog type
                    'created_at': datetime.now(),
                    'updated_at': datetime.now()
                }
                
                mongo_category.pop('_id', None)
                
                result = collection.insert_one(mongo_category)
                self.migration_stats['categories']['migrated'] += 1
                self.logger.debug(f"Migrated category: {category_data.get('name')}")
                
            except Exception as e:
                self.migration_stats['categories']['errors'] += 1
                self.logger.error(f"Failed to migrate category '{category_data.get('name')}': {e}")
        
        self.logger.info(f"Categories migration completed: {self.migration_stats['categories']['migrated']} migrated, {self.migration_stats['categories']['errors']} errors")
    
    def migrate_blog_posts(self):
        """Migrate Django blog posts to MongoDB"""
        self.logger.info("Starting blog posts migration...")
        
        blog_posts = self.execute_query("SELECT * FROM Home_blogpost")
        
        if not blog_posts:
            self.logger.info("No blog posts found in Django database")
            return
        
        collection = self.mongo_db.blog_posts
        
        for post in blog_posts:
            try:
                post_data = dict(post)
                
                # Create slug from title
                slug = post_data.get('title', '').lower().replace(' ', '-').replace('🚀', '').replace(':', '')
                
                # Extract URL from link if available
                link = post_data.get('link', '')
                excerpt = ''
                if link and 'dev.to' in link:
                    excerpt = f"Originally published on Dev.to: {link}"
                
                mongo_post = {
                    'title': post_data.get('title', ''),
                    'content': post_data.get('content', ''),
                    'excerpt': excerpt,
                    'slug': slug,
                    'status': 'published',  # All Django posts are published
                    'author': 'The ACJ',
                    'featured_image': post_data.get('image', ''),
                    'image_url': post_data.get('image_url', ''),
                    'tags': ['tutorial', 'rust', 'solana'],  # Default tags
                    'category': post_data.get('category_id'),
                    'created_at': self.parse_datetime(post_data.get('date_published')),
                    'updated_at': self.parse_datetime(post_data.get('date_published')),
                    'published_at': self.parse_datetime(post_data.get('date_published'))
                }
                
                mongo_post.pop('_id', None)
                
                result = collection.insert_one(mongo_post)
                self.migration_stats['blog_posts']['migrated'] += 1
                self.logger.debug(f"Migrated blog post: {post_data.get('title')}")
                
            except Exception as e:
                self.migration_stats['blog_posts']['errors'] += 1
                self.logger.error(f"Failed to migrate blog post '{post_data.get('title')}': {e}")
        
        self.logger.info(f"Blog posts migration completed: {self.migration_stats['blog_posts']['migrated']} migrated, {self.migration_stats['blog_posts']['errors']} errors")
    
    def migrate_work_items(self):
        """Migrate Django work items to MongoDB"""
        self.logger.info("Starting work items migration...")
        
        work_items = self.execute_query("SELECT * FROM Home_workitem")
        
        if not work_items:
            self.logger.info("No work items found in Django database")
            return
        
        collection = self.mongo_db.work_items
        
        for item in work_items:
            try:
                item_data = dict(item)
                
                # Create slug from title
                slug = item_data.get('title', '').lower().replace(' ', '-').replace('_', '-')
                
                # Collect gallery images
                gallery_images = []
                for i in range(1, 4):  # image1, image2, image3
                    img_field = f'image{i}'
                    if item_data.get(img_field):
                        gallery_images.append(item_data.get(img_field))
                
                mongo_item = {
                    'title': item_data.get('title', ''),
                    'description': item_data.get('description', ''),
                    'technologies': self.determine_technologies(item_data.get('title', ''), item_data.get('category', '')),
                    'project_url': item_data.get('link', ''),
                    'github_url': '',
                    'status': 'published',
                    'featured_image': item_data.get('image', ''),
                    'gallery_images': gallery_images,
                    'category': item_data.get('category', '').lower().replace(' ', '-'),
                    'start_date': None,
                    'end_date': None,
                    'created_at': datetime.now(),
                    'updated_at': datetime.now()
                }
                
                mongo_item.pop('_id', None)
                
                result = collection.insert_one(mongo_item)
                self.migration_stats['work_items']['migrated'] += 1
                self.logger.debug(f"Migrated work item: {item_data.get('title')}")
                
            except Exception as e:
                self.migration_stats['work_items']['errors'] += 1
                self.logger.error(f"Failed to migrate work item '{item_data.get('title')}': {e}")
        
        self.logger.info(f"Work items migration completed: {self.migration_stats['work_items']['migrated']} migrated, {self.migration_stats['work_items']['errors']} errors")
    
    def migrate_contacts(self):
        """Migrate Django contacts to MongoDB"""
        self.logger.info("Starting contacts migration...")
        
        contacts = self.execute_query("SELECT * FROM Home_contact")
        
        if not contacts:
            self.logger.info("No contacts found in Django database")
            return
        
        collection = self.mongo_db.contacts
        
        for contact in contacts:
            try:
                contact_data = dict(contact)
                
                mongo_contact = {
                    'name': contact_data.get('name', ''),
                    'email': contact_data.get('email', ''),
                    'subject': contact_data.get('subject', ''),
                    'message': contact_data.get('message', ''),
                    'is_read': False,
                    'replied': False,
                    'ip_address': '',
                    'user_agent': '',
                    'created_at': self.parse_datetime(contact_data.get('created_at')),
                    'updated_at': self.parse_datetime(contact_data.get('created_at'))
                }
                
                mongo_contact.pop('_id', None)
                
                result = collection.insert_one(mongo_contact)
                self.migration_stats['contacts']['migrated'] += 1
                self.logger.debug(f"Migrated contact: {contact_data.get('name')}")
                
            except Exception as e:
                self.migration_stats['contacts']['errors'] += 1
                self.logger.error(f"Failed to migrate contact '{contact_data.get('name')}': {e}")
        
        self.logger.info(f"Contacts migration completed: {self.migration_stats['contacts']['migrated']} migrated, {self.migration_stats['contacts']['errors']} errors")
    
    def determine_technologies(self, title, category):
        """Determine technologies based on title and category"""
        technologies = []
        
        title_lower = title.lower()
        category_lower = category.lower()
        
        # Web development keywords
        if 'react' in title_lower or 'web app' in category_lower:
            technologies.extend(['React', 'JavaScript', 'HTML', 'CSS'])
        
        if 'survey' in title_lower:
            technologies.extend(['Django', 'Python', 'HTML', 'CSS', 'JavaScript'])
        
        if 'ecommerce' in title_lower or 'shop' in title_lower:
            technologies.extend(['React', 'Node.js', 'MongoDB', 'Express'])
        
        if 'web app' in category_lower:
            technologies.extend(['React', 'JavaScript', 'CSS'])
        
        # Default technologies if none detected
        if not technologies:
            technologies = ['Web Development', 'JavaScript']
        
        return list(set(technologies))  # Remove duplicates
    
    def parse_datetime(self, dt_str):
        """Parse datetime string to datetime object"""
        if not dt_str:
            return datetime.now()
        
        try:
            # Django datetime format
            if 'T' in dt_str:
                return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S.%f')
            else:
                return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            self.logger.warning(f"Could not parse datetime: {dt_str}")
            return datetime.now()
    
    def create_indexes(self):
        """Create MongoDB indexes"""
        self.logger.info("Creating MongoDB indexes...")
        
        try:
            # Blog posts indexes
            self.mongo_db.blog_posts.create_index([('slug', 1)], unique=True)
            self.mongo_db.blog_posts.create_index([('status', 1)])
            self.mongo_db.blog_posts.create_index([('created_at', -1)])
            
            # Work items indexes
            self.mongo_db.work_items.create_index([('slug', 1)], unique=True)
            self.mongo_db.work_items.create_index([('status', 1)])
            self.mongo_db.work_items.create_index([('category', 1)])
            
            # Contacts indexes
            self.mongo_db.contacts.create_index([('email', 1)])
            self.mongo_db.contacts.create_index([('created_at', -1)])
            self.mongo_db.contacts.create_index([('is_read', 1)])
            
            # Categories indexes
            self.mongo_db.categories.create_index([('slug', 1)], unique=True)
            self.mongo_db.categories.create_index([('type', 1)])
            
            self.logger.info("MongoDB indexes created successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to create indexes: {e}")
    
    def run_migration(self):
        """Run the complete migration process"""
        self.logger.info("Starting Django to MongoDB migration...")
        
        try:
            if not self.connect_sqlite():
                return False
            
            if not self.connect_mongodb():
                return False
            
            # Run migrations in correct order
            self.migrate_categories()
            self.migrate_blog_posts()
            self.migrate_work_items()
            self.migrate_contacts()
            
            # Create indexes
            self.create_indexes()
            
            # Print summary
            self.print_migration_summary()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Migration failed: {e}")
            return False
            
        finally:
            self.close_connections()
    
    def print_migration_summary(self):
        """Print migration summary statistics"""
        self.logger.info("\n" + "="*60)
        self.logger.info("DJANGO TO MONGODB MIGRATION SUMMARY")
        self.logger.info("="*60)
        
        total_migrated = sum(stat['migrated'] for stat in self.migration_stats.values())
        total_errors = sum(stat['errors'] for stat in self.migration_stats.values())
        
        for table, stats in self.migration_stats.items():
            self.logger.info(f"{table}: {stats['migrated']} migrated, {stats['errors']} errors")
        
        self.logger.info(f"\nTotal: {total_migrated} records migrated, {total_errors} errors")
        
        if total_errors == 0:
            self.logger.info("✅ Django migration completed successfully!")
            self.logger.info("🎉 Your Django data is now in MongoDB!")
        else:
            self.logger.warning(f"⚠️  Migration completed with {total_errors} errors")
        
        self.logger.info("="*60)


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Migrate Django SQLite data to MongoDB')
    parser.add_argument('--sqlite-db', default='db.sqlite3',
                       help='Path to Django SQLite database file')
    parser.add_argument('--mongodb-uri',
                       help='MongoDB connection URI (overrides .env file)')
    parser.add_argument('--env-file', default='.env',
                       help='Path to environment file')
    
    args = parser.parse_args()
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv(args.env_file)
    except ImportError:
        print("Warning: python-dotenv not installed. Using system environment variables.")
    
    # Get MongoDB URI
    mongodb_uri = args.mongodb_uri or os.getenv('MONGODB_URI')
    if not mongodb_uri:
        print("Error: MongoDB URI not provided. Use --mongodb-uri or set MONGODB_URI in .env file")
        sys.exit(1)
    
    # Check if SQLite database exists
    if not os.path.exists(args.sqlite_db):
        print(f"Error: Django database file not found: {args.sqlite_db}")
        sys.exit(1)
    
    # Run migration
    migrator = DjangoToMongoDBMigrator(args.sqlite_db, mongodb_uri)
    success = migrator.run_migration()
    
    if success:
        print("✅ Django migration completed successfully!")
        print("\nNext steps:")
        print("1. Start your Node.js admin server")
        print("2. Access the admin interface at http://localhost:5000/admin/login")
        print("3. Login with: admin@theacj.com / admin123")
        print("4. Your migrated content will be available in the dashboard!")
        sys.exit(0)
    else:
        print("❌ Django migration failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()