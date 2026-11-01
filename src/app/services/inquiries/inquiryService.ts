import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';
import type { ContactInquiry } from '../supabase/types';

export const inquiryService = {
  /**
   * Submit an inquiry from the Contact Us form into Supabase
   */
  async submitInquiry(
    name: string,
    email: string,
    phone: string,
    message: string,
    userId?: string | null
  ): Promise<{ data: ContactInquiry | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .insert({
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim() || null,
          message: message.trim(),
          user_id: userId || null,
          status: 'new',
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting inquiry to Supabase:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as ContactInquiry, error: null };
    } catch (err: any) {
      console.error('Inquiry submission failed:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Fetch all inquiries for the admin dashboard
   */
  async getInquiries(): Promise<ContactInquiry[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
        return [];
      }

      return (data || []) as ContactInquiry[];
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      return [];
    }
  },

  /**
   * Update the status of an inquiry ('new' | 'in_progress' | 'resolved')
   */
  async updateStatus(
    id: string,
    status: 'new' | 'in_progress' | 'resolved'
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status })
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      return false;
    }
  },

  /**
   * Delete an inquiry
   */
  async deleteInquiry(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      return false;
    }
  },
};
