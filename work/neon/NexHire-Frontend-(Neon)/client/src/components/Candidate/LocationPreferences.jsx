import React from 'react';
import { MapPin, Home, Building2, Globe, Plane, Save, Check, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';
import { useToast } from '../../components/ui/Toast';

const LocationPreferences = () => {
    const { toast } = useToast();
 const [preferences, setPreferences] = React.useState({
 workType: 'hybrid',
 locations: [],
 openToRelocate: false,
 maxCommute: 60,
 locationPriority: 5
 });
 const [loading, setLoading] = React.useState(true);
 const [saving, setSaving] = React.useState(false);
 const [saved, setSaved] = React.useState(false);
 const [newLocation, setNewLocation] = React.useState('');

 // Load preferences on mount
 React.useEffect(() => {
 const fetchPrefs = async () => {
 try {
 const res = await axios.get(`${API_BASE}/candidates/location-preferences`);
 if (res.data && res.data.length > 0) {
 const p = res.data[0];
 // Map database RemotePreference to frontend workType
 // DB: 'Full', 'Hybrid', 'None' -> Frontend: 'remote', 'hybrid', 'onsite'
 let workType = 'hybrid';
 if (p.RemotePreference === 'Full') workType = 'remote';
 else if (p.RemotePreference === 'None') workType = 'onsite';
 else workType = 'hybrid';

 setPreferences({
 workType: workType,
 locations: p.PreferredLocations ? (p.PreferredLocations || "").split(', ').filter(Boolean) : [],
 openToRelocate: p.WillingToRelocate === 1 || p.WillingToRelocate === true,
 maxCommute: p.CommuteTimeMax || 60,
 locationPriority: p.LocationPriority || 5
 });
 }
 } catch (err) {
 console.error("Fetch preferences error:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchPrefs();
 }, []);

 const workTypes = [
 { id: 'remote', label: 'Remote Only', icon: Home, desc: 'Work from anywhere' },
 { id: 'hybrid', label: 'Hybrid', icon: Building2, desc: 'Mix of office & remote' },
 { id: 'onsite', label: 'On-site', icon: MapPin, desc: 'Work from office' }
 ];

 const handleSave = async () => {
 setSaving(true);
 try {
 await axios.post(`${API_BASE}/candidates/location-preferences`, {
 workType: preferences.workType,
 locations: preferences.locations,
 openToRelocate: preferences.openToRelocate,
 maxCommute: preferences.maxCommute,
 locationPriority: preferences.locationPriority || 5
 });
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 } catch (err) {
 console.error("Save error:", err);
 toast("Failed to save preferences");
 } finally {
 setSaving(false);
 }
 };

 const addLocation = () => {
 if (newLocation.trim()) {
 setPreferences(prev => ({
 ...prev,
 locations: [...prev.locations, newLocation.trim()]
 }));
 setNewLocation('');
 }
 };

 const removeLocation = (index) => {
 setPreferences(prev => ({
 ...prev,
 locations: prev.locations.filter((_, i) => i !== index)
 }));
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-20">
 <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
 <span className="ml-3 text-sm font-medium text-[var(--text-muted)]">Loading Location Preferences...</span>
 </div>
 );
 }

 return (
 <div className="space-y-6 sm:space-y-10">
 {/* Header */}
 <div className="flex items-center gap-3 mb-6">
 <MapPin className="w-5 h-5 text-[var(--accent)]" />
 <h2 className="text-lg font-medium">Location Preferences</h2>
 </div>

 {/* Work Type Selection */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <h3 className="text-lg font-medium mb-8">Work Type Preference</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 {workTypes.map((type) => (
 <button
 key={type.id}
 onClick={() => setPreferences(prev => ({ ...prev, workType: type.id }))}
 className={`p-6 rounded-[var(--radius-xl)] border-2 transition-all text-left ${preferences.workType === type.id
 ? 'border-cyan-500 bg-[var(--accent)]/10'
 : 'border-[var(--border-primary)] bg-[var(--bg-accent)] hover:border-cyan-500/50'
 }`}
 >
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${preferences.workType === type.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
 }`}>
 <type.icon size={24} />
 </div>
 <div className="text-sm font-medium mb-1">{type.label}</div>
 <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase">{type.desc}</div>
 {preferences.workType === type.id && (
 <div className="mt-4 flex items-center gap-2 text-[var(--accent)] text-[11px] font-medium">
 <Check size={14} /> Selected
 </div>
 )}
 </button>
 ))}
 </div>
 </div>

 {/* Preferred Locations */}
 <div className="glass-card rounded-[var(--radius-xl)] p-10">
 <h3 className="text-lg font-medium mb-8">Preferred Locations</h3>
 <div className="flex gap-4 mb-6">
 <input
 type="text"
 value={newLocation}
 onChange={(e) => setNewLocation(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && addLocation()}
 placeholder="Add a city or region..."
 className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-cyan-500"
 />
 <button
 onClick={addLocation}
 className="px-8 py-4 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl text-[11px] font-medium hover:border-cyan-500 transition-all"
 >
 Add
 </button>
 </div>
 <div className="flex flex-wrap gap-3">
 {preferences.locations.length === 0 ? (
 <div className="text-[11px] font-bold text-[var(--text-muted)] py-4">
 No locations added yet
 </div>
 ) : (
 preferences.locations.map((loc, i) => (
 <span key={i} className="px-4 py-2 bg-[var(--accent)]/10 border border-cyan-500/30 rounded-full text-xs font-semibold flex items-center gap-2">
 <MapPin size={12} className="text-[var(--accent)]" />
 {loc}
 <button onClick={() => removeLocation(i)} className="ml-2 text-[var(--accent)] hover:text-white">×</button>
 </span>
 ))
 )}
 </div>
 </div>

 {/* Relocation & Commute */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center gap-4 mb-6">
 <Plane size={20} className="text-[var(--success)]" />
 <h4 className="text-sm font-medium">Open to Relocation</h4>
 </div>
 <button
 onClick={() => setPreferences(prev => ({ ...prev, openToRelocate: !prev.openToRelocate }))}
 className={`w-16 h-8 rounded-full transition-all relative ${preferences.openToRelocate ? 'bg-[var(--success)]' : 'bg-[var(--bg-accent)] border border-[var(--border-primary)]'
 }`}
 >
 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${preferences.openToRelocate ? 'left-9' : 'left-1'
 }`}></div>
 </button>
 </div>

 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center gap-4 mb-6">
 <Globe size={20} className="text-[var(--warning)]" />
 <h4 className="text-sm font-medium">Max Commute (minutes)</h4>
 </div>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min="15"
 max="120"
 step="15"
 value={preferences.maxCommute}
 onChange={(e) => setPreferences(prev => ({ ...prev, maxCommute: parseInt(e.target.value) }))}
 className="flex-1 accent-amber-500"
 />
 <span className="text-lg font-semibold w-16 text-center">{preferences.maxCommute}</span>
 </div>
 </div>
 </div>

 {/* Save Button */}
 <div className="flex justify-end">
 <button
 onClick={handleSave}
 disabled={saving || loading}
 className="px-10 py-5 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs flex items-center gap-3 hover:shadow-[var(--shadow-md)] hover: transition-all disabled:opacity-50"
 >
 {loading ? (
 <>Loading...</>
 ) : saving ? (
 <>Saving...</>
 ) : saved ? (
 <><Check size={18} /> Saved!</>
 ) : (
 <><Save size={18} /> Save Preferences</>
 )}
 </button>
 </div>
 </div>
 );
};

export default LocationPreferences;
