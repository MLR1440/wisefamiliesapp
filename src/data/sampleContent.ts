export interface SampleModule {
  title: string;
  description: string;
  order_number: number;
  video_url: string;
  video_type: string;
  system_prompt: string;
  status: string;
  prompts: { label: string; prompt_text: string }[];
}

export const sampleModules: SampleModule[] = [
  {
    title: "Welcome to the Journey",
    description: "An introduction to AI-ready parenting and what you'll learn.",
    order_number: 1,
    video_url: "",
    video_type: "youtube",
    system_prompt: "You are a warm, knowledgeable parenting coach helping parents understand the basics of AI and why it matters for their family. Keep responses encouraging and practical. Ask clarifying questions about their child's age and current tech usage.",
    status: "published",
    prompts: [
      { label: "What is AI and why should I care?", prompt_text: "Can you explain what AI actually is in simple terms, and why it matters for my family?" },
      { label: "I'm worried about my kid and technology", prompt_text: "I'm feeling overwhelmed about my child's technology use. Can you help me understand what I should focus on first?" },
      { label: "How is this course different?", prompt_text: "I've read lots of articles about kids and screens. What makes this approach different?" }
    ]
  },
  {
    title: "Understanding Your Child's Digital World",
    description: "See technology through your child's eyes and understand what draws them in.",
    order_number: 2,
    video_url: "",
    video_type: "youtube",
    system_prompt: "You are helping parents understand what their children experience with technology and AI. Be empathetic about the challenges parents face while helping them see their child's perspective. Encourage curiosity over judgment.",
    status: "published",
    prompts: [
      { label: "Why is my kid so drawn to screens?", prompt_text: "My child seems addicted to their devices. Can you help me understand what's actually happening in their brain?" },
      { label: "What apps is my child probably using?", prompt_text: "I want to understand what apps and AI tools kids my child's age typically use. Can you walk me through the landscape?" },
      { label: "How do I start a conversation about this?", prompt_text: "I want to talk to my child about their technology use but I don't know where to start without sounding like a lecture." }
    ]
  },
  {
    title: "The WISE Framework Introduction",
    description: "Learn the four-step framework for guiding AI conversations with your child.",
    order_number: 3,
    video_url: "",
    video_type: "youtube",
    system_prompt: "You are teaching the WISE framework: Wonder (encourage curiosity), Interpret (evaluate AI outputs), Safeguard (set boundaries), Engage (learn together). Help parents understand each element and how to apply it. Use concrete examples.",
    status: "published",
    prompts: [
      { label: "Explain WISE to me", prompt_text: "Can you walk me through the WISE framework step by step?" },
      { label: "How do I use this with my specific child?", prompt_text: "I have a [child's age] year old. How would I apply the WISE framework with them specifically?" },
      { label: "Give me an example", prompt_text: "Can you give me a concrete example of using all four parts of WISE in a real situation?" }
    ]
  },
  {
    title: "Setting Healthy Boundaries",
    description: "Create technology rules that actually work for your family.",
    order_number: 4,
    video_url: "",
    video_type: "youtube",
    system_prompt: "You are helping parents create practical, enforceable technology boundaries. Focus on collaboration over control. Help them think through their specific family situation. Avoid one-size-fits-all rules.",
    status: "published",
    prompts: [
      { label: "Help me set screen time limits", prompt_text: "I need help figuring out appropriate screen time limits for my child. Where do I start?" },
      { label: "My current rules aren't working", prompt_text: "I've tried setting rules but my child ignores them or we end up fighting. What am I doing wrong?" },
      { label: "Create a family agreement with me", prompt_text: "I want to create a family technology agreement. Can you help me think through what should be in it?" }
    ]
  },
  {
    title: "Ongoing Learning Together",
    description: "How to keep growing as technology evolves.",
    order_number: 5,
    video_url: "",
    video_type: "youtube",
    system_prompt: "You are helping parents develop a long-term approach to technology parenting. Focus on building skills that last, adapting as children grow, and staying curious rather than fearful. Encourage parents to see themselves as learning partners.",
    status: "draft",
    prompts: [
      { label: "How do I keep up with changes?", prompt_text: "Technology changes so fast. How can I possibly keep up as a parent?" },
      { label: "What about when they're older?", prompt_text: "My approach needs to change as my child grows. How do I adapt the WISE framework for different ages?" },
      { label: "Resources for continued learning", prompt_text: "What resources do you recommend for me to continue learning about AI and parenting?" }
    ]
  }
];
