#!/usr/bin/env python3
"""
SQLite Database Analyzer
========================

This script analyzes your existing SQLite database and shows the migration plan
without requiring MongoDB connection.

Usage:
    python analyze_sqlite.py [database_file]

Author: The ACJ
Date: November 2025
"""

import sqlite3
import json
import sys
from datetime import datetime
from pathlib import Path


def analyze_sqlite_database(db_path):
    """Analyze SQLite database structure and content"""
    
    print(f"Analyzing SQLite database: {db_path}")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("❌ No tables found in the database")
            return
        
        print(f"📋 Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        print()
        
        analysis_results = {}
        
        # Analyze each table
        for table in tables:
            table_name = table[0]
            print(f"🔍 Analyzing table: {table_name}")
            print("-" * 40)
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            print(f"   Columns: {len(columns)}")
            for col in columns:
                col_type = col[2] if len(col) > 2 else "UNKNOWN"
                col_nullable = "NULL" if col[3] == 0 else "NOT NULL"
                col_default = f"DEFAULT {col[4]}" if col[4] else "no default"
                print(f"     - {col[1]} ({col_type}) {col_nullable} {col_default}")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cursor.fetchone()[0]
            print(f"   Records: {row_count}")
            
            # Get sample data
            if row_count > 0:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
                sample_rows = cursor.fetchall()
                
                print("   Sample data:")
                for i, row in enumerate(sample_rows):
                    print(f"     Record {i+1}:")
                    for key in row.keys():
                        value = row[key]
                        if isinstance(value, str) and len(value) > 50:
                            value = value[:50] + "..."
                        print(f"       {key}: {value}")
                    print()
            
            analysis_results[table_name] = {
                'columns': [dict(col) for col in columns],
                'row_count': row_count,
                'sample_data': [dict(row) for row in sample_rows] if row_count > 0 else []
            }
            
            print()
        
        # Check for portfolio-related tables
        portfolio_tables = {
            'blog_posts': 'Blog posts content',
            'work_items': 'Portfolio work items',
            'contacts': 'Contact form submissions',
            'categories': 'Content categories',
            'home_blogpost': 'Django blog posts',
            'home_workitem': 'Django work items',
            'home_contact': 'Django contacts'
        }
        
        print("🎯 Portfolio Content Analysis")
        print("-" * 40)
        
        found_content = False
        for table_name, description in portfolio_tables.items():
            if table_name in analysis_results:
                found_content = True
                count = analysis_results[table_name]['row_count']
                status = "✅" if count > 0 else "⚪"
                print(f"   {status} {description}: {count} records")
        
        if not found_content:
            print("   ⚠️  No standard portfolio tables found")
            print("   The database might have different table names")
        
        print()
        
        # Migration recommendations
        print("🚀 Migration Recommendations")
        print("-" * 40)
        
        if any(table in analysis_results for table in ['home_blogpost', 'home_workitem', 'home_contact']):
            print("   🔄 Django database detected")
            print("   📝 Tables to migrate:")
            
            if 'home_blogpost' in analysis_results:
                print("     - home_blogpost → blog_posts")
            if 'home_workitem' in analysis_results:
                print("     - home_workitem → work_items")
            if 'home_contact' in analysis_results:
                print("     - home_contact → contacts")
                
        elif any(table in analysis_results for table in ['blog_posts', 'work_items', 'contacts']):
            print("   📝 Standard portfolio tables found")
            print("   🔄 Ready for direct migration to MongoDB")
        else:
            print("   ⚠️  Custom table structure detected")
            print("   📝 Manual table mapping may be required")
        
        print()
        
        # Data transformation suggestions
        print("🔧 Data Transformation Needed")
        print("-" * 40)
        
        transformation_notes = []
        
        # Check for JSON/text fields that need parsing
        for table_name, data in analysis_results.items():
            for column in data['columns']:
                col_name = column[1].lower()
                col_type = column[2].lower()
                
                if col_name in ['tags', 'technologies', 'gallery_images'] and col_type == 'text':
                    transformation_notes.append(f"   🔄 {table_name}.{column[1]}: Convert comma-separated string to array")
                
                if col_name in ['is_read', 'replied'] and col_type == 'integer':
                    transformation_notes.append(f"   🔄 {table_name}.{column[1]}: Convert 0/1 to boolean")
                
                if col_name.endswith('_id') and col_type == 'integer':
                    transformation_notes.append(f"   🔄 {table_name}.{column[1]}: Convert ID to MongoDB ObjectId")
        
        if transformation_notes:
            for note in transformation_notes:
                print(note)
        else:
            print("   ✅ No special transformations required")
        
        print()
        
        # Save analysis to JSON file
        output_file = "database_analysis.json"
        with open(output_file, 'w') as f:
            json.dump(analysis_results, f, indent=2, default=str)
        
        print(f"💾 Analysis saved to: {output_file}")
        print(f"📊 Total tables analyzed: {len(analysis_results)}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error analyzing database: {e}")
        return False


def main():
    """Main function"""
    if len(sys.argv) < 2:
        db_path = "db.sqlite3"
    else:
        db_path = sys.argv[1]
    
    if not Path(db_path).exists():
        print(f"❌ Database file not found: {db_path}")
        print("Usage: python analyze_sqlite.py [database_file]")
        sys.exit(1)
    
    success = analyze_sqlite_database(db_path)
    
    if success:
        print("\n✅ Database analysis completed successfully!")
        print("\nNext steps:")
        print("1. Review the analysis above")
        print("2. Update the migration script if needed for custom table names")
        print("3. Run the migration when MongoDB is accessible")
    else:
        print("\n❌ Database analysis failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()