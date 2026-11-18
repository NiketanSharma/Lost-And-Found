import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import { ClaimStatusBadge } from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';
import {
  FiGrid,
  FiPlusCircle,
  FiInbox,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiClock,
  FiPhone,
  FiMail,
  FiShield,
} from 'react-icons/fi';

const DashboardPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found' | 'resolved' | 'claims_received' | 'claims_sent'
  const [stats, setStats] = useState({
    total_reported: 0,
    total_lost: 0,
    total_found: 0,
    total_resolved: 0,
    pending_received_claims: 0,
    pending_sent_claims: 0,
  });

  const [myItems, setMyItems] = useState([]);
  const [claimsReceived, setClaimsReceived] = useState([]);
  const [claimsSent, setClaimsSent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch user stats
      const statsRes = await api.get('/api/dashboard/stats/');
      if (statsRes.data?.user) {
        setStats(statsRes.data.user);
      }

      // 2. Fetch user's reported items
      const itemsRes = await api.get('/api/items/?mine=true&page_size=100');
      setMyItems(itemsRes.data.results || itemsRes.data || []);

      // 3. Fetch incoming claims
      const claimsRecRes = await api.get('/api/claims/?type=received');
      setClaimsReceived(claimsRecRes.data.results || claimsRecRes.data || []);

      // 4. Fetch submitted claims
      const claimsSentRes = await api.get('/api/claims/?type=sent');
      setClaimsSent(claimsSentRes.data.results || claimsSentRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Item Deletion
  const handleDeleteItem = async () => {
    if (!selectedItemToDelete) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/items/${selectedItemToDelete.id}/`);
      toast.success('Item report deleted successfully.');
      setMyItems((prev) => prev.filter((it) => it.id !== selectedItemToDelete.id));
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete item.');
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
      setSelectedItemToDelete(null);
    }
  };

  // Handle Quick Resolve Toggle
  const handleToggleResolve = async (item) => {
    try {
      const newStatus = item.status === 'resolved' ? 'active' : 'resolved';
      const res = await api.patch(`/api/items/${item.id}/resolve/`, { status: newStatus });
      toast.success(`Item status updated to ${newStatus.toUpperCase()}`);
      setMyItems((prev) => prev.map((it) => (it.id === item.id ? res.data : it)));
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // Handle Accept / Decline Claim
  const handleClaimStatusChange = async (claimId, newStatus) => {
    try {
      await api.patch(`/api/claims/${claimId}/`, { status: newStatus });
      toast.success(`Claim marked as ${newStatus.toUpperCase()}`);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update claim.');
    }
  };

  // Filtered lists for the tabs
  const lostItems = myItems.filter((it) => it.item_type === 'lost' && it.status !== 'resolved');
  const foundItems = myItems.filter((it) => it.item_type === 'found' && it.status !== 'resolved');
  const resolvedItems = myItems.filter((it) => it.status === 'resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
            Personal Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.display_name || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your reported belongings, track recovery progress, and review claim inquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/report-lost"
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold border border-rose-200/80 transition-all flex items-center gap-1.5"
          >
            <FiPlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold border border-emerald-200/80 transition-all flex items-center gap-1.5"
          >
            <FiCheckCircle className="w-4 h-4" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Reported
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            {stats.total_reported || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Lost Items
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1.5">
            {stats.total_lost || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Found Items
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1.5">
            {stats.total_found || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            Reunited / Resolved
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1.5">
            {stats.total_resolved || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Pending Claims
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1.5 flex items-center justify-between">
            <span>{stats.pending_received_claims || 0}</span>
            <span className="text-xs font-medium text-slate-400">Incoming</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200/80 px-4 sm:px-6 flex overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('lost')}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'lost'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Lost Items</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700">
              {lostItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('found')}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'found'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Found Items</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700">
              {foundItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'resolved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Resolved Items</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
              {resolvedItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('claims_received')}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'claims_received'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiInbox className="w-4 h-4" />
            <span>Incoming Claims</span>
            {stats.pending_received_claims > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold animate-pulse">
                {stats.pending_received_claims} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('claims_sent')}
            className={`py-4 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'claims_sent'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiSend className="w-4 h-4" />
            <span>My Submitted Claims</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
              {claimsSent.length}
            </span>
          </button>
        </div>

        {/* TAB PANELS */}
        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-400">Loading your data...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MY LOST ITEMS */}
              {activeTab === 'lost' && (
                <div>
                  {lostItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {lostItems.map((item) => (
                        <div key={item.id} className="relative flex flex-col">
                          <ItemCard item={item} />
                          {/* Owner Quick Controls Bar */}
                          <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleResolve(item)}
                              className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <FiCheckCircle className="w-3.5 h-3.5" />
                              <span>Mark Resolved</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/items/${item.id}/edit`}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200/60"
                                title="Edit Item"
                              >
                                <FiEdit3 className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedItemToDelete(item);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200/60"
                                title="Delete Item"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiAlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">No active lost items</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                        You currently have no active lost item reports open.
                      </p>
                      <Link
                        to="/report-lost"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                      >
                        <FiPlusCircle className="w-4 h-4" />
                        <span>Report Lost Item</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY FOUND ITEMS */}
              {activeTab === 'found' && (
                <div>
                  {foundItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {foundItems.map((item) => (
                        <div key={item.id} className="relative flex flex-col">
                          <ItemCard item={item} />
                          <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleResolve(item)}
                              className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <FiCheckCircle className="w-3.5 h-3.5" />
                              <span>Mark Resolved</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/items/${item.id}/edit`}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200/60"
                                title="Edit Item"
                              >
                                <FiEdit3 className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedItemToDelete(item);
                                  setDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200/60"
                                title="Delete Item"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiCheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800">No active found items</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                        You have not reported finding any items yet.
                      </p>
                      <Link
                        to="/report-found"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Report Found Item</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RESOLVED ITEMS */}
              {activeTab === 'resolved' && (
                <div>
                  {resolvedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resolvedItems.map((item) => (
                        <div key={item.id} className="relative flex flex-col">
                          <ItemCard item={item} />
                          <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleResolve(item)}
                              className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <FiClock className="w-3.5 h-3.5" />
                              <span>Reopen Report</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemToDelete(item);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200/60"
                              title="Delete Item"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <FiCheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 text-sm font-medium">No resolved items yet.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        When you recover a lost item or return a found item, mark it as resolved.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INCOMING CLAIMS */}
              {activeTab === 'claims_received' && (
                <div className="space-y-4">
                  {claimsReceived.length > 0 ? (
                    claimsReceived.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center uppercase">
                              {(claim.claimant?.display_name || claim.claimant?.username || 'U').charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm sm:text-base">
                                  {claim.claimant?.display_name || claim.claimant?.username}
                                </span>
                                <ClaimStatusBadge status={claim.status} />
                              </div>
                              <p className="text-xs text-slate-500">
                                Claimed item:{' '}
                                <Link
                                  to={`/items/${claim.item}`}
                                  className="font-bold text-blue-600 hover:underline"
                                >
                                  {claim.item_details?.title || `Item #${claim.item}`}
                                </Link>
                              </p>
                            </div>
                          </div>

                          <span className="text-xs text-slate-400">
                            {new Date(claim.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Message & Proof */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-2">
                          <p>
                            <span className="font-bold text-slate-900 block mb-0.5">Claim Message:</span>
                            {claim.message}
                          </p>

                          {claim.proof_details && (
                            <div className="pt-2 border-t border-slate-100">
                              <span className="font-bold text-slate-900 block mb-0.5">Proof Provided:</span>
                              <p className="text-slate-600">{claim.proof_details}</p>
                            </div>
                          )}
                        </div>

                        {/* Contact info */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                            {claim.contact_phone && (
                              <span className="flex items-center gap-1.5 font-medium">
                                <FiPhone className="w-3.5 h-3.5 text-blue-600" />
                                {claim.contact_phone}
                              </span>
                            )}
                            {claim.contact_email && (
                              <span className="flex items-center gap-1.5 font-medium">
                                <FiMail className="w-3.5 h-3.5 text-blue-600" />
                                {claim.contact_email}
                              </span>
                            )}
                          </div>

                          {/* Owner Actions on Claim */}
                          {claim.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleClaimStatusChange(claim.id, 'rejected')}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClaimStatusChange(claim.id, 'accepted')}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                              >
                                Accept Claim
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-500 capitalize">
                              Claim marked as {claim.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <FiInbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium text-sm">No incoming claims yet.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        When other users recognize their property from your reports, their claims will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SUBMITTED CLAIMS */}
              {activeTab === 'claims_sent' && (
                <div className="space-y-4">
                  {claimsSent.length > 0 ? (
                    claimsSent.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                You claimed:
                              </span>
                              <Link
                                to={`/items/${claim.item}`}
                                className="font-bold text-slate-900 text-sm hover:text-blue-600 flex items-center gap-1"
                              >
                                <span>{claim.item_details?.title || `Item #${claim.item}`}</span>
                                <FiEye className="w-3.5 h-3.5 text-slate-400" />
                              </Link>
                            </div>
                            <p className="text-xs text-slate-500">
                              Reported by owner: {claim.item_owner_name}
                            </p>
                          </div>

                          <ClaimStatusBadge status={claim.status} />
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                          <p className="text-slate-600 italic">"{claim.message}"</p>
                        </div>

                        {claim.status === 'accepted' && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              The reporter accepted your claim! Please coordinate with them to collect your belonging.
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <FiSend className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium text-sm">You haven't submitted any claims yet.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Browse found items and submit a claim if you recognize your missing possessions.
                      </p>
                      <Link
                        to="/browse?item_type=found"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                      >
                        <span>Browse Found Items</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Item Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItemToDelete(null);
        }}
        onConfirm={handleDeleteItem}
        title="Delete Item Report?"
        message={`Are you sure you want to permanently delete "${selectedItemToDelete?.title}"?`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default DashboardPage;
