export interface BlogPost {
  id: number;
  title: string;
  content: string;
  date_published: string;
  image?: string;
  category: {
    name: string;
    friendly_name: string;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface WorkItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  link?: string;
}


export interface Program {
  image: string;
  title: string;
  description: string;
}

export interface Testimonial {
  image: string;
  name: string;
  role: string;
  title: string;
  content: string;
}