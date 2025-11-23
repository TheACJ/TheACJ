const ContentSection = require('../models/ContentSection');

// Default content data for when backend data is not available
const DEFAULT_CONTENT = {
  hero: {
    slides: [
      {
        title: "Hi!",
        subtitle: "The ACJ",
        description: "With us Tech Emancipation is achievable",
        bgImage: "/assets/img/theacj.jpg",
        buttonText: "View CV",
        buttonIcon: "icon-download",
        buttonLink: "/assets/JoshuaAgbai.pdf"
      },
      {
        title: "I am a",
        subtitle: "Data Analyst",
        description: "Where there is Data, The ACJ will make sense of it",
        bgImage: "/assets/img/data_analytics.jpg",
        buttonText: "View Portfolio",
        buttonIcon: "icon-briefcase",
        buttonLink: "#work"
      },
      {
        title: "I am a",
        subtitle: "Web2 Developer",
        description: "Imagine it, The ACJ will make it real",
        bgImage: "/assets/img/web2.jpg",
        buttonText: "View Portfolio",
        buttonIcon: "icon-briefcase",
        buttonLink: "#work"
      },
      {
        title: "I am a",
        subtitle: "Web3 Developer",
        description: "Building worldclass solution using Blockchain Technology",
        bgImage: "/assets/img/Web3.webp",
        buttonText: "View Portfolio",
        buttonIcon: "icon-briefcase",
        buttonLink: "#work"
      }
    ],
    socialLinks: [
      { platform: "GitHub", url: "https://github.com/TheACJ", icon: "fab fa-github" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/joshuaagbai", icon: "fab fa-linkedin" },
      { platform: "Twitter", url: "https://twitter.com/realACJoshua", icon: "fab fa-twitter" }
    ]
  },
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
  counter: [
    { title: "Projects Completed", value: "50+", icon: "fas fa-project-diagram" },
    { title: "Happy Clients", value: "30+", icon: "fas fa-smile" },
    { title: "Years Experience", value: "3+", icon: "fas fa-calendar" },
    { title: "Technologies", value: "15+", icon: "fas fa-laptop-code" }
  ],
  skills: [
    { name: "Python", level: 95, icon: "fab fa-python" },
    { name: "JavaScript", level: 90, icon: "fab fa-js" },
    { name: "React", level: 88, icon: "fab fa-react" },
    { name: "Node.js", level: 85, icon: "fab fa-node-js" },
    { name: "MongoDB", level: 80, icon: "fas fa-database" },
    { name: "Django", level: 75, icon: "fab fa-django" },
    { name: "TypeScript", level: 82, icon: "fab fa-js-square" },
    { name: "Git", level: 92, icon: "fab fa-git-alt" }
  ]
};

// Get all content sections
exports.getAllContent = async (req, res) => {
  try {
    const contentSections = await ContentSection.find({ isActive: true }).sort({ sectionType: 1 });
    
    // If no content exists, return default content
    if (contentSections.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Using default content',
        data: { content: DEFAULT_CONTENT }
      });
    }

    // Transform to match frontend expectations
    const transformedContent = {};
    contentSections.forEach(section => {
      transformedContent[section.sectionType] = section.toObject();
      delete transformedContent[section.sectionType]._id;
      delete transformedContent[section.sectionType].__v;
    });

    res.status(200).json({
      success: true,
      data: { content: transformedContent }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching content'
    });
  }
};

// Get specific content section
exports.getContentSection = async (req, res) => {
  try {
    const { sectionType } = req.params;
    
    const contentSection = await ContentSection.findOne({ 
      sectionType, 
      isActive: true 
    });

    if (!contentSection) {
      // Return default content if not found
      if (DEFAULT_CONTENT[sectionType]) {
        return res.status(200).json({
          success: true,
          message: 'Using default content',
          data: { content: DEFAULT_CONTENT[sectionType] }
        });
      }
      return res.status(404).json({
        success: false,
        error: 'Content section not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { content: contentSection }
    });
  } catch (error) {
    console.error('Error fetching content section:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching content section'
    });
  }
};

// Create or update content section
exports.updateContentSection = async (req, res) => {
  try {
    const { sectionType } = req.params;
    const updateData = req.body;
    const adminId = req.admin.id;

    // Validate section type
    const validSections = ['hero', 'about', 'services', 'counter', 'skills'];
    if (!validSections.includes(sectionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content section type'
      });
    }

    // Prepare update data
    const update = {
      sectionType,
      [sectionType]: updateData,
      updatedBy: adminId,
      updatedAt: new Date()
    };

    // Use upsert to create if doesn't exist, update if exists
    const contentSection = await ContentSection.findOneAndUpdate(
      { sectionType },
      update,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Content section updated successfully',
      data: { content: contentSection }
    });
  } catch (error) {
    console.error('Error updating content section:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating content section'
    });
  }
};

// Get public content (for frontend)
exports.getPublicContent = async (req, res) => {
  try {
    const contentSections = await ContentSection.find({ isActive: true }).sort({ sectionType: 1 });
    
    // Transform to match frontend expectations
    const transformedContent = {};
    contentSections.forEach(section => {
      transformedContent[section.sectionType] = section[section.sectionType];
    });

    // Merge with defaults where content is missing
    Object.keys(DEFAULT_CONTENT).forEach(key => {
      if (!transformedContent[key]) {
        transformedContent[key] = DEFAULT_CONTENT[key];
      }
    });

    res.status(200).json({
      success: true,
      data: transformedContent
    });
  } catch (error) {
    console.error('Error fetching public content:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching public content'
    });
  }
};

// Reset section to default content
exports.resetToDefault = async (req, res) => {
  try {
    const { sectionType } = req.params;
    const adminId = req.admin.id;

    if (!DEFAULT_CONTENT[sectionType]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section type for reset'
      });
    }

    const update = {
      sectionType,
      [sectionType]: DEFAULT_CONTENT[sectionType],
      updatedBy: adminId,
      updatedAt: new Date()
    };

    const contentSection = await ContentSection.findOneAndUpdate(
      { sectionType },
      update,
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Content section reset to default successfully',
      data: { content: contentSection }
    });
  } catch (error) {
    console.error('Error resetting content section:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while resetting content section'
    });
  }
};