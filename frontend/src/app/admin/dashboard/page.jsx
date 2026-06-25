'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getProjects, createProject, updateProject, deleteProject,
  getMessages, toggleMessageRead, deleteMessage,
} from '@/lib/api';
import styles from '../admin.module.css';

const EMPTY_PROJECT = {
  title: '', slug: '', shortDesc: '', description: '',
  category: 'Shopify', thumbnail: '', screenshots: '', liveUrl: '',
  githubUrl: '', storefrontPassword: '', techStack: '', featured: false, order: 0,
};

const CATEGORIES = ['Shopify', 'E-commerce', 'Landing Page', 'Web App', 'Other'];

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

  // Modal handlers
  const openAdd = () => { setEditing(null); setFormData(EMPTY_PROJECT); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setFormData({
      ...p,
      techStack: p.techStack.join(', '),
      screenshots: p.screenshots ? p.screenshots.join(', ') : '',
      storefrontPassword: p.storefrontPassword || ''
    });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        techStack: formData.techStack.split(',').map((t) => t.trim()).filter(Boolean),
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
              <span className={styles.tableHeadTitle}>All Projects</span>
              <button className={styles.addBtn} onClick={openAdd}>+ Add Project</button>
            </div>
            <table className={styles.dataTable}>
              <thead>
                <tr className={styles.theadRow}>
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
                    <td className={styles.tdCell} colSpan={5}>No projects yet — add your first one!</td>
                  </tr>
                ) : (
                  projects.map((p, idx) => (
                    <tr key={p._id} className={`${styles.tbodyRow} ${idx === projects.length - 1 ? styles.lastRow : ''}`}>
                      <td className={`${styles.tdCell} ${styles.tdFirst}`}>{p.title}</td>
                      <td className={styles.tdCell}>{p.category}</td>
                      <td className={styles.tdCell}>{p.featured ? <span className={styles.featuredPill}>Featured</span> : '—'}</td>
                      <td className={styles.tdCell}>{p.order}</td>
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
              <div className={styles.modalField}>
                <label>Thumbnail URL</label>
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} className={styles.modalInput} placeholder="https://..." />
              </div>
              <div className={styles.modalField}>
                <label>Screenshots URLs (comma separated)</label>
                <input name="screenshots" value={formData.screenshots} onChange={handleChange} className={styles.modalInput} placeholder="https://image1.com, https://image2.com" />
              </div>
              <div className={styles.modalField}>
                <label>Tech Stack (comma separated)</label>
                <input name="techStack" value={formData.techStack} onChange={handleChange} className={styles.modalInput} placeholder="Shopify, Liquid, SCSS" />
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
              <div className={styles.modalField}>
                <label>Storefront Password (for Dev Stores)</label>
                <input name="storefrontPassword" value={formData.storefrontPassword} onChange={handleChange} className={styles.modalInput} placeholder="Enter password to auto-bypass Shopify storefront lock" />
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
