import { useEffect, useState } from 'react';
import { getDonors, createDonor, updateDonor, deleteDonor } from './api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY_FORM = { fullName: '', age: '', bloodType: '', contactNumber: '', address: '', lastDonationDate: '' };

// FORM CHECK: validates input before it is sent to the server.
function validate(f) {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = 'Full name is required (min 2 characters).';
  const age = Number(f.age);
  if (!Number.isInteger(age) || age < 16 || age > 65) e.age = 'Age must be between 16 and 65.';
  if (!f.bloodType) e.bloodType = 'Please choose a blood type.';
  if (!/^[0-9+\-\s]{7,15}$/.test(f.contactNumber)) e.contactNumber = 'Enter a valid contact number (7-15 digits).';
  if (f.lastDonationDate && new Date(f.lastDonationDate) > new Date()) e.lastDonationDate = 'Date cannot be in the future.';
  return e;
}

// HERO ART: heart + heartbeat line + blood bag (drawn with SVG, no image files needed).
function Hero() {
  return (
    <svg viewBox="0 0 610 150" className="hero-art" role="img" aria-label="Heart connected to a blood bag">
      <defs>
        <clipPath id="heartClip">
          <path d="M50 85 C10 55 0 30 15 15 C28 3 45 8 50 25 C55 8 72 3 85 15 C100 30 90 55 50 85 Z" />
        </clipPath>
      </defs>
      {/* heart with blood level */}
      <g transform="translate(30,25) scale(1.1)">
        <path d="M50 85 C10 55 0 30 15 15 C28 3 45 8 50 25 C55 8 72 3 85 15 C100 30 90 55 50 85 Z"
          fill="rgba(255,255,255,0.12)" />
        <rect x="0" y="42" width="100" height="60" fill="#f2587a" clipPath="url(#heartClip)" />
        <path d="M50 85 C10 55 0 30 15 15 C28 3 45 8 50 25 C55 8 72 3 85 15 C100 30 90 55 50 85 Z"
          fill="none" stroke="#e8e8ea" strokeWidth="5" />
      </g>
      {/* heartbeat line */}
      <polyline fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round"
        points="140,62 215,62 232,30 252,95 270,45 286,62 360,62 360,108 520,108" />
      {/* blood bag */}
      <g transform="translate(520,0)">
        <circle cx="35" cy="14" r="9" fill="none" stroke="#ddd" strokeWidth="4" />
        <rect x="0" y="24" width="70" height="100" rx="12" fill="#f4f4f6" />
        <rect x="5" y="76" width="60" height="44" rx="8" fill="#f2587a" />
        <rect x="14" y="36" width="42" height="34" rx="4" fill="#fff" />
        <text x="35" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8e0000">BLOOD</text>
        <text x="35" y="65" textAnchor="middle" fontSize="16" fontWeight="800" fill="#c01f2d">A+</text>
        <rect x="31" y="124" width="8" height="16" fill="#f2587a" />
      </g>
    </svg>
  );
}

// Small blood-drop badge that shows a blood type.
function Drop({ type, small }) {
  return (
    <span className={small ? 'drop small' : 'drop'}>
      <b>{type}</b>
    </span>
  );
}

