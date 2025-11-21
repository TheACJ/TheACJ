#!/usr/bin/env python3
"""
Django to MongoDB Export Script
===============================

This script exports your Django SQLite data to JSON files that can be 
imported into MongoDB using mongoimport.

Usage:
    python export_for_mongodb.py [database_file]

Author: The ACJ
Date: November 2025
"""

import sqlite3
import json
import os
import sys
from datetime import datetime
from pathlib import Path


def export_sqlite_to_json(db_path):
    """Export SQLite database to JSON files for MongoDB import"""
    
    print(f"Exporting Django SQLite database to JSON: {db_path}")
    print("=" * 60)
    
    # Create output directory
    output_dir = "mongodb_export"
    Path(output_dir).mkdir(exist_ok=True)
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Export categories
        print("📁 Exporting categories...")
        categories = cursor.execute("SELECT * FROM Home_category").fetchall()
        
        categories_data = []
        for category in categories:
            cat_data = {
                '_id': str(category['id']),  # Use existing ID
                'name': category['name'],
                'friendly_name': category['friendly_name'],
                'slug': category['friendly_name'],
                'type': 'blog',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            categories_data.append(cat_data)
        
        with open(f"{output_dir}/categories.json", 'w') as f:
            json.dump(categories_data, f, indent=2)
        print(f"   ✅ {len(categories_data)} categories exported to categories.json")
        
        # Export blog posts
        print("📝 Exporting blog posts...")
        blog_posts = cursor.execute("SELECT * FROM Home_blogpost").fetchall()
        
        blog_posts_data = []
        for post in blog_posts:
            # Create slug from title
            slug = post['title'].lower().replace(' ', '-').replace('🚀', '').replace(':', '').replace('-', '')
            
            # Extract URL from link if available
            link = post['link'] or ''
            excerpt = ''
            if link and 'dev.to' in link:
                excerpt = f"Originally published on Dev.to: {link}"
            
            post_data = {
                '_id': str(post['id']),  # Use existing ID
                'title': post['title'],
                'content': post['content'],
                'excerpt': excerpt,
                'slug': slug,
                'status': 'published',
                'author': 'The ACJ',
                'featured_image': post['image'],
                'image_url': post['image_url'],
                'tags': ['tutorial', 'rust', 'solana', 'web3'],
                'category': str(post['category_id']) if post['category_id'] else None,
                'created_at': post['date_published'],
                'updated_at': post['date_published'],
                'published_at': post['date_published']
            }
            blog_posts_data.append(post_data)
        
        with open(f"{output_dir}/blog_posts.json", 'w') as f:
            json.dump(blog_posts_data, f, indent=2)
        print(f"   ✅ {len(blog_posts_data)} blog posts exported to blog_posts.json")
        
        # Export work items
        print("💼 Exporting work items...")
        work_items = cursor.execute("SELECT * FROM Home_workitem").fetchall()
        
        work_items_data = []
        for item in work_items:
            # Create slug from title
            slug = item['title'].lower().replace(' ', '-').replace('_', '-')
            
            # Collect gallery images
            gallery_images = []
            for i in range(1, 4):  # image1, image2, image3
                img_field = f'image{i}'
                if item[img_field]:
                    gallery_images.append(item[img_field])
            
            # Determine technologies
            technologies = determine_technologies(item['title'], item['category'])
            
            item_data = {
                '_id': str(item['id']),  # Use existing ID
                'title': item['title'],
                'description': item['description'],
                'technologies': technologies,
                'project_url': item['link'],
                'github_url': '',
                'status': 'published',
                'featured_image': item['image'],
                'gallery_images': gallery_images,
                'category': item['category'].lower().replace(' ', '-') if item['category'] else None,
                'start_date': None,
                'end_date': None,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            work_items_data.append(item_data)
        
        with open(f"{output_dir}/work_items.json", 'w') as f:
            json.dump(work_items_data, f, indent=2)
        print(f"   ✅ {len(work_items_data)} work items exported to work_items.json")
        
        # Export contacts
        print("📧 Exporting contacts...")
        contacts = cursor.execute("SELECT * FROM Home_contact").fetchall()
        
        contacts_data = []
        for contact in contacts:
            contact_data = {
                '_id': str(contact['id']),  # Use existing ID
                'name': contact['name'],
                'email': contact['email'],
                'subject': contact['subject'],
                'message': contact['message'],
                'is_read': False,
                'replied': False,
                'ip_address': '',
                'user_agent': '',
                'created_at': contact['created_at'],
                'updated_at': contact['created_at']
            }
            contacts_data.append(contact_data)
        
        with open(f"{output_dir}/contacts.json", 'w') as f:
            json.dump(contacts_data, f, indent=2)
        print(f"   ✅ {len(contacts_data)} contacts exported to contacts.json")
        
        # Create MongoDB import commands
        print("\n📋 Creating MongoDB import commands...")
        create_import_commands(output_dir)
        
        # Create summary
        create_summary(output_dir, {
            'categories': len(categories_data),
            'blog_posts': len(blog_posts_data),
            'work_items': len(work_items_data),
            'contacts': len(contacts_data)
        })
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ EXPORT COMPLETED SUCCESSFULLY!")
        print(f"📁 JSON files created in: {output_dir}/")
        print("\nNext steps:")
        print("1. Copy the JSON files to your local machine")
        print("2. Run the MongoDB import commands (see import_commands.txt)")
        print("3. Start your Node.js admin server")
        print("4. Access admin at http://localhost:5000/admin/login")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Export failed: {e}")
        return False


def determine_technologies(title, category):
    """Determine technologies based on title and category"""
    technologies = []
    
    title_lower = title.lower()
    category_lower = category.lower() if category else ''
    
    # Web development keywords
    if 'react' in title_lower or 'web app' in category_lower:
        technologies.extend(['React', 'JavaScript', 'HTML', 'CSS'])
    
    if 'survey' in title_lower:
        technologies.extend(['Django', 'Python', 'HTML', 'CSS', 'JavaScript'])
    
    if 'ecommerce' in title_lower or 'shop' in title_lower:
        technologies.extend(['React', 'Node.js', 'MongoDB', 'Express'])
    
    if 'web app' in category_lower:
        technologies.extend(['React', 'JavaScript', 'CSS'])
    
    # MyRateacard specific
    if 'myrateacard' in title_lower:
        technologies.extend(['React', 'PWA', 'JavaScript', 'CSS'])
    
    # Default technologies if none detected
    if not technologies:
        technologies = ['Web Development', 'JavaScript']
    
    return list(set(technologies))  # Remove duplicates


def create_import_commands(output_dir):
    """Create MongoDB import commands file"""
    
    commands = f"""# MongoDB Import Commands
# =====================

# 1. Import Categories
mongoimport --uri="your-mongodb-uri" --collection=categories --file="{output_dir}/categories.json" --jsonArray

# 2. Import Blog Posts  
mongoimport --uri="your-mongodb-uri" --collection=blog_posts --file="{output_dir}/blog_posts.json" --jsonArray

# 3. Import Work Items
mongoimport --uri="your-mongodb-uri" --collection=work_items --file="{output_dir}/work_items.json" --jsonArray

# 4. Import Contacts (if any)
mongoimport --uri="your-mongodb-uri" --collection=contacts --file="{output_dir}/contacts.json" --jsonArray

# Note: Replace "your-mongodb-uri" with your actual MongoDB connection string
# Example: mongodb+srv://username:password@cluster.mongodb.net/database
"""
    
    with open(f"{output_dir}/import_commands.txt", 'w') as f:
        f.write(commands)
    
    print(f"   ✅ Import commands saved to {output_dir}/import_commands.txt")


def create_summary(output_dir, stats):
    """Create migration summary file"""
    
    summary = f"""# Django to MongoDB Migration Summary
Generated: {datetime.now().isoformat()}

## Exported Data
- Categories: {stats['categories']}
- Blog Posts: {stats['blog_posts']}
- Work Items: {stats['work_items']}
- Contacts: {stats['contacts']}

## Data Overview

### Blog Posts Content:
1. "Introduction to Rust" - Rust tutorial series
2. "Intro to Rust 2" - Data types and strings
3. "SolanaSmart Contract" - Solana project with Anchor
4. Additional posts about Rust and blockchain development

### Work Items:
1. "A Survey App" - Analytics dashboard with Django
2. "ShopWCandy" - React ecommerce website 
3. "MyRateacard" - Progressive Web App for rating cards

### Categories:
- Tutorial (Rust, Solana content)
- Web3 (Blockchain development)
- Frontend (React, JavaScript)
- Additional custom categories

## Import Instructions:
1. Ensure MongoDB is running and accessible
2. Replace "your-mongodb-uri" in import_commands.txt with your actual connection string
3. Run the import commands in order (categories first, then blog posts, work items, contacts)
4. Start your Node.js admin server
5. Login to admin interface and verify migrated content

## Post-Import Steps:
1. Start Node.js server: npm start
2. Access admin: http://localhost:5000/admin/login
3. Login with: admin@theacj.com / admin123
4. Check dashboard statistics
5. Verify all blog posts and work items are visible
6. Test content management features
"""
    
    with open(f"{output_dir}/README.md", 'w') as f:
        f.write(summary)
    
    print(f"   ✅ Summary saved to {output_dir}/README.md")


def main():
    """Main function"""
    if len(sys.argv) < 2:
        db_path = "db.sqlite3"
    else:
        db_path = sys.argv[1]
    
    if not Path(db_path).exists():
        print(f"❌ Database file not found: {db_path}")
        print("Usage: python export_for_mongodb.py [database_file]")
        sys.exit(1)
    
    success = export_sqlite_to_json(db_path)
    
    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()