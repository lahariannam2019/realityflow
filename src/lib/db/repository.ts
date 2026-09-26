import { isSupabaseConfigured, supabase } from '../supabase/client';
import {
  Property,
  Enquiry,
  LeadAnalysis,
  PropertyFilterParams,
  LeadFilterParams,
  EnquiryStatus,
  CRMEnquiryStatus,
  PriorityClassification,
  StaffProfile,
  LeadActivity,
  SiteVisit,
  Notification,
  DashboardKPIs,
  ActivityType,
} from '../types';
import {
  getStoreProperties,
  setStoreProperties,
  getStoreEnquiries,
  setStoreEnquiries,
  getStoreAnalyses,
  setStoreAnalyses,
  getStoreActivities,
  setStoreActivities,
  getStoreVisits,
  setStoreVisits,
  getStoreStaff,
  setStoreStaff,
  getStoreNotifications,
  setStoreNotifications,
  clearAllStoreTestRecords,
} from './store';
import {
  emitNewEnquiry,
  emitAnalysisCompleted,
  emitNewNotification,
} from '../realtime/emitter';

// ============================================================================
// PROPERTIES
// ============================================================================

export async function fetchProperties(filters?: PropertyFilterParams): Promise<Property[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('properties').select('*');

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('property_type', filters.type);
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.availability) {
      query = query.eq('availability', filters.availability);
    }
    if (filters?.isPublished !== undefined) {
      query = query.eq('is_published', filters.isPublished);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    if (filters?.sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (filters?.sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching properties from Supabase:', error);
      return getFilteredLocalProperties(filters);
    }
    return data as Property[];
  }

  return getFilteredLocalProperties(filters);
}

function getFilteredLocalProperties(filters?: PropertyFilterParams): Property[] {
  let list = [...getStoreProperties()];

  if (filters?.type && filters.type !== 'all') {
    list = list.filter((p) => p.property_type === filters.type);
  }
  if (filters?.location) {
    const loc = filters.location.toLowerCase();
    list = list.filter((p) => p.location.toLowerCase().includes(loc));
  }
  if (filters?.bedrooms) {
    list = list.filter((p) => (p.bedrooms ?? 0) >= (filters.bedrooms ?? 0));
  }
  if (filters?.minPrice) {
    list = list.filter((p) => p.price >= (filters.minPrice ?? 0));
  }
  if (filters?.maxPrice) {
    list = list.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
  }
  if (filters?.status) {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters?.availability) {
    list = list.filter((p) => p.availability === filters.availability);
  }
  if (filters?.isPublished !== undefined) {
    list = list.filter((p) => p.is_published === filters.isPublished);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.location.toLowerCase().includes(s)
    );
  }

  if (filters?.sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (filters?.sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return list;
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      const fallback = getStoreProperties().find((p) => p.id === id);
      return fallback || null;
    }
    return data as Property;
  }

  return getStoreProperties().find((p) => p.id === id) || null;
}

export async function saveProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
  const newProperty: Property = {
    ...propertyData,
    id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (!error && data) {
      return data as Property;
    }
    console.error('Error creating property in Supabase, using local store:', error);
  }

  const props = getStoreProperties();
  setStoreProperties([newProperty, ...props]);
  return newProperty;
}

export async function updatePropertyById(
  id: string,
  updateData: Partial<Property>
): Promise<Property | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('properties')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      return data as Property;
    }
  }

  const props = getStoreProperties();
  const index = props.findIndex((p) => p.id === id);
  if (index === -1) return null;

  props[index] = {
    ...props[index],
    ...updateData,
    updated_at: new Date().toISOString(),
  };
  setStoreProperties(props);
  return props[index];
}

export async function deletePropertyById(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) return true;
  }

  const props = getStoreProperties();
  const filtered = props.filter((p) => p.id !== id);
  setStoreProperties(filtered);
  return true;
}

// ============================================================================
// STAFF PROFILES
// ============================================================================

export async function fetchStaffProfiles(): Promise<StaffProfile[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as StaffProfile[];
    }
  }

  return getStoreStaff();
}

export async function fetchStaffProfileById(id: string): Promise<StaffProfile | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return data as StaffProfile;
    }
  }

  return getStoreStaff().find((s) => s.id === id) || null;
}

// ============================================================================
// LEAD ACTIVITIES & AUDIT TRAIL
// ============================================================================

