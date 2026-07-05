import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineX, HiOutlineEye } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getSiteContent, updateSiteContent } from '../../api/siteContentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TABS = [
  { id: 'hero', label: 'Hero' },
  { id: 'story', label: 'Story Section' },
  { id: 'badges', label: 'Trust Badges' },
  { id: 'about', label: 'About Page' },
  { id: 'contact', label: 'Contact / Social' },
];

const isValidHref = (v) => {
  if (!v) return true;
  if (v.startsWith('/')) return true;
  try {
    const u = new URL(v);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
};

const isValidEmail = (v) => !v || /^\S+@\S+\.\S+$/.test(v);

const AdminSiteContent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('hero');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getSiteContent();
        setContent(data.data);
      } catch {
        toast.error('Failed to load site content');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!content) return null;

  const set = (key, value) => setContent((prev) => ({ ...prev, [key]: value }));

  const setBadge = (i, key, value) => {
    setContent((prev) => {
      const next = [...(prev.trustBadges || [])];
      next[i] = { ...next[i], [key]: value };
      return { ...prev, trustBadges: next };
    });
  };
  const addBadge = () => {
    if ((content.trustBadges || []).length >= 8) return;
    setContent((prev) => ({
      ...prev,
      trustBadges: [
        ...(prev.trustBadges || []),
        { title: '', description: '', icon: '✨' },
      ],
    }));
  };
  const removeBadge = (i) => {
    setContent((prev) => ({
      ...prev,
      trustBadges: (prev.trustBadges || []).filter((_, idx) => idx !== i),
    }));
  };

  const setStoryParagraph = (i, value) => {
    setContent((prev) => {
      const next = [...(prev.storyParagraphs || [])];
      next[i] = { text: value };
      return { ...prev, storyParagraphs: next };
    });
  };
  const addStoryParagraph = () => {
    if ((content.storyParagraphs || []).length >= 6) return;
    setContent((prev) => ({
      ...prev,
      storyParagraphs: [...(prev.storyParagraphs || []), { text: '' }],
    }));
  };
  const removeStoryParagraph = (i) => {
    setContent((prev) => ({
      ...prev,
      storyParagraphs: (prev.storyParagraphs || []).filter((_, idx) => idx !== i),
    }));
  };

  const setAboutParagraph = (i, value) => {
    setContent((prev) => {
      const next = [...(prev.aboutParagraphs || [])];
      next[i] = { text: value };
      return { ...prev, aboutParagraphs: next };
    });
  };
  const addAboutParagraph = () => {
    if ((content.aboutParagraphs || []).length >= 10) return;
    setContent((prev) => ({
      ...prev,
      aboutParagraphs: [...(prev.aboutParagraphs || []), { text: '' }],
    }));
  };
  const removeAboutParagraph = (i) => {
    setContent((prev) => ({
      ...prev,
      aboutParagraphs: (prev.aboutParagraphs || []).filter((_, idx) => idx !== i),
    }));
  };

  const validate = () => {
    const e = {};
    if (!content.heroTitle?.trim()) e.heroTitle = 'Hero title is required';
    if (!content.heroSubtitle?.trim()) e.heroSubtitle = 'Hero subtitle is required';
    if (!isValidHref(content.heroPrimaryCtaHref))
      e.heroPrimaryCtaHref = 'Must be /path or full URL';
    if (!isValidHref(content.heroSecondaryCtaHref))
      e.heroSecondaryCtaHref = 'Must be /path or full URL';
    if (!isValidEmail(content.contactEmail))
      e.contactEmail = 'Must be a valid email';
    if (!isValidHref(content.socialInstagram))
      e.socialInstagram = 'Must be a full URL';
    if (!isValidHref(content.socialPinterest))
      e.socialPinterest = 'Must be a full URL';
    (content.trustBadges || []).forEach((b, i) => {
      if (!b.title?.trim()) e[`badge-${i}-title`] = 'Required';
      if (!b.description?.trim()) e[`badge-${i}-description`] = 'Required';
    });
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    try {
      const { data } = await updateSiteContent(content);
      setContent(data.data);
      toast.success('Site content saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-(--animate-fade-down)">
        <div>
          <h1 className="text-3xl font-serif text-brand-charcoal">Site Content</h1>
          <p className="text-brand-warm-gray mt-1">
            Edit the copy that appears on your homepage and About page.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-brand-linen rounded-xl text-sm font-medium hover:bg-brand-cream"
          >
            <HiOutlineEye size={18} />
            Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-brand-charcoal text-white rounded-xl font-medium hover:bg-brand-charcoal/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-linen animate-(--animate-fade-up)">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              tab === t.id
                ? 'border-brand-blush-dark text-brand-blush-dark'
                : 'border-transparent text-brand-warm-gray hover:text-brand-charcoal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-(--animate-fade-up)">
        {tab === 'hero' && (
          <Card>
            <Field
              label="Eyebrow (small line above headline)"
              value={content.heroEyebrow}
              onChange={(v) => set('heroEyebrow', v)}
              max={80}
            />
            <Field
              label="Title *"
              value={content.heroTitle}
              onChange={(v) => set('heroTitle', v)}
              max={120}
              error={errors.heroTitle}
            />
            <Field
              label="Title Accent (the italic part)"
              value={content.heroTitleAccent}
              onChange={(v) => set('heroTitleAccent', v)}
              max={120}
            />
            <Field
              label="Subtitle *"
              value={content.heroSubtitle}
              onChange={(v) => set('heroSubtitle', v)}
              max={600}
              multiline
              error={errors.heroSubtitle}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Primary button label"
                value={content.heroPrimaryCtaLabel}
                onChange={(v) => set('heroPrimaryCtaLabel', v)}
                max={40}
              />
              <Field
                label="Primary button link"
                value={content.heroPrimaryCtaHref}
                onChange={(v) => set('heroPrimaryCtaHref', v)}
                max={200}
                error={errors.heroPrimaryCtaHref}
                hint="e.g. /shop or https://..."
              />
              <Field
                label="Secondary button label"
                value={content.heroSecondaryCtaLabel}
                onChange={(v) => set('heroSecondaryCtaLabel', v)}
                max={40}
              />
              <Field
                label="Secondary button link"
                value={content.heroSecondaryCtaHref}
                onChange={(v) => set('heroSecondaryCtaHref', v)}
                max={200}
                error={errors.heroSecondaryCtaHref}
                hint="e.g. /about or https://..."
              />
            </div>
          </Card>
        )}

        {tab === 'story' && (
          <Card>
            <Field
              label="Eyebrow"
              value={content.storyEyebrow}
              onChange={(v) => set('storyEyebrow', v)}
              max={80}
            />
            <Field
              label="Title"
              value={content.storyTitle}
              onChange={(v) => set('storyTitle', v)}
              max={120}
            />
            <Field
              label="Title Accent"
              value={content.storyTitleAccent}
              onChange={(v) => set('storyTitleAccent', v)}
              max={120}
            />
            <Field
              label="Quote (shown in the image card)"
              value={content.storyQuote}
              onChange={(v) => set('storyQuote', v)}
              max={200}
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Paragraphs</label>
                <button
                  type="button"
                  onClick={addStoryParagraph}
                  disabled={(content.storyParagraphs || []).length >= 6}
                  className="text-xs text-brand-blush-dark font-medium hover:underline disabled:opacity-40"
                >
                  <HiOutlinePlus className="inline" size={14} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {(content.storyParagraphs || []).map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={p.text}
                      onChange={(e) => setStoryParagraph(i, e.target.value)}
                      maxLength={1500}
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeStoryParagraph(i)}
                      className="p-2 text-brand-warm-gray hover:text-brand-error"
                    >
                      <HiOutlineX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {tab === 'badges' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-brand-warm-gray">
                Up to 8 badges shown at the bottom of the homepage.
              </p>
              <button
                type="button"
                onClick={addBadge}
                disabled={(content.trustBadges || []).length >= 8}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-brand-cream rounded-lg font-medium hover:bg-brand-blush/30 disabled:opacity-40"
              >
                <HiOutlinePlus size={14} />
                Add badge
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(content.trustBadges || []).map((b, i) => (
                <div
                  key={i}
                  className="bg-brand-cream rounded-xl p-4 relative space-y-3"
                >
                  <button
                    type="button"
                    onClick={() => removeBadge(i)}
                    className="absolute top-2 right-2 p-1 text-brand-warm-gray hover:text-brand-error"
                  >
                    <HiOutlineX size={16} />
                  </button>
                  <Field
                    label="Icon (emoji)"
                    value={b.icon}
                    onChange={(v) => setBadge(i, 'icon', v)}
                    max={8}
                  />
                  <Field
                    label="Title"
                    value={b.title}
                    onChange={(v) => setBadge(i, 'title', v)}
                    max={60}
                    error={errors[`badge-${i}-title`]}
                  />
                  <Field
                    label="Description"
                    value={b.description}
                    onChange={(v) => setBadge(i, 'description', v)}
                    max={200}
                    error={errors[`badge-${i}-description`]}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'about' && (
          <Card>
            <Field
              label="Page Title"
              value={content.aboutTitle}
              onChange={(v) => set('aboutTitle', v)}
              max={120}
            />
            <Field
              label="Lead paragraph"
              value={content.aboutLead}
              onChange={(v) => set('aboutLead', v)}
              max={400}
              multiline
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Body paragraphs</label>
                <button
                  type="button"
                  onClick={addAboutParagraph}
                  disabled={(content.aboutParagraphs || []).length >= 10}
                  className="text-xs text-brand-blush-dark font-medium hover:underline disabled:opacity-40"
                >
                  <HiOutlinePlus className="inline" size={14} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {(content.aboutParagraphs || []).map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={p.text}
                      onChange={(e) => setAboutParagraph(i, e.target.value)}
                      maxLength={1500}
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeAboutParagraph(i)}
                      className="p-2 text-brand-warm-gray hover:text-brand-error"
                    >
                      <HiOutlineX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Field
              label="Founder name (optional)"
              value={content.aboutFounderName}
              onChange={(v) => set('aboutFounderName', v)}
              max={80}
            />
            <Field
              label="Founder quote (optional)"
              value={content.aboutFounderQuote}
              onChange={(v) => set('aboutFounderQuote', v)}
              max={400}
              multiline
            />
          </Card>
        )}

        {tab === 'contact' && (
          <Card>
            <Field
              label="Contact email"
              value={content.contactEmail}
              onChange={(v) => set('contactEmail', v)}
              max={200}
              error={errors.contactEmail}
            />
            <Field
              label="Instagram URL"
              value={content.socialInstagram}
              onChange={(v) => set('socialInstagram', v)}
              max={200}
              error={errors.socialInstagram}
              hint="e.g. https://instagram.com/yourshop"
            />
            <Field
              label="Pinterest URL"
              value={content.socialPinterest}
              onChange={(v) => set('socialPinterest', v)}
              max={200}
              error={errors.socialPinterest}
              hint="e.g. https://pinterest.com/yourshop"
            />
          </Card>
        )}
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: white;
          border: 1px solid var(--color-brand-linen);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-brand-blush-dark);
        }
      `}</style>
    </div>
  );
};

const Card = ({ children }) => (
  <div className="bg-white rounded-2xl border border-brand-linen p-6 space-y-4">
    {children}
  </div>
);

const Field = ({ label, value, onChange, max, error, hint, multiline }) => (
  <div>
    <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
      {label}
    </label>
    {multiline ? (
      <textarea
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
        className="form-input"
      />
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
        className="form-input"
      />
    )}
    <div className="flex justify-between mt-1">
      {error ? (
        <p className="text-xs text-brand-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-brand-warm-gray">{hint}</p>
      ) : (
        <span />
      )}
      {max && (
        <p className="text-xs text-brand-warm-gray">
          {(value || '').length} / {max}
        </p>
      )}
    </div>
  </div>
);

export default AdminSiteContent;
