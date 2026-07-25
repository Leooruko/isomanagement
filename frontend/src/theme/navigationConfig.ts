import {
  Dashboard,
  Description,
  Security,
  Assignment,
  Timeline,
  People,
  Settings,
  Business,
  Assessment,
  School,
  Build,
  VerifiedUser,
  ReportProblem,
  SupportAgent,
  Flag,
  Science,
  Analytics,
} from '@mui/icons-material';

// Navigation item interface
export interface NavigationItem {
  readonly text: string;
  readonly path: string;
  readonly icon?: React.ComponentType<any>;
  readonly badge?: number;
  readonly disabled?: boolean;
  readonly comingSoon?: boolean;
}

// Navigation section interface
export interface NavigationSection {
  readonly title: string;
  readonly icon: React.ComponentType<any>;
  readonly items: readonly NavigationItem[];
  readonly requiredRoles?: string[];
  readonly requiredPermissions?: string[];
  readonly order: number;
  readonly allowAssignmentAccess?: boolean;
  readonly assignmentAllowedItems?: readonly string[];
}

// Demo mode: when enabled, the primary navigation is trimmed to Dashboard,
// Document Control, HACCP, and an Administration group (Users, Roles,
// Permissions, Departments). Nothing else is deleted or disabled — every
// hidden section's routes, components, and backend APIs keep working
// exactly as before and remain reachable by direct URL. This flag only
// affects what getNavigationForUser() returns for the sidebar.
// Toggle by setting REACT_APP_DEMO_MODE=true at build time (defaults to
// off, so existing/full deployments are unaffected unless opted in).
export const isDemoModeEnabled = (): boolean =>
  (process.env.REACT_APP_DEMO_MODE || 'false').toLowerCase() === 'true';

// Section keys (matching NAVIGATION_CONFIG's keys below) kept visible when
// demo mode is enabled. 'users' is displayed as "Administration" (see
// NAVIGATION_CONFIG.users below) and holds Users/Roles/Permissions/
// Departments. 'settings' (System Settings) is intentionally excluded from
// the demo nav — it is not part of the demo's Administration group, but its
// route/page are untouched and still reachable directly at /settings.
const DEMO_MODE_VISIBLE_SECTIONS: readonly string[] = [
  'dashboard',
  'documents',
  'haccp',
  'users',
];

