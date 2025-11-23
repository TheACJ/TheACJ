/**
 * Content Sections Import Script
 * Populates MongoDB with the hardcoded content from frontend
 */

const mongoose = require('mongoose');
const ContentSection = require('./models/ContentSection');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/theacj-portfolio');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Content sections data (from frontend hardcoded values)
const contentSections = [
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
    sectionType: "hero",
    hero: {
      title: "Joshua Agbai",
      subtitle: "Data Analyst & Web Developer", 
      description: "Transforming data into insights and building exceptional web experiences with modern technologies and innovative solutions.",
      image: "/assets/img/theacj.jpg",
      ctaText: "Explore My Work",
      ctaLink: "#work",
      socialLinks: [
        { platform: "GitHub", url: "https://github.com/TheACJ", icon: "fab fa-github" },
        { platform: "LinkedIn", url: "https://linkedin.com/in/joshuaagbai", icon: "fab fa-linkedin" },
        { platform: "Twitter", url: "https://twitter.com/realACJoshua", icon: "fab fa-twitter" }
      ]
    },
    isActive: true,
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
    sectionType: "about",
    about: {
      title: "About Me",
      description: "I'm a passionate Data Analyst and Web Developer with expertise in transforming complex data into actionable insights and creating responsive web applications. With experience in Python, JavaScript, and modern frameworks, I bridge the gap between data science and web development.",
      image: "/assets/img/about.jpg",
      achievements: [
        "3+ Years of Data Analysis Experience",
        "50+ Projects Completed", 
        "Multiple Technology Certifications",
        "Full-Stack Development Expertise"
      ]
    },
    isActive: true,
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439013"),
    sectionType: "services",
    services: [
      {
        title: "Data Analysis",
        description: "Transform raw data into meaningful insights using Python, Pandas, NumPy, and visualization tools.",
        icon: "fas fa-chart-bar",
        order: 1
      },
      {
        title: "Web Development",
        description: "Build responsive, modern web applications using React, Node.js, and cutting-edge technologies.",
        icon: "fas fa-code", 
        order: 2
      },
      {
        title: "Blockchain Development",
        description: "Develop decentralized applications and smart contracts using Solidity and Web3 technologies.",
        icon: "fas fa-link",
        order: 3
      },
      {
        title: "API Development",
        description: "Create robust and scalable RESTful APIs and GraphQL services for modern applications.",
        icon: "fas fa-cogs",
        order: 4
      }
    ],
    isActive: true,
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439014"),
    sectionType: "skills",
    skills: [
      { name: "Python", level: 95, icon: "fab fa-python" },
      { name: "JavaScript", level: 90, icon: "fab fa-js" },
      { name: "React", level: 88, icon: "fab fa-react" },
      { name: "Node.js", level: 85, icon: "fab fa-node-js" },
      { name: "MongoDB", level: 80, icon: "fas fa-database" },
      { name: "Django", level: 75, icon: "fab fa-django" },
      { name: "TypeScript", level: 82, icon: "fab fa-js-square" },
      { name: "Git", level: 92, icon: "fab fa-git-alt" }
    ],
    isActive: true,
    updatedAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439015"),
    sectionType: "counter",
    counter: [
      { title: "Projects Completed", value: "50+", icon: "fas fa-project-diagram" },
      { title: "Happy Clients", value: "30+", icon: "fas fa-smile" },
      { title: "Years Experience", value: "3+", icon: "fas fa-calendar" },
      { title: "Technologies", value: "15+", icon: "fas fa-laptop-code" }
    ],
    isActive: true,
    updatedAt: new Date()
  }
];

// Import function
const importContentSections = async () => {
  try {
    console.log('Starting content sections import...');
    
    // Clear existing content sections
    await ContentSection.deleteMany({});
    console.log('Cleared existing content sections');
    
    // Insert new content sections
    const insertedSections = await ContentSection.insertMany(contentSections);
    console.log(`Successfully inserted ${insertedSections.length} content sections:`);
    
    insertedSections.forEach(section => {
      console.log(`- ${section.sectionType} section imported`);
    });
    
    // Verify data
    const totalSections = await ContentSection.countDocuments({ isActive: true });
    console.log(`\nTotal active content sections in database: ${totalSections}`);
    
    console.log('\n✅ Content sections import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your Node.js backend: npm start');
    console.log('2. Start your React frontend: npm run dev');
    console.log('3. Visit your frontend - it should now load content from MongoDB instead of hardcoded defaults');
    
  } catch (error) {
    console.error('Error importing content sections:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run import
const runImport = async () => {
  await connectDB();
  await importContentSections();
};

runImport();