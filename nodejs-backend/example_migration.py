#!/usr/bin/env python3
"""
Example SQLite Database Generator for Migration Testing
=======================================================

This script creates a sample SQLite database with test data for demonstrating
the migration from SQLite to MongoDB.

Usage:
    python example_migration.py

This will create 'example_portfolio.db' with sample data.
"""

import sqlite3
import random
from datetime import datetime, timedelta
import os


def create_sample_database():
    """Create a sample SQLite database with test data"""
    
    # Create database connection
    conn = sqlite3.connect('example_portfolio.db')
    cursor = conn.cursor()
    
    print("Creating sample SQLite database...")
    
    # Create blog_posts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            excerpt TEXT,
            slug TEXT UNIQUE,
            status TEXT DEFAULT 'draft',
            author TEXT,
            featured_image TEXT,
            tags TEXT,
            category_id INTEGER,
            created_at DATETIME,
            updated_at DATETIME,
            published_at DATETIME
        )
    ''')
    
    # Create work_items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS work_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            technologies TEXT,
            project_url TEXT,
            github_url TEXT,
            status TEXT DEFAULT 'draft',
            featured_image TEXT,
            gallery_images TEXT,
            category_id INTEGER,
            start_date DATE,
            end_date DATE,
            created_at DATETIME,
            updated_at DATETIME
        )
    ''')
    
    # Create contacts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        )
    ''')
    
    # Create categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            slug TEXT UNIQUE,
            type TEXT DEFAULT 'blog',
            parent_id INTEGER,
            created_at DATETIME,
            updated_at DATETIME
        )
    ''')
    
    # Insert sample categories
    categories = [
        ('Technology', 'Technology related posts', 'technology', 'blog', None),
        ('Web Development', 'Web development tutorials', 'web-development', 'blog', None),
        ('JavaScript', 'JavaScript related content', 'javascript', 'blog', 1),
        ('React', 'React framework content', 'react', 'blog', 2),
        ('Portfolio Projects', 'Work portfolio items', 'portfolio-projects', 'work', None),
        ('Web Applications', 'Web application projects', 'web-applications', 'work', 5),
        ('Mobile Apps', 'Mobile application projects', 'mobile-apps', 'work', 5),
    ]
    
    for cat in categories:
        cursor.execute('''
            INSERT OR IGNORE INTO categories (name, description, slug, type, parent_id)
            VALUES (?, ?, ?, ?, ?)
        ''', cat)
    
    # Insert sample blog posts
    blog_posts = [
        ('Getting Started with React', 'React is a powerful JavaScript library...', 'Learn the basics of React development', 'getting-started-react', 'published', 'The ACJ', 'react-hero.jpg', 'react,javascript,frontend', 1, '2025-01-15 10:00:00', '2025-01-15 10:00:00', '2025-01-15 10:00:00'),
        ('Building Modern Web Apps', 'Modern web development requires...', 'A comprehensive guide to building modern web applications', 'building-modern-web-apps', 'published', 'The ACJ', 'web-apps-hero.jpg', 'web development,html,css,javascript', 1, '2025-01-10 14:30:00', '2025-01-10 14:30:00', '2025-01-10 14:30:00'),
        ('JavaScript Best Practices', 'Writing clean and maintainable JavaScript...', 'Essential tips for writing better JavaScript code', 'javascript-best-practices', 'draft', 'The ACJ', 'js-practices.jpg', 'javascript,best practices', 2, '2025-01-08 09:15:00', '2025-01-08 09:15:00', None),
        ('Component-Based Architecture', 'Understanding component architecture...', 'Learn how to build scalable applications with components', 'component-architecture', 'published', 'The ACJ', 'components.jpg', 'react,components,architecture', 4, '2025-01-05 16:45:00', '2025-01-05 16:45:00', '2025-01-05 16:45:00'),
        ('API Integration Patterns', 'Working with APIs in modern applications...', 'Best practices for API integration and data handling', 'api-integration', 'draft', 'The ACJ', 'api-patterns.jpg', 'api,integration,fetch', 1, '2025-01-03 11:20:00', '2025-01-03 11:20:00', None),
    ]
    
    for post in blog_posts:
        cursor.execute('''
            INSERT OR IGNORE INTO blog_posts 
            (title, content, excerpt, slug, status, author, featured_image, tags, category_id, created_at, updated_at, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', post)
    
    # Insert sample work items
    work_items = [
        ('E-Commerce Platform', 'Full-stack e-commerce solution with modern features', 'React,Node.js,Express,MongoDB', 'https://my-ecommerce-demo.com', 'https://github.com/theacj/ecommerce-demo', 'completed', 'ecommerce-screenshot.jpg', 'demo1.jpg,demo2.jpg,demo3.jpg', 6, '2024-12-01', '2025-01-15', '2025-01-15 12:00:00', '2025-01-15 12:00:00'),
        ('Task Management App', 'Collaborative task management application', 'React Native,Firebase,Redux', 'https://task-app-demo.com', 'https://github.com/theacj/task-app', 'completed', 'task-app-hero.jpg', 'mobile1.jpg,mobile2.jpg,mobile3.jpg', 7, '2024-11-01', '2024-12-30', '2024-12-30 15:30:00', '2024-12-30 15:30:00'),
        ('Portfolio Website', 'Personal portfolio and blog website', 'HTML,CSS,JavaScript,Node.js', 'https://theacj-portfolio.com', 'https://github.com/theacj/portfolio', 'published', 'portfolio-hero.jpg', 'web1.jpg,web2.jpg,web3.jpg', 5, '2024-10-15', '2025-01-10', '2025-01-10 10:00:00', '2025-01-10 10:00:00'),
        ('Weather Dashboard', 'Real-time weather tracking application', 'Vue.js,OpenWeather API,Chart.js', 'https://weather-dashboard-demo.com', 'https://github.com/theacj/weather-dashboard', 'draft', 'weather-hero.jpg', 'dashboard1.jpg,dashboard2.jpg', 6, '2024-09-01', '2024-11-20', None, '2024-11-20 18:45:00'),
        ('Social Media App', 'Modern social media platform', 'React,GraphQL,PostgreSQL', 'https://social-app-demo.com', 'https://github.com/theacj/social-app', 'in-progress', 'social-hero.jpg', 'social1.jpg,social2.jpg,social3.jpg,social4.jpg', 6, '2024-08-01', None, None, '2024-08-15 14:20:00'),
    ]
    
    for item in work_items:
        cursor.execute('''
            INSERT OR IGNORE INTO work_items 
            (title, description, technologies, project_url, github_url, status, featured_image, gallery_images, category_id, start_date, end_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', item)
    
    # Insert sample contacts
    contacts = [
        ('John Doe', 'john.doe@example.com', 'Collaboration Opportunity', 'Hi, I would like to discuss a potential collaboration on a web project. Looking forward to hearing from you.', 1, 0, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-01-18 14:30:00', '2025-01-18 14:30:00'),
        ('Sarah Smith', 'sarah.smith@company.com', 'Job Opportunity', 'Hello, we have an exciting job opportunity that might interest you. Our company is looking for a skilled React developer.', 1, 1, '203.0.113.45', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2025-01-17 09:15:00', '2025-01-17 16:45:00'),
        ('Mike Johnson', 'mike.j@startup.io', 'Project Inquiry', 'I saw your portfolio and was impressed by your work. We have a startup project that needs a technical lead.', 0, 0, '198.51.100.23', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '2025-01-16 11:20:00', '2025-01-16 11:20:00'),
        ('Emily Davis', 'emily.davis@freelance.com', 'Freelance Work', 'Hi there! I am looking for a web developer for an ongoing project. The work is remote and flexible.', 0, 0, '192.0.2.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-01-15 16:45:00', '2025-01-15 16:45:00'),
        ('David Wilson', 'd.wilson@techcorp.com', 'Technical Consultation', 'We need expert advice on our existing React application. The system needs optimization and new features.', 1, 1, '172.16.0.12', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2025-01-14 13:10:00', '2025-01-14 17:30:00'),
        ('Lisa Brown', 'lisa.brown@designstudio.com', 'Design Collaboration', 'Hello! We are a design studio looking for a developer to bring our designs to life. Interested in partnering?', 1, 0, '10.0.0.45', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0', '2025-01-13 10:30:00', '2025-01-13 15:20:00'),
        ('Alex Chen', 'alex.chen@uni.edu', 'Student Project', 'Hi! I am a computer science student working on a final project. Could you share some tips about React development?', 0, 0, '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', '2025-01-12 14:15:00', '2025-01-12 14:15:00'),
    ]
    
    for contact in contacts:
        cursor.execute('''
            INSERT OR IGNORE INTO contacts 
            (name, email, subject, message, is_read, replied, ip_address, user_agent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', contact)
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("✅ Sample database created: example_portfolio.db")
    print("\nDatabase contains:")
    print("- 7 categories (blog and work types)")
    print("- 5 blog posts")
    print("- 5 work items")
    print("- 7 contact messages")
    print("\nYou can now run the migration script:")
    print("python migrate_from_sqlite.py --sqlite-db example_portfolio.db")


if __name__ == '__main__':
    create_sample_database()