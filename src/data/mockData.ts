import { Module, ModulePrompt, User, Progress, Settings } from '@/types';

export const mockUser: User = {
  id: '1',
  email: 'parent@example.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: 'student',
  createdAt: new Date('2024-01-15'),
};

export const mockAdminUser: User = {
  id: '2',
  email: 'admin@wisefamilies.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
};

export const mockModules: Module[] = [
  {
    id: '1',
    title: 'Welcome to AI-Ready Parenting',
    description: 'An introduction to the framework and what you\'ll learn throughout this course. Set the foundation for raising digitally wise children.',
    orderNumber: 1,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube',
    systemPrompt: 'You are a helpful parenting coach specializing in digital literacy. Help parents understand the basics of AI and its impact on children.',
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Understanding How AI Thinks',
    description: 'Learn the basics of how AI works so you can explain it to your children in age-appropriate ways.',
    orderNumber: 2,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube',
    systemPrompt: 'Help parents understand AI concepts at a fundamental level so they can teach their children. Use simple analogies.',
    status: 'published',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Building Critical Thinking',
    description: 'Develop strategies to help your children question and evaluate AI-generated content critically.',
    orderNumber: 3,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube',
    systemPrompt: 'Guide parents in developing critical thinking exercises for their children. Focus on practical, age-appropriate activities.',
    status: 'published',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    title: 'Setting Healthy Boundaries',
    description: 'Create effective rules and boundaries around AI and technology use in your household.',
    orderNumber: 4,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube',
    systemPrompt: 'Help parents establish healthy technology boundaries. Be practical and understanding of modern family dynamics.',
    status: 'published',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '5',
    title: 'Fostering Creativity in an AI World',
    description: 'Ensure your children develop their creative abilities alongside AI tools, not in competition with them.',
    orderNumber: 5,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube',
    systemPrompt: 'Guide parents in nurturing creativity while embracing AI tools. Focus on collaboration between human creativity and AI.',
    status: 'published',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    title: 'The Future-Ready Family',
    description: 'Put it all together and create a long-term plan for raising children who will thrive in an AI-enhanced world.',
    orderNumber: 6,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: 'youtube',
    systemPrompt: 'Help parents create a comprehensive, long-term strategy for raising AI-ready children. Be encouraging and forward-thinking.',
    status: 'published',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  },
];

