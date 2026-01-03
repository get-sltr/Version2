'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGroup } from '@/lib/api/groups';
import type { GroupType } from '@/types/database';

export default function CreateGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<GroupType>('Hangout');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('10');
  const [description, setDescription] = useState('');
  const [ageRange, setAgeRange] = useState('18-80');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupTypes: GroupType[] = ['Hangout', 'Party', 'Sports', 'Casual', 'Dinner', 'Drinks', 'Gaming', 'Other'];
  const availableTags = ['Social', 'Drinks', 'Casual', 'NSFW', '420 Friendly', 'Sports', 'Gaming', 'Food', 'Outdoors', 'Indoors'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const parseAgeRange = (range: string): { min: number; max: number } => {
    if (range === '40+') return { min: 40, max: 99 };
    const [min, max] = range.split('-').map(Number);
    return { min: min || 18, max: max || 99 };
  };

  const handleCreate = async () => {
    if (!groupName || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { min: minAge, max: maxAge } = parseAgeRange(ageRange);

      const newGroup = await createGroup({
        name: groupName,
        type: groupType,
        event_date: date,
        event_time: time,
        max_attendees: Number.parseInt(maxAttendees) || 10,
        description: description || undefined,
        min_age: minAge,
        max_age: maxAge,
        tags: selectedTags,
        is_private: false,
        requires_approval: true
      });

      router.push(`/groups/${newGroup.id}`);
    } catch (error: any) {
      console.error('Failed to create group:', error);
      alert(error.message || 'Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 100
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0
          }}
        >
          Cancel
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 600, flex: 1, textAlign: 'center' }}>
          Host a Group
        </h1>
        <button
          onClick={handleCreate}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0
          }}
        >
          Create
        </button>
      </header>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#fff',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}>
          👥
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Create Your Group
        </h2>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Bring people together for fun and connection
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: '20px', paddingBottom: '100px' }}>
        {/* Group Name */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="groupName" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#aaa' }}>
            Group Name *
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value.slice(0, 50))}
            placeholder="e.g., Late Night Fun 🌙"
            style={{
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', textAlign: 'right' }}>
            {groupName.length}/50
          </div>
        </div>

        {/* Group Type */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="groupType" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
            Type
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px'
          }}>
            {groupTypes.map(type => (
              <button
                key={type}
                onClick={() => setGroupType(type)}
                style={{
                  background: groupType === type ? '#FF6B35' : '#1c1c1e',
                  border: groupType === type ? '1px solid #FF6B35' : '1px solid #333',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="date" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#aaa' }}>
            Date & Time *
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                flex: 1,
                background: '#1c1c1e',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                flex: 1,
                background: '#1c1c1e',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Max Attendees */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="maxAttendees" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#aaa' }}>
            Maximum Attendees
          </label>
          <input
            id="maxAttendees"
            type="number"
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(e.target.value)}
            min="2"
            max="50"
            style={{
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="description" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#aaa' }}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder="Tell people what to expect..."
            rows={4}
            style={{
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontSize: '16px',
              fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif"
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', textAlign: 'right' }}>
            {description.length}/500
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="tags-group" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
            Tags (up to 5)
          </label>
          <div id="tags-group" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                style={{
                  background: selectedTags.includes(tag) ? 'rgba(255,107,53,0.2)' : '#1c1c1e',
                  border: selectedTags.includes(tag) ? '1px solid #FF6B35' : '1px solid #333',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  color: selectedTags.includes(tag) ? '#FF6B35' : '#aaa',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: (!selectedTags.includes(tag) && selectedTags.length >= 5) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedTags.includes(tag) && selectedTags.length >= 5) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="ageRange" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#aaa' }}>
            Age Range (optional)
          </label>
          <select
            id="ageRange"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            style={{
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              fontSize: '16px',
              outline: 'none'
            }}
          >
            <option value="18-80">All Ages (18+)</option>
            <option value="18-25">18-25</option>
            <option value="21-30">21-30</option>
            <option value="25-35">25-35</option>
            <option value="30-40">30-40</option>
            <option value="35-50">35-50</option>
            <option value="40+">40+</option>
          </select>
        </div>

        {/* Guidelines */}
        <div style={{
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#FF6B35' }}>
            📋 Group Guidelines
          </div>
          <ul style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
            <li>Be respectful to all attendees</li>
            <li>Groups are for meetups, not solicitation</li>
            <li>Hosts are responsible for group conduct</li>
            <li>Report inappropriate behavior immediately</li>
          </ul>
        </div>
      </div>

      {/* Fixed Create Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 70%, transparent)',
        backdropFilter: 'blur(20px)'
      }}>
        <button
          onClick={handleCreate}
          disabled={!groupName || !date || !time || isSubmitting}
          style={{
            width: '100%',
            background: (!groupName || !date || !time || isSubmitting) ? '#333' : '#FF6B35',
            border: 'none',
            borderRadius: '12px',
            padding: '18px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: (!groupName || !date || !time || isSubmitting) ? 'not-allowed' : 'pointer',
            opacity: (!groupName || !date || !time || isSubmitting) ? 0.5 : 1
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}
