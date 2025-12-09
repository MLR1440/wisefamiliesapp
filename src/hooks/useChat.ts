import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface UseChatOptions {
  moduleId: string;
  userId: string;
}

export const useChat = ({ moduleId, userId }: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load existing conversation on mount
  useEffect(() => {
    const loadConversation = async () => {
      if (!moduleId || !userId) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        // Find existing conversation
        const { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('module_id', moduleId)
          .eq('user_id', userId)
          .maybeSingle();

        if (conversation) {
          setConversationId(conversation.id);
          
          // Load messages
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

          if (messagesData) {
            setMessages(messagesData.map(m => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              created_at: m.created_at,
            })));
          }
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversation();
  }, [moduleId, userId]);

  // Create or get conversation
  const ensureConversation = async (): Promise<string> => {
    if (conversationId) return conversationId;

    const { data, error } = await supabase
      .from('conversations')
      .insert({ module_id: moduleId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    setConversationId(data.id);
    return data.id;
  };

  // Save message to database
  const saveMessage = async (convId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, role, content })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
    return data;
  };

  // Send message and stream response
  // displayContent is what the user sees, actualContent is what gets sent to AI (defaults to displayContent)
  const sendMessage = useCallback(async (displayContent: string, actualContent?: string) => {
    if (!displayContent.trim() || isLoading) return;

    const contentToDisplay = displayContent.trim();
    const contentToSend = (actualContent || displayContent).trim();

    setIsLoading(true);
    setError(null);
    
    // Add user message to UI immediately (shows displayContent)
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: contentToDisplay,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const convId = await ensureConversation();
      
      // Save user message (save displayContent to DB for history)
      const savedUserMsg = await saveMessage(convId, 'user', contentToDisplay);
      setMessages(prev => 
        prev.map(m => m.id === userMessage.id ? { ...m, id: savedUserMsg.id } : m)
      );

      // Prepare messages for API (use actualContent for the latest message)
      const apiMessages = [...messages.map(m => ({
        role: m.role,
        content: m.content,
      })), { role: 'user' as const, content: contentToSend }];

      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();

      // Stream response
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, module_id: moduleId }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Process streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantMessageId = `temp-assistant-${Date.now()}`;

      // Add placeholder assistant message
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m => m.id === assistantMessageId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

      // Save assistant message
      if (assistantContent) {
        const savedAssistantMsg = await saveMessage(convId, 'assistant', assistantContent);
        setMessages(prev =>
          prev.map(m => m.id === assistantMessageId ? { ...m, id: savedAssistantMsg.id } : m)
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Chat error:', err);
        setError(err.message || 'Failed to get response');
        // Remove the failed user message from UI if no response was started
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'user' && lastMsg.id.startsWith('temp-')) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, moduleId, userId, isLoading, conversationId]);

  // Retry last failed message
  const retryLastMessage = useCallback((content: string) => {
    setError(null);
    sendMessage(content);
  }, [sendMessage]);

  // Clear conversation
  const clearConversation = useCallback(async () => {
    if (conversationId) {
      await supabase.from('messages').delete().eq('conversation_id', conversationId);
      await supabase.from('conversations').delete().eq('id', conversationId);
    }
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, [conversationId]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
    cancelRequest,
    hasHistory: messages.length > 0,
  };
};
