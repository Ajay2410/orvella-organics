import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { inquiryService } from '../../services/inquiries/inquiryService';
import type { ContactInquiry } from '../../services/supabase/types';
import { 
  MessageSquare, 
  ArrowLeft, 
  RefreshCw, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await inquiryService.getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    // Optimistic update
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    const success = await inquiryService.updateStatus(id, newStatus);
    if (success) {
      setFeedback(`Status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setFeedback(null), 2500);
    } else {
      loadInquiries();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    setInquiries((prev) => prev.filter((item) => item.id !== id));
    await inquiryService.deleteInquiry(id);
    setFeedback('Inquiry deleted');
    setTimeout(() => setFeedback(null), 2500);
  };

  const filteredInquiries = inquiries.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const getStatusBadge = (status: ContactInquiry['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800">
            <Clock size={12} /> New
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-800">
            <AlertCircle size={12} /> In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} /> Resolved
          </span>
        );
    }
  };

  const cleanPhoneNumber = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D5]">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
            >
              <ArrowLeft size={14} /> Back to Admin Overview
            </Link>
            <h1 className="text-3xl font-heading font-bold text-text-dark flex items-center gap-3">
              <MessageSquare size={28} className="text-primary" />
              Customer Contact Inquiries
            </h1>
            <p className="text-sm text-text-muted mt-1 font-body">
              View customer messages submitted via the Contact Us form and follow up directly.
            </p>
          </div>

          <button
            onClick={loadInquiries}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-white text-text-dark hover:bg-bg-cream text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'All Inquiries', count: inquiries.length },
              { key: 'new', label: 'New', count: inquiries.filter((i) => i.status === 'new').length },
              { key: 'in_progress', label: 'In Progress', count: inquiries.filter((i) => i.status === 'in_progress').length },
              { key: 'resolved', label: 'Resolved', count: inquiries.filter((i) => i.status === 'resolved').length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-text-muted border border-[#E8E0D5] hover:border-primary/40'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Inquiries List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-text-muted">
              <RefreshCw size={32} className="animate-spin text-primary mb-3" />
              <p className="text-sm font-medium">Loading inquiries...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-12 text-center shadow-sm">
              <MessageSquare size={40} className="text-text-muted/40 mx-auto mb-3" />
              <h3 className="text-lg font-heading font-bold text-text-dark">No inquiries found</h3>
              <p className="text-sm text-text-muted font-body mt-1">
                {statusFilter === 'all'
                  ? 'Messages submitted through the Contact Us form will appear here.'
                  : `There are currently no inquiries marked as "${statusFilter.replace('_', ' ')}".`}
              </p>
            </div>
          ) : (
            filteredInquiries.map((item) => {
              const formattedDate = item.created_at
                ? new Date(item.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              const cleanPhone = cleanPhoneNumber(item.phone);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E0D5]/60">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-heading font-bold text-text-dark">{item.name}</h2>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1 font-body">
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-body">Mark as:</span>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value as 'new' | 'in_progress' | 'resolved')
                        }
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E8E0D5] bg-bg-cream text-text-dark focus:outline-none focus:border-primary"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Contact details */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-text-dark">
                    <a
                      href={`mailto:${item.email}`}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Mail size={14} className="text-primary" />
                      <span>{item.email}</span>
                    </a>
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        <Phone size={14} className="text-primary" />
                        <span>{item.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="mt-4 p-4 rounded-xl bg-bg-cream/60 border border-[#E8E0D5]/50 text-sm font-body text-text-dark whitespace-pre-wrap leading-relaxed">
                    {item.message}
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E0D5]/60">
                    <div className="flex items-center gap-2">
                      {cleanPhone ? (
                        <a
                          href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                            `Hi ${item.name}! 🌿 Thank you for contacting Orvella Organics. We received your message regarding: "${item.message.slice(0, 60)}..."`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors shadow-sm"
                        >
                          <span>Reply on WhatsApp</span>
                          <ExternalLink size={13} />
                        </a>
                      ) : null}

                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                          'Response from Orvella Organics'
                        )}&body=${encodeURIComponent(
                          `Hi ${item.name},\n\nThank you for reaching out to Orvella Organics!\n\nBest regards,\nOrvella Organics Team`
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8E0D5] bg-white text-text-dark hover:bg-bg-cream transition-colors"
                      >
                        <Mail size={13} />
                        <span>Email Customer</span>
                      </a>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
