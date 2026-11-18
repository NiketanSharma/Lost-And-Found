import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiUploadCloud,
  FiX,
  FiMapPin,
  FiCalendar,
  FiTag,
  FiFileText,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';

const CATEGORIES = [
  'Electronics',
  'Mobile Phones',
  'Wallets',
  'Documents',
  'Bags',
  'Books',
  'Clothing',
  'Jewellery',
  'Keys',
  'Other',
];

const ReportItemPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Determine initial type from URL
  const initialType = location.pathname.includes('found') ? 'found' : 'lost';

  const [itemType, setItemType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [dateLostOrFound, setDateLostOrFound] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');

  // Image upload & preview state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Item title is required.';
    if (!description.trim()) validationErrors.description = 'Please provide a clear description.';
    if (!locationName.trim()) validationErrors.location = 'Please state where this was lost or found.';
    if (!dateLostOrFound) validationErrors.date = 'Date is required.';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please resolve the highlighted issues.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('item_type', itemType);
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('location', locationName.trim());
      formData.append('date_lost_or_found', dateLostOrFound);
      if (contactPhone.trim()) formData.append('contact_phone', contactPhone.trim());
      if (contactEmail.trim()) formData.append('contact_email', contactEmail.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await api.post('/api/items/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(
        itemType === 'lost'
          ? 'Lost item report published successfully!'
          : 'Found item report published successfully!'
      );
      navigate(`/items/${res.data.id}`);
    } catch (err) {
      console.error(err);
      const serverErrors = err.response?.data || {};
      setErrors(serverErrors);
      toast.error('Failed to submit item report. Please check the fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLost = itemType === 'lost';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
            isLost ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLost ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
          {isLost ? 'Report Missing Belonging' : 'Report Found Item'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isLost ? 'Report a Lost Item' : 'Report a Found Item'}
        </h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {isLost
            ? 'Provide accurate details and photos to help our campus and community identify your missing item.'
            : 'List details of the item you discovered so the rightful owner can safely claim it.'}
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10">
        {/* Toggle between Lost and Found */}
        <div className="mb-8 p-1.5 bg-slate-100 rounded-2xl flex max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setItemType('lost')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              isLost
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setItemType('found')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              !isLost
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Found Something
          </button>
        </div>

        {/* Guidance Alert */}
        <div
          className={`mb-8 p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
            isLost
              ? 'bg-rose-50/50 border-rose-200 text-rose-800'
              : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
          }`}
        >
          <FiInfo className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block mb-0.5">
              {isLost ? 'Tip for Lost Items:' : 'Tip for Found Items:'}
            </span>
            {isLost
              ? 'Be specific about brand, color, stickers, and the approximate hour and location you last remember having it.'
              : 'Keep a few unique distinguishing characteristics secret (e.g. wallpaper, exact cash amount, or serial digit) to verify claimant authenticity.'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Item Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Navy Blue Bellroy Leather Wallet"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, size, brand, contents, unique scratches, markings or logos..."
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Location {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiMapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Science Library 2nd Floor, Hall 102"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-rose-600 mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Date {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  value={dateLostOrFound}
                  onChange={(e) => setDateLostOrFound(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Area with Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Photograph <span className="text-slate-400 font-normal">(PNG, JPG, WEBP up to 5MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-center max-h-64">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-60 rounded-xl object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4 right-4 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors shadow-md"
                  title="Remove Image"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FiUploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to browse or drop an image here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Clear pictures drastically increase the chances of item recovery.
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Contact Information (Optional Overrides) */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Contact Information <span className="font-normal lowercase">(Optional: visible to users)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <FiPhone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="relative">
                <FiMail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Contact email (optional)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                isLost
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              } disabled:opacity-50`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Publishing Report...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Publish {isLost ? 'Lost Item' : 'Found Item'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItemPage;
