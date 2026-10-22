import React, { useEffect, useMemo, useState } from 'react';
import { countryCodes, normalizePhoneNumber, toParticipantRecord, validateParticipant } from './domain/participant.js';
import { supabase } from './lib/supabase.js';

const navigation = [
  {
    heading: 'OVERVIEW',
    items: [
      ['Executive dashboard', '▦'],
      ['Program overview', '◫'],
    ],
  },
  {
    heading: 'PROGRAM OPERATIONS',
    items: [
      ['Participants', '♙'],
      ['Applications', '▤', '18'],
      ['Enterprises', '⌂'],
      ['Workforce', '↗'],
      ['Service delivery', '✳'],
      ['Assessments', '☷'],
      ['Outcomes & follow-ups', '◎'],
      ['Partners', '♧'],
    ],
  },
  {
    heading: 'MONITORING & LEARNING',
    items: [
      ['MERL indicators', '◷'],
      ['Data quality', '◇', '6'],
      ['Analytics', '⌁'],
      ['Reports', '▧'],
      ['Geographic coverage', '⌖'],
    ],
  },
  {
    heading: 'FIELD OPERATIONS',
    items: [
      ['Offline collection', '▣'],
      ['Sync queue', '↻', '3'],
      ['Assigned activities', '☑'],
    ],
  },
  {
    heading: 'ADMINISTRATION',
    items: [
      ['Users & roles', '♧'],
      ['Countries & locations', '⌖'],
      ['Programs & cohorts', '▣'],
      ['Workflow configuration', '⚙'],
      ['Integrations', '⤳'],
      ['Audit logs', '≡'],
      ['System settings', '⚙'],
    ],
  },
];

const demoParticipants = [
  { id: 'NG-24-00842', name: 'Amina Yusuf', initials: 'AY', age: 24, country: 'Nigeria', location: 'Kaduna, Kaduna', enterprise: 'GreenSprout Farms', stage: 'Active', service: 'Farm business training', updated: 'Today, 09:42', color: 'lilac' },
  { id: 'GH-24-00317', name: 'Kojo Mensah', initials: 'KM', age: 27, country: 'Ghana', location: 'Tamale, Northern', enterprise: 'Northern Harvest Co.', stage: 'Enrolled', service: 'Starter input package', updated: 'Today, 08:16', color: 'sand' },
  { id: 'KE-24-00601', name: 'Wanjiku Njeri', initials: 'WN', age: 22, country: 'Kenya', location: 'Nakuru, Nakuru', enterprise: 'Seedling Circle', stage: 'Follow-up', service: 'Mentorship session', updated: 'Yesterday', color: 'mint' },
  { id: 'NG-24-00728', name: 'Chinedu Okafor', initials: 'CO', age: 29, country: 'Nigeria', location: 'Enugu, Enugu', enterprise: 'Harvest Link', stage: 'Active', service: 'Market access support', updated: 'Yesterday', color: 'blue' },
  { id: 'GH-24-00289', name: 'Abena Owusu', initials: 'AO', age: 25, country: 'Ghana', location: 'Kumasi, Ashanti', enterprise: 'Abeni Agro Hub', stage: 'Completed', service: 'Enterprise coaching', updated: 'Oct 19, 2026', color: 'rose' },
  { id: 'KE-24-00544', name: 'Kamau Mwangi', initials: 'KM', age: 26, country: 'Kenya', location: 'Kisumu, Kisumu', enterprise: 'Lakeview Poultry', stage: 'Applicant', service: 'Eligibility review', updated: 'Oct 18, 2026', color: 'gold' },
  { id: 'NG-24-00695', name: 'Zainab Bello', initials: 'ZB', age: 21, country: 'Nigeria', location: 'Kano, Kano', enterprise: 'Dala Grains', stage: 'Enrolled', service: 'Financial literacy', updated: 'Oct 17, 2026', color: 'peach' },
];

