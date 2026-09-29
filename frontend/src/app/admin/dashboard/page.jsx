'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getProjects, createProject, updateProject, deleteProject, reorderProjects,
  getMessages, toggleMessageRead, deleteMessage, uploadImage,
} from '@/lib/api';
import styles from '../admin.module.css';

const EMPTY_PROJECT = {
  title: '', slug: '', shortDesc: '', description: '',
  category: 'Fashion & Apparel Store', thumbnail: '', screenshots: '', liveUrl: '',
  githubUrl: '', storefrontPassword: '', themeUrl: '', techStack: '', featured: false, order: 0,
  pages: [],
};

const CATEGORIES = [
  'Fashion & Apparel Store',
  'Beauty & Personal Care Store',
  'Jewelry & Watches Store',
  'Home & Living Store',
  'Electronics & Gadgets Store',
  'Health & Wellness Store',
  'Food & Beverage Store',
  'Pet Supplies Store',
  'Baby & Kids Store',
  'Sports & Outdoor Store',
  'Automotive Store',
  'Books, Arts & Crafts Store',
  'Digital Products Store',
  'Print-on-Demand & Personalized Products Store',
  'Dropshipping Store',
  'Wholesale / B2B Store',
  'Subscription & Membership Store',
  'Marketplace / Multi-Vendor Store',
  'Service, Booking & Rental Website',
  'Luxury / Premium Brand Store',
  'Single Product Store',
  'General Multi-Category eCommerce Store'
];

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [tab, setTab] = useState('projects'); // projects | messages
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, obj = edit
  const [formData, setFormData] = useState(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [orderToast, setOrderToast] = useState('');

  // Upload states & refs
  const [thumbUploading, setThumbUploading] = useState(false);
  const [screenshotsUploading, setScreenshotsUploading] = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const thumbInputRef = useRef(null);
  const shotsInputRef = useRef(null);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('portfolio_token');
    const adminData = localStorage.getItem('portfolio_admin');
    if (!token) { router.replace('/admin'); return; }
    if (adminData) setAdmin(JSON.parse(adminData));
  }, [router]);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await getProjects();
      setProjects(data.projects);
      console.log(`📦 Loaded ${data.projects.length} projects`);
    } catch (err) { console.error('❌ Fetch projects:', err.message); }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await getMessages();
      setMessages(data.messages);
      setUnread(data.unreadCount);
      console.log(`📬 Loaded ${data.messages.length} messages (${data.unreadCount} unread)`);
    } catch (err) { console.error('❌ Fetch messages:', err.message); }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchMessages()]);
      setLoading(false);
    };
    load();
  }, [fetchProjects, fetchMessages]);

  const logout = () => {
    localStorage.removeItem('portfolio_token');
    localStorage.removeItem('portfolio_admin');
    router.push('/admin');
  };

  // Global Paste Listener (Ctrl+V) when modal is open
  useEffect(() => {
    if (!modal) return;

    const handleGlobalPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadThumbnailFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [modal]);

  // Upload thumbnail to ImgBB
  const uploadThumbnailFile = async (file) => {
    if (!file) return;
    setThumbUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setFormData((prev) => ({ ...prev, thumbnail: url }));
        console.log('✅ Thumbnail uploaded to ImgBB:', url);
      }
    } catch (err) {
      console.error('❌ Thumbnail upload failed:', err);
      alert('Failed to upload thumbnail to ImgBB: ' + (err.response?.data?.message || err.message));
    } finally {
      setThumbUploading(false);
    }
  };

  // Upload screenshots to ImgBB
  const uploadScreenshotsFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setScreenshotsUploading(true);
    try {
      const files = Array.from(fileList);
      const urls = [];
      for (const file of files) {
        const url = await uploadImage(file);
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        setFormData((prev) => {
          const existing = prev.screenshots
            ? prev.screenshots.split(',').map((s) => s.trim()).filter(Boolean)
            : [];
          return { ...prev, screenshots: [...existing, ...urls].join(', ') };
        });
        console.log('✅ Screenshots uploaded to ImgBB:', urls);
      }
    } catch (err) {
      console.error('❌ Screenshots upload failed:', err);
      alert('Failed to upload screenshot to ImgBB: ' + (err.response?.data?.message || err.message));
    } finally {
      setScreenshotsUploading(false);
    }
  };

  // Remove single screenshot
  const removeScreenshot = (indexToRemove) => {
    setFormData((prev) => {
      const existing = prev.screenshots
        ? prev.screenshots.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const filtered = existing.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, screenshots: filtered.join(', ') };
    });
  };

  // Drag & Drop reordering handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedProjects = [...projects];
    const [draggedItem] = updatedProjects.splice(draggedIndex, 1);
    updatedProjects.splice(targetIndex, 0, draggedItem);

    // Recalculate 1-based sequential order
    const reordered = updatedProjects.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setProjects(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      setOrderToast('Saving order...');
      const ordersPayload = reordered.map((item) => ({
        id: item._id,
        order: item.order,
      }));
      await reorderProjects(ordersPayload);
      setOrderToast('✓ Order updated');
      setTimeout(() => setOrderToast(''), 2500);
    } catch (err) {
      console.error('❌ Failed to save reordered projects:', err);
      setOrderToast('❌ Failed to save order');
      setTimeout(() => setOrderToast(''), 3000);
      await fetchProjects();
    }
  };

  // Modal handlers
  const openAdd = () => { setEditing(null); setFormData(EMPTY_PROJECT); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setFormData({
      ...p,
      techStack: p.techStack.join(', '),
      screenshots: p.screenshots ? p.screenshots.join(', ') : '',
      storefrontPassword: p.storefrontPassword || '',
      themeUrl: p.themeUrl || '',
      pages: p.pages || []
    });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTagToggle = (tagVal) => {
    const currentTags = formData.techStack
      ? formData.techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const updatedTags = currentTags.includes(tagVal)
      ? currentTags.filter((t) => t !== tagVal)
      : [...currentTags, tagVal];
    setFormData((prev) => ({ ...prev, techStack: updatedTags.join(', ') }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const allowedTags = ['Client Work', 'Shopify Theme'];
      const payload = {
        ...formData,
        techStack: (formData.techStack || '')
          .split(',')
          .map((t) => t.trim())
          .filter((t) => allowedTags.includes(t)),
        screenshots: formData.screenshots ? formData.screenshots.split(',').map((s) => s.trim()).filter(Boolean) : [],
        order: Number(formData.order),
      };
      if (editing) {
        await updateProject(editing._id, payload);
        console.log('✅ Project updated:', payload.title);
      } else {
        await createProject(payload);
        console.log('✅ Project created:', payload.title);
      }
      await fetchProjects();
      closeModal();
    } catch (err) {
      console.error('❌ Save project:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteProject(id);
      console.log('✅ Project deleted:', title);
      await fetchProjects();
    } catch (err) { console.error('❌ Delete project:', err.message); }
  };

  const handleToggleRead = async (id) => {
    try {
      await toggleMessageRead(id);
      await fetchMessages();
    } catch (err) { console.error('❌ Toggle read:', err.message); }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      console.log('✅ Message deleted');
      await fetchMessages();
    } catch (err) { console.error('❌ Delete message:', err.message); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <p className={styles.sidebarLogo}>&lt;<span>Admin</span> /&gt;</p>
        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${tab === 'projects' ? styles.navItemActive : ''}`}
            onClick={() => setTab('projects')}
          >
            📁 Projects
          </button>
          <button
            className={`${styles.navItem} ${tab === 'messages' ? styles.navItemActive : ''}`}
            onClick={() => setTab('messages')}
          >
            📬 Messages {unread > 0 && <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '100px', padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700 }}>{unread}</span>}
          </button>
          <Link href="/" className={styles.navItem} style={{ marginTop: 'auto', textDecoration: 'none' }}>
            🌐 View Site
          </Link>
        </nav>
        <button className={styles.logoutBtn} onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main */}
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>
            {tab === 'projects' ? 'Projects' : 'Messages'}
          </h1>
          {admin && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              👤 {admin.username}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statCardVal}>{projects.length}</div>
            <div className={styles.statCardLabel}>Total Projects</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardVal}>{messages.length}</div>
            <div className={styles.statCardLabel}>Total Messages</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardVal}>{unread}</div>
            <div className={styles.statCardLabel}>Unread Messages</div>
          </div>
        </div>

        {/* Projects Tab */}
        {tab === 'projects' && (
          <div className={styles.tableWrap}>
            <div className={styles.tableHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={styles.tableHeadTitle}>All Projects</span>
                <span className={styles.dragTip}>⠿ Drag & drop rows to reorder</span>
                {orderToast && <span className={styles.orderToast}>{orderToast}</span>}
              </div>
              <button className={styles.addBtn} onClick={openAdd}>+ Add Project</button>
            </div>
            <table className={styles.dataTable}>
              <thead>
                <tr className={styles.theadRow}>
                  <th className={styles.dragTh} title="Drag handle"></th>
                  <th className={styles.theadTh}>Title</th>
                  <th className={styles.theadTh}>Category</th>
                  <th className={styles.theadTh}>Featured</th>
                  <th className={styles.theadTh}>Order</th>
                  <th className={styles.theadTh}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr className={`${styles.tbodyRow} ${styles.emptyRow}`}>
                    <td className={styles.tdCell} colSpan={6}>No projects yet — add your first one!</td>
                  </tr>
                ) : (
                  projects.map((p, idx) => (
                    <tr
                      key={p._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`${styles.tbodyRow} ${idx === projects.length - 1 ? styles.lastRow : ''} ${
                        draggedIndex === idx ? styles.draggingRow : ''
                      } ${dragOverIndex === idx && draggedIndex !== idx ? styles.dragOverRow : ''}`}
                    >
                      <td className={styles.dragTd}>
                        <span className={styles.dragHandle} title="Drag to reorder">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="5" cy="3" r="1.5" />
                            <circle cx="11" cy="3" r="1.5" />
                            <circle cx="5" cy="8" r="1.5" />
                            <circle cx="11" cy="8" r="1.5" />
                            <circle cx="5" cy="13" r="1.5" />
                            <circle cx="11" cy="13" r="1.5" />
                          </svg>
                        </span>
                      </td>
                      <td className={`${styles.tdCell} ${styles.tdFirst}`}>{p.title}</td>
                      <td className={styles.tdCell}>{p.category}</td>
                      <td className={styles.tdCell}>{p.featured ? <span className={styles.featuredPill}>Featured</span> : '—'}</td>
                      <td className={styles.tdCell}>
                        <span className={styles.orderBadge}>{p.order}</span>
                      </td>
                      <td className={styles.tdCell}>
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn} onClick={() => openEdit(p)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(p._id, p.title)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Messages Tab */}
        {tab === 'messages' && (
          <div className={styles.messageList}>
            {messages.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem' }}>No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m._id} className={`${styles.messageCard} ${!m.read ? styles.messageCardUnread : ''}`}>
                  <div className={styles.messageMeta}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!m.read && <span className={styles.unreadDot} />}
                      <span className={styles.messageSender}>{m.name}</span>
                      <span className={styles.messageEmail}>{m.email}</span>
                    </div>
                    <span className={styles.messageDate}>
                      {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className={styles.messageSubject}>📌 {m.subject}</p>
                  <p className={styles.messageText}>{m.message}</p>
                  <div className={styles.messageActions}>
                    <button className={styles.readBtn} onClick={() => handleToggleRead(m._id)}>
                      {m.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteMessage(m._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editing ? 'Edit Project' : 'Add New Project'}</h2>
            <form className={styles.modalForm} onSubmit={handleSave}>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label>Title *</label>
                  <input name="title" value={formData.title} onChange={handleChange} required className={styles.modalInput} placeholder="LuxeWear Store" />
                </div>
                <div className={styles.modalField}>
                  <label>Slug *</label>
                  <input name="slug" value={formData.slug} onChange={handleChange} required className={styles.modalInput} placeholder="luxewear-store" />
                </div>
              </div>
              <div className={styles.modalField}>
                <label>Short Description *</label>
                <input name="shortDesc" value={formData.shortDesc} onChange={handleChange} required className={styles.modalInput} placeholder="Max 160 chars" maxLength={160} />
              </div>
              <div className={styles.modalField}>
                <label>Full Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={styles.modalTextarea} placeholder="Detailed project description..." />
              </div>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className={styles.modalSelect}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label>Order</label>
                  <input name="order" type="number" value={formData.order} onChange={handleChange} className={styles.modalInput} />
                </div>
              </div>
              {/* Thumbnail Upload + Input (ImgBB + Ctrl+V) */}
              <div className={styles.modalField}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Thumbnail Image *</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Paste (<kbd className={styles.uploadKbd}>Ctrl+V</kbd>), Drop, or Enter URL
                  </span>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={thumbInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      uploadThumbnailFile(e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />

                {/* Active preview if thumbnail exists */}
                {formData.thumbnail && !thumbUploading ? (
                  <div className={styles.uploadPreviewWrap}>
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail preview"
                      className={styles.uploadPreviewImg}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className={styles.uploadPreviewInfo}>
                      <span className={styles.uploadPreviewBadge}>✓ Current Thumbnail</span>
                      <span className={styles.uploadPreviewUrl} title={formData.thumbnail}>
                        {formData.thumbnail}
                      </span>
                    </div>
                    <div className={styles.uploadActionBtns}>
                      <button
                        type="button"
                        className={styles.uploadReplaceBtn}
                        onClick={() => thumbInputRef.current?.click()}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        className={styles.uploadRemoveBtn}
                        onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ) : thumbUploading ? (
                  <div className={`${styles.uploadDropzone} ${styles.uploadLoadingWrap}`}>
                    <div className={styles.spinner} />
                    <span>Uploading thumbnail to ImgBB...</span>
                  </div>
                ) : (
                  <div
                    className={`${styles.uploadDropzone} ${thumbDragOver ? styles.uploadDropzoneActive : ''}`}
                    onClick={() => thumbInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setThumbDragOver(true); }}
                    onDragLeave={() => setThumbDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setThumbDragOver(false);
                      if (e.dataTransfer.files?.[0]) {
                        uploadThumbnailFile(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <div className={styles.uploadTitle}>
                      <span>Click to browse image</span> or drag & drop here
                    </div>
                    <div className={styles.uploadSub}>
                      Or copy screenshot & press <kbd className={styles.uploadKbd}>Ctrl + V</kbd> to paste
                    </div>
                  </div>
                )}

                {/* Direct/Manual URL input */}
                <input
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className={styles.modalInput}
                  placeholder="https://i.ibb.co/... (or auto-filled via upload above)"
                />
              </div>

              {/* Screenshots Upload + Input */}
              <div className={styles.modalField}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Screenshots (Optional)</label>
                  <button
                    type="button"
                    className={styles.uploadReplaceBtn}
                    onClick={() => shotsInputRef.current?.click()}
                    disabled={screenshotsUploading}
                  >
                    {screenshotsUploading ? 'Uploading...' : '+ Upload Screenshot(s)'}
                  </button>
                </div>

                <input
                  type="file"
                  ref={shotsInputRef}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      uploadScreenshotsFiles(e.target.files);
                      e.target.value = '';
                    }
                  }}
                />

                {/* Preview list of screenshots */}
                {formData.screenshots && (
                  <div className={styles.screenshotsPreviewList}>
                    {formData.screenshots
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((url, idx) => (
                        <div key={idx} className={styles.screenshotThumbCard} title={url}>
                          <img src={url} alt={`Screenshot ${idx + 1}`} onError={(e) => { e.target.style.display = 'none'; }} />
                          <button
                            type="button"
                            className={styles.screenshotRemoveBtn}
                            onClick={() => removeScreenshot(idx)}
                            title="Remove screenshot"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {screenshotsUploading && (
                  <div className={styles.uploadLoadingWrap} style={{ padding: '0.6rem 0' }}>
                    <div className={styles.spinner} />
                    <span>Uploading screenshot(s) to ImgBB...</span>
                  </div>
                )}

                <input
                  name="screenshots"
                  value={formData.screenshots}
                  onChange={handleChange}
                  className={styles.modalInput}
                  placeholder="https://image1.com, https://image2.com (comma separated or upload above)"
                />
              </div>
              <div className={styles.modalField}>
                <label>Tag</label>
                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#a0aec0' }}>
                    <input
                      type="checkbox"
                      checked={formData.techStack ? formData.techStack.split(',').map(t => t.trim()).includes('Client Work') : false}
                      onChange={() => handleTagToggle('Client Work')}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                    />
                    Client Work
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#a0aec0' }}>
                    <input
                      type="checkbox"
                      checked={formData.techStack ? formData.techStack.split(',').map(t => t.trim()).includes('Shopify Theme') : false}
                      onChange={() => handleTagToggle('Shopify Theme')}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                    />
                    Shopify Theme
                  </label>
                </div>
              </div>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label>Live URL</label>
                  <input name="liveUrl" value={formData.liveUrl} onChange={handleChange} className={styles.modalInput} placeholder="https://..." />
                </div>
                <div className={styles.modalField}>
                  <label>GitHub URL</label>
                  <input name="githubUrl" value={formData.githubUrl} onChange={handleChange} className={styles.modalInput} placeholder="https://github.com/..." />
                </div>
              </div>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label>Storefront Password (for Dev Stores)</label>
                  <input name="storefrontPassword" value={formData.storefrontPassword} onChange={handleChange} className={styles.modalInput} placeholder="Enter password to auto-bypass Shopify storefront lock" />
                </div>
                <div className={styles.modalField}>
                  <label>Theme URL</label>
                  <input name="themeUrl" value={formData.themeUrl} onChange={handleChange} className={styles.modalInput} placeholder="https://..." />
                </div>
              </div>


              <label className={styles.modalCheckLabel}>
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                Mark as Featured
              </label>
              <div className={styles.modalBtns}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Add Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
