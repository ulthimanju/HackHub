// Predefined skill constants — used for profile skill tags and future team-matching suggestions.
// Grouped by category so they can also be rendered with headers if needed.

export const SKILL_CATEGORIES = {
  'Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go',
    'Rust', 'Kotlin', 'Swift', 'Ruby', 'PHP', 'Scala', 'Dart', 'R', 'MATLAB',
    'Bash', 'PowerShell', 'Solidity',
  ],
  'Frontend': [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'HTML', 'CSS',
    'Tailwind CSS', 'Bootstrap', 'Material UI', 'Sass', 'Redux', 'Zustand',
    'React Native', 'Flutter', 'Electron',
  ],
  'Backend': [
    'Node.js', 'Express.js', 'Spring Boot', 'Django', 'FastAPI', 'Flask',
    'Laravel', 'Ruby on Rails', 'ASP.NET', 'NestJS', 'GraphQL', 'REST API',
    'gRPC', 'Microservices',
  ],
  'Databases': [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase',
    'Cassandra', 'Elasticsearch', 'DynamoDB', 'Supabase', 'PlanetScale',
  ],
  'DevOps & Cloud': [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'CI/CD',
    'GitHub Actions', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Nginx',
    'Prometheus', 'Grafana',
  ],
  'AI & Data': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'NLP', 'Computer Vision', 'Data Analysis', 'Pandas', 'NumPy', 'OpenCV',
    'LangChain', 'Hugging Face', 'OpenAI API',
  ],
  'Tools & Practices': [
    'Git', 'GitHub', 'Agile', 'Scrum', 'TDD', 'System Design',
    'WebSockets', 'Kafka', 'RabbitMQ', 'OAuth', 'JWT',
  ],
  'Design': [
    'Figma', 'UI/UX Design', 'Responsive Design', 'Accessibility',
  ],
};

// Flat list for simple lookups / search
export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();