const moduleRows = {
  Applications: [
    ['APP-26-184', 'Fatima Ibrahim', 'Nigeria', 'Kaduna North', 'Submitted', 'Oct 22, 2026'],
    ['APP-26-183', 'Kwame Asare', 'Ghana', 'Tamale Metro', 'Under review', 'Oct 21, 2026'],
    ['APP-26-182', 'Linet Achieng', 'Kenya', 'Kisumu East', 'Needs follow-up', 'Oct 21, 2026'],
    ['APP-26-181', 'Ibrahim Musa', 'Nigeria', 'Kano Municipal', 'Under review', 'Oct 20, 2026'],
  ],
  Enterprises: [
    ['ENT-00428', 'GreenSprout Farms', 'Nigeria', 'Crop production', 'Active', '24 participants'],
    ['ENT-00427', 'Northern Harvest Co.', 'Ghana', 'Agro-processing', 'Active', '18 participants'],
    ['ENT-00426', 'Seedling Circle', 'Kenya', 'Horticulture', 'Needs review', '12 participants'],
    ['ENT-00425', 'Lakeview Poultry', 'Kenya', 'Livestock', 'Active', '9 participants'],
  ],
  'Service delivery': [
    ['SRV-00981', 'Farm business training', 'Nigeria', 'Training', 'Verified', 'Oct 22, 2026'],
    ['SRV-00980', 'Starter input package', 'Ghana', 'In-kind support', 'Pending review', 'Oct 22, 2026'],
    ['SRV-00979', 'Mentorship session', 'Kenya', 'Mentorship', 'Verified', 'Oct 21, 2026'],
    ['SRV-00978', 'Market access support', 'Nigeria', 'Market linkage', 'Verified', 'Oct 20, 2026'],
  ],
  'MERL indicators': [
    ['IND-01', 'Youth enrolled in program', 'All countries', '2,840 / 3,500', 'On track', 'Quarterly'],
    ['IND-02', 'Youth with improved agricultural income', 'All countries', '1,124 / 2,000', 'In progress', 'Biannual'],
    ['IND-03', 'Women-owned enterprises supported', 'All countries', '684 / 900', 'On track', 'Quarterly'],
    ['IND-04', 'Youth completing technical training', 'All countries', '1,905 / 2,600', 'In progress', 'Quarterly'],
  ],
  'Data quality': [
    ['DQ-0064', 'Missing consent date', 'Nigeria', 'Participant record', 'High', 'Assigned'],
    ['DQ-0063', 'Outcome awaiting verification', 'Ghana', 'Outcome record', 'Medium', 'In review'],
    ['DQ-0062', 'Possible duplicate participant', 'Kenya', 'Participant record', 'Medium', 'Assigned'],
    ['DQ-0061', 'Incomplete location details', 'Nigeria', 'Service record', 'Low', 'Open'],
  ],
  'Sync queue': [
    ['SYNC-0308', 'New participant registration', 'Nigeria', 'Field tablet · Kaduna', 'Waiting to sync', '2 min ago'],
    ['SYNC-0307', 'Assessment follow-up', 'Ghana', 'Field tablet · Tamale', 'Retry needed', '18 min ago'],
    ['SYNC-0306', 'Service delivery record', 'Kenya', 'Field phone · Nakuru', 'Conflict detected', '31 min ago'],
  ],
  Reports: [
    ['RPT-014', 'Quarterly program snapshot', 'All countries', 'Program performance', 'Ready', 'Oct 21, 2026'],
    ['RPT-013', 'Participant enrollment summary', 'Nigeria', 'Participant data', 'Ready', 'Oct 18, 2026'],
    ['RPT-012', 'Service delivery by partner', 'Ghana', 'Partner performance', 'Generating', 'Oct 17, 2026'],
    ['RPT-011', 'Youth outcome follow-up', 'Kenya', 'Outcome tracking', 'Ready', 'Oct 15, 2026'],
  ],
  Workforce: [['JOB-0041', 'Youth agribusiness placements', 'Nigeria', 'Career pathway', 'Active', '14 placements'], ['JOB-0040', 'Cooperative apprenticeship', 'Ghana', 'Apprenticeship', 'In progress', '9 placements'], ['JOB-0039', 'Agri-skills career fair', 'Kenya', 'Employment event', 'Scheduled', 'Nov 04, 2026']],
  'Outcomes & follow-ups': [['OUT-0132', 'Income change follow-up', 'Nigeria', 'Income outcome', 'Pending review', 'Oct 22, 2026'], ['OUT-0131', 'Employment status check-in', 'Ghana', 'Employment outcome', 'Verified', 'Oct 21, 2026'], ['OUT-0130', 'Enterprise growth survey', 'Kenya', 'Enterprise outcome', 'Needs follow-up', 'Oct 20, 2026']],
  Partners: [['PAR-008', 'Northern Growers Network', 'Nigeria', 'Implementation partner', 'Active', 'Kaduna'], ['PAR-007', 'Youth Harvest Alliance', 'Ghana', 'Delivery partner', 'Active', 'Northern Region'], ['PAR-006', 'Lake Basin Cooperative', 'Kenya', 'Technical partner', 'Under review', 'Nyanza']],
  Assessments: [['ASM-0224', 'Enterprise baseline', 'Nigeria', 'Baseline survey', 'In progress', 'Oct 22, 2026'], ['ASM-0223', 'Skills follow-up', 'Ghana', 'Training assessment', 'Submitted', 'Oct 21, 2026'], ['ASM-0222', 'Participant check-in', 'Kenya', 'Follow-up survey', 'Scheduled', 'Oct 23, 2026']],
  Analytics: [['AN-01', 'Participant reach', 'All countries', 'Coverage trend', 'Updated', 'Oct 22, 2026'], ['AN-02', 'Service delivery mix', 'All countries', 'Service analysis', 'Updated', 'Oct 21, 2026'], ['AN-03', 'Youth outcome progress', 'All countries', 'Outcome trend', 'Updated', 'Oct 20, 2026']],
  'Geographic coverage': [['LOC-027', 'Kaduna North sites', 'Nigeria', '12 field locations', 'Active', 'Kaduna'], ['LOC-019', 'Tamale Metro sites', 'Ghana', '8 field locations', 'Active', 'Northern'], ['LOC-011', 'Nakuru County sites', 'Kenya', '7 field locations', 'Active', 'Rift Valley']],
  'Offline collection': [['FORM-108', 'Participant intake form', 'Nigeria', '12 saved drafts', 'Available offline', 'Synced 2m ago'], ['FORM-107', 'Service visit form', 'Ghana', '4 saved drafts', 'Available offline', 'Synced 18m ago'], ['FORM-106', 'Outcome check-in form', 'Kenya', '3 saved drafts', 'Available offline', 'Sync needed']],
  'Assigned activities': [['TASK-221', 'Visit GreenSprout Farms', 'Nigeria', 'Field visit', 'Due today', 'Kaduna'], ['TASK-220', 'Review skills assessment', 'Ghana', 'Data review', 'In progress', 'Tamale'], ['TASK-219', 'Verify enterprise outcome', 'Kenya', 'Verification', 'Due tomorrow', 'Nakuru']],
  'Users & roles': [['USR-014', 'Program manager', 'All countries', 'Administrator', 'Active', 'Sarah Mensah'], ['USR-013', 'Field officer', 'Nigeria', 'Data collector', 'Active', 'Demo account'], ['USR-012', 'MEL reviewer', 'Ghana', 'Reviewer', 'Active', 'Demo account']],
  'Countries & locations': [['NG', 'Nigeria', 'West Africa', 'NGN · Africa/Lagos', 'Active', '12 locations'], ['GH', 'Ghana', 'West Africa', 'GHS · Africa/Accra', 'Active', '8 locations'], ['KE', 'Kenya', 'East Africa', 'KES · Africa/Nairobi', 'Active', '7 locations']],
  'Programs & cohorts': [['COH-026', 'Youth Agribusiness Cohort 2026', 'All countries', '2026 intake', 'Active', '2,840 participants'], ['COH-025', 'Enterprise Foundations', 'Nigeria', '2025 intake', 'In progress', '1,240 participants'], ['COH-024', 'Green Skills Pathway', 'Ghana', '2025 intake', 'Completed', '860 participants']],
  'Workflow configuration': [['WF-006', 'Participant eligibility review', 'All countries', 'Two-step review', 'Active', 'Updated Oct 20'], ['WF-005', 'Outcome verification', 'All countries', 'Reviewer approval', 'Active', 'Updated Oct 18'], ['WF-004', 'Service delivery approval', 'All countries', 'Partner submission', 'Draft', 'Updated Oct 14']],
  Integrations: [['INT-003', 'Approved reporting API', 'All countries', 'REST · Not connected', 'Configuration needed', 'No credentials'], ['INT-002', 'Partner data exchange', 'Ghana', 'CSV import', 'Available', 'Last run Oct 12'], ['INT-001', 'Geographic reference data', 'Kenya', 'Reference data', 'Available', 'Last run Oct 10']],
  'Audit logs': [['AUD-1843', 'Participant status updated', 'Nigeria', 'Record change', 'Logged', 'Today, 09:42'], ['AUD-1842', 'Outcome marked for review', 'Ghana', 'Verification', 'Logged', 'Today, 09:15'], ['AUD-1841', 'User scope changed', 'All countries', 'Access control', 'Logged', 'Yesterday']],
  'System settings': [['SET-01', 'Demo environment', 'All countries', 'Environment', 'Enabled', 'Fictional records'], ['SET-02', 'Manual sync', 'Field operations', 'Synchronization', 'Available', 'User initiated'], ['SET-03', 'Data retention policy', 'All countries', 'Governance', 'Needs configuration', 'Not production-ready']],
};

const countries = ['All countries', 'Nigeria', 'Ghana', 'Kenya'];

function Icon({ children, className = '' }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>;
}

function AgrivanceMark({ compact = false }) {
  return <span className={`agrivance-mark ${compact ? 'agrivance-mark-compact' : ''}`} aria-hidden="true"><svg viewBox="0 0 40 40" role="presentation"><path d="M20 33V16M20 24c-8 0-13-5-13-13 8 0 13 5 13 13Zm0-5c0-8 5-13 13-13 0 8-5 13-13 13Z" /><path d="M11 32h18" /></svg></span>;
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function getStageTone(stage) {
  if (stage === 'Active' || stage === 'Verified' || stage === 'On track' || stage === 'Ready') return 'green';
  if (stage === 'Applicant' || stage === 'Under review' || stage === 'In progress' || stage === 'Pending review' || stage === 'In review') return 'amber';
  if (stage === 'Follow-up' || stage === 'Needs review' || stage === 'Needs follow-up' || stage === 'Conflict detected' || stage === 'Retry needed') return 'red';
  if (stage === 'Completed' || stage === 'Enrolled' || stage === 'Submitted' || stage === 'Waiting to sync') return 'blue';
  return 'neutral';
}

function Sidebar({ active, onNavigate, collapsed, onToggle, mobileOpen, liveMode = false }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="brand">
        <button className="brand-home" onClick={() => onNavigate('Home')} title="Return to AGRIVANCE homepage">
          <AgrivanceMark compact />
          {!collapsed && <div className="brand-copy"><strong>AGRIVANCE</strong><small>PROGRAM WORKSPACE</small></div>}
        </button>
        <button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? '›' : '‹'}</button>
      </div>
      <div className="sidebar-scroll">
        {navigation.map((group) => (
          <section className="nav-group" key={group.heading}>
            {!collapsed && <div className="nav-heading">{group.heading}</div>}
            {group.items.map(([label, icon, count]) => (
              <button className={`nav-item ${active === label ? 'nav-item-active' : ''}`} key={label} onClick={() => onNavigate(label)} title={label} aria-label={label}>
                <Icon>{icon}</Icon>
                {!collapsed && <><span className="nav-label">{label}</span>{count && !liveMode && <span className="nav-count">{count}</span>}</>}
                {collapsed && count && !liveMode && <span className="nav-dot" />}
              </button>
            ))}
          </section>
        ))}
      </div>
      {!collapsed && <div className="sidebar-footer">
        <div className="offline-status"><span className="status-dot" /><div><strong>{liveMode ? 'Authenticated workspace' : 'All systems operational'}</strong><small>{liveMode ? 'Database features in progress' : 'Last synced 2 minutes ago'}</small></div></div>
        <div className="sidebar-version">AGRIVANCE <span>{liveMode ? 'LIVE WORKSPACE' : 'DEMO ENVIRONMENT'}</span></div>
      </div>}
    </aside>
  );
}

