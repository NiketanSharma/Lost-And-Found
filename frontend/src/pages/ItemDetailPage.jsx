import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ItemTypeBadge, ItemStatusBadge, ClaimStatusBadge } from '../components/StatusBadge';
import ClaimModal from '../components/ClaimModal';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';
import {
  FiMapPin,
  FiCalendar,
  FiTag,
  FiUser,
  FiShield,
  FiMail,
  FiPhone,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiArrowLeft,
  FiAlertCircle,
  FiMessageSquare,
  FiShare2,
} from 'react-icons/fi';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItemData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/items/${id}/`);
      setItem(res.data);

      // If current user is the owner, also load claims submitted for this item
      if (res.data.is_owner) {
        const claimsRes = await api.get(`/api/claims/?item_id=${id}`);
        setClaims(claimsRes.data.results || claimsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Item not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  // Handle Delete
  const handleDeleteItem = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/api/items/${id}/`);
      toast.success('Report deleted successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete item.');
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
    }
  };

  // Handle Mark Resolved
  const handleToggleResolved = async () => {
    setActionLoading(true);
    try {
      const targetStatus = item.status === 'resolved' ? 'active' : 'resolved';
      const res = await api.patch(`/api/items/${id}/resolve/`, { status: targetStatus });
      setItem(res.data);
      toast.success(`Item status updated to ${targetStatus.toUpperCase()}!`);
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setActionLoading(false);
      setResolveModalOpen(false);
    }
  };

  // Handle Accept/Reject Claim
  const handleClaimStatusChange = async (claimId, newStatus) => {
    try {
      await api.patch(`/api/claims/${claimId}/`, { status: newStatus });
      toast.success(`Claim marked as ${newStatus.toUpperCase()}`);
      fetchItemData();
    } catch (err) {
      toast.error('Failed to update claim status.');
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    return `${backendUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested item report does not exist or may have been removed by its author.
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(item.image);
  const isOwner = Boolean(item.is_owner || (user && user.id === item.user?.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <FiShare2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Image Gallery & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="relative aspect-video sm:aspect-16/10 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain bg-slate-950/5"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 py-16">
                  <FiTag className="w-16 h-16 stroke-1 text-slate-300 mb-2" />
                  <span className="text-sm font-medium">No photo provided for this report</span>
                </div>
              )}

              {/* Status and Type Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <ItemTypeBadge type={item.item_type} />
              </div>
              <div className="absolute top-4 right-4">
                <ItemStatusBadge status={item.status} />
              </div>
            </div>

            {/* Title & Core Details Header */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                <FiTag className="w-3.5 h-3.5" />
                <span>{item.category}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {item.title}
              </h1>

              {/* Metadata Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                      Location Reported
                    </span>
                    <span className="font-semibold text-slate-800">{item.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                      Date {item.item_type === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <span className="font-semibold text-slate-800">{item.date_lost_or_found}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Description & Details
                </h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-white">
                  {item.description}
                </p>
              </div>
            </div>
          </div>

          {/* INCOMING CLAIMS SECTION (Visible ONLY to the owner) */}
          {isOwner && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FiMessageSquare className="w-5 h-5 text-blue-600" />
                    Claim Requests ({claims.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and verify requests from individuals claiming this item.
                  </p>
                </div>
              </div>

              {claims.length > 0 ? (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                            {(claim.claimant?.display_name || claim.claimant?.username || 'U').charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900">
                              {claim.claimant?.display_name || claim.claimant?.username}
                            </span>
                            <span className="text-xs text-slate-400 block">
                              Claimed on {new Date(claim.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <ClaimStatusBadge status={claim.status} />
                      </div>

                      {/* Message */}
                      <div className="text-xs sm:text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/70">
                        <p className="font-semibold text-slate-900 mb-1">Claim Explanation:</p>
                        <p>{claim.message}</p>

                        {claim.proof_details && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <p className="font-semibold text-slate-900 mb-0.5">Proof / Serial details:</p>
                            <p className="text-slate-600">{claim.proof_details}</p>
                          </div>
                        )}
                      </div>

                      {/* Claimant Contact info */}
                      {(claim.contact_phone || claim.contact_email) && (
                        <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
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
                      )}

                      {/* Status Action Buttons for Owner */}
                      {claim.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleClaimStatusChange(claim.id, 'rejected')}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClaimStatusChange(claim.id, 'accepted')}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                          >
                            Accept Claim
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  No claims have been submitted for this item yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Reporter Info, Action Card & Safety */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            {isOwner ? (
              /* Owner Actions */
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Author Actions
                </span>

                <button
                  type="button"
                  onClick={() => setResolveModalOpen(true)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    item.status === 'resolved'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{item.status === 'resolved' ? 'Reopen as Active' : 'Mark as Resolved'}</span>
                </button>

                <Link
                  to={`/items/${item.id}/edit`}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Edit Report</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete Report</span>
                </button>
              </div>
            ) : (
              /* Public / Claimant Actions */
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {item.item_type === 'lost' ? 'Found this item?' : 'Is this your item?'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.item_type === 'lost'
                      ? 'If you have found this missing belonging, reach out or file a recovery notification.'
                      : 'Send a claim request with proof of ownership to securely coordinate recovery.'}
                  </p>
                </div>

                {item.status === 'resolved' ? (
                  <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold text-center">
                    This item has been recovered and resolved.
                  </div>
                ) : user ? (
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <FiShield className="w-4 h-4" />
                    <span>{item.item_type === 'lost' ? 'Contact Owner' : 'Claim This Item'}</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    state={{ from: window.location.pathname }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Log in to Claim or Contact</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Reporter Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Reported By
            </span>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center uppercase overflow-hidden">
                {item.user?.avatar ? (
                  <img src={item.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (item.user?.display_name || item.user?.username || 'U').charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {item.user?.display_name || item.user?.username}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  Member since {new Date(item.user?.date_joined || item.created_at).getFullYear()}
                </p>
              </div>
            </div>

            {/* Revealed contact details only if owner provided them */}
            {(item.contact_phone || item.contact_email) && (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                {item.contact_email && (
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{item.contact_email}</span>
                  </div>
                )}
                {item.contact_phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{item.contact_phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Safe Exchange Tips Card */}
          <div className="bg-slate-100/70 rounded-3xl border border-slate-200/80 p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
              <FiShield className="w-4 h-4" />
              <span>Safety Tips</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed list-disc list-inside">
              <li>Meet in a well-lit, public place like a campus library or police station.</li>
              <li>Ask for unique proof (passcodes, engravings, serial number) before handing over valuables.</li>
              <li>Never wire money or share credit card details for a reward.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => fetchItemData()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Item Report?"
        message="Are you sure you want to permanently delete this report? This will remove all associated images and claim inquiries."
        confirmText="Delete Report"
        confirmVariant="danger"
        loading={actionLoading}
      />

      {/* Resolve Confirmation Modal */}
      <ConfirmationModal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        onConfirm={handleToggleResolved}
        title={item.status === 'resolved' ? 'Reopen Report?' : 'Mark Item as Resolved?'}
        message={
          item.status === 'resolved'
            ? 'This will restore the item to active status so others can view and claim it.'
            : 'Confirm that this item has been safely reunited with its rightful owner. This will update the status to resolved.'
        }
        confirmText={item.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
        confirmVariant={item.status === 'resolved' ? 'primary' : 'success'}
        loading={actionLoading}
      />
    </div>
  );
};

export default ItemDetailPage;
