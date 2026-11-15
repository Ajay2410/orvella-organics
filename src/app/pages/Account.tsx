import React, { useState, useEffect, useCallback } from 'react';
import { User, MapPin, Phone, Mail, Plus, Trash2, CheckCircle2, Shield, Loader2, ArrowLeft, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';

type Address = Database['public']['Tables']['addresses']['Row'];

export function Account() {
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // New address form
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState('');

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      setAddressLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error.message);
      } else {
        setAddresses(data || []);
      }
    } finally {
      setAddressLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/products');
    }
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
    if (user) {
      fetchAddresses();
    }
  }, [user, profile, authLoading, navigate, fetchAddresses]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      if (error) {
        setProfileMessage(`Error: ${error.message}`);
      } else {
        await refreshProfile();
        setProfileMessage('Profile updated successfully!');
        setTimeout(() => setProfileMessage(''), 3000);
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddrError('');
    setAddrSaving(true);

    try {
      if (!/^\d{6}$/.test(addrPincode.trim())) {
        setAddrError('Please enter a valid 6-digit Indian PIN code.');
        setAddrSaving(false);
        return;
      }

      if (addrDefault && addresses.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase.from('addresses').insert({
        user_id: user.id,
        name: addrName,
        phone: addrPhone,
        line1: addrLine1,
        line2: addrLine2 || null,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        is_default: addrDefault || addresses.length === 0,
      });

      if (error) {
        setAddrError(error.message);
      } else {
        setIsAddingAddress(false);
        // Reset form
        setAddrName('');
        setAddrPhone('');
        setAddrLine1('');
        setAddrLine2('');
        setAddrCity('');
        setAddrState('');
        setAddrPincode('');
        setAddrDefault(false);
        await fetchAddresses();
      }
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (!error) {
      await fetchAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    await fetchAddresses();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-cream">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="py-10 lg:py-16 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-body text-sm text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="font-body text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
          >
            Sign Out
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E8E0D5] shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-heading font-bold text-2xl flex items-center justify-center border-2 border-primary/20">
            {profile?.full_name ? profile.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-dark">
              {profile?.full_name || 'My Account'}
            </h1>
            <p className="font-body text-sm text-text-muted mt-1">{user.email}</p>
            {profile?.role === 'admin' && (
              <span className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                <Shield size={13} />
                Administrator
              </span>
            )}
          </div>
          <div className="flex sm:flex-col gap-2">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-body font-bold text-xs rounded-xl hover:bg-primary-dark transition-all shadow-xs"
            >
              <Package size={15} />
              <span>My Orders</span>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Profile Details Form */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E8E0D5] shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#E8E0D5]">
              <User size={20} className="text-primary" />
              <h2 className="font-heading font-bold text-xl text-text-dark">Profile Details</h2>
            </div>

            {profileMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-primary rounded-[10px] text-xs font-body">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-cream/40 border border-[#D8CEC2] rounded-[10px] text-sm text-text-dark focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-text-muted" />
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100 border border-[#D8CEC2] rounded-[10px] text-sm text-text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">
                  10-Digit Mobile Number (Required for Courier Delivery)
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-text-muted" />
                  <input
                    type="tel"
                    placeholder="9714280780"
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-bg-cream/40 border border-[#D8CEC2] rounded-[10px] text-sm text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="mt-2 py-2.5 px-5 bg-primary text-white font-body font-semibold text-sm rounded-[10px] hover:bg-primary-dark transition-colors self-start shadow-sm disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Delivery Addresses */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E8E0D5] shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E8E0D5]">
              <div className="flex items-center gap-2.5">
                <MapPin size={20} className="text-primary" />
                <h2 className="font-heading font-bold text-xl text-text-dark">Saved Addresses</h2>
              </div>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark"
                >
                  <Plus size={16} />
                  Add New
                </button>
              )}
            </div>

            {/* Address Form */}
            {isAddingAddress ? (
              <form onSubmit={handleAddAddress} className="flex flex-col gap-3 p-4 bg-bg-cream/40 rounded-[14px] border border-[#E8E0D5]">
                <h3 className="font-heading font-bold text-sm text-text-dark">Add Delivery Address</h3>
                {addrError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-[8px]">{addrError}</p>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#D8CEC2] rounded-[8px] text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit Phone"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#D8CEC2] rounded-[8px] text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Flat, House no., Building, Apartment"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#D8CEC2] rounded-[8px] text-xs text-text-dark focus:outline-none focus:border-primary"
                />

                <input
                  type="text"
                  placeholder="Area, Street, Sector, Village (Optional)"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#D8CEC2] rounded-[8px] text-xs text-text-dark focus:outline-none focus:border-primary"
                />

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#D8CEC2] rounded-[8px] text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#D8CEC2] rounded-[8px] text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    placeholder="PIN Code"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#D8CEC2] rounded-[8px] text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-body text-text-dark cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={addrDefault}
                    onChange={(e) => setAddrDefault(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  Set as default delivery address
                </label>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={addrSaving}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-[8px] hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
                  >
                    {addrSaving ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 bg-white border border-[#D8CEC2] text-xs font-medium text-text-dark rounded-[8px] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {/* Address List */}
            {addressLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : addresses.length === 0 && !isAddingAddress ? (
              <p className="text-xs text-text-muted font-body py-6 text-center">
                No delivery addresses saved yet. Add your address for faster checkout.
              </p>
            ) : (
              <div className="flex flex-col gap-3 mt-3">
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-[12px] border transition-all ${
                      a.is_default
                        ? 'border-primary bg-primary/5'
                        : 'border-[#E8E0D5] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-text-dark">{a.name}</span>
                          {a.is_default && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ''}
                          <br />
                          {a.city}, {a.state} - <strong>{a.pincode}</strong>
                        </p>
                        <p className="text-xs text-text-dark font-medium mt-1">
                          Phone: {a.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!a.is_default && (
                          <button
                            onClick={() => handleSetDefault(a.id)}
                            className="text-xs text-primary font-semibold hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(a.id)}
                          className="text-text-muted hover:text-red-600 transition-colors p-1"
                          title="Delete address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