export async function addLeadActivity(activityData: {
  enquiry_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string | null;
  staff_id?: string | null;
  metadata?: Record<string, any>;
}): Promise<LeadActivity> {
  const newActivity: LeadActivity = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    organization_id: 'org_urbannest_default',
    enquiry_id: activityData.enquiry_id,
    staff_id: activityData.staff_id || null,
    activity_type: activityData.activity_type,
    title: activityData.title,
    description: activityData.description || null,
    metadata: activityData.metadata || {},
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('lead_activities')
      .insert([
        {
          enquiry_id: newActivity.enquiry_id,
          staff_id: newActivity.staff_id,
          activity_type: newActivity.activity_type,
          title: newActivity.title,
          description: newActivity.description,
          metadata: newActivity.metadata,
        },
      ])
      .select('*, staff_profiles(*)')
      .single();

    if (!error && data) {
      return {
        ...data,
        staff: data.staff_profiles || null,
      } as LeadActivity;
    }
  }

  // Populate staff profile for local store
  if (newActivity.staff_id) {
    newActivity.staff = getStoreStaff().find((s) => s.id === newActivity.staff_id) || null;
  }

  const activities = getStoreActivities();
  setStoreActivities([newActivity, ...activities]);
  return newActivity;
}

export async function fetchLeadActivities(enquiryId: string): Promise<LeadActivity[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*, staff_profiles(*)')
      .eq('enquiry_id', enquiryId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((item: any) => ({
        ...item,
        staff: item.staff_profiles || null,
      })) as LeadActivity[];
    }
  }

  const staffList = getStoreStaff();
  return getStoreActivities()
    .filter((a) => a.enquiry_id === enquiryId)
    .map((a) => ({
      ...a,
      staff: a.staff || (a.staff_id ? staffList.find((s) => s.id === a.staff_id) || null : null),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ============================================================================
// SITE VISITS
// ============================================================================

export async function createSiteVisit(visitData: {
  enquiry_id: string;
  property_id: string;
  scheduled_at: string;
  assigned_staff_id?: string | null;
  visitor_notes?: string | null;
  status?: SiteVisit['status'];
}): Promise<SiteVisit> {
  const newVisit: SiteVisit = {
    id: `sv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    organization_id: 'org_urbannest_default',
    enquiry_id: visitData.enquiry_id,
    property_id: visitData.property_id,
    assigned_staff_id: visitData.assigned_staff_id || null,
    scheduled_at: visitData.scheduled_at,
    status: visitData.status || 'SCHEDULED',
    visitor_notes: visitData.visitor_notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('site_visits')
      .insert([
        {
          enquiry_id: newVisit.enquiry_id,
          property_id: newVisit.property_id,
          assigned_staff_id: newVisit.assigned_staff_id,
          scheduled_at: newVisit.scheduled_at,
          status: newVisit.status,
          visitor_notes: newVisit.visitor_notes,
        },
      ])
      .select('*, properties(*), staff_profiles(*)')
      .single();

    if (!error && data) {
      // Auto-update lead status to SITE_VISIT_SCHEDULED
      await updateCRMLeadStatus(visitData.enquiry_id, 'SITE_VISIT_SCHEDULED', {
        staffId: visitData.assigned_staff_id || undefined,
      });

      // Log activity
      await addLeadActivity({
        enquiry_id: visitData.enquiry_id,
        staff_id: visitData.assigned_staff_id || null,
        activity_type: 'visit_scheduled',
        title: `Site visit scheduled for ${new Date(visitData.scheduled_at).toLocaleDateString()} at ${new Date(visitData.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        description: visitData.visitor_notes,
      });

      // Notification
      if (visitData.assigned_staff_id) {
        await createNotification({
          type: 'site_visit_reminder',
          staff_id: visitData.assigned_staff_id,
          title: 'Site Visit Scheduled',
          message: `Site visit scheduled for ${new Date(visitData.scheduled_at).toLocaleString()}`,
          link_url: `/dashboard/leads/${visitData.enquiry_id}`,
        });
      }

      return {
        ...data,
        property: data.properties || null,
        assigned_staff: data.staff_profiles || null,
      } as SiteVisit;
    }
  }

  // Local store path
  const props = getStoreProperties();
  const staff = getStoreStaff();
  newVisit.property = props.find((p) => p.id === newVisit.property_id) || null;
  newVisit.assigned_staff = staff.find((s) => s.id === newVisit.assigned_staff_id) || null;

  const visits = getStoreVisits();
  setStoreVisits([newVisit, ...visits]);

  // Auto-update lead status in local store
  await updateCRMLeadStatus(visitData.enquiry_id, 'SITE_VISIT_SCHEDULED', {
    staffId: visitData.assigned_staff_id || undefined,
  });

  // Log activity
  await addLeadActivity({
    enquiry_id: visitData.enquiry_id,
    staff_id: visitData.assigned_staff_id || null,
    activity_type: 'visit_scheduled',
    title: `Site visit scheduled for ${new Date(visitData.scheduled_at).toLocaleDateString()} at ${new Date(visitData.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    description: visitData.visitor_notes,
  });

  // Notification
  if (visitData.assigned_staff_id) {
    await createNotification({
      type: 'site_visit_reminder',
      staff_id: visitData.assigned_staff_id,
      title: 'Site Visit Scheduled',
      message: `Site visit scheduled for ${new Date(visitData.scheduled_at).toLocaleString()}`,
      link_url: `/dashboard/leads/${visitData.enquiry_id}`,
    });
  }

  return newVisit;
}

export async function fetchSiteVisits(filters?: {
  enquiry_id?: string;
  staff_id?: string;
  status?: string;
  date?: string;
}): Promise<SiteVisit[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('site_visits')
      .select('*, properties(*), staff_profiles(*)')
      .order('scheduled_at', { ascending: true });

    if (filters?.enquiry_id) {
      query = query.eq('enquiry_id', filters.enquiry_id);
    }
    if (filters?.staff_id) {
      query = query.eq('assigned_staff_id', filters.staff_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data.map((item: any) => ({
        ...item,
        property: item.properties || null,
        assigned_staff: item.staff_profiles || null,
      })) as SiteVisit[];
    }
  }

  const props = getStoreProperties();
  const staff = getStoreStaff();
  let list = getStoreVisits().map((v) => ({
    ...v,
    property: v.property || props.find((p) => p.id === v.property_id) || null,
    assigned_staff: v.assigned_staff || staff.find((s) => s.id === v.assigned_staff_id) || null,
  }));

  if (filters?.enquiry_id) {
    list = list.filter((v) => v.enquiry_id === filters.enquiry_id);
  }
  if (filters?.staff_id) {
    list = list.filter((v) => v.assigned_staff_id === filters.staff_id);
  }
  if (filters?.status) {
    list = list.filter((v) => v.status === filters.status);
  }

  return list.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
}

export async function updateSiteVisit(
  id: string,
  updates: Partial<SiteVisit>,
  actorStaffId?: string
): Promise<SiteVisit | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('site_visits')
      .update({ ...updates, updated_at: now })
      .eq('id', id)
      .select('*, properties(*), staff_profiles(*)')
      .single();

    if (!error && data) {
      if (updates.status === 'COMPLETED') {
        await updateCRMLeadStatus(data.enquiry_id, 'SITE_VISIT_COMPLETED', {
          staffId: actorStaffId,
        });
        await addLeadActivity({
          enquiry_id: data.enquiry_id,
          staff_id: actorStaffId || data.assigned_staff_id,
          activity_type: 'visit_completed',
          title: 'Site visit completed',
          description: updates.feedback || updates.visitor_notes || null,
          metadata: { rating: updates.rating },
        });
      }
      return {
        ...data,
        property: data.properties || null,
        assigned_staff: data.staff_profiles || null,
      } as SiteVisit;
    }
  }

  const visits = getStoreVisits();
  const index = visits.findIndex((v) => v.id === id);
  if (index === -1) return null;

  visits[index] = {
    ...visits[index],
    ...updates,
    updated_at: now,
  };
  setStoreVisits(visits);

  if (updates.status === 'COMPLETED') {
    await updateCRMLeadStatus(visits[index].enquiry_id, 'SITE_VISIT_COMPLETED', {
      staffId: actorStaffId,
    });
    await addLeadActivity({
      enquiry_id: visits[index].enquiry_id,
      staff_id: actorStaffId || visits[index].assigned_staff_id,
      activity_type: 'visit_completed',
      title: 'Site visit completed',
      description: updates.feedback || updates.visitor_notes || null,
      metadata: { rating: updates.rating },
    });
  }

  return visits[index];
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(notifData: {
  type: Notification['type'];
  title: string;
  message: string;
  staff_id?: string | null;
  link_url?: string | null;
}): Promise<Notification> {
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    organization_id: 'org_urbannest_default',
    staff_id: notifData.staff_id || null,
    type: notifData.type,
    title: notifData.title,
    message: notifData.message,
    link_url: notifData.link_url || null,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          staff_id: newNotif.staff_id,
          type: newNotif.type,
          title: newNotif.title,
          message: newNotif.message,
          link_url: newNotif.link_url,
          is_read: false,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      const saved = data as Notification;
      emitNewNotification(saved);
      return saved;
    }
  }

  const notifs = getStoreNotifications();
  setStoreNotifications([newNotif, ...notifs]);
  emitNewNotification(newNotif);
  return newNotif;
}

export async function fetchNotifications(staffId?: string): Promise<Notification[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (staffId) {
      query = query.or(`staff_id.eq.${staffId},staff_id.is.null`);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as Notification[];
    }
  }

  let list = getStoreNotifications();
  if (staffId) {
    list = list.filter((n) => !n.staff_id || n.staff_id === staffId);
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) return true;
  }

  const notifs = getStoreNotifications();
  const idx = notifs.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notifs[idx].is_read = true;
    setStoreNotifications(notifs);
    return true;
  }
  return false;
}

// ============================================================================
// ENQUIRIES & LEADS (CRM CORE)
// ============================================================================

export async function createNewEnquiry(enquiryData: {
  property_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  stated_budget?: string | null;
  stated_location?: string | null;
  source?: 'property_page' | 'contact_form' | 'direct' | 'website';
}): Promise<Enquiry> {
  const newEnquiry: Enquiry = {
    id: `enq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    organization_id: 'org_urbannest_default',
    property_id: enquiryData.property_id || null,
    name: enquiryData.name,
    phone: enquiryData.phone,
    email: enquiryData.email || null,
    message: enquiryData.message,
    stated_budget: enquiryData.stated_budget || null,
    stated_location: enquiryData.stated_location || null,
    source: enquiryData.source || 'property_page',
    status: 'NEW',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('enquiries')
      .insert([
        {
          property_id: newEnquiry.property_id,
          name: newEnquiry.name,
          phone: newEnquiry.phone,
          email: newEnquiry.email,
          message: newEnquiry.message,
          stated_budget: newEnquiry.stated_budget,
          stated_location: newEnquiry.stated_location,
          source: newEnquiry.source,
          status: 'NEW',
        },
      ])
      .select()
      .single();

    if (!error && data) {
      // Auto-log creation activity
      await addLeadActivity({
        enquiry_id: data.id,
        activity_type: 'status_changed',
        title: 'Lead captured',
        description: `Enquiry received via ${newEnquiry.source.replace('_', ' ')}`,
      });
      const saved = data as Enquiry;
      emitNewEnquiry(saved);
      return saved;
    }
    console.error('Error inserting enquiry in Supabase, using local store:', error);
  }

  const enquiries = getStoreEnquiries();
  setStoreEnquiries([newEnquiry, ...enquiries]);

  // Auto-log creation activity in store
  await addLeadActivity({
    enquiry_id: newEnquiry.id,
    activity_type: 'status_changed',
    title: 'Lead captured',
    description: `Enquiry received via ${newEnquiry.source.replace('_', ' ')}`,
  });

  emitNewEnquiry(newEnquiry);
  return newEnquiry;
}

export async function fetchEnquiries(filters?: LeadFilterParams): Promise<Enquiry[]> {
  let list: Enquiry[] = [];

  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('enquiries')
      .select('*, properties(*), lead_analysis(*), staff_profiles!assigned_to(*)')
      .order('created_at', { ascending: false });

    if (filters?.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }

    const { data, error } = await query;
    if (!error && data) {
      list = data.map((item: any) => ({
        ...item,
        property: item.properties,
        lead_analysis: item.lead_analysis?.[0] || item.lead_analysis || null,
        assigned_staff: item.staff_profiles || null,
      }));
    } else {
      list = getStoreEnquiries();
    }
  } else {
    list = getStoreEnquiries();
  }

  // Populate linked property & staff from store if missing
  const allProps = getStoreProperties();
  const allStaff = getStoreStaff();
  list = list.map((e) => {
    let prop = e.property;
    if (!prop && e.property_id) {
      prop = allProps.find((item) => item.id === e.property_id) || null;
    }
    let staff = e.assigned_staff;
    if (!staff && e.assigned_to) {
      staff = allStaff.find((s) => s.id === e.assigned_to) || null;
    }
    return { ...e, property: prop, assigned_staff: staff };
  });

  // Join lead_analysis from store if not already joined
  const allAnalyses = getStoreAnalyses();
  list = list.map((e) => {
    if (!e.lead_analysis) {
      const la = allAnalyses.find((a) => a.enquiry_id === e.id);
      return { ...e, lead_analysis: la || null };
    }
    return e;
  });

  // Filter by lead status (support both CRM uppercase and legacy lowercase)
  if (filters?.status && filters.status !== 'all') {
    const targetStatus = filters.status.toUpperCase();
    list = list.filter((e) => {
      const cur = (e.status || '').toUpperCase();
      return cur === targetStatus || e.status === filters.status;
    });
  }

  // Filter by salesperson assignment
  if (filters?.assignedTo && filters.assignedTo !== 'all') {
    if (filters.assignedTo === 'unassigned') {
      list = list.filter((e) => !e.assigned_to);
    } else {
      list = list.filter((e) => e.assigned_to === filters.assignedTo);
    }
  }

  // Filter by follow-up timing
  if (filters?.followUpDue && filters.followUpDue !== 'all') {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

    list = list.filter((e) => {
      if (!e.next_follow_up_at) return false;
      const followTime = new Date(e.next_follow_up_at).getTime();

      if (filters.followUpDue === 'overdue') {
        return followTime < now.getTime() && e.status !== 'WON' && e.status !== 'LOST';
      }
      if (filters.followUpDue === 'today') {
        return followTime >= startOfToday && followTime < endOfToday;
      }
      if (filters.followUpDue === 'upcoming') {
        return followTime >= endOfToday;
      }
      return true;
    });
  }

  // Filter by priority classification
  if (filters?.priority && filters.priority !== 'all') {
    list = list.filter((e) => e.lead_analysis?.classification === filters.priority);
  }

  // Search filter
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.phone.toLowerCase().includes(s) ||
        (e.email && e.email.toLowerCase().includes(s)) ||
        (e.property && e.property.title.toLowerCase().includes(s)) ||
        (e.lead_analysis?.summary && e.lead_analysis.summary.toLowerCase().includes(s))
    );
  }

  // Priority Sorting:
  // 1. HIGH leads, newest first
  // 2. MEDIUM leads, newest first
  // 3. LOW leads, newest first
  // 4. Pending / unanalyzed leads
  const priorityWeight = (classification?: PriorityClassification | null): number => {
    if (classification === 'HIGH') return 3;
    if (classification === 'MEDIUM') return 2;
    if (classification === 'LOW') return 1;
    return 0;
  };

  return list.sort((a, b) => {
    const weightA = priorityWeight(a.lead_analysis?.classification);
    const weightB = priorityWeight(b.lead_analysis?.classification);

    if (weightA !== weightB) {
      return weightB - weightA;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function fetchEnquiryById(id: string): Promise<Enquiry | null> {
  const enquiries = await fetchEnquiries();
  const enq = enquiries.find((e) => e.id === id);
  if (!enq) return null;

  // Enrich with activities and visits
  const [activities, visits] = await Promise.all([
    fetchLeadActivities(id),
    fetchSiteVisits({ enquiry_id: id }),
  ]);

  return {
    ...enq,
    activities,
    visits,
  };
}

// Backward-compatible alias for existing callers
export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry | null> {
  return updateCRMLeadStatus(id, status);
}

export async function updateCRMLeadStatus(
  id: string,
  status: EnquiryStatus,
  options?: {
    lost_reason?: string;
    deal_value?: number;
    staffId?: string;
    staffName?: string;
  }
): Promise<Enquiry | null> {
  const normalizedStatus = status.toUpperCase() as CRMEnquiryStatus;
  const updates: any = {
    status: normalizedStatus,
    updated_at: new Date().toISOString(),
  };

  if (options?.lost_reason !== undefined) {
    updates.lost_reason = options.lost_reason;
  }
  if (options?.deal_value !== undefined) {
    updates.deal_value = options.deal_value;
  }

  let updatedEnq: Enquiry | null = null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', id)
      .select('*, properties(*), lead_analysis(*)')
      .single();

    if (!error && data) {
      updatedEnq = {
        ...data,
        property: data.properties,
        lead_analysis: data.lead_analysis?.[0] || data.lead_analysis || null,
      } as Enquiry;
    }
  }

  if (!updatedEnq) {
    const enquiries = getStoreEnquiries();
    const index = enquiries.findIndex((e) => e.id === id);
    if (index !== -1) {
      enquiries[index] = {
        ...enquiries[index],
        ...updates,
      };
      setStoreEnquiries(enquiries);
      updatedEnq = enquiries[index];
    }
  }

  // Log status change activity
  let noteDesc = options?.lost_reason ? `Reason: ${options.lost_reason}` : undefined;
  if (options?.deal_value) {
    noteDesc = noteDesc ? `${noteDesc} | Deal value: ₹${options.deal_value.toLocaleString('en-IN')}` : `Deal value: ₹${options.deal_value.toLocaleString('en-IN')}`;
  }

  await addLeadActivity({
    enquiry_id: id,
    staff_id: options?.staffId || null,
    activity_type: 'status_changed',
    title: `Stage updated to ${normalizedStatus.replace(/_/g, ' ')}`,
    description: noteDesc,
  });

  return updatedEnq;
}

export async function assignLead(
  enquiryId: string,
  staffId: string | null,
  assignerStaffId?: string
): Promise<Enquiry | null> {
  const staff = staffId ? await fetchStaffProfileById(staffId) : null;
  const staffName = staff ? staff.full_name : 'Unassigned';
  const now = new Date().toISOString();

  const updates: any = {
    assigned_to: staffId || null,
    assigned_at: staffId ? now : null,
  };

  let updatedEnq: Enquiry | null = null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', enquiryId)
      .select('*, properties(*), lead_analysis(*), staff_profiles!assigned_to(*)')
      .single();

    if (!error && data) {
      updatedEnq = {
        ...data,
        property: data.properties,
        lead_analysis: data.lead_analysis?.[0] || data.lead_analysis || null,
        assigned_staff: data.staff_profiles || null,
      } as Enquiry;
    }
  }

  if (!updatedEnq) {
    const enquiries = getStoreEnquiries();
    const index = enquiries.findIndex((e) => e.id === enquiryId);
    if (index !== -1) {
      enquiries[index] = {
        ...enquiries[index],
        ...updates,
        assigned_staff: staff,
      };
      setStoreEnquiries(enquiries);
      updatedEnq = enquiries[index];
    }
  }

  // Log assignment activity
  await addLeadActivity({
    enquiry_id: enquiryId,
    staff_id: assignerStaffId || null,
    activity_type: 'assigned',
    title: staffId ? `Assigned to ${staffName}` : 'Lead unassigned',
    description: staffId ? `Salesperson ${staffName} assigned to manage this lead.` : 'Salesperson unassigned.',
  });

  // Send notification to assigned agent
  if (staffId && updatedEnq) {
    await createNotification({
      type: 'lead_assigned',
      staff_id: staffId,
      title: 'New Lead Assigned',
      message: `Lead ${updatedEnq.name} has been assigned to you.`,
      link_url: `/dashboard/leads/${enquiryId}`,
    });
  }

  return updatedEnq;
}

export async function setFollowUpDate(
  enquiryId: string,
  followUpAt: string | null,
  options?: { staffId?: string; notes?: string }
): Promise<Enquiry | null> {
  const updates: any = {
    next_follow_up_at: followUpAt || null,
  };

  let updatedEnq: Enquiry | null = null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', enquiryId)
      .select('*, properties(*), lead_analysis(*)')
      .single();

    if (!error && data) {
      updatedEnq = {
        ...data,
        property: data.properties,
        lead_analysis: data.lead_analysis?.[0] || data.lead_analysis || null,
      } as Enquiry;
    }
  }

  if (!updatedEnq) {
    const enquiries = getStoreEnquiries();
    const index = enquiries.findIndex((e) => e.id === enquiryId);
    if (index !== -1) {
      enquiries[index] = {
        ...enquiries[index],
        ...updates,
      };
      setStoreEnquiries(enquiries);
      updatedEnq = enquiries[index];
    }
  }

  // Log activity
  await addLeadActivity({
    enquiry_id: enquiryId,
    staff_id: options?.staffId || null,
    activity_type: 'followup_set',
    title: followUpAt
      ? `Follow-up set for ${new Date(followUpAt).toLocaleDateString()} at ${new Date(followUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : 'Follow-up cleared',
    description: options?.notes || null,
  });

  return updatedEnq;
}

export async function logContactAction(
  enquiryId: string,
  actionType: 'call_logged' | 'whatsapp_sent' | 'email_sent',
  details: {
    title: string;
    description?: string;
    outcome?: string;
    staffId?: string;
    metadata?: Record<string, any>;
  }
): Promise<Enquiry | null> {
  const now = new Date().toISOString();
  const enq = await fetchEnquiryById(enquiryId);
  if (!enq) return null;

  // Auto-advance status from NEW to CONTACTED if first contact
  const currentStatus = (enq.status || '').toUpperCase();
  const nextStatus = currentStatus === 'NEW' ? 'CONTACTED' : enq.status;

  const updates: any = {
    last_contacted_at: now,
    status: nextStatus,
  };

  let updatedEnq: Enquiry | null = null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', enquiryId)
      .select('*, properties(*), lead_analysis(*)')
      .single();

    if (!error && data) {
      updatedEnq = {
        ...data,
        property: data.properties,
        lead_analysis: data.lead_analysis?.[0] || data.lead_analysis || null,
      } as Enquiry;
    }
  }

  if (!updatedEnq) {
    const enquiries = getStoreEnquiries();
    const index = enquiries.findIndex((e) => e.id === enquiryId);
    if (index !== -1) {
      enquiries[index] = {
        ...enquiries[index],
        ...updates,
      };
      setStoreEnquiries(enquiries);
      updatedEnq = enquiries[index];
    }
  }

  // Log contact activity
  await addLeadActivity({
    enquiry_id: enquiryId,
    staff_id: details.staffId || null,
    activity_type: actionType,
    title: details.title,
    description: details.description || (details.outcome ? `Outcome: ${details.outcome}` : null),
    metadata: {
      ...details.metadata,
      outcome: details.outcome,
    },
  });

  return updatedEnq;
}

// ============================================================================
// LEAD ANALYSIS REPOSITORY METHODS
// ============================================================================

export async function saveLeadAnalysis(
  analysisData: Partial<LeadAnalysis> & { enquiry_id: string }
): Promise<LeadAnalysis> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('lead_analysis')
      .upsert(
        {
          enquiry_id: analysisData.enquiry_id,
          extracted_budget: analysisData.extracted_budget ?? null,
          extracted_location: analysisData.extracted_location ?? null,
          extracted_property_type: analysisData.extracted_property_type ?? null,
          extracted_bhk: analysisData.extracted_bhk ?? null,
          extracted_timeline: analysisData.extracted_timeline ?? null,
          extracted_requirements: analysisData.extracted_requirements ?? [],
          visit_intent: Boolean(analysisData.visit_intent),
          visit_intent_detail: analysisData.visit_intent_detail ?? null,
          classification: analysisData.classification ?? null,
          classification_reason: analysisData.classification_reason ?? null,
          signals: analysisData.signals ?? {},
          summary: analysisData.summary ?? null,
          score: analysisData.score ?? null,
          analysis_version: analysisData.analysis_version ?? 'phase2-v1',
          analysis_status: analysisData.analysis_status ?? 'completed',
          raw_ai_response: analysisData.raw_ai_response ?? null,
          last_error: analysisData.last_error ?? null,
          analyzed_at: analysisData.analyzed_at ?? now,
        },
        { onConflict: 'enquiry_id' }
      )
      .select()
      .single();

    if (!error && data) {
      // Trigger notification if HIGH lead
      if (analysisData.classification === 'HIGH') {
        await createNotification({
          type: 'new_high_lead',
          title: '🔥 High-Intent Lead Detected',
          message: `${analysisData.summary || 'A new high priority lead has been analyzed.'}`,
          link_url: `/dashboard/leads/${analysisData.enquiry_id}`,
        });
      }
      const saved = data as LeadAnalysis;
      if (analysisData.analysis_status === 'completed' || !analysisData.analysis_status) {
        emitAnalysisCompleted(saved);
      }
      return saved;
    }
    console.error('Error saving lead_analysis in Supabase, using local store:', error);
  }

  const analyses = getStoreAnalyses();
  const existingIdx = analyses.findIndex((a) => a.enquiry_id === analysisData.enquiry_id);

  const updatedRecord: LeadAnalysis = {
    id: existingIdx !== -1 ? analyses[existingIdx].id : `la-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    enquiry_id: analysisData.enquiry_id,
    extracted_budget: analysisData.extracted_budget ?? null,
    extracted_location: analysisData.extracted_location ?? null,
    extracted_property_type: analysisData.extracted_property_type ?? null,
    extracted_bhk: analysisData.extracted_bhk ?? null,
    extracted_timeline: analysisData.extracted_timeline ?? null,
    extracted_requirements: analysisData.extracted_requirements ?? [],
    visit_intent: Boolean(analysisData.visit_intent),
    visit_intent_detail: analysisData.visit_intent_detail ?? null,
    classification: analysisData.classification ?? null,
    classification_reason: analysisData.classification_reason ?? null,
    signals: analysisData.signals ?? null,
    summary: analysisData.summary ?? null,
    score: analysisData.score ?? null,
    analysis_version: analysisData.analysis_version ?? 'phase2-v1',
    analysis_status: analysisData.analysis_status ?? 'completed',
    ai_provider: analysisData.ai_provider ?? 'deterministic-fallback',
    ai_model: analysisData.ai_model ?? 'rule-based-nlp-v2',
    raw_ai_response: analysisData.raw_ai_response ?? null,
    last_error: analysisData.last_error ?? null,
    analyzed_at: analysisData.analyzed_at ?? now,
    created_at: existingIdx !== -1 ? analyses[existingIdx].created_at : now,
  };

  if (existingIdx !== -1) {
    analyses[existingIdx] = updatedRecord;
  } else {
    analyses.unshift(updatedRecord);
  }
  setStoreAnalyses(analyses);

  // Update in-memory enquiry join as well
  const enquiries = getStoreEnquiries();
  const enqIdx = enquiries.findIndex((e) => e.id === analysisData.enquiry_id);
  if (enqIdx !== -1) {
    enquiries[enqIdx].lead_analysis = updatedRecord;
    setStoreEnquiries(enquiries);
  }

  // Trigger notification if HIGH lead
  if (analysisData.classification === 'HIGH') {
    await createNotification({
      type: 'new_high_lead',
      title: '🔥 High-Intent Lead Detected',
      message: `${analysisData.summary || 'A new high priority lead has been analyzed.'}`,
      link_url: `/dashboard/leads/${analysisData.enquiry_id}`,
    });
  }

  if (analysisData.analysis_status === 'completed' || !analysisData.analysis_status) {
    emitAnalysisCompleted(updatedRecord);
  }
  return updatedRecord;
}

export async function resetToCleanProductionState(): Promise<{ deleted: boolean; message: string }> {
  clearAllStoreTestRecords();

  if (isSupabaseConfigured && supabase) {
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('site_visits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_analysis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('enquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  return { deleted: true, message: 'All test and temporary records cleaned.' };
}

export async function fetchLeadAnalysisByEnquiryId(enquiryId: string): Promise<LeadAnalysis | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('lead_analysis')
      .select('*')
      .eq('enquiry_id', enquiryId)
      .maybeSingle();

    if (!error && data) {
      return data as LeadAnalysis;
    }
  }

  const analyses = getStoreAnalyses();
  return analyses.find((a) => a.enquiry_id === enquiryId) || null;
}

// ============================================================================
// DASHBOARD OPERATIONAL KPIS
// ============================================================================

export async function fetchDashboardKPIs(staffId?: string): Promise<DashboardKPIs> {
  const enquiries = await fetchEnquiries(staffId ? { assignedTo: staffId } : undefined);
  const siteVisits = await fetchSiteVisits(staffId ? { staff_id: staffId } : undefined);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  let todayLeads = 0;
  let highPriority = 0;
  let mediumPriority = 0;
  let lowPriority = 0;
  let followUpsDueToday = 0;
  let followUpsOverdue = 0;

  const statusBreakdown: Record<string, number> = {
    NEW: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    SITE_VISIT_SCHEDULED: 0,
    SITE_VISIT_COMPLETED: 0,
    NEGOTIATION: 0,
    WON: 0,
    LOST: 0,
  };

  const sourceBreakdown: Record<string, number> = {};

  for (const enq of enquiries) {
    // Lead created today
    const createdTime = new Date(enq.created_at).getTime();
    if (createdTime >= startOfToday && createdTime < endOfToday) {
      todayLeads++;
    }

    // Priority
    const classification = enq.lead_analysis?.classification;
    if (classification === 'HIGH') highPriority++;
    else if (classification === 'MEDIUM') mediumPriority++;
    else if (classification === 'LOW') lowPriority++;

    // Follow-ups
    if (enq.next_follow_up_at && enq.status !== 'WON' && enq.status !== 'LOST') {
      const followTime = new Date(enq.next_follow_up_at).getTime();
      if (followTime < now.getTime()) {
        followUpsOverdue++;
      } else if (followTime >= startOfToday && followTime < endOfToday) {
        followUpsDueToday++;
      }
    }

    // Status breakdown (normalize)
    const st = (enq.status || 'NEW').toUpperCase();
    if (statusBreakdown[st] !== undefined) {
      statusBreakdown[st]++;
    } else {
      statusBreakdown[st] = 1;
    }

    // Source breakdown
    const src = enq.source || 'website';
    sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
  }

  // Today's site visits
  let todayVisits = 0;
  for (const v of siteVisits) {
    const vTime = new Date(v.scheduled_at).getTime();
    if (vTime >= startOfToday && vTime < endOfToday && v.status !== 'CANCELLED') {
      todayVisits++;
    }
  }

  return {
    totalLeads: enquiries.length,
    todayLeads,
    highPriority,
    mediumPriority,
    lowPriority,
    followUpsDueToday,
    followUpsOverdue,
    todayVisits,
    statusBreakdown,
    sourceBreakdown,
  };
}