function Homepage({ onOpenDashboard, onOpenParticipants }) {
  const sections = [
    ['People first', 'A clear picture of participant journeys, services and follow-up needs.', '01'],
    ['Evidence that matters', 'Bring indicators, verification and learning into one shared workspace.', '02'],
    ['Built for the field', 'Keep field teams connected with offline-ready workflows and sync visibility.', '03'],
  ];
  return <div className="public-home">
    <header className="public-header">
      <a className="public-brand" href="#home" aria-label="AGRIVANCE home"><AgrivanceMark /><span>AGRIVANCE</span></a>
      <nav className="public-nav" aria-label="Main navigation">
        <a href="#platform">Platform</a><a href="#approach">Our approach</a><a href="#countries">Countries</a><a href="#about">About</a>
      </nav>
      <div className="public-header-actions"><button className="public-login" onClick={onOpenDashboard}>Team sign in</button><button className="button button-primary" onClick={onOpenDashboard}>Admin dashboard <span>↗</span></button></div>
    </header>
    <main>
      <section className="home-hero" id="home">
        <div className="hero-copy">
          <div className="hero-eyebrow"><span /> AGRICULTURE · YOUTH · OPPORTUNITY</div>
          <h1>Growing opportunity.<br /><em>Grounded in evidence.</em></h1>
          <p>One connected workspace for the people, enterprises and ideas building a more inclusive agricultural future across Africa.</p>
          <div className="hero-actions"><button className="button button-primary hero-primary" onClick={onOpenDashboard}>View dashboard as admin <span>→</span></button><a className="hero-secondary" href="#platform">Explore the platform <span>↓</span></a></div>
          <div className="hero-trust"><span className="trust-avatars"><i>NG</i><i>GH</i><i>KE</i></span><span>Connected across <strong>3 countries</strong></span><span className="trust-divider" /><span className="demo-tag">DEMO EXPERIENCE</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration of growing crops in a field">
          <div className="art-sun" /><div className="art-hill art-hill-back" /><div className="art-hill art-hill-front" />
          <div className="art-field-lines"><i /><i /><i /><i /><i /></div>
          <div className="art-plant plant-one"><b /><i /><i /></div><div className="art-plant plant-two"><b /><i /><i /></div><div className="art-plant plant-three"><b /><i /><i /></div>
          <div className="art-note note-top"><span>↗</span><div><strong>Local insight</strong><small>Better decisions, together</small></div></div>
          <div className="art-note note-bottom"><span className="note-leaf">✳</span><div><strong>People &amp; progress</strong><small>One shared view of change</small></div></div>
          <span className="art-caption">NURTURING WHAT COMES NEXT</span>
        </div>
        <div className="hero-bottomline"><span>MEASURE WHAT MATTERS</span><span className="bottomline-rule" /><span>LEARN AS WE GROW</span><span className="bottomline-rule" /><span>MOVE FORWARD TOGETHER</span></div>
      </section>
      <section className="home-intro" id="platform">
        <div className="intro-lead"><span className="section-label">A SHARED PROGRAM PICTURE</span><h2>From field activity<br />to meaningful progress.</h2></div>
        <div className="intro-copy"><p>AGRIVANCE brings program implementation, participant support and monitoring together, so teams can focus on delivering useful services and learning what works.</p><button className="inline-arrow" onClick={onOpenParticipants}>Explore participant journeys <span>→</span></button></div>
      </section>
      <section className="home-pillars" id="approach">{sections.map(([title, description, number]) => <article className="pillar-card" key={number}><span className="pillar-number">{number}</span><div className="pillar-icon">{number === '01' ? '♙' : number === '02' ? '◎' : '⌁'}</div><h3>{title}</h3><p>{description}</p><button onClick={onOpenDashboard} aria-label={`Explore ${title}`}>Explore <span>↗</span></button></article>)}</section>
      <section className="home-countries" id="countries"><div><span className="section-label">A REGIONAL PROGRAM, LOCALLY GROUNDED</span><h2>One shared mission.<br />Local context in every country.</h2><p>Country-level views help teams understand where work is happening and how support is progressing.</p></div><div className="home-country-list"><div><span className="country-disc ng-disc">NG</span><span><strong>Nigeria</strong><small>Local program coverage</small></span><b>01</b></div><div><span className="country-disc gh-disc">GH</span><span><strong>Ghana</strong><small>Local program coverage</small></span><b>02</b></div><div><span className="country-disc ke-disc">KE</span><span><strong>Kenya</strong><small>Local program coverage</small></span><b>03</b></div></div></section>
      <section className="home-about" id="about"><div className="about-symbol"><AgrivanceMark /></div><div><span className="section-label">THE AGRIVANCE WORKSPACE</span><h2>Designed to help good work travel further.</h2><p>AGRIVANCE is a program measurement and learning workspace for agriculture and youth development initiatives. This local demo uses fictional information and is not a source of verified program results.</p></div><button className="button button-secondary" onClick={onOpenDashboard}>Open admin workspace <span>→</span></button></section>
      <section className="home-cta"><div><span className="section-label">READY TO EXPLORE?</span><h2>See the program workspace in action.</h2><p>Browse the admin experience using clearly labeled demonstration data.</p></div><button className="button button-primary" onClick={onOpenDashboard}>View dashboard as admin <span>→</span></button></section>
    </main>
    <footer className="public-footer"><a className="public-brand" href="#home"><AgrivanceMark compact /><span>AGRIVANCE</span></a><span>Program measurement &amp; learning workspace</span><span className="footer-demo">FICTIONAL DEMO DATA · LOCAL PREVIEW</span><a href="#home">Back to top ↑</a></footer>
  </div>;
}

function Topbar({ country, onCountryChange, onSearch, onNotify, notificationsOpen, onProfile, profileOpen, onToggleMenu, user, onSignOut, liveMode = false, allowedCountries = countries }) {
  return (
    <header className="topbar">
      <button className="mobile-menu-button" onClick={onToggleMenu} aria-label="Open navigation menu">☰</button>
      <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Program overview</strong></div>
      <div className="topbar-actions">
        <label className="country-select">
          <Icon>⌖</Icon>
          <select aria-label="Program country" value={country} onChange={(event) => onCountryChange(event.target.value)}>
            {allowedCountries.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span className="select-chevron">⌄</span>
        </label>
        <button className="top-icon-button search-trigger" onClick={onSearch} aria-label="Search"><Icon>⌕</Icon><span>Search</span><kbd>⌘ K</kbd></button>
        <div className="popover-anchor">
          <button className={`top-icon-button icon-only ${notificationsOpen ? 'button-selected' : ''}`} onClick={onNotify} aria-label="Notifications"><Icon>♧</Icon>{!liveMode && <i className="notification-dot" />}</button>
          {notificationsOpen && (liveMode
            ? <div className="popover notification-popover"><div className="popover-title"><strong>Notifications</strong></div><p className="live-state">Notifications are not connected to live system events yet.</p><button className="popover-link" onClick={onNotify}>Close notifications</button></div>
            : <div className="popover notification-popover"><div className="popover-title"><strong>Notifications</strong><span>3 new</span></div><div className="notification-item"><span className="notification-symbol warning">!</span><div><strong>6 records need review</strong><small>Data quality · 24 minutes ago</small></div></div><div className="notification-item"><span className="notification-symbol green">↻</span><div><strong>Sync completed</strong><small>Field operations · 1 hour ago</small></div></div><div className="notification-item"><span className="notification-symbol blue">↗</span><div><strong>Quarterly report is ready</strong><small>Reports · Yesterday</small></div></div><button className="popover-link" onClick={onNotify}>Close notifications</button></div>)}
        </div>
        <div className="topbar-divider" />
        <div className="popover-anchor">
          <button className="profile-button" onClick={onProfile} aria-expanded={profileOpen}>
            <span className="avatar avatar-user">{user ? user.email?.slice(0, 2).toUpperCase() : 'SM'}</span>
            <span className="profile-copy"><strong>{user?.email || 'Sarah Mensah'}</strong><small>{user ? 'Signed-in user' : 'Program manager'}</small></span>
            <span className="select-chevron">⌄</span>
          </button>
          {profileOpen && <div className="popover profile-popover"><strong>{user?.email || 'Sarah Mensah'}</strong><span>{user ? 'Authenticated workspace' : 'Program manager · All countries'}</span>{user ? <button onClick={onSignOut}>Sign out</button> : <button onClick={onProfile}>Close profile menu</button>}</div>}
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value, change, note, icon, tone, onClick }) {
  return <button className="stat-card" onClick={onClick}>
    <div className="stat-top"><span className="stat-label">{label}</span><span className={`stat-icon stat-${tone}`}>{icon}</span></div>
    <div className="stat-value">{value}</div>
    <div className="stat-foot"><span className={`stat-change ${change.startsWith('+') ? 'change-up' : ''}`}>{change}</span><span>{note}</span></div>
  </button>;
}

function EnrollmentChart() {
  const bars = [40, 52, 46, 64, 57, 77, 70, 83, 74, 90, 82, 96];
  const labels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  return <div className="chart-wrap">
    <div className="chart-y-labels"><span>3,000</span><span>2,000</span><span>1,000</span><span>0</span></div>
    <div className="chart-main">
      <div className="chart-grid"><span /><span /><span /><span /></div>
      <div className="bar-chart" role="img" aria-label="Monthly enrollment trend from November to October">
        {bars.map((height, index) => <div className="bar-column" key={labels[index]}><div className={`bar ${index === bars.length - 1 ? 'bar-current' : ''}`} style={{ height: `${height}%` }} /><span>{labels[index]}</span></div>)}
      </div>
    </div>
    <div className="chart-legend"><span><i className="legend-square" /> Participants enrolled</span><span><i className="legend-line" /> Cumulative target</span></div>
  </div>;
}

function CountryCoverage({ country, onCountryChange }) {
  const data = [
    { name: 'Nigeria', code: 'NG', enrolled: '1,486', goal: '1,800', progress: 82, color: 'ng', sites: '12 implementation sites' },
    { name: 'Ghana', code: 'GH', enrolled: '742', goal: '900', progress: 74, color: 'gh', sites: '8 implementation sites' },
    { name: 'Kenya', code: 'KE', enrolled: '612', goal: '800', progress: 68, color: 'ke', sites: '7 implementation sites' },
  ].filter((item) => country === 'All countries' || item.name === country);
  return <div className="coverage-list">{data.map((item) => <button className="coverage-row" key={item.code} onClick={() => onCountryChange(item.name)}>
    <span className={`country-flag flag-${item.code.toLowerCase()}`}>{item.code}</span>
    <span className="coverage-info"><span className="coverage-name">{item.name}<small>{item.sites}</small></span><span className="coverage-count">{item.enrolled}<small>of {item.goal} target</small></span><span className="progress-track"><i style={{ width: `${item.progress}%` }} /></span></span>
    <span className="coverage-percent">{item.progress}%</span>
  </button>)}</div>;
}

function ParticipantTable({ participants, onSelect, compact = false }) {
  return <div className={`table-scroll ${compact ? 'compact-table' : ''}`}><table>
    <thead><tr><th>PARTICIPANT</th><th>COUNTRY / LOCATION</th><th>ENTERPRISE</th><th>PROGRAM STAGE</th><th>LAST ACTIVITY</th><th aria-label="Actions" /></tr></thead>
    <tbody>{participants.length ? participants.map((person) => <tr key={person.id} onClick={() => onSelect(person)} tabIndex="0" onKeyDown={(event) => { if (event.key === 'Enter') onSelect(person); }}>
      <td><div className="person-cell"><span className={`avatar avatar-${person.color}`}>{person.initials}</span><span><strong>{person.name}</strong><small>{person.id}</small></span></div></td>
      <td><span className="table-main">{person.country}</span><small className="table-sub">{person.location}</small></td>
      <td><span className="table-main">{person.enterprise}</span></td>
      <td><Badge tone={getStageTone(person.stage)}><i />{person.stage}</Badge></td>
      <td><span className="table-main table-date">{person.updated}</span><small className="table-sub">{person.service}</small></td>
      <td><button className="row-menu" aria-label={`View ${person.name}`} onClick={(event) => { event.stopPropagation(); onSelect(person); }}>···</button></td>
    </tr>) : <tr><td colSpan="6"><div className="empty-state"><span>⌕</span><strong>No records found</strong><small>Try changing your search or filters.</small></div></td></tr>}</tbody>
  </table></div>;
}

function ActivityFeed() {
  const items = [
    ['AY', 'Amina Yusuf', 'completed a farm business assessment', '12 min ago', 'lilac'],
    ['KM', 'Kojo Mensah', 'was enrolled in the Northern Harvest cohort', '48 min ago', 'sand'],
    ['WN', 'Wanjiku Njeri', 'has an outcome ready for verification', '2 hours ago', 'mint'],
    ['CO', 'Chinedu Okafor', 'received market access support', '3 hours ago', 'blue'],
  ];
  return <div className="activity-list">{items.map(([initials, name, action, time, color]) => <div className="activity-item" key={name}><span className={`avatar avatar-${color}`}>{initials}</span><span className="activity-copy"><span><strong>{name}</strong> {action}</span><small>{time}</small></span><span className="activity-more">···</span></div>)}</div>;
}

function Dashboard({ country, onCountryChange, onNavigate, participants, onSelectParticipant, onAddParticipant }) {
  return <div className="page-content dashboard-page">
    <div className="page-heading">
      <div><div className="eyebrow"><span className="eyebrow-dot" /> PROGRAM AT A GLANCE <span className="demo-tag">DEMO DATA</span></div><h1>Good morning, Sarah <span className="wave">✳</span></h1><p>Here’s what’s happening across your program today.</p></div>
      <div className="heading-actions"><button className="button button-secondary" onClick={() => onNavigate('Reports')}><Icon>↧</Icon> Export report</button><button className="button button-primary" onClick={onAddParticipant}><Icon>＋</Icon> Add participant</button></div>
    </div>
    <div className="dashboard-filter-row"><span className="updated-label"><span className="live-dot" /> Live program snapshot <span className="middle-dot">·</span> Updated 10:42 AM</span><label className="date-filter">◷ <select aria-label="Dashboard reporting period" defaultValue="Last 12 months"><option>Last 12 months</option><option>This quarter</option><option>This year</option></select><span>⌄</span></label></div>
    <section className="stats-grid" aria-label="Program key metrics">
      <StatCard label="Total participants" value="2,840" change="+12.8%" note="vs. previous period" icon="♙" tone="green" onClick={() => onNavigate('Participants')} />
      <StatCard label="Active enterprises" value="486" change="+8.2%" note="vs. previous period" icon="⌂" tone="blue" onClick={() => onNavigate('Enterprises')} />
      <StatCard label="Services delivered" value="6,219" change="+18.4%" note="vs. previous period" icon="✳" tone="amber" onClick={() => onNavigate('Service delivery')} />
      <StatCard label="Outcomes verified" value="1,126" change="+6.1%" note="vs. previous period" icon="◎" tone="purple" onClick={() => onNavigate('Outcomes & follow-ups')} />
    </section>
    <section className="main-grid">
      <article className="panel enrollment-panel">
        <div className="panel-header"><div><h2>Participant enrollment</h2><p>Progress toward annual program targets</p></div><span className="more-button" aria-hidden="true">···</span></div>
        <div className="chart-summary"><div><strong>2,840</strong><span>participants enrolled</span></div><div className="summary-divider" /><div><strong>3,500</strong><span>annual target</span></div><div className="chart-progress"><span>81.1% of target</span><i><b /></i></div></div>
        <EnrollmentChart />
      </article>
      <article className="panel coverage-panel">
        <div className="panel-header"><div><h2>Country coverage</h2><p>Enrollment against country targets</p></div><button className="text-link" onClick={() => onNavigate('Geographic coverage')}>View map <span>↗</span></button></div>
        <CountryCoverage country={country} onCountryChange={onCountryChange} />
        <div className="coverage-foot"><span className="map-preview"><span>⌖</span><span>⌖</span><span>⌖</span></span><span>Active in <strong>{country === 'All countries' ? '27 locations' : `${country} locations`}</strong></span><button onClick={() => onNavigate('Geographic coverage')}>Explore coverage <b>→</b></button></div>
      </article>
    </section>
    <section className="bottom-grid">
      <article className="panel recent-panel">
        <div className="panel-header recent-header"><div><h2>Recently updated participants</h2><p>Latest activity across your program</p></div><button className="text-link" onClick={() => onNavigate('Participants')}>View all participants <span>→</span></button></div>
        <ParticipantTable participants={participants.slice(0, 4)} onSelect={onSelectParticipant} compact />
      </article>
      <article className="panel activity-panel">
        <div className="panel-header"><div><h2>Recent activity</h2><p>Updates from your teams</p></div><span className="more-button" aria-hidden="true">···</span></div>
        <ActivityFeed />
        <button className="activity-link" onClick={() => onNavigate('Audit logs')}>View activity log <span>→</span></button>
      </article>
    </section>
    <div className="demo-disclaimer"><span>ⓘ</span> <strong>Demonstration environment</strong> — all records and performance figures shown are fictional and for product evaluation only.</div>
  </div>;
}

function RecordsPage({ section, country, participants, onSelectParticipant, onAddParticipant, search, onSearch }) {
  const [stage, setStage] = useState('All statuses');
  const isParticipants = section === 'Participants';
  const rows = isParticipants ? null : moduleRows[section];
  const [localRows, setLocalRows] = useState(rows || []);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const filteredParticipants = participants.filter((item) => {
    const matchCountry = country === 'All countries' || item.country === country;
    const matchStage = stage === 'All statuses' || item.stage === stage;
    const matchSearch = `${item.name} ${item.id} ${item.enterprise} ${item.location}`.toLowerCase().includes(search.toLowerCase());
    return matchCountry && matchStage && matchSearch;
  });
  const filteredRows = localRows.filter((row) => (country === 'All countries' || row[2] === country || row[2] === 'All countries') && (stage === 'All statuses' || row[4] === stage) && row.join(' ').toLowerCase().includes(search.toLowerCase()));
  const titles = {
    Participants: ['Participant directory', 'Manage participant records, enrollment, and program progress.'],
    Applications: ['Application review', 'Screen and review applications submitted across the program.'],
    Enterprises: ['Agricultural enterprises', 'Track youth-led businesses and their development.'],
    'Service delivery': ['Service delivery', 'Review and manage support delivered to participants.'],
    'MERL indicators': ['MERL indicators', 'Monitor approved program indicators and progress toward targets.'],
    'Data quality': ['Data quality review', 'Resolve validation issues and strengthen data integrity.'],
    'Sync queue': ['Synchronization queue', 'Review field records waiting to synchronize with the central system.'],
    Reports: ['Reports & exports', 'Create and download program reports for your permitted scope.'],
    Workforce: ['Workforce development', 'Track skills pathways, placements, apprenticeships and employment support.'],
    'Outcomes & follow-ups': ['Outcomes & follow-ups', 'Review participant outcomes and follow-up activities.'],
    Partners: ['Implementation partners', 'Coordinate partner organizations and delivery activity.'],
    Assessments: ['Assessments & surveys', 'Track assigned assessments, survey submissions and completion.'],
    Analytics: ['Program analytics', 'Explore fictional program trends across participating countries.'],
    'Geographic coverage': ['Geographic coverage', 'Review implementation locations and country-level reach.'],
    'Offline collection': ['Offline data collection', 'Review forms and drafts prepared for field collection.'],
    'Assigned activities': ['Assigned activities', 'See field visits and review tasks assigned to your team.'],
    'Users & roles': ['Users & roles', 'Review demonstration user roles and country-level workspace scope.'],
    'Countries & locations': ['Countries & locations', 'Review country and location configuration for the demo.'],
    'Programs & cohorts': ['Programs & cohorts', 'Review cohorts and program groupings in the demo workspace.'],
    'Workflow configuration': ['Workflow configuration', 'Review example participant and verification workflows.'],
    Integrations: ['Integrations registry', 'Review integration setup status. No external system is connected in this demo.'],
    'Audit logs': ['Audit logs', 'Review sample traceability events from the fictional workspace.'],
    'System settings': ['System settings', 'Review demo settings and production-readiness reminders.'],
  };
  const page = titles[section] || [section, `Explore ${section.toLowerCase()} activity and program information.`];
  const columns = {
    Applications: ['APPLICATION', 'APPLICANT', 'COUNTRY', 'LOCATION', 'REVIEW STATUS', 'SUBMITTED'],
    Enterprises: ['ID', 'ENTERPRISE', 'COUNTRY', 'SECTOR', 'STATUS', 'PARTICIPANTS'],
    'Service delivery': ['SERVICE ID', 'SERVICE', 'COUNTRY', 'SERVICE TYPE', 'REVIEW STATUS', 'DATE'],
    'MERL indicators': ['INDICATOR', 'MEASURE', 'SCOPE', 'PROGRESS', 'STATUS', 'FREQUENCY'],
    'Data quality': ['ISSUE', 'DESCRIPTION', 'COUNTRY', 'RECORD TYPE', 'PRIORITY', 'STATUS'],
    'Sync queue': ['OPERATION', 'RECORD TYPE', 'COUNTRY', 'SOURCE', 'SYNC STATUS', 'UPDATED'],
    Reports: ['REPORT ID', 'REPORT', 'SCOPE', 'CATEGORY', 'STATUS', 'CREATED'],
  };
  const defaultColumns = ['RECORD ID', 'NAME', 'SCOPE', 'TYPE / DETAILS', 'STATUS', 'UPDATED'];
  const isTablePage = isParticipants || !!rows;
  const stages = isParticipants ? ['All statuses', 'Applicant', 'Enrolled', 'Active', 'Follow-up', 'Completed'] : ['All statuses', ...new Set(localRows.map((row) => row[4]))];
  const [selectedRows, setSelectedRows] = useState([]);
  const [notice, setNotice] = useState('');
  const toggleRow = (id) => setSelectedRows((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const addDemoRecord = () => {
    const prefix = section.toUpperCase().replaceAll(/[^A-Z]/g, '').slice(0, 3) || 'DEM';
    const record = [`${prefix}-${String(localRows.length + 1).padStart(4, '0')}`, `New ${section.toLowerCase()} demo entry`, country === 'All countries' ? 'All countries' : country, 'Demo workspace item', 'Draft', 'Just now'];
    setLocalRows((current) => [record, ...current]);
    setStage('All statuses');
    setSearch('');
    setNotice('A fictional demo record was added to this page for the current browser session.');
  };
  const handleDownload = () => {
    const output = isParticipants ? filteredParticipants.map(({ id, name, country: nation, location, enterprise, stage: status }) => [id, name, nation, location, enterprise, status]) : filteredRows;
    const header = isParticipants ? ['ID', 'Name', 'Country', 'Location', 'Enterprise', 'Stage'] : (columns[section] || defaultColumns);
    const csv = [header, ...output].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${section.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}-demo.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Your CSV export has been downloaded.');
  };
  return <div className="page-content records-page">
    <div className="page-heading">
      <div><div className="eyebrow"><span className="eyebrow-dot" /> PROGRAM OPERATIONS <span className="demo-tag">DEMO DATA</span></div><h1>{page[0]}</h1><p>{page[1]}</p></div>
      <div className="heading-actions">{isParticipants ? <button className="button button-primary" onClick={onAddParticipant}><Icon>＋</Icon> Register participant</button> : <button className="button button-primary" onClick={addDemoRecord}><Icon>＋</Icon> {section === 'Reports' ? 'Create demo report' : 'Add demo record'}</button>}</div>
    </div>
    {notice && <div className="inline-notice"><span>✓</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    <div className="record-stats">
      <div><span>{isParticipants ? 'TOTAL RECORDS' : 'TOTAL ITEMS'}</span><strong>{isParticipants ? '2,840' : localRows.length}</strong><small><i>↗</i> +8.4% this quarter</small></div>
      <div><span>NEEDS ATTENTION</span><strong>{isParticipants ? '24' : section === 'Data quality' ? '6' : section === 'Sync queue' ? '3' : '8'}</strong><small className="attention-text">Across your selected scope</small></div>
      <div><span>COUNTRIES</span><strong>{country === 'All countries' ? '03' : '01'}</strong><small className="attention-text">{country === 'All countries' ? 'Nigeria · Ghana · Kenya' : country}</small></div>
    </div>
    <div className="panel records-panel">
      <div className="records-toolbar">
        <div className="record-tabs"><button className={`record-tab ${stage === 'All statuses' ? 'active-tab' : ''}`} onClick={() => setStage('All statuses')}>All records <span>{isParticipants ? '2,840' : localRows.length}</span></button><button className={`record-tab ${stage !== 'All statuses' ? 'active-tab' : ''}`} onClick={() => { const attention = stages.find((item) => ['Needs review', 'Needs follow-up', 'Pending review', 'Retry needed', 'Conflict detected', 'High', 'Draft', 'Needs configuration'].includes(item)); setStage(attention || 'All statuses'); setNotice(attention ? `Filtered to ${attention.toLowerCase()} records.` : 'There are no separate attention statuses in this view.'); }}>Needs attention <span className="attention-count">{section === 'Data quality' ? '6' : '8'}</span></button></div>
        <div className="toolbar-actions"><label className="table-search"><Icon>⌕</Icon><input aria-label={`Search ${section}`} placeholder={`Search ${section.toLowerCase()}...`} value={search} onChange={(event) => onSearch(event.target.value)} /></label><label className="filter-button">☷ <select aria-label={`Filter ${section} by status`} value={stage} onChange={(event) => setStage(event.target.value)}>{stages.map((item) => <option key={item}>{item}</option>)}</select></label><button className="filter-button" onClick={handleDownload}>↧ <span>Export</span></button></div>
      </div>
      {isParticipants ? <ParticipantTable participants={filteredParticipants} onSelect={onSelectParticipant} /> : <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all records" checked={allSelected} onChange={(event) => { setAllSelected(event.target.checked); setSelectedRows(event.target.checked ? filteredRows.map((row) => row[0]) : []); }} /></th>{(columns[section] || defaultColumns).map((column) => <th key={column}>{column}</th>)}<th /></tr></thead><tbody>{filteredRows.length ? filteredRows.map((row) => <tr key={row[0]}><td><input type="checkbox" aria-label={`Select ${row[0]}`} checked={selectedRows.includes(row[0])} onChange={() => toggleRow(row[0])} /></td>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{index === 4 ? <Badge tone={getStageTone(cell)}><i />{cell}</Badge> : <span className="table-main">{cell}</span>}</td>)}<td><button className="row-menu" onClick={() => { setSelectedRecord(row); setNotice(`${row[0]} details are open below.`); }} aria-label={`View details for ${row[0]}`}>View</button></td></tr>) : <tr><td colSpan={(columns[section] || defaultColumns).length + 2}><div className="empty-state"><span>⌕</span><strong>No records found</strong><small>Try changing your search or status filter.</small></div></td></tr>}</tbody></table></div>}
      {selectedRecord && <div className="module-note selected-record"><span>ⓘ</span><div><strong>{selectedRecord[0]} · {selectedRecord[1]}</strong><p>{selectedRecord.slice(2).join(' · ')}. Fictional demo record. <button onClick={() => setSelectedRecord(null)}>Close details</button></p></div></div>}
      {isTablePage && <div className="table-footer"><span>Showing <strong>{isParticipants ? filteredParticipants.length : filteredRows.length}</strong> of <strong>{isParticipants ? participants.length : localRows.length}</strong> records <span className="demo-footer-label">· Fictional demo records</span></span><div className="pagination"><span>Page 1 of 1</span></div></div>}
    </div>
    <div className="demo-disclaimer"><span>ⓘ</span> <strong>Demonstration environment</strong> — data is fictional and must not be used as actual program results.</div>
  </div>;
}

function ParticipantModal({ onClose, onSave, error, demoMode = false, allowedCountries = ['Nigeria', 'Ghana', 'Kenya'] }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', country: allowedCountries[0] || 'Nigeria', location: '', phone: '', enterprise: '', consent: false });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateParticipant(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setSaving(true);
    try {
      const saved = await onSave(form);
      if (!saved) setSaving(false);
    } catch (saveError) {
      setSaving(false);
      throw saveError;
    }
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="participant-modal-title">
      <div className="modal-header"><div><span className="modal-kicker">PARTICIPANT REGISTRATION</span><h2 id="participant-modal-title">Add a participant</h2><p>Create a new fictional demo record.</p></div><button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button></div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>First name <span>*</span><input autoFocus value={form.firstName} onChange={update('firstName')} placeholder="e.g. Amina" aria-invalid={!!errors.firstName} />{errors.firstName && <small className="field-error">{errors.firstName}</small>}</label>
          <label>Last name <span>*</span><input value={form.lastName} onChange={update('lastName')} placeholder="e.g. Yusuf" aria-invalid={!!errors.lastName} />{errors.lastName && <small className="field-error">{errors.lastName}</small>}</label>
          <label>Country <span>*</span><select value={form.country} onChange={update('country')}>{allowedCountries.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Location <span>*</span><input value={form.location} onChange={update('location')} placeholder="District or region" aria-invalid={!!errors.location} />{errors.location && <small className="field-error">{errors.location}</small>}</label>
          <label>Phone number <small>Optional</small><input type="tel" value={form.phone} onChange={update('phone')} placeholder={form.country === 'Ghana' ? '+233 000 000 000' : form.country === 'Kenya' ? '+254 000 000 000' : '+234 000 000 0000'} aria-invalid={!!errors.phone} />{errors.phone && <small className="field-error">{errors.phone}</small>}</label>
          <label>Enterprise <small>Optional</small><input value={form.enterprise} onChange={update('enterprise')} placeholder="Enterprise name" /></label>
        </div>
        <label className="consent-field"><input type="checkbox" checked={form.consent} onChange={(event) => setForm((current) => ({ ...current, consent: event.target.checked }))} /> I have recorded the participant's consent to store this information. <span>*</span></label>
        {errors.consent && <small className="field-error">{errors.consent}</small>}
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-privacy"><span>ⓘ</span><span>{demoMode ? 'Development demo only: this record stays in temporary browser memory and is fictional. Never enter real participant information.' : 'Participant details are sent only to the configured authenticated database. Do not submit information until your organization has approved its collection and retention.'}</span></div>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save participant'}</button></div>
      </form>
    </section>
  </div>;
}

function ParticipantDetail({ participant, onClose, demoMode = false }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
    <div className="modal-header"><div><span className="modal-kicker">PARTICIPANT PROFILE · {participant.id}</span><h2 id="detail-title">{participant.name}</h2><p>{demoMode ? 'Fictional demonstration record · ' : ''}{participant.country}</p></div><button className="modal-close" onClick={onClose} aria-label="Close profile">×</button></div>
    <div className="detail-status"><Badge tone={getStageTone(participant.stage)}><i />{participant.stage}</Badge><span>Last activity {participant.updated}</span></div>
    <div className="detail-grid"><div><small>LOCATION</small><strong>{participant.location}</strong></div><div><small>AGE</small><strong>{participant.age == null ? 'Not recorded' : `${participant.age} years`}</strong></div><div><small>ENTERPRISE</small><strong>{participant.enterprise}</strong></div><div><small>LAST SERVICE</small><strong>{participant.service}</strong></div></div>
    {demoMode && <div className="detail-timeline"><h3>Program journey</h3><div><i /><span><strong>Participant record updated</strong><small>{participant.updated}</small></span></div><div><i /><span><strong>{participant.service}</strong><small>Program service recorded · Fictional</small></span></div><div><i /><span><strong>Enrolled in AGRIVANCE program</strong><small>Program lifecycle event · Fictional</small></span></div></div>}
    <div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Close profile</button></div>
  </section></div>;
}

function SearchModal({ onClose, value, onChange, onNavigate }) {
  return <div className="modal-backdrop search-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="global-search" role="dialog" aria-modal="true" aria-label="Global search"><div className="global-search-input"><Icon>⌕</Icon><input autoFocus placeholder="Search participants, enterprises, reports..." value={value} onChange={(event) => onChange(event.target.value)} /><kbd>ESC</kbd><button onClick={onClose} aria-label="Close search">×</button></div><div className="search-suggestions"><small>QUICK NAVIGATION</small>{['Participants', 'Applications', 'Enterprises', 'Reports'].map((item) => <button key={item} onClick={() => { onNavigate(item); onClose(); }}><span>⌕</span>{item}<kbd>↵</kbd></button>)}</div></section></div>;
}

function SignInPage({ onSignIn, onCancel, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    await onSignIn(email.trim(), password);
    setPending(false);
  };

  return <main className="auth-page">
    <form className="auth-card" onSubmit={submit}>
      <AgrivanceMark />
      <span className="modal-kicker">SECURE WORKSPACE</span>
      <h1>Team sign in</h1>
      <p>Use your organization-provisioned AGRIVANCE account.</p>
      <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="button button-primary" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
      <button className="auth-cancel" type="button" onClick={onCancel}>Back to AGRIVANCE</button>
      <small>Accounts are provisioned by an administrator. Public registration is disabled.</small>
    </form>
  </main>;
}

function ConfigurationNotice({ onBack }) {
  return <main className="auth-page"><section className="auth-card" role="status">
    <AgrivanceMark />
    <span className="modal-kicker">WORKSPACE NOT CONFIGURED</span>
    <h1>Secure services are unavailable</h1>
    <p>This deployment has no configured authentication and database connection. The admin workspace is disabled rather than showing sample data as real records.</p>
    <button className="button button-secondary" onClick={onBack}>Back to public site</button>
    <small>An administrator must configure the Supabase environment variables and apply the database migration before enabling live operations.</small>
  </section></main>;
}

function ProductionModuleNotice({ section }) {
  return <main className="page-content">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> PROGRAM OPERATIONS</div><h1>{section}</h1><p>This module is not connected to a live data workflow yet.</p></div></div>
    <div className="module-note"><span>ⓘ</span><div><strong>No live records or actions are available</strong><p>This workspace will not display the prototype's fictional records in a configured environment. The module needs its database schema, scoped permissions, and verified workflow before activation.</p></div></div>
  </main>;
}

function LiveDashboard({ country, totalParticipants, loading, error, onRetry, participants, onSelect, onOpenParticipants, onAddParticipant, canRegister }) {
  return <div className="page-content dashboard-page">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> LIVE WORKSPACE</div><h1>Program overview</h1><p>Figures below come from authorized participant records in the database.</p></div><div className="heading-actions">{canRegister && <button className="button button-primary" onClick={onAddParticipant}>＋ Register participant</button>}</div></div>
    <section className="stats-grid" aria-label="Program key metrics">
      <article className="stat-card live-stat"><div className="stat-top"><span className="stat-label">Registered participants</span><span className="stat-icon stat-green">♙</span></div><div className="stat-value">{loading ? '…' : error ? '—' : totalParticipants}</div><div className="stat-foot"><span>Database count</span><span>{country}</span></div></article>
      <article className="panel live-empty-panel"><strong>Other dashboard metrics are not available yet</strong><p>Charts, activities, and programme indicators will appear when they are backed by verified records and definitions.</p></article>
    </section>
    {error && <div className="form-error" role="alert">{error}<button onClick={onRetry}> Retry</button></div>}
    <section className="panel recent-panel live-participants-panel">
      <div className="panel-header"><div><h2>Recently registered participants</h2><p>Authorized records in the selected country scope</p></div><button className="text-link" onClick={onOpenParticipants}>View participant directory →</button></div>
      {loading ? <p className="live-state">Loading authorized records…</p> : participants.length ? <ParticipantTable participants={participants.slice(0, 4)} onSelect={onSelect} compact /> : <div className="empty-state"><span>⌕</span><strong>No participant records</strong><small>Register a participant if your role permits it.</small></div>}
    </section>
  </div>;
}

function LiveParticipantsPage({ participants, total, loading, error, search, onSearch, onRetry, onAddParticipant, canRegister, onSelect }) {
  const visibleParticipants = participants.filter((item) => `${item.name} ${item.id} ${item.enterprise} ${item.location}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="page-content records-page">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> PROGRAM OPERATIONS</div><h1>Participant directory</h1><p>Authenticated participant records visible within your assigned country scope.</p></div>
      {canRegister && <div className="heading-actions"><button className="button button-primary" onClick={onAddParticipant}>＋ Register participant</button></div>}
    </div>
    <div className="records-toolbar live-toolbar"><label className="table-search"><Icon>⌕</Icon><input aria-label="Search participants" placeholder="Search loaded participants..." value={search} onChange={(event) => onSearch(event.target.value)} /></label></div>
    {error && <div className="form-error" role="alert">{error}<button onClick={onRetry}> Retry</button></div>}
    <div className="panel records-panel">
      {loading ? <p className="live-state">Loading authorized participant records…</p> : <ParticipantTable participants={visibleParticipants} onSelect={onSelect} />}
      <div className="table-footer"><span>Showing <strong>{visibleParticipants.length}</strong> loaded of <strong>{total}</strong> authorized records</span><span>Maximum 100 records loaded; server pagination is not implemented.</span></div>
    </div>
    <div className="module-note"><span>ⓘ</span><div><strong>Duplicate screening is limited</strong><p>Exact name and location matches are flagged at registration. A dedicated review and merge workflow is not yet available; possible matches are not merged automatically.</p></div></div>
  </div>;
}

export default function App() {
  const [active, setActive] = useState('Home');
  const [country, setCountry] = useState('All countries');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const demoMode = !supabase && import.meta.env.DEV;
  const [participants, setParticipants] = useState(demoMode ? demoParticipants : []);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [authError, setAuthError] = useState('');
  const [access, setAccess] = useState(null);
  const [accessError, setAccessError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [addError, setAddError] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setActive(nextSession ? 'Executive dashboard' : 'Home');
      setAuthError('');
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError('Unable to verify your session. Please try signing in again.');
      setSession(data.session);
      if (data.session) setActive('Executive dashboard');
      setAuthReady(true);
    }).catch(() => {
      if (!mounted) return;
      setAuthError('Unable to verify your session. Please reload and try again.');
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user?.id) {
      setAccess(null);
      setAccessError('');
      return;
    }

    let mounted = true;
    setAccess(null);
    setAccessError('');
    supabase.from('user_access').select('role,country_codes').eq('user_id', session.user.id).single()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data) {
          setAccessError('Your account has no assigned workspace access. Contact your organization administrator.');
          return;
        }
        setAccess(data);
        if (data.role !== 'system_admin') {
          const scopedCountries = data.country_codes.map((code) => ({ NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya' }[code]));
          setCountry((current) => current === 'All countries' || scopedCountries.includes(current) ? current : scopedCountries[0] || 'All countries');
        }
      })
      .catch(() => {
        if (mounted) setAccessError('Your workspace permissions could not be loaded. Check your connection and retry.');
      });

    return () => { mounted = false; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase || !session?.user?.id || !access) return undefined;

    let mounted = true;
    const countryCode = countryCodes[country];
    if (countryCode && access.role !== 'system_admin' && !access.country_codes.includes(countryCode)) {
      setDataError('This country is outside your assigned access scope.');
      return undefined;
    }

    setLoading(true);
    setDataError('');
    let listQuery = supabase.from('participants')
      .select('id,participant_code,country_code,first_name,last_name,location,enterprise,status,updated_at')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(100);
    let countQuery = supabase.from('participants')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null);
    if (countryCode) {
      listQuery = listQuery.eq('country_code', countryCode);
      countQuery = countQuery.eq('country_code', countryCode);
    }

    Promise.all([listQuery, countQuery]).then(([listResult, countResult]) => {
      if (!mounted) return;
      if (listResult.error || countResult.error) {
        setDataError('Participant records could not be loaded. Check your connection and retry.');
        setLoading(false);
        return;
      }
      setParticipants((listResult.data || []).map(toParticipantRecord));
      setTotalParticipants(countResult.count || 0);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setDataError('Participant records could not be loaded. Check your connection and retry.');
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [session?.user?.id, access, country, reloadNonce]);

  const visibleParticipants = useMemo(() => participants.filter((person) => (country === 'All countries' || person.country === country) && `${person.name} ${person.id} ${person.enterprise} ${person.location}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.updated.localeCompare(b.updated)), [participants, country, search]);
  const navigate = (label) => { setActive(label); setSearch(''); setNotificationsOpen(false); setProfileOpen(false); setMobileMenuOpen(false); };
  const openDashboard = () => navigate(supabase ? (session ? 'Executive dashboard' : 'Sign in') : 'Executive dashboard');
  const handleSignIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError('Sign-in failed. Check your details or contact your administrator.');
    } catch {
      setAuthError('Sign-in service is unavailable. Check your connection and retry.');
    }
  };
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setAuthError('Sign-out failed. Please retry.');
    } catch {
      setAuthError('Sign-out service is unavailable. Please retry.');
    }
  };
  const handleSave = async (form) => {
    if (!supabase) {
      if (!demoMode) return false;
      const countryCode = countryCodes[form.country];
      const participant = {
        id: `${countryCode}-26-${String(participants.length + 1).padStart(5, '0')}`,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        initials: `${form.firstName.trim()[0]}${form.lastName.trim()[0]}`.toUpperCase(),
        age: 24,
        country: form.country,
        location: form.location.trim(),
        enterprise: form.enterprise.trim() || 'Not yet assigned',
        stage: 'Applicant',
        service: 'Registration submitted',
        updated: 'Just now',
        color: 'mint',
      };
      setParticipants((current) => [participant, ...current]);
      setAddOpen(false);
      setActive('Participants');
      setSearch('');
      return true;
    }

    if (!access || !['system_admin', 'country_manager', 'field_officer'].includes(access.role)) {
      setAddError('Your assigned role does not permit participant registration.');
      return false;
    }

    const code = countryCodes[form.country];
    let registration;
    let registrationError;
    try {
      const response = await supabase.rpc('register_participant', {
        target_country: code,
        target_first_name: form.firstName.trim(),
        target_last_name: form.lastName.trim(),
        target_location: form.location.trim(),
        target_phone: form.phone.trim() ? normalizePhoneNumber(form.phone) : null,
        target_enterprise: form.enterprise.trim() || null,
        consent_confirmed: form.consent,
      });
      registration = response.data?.[0];
      registrationError = response.error;
    } catch {
      setAddError('Participant registration is unavailable. No participant was saved.');
      return false;
    }
    if (registrationError || !registration) {
      setAddError('Participant registration failed validation or authorization. No participant was saved.');
      return false;
    }
    if (registration.result === 'review_required') {
      setAddError(`Potential match${registration.potential_matches.length === 1 ? '' : 'es'} ${registration.potential_matches.join(', ')} flagged for data-quality review. Request ${registration.duplicate_review_id}; no participant was created.`);
      return false;
    }
    if (registration.result !== 'created') {
      setAddError('Participant registration returned an unexpected result. No success was reported.');
      return false;
    }

    setParticipants((current) => [toParticipantRecord(registration), ...current]);
    setTotalParticipants((current) => current + 1);
    setAddError('');
    setAddOpen(false);
    setActive('Participants');
    setSearch('');
    return true;
  };
  const openSearch = () => { setSearchOpen(true); setNotificationsOpen(false); setProfileOpen(false); };
  const canRegister = demoMode || ['system_admin', 'country_manager', 'field_officer'].includes(access?.role);
  const countryOptions = access?.role === 'system_admin'
    ? countries
    : ['All countries', ...(access?.country_codes || []).map((code) => ({ NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya' }[code])).filter(Boolean)];
  const participantCountryOptions = countryOptions.filter((item) => item !== 'All countries');
  const retryLoad = () => setReloadNonce((value) => value + 1);

  if (supabase && !authReady) {
    return <main className="auth-page"><p role="status">Checking secure workspace session…</p></main>;
  }

  if (!supabase && !import.meta.env.DEV && active !== 'Home') {
    return <ConfigurationNotice onBack={() => setActive('Home')} />;
  }

  if (supabase && active === 'Sign in') {
    return <SignInPage onSignIn={handleSignIn} onCancel={() => setActive('Home')} error={authError} />;
  }

  if (supabase && session && accessError) {
    return <main className="auth-page"><section className="auth-card" role="alert"><h1>Workspace access not assigned</h1><p>{accessError}</p><button className="button button-secondary" onClick={handleSignOut}>Sign out</button></section></main>;
  }

  const authLoading = Boolean(supabase && session && !access);
  if (supabase && session && authLoading && active !== 'Home') {
    return <main className="auth-page"><p role="status">Loading your assigned workspace…</p></main>;
  }

  return <div className="app-shell">
    {active === 'Home' ? <Homepage onOpenDashboard={openDashboard} onOpenParticipants={() => navigate(supabase ? 'Sign in' : 'Participants')} /> : <>
      <Sidebar active={active} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} mobileOpen={mobileMenuOpen} liveMode={Boolean(supabase)} />
      {mobileMenuOpen && <button className="mobile-drawer-scrim" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu" />}
      <div className="workspace">
        <Topbar country={country} onCountryChange={setCountry} onSearch={openSearch} onNotify={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} notificationsOpen={notificationsOpen} onProfile={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} profileOpen={profileOpen} onToggleMenu={() => setMobileMenuOpen((value) => !value)} user={session?.user} onSignOut={handleSignOut} liveMode={Boolean(supabase)} allowedCountries={countryOptions} />
        <main>
          {supabase ? (
            active === 'Executive dashboard' || active === 'Program overview'
              ? <LiveDashboard country={country} totalParticipants={totalParticipants} loading={loading} error={dataError} onRetry={retryLoad} participants={visibleParticipants} onSelect={setSelectedParticipant} onOpenParticipants={() => navigate('Participants')} onAddParticipant={() => { setAddError(''); setAddOpen(true); }} canRegister={canRegister} />
              : active === 'Participants'
                ? <LiveParticipantsPage participants={participants} total={totalParticipants} loading={loading} error={dataError} search={search} onSearch={setSearch} onRetry={retryLoad} onAddParticipant={() => { setAddError(''); setAddOpen(true); }} canRegister={canRegister} onSelect={setSelectedParticipant} />
                : <ProductionModuleNotice section={active} />
          ) : (
            active === 'Executive dashboard' || active === 'Program overview'
              ? <Dashboard country={country} onCountryChange={setCountry} onNavigate={navigate} participants={visibleParticipants} onSelectParticipant={setSelectedParticipant} onAddParticipant={() => setAddOpen(true)} />
              : <RecordsPage section={active} country={country} participants={participants} onSelectParticipant={setSelectedParticipant} onAddParticipant={() => setAddOpen(true)} search={search} onSearch={setSearch} />
          )}
        </main>
      </div>
    </>}
    {addOpen && <ParticipantModal onClose={() => setAddOpen(false)} onSave={handleSave} error={addError} demoMode={demoMode} allowedCountries={participantCountryOptions.length ? participantCountryOptions : ['Nigeria']} />}
    {selectedParticipant && <ParticipantDetail participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} demoMode={demoMode} />}
    {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} value={search} onChange={setSearch} onNavigate={navigate} />}
  </div>;
}