// COMPACT Navigation configuration - Reduced spacing and optimized layout
export const NAVIGATION_CONFIG: Record<string, NavigationSection> = {
  dashboard: {
    title: 'Dashboard',
    icon: Dashboard,
    order: 1,
    items: [
      { text: 'Overview', path: '/dashboard' },
    ],
  },
  
  documents: {
    title: 'Document Control',
    icon: Description,
    order: 2,
    items: [
      { text: 'Document Register', path: '/documents' },
      { text: 'PRPs', path: '/documents?group=prps' },
      { text: 'Technical Documents', path: '/documents?group=technical' },
      { text: 'Manuals & Policies', path: '/documents?group=manuals_policies' },
    ],
  },
  
  haccp: {
    title: 'HACCP System',
    icon: Security,
    order: 3,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Production Manager', 'Production Operator', 'System Administrator', 'HACCP Logger'],
    requiredPermissions: ['haccp:view'],
    allowAssignmentAccess: true,
    assignmentAllowedItems: ['/haccp'],
    items: [
      { text: 'HACCP Plans', path: '/haccp' },
      { text: 'Monitoring', path: '/haccp/monitoring' },
      { text: 'Verification', path: '/haccp/verification' },
      { text: 'Records', path: '/haccp/verification-records' },
      { text: 'Risk Thresholds', path: '/haccp/risk-thresholds' },
    ],
  },
  
  prp: {
    title: 'PRP Programs',
    icon: Assignment,
    order: 4,
    requiredRoles: ['Production Manager', 'Production Operator', 'Maintenance Manager', 'Maintenance Technician', 'System Administrator'],
    items: [
      { text: 'PRP Overview', path: '/prp' },
    ],
  },
  
  production: {
    title: 'Production Management',
    icon: Science,
    order: 5,
    requiredRoles: ['Production Manager', 'Production Operator', 'QA Manager', 'QA Specialist', 'System Administrator'],
    items: [
      { text: 'Production Overview', path: '/production' },
      { text: 'Process Monitoring', path: '/production/monitoring' },
      { text: 'Yield Analysis', path: '/production/yield' },
    ],
  },
  
  suppliers: {
    title: 'Supplier Management',
    icon: Business,
    order: 6,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Production Manager', 'System Administrator'],
    items: [
      { text: 'Suppliers', path: '/suppliers' },
      // Evaluation and Approved remain accessible via redirects but hidden from the menu
      // Supplier Audits hidden until implemented
    ],
  },
  
  traceability: {
    title: 'Traceability',
    icon: Timeline,
    order: 7,
    requiredRoles: ['Production Manager', 'Production Operator', 'QA Manager', 'QA Specialist', 'System Administrator'],
    items: [
      { text: 'Batch Tracking', path: '/traceability' },
      { text: 'Traceability Chain', path: '/traceability/chain' },
      { text: 'Product Recall', path: '/traceability/recall' },
      { text: 'Traceability Reports', path: '/traceability/reports' },
    ],
  },
  
  objectives: {
    title: 'Objectives Management',
    icon: Flag,
    order: 8,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Production Manager', 'System Administrator'],
    items: [
      { text: 'Objectives Overview', path: '/objectives' },
    ],
  },
  
  nonconformance: {
    title: 'Non-Conformance & CAPA',
    icon: ReportProblem,
    order: 9,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Production Manager', 'System Administrator'],
    items: [
      { text: 'Non-Conformances', path: '/nonconformance' },
      { text: 'CAPA Actions', path: '/nonconformance/capas' },
    ],
  },
  complaints: {
    title: 'Customer Complaints',
    icon: SupportAgent,
    order: 10,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Production Manager', 'System Administrator'],
    items: [
      { text: 'Complaints', path: '/complaints' },
    ],
  },
  
  audits: {
    title: 'Audit Management',
    icon: Assessment,
    order: 11,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Auditor', 'System Administrator'],
    items: [
      { text: 'Audits', path: '/audits' },
      { text: 'Audit Schedule', path: '/audits/schedule' },
      { text: 'Findings & NCs', path: '/audits/findings' },
      { text: 'Audit Reports', path: '/audits/reports' },
    ],
  },
  
  training: {
    title: 'Training & Competence',
    icon: School,
    order: 12,
    requiredRoles: ['QA Manager', 'HR Manager', 'System Administrator'],
    items: [
      { text: 'Training Programs', path: '/training' },
      { text: 'My Training Matrix', path: '/training/matrix' },
      { text: 'Competence Assessment', path: '/training/assessment' },
      { text: 'Training Records', path: '/training/records' },
      { text: 'Certification Tracking', path: '/training/certification' },
      { text: 'Training Calendar', path: '/training/calendar' },
    ],
  },
  
  maintenance: {
    title: 'Maintenance',
    icon: Build,
    order: 13,
    requiredRoles: ['Maintenance Manager', 'Maintenance Technician', 'Production Manager', 'System Administrator'],
    items: [
      { text: 'Equipment Register', path: '/maintenance/equipment' },
      { text: 'Preventive Maintenance', path: '/maintenance/preventive' },
      { text: 'Work Orders', path: '/maintenance/work-orders' },
      { text: 'Calibration', path: '/maintenance/calibration' },
      { text: 'Maintenance History', path: '/maintenance/history' },
    ],
  },
  
  compliance: {
    title: 'Compliance',
    icon: VerifiedUser,
    order: 14,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Compliance Officer', 'System Administrator'],
    items: [
      { text: 'Risks', path: '/compliance/risks' },
      { text: 'Opportunities', path: '/compliance/opportunities' },
      { text: 'Allergen & Label Control', path: '/compliance/allergen-label' },
    ],
  },
  management_reviews: {
    title: 'Management Reviews',
    icon: Assessment,
    order: 15,
    requiredRoles: ['QA Manager', 'Compliance Officer', 'System Administrator'],
    items: [
      { text: 'Reviews', path: '/management-reviews' },
      { text: 'Calendar', path: '/management-reviews/calendar' },
      { text: 'Action Items', path: '/management-reviews/actions' },
      { text: 'Templates', path: '/management-reviews/templates' },
      { text: 'Analytics', path: '/management-reviews/analytics' },
    ],
  },
  
  actionsLog: {
    title: "Actions Log",
    icon: Assignment,
    order: 6,
    items: [
      { text: "Actions Management", path: "/actions-log" },
      { text: "Interested Parties", path: "/actions-log/parties" },
      { text: "SWOT/PESTEL Analysis", path: "/actions-log/analysis" },
    ],
  },
  analytics: {
    title: 'Analytics & Reporting',
    icon: Analytics,
    order: 16,
    requiredRoles: ['QA Manager', 'QA Specialist', 'Production Manager', 'System Administrator'],
    items: [
      { text: 'Analytics Overview', path: '/analytics' },
      { text: 'KPI Management', path: '/analytics/kpis' },
      { text: 'Dashboards', path: '/analytics/dashboards' },
      { text: 'Reports', path: '/analytics/reports' },
      { text: 'Trend Analysis', path: '/analytics/trends' },
    ],
  },
  
  users: {
    // Displayed as "Administration" in the demo nav (see DEMO_MODE_VISIBLE_SECTIONS).
    // Full nav keeps the original "User Management" label/scope.
    title: 'Administration',
    icon: People,
    order: 17,
    requiredRoles: ['System Administrator', 'QA Manager'],
    items: [
      { text: 'Users', path: '/users' },
      // "Roles" and "Permissions" both open the existing Roles & Permissions
      // page (/rbac, which has Roles / Role Summary / Permission Matrix tabs).
      // Split into two entries per the demo nav spec; distinct query strings
      // keep them as distinct, directly-linkable nav items (same pattern as
      // the Document Control group's ?group= entries below).
      { text: 'Roles', path: '/rbac?tab=roles' },
      { text: 'Permissions', path: '/rbac?tab=permissions' },
      // No dedicated Departments management page exists yet in the app —
      // department data today only surfaces inside the Users page (department
      // dropdown + "Users by Department" summary). This links there rather
      // than to a route that doesn't exist, so it never 404s. Building a real
      // standalone Departments admin page would be new functionality, out of
      // scope for a nav-visibility-only change — flagging for a decision.
      { text: 'Departments', path: '/users?tab=departments' },
    ],
  },
  
  settings: {
    title: 'System Settings',
    icon: Settings,
    order: 18,
    requiredRoles: ['System Administrator'],
    items: [
      { text: 'Settings', path: '/settings' },
      // Submenus removed until implemented
    ],
  },

};