export const mockModulePrompts: ModulePrompt[] = [
  // Module 1 prompts
  { id: '1-1', moduleId: '1', label: 'What does "AI-ready" really mean?', promptText: 'Can you explain what it means to raise an "AI-ready" child and why this is important in today\'s world?', orderNumber: 1 },
  { id: '1-2', moduleId: '1', label: 'How do I start this conversation with my kids?', promptText: 'How should I begin talking to my children about AI? What\'s an age-appropriate way to introduce this topic?', orderNumber: 2 },
  { id: '1-3', moduleId: '1', label: 'I\'m worried I\'m already behind', promptText: 'I feel like I\'m already behind on teaching my kids about AI. Is it too late to start? How can I catch up?', orderNumber: 3 },
  
  // Module 2 prompts
  { id: '2-1', moduleId: '2', label: 'Explain AI like I\'m 5', promptText: 'How would you explain how AI works to a 5-year-old? I need simple analogies I can use.', orderNumber: 1 },
  { id: '2-2', moduleId: '2', label: 'What are the limitations of AI?', promptText: 'What are the main limitations of AI that I should teach my children about?', orderNumber: 2 },
  { id: '2-3', moduleId: '2', label: 'AI vs human intelligence', promptText: 'How can I help my child understand the difference between AI and human intelligence?', orderNumber: 3 },
  
  // Module 3 prompts
  { id: '3-1', moduleId: '3', label: 'Critical thinking exercises', promptText: 'What are some fun exercises I can do with my kids to develop their critical thinking about AI content?', orderNumber: 1 },
  { id: '3-2', moduleId: '3', label: 'Spotting AI-generated content', promptText: 'How can I teach my children to identify AI-generated content vs human-created content?', orderNumber: 2 },
  { id: '3-3', moduleId: '3', label: 'Dealing with misinformation', promptText: 'How do I help my kids understand and deal with AI-generated misinformation?', orderNumber: 3 },
  
  // Module 4 prompts
  { id: '4-1', moduleId: '4', label: 'Age-appropriate screen time', promptText: 'What are healthy AI and screen time boundaries for different age groups?', orderNumber: 1 },
  { id: '4-2', moduleId: '4', label: 'When kids push back', promptText: 'How do I handle it when my kids push back against technology boundaries?', orderNumber: 2 },
  { id: '4-3', moduleId: '4', label: 'Creating a family tech agreement', promptText: 'Can you help me create a family technology agreement that includes AI use?', orderNumber: 3 },
  
  // Module 5 prompts
  { id: '5-1', moduleId: '5', label: 'AI as a creativity partner', promptText: 'How can AI be used as a creativity partner rather than a replacement for my child\'s creativity?', orderNumber: 1 },
  { id: '5-2', moduleId: '5', label: 'Creative activities without screens', promptText: 'What creative activities can help my children develop skills that AI can\'t replace?', orderNumber: 2 },
  { id: '5-3', moduleId: '5', label: 'Balancing AI tools in homework', promptText: 'How do I balance letting my kids use AI for homework while ensuring they\'re still learning?', orderNumber: 3 },
  
  // Module 6 prompts
  { id: '6-1', moduleId: '6', label: 'Creating a long-term plan', promptText: 'Help me create a long-term plan for raising AI-ready children. What milestones should I aim for?', orderNumber: 1 },
  { id: '6-2', moduleId: '6', label: 'Future-proofing their education', promptText: 'What skills should I prioritize to future-proof my children\'s education in an AI world?', orderNumber: 2 },
  { id: '6-3', moduleId: '6', label: 'Staying current as AI evolves', promptText: 'How can I stay current on AI developments so I can continue guiding my children as technology evolves?', orderNumber: 3 },
];

export const mockProgress: Progress[] = [
  { id: '1', userId: '1', moduleId: '1', startedAt: new Date('2024-02-01'), completedAt: new Date('2024-02-02'), firstPromptClicked: true },
  { id: '2', userId: '1', moduleId: '2', startedAt: new Date('2024-02-03'), completedAt: new Date('2024-02-04'), firstPromptClicked: true },
  { id: '3', userId: '1', moduleId: '3', startedAt: new Date('2024-02-05'), completedAt: null, firstPromptClicked: true },
];

export const mockSettings: Settings = {
  courseTitle: 'AI-Ready Parenting Framework',
  courseDescription: 'A comprehensive 14-day course helping parents navigate the AI age with confidence.',
  coursePrice: 69,
  llmProvider: 'anthropic',
  llmModel: 'claude-sonnet-4-20250514',
  llmTemperature: 0.7,
  llmMaxTokens: 1024,
  defaultSystemPrompt: 'You are a helpful, warm parenting coach helping parents navigate technology and AI with their children. Be practical, empathetic, and give actionable advice. Keep responses conversational but substantive.',
};

export const mockStats = {
  totalStudents: 247,
  activeToday: 34,
  courseCompletions: 89,
  recentSignups: [
    { name: 'John D.', email: 'john.d***@email.com', date: new Date('2024-02-10') },
    { name: 'Maria S.', email: 'maria.s***@email.com', date: new Date('2024-02-09') },
    { name: 'David L.', email: 'david.l***@email.com', date: new Date('2024-02-09') },
    { name: 'Emma W.', email: 'emma.w***@email.com', date: new Date('2024-02-08') },
    { name: 'Michael R.', email: 'michael.r***@email.com', date: new Date('2024-02-08') },
  ],
};
