#!/usr/bin/env python3
"""
SQLite3 to MongoDB Migration Script
===================================

This script migrates data from SQLite3 to MongoDB for The ACJ Portfolio.
It handles the migration of blog posts, work items, contacts, and categories.

Usage:
    python migrate_from_sqlite.py [options]

Requirements:
    - sqlite3 (built-in)
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


class SQLiteToMongoDBMigrator:
    """Main migration class for transferring data from SQLite to MongoDB"""
    
    def __init__(self, sqlite_db_path, mongodb_uri):
        """
        Initialize the migrator
        
        Args:
            sqlite_db_path (str): Path to SQLite database
            mongodb_uri (str): MongoDB connection URI
        """
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
                logging.FileHandler('migration.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def connect_sqlite(self):
        """Connect to SQLite database"""
        try:
            self.sqlite_conn = sqlite3.connect(self.sqlite_db_path)
            self.sqlite_conn.row_factory = sqlite3.Row  # Enable column access by name
            self.logger.info(f"Connected to SQLite database: {self.sqlite_db_path}")
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
    
    def get_table_schema(self, table_name):
        """Get the schema of a SQLite table"""
        try:
            cursor = self.sqlite_conn.cursor()
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            return [col[1] for col in columns]
        except Exception as e:
            self.logger.error(f"Failed to get schema for {table_name}: {e}")
            return []
    
    def migrate_blog_posts(self):
        """Migrate blog posts from SQLite to MongoDB"""
        self.logger.info("Starting blog posts migration...")
        
        # Get blog posts from SQLite
        blog_posts = self.execute_query("SELECT * FROM blog_posts")
        
        if not blog_posts:
            self.logger.info("No blog posts found in SQLite database")
            return
        
        # Get MongoDB collection
        collection = self.mongo_db.blog_posts
        
        for post in blog_posts:
            try:
                # Convert SQLite row to dictionary
                post_data = dict(post)
                
                # Transform data for MongoDB schema
                mongo_post = {
                    'title': post_data.get('title', ''),
                    'content': post_data.get('content', ''),
                    'excerpt': post_data.get('excerpt', ''),
                    'slug': post_data.get('slug', ''),
                    'status': post_data.get('status', 'draft'),
                    'author': post_data.get('author', ''),
                    'featured_image': post_data.get('featured_image', ''),
                    'tags': self.parse_tags(post_data.get('tags', '')),
                    'category': post_data.get('category_id'),
                    'created_at': self.parse_datetime(post_data.get('created_at')),
                    'updated_at': self.parse_datetime(post_data.get('updated_at')),
                    'published_at': self.parse_datetime(post_data.get('published_at'))
                }
                
                # Remove MongoDB reserved fields
                mongo_post.pop('_id', None)
                
                # Insert into MongoDB
                result = collection.insert_one(mongo_post)
                self.migration_stats['blog_posts']['migrated'] += 1
                self.logger.debug(f"Migrated blog post: {post_data.get('title')}")
                
            except Exception as e:
                self.migration_stats['blog_posts']['errors'] += 1
                self.logger.error(f"Failed to migrate blog post '{post_data.get('title')}': {e}")
        
        self.logger.info(f"Blog posts migration completed: {self.migration_stats['blog_posts']['migrated']} migrated, {self.migration_stats['blog_posts']['errors']} errors")
    
    def migrate_work_items(self):
        """Migrate work items from SQLite to MongoDB"""
        self.logger.info("Starting work items migration...")
        
        # Get work items from SQLite
        work_items = self.execute_query("SELECT * FROM work_items")
        
        if not work_items:
            self.logger.info("No work items found in SQLite database")
            return
        
        # Get MongoDB collection
        collection = self.mongo_db.work_items
        
        for item in work_items:
            try:
                # Convert SQLite row to dictionary
                item_data = dict(item)
                
                # Transform data for MongoDB schema
                mongo_item = {
                    'title': item_data.get('title', ''),
                    'description': item_data.get('description', ''),
                    'technologies': self.parse_technologies(item_data.get('technologies', '')),
                    'project_url': item_data.get('project_url', ''),
                    'github_url': item_data.get('github_url', ''),
                    'status': item_data.get('status', 'draft'),
                    'featured_image': item_data.get('featured_image', ''),
                    'gallery_images': self.parse_gallery_images(item_data.get('gallery_images', '')),
                    'category': item_data.get('category_id'),
                    'start_date': self.parse_date(item_data.get('start_date')),
                    'end_date': self.parse_date(item_data.get('end_date')),
                    'created_at': self.parse_datetime(item_data.get('created_at')),
                    'updated_at': self.parse_datetime(item_data.get('updated_at'))
                }
                
                # Remove MongoDB reserved fields
                mongo_item.pop('_id', None)
                
                # Insert into MongoDB
                result = collection.insert_one(mongo_item)
                self.migration_stats['work_items']['migrated'] += 1
                self.logger.debug(f"Migrated work item: {item_data.get('title')}")
                
            except Exception as e:
                self.migration_stats['work_items']['errors'] += 1
                self.logger.error(f"Failed to migrate work item '{item_data.get('title')}': {e}")
        
        self.logger.info(f"Work items migration completed: {self.migration_stats['work_items']['migrated']} migrated, {self.migration_stats['work_items']['errors']} errors")
    
    def migrate_contacts(self):
        """Migrate contacts from SQLite to MongoDB"""
        self.logger.info("Starting contacts migration...")
        
        # Get contacts from SQLite
        contacts = self.execute_query("SELECT * FROM contacts")
        
        if not contacts:
            self.logger.info("No contacts found in SQLite database")
            return
        
        # Get MongoDB collection
        collection = self.mongo_db.contacts
        
        for contact in contacts:
            try:
                # Convert SQLite row to dictionary
                contact_data = dict(contact)
                
                # Transform data for MongoDB schema
                mongo_contact = {
                    'name': contact_data.get('name', ''),
                    'email': contact_data.get('email', ''),
                    'subject': contact_data.get('subject', ''),
                    'message': contact_data.get('message', ''),
                    'is_read': bool(contact_data.get('is_read', 0)),
                    'replied': bool(contact_data.get('replied', 0)),
                    'ip_address': contact_data.get('ip_address', ''),
                    'user_agent': contact_data.get('user_agent', ''),
                    'created_at': self.parse_datetime(contact_data.get('created_at')),
                    'updated_at': self.parse_datetime(contact_data.get('updated_at'))
                }
                
                # Remove MongoDB reserved fields
                mongo_contact.pop('_id', None)
                
                # Insert into MongoDB
                result = collection.insert_one(mongo_contact)
                self.migration_stats['contacts']['migrated'] += 1
                self.logger.debug(f"Migrated contact: {contact_data.get('name')}")
                
            except Exception as e:
                self.migration_stats['contacts']['errors'] += 1
                self.logger.error(f"Failed to migrate contact '{contact_data.get('name')}': {e}")
        
        self.logger.info(f"Contacts migration completed: {self.migration_stats['contacts']['migrated']} migrated, {self.migration_stats['contacts']['errors']} errors")
    
    def migrate_categories(self):
        """Migrate categories from SQLite to MongoDB"""
        self.logger.info("Starting categories migration...")
        
        # Get categories from SQLite
        categories = self.execute_query("SELECT * FROM categories")
        
        if not categories:
            self.logger.info("No categories found in SQLite database")
            return
        
        # Get MongoDB collection
        collection = self.mongo_db.categories
        
        for category in categories:
            try:
                # Convert SQLite row to dictionary
                category_data = dict(category)
                
                # Transform data for MongoDB schema
                mongo_category = {
                    'name': category_data.get('name', ''),
                    'description': category_data.get('description', ''),
                    'slug': category_data.get('slug', ''),
                    'type': category_data.get('type', 'blog'),
                    'parent_id': category_data.get('parent_id'),
                    'created_at': self.parse_datetime(category_data.get('created_at')),
                    'updated_at': self.parse_datetime(category_data.get('updated_at'))
                }
                
                # Remove MongoDB reserved fields
                mongo_category.pop('_id', None)
                
                # Insert into MongoDB
                result = collection.insert_one(mongo_category)
                self.migration_stats['categories']['migrated'] += 1
                self.logger.debug(f"Migrated category: {category_data.get('name')}")
                
            except Exception as e:
                self.migration_stats['categories']['errors'] += 1
                self.logger.error(f"Failed to migrate category '{category_data.get('name')}': {e}")
        
        self.logger.info(f"Categories migration completed: {self.migration_stats['categories']['migrated']} migrated, {self.migration_stats['categories']['errors']} errors")
    
    def parse_tags(self, tags_str):
        """Parse tags string into list"""
        if not tags_str:
            return []
        return [tag.strip() for tag in tags_str.split(',')]
    
    def parse_technologies(self, tech_str):
        """Parse technologies string into list"""
        if not tech_str:
            return []
        return [tech.strip() for tech in tech_str.split(',')]
    
    def parse_gallery_images(self, images_str):
        """Parse gallery images string into list"""
        if not images_str:
            return []
        return [img.strip() for img in images_str.split(',')]
    
    def parse_datetime(self, dt_str):
        """Parse datetime string to datetime object"""
        if not dt_str:
            return None
        
        # Try different datetime formats
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d %H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%SZ'
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(dt_str, fmt)
            except ValueError:
                continue
        
        self.logger.warning(f"Could not parse datetime: {dt_str}")
        return None
    
    def parse_date(self, date_str):
        """Parse date string to date object"""
        if not date_str:
            return None
        
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            self.logger.warning(f"Could not parse date: {date_str}")
            return None
    
    def create_indexes(self):
        """Create indexes in MongoDB collections for better performance"""
        self.logger.info("Creating MongoDB indexes...")
        
        try:
            # Blog posts indexes
            self.mongo_db.blog_posts.create_index([('slug', 1)], unique=True)
            self.mongo_db.blog_posts.create_index([('status', 1)])
            self.mongo_db.blog_posts.create_index([('created_at', -1)])
            self.mongo_db.blog_posts.create_index([('category', 1)])
            
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
        self.logger.info("Starting SQLite to MongoDB migration...")
        
        try:
            # Connect to databases
            if not self.connect_sqlite():
                return False
            
            if not self.connect_mongodb():
                return False
            
            # Show table schemas for debugging
            tables = ['blog_posts', 'work_items', 'contacts', 'categories']
            for table in tables:
                schema = self.get_table_schema(table)
                self.logger.info(f"Table {table} schema: {schema}")
            
            # Run migrations
            self.migrate_blog_posts()
            self.migrate_work_items()
            self.migrate_contacts()
            self.migrate_categories()
            
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
        self.logger.info("\n" + "="*50)
        self.logger.info("MIGRATION SUMMARY")
        self.logger.info("="*50)
        
        total_migrated = sum(stat['migrated'] for stat in self.migration_stats.values())
        total_errors = sum(stat['errors'] for stat in self.migration_stats.values())
        
        for table, stats in self.migration_stats.items():
            self.logger.info(f"{table}: {stats['migrated']} migrated, {stats['errors']} errors")
        
        self.logger.info(f"\nTotal: {total_migrated} records migrated, {total_errors} errors")
        
        if total_errors == 0:
            self.logger.info("✅ Migration completed successfully!")
        else:
            self.logger.warning(f"⚠️  Migration completed with {total_errors} errors")
        
        self.logger.info("="*50)


def main():
    """Main function to handle command line arguments and run migration"""
    parser = argparse.ArgumentParser(description='Migrate data from SQLite to MongoDB')
    parser.add_argument('--sqlite-db', default='portfolio.db', 
                       help='Path to SQLite database file')
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
        print(f"Error: SQLite database file not found: {args.sqlite_db}")
        sys.exit(1)
    
    # Run migration
    migrator = SQLiteToMongoDBMigrator(args.sqlite_db, mongodb_uri)
    success = migrator.run_migration()
    
    if success:
        print("✅ Migration completed successfully!")
        sys.exit(0)
    else:
        print("❌ Migration failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()