// Helper function to get navigation sections for a user
export const getNavigationForUser = (user: any): NavigationSection[] => {
  if (!user) return [];
  const assignmentRoles = new Set<string>(
    ((user.haccp_assignment_roles as string[] | undefined) ?? []).map((r) => (r || '').toLowerCase())
  );

  const roleMatch = (section: NavigationSection) =>
    section.requiredRoles != null && section.requiredRoles.length > 0 && section.requiredRoles.includes(user.role_name);
  const permissionMatch = (section: NavigationSection) => {
    if (!section.requiredPermissions || section.requiredPermissions.length === 0) return false;
    const perms = user.permissions as string[] | undefined;
    if (!perms || perms.length === 0) return false;
    return section.requiredPermissions.some((p) => perms.includes(p));
  };

  const demoMode = isDemoModeEnabled();

  return Object.entries(NAVIGATION_CONFIG)
    .map(([sectionKey, section]) => {
      // Demo mode trims the sidebar to the core pillars + admin utilities.
      // This only affects what's returned here — the section's routes and
      // APIs are untouched and still reachable directly.
      if (demoMode && !DEMO_MODE_VISIBLE_SECTIONS.includes(sectionKey)) {
        return null;
      }
      // No role or permission requirements = visible to all authenticated users (e.g. Dashboard, Documents)
      const hasNoRequirements =
        (!section.requiredRoles || section.requiredRoles.length === 0) &&
        (!section.requiredPermissions || section.requiredPermissions.length === 0);
      if (hasNoRequirements && !section.allowAssignmentAccess) {
        return section;
      }
      if (section.requiredRoles != null && section.requiredRoles.length > 0) {
        if (roleMatch(section)) return section;
        if (section.requiredPermissions && section.requiredPermissions.length > 0 && permissionMatch(section)) return section;
      }
      if (section.requiredPermissions && section.requiredPermissions.length > 0) {
        if (permissionMatch(section)) return section;
      }
      if (
        section.allowAssignmentAccess &&
        user.has_haccp_assignment &&
        section.assignmentAllowedItems?.length
      ) {
        // Build assignment-allowed HACCP items by responsibility role.
        // All assigned users can access HACCP plans; monitoring/verification are role-specific.
        const roleAllowedItems = new Set<string>(section.assignmentAllowedItems as string[]);
        roleAllowedItems.add('/haccp');
        if (assignmentRoles.has('monitoring')) {
          roleAllowedItems.add('/haccp/monitoring');
        }
        if (assignmentRoles.has('verification')) {
          roleAllowedItems.add('/haccp/verification');
          roleAllowedItems.add('/haccp/verification-records');
        }
        const filteredItems = section.items.filter((item) =>
          roleAllowedItems.has(item.path)
        );
        if (filteredItems.length) {
          return {
            ...section,
            items: filteredItems,
          };
        }
      }
      return null;
    })
    .filter((section): section is NavigationSection => Boolean(section))
    .sort((a, b) => a.order - b.order);
};

