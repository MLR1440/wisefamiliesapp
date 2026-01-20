-- Seed community topics with course-relevant content
INSERT INTO community_topics (user_id, title, content, category, created_at, updated_at)
VALUES
  -- General
  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Welcome to the Community!', 
   'We''re so glad you''re here! Take a moment to introduce yourself to the community. Share how old your kids are, what brought you to this course, and one thing you''re hoping to learn. Looking forward to getting to know you!', 
   'general', now() - interval '7 days', now() - interval '7 days'),
  
  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Celebrating Small Wins', 
   'Parenting in the AI age is hard work. Let''s celebrate progress together! Share a small win you''ve had recently - maybe a good conversation, a moment of genuine struggle, or a boundary that actually worked.', 
   'general', now() - interval '6 days', now() - interval '6 days'),

  -- AI Tools
  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'What AI tools is your child using?', 
   'Let''s create a shared knowledge base. What AI tools or apps have you noticed your child using? ChatGPT? AI features in games? Homework helpers? Share what you''re seeing - no judgment, just curiosity!', 
   'ai-tools', now() - interval '5 days', now() - interval '5 days'),

  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Age-appropriate AI recommendations', 
   'Have you found any AI tools that work well for your child''s age group? Share your recommendations and let''s help each other navigate what''s appropriate for different developmental stages.', 
   'ai-tools', now() - interval '4 days', now() - interval '4 days'),

  -- AI Safety (NEW CATEGORY)
  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Privacy concerns with AI chatbots', 
   'What are your biggest concerns about your child''s data when they use AI tools? Let''s discuss strategies for protecting our kids'' privacy while still allowing them to learn and explore.', 
   'ai-safety', now() - interval '3 days', now() - interval '3 days'),

  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Recognizing AI-generated misinformation', 
   'How are you teaching your kids to spot AI-generated content and misinformation? Share tips and resources for building critical thinking skills in the AI age.', 
   'ai-safety', now() - interval '2 days', now() - interval '2 days'),

  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Setting up parental controls for AI access', 
   'What parental controls or monitoring approaches are you using for AI tools? Share what''s working (and what isn''t) for your family.', 
   'ai-safety', now() - interval '1 day', now() - interval '1 day'),

  -- Parenting Tips
  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'The Daily Connection Habit - What''s Working?', 
   'Module 3 talks about 10 minutes of device-free connection time daily. Have you tried it? What activities work best for your family? Share your wins and challenges!', 
   'parenting-tips', now() - interval '4 days', now() - interval '4 days'),

  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Socratic Questions That Actually Work', 
   'The Socratic questioning approach is powerful but can feel awkward at first. What questions have you tried that actually opened up good conversations with your kids about AI?', 
   'parenting-tips', now() - interval '3 days', now() - interval '3 days'),

  -- Course Discussion
  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'What''s Your Child''s AI User Profile?', 
   'After going through the assessment in Chapter 2, what AI user profile best describes your child? Has identifying their pattern changed how you think about helping them?', 
   'course-discussion', now() - interval '5 days', now() - interval '5 days'),

  ('1f03b6de-16b8-439b-8f72-b76a17f74f7a', 
   'Helping kids handle frustration without AI rescue', 
   'One key concept is letting kids experience "productive struggle" rather than immediately turning to AI for answers. How are you implementing this with your family?', 
   'course-discussion', now() - interval '2 days', now() - interval '2 days');