export default function App() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);   // loading state
  const [error, setError] = useState('');         // error from failed request
  const [notice, setNotice] = useState('');       // success message
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingId, setEditingId] = useState(null); // null = adding, id = editing
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // READ: load the list once when the page opens.
  useEffect(() => { loadDonors(); }, []);

  async function loadDonors() {
    setLoading(true);
    setError('');
    try {
      setDonors(await getDonors());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // CREATE / UPDATE: runs when the form is submitted.
  async function handleSubmit(e) {
    e.preventDefault();
    setNotice('');
    setError('');
    const errs = validate(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return; // stop if the form is invalid

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateDonor(editingId, form);
        setDonors(donors.map((d) => (d.id === editingId ? updated : d))); // list updates with no refresh
        setNotice('Donor updated.');
      } else {
        const created = await createDonor(form);
        setDonors([created, ...donors]);
        setNotice('Donor added.');
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Fill the form with a donor's data so it can be edited.
  function startEdit(d) {
    setEditingId(d.id);
    setForm({
      fullName: d.fullName,
      age: d.age,
      bloodType: d.bloodType,
      contactNumber: d.contactNumber,
      address: d.address || '',
      lastDonationDate: d.lastDonationDate ? d.lastDonationDate.slice(0, 10) : '',
    });
    setFieldErrors({});
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFieldErrors({});
  }

  // DELETE
  async function handleDelete(d) {
    if (!window.confirm(`Delete ${d.fullName} from the registry?`)) return;
    setError('');
    try {
      await deleteDonor(d.id);
      setDonors(donors.filter((x) => x.id !== d.id));
      if (editingId === d.id) resetForm();
      setNotice('Donor deleted.');
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = donors.filter((d) =>
    `${d.fullName} ${d.bloodType}`.toLowerCase().includes(search.toLowerCase())
  );

  // Count donors per blood type for the summary strip.
  const counts = BLOOD_TYPES.map((t) => ({ type: t, total: donors.filter((d) => d.bloodType === t).length }));

  return (
    <div className="container">
      <header className="hero">
        <Hero />
        <h1>Blood Donor Registry</h1>
        <h2 className="subtitle">Every drop counts</h2>
        <p>Register, find, and manage voluntary blood donors.</p>
      </header>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success">{notice}</div>}

      {/* BLOOD TYPE SUMMARY */}
      <section className="panel">
        <h3 className="panel-title"><span className="mini-drop" />Donors by Blood Type</h3>
        <div className="type-grid">
          {counts.map((c) => (
            <div className="type-chip" key={c.type}>
              <Drop type={c.type} small />
              <span className="count">{c.total}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ADD / EDIT FORM */}
      <section className="panel">
        <h3 className="panel-title"><span className="mini-drop" />{editingId ? 'Edit Donor' : 'Add New Donor'}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid">
            <label>
              Full name *
              <input name="fullName" value={form.fullName} onChange={handleChange} />
              {fieldErrors.fullName && <small>{fieldErrors.fullName}</small>}
            </label>
            <label>
              Age *
              <input name="age" type="number" value={form.age} onChange={handleChange} />
              {fieldErrors.age && <small>{fieldErrors.age}</small>}
            </label>
            <label>
              Blood type *
              <select name="bloodType" value={form.bloodType} onChange={handleChange}>
                <option value="">Select...</option>
                {BLOOD_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {fieldErrors.bloodType && <small>{fieldErrors.bloodType}</small>}
            </label>
            <label>
              Contact number *
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} />
              {fieldErrors.contactNumber && <small>{fieldErrors.contactNumber}</small>}
            </label>
            <label>
              Address
              <input name="address" value={form.address} onChange={handleChange} />
            </label>
            <label>
              Last donation date
              <input name="lastDonationDate" type="date" value={form.lastDonationDate} onChange={handleChange} />
              {fieldErrors.lastDonationDate && <small>{fieldErrors.lastDonationDate}</small>}
            </label>
          </div>
          <div className="actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Donor' : 'Add Donor'}
            </button>
            {editingId && (
              <button type="button" className="btn ghost" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </section>

      {/* DONOR LIST */}
      <section className="panel">
        <div className="list-head">
          <h3 className="panel-title"><span className="mini-drop" />Registered Donors ({donors.length})</h3>
          <input
            className="search"
            placeholder="Search name or blood type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="muted">Loading donors...</p>
        ) : donors.length === 0 ? (
          <p className="muted">No donors registered yet. Add the first one above.</p>
        ) : visible.length === 0 ? (
          <p className="muted">No donors match your search.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Age</th><th>Blood</th><th>Contact</th>
                  <th>Address</th><th>Last Donation</th><th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((d) => (
                  <tr key={d.id}>
                    <td>{d.fullName}</td>
                    <td>{d.age}</td>
                    <td><Drop type={d.bloodType} small /></td>
                    <td>{d.contactNumber}</td>
                    <td>{d.address || '—'}</td>
                    <td>{d.lastDonationDate ? new Date(d.lastDonationDate + 'T00:00:00').toLocaleDateString() : '—'}</td>
                    <td className="row-actions">
                      <button className="btn small" onClick={() => startEdit(d)}>Edit</button>
                      <button className="btn small danger" onClick={() => handleDelete(d)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="footer-strip">Register a donor today. Save a life tomorrow.</footer>
    </div>
  );
}