// Helper function to check if user has access to a specific path
export const hasAccessToPath = (user: any, path: string): boolean => {
  if (!user) return false;
  const assignmentRoles = new Set<string>(
    ((user.haccp_assignment_roles as string[] | undefined) ?? []).map((r) => (r || '').toLowerCase())
  );

  const roleMatch = (section: NavigationSection) =>
    section.requiredRoles != null && section.requiredRoles.length > 0 && section.requiredRoles.includes(user.role_name);
  const permissionMatch = (section: NavigationSection) => {
    if (!section.requiredPermissions || section.requiredPermissions.length === 0) return false;
    const perms = user.permissions as string[] | undefined;
    if (!perms || perms.length === 0) return false;
    return section.requiredPermissions.some((p) => perms.includes(p));
  };

  for (const section of Object.values(NAVIGATION_CONFIG)) {
    for (const item of section.items) {
      if (item.path === path) {
        const hasNoRequirements =
          (!section.requiredRoles || section.requiredRoles.length === 0) &&
          (!section.requiredPermissions || section.requiredPermissions.length === 0);
        if (hasNoRequirements && !section.allowAssignmentAccess) return true;
        if (section.requiredRoles != null && section.requiredRoles.length > 0) {
          if (roleMatch(section)) return true;
          if (section.requiredPermissions && section.requiredPermissions.length > 0 && permissionMatch(section)) return true;
        }
        if (section.requiredPermissions && section.requiredPermissions.length > 0) {
          if (permissionMatch(section)) return true;
        }
        if (
          section.allowAssignmentAccess &&
          user.has_haccp_assignment &&
          (() => {
            const roleAllowedItems = new Set<string>((section.assignmentAllowedItems as string[] | undefined) ?? []);
            roleAllowedItems.add('/haccp');
            if (assignmentRoles.has('monitoring')) roleAllowedItems.add('/haccp/monitoring');
            if (assignmentRoles.has('verification')) {
              roleAllowedItems.add('/haccp/verification');
              roleAllowedItems.add('/haccp/verification-records');
            }
            return roleAllowedItems.has(path);
          })()
        ) {
          return true;
        }

        return false;
      }
    }
  }
  return false;
};

// Helper function to get section for a path
export const getSectionForPath = (path: string): string | null => {
  for (const [sectionKey, section] of Object.entries(NAVIGATION_CONFIG)) {
    if (section.items.some(item => item.path === path)) {
      return sectionKey;
    }
  }
  return null;
};

// Helper function to get item for a path
export const getItemForPath = (path: string): NavigationItem | null => {
  for (const section of Object.values(NAVIGATION_CONFIG)) {
    const item = section.items.find(item => item.path === path);
    if (item) {
      return item;
    }
  }
  return null;
}; 