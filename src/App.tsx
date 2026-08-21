import React, { useState, useEffect } from 'react';
import {
  User,
  Lead,
  CallRecord,
  FollowUp,
  NotificationItem,
  ActivityLog,
  UserRole
} from './types';
import {
  INITIAL_USERS,
  INITIAL_LEADS,
  INITIAL_CALLS,
  INITIAL_FOLLOW_UPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS
} from './data/mockData';
import { LocalAIService } from './services/aiService';
import { ApiClient } from './services/apiClient';
import { RealtimeClient } from './services/realtimeClient';

import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { CallingDrawer } from './components/CallingDrawer';
import { IncomingCallModal } from './components/IncomingCallModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { LeadAssignModal } from './components/LeadAssignModal';
import { AddLeadModal } from './components/AddLeadModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { AiScoreExplainerModal } from './components/AiScoreExplainerModal';
import { ScheduleFollowUpModal } from './components/ScheduleFollowUpModal';

import { ManagerDashboard } from './views/ManagerDashboard';
import { SalespersonDashboard } from './views/SalespersonDashboard';
import { LeadManagementView } from './views/LeadManagementView';
import { CallHistoryView } from './views/CallHistoryView';
import { FollowUpsView } from './views/FollowUpsView';
import { ReportsView } from './views/ReportsView';
import { UserManagementView } from './views/UserManagementView';
import { SettingsView } from './views/SettingsView';
import { AuthView } from './views/AuthView';

export default function App() {
  // Application Primary State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('salescall_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('salescall_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('salescall_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('salescall_calls');
    return saved ? JSON.parse(saved) : INITIAL_CALLS;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem('salescall_followups');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('salescall_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('salescall_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals & Active Call State
  const [activeCallLead, setActiveCallLead] = useState<Lead | null>(null);
  const [incomingCallLead, setIncomingCallLead] = useState<Lead | null>(null);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [assignModalLeads, setAssignModalLeads] = useState<Lead[] | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [aiExplainerLead, setAiExplainerLead] = useState<Lead | null>(null);
  const [scheduleFollowUpLead, setScheduleFollowUpLead] = useState<Lead | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync Current User with ApiClient and Connect Realtime SSE Stream
  useEffect(() => {
    ApiClient.setCurrentUser(currentUser);
    if (currentUser) {
      RealtimeClient.connect(currentUser.id, currentUser.role);
      ApiClient.updateSalespersonStatus('ONLINE', 'Online & Softphone Active');
    } else {
      RealtimeClient.disconnect();
    }
  }, [currentUser]);

  // Global Realtime Event Listener
  useEffect(() => {
    const unsubscribe = RealtimeClient.subscribe((event) => {
      if (event.type === 'LEAD_ASSIGNED') {
        showToast(`Lead assignment updated in real-time.`);
      } else if (event.type === 'CALL_ENDED') {
        if (event.data?.call) {
          setCalls((prev) => {
            const exists = prev.some((c) => c.id === event.data.call.id);
            return exists ? prev : [event.data.call, ...prev];
          });
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Inbound Call Handlers
  const handleTriggerInboundCall = () => {
    const candidateLead =
      leads.find((l) => l.priority === 'High' && l.status !== 'Converted') ||
      leads[Math.floor(Math.random() * leads.length)] ||
      {
        id: `lead-inbound-${Date.now()}`,
        name: 'Kavita Menon',
        phone: '+91 98201 44552',
        email: 'kavita.m@apexlogistics.in',
        company: 'Apex Logistics & Supply Chain',
        source: 'Website',
        priority: 'High',
        status: 'New',
        assignedTo: currentUser?.id || 'sales-1',
        notes: 'Inbound customer inquiry submitted via website quote calculator.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiAnalysis: {
          score: 88,
          confidence: 94,
          conversionProbability: 82,
          recommendedAction: 'Immediate WebRTC call pick-up; qualify 40-seat deployment.',
          bestTimeToCall: 'Now (Live Inbound Ringing)',
          buyingIntent: 'Very High',
          positiveFactors: [
            { factor: 'Enterprise Seat Volume', impact: 'positive', scoreDelta: 25, detail: '40 seats requested' }
          ],
          negativeFactors: [],
          summary: 'High-intent inbound lead seeking immediate browser softphone deployment.'
        }
      };

    setIncomingCallLead(candidateLead);
  };

  const handleAcceptInboundCall = (lead: Lead) => {
    setIncomingCallLead(null);
    setActiveCallLead(lead);
    ApiClient.updateSalespersonStatus('ON_CALL', `On Live Call with ${lead.name}`, lead.name);
    showToast(`Inbound WebRTC Call Connected with ${lead.name}`);
  };

  const handleDeclineInboundCall = (lead: Lead) => {
    setIncomingCallLead(null);
    const missedCall: CallRecord = {
      id: `CALL-${Date.now().toString().slice(-5)}`,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      salespersonId: currentUser?.id || 'sales-1',
      salespersonName: currentUser?.name || 'Sales Rep',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: 0,
      status: 'Busy',
      outcome: 'Call Later',
      notes: 'Inbound carrier call was rejected / busy routing triggered.',
      createdAt: new Date().toISOString()
    };
    setCalls((prev) => [missedCall, ...prev]);
    ApiClient.logCompletedCall({
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      durationSeconds: 0,
      status: 'Busy',
      outcome: 'Call Later',
      notes: 'Inbound call rejected / busy'
    }).catch(() => {});
    showToast(`Call from ${lead.name} declined (486 Busy recorded)`);
  };

  const handleForwardInboundCall = (lead: Lead, targetSalespersonId: string) => {
    setIncomingCallLead(null);
    const targetSp = users.find((u) => u.id === targetSalespersonId);
    if (!targetSp) return;

    const updatedLead: Lead = {
      ...lead,
      assignedTo: targetSp.id,
      assignedToName: targetSp.name,
      updatedAt: new Date().toISOString()
    };
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? updatedLead : l)));

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: targetSp.id,
      title: 'Inbound Call Forwarded',
      message: `Inbound call from ${lead.name} (${lead.company}) was forwarded to your line.`,
      type: 'lead_assigned',
      read: false,
      createdAt: new Date().toISOString(),
      linkId: lead.id
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Inbound call successfully forwarded to ${targetSp.name}`);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('salescall_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('salescall_current_user', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('salescall_leads', JSON.stringify(leads));
  }, [leads]);
  useEffect(() => {
    localStorage.setItem('salescall_calls', JSON.stringify(calls));
  }, [calls]);
  useEffect(() => {
    localStorage.setItem('salescall_followups', JSON.stringify(followUps));
  }, [followUps]);
  useEffect(() => {
    localStorage.setItem('salescall_notifs', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('salescall_activities', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Role-Based Route Protection Guard
  const handleSelectTab = (tab: NavTab) => {
    if (currentUser?.role === 'salesperson' && (tab === 'reports' || tab === 'users')) {
      showToast('Manager credentials required to access team reports.');
      setActiveTab('dashboard');
      return;
    }
    setActiveTab(tab);
  };

  // Switch persona handler
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Switched persona to ${user.name} (${user.role.toUpperCase()})`);
    if (user.role === 'salesperson' && (activeTab === 'reports' || activeTab === 'users')) {
      setActiveTab('dashboard');
    }
  };

  // Handlers for Leads
  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: currentUser?.id || 'usr-thara',
      userName: currentUser?.name || 'Thara Maps',
      userRole: currentUser?.role || 'manager',
      action: 'Created Lead',
      entityType: 'Lead',
      entityId: newLead.id,
      entityName: newLead.name,
      description: `Created new lead ${newLead.name} (${newLead.company}). AI Score calculated: ${newLead.aiAnalysis?.score || 50}/100.`,
      createdAt: new Date().toISOString()
    };
    setActivityLogs((prev) => [newAct, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: newLead.assignedTo,
      title: 'New Lead Assigned',
      message: `Lead ${newLead.name} (${newLead.company}) has been assigned to you.`,
      type: 'lead_assigned',
      read: false,
      createdAt: new Date().toISOString(),
      linkId: newLead.id
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Lead "${newLead.name}" added and assigned successfully!`);
  };

  const handleImportLeads = (importedLeads: Lead[]) => {
    setLeads((prev) => [...importedLeads, ...prev]);
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: currentUser?.id || 'usr-thara',
      userName: currentUser?.name || 'Manager',
      userRole: 'manager',
      action: 'Imported CSV',
      entityType: 'Lead',
      entityId: 'CSV-BATCH',
      entityName: `${importedLeads.length} leads`,
      description: `Successfully imported and AI-scored ${importedLeads.length} leads from CSV upload.`,
      createdAt: new Date().toISOString()
    };
    setActivityLogs((prev) => [newAct, ...prev]);
    showToast(`Successfully imported ${importedLeads.length} validated leads!`);
  };

  const handleUpdateLead = (updated: Lead) => {
    const freshAnalysis = LocalAIService.scoreLead(updated);
    const enriched = { ...updated, aiAnalysis: freshAnalysis };

    setLeads((prev) => prev.map((l) => (l.id === enriched.id ? enriched : l)));
    if (selectedLeadForDetail?.id === enriched.id) {
      setSelectedLeadForDetail(enriched);
    }
    showToast(`Lead "${enriched.name}" updated.`);
  };

  const handleDeleteLead = (leadId: string) => {
    const target = leads.find((l) => l.id === leadId);
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLeadForDetail?.id === leadId) setSelectedLeadForDetail(null);
    showToast(`Lead "${target?.name || leadId}" removed.`);
  };

  const handleAssignLeads = (leadIds: string[], targetSalespersonId: string) => {
    const targetRep = users.find((u) => u.id === targetSalespersonId);
    if (!targetRep) return;

    // Call real backend assignment API
    ApiClient.assignLead(leadIds, targetSalespersonId).catch((err) => {
      console.warn('Backend assign lead error:', err);
    });

    setLeads((prev) =>
      prev.map((l) =>
        leadIds.includes(l.id)
          ? {
              ...l,
              assignedTo: targetRep.id,
              assignedToName: targetRep.name,
              updatedAt: new Date().toISOString()
            }
          : l
      )
    );

    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: currentUser?.id || 'usr-thara',
      userName: currentUser?.name || 'Manager',
      userRole: 'manager',
      action: 'Reassigned Leads',
      entityType: 'Lead',
      entityId: leadIds.join(','),
      entityName: `${leadIds.length} lead(s)`,
      description: `Assigned ${leadIds.length} lead(s) to ${targetRep.name}.`,
      createdAt: new Date().toISOString()
    };
    setActivityLogs((prev) => [newAct, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: targetRep.id,
      title: `${leadIds.length} Leads Assigned`,
      message: `Manager assigned you ${leadIds.length} lead(s).`,
      type: 'lead_assigned',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(`Assigned ${leadIds.length} lead(s) to ${targetRep.name}!`);
  };

  // Calling & Call Outcome Saving
  const handleStartCall = (lead: Lead) => {
    if (selectedLeadForDetail) setSelectedLeadForDetail(null);
    setActiveCallLead(lead);
    ApiClient.updateSalespersonStatus('ON_CALL', `Dialing ${lead.name}`, lead.name);
  };

  const handleEndAndSaveCall = (
    callRecord: CallRecord,
    newFollowUp?: FollowUp,
    newLeadStatus?: Lead['status']
  ) => {
    setCalls((prev) => [callRecord, ...prev]);

    // Send call to real backend API to store in database and trigger AI intelligence pipeline
    ApiClient.logCompletedCall({
      leadId: callRecord.leadId,
      leadName: callRecord.leadName,
      leadPhone: callRecord.leadPhone,
      durationSeconds: callRecord.durationSeconds,
      status: callRecord.status,
      outcome: callRecord.outcome,
      notes: callRecord.notes,
      transcripts: callRecord.realTimeInsights?.transcripts
    }).catch((err) => console.warn('Backend call logging:', err));

    ApiClient.updateSalespersonStatus('ONLINE', 'Call completed & logged');

    // Update Lead last contacted & status
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === callRecord.leadId) {
          const updated: Lead = {
            ...l,
            lastContactedAt: callRecord.endedAt,
            status: newLeadStatus || l.status,
            updatedAt: new Date().toISOString()
          };
          if (newFollowUp) {
            updated.nextFollowUpAt = `${newFollowUp.scheduledDate}T${newFollowUp.scheduledTime}:00Z`;
          }
          const rescore = LocalAIService.scoreLead(updated);
          return { ...updated, aiAnalysis: rescore };
        }
        return l;
      })
    );

    // Save Follow-up if created
    if (newFollowUp) {
      setFollowUps((prev) => [newFollowUp, ...prev]);
    }

    // Add activity log
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      userId: currentUser?.id || callRecord.salespersonId,
      userName: currentUser?.name || callRecord.salespersonName,
      userRole: currentUser?.role || 'salesperson',
      action: 'Call Logged',
      entityType: 'Call',
      entityId: callRecord.id,
      entityName: callRecord.leadName,
      description: `Logged call with ${callRecord.leadName} (${Math.floor(callRecord.durationSeconds / 60)}m ${callRecord.durationSeconds % 60}s). Outcome: ${callRecord.outcome}.`,
      createdAt: new Date().toISOString()
    };
    setActivityLogs((prev) => [newAct, ...prev]);

    setActiveCallLead(null);
    showToast(`Call record with ${callRecord.leadName} saved with AI analysis!`);
  };

  // Follow-ups Handlers
  const handleScheduleFollowUp = (newFollowUp: FollowUp) => {
    setFollowUps((prev) => [newFollowUp, ...prev]);

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === newFollowUp.leadId) {
          const updated: Lead = {
            ...l,
            nextFollowUpAt: `${newFollowUp.scheduledDate}T${newFollowUp.scheduledTime}:00Z`,
            status: l.status === 'New' ? 'Follow-up' : l.status,
            updatedAt: new Date().toISOString()
          };
          const rescore = LocalAIService.scoreLead(updated);
          return { ...updated, aiAnalysis: rescore };
        }
        return l;
      })
    );

    showToast(`Follow-up scheduled for ${newFollowUp.leadName} on ${newFollowUp.scheduledDate}`);
  };

  const handleUpdateFollowUpStatus = (followUpId: string, newStatus: FollowUp['status']) => {
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUpId ? { ...f, status: newStatus, updatedAt: new Date().toISOString() } : f
      )
    );
    showToast(`Follow-up marked as ${newStatus}`);
  };

  // User Management Handlers
  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    showToast(`Sales representative ${newUser.name} created!`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  // Profile Update
  const handleUpdateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const enriched = { ...currentUser, ...updated };
    setCurrentUser(enriched);
    setUsers((prev) => prev.map((u) => (u.id === enriched.id ? enriched : u)));
  };

  // Notifications read handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const salespeople = users.filter((u) => u.role === 'salesperson');

  // If not logged in, show AuthView
  if (!currentUser) {
    return (
      <AuthView
        allUsers={users}
        onRegisterUser={(newUser) => {
          setUsers((prev) => [newUser, ...prev]);
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
          showToast(`Welcome back, ${user.name}!`);
        }}
      />
    );
  }

  const overdueCount = followUps.filter(
    (f) =>
      (f.status === 'Overdue' ||
        (f.scheduledDate < new Date().toISOString().split('T')[0] && f.status === 'Pending')) &&
      (currentUser.role === 'manager' || f.salespersonId === currentUser.id)
  ).length;

  const userLeadsCount =
    currentUser.role === 'manager'
      ? leads.length
      : leads.filter((l) => l.assignedTo === currentUser.id).length;

  const todayCallsCount = calls.filter((c) =>
    c.createdAt.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 flex flex-col selection:bg-[#00f2ff] selection:text-black">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-lg bg-[#161616] border border-[#00f2ff]/60 text-[#00f2ff] text-xs font-semibold shadow-[0_4px_20px_rgba(0,242,255,0.25)] flex items-center gap-2.5 animate-slideInRight">
          <span className="w-2 h-2 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Top Navbar with Role Switcher & Live Alerts */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        onLogout={() => {
          localStorage.removeItem('salescall_current_user');
          setCurrentUser(null);
          showToast('Signed out successfully');
        }}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        activeCallLeadName={activeCallLead?.name}
        onOpenCallingDrawer={() => {
          if (activeCallLead) setActiveCallLead(activeCallLead);
        }}
        onTriggerInboundCall={handleTriggerInboundCall}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          leadsCount={userLeadsCount}
          overdueFollowUpsCount={overdueCount}
          callsTodayCount={todayCallsCount}
        />

        {/* Center Main Views Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0a0a]">
          {/* Manager Dashboard View */}
          {activeTab === 'dashboard' && currentUser.role === 'manager' && (
            <ManagerDashboard
              leads={leads}
              calls={calls}
              followUps={followUps}
              salespeople={salespeople}
              activityLogs={activityLogs}
              onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
              onOpenAssignModal={(targetLeads) => setAssignModalLeads(targetLeads)}
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onSelectSalespersonDetail={() => handleSelectTab('users')}
            />
          )}

          {/* Salesperson Calling Dashboard View */}
          {activeTab === 'dashboard' && currentUser.role === 'salesperson' && (
            <SalespersonDashboard
              currentUser={currentUser}
              leads={leads}
              calls={calls}
              followUps={followUps}
              onStartCall={handleStartCall}
              onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
              onOpenScheduleFollowUp={(lead) => setScheduleFollowUpLead(lead)}
              onNavigateTab={(tab) => handleSelectTab(tab)}
            />
          )}

          {/* Leads Management View */}
          {activeTab === 'leads' && (
            <LeadManagementView
              leads={leads}
              currentUser={currentUser}
              salespeople={salespeople}
              onOpenAddModal={() => setShowAddLeadModal(true)}
              onOpenImportModal={() => setShowImportModal(true)}
              onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
              onOpenAssignModal={(targetLeads) => setAssignModalLeads(targetLeads)}
              onOpenAiExplainer={(lead) => setAiExplainerLead(lead)}
              onStartCall={handleStartCall}
              onDeleteLead={handleDeleteLead}
            />
          )}

          {/* Call Intelligence & History View */}
          {activeTab === 'calls' && (
            <CallHistoryView
              calls={calls}
              currentUser={currentUser}
              salespeople={salespeople}
            />
          )}

          {/* Follow-ups Cadence View */}
          {activeTab === 'followups' && (
            <FollowUpsView
              followUps={followUps}
              leads={leads}
              currentUser={currentUser}
              onStartCall={handleStartCall}
              onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
              onRescheduleFollowUp={(fu) => {
                const targetLead = leads.find((l) => l.id === fu.leadId);
                if (targetLead) setScheduleFollowUpLead(targetLead);
              }}
            />
          )}

          {/* Daily, Weekly & Monthly Report Analysis View */}
          {activeTab === 'reports' && (
            <ReportsView
              leads={leads}
              calls={calls}
              followUps={followUps}
              salespeople={salespeople}
              currentUser={currentUser}
            />
          )}

          {/* Sales Team Management (Manager only) */}
          {activeTab === 'users' && currentUser.role === 'manager' && (
            <UserManagementView
              users={users}
              leads={leads}
              calls={calls}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {/* Settings & Preferences View */}
          {activeTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

      {/* Active Calling Drawer Screen */}
      {activeCallLead && (
        <CallingDrawer
          lead={activeCallLead}
          currentUser={currentUser}
          allSalespeople={salespeople}
          onEndAndSaveCall={handleEndAndSaveCall}
          onCancelCall={() => {
            setActiveCallLead(null);
            ApiClient.updateSalespersonStatus('ONLINE', 'Ready in queue');
          }}
        />
      )}

      {/* Inbound WebRTC Carrier Call Popup Modal */}
      {incomingCallLead && (
        <IncomingCallModal
          incomingLead={incomingCallLead}
          availableSalespeople={salespeople}
          onAccept={handleAcceptInboundCall}
          onDecline={handleDeclineInboundCall}
          onForward={handleForwardInboundCall}
        />
      )}

      {/* Lead Profile & Details Modal */}
      {selectedLeadForDetail && (
        <LeadDetailModal
          lead={selectedLeadForDetail}
          allUsers={users}
          callHistory={calls}
          followUps={followUps}
          onClose={() => setSelectedLeadForDetail(null)}
          onStartCall={handleStartCall}
          onUpdateLead={handleUpdateLead}
          onOpenScheduleFollowUp={(lead) => setScheduleFollowUpLead(lead)}
          onOpenAiExplainer={(lead) => setAiExplainerLead(lead)}
          currentUserRole={currentUser.role}
        />
      )}

      {/* Lead Assignment Modal */}
      {assignModalLeads && (
        <LeadAssignModal
          leadsToAssign={assignModalLeads}
          salespeople={salespeople}
          allLeads={leads}
          onAssign={handleAssignLeads}
          onClose={() => setAssignModalLeads(null)}
        />
      )}

      {/* Add Lead Form Modal */}
      {showAddLeadModal && (
        <AddLeadModal
          salespeople={salespeople}
          onSave={handleAddLead}
          onClose={() => setShowAddLeadModal(false)}
        />
      )}

      {/* CSV Import Flow Modal */}
      {showImportModal && (
        <ImportCsvModal
          salespeople={salespeople}
          onImport={handleImportLeads}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* AI Score "Why?" Explainer Modal */}
      {aiExplainerLead && (
        <AiScoreExplainerModal
          lead={aiExplainerLead}
          onClose={() => setAiExplainerLead(null)}
        />
      )}

      {/* Schedule Follow-up Modal */}
      {scheduleFollowUpLead && (
        <ScheduleFollowUpModal
          lead={scheduleFollowUpLead}
          currentUser={currentUser}
          onSchedule={handleScheduleFollowUp}
          onClose={() => setScheduleFollowUpLead(null)}
        />
      )}
    </div>
  );
}
