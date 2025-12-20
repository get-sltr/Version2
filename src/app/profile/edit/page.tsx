'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useTheme } from '../../../contexts/ThemeContext';
import { uploadAvatar } from '../../../lib/api/profileMedia';

type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [showAge, setShowAge] = useState(true);
  const [showPosition, setShowPosition] = useState(true);
  const [showTribes, setShowTribes] = useState(true);
  const [ageValue, setAgeValue] = useState<number | null>(null);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [bodyTypeValue, setBodyTypeValue] = useState('');
  const [positionValue, setPositionValue] = useState('');
  const [ethnicityValue, setEthnicityValue] = useState('');
  const [relationshipValue, setRelationshipValue] = useState('');
  const [hivStatusValue, setHivStatusValue] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [selectedTribes, setSelectedTribes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>(['', '', '', '']);
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [showTribesDropdown, setShowTribesDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: colors.background === '#fff' ? '#000' : '#fff',
    fontSize: '16px',
    padding: '15px 0',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };
  const isDarkMode = colors.background === '#000' || colors.background === '#000000';
  const statInputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '8px',
    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
    background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f8f8f8',
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: '15px',
    padding: '12px 14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  };
  const statSelectStyle: React.CSSProperties = {
    ...statInputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDarkMode ? '%23FFFFFF' : '%23000000'}' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '36px',
    cursor: 'pointer'
  };

  const tribes = [
    { id: 'bear', label: 'Bear' },
    { id: 'twink', label: 'Twink' },
    { id: 'jock', label: 'Jock' },
    { id: 'otter', label: 'Otter' },
    { id: 'daddy', label: 'Daddy' },
    { id: 'leather', label: 'Leather' },
    { id: 'poz', label: 'Poz' },
    { id: 'discreet', label: 'Discreet' },
    { id: 'clean-cut', label: 'Clean-Cut' },
    { id: 'geek', label: 'Geek' },
    { id: 'military', label: 'Military' },
    { id: 'rugged', label: 'Rugged' },
    { id: 'pup', label: 'Pup' },
    { id: 'trans', label: 'Trans' },
    { id: 'queer', label: 'Queer' }
  ];
  const bodyTypeOptions = ['Slim', 'Average', 'Athletic', 'Toned', 'Muscular', 'Stocky', 'Plus Size', 'Bear', 'Otter'];
  const positionOptions = ['Top', 'Mostly Top', 'Vers Top', 'Vers', 'Vers Bottom', 'Mostly Bottom', 'Bottom', 'Side', 'Ask'];
  const ethnicityOptions = ['Black', 'Latino', 'White', 'Middle Eastern', 'Asian', 'Pacific Islander', 'Native American', 'Mixed', 'Other'];
  const relationshipOptions = ['Single', 'Seeing Someone', 'Open Relationship', 'Monogamous Relationship', 'Married', 'Partnered', "It's Complicated"];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          setLoading(false);
          return;
        }

        if (profile) {
          if (profile.photo_url) setProfilePhoto(profile.photo_url);
          if (profile.display_name) setDisplayName(profile.display_name);
          if (profile.about) setAboutMe(profile.about);
          if (profile.tribes) setSelectedTribes(profile.tribes);
          if (profile.tags) setSelectedTags(profile.tags);
          if (typeof profile.age === 'number') setAgeValue(profile.age);
          if (profile.height) {
            const ftMatch = profile.height.match(/(\d+)'\s*(\d+)"/);
            if (ftMatch) {
              setHeightFeet(ftMatch[1]);
              setHeightInches(ftMatch[2]);
            } else {
              const ftOnlyMatch = profile.height.match(/(\d+)\s*ft/i);
              setHeightFeet(ftOnlyMatch ? ftOnlyMatch[1] : '');
              setHeightInches('');
            }
          } else {
            setHeightFeet('');
            setHeightInches('');
          }
          if (profile.weight) {
            const numeric = profile.weight.match(/(\d+(?:\.\d+)?)/);
            setWeightValue(numeric ? numeric[1] : profile.weight);
          } else {
            setWeightValue('');
          }
          setBodyTypeValue(profile.body_type || '');
          setPositionValue(profile.position || '');
          setEthnicityValue(profile.ethnicity || '');
          setRelationshipValue(profile.relationship_status || '');
          setHivStatusValue(profile.hiv_status || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Reload data when page regains focus (e.g., navigating back from tags/tribes)
    const handleFocus = () => {
      loadProfile();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to save changes');
        return;
      }

      if (!displayName.trim()) {
        alert('Please enter a display name');
        return;
      }

      if (ageValue !== null && (ageValue < 18 || ageValue > 99)) {
        alert('Age must be between 18 and 99.');
        return;
      }

      if (heightFeet && Number(heightFeet) > 7) {
        alert('Height cannot exceed 7 ft.');
        return;
      }

      if (heightInches && Number(heightInches) > 11) {
        alert('Inches must be between 0 and 11.');
        return;
      }

      if (weightValue && Number(weightValue) > 400) {
        alert('Weight cannot exceed 400 lbs.');
        return;
      }

      const formattedHeight = heightFeet
        ? `${heightFeet}'${heightInches || '0'}"`
        : null;
      const formattedWeight = weightValue ? `${Number(weightValue)} lbs` : null;

      // Save to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          about: aboutMe.trim() || null,
          photo_url: profilePhoto || null,
          tribes: selectedTribes,
          tags: selectedTags,
          age: ageValue,
          height: formattedHeight,
          weight: formattedWeight,
          body_type: bodyTypeValue || null,
          position: positionValue || null,
          ethnicity: ethnicityValue || null,
          relationship_status: relationshipValue || null
        })
        .eq('id', user.id);

      if (error) {
        console.error('Save error:', error);
        alert('Failed to save profile changes: ' + error.message);
        return;
      }

      // Clear save button state
      setShowSaveButton(false);
      
      // Redirect after a short delay to ensure save is processed
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save profile changes');
    }
  };

  const markAsChanged = () => {
    setShowSaveButton(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const url = await uploadAvatar(file);
      setProfilePhoto(url);
      markAsChanged();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingIndex(index);

    try {
      // Upload additional photo to profile-media bucket
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/photo-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase
        .storage
        .from('profile-media')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('profile-media')
        .getPublicUrl(path);

      // Update additional photos state
      const newPhotos = [...additionalPhotos];
      newPhotos[index] = publicUrl;
      setAdditionalPhotos(newPhotos);
      markAsChanged();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload photo');
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif", paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, background: colors.background, zIndex: 100 }}>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{ color: '#FF6B35', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Edit Profile</span>
        <button 
          onClick={handleSave}
          style={{ color: showSaveButton ? '#FF6B35' : '#666', background: 'none', border: 'none', fontSize: '16px', fontWeight: 600, cursor: showSaveButton ? 'pointer' : 'default' }}
          disabled={!showSaveButton}
        >
          Save
        </button>
      </header>

      {/* Photo Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'repeat(2, 1fr)', gap: '2px', aspectRatio: '3/2' }}>
        <label style={{ gridRow: 'span 2', background: '#1c1c1e', backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {!profilePhoto && !uploading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
              📷
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '4px 8px', fontSize: '12px' }}>
            {uploading ? 'Uploading...' : 'Profile Photo'}
          </div>
          {!uploading && profilePhoto && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              ✏️
            </div>
          )}
        </label>
        {[0, 1, 2, 3].map((index) => (
          <label key={index} style={{ background: '#1c1c1e', backgroundImage: additionalPhotos[index] ? `url(${additionalPhotos[index]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', border: 'none', cursor: uploadingIndex === index ? 'not-allowed' : 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleAdditionalPhotoUpload(e, index)}
              disabled={uploadingIndex === index}
              style={{ display: 'none' }}
            />
            {!additionalPhotos[index] && uploadingIndex !== index && (
              <div style={{ fontSize: '24px', color: '#666' }}>+</div>
            )}
            {uploadingIndex === index && (
              <div style={{ fontSize: '12px', color: '#FF6B35' }}>Uploading...</div>
            )}
          </label>
        ))}
      </div>

      {/* Albums Section */}
      <Section>
        <div style={{ padding: '20px 0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Photo Albums</span>
            <span style={{ fontSize: '12px', color: '#666' }}>0 albums</span>
          </div>
          <a 
            href="/profile/edit/albums/create"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255,107,53,0.1)',
              border: '1px dashed #FF6B35',
              borderRadius: '12px',
              padding: '16px',
              textDecoration: 'none',
              color: '#FF6B35',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '24px' }}>📁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>Create Album</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Organize photos into public or private albums</div>
            </div>
            <span style={{ fontSize: '18px' }}>+</span>
          </a>
        </div>
      </Section>

      {/* Display Name */}
      <Section>
        <SectionHeader label="Display Name" count={`${displayName.length}/15`} colors={colors} />
        <input 
          type="text" 
          placeholder="Your display name" 
          value={displayName}
          maxLength={15}
          onChange={(e) => {
            setDisplayName(e.target.value);
            markAsChanged();
          }}
          style={inputStyle} 
        />
      </Section>

      {/* About Me */}
      <Section>
        <SectionHeader label="About Me" count={`${aboutMe.length}/255`} colors={colors} />
        <textarea 
          placeholder="Tell others about yourself..." 
          value={aboutMe}
          maxLength={255}
          onChange={(e) => {
            setAboutMe(e.target.value);
            markAsChanged();
          }}
          style={{ ...inputStyle, minHeight: '100px', resize: 'none' }} 
        />
      </Section>

      {/* My Tags */}
      <Section>
        <a href="/profile/edit/tags" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="My Tags" value="Add tags" hasArrow colors={colors} />
        </a>
      </Section>

      {/* STATS */}
      <SectionTitle icon="🏷️" title="STATS" colors={colors} />
      <Section card>
        <ToggleRow label="Show Age" value={showAge} onChange={(v) => { setShowAge(v); markAsChanged(); }} colors={colors} />
        <StatField label="Age" colors={colors}>
          <input
            type="number"
            min={18}
            max={99}
            value={ageValue ?? ''}
            onChange={(e) => {
              const nextValue = e.target.value ? Number(e.target.value) : null;
              setAgeValue(nextValue);
              markAsChanged();
            }}
            placeholder="Enter your age"
            style={statInputStyle}
          />
        </StatField>

        <StatField label="Height" colors={colors}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min={3}
                max={7}
                value={heightFeet}
                onChange={(e) => {
                  setHeightFeet(e.target.value);
                  markAsChanged();
                }}
                placeholder="Feet"
                style={{ ...statInputStyle, paddingRight: '40px' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary, fontSize: '14px' }}>ft</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min={0}
                max={11}
                value={heightInches}
                onChange={(e) => {
                  setHeightInches(e.target.value);
                  markAsChanged();
                }}
                placeholder="Inches"
                style={{ ...statInputStyle, paddingRight: '40px' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary, fontSize: '14px' }}>in</span>
            </div>
          </div>
        </StatField>

        <StatField label="Weight" colors={colors}>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              min={0}
              max={400}
              value={weightValue}
              onChange={(e) => {
                setWeightValue(e.target.value);
                markAsChanged();
              }}
              placeholder="Weight"
              style={{ ...statInputStyle, paddingRight: '70px' }}
            />
            <span
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '6px 12px',
                borderRadius: '20px',
                background: colors.accent,
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              lbs
            </span>
          </div>
        </StatField>

        <StatField label="Body Type" colors={colors}>
          <select
            value={bodyTypeValue}
            onChange={(e) => {
              setBodyTypeValue(e.target.value);
              markAsChanged();
            }}
            style={statSelectStyle}
          >
            <option value="">Select body type</option>
            {bodyTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </StatField>

        <ToggleRow label="Show Position" value={showPosition} onChange={(v) => { setShowPosition(v); markAsChanged(); }} colors={colors} />

        <StatField label="Position" colors={colors}>
          <select
            value={positionValue}
            onChange={(e) => {
              setPositionValue(e.target.value);
              markAsChanged();
            }}
            style={statSelectStyle}
          >
            <option value="">Select position</option>
            {positionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </StatField>

        <StatField label="Ethnicity" colors={colors}>
          <select
            value={ethnicityValue}
            onChange={(e) => {
              setEthnicityValue(e.target.value);
              markAsChanged();
            }}
            style={statSelectStyle}
          >
            <option value="">Select ethnicity</option>
            {ethnicityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </StatField>

        <StatField label="Relationship Status" colors={colors}>
          <select
            value={relationshipValue}
            onChange={(e) => {
              setRelationshipValue(e.target.value);
              markAsChanged();
            }}
            style={statSelectStyle}
          >
            <option value="">Select status</option>
            {relationshipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </StatField>

        <ToggleRow label="Show Tribes" value={showTribes} onChange={(v) => { setShowTribes(v); markAsChanged(); }} colors={colors} />

        {/* Tribes - Inline Selection */}
        <div style={{ padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
          <div
            onClick={() => setShowTribesDropdown(!showTribesDropdown)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '16px' }}>My Tribes</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                {selectedTribes.length === 0 ? 'None selected' : `${selectedTribes.length} selected`}
              </span>
              <span style={{ color: colors.textSecondary, fontSize: '18px', transform: showTribesDropdown ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>›</span>
            </div>
          </div>

          {/* Selected tribes display */}
          {selectedTribes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {tribes.filter(t => selectedTribes.includes(t.id)).map(tribe => (
                <span
                  key={tribe.id}
                  onClick={() => {
                    setSelectedTribes(selectedTribes.filter(id => id !== tribe.id));
                    markAsChanged();
                  }}
                  style={{
                    background: 'rgba(255,107,53,0.2)',
                    color: '#FF6B35',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tribe.label} <span style={{ fontSize: '10px' }}>✕</span>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown */}
          {showTribesDropdown && (
            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {tribes.map(tribe => (
                <button
                  key={tribe.id}
                  type="button"
                  onClick={() => {
                    if (selectedTribes.includes(tribe.id)) {
                      setSelectedTribes(selectedTribes.filter(id => id !== tribe.id));
                    } else {
                      setSelectedTribes([...selectedTribes, tribe.id]);
                    }
                    markAsChanged();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: selectedTribes.includes(tribe.id) ? '2px solid #FF6B35' : `1px solid ${colors.border}`,
                    background: selectedTribes.includes(tribe.id) ? 'rgba(255,107,53,0.15)' : colors.surface,
                    color: selectedTribes.includes(tribe.id) ? '#FF6B35' : colors.text,
                    fontSize: '14px',
                    fontWeight: selectedTribes.includes(tribe.id) ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {selectedTribes.includes(tribe.id) && '✓ '}{tribe.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <a href="/profile/edit/tags" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="My Tags" value={selectedTags.length > 0 ? `${selectedTags.length} selected` : 'None selected'} hasArrow colors={colors} />
        </a>
      </Section>

      {/* EXPECTATIONS */}
      <SectionTitle icon="👥" title="EXPECTATIONS" colors={colors} />
      <Section card>
        <a href="/profile/edit/looking-for" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="I'm Looking For" value="Chat, Dates, Friends, Hookups" hasArrow colors={colors} />
        </a>
        <a href="/profile/edit/meet-at" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Meet At" value="My Place, Your Place, Bar" hasArrow colors={colors} />
        </a>
        <a href="/profile/edit/nsfw" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Accepts NSFW Pics" value="Yes" hasArrow colors={colors} />
        </a>
      </Section>

      {/* IDENTITY */}
      <SectionTitle icon="✨" title="IDENTITY" colors={colors} />
      <Section card>
        <a href="/profile/edit/gender" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Gender" value="Man" hasArrow colors={colors} />
        </a>
        <a href="/profile/edit/pronouns" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Pronouns" value="He/Him" hasArrow colors={colors} />
        </a>
      </Section>

      {/* HEALTH */}
      <SectionTitle icon="🏥" title="HEALTH" colors={colors} />
      <Section card>
        <a href="/profile/edit/hiv-status" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="HIV Status" value={hivStatusValue || 'Not specified'} hasArrow colors={colors} />
        </a>
        <a href="/profile/edit/last-tested" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Last Tested Date" value="January 2023" hasArrow colors={colors} />
        </a>
        <a href="/profile/edit/testing-reminders" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Testing Reminders" value="Off" hasArrow colors={colors} />
        </a>
        <a href="/profile/edit/health-practices" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Health Practices" value="Not specified" hasArrow colors={colors} />
        </a>
        <a href="/profile/edit/vaccinations" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Vaccinations" value="Not specified" hasArrow colors={colors} />
        </a>
        <a href="/settings/help" style={{ textDecoration: 'none', color: 'inherit' }}>
          <RowItem label="Sexual Health FAQ" value="" hasArrow colors={colors} />
        </a>
      </Section>

      {/* SOCIAL LINKS */}
      <SectionTitle icon="🔗" title="SOCIAL LINKS" colors={colors} />
      <Section card>
        <SocialRow icon="📷" label="Instagram" placeholder="Enter your Instagram username" colors={colors} />
        <SocialRow icon="✖" label="X" placeholder="Enter your X handle" colors={colors} />
        <SocialRow icon="📘" label="Facebook" placeholder="Enter your Facebook username" colors={colors} />
        <SocialRow icon="🎵" label="Spotify" placeholder="Add your top songs" colors={colors} />
      </Section>

      {/* Save Button (Fixed) */}
      {showSaveButton && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px',
          background: '#000',
          borderTop: '1px solid #1c1c1e',
          zIndex: 99
        }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              background: '#FF6B35',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ children, card }: { children: React.ReactNode; card?: boolean }) {
  const { colors } = useTheme();

  if (card) {
    return (
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: colors.surface,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          padding: '0 16px',
          marginBottom: '8px'
        }}>
          {children}
        </div>
      </div>
    );
  }

  return <div style={{ padding: '0 20px' }}>{children}</div>;
}

function StatField({ label, children, colors }: { label: string; children: React.ReactNode; colors: ThemeColors }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textSecondary, marginBottom: '10px' }}>{label}</div>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, colors }: { icon: string; title: string; colors: ThemeColors }) {
  return (
    <div style={{ padding: '25px 20px 10px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: `8px solid ${colors.surface}`, marginTop: '10px' }}>
      <span>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textSecondary }}>{title}</span>
    </div>
  );
}

function SectionHeader({ label, count, colors }: { label: string; count: string; colors: ThemeColors }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px' }}>
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '14px', color: colors.textSecondary }}>{count}</span>
    </div>
  );
}

function RowItem({ label, value, hasArrow, colors }: { label: string; value: string; hasArrow?: boolean; colors: ThemeColors }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ fontSize: '16px' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: colors.textSecondary, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        {hasArrow && <span style={{ color: colors.textSecondary, fontSize: '18px' }}>›</span>}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange, colors }: { label: string; value: boolean; onChange: (v: boolean) => void; colors: ThemeColors }) {
  const isDarkMode = colors.background === '#000' || colors.background === '#000000';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ fontSize: '16px' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '50px',
          height: '30px',
          borderRadius: '15px',
          border: 'none',
          background: value ? colors.accent : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: value ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

function SocialRow({ icon, label, placeholder, colors }: { icon: string; label: string; placeholder: string; colors: ThemeColors }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '13px', color: colors.textSecondary }}>{placeholder}</div>
      </div>
      <span style={{ color: colors.textSecondary, fontSize: '18px' }}>›</span>
    </div>
  );
}
