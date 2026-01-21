import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentData } from '@/lib/documentTypes';
import { Json } from '@/integrations/supabase/types';

export interface UserDocument {
  id: string;
  user_id: string;
  module_id: string | null;
  document_type: 'family_agreement' | '30_day_plan';
  document_data: DocumentData;
  title: string;
  created_at: string;
  updated_at: string;
}

interface UseUserDocumentsOptions {
  userId: string;
}

export const useUserDocuments = ({ userId }: UseUserDocumentsOptions) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user's documents
  const fetchDocuments = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to match our interface
      const transformedDocs: UserDocument[] = (data || []).map(doc => ({
        ...doc,
        document_type: doc.document_type as 'family_agreement' | '30_day_plan',
        document_data: doc.document_data as unknown as DocumentData,
      }));

      setDocuments(transformedDocs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Save a new document or update existing one
  const saveDocument = useCallback(async (
    documentData: DocumentData,
    moduleId: string | null,
    title: string
  ): Promise<UserDocument | null> => {
    if (!userId) return null;

    try {
      // Check if document of this type already exists for this module
      const { data: existing } = await supabase
        .from('user_documents')
        .select('id')
        .eq('user_id', userId)
        .eq('document_type', documentData.type)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (existing) {
        // Update existing document
        const { data, error: updateError } = await supabase
          .from('user_documents')
          .update({
            document_data: documentData as unknown as Json,
            title,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;

        const updatedDoc: UserDocument = {
          ...data,
          document_type: data.document_type as 'family_agreement' | '30_day_plan',
          document_data: data.document_data as unknown as DocumentData,
        };

        // Update local state
        setDocuments(prev => 
          prev.map(d => d.id === updatedDoc.id ? updatedDoc : d)
        );

        return updatedDoc;
      } else {
        // Insert new document
        const { data, error: insertError } = await supabase
          .from('user_documents')
          .insert({
            user_id: userId,
            module_id: moduleId,
            document_type: documentData.type,
            document_data: documentData as unknown as Json,
            title,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newDoc: UserDocument = {
          ...data,
          document_type: data.document_type as 'family_agreement' | '30_day_plan',
          document_data: data.document_data as unknown as DocumentData,
        };

        // Add to local state
        setDocuments(prev => [newDoc, ...prev]);

        return newDoc;
      }
    } catch (err) {
      console.error('Error saving document:', err);
      throw err;
    }
  }, [userId]);

  // Delete a document
  const deleteDocument = useCallback(async (documentId: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      // Remove from local state
      setDocuments(prev => prev.filter(d => d.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      throw err;
    }
  }, []);

  return {
    documents,
    loading,
    error,
    saveDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
};
