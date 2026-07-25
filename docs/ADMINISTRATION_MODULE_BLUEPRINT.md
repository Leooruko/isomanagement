# Administration Module Blueprint

This is a design document, not a code change. It defines what the Administration module should be for this ISO 22000 FSMS, built for a typical food manufacturing customer using Dashboard, Document Control, and HACCP — not a generic enterprise platform. It should be read alongside "Understanding the Administration & RBAC Architecture," which documents what exists today; this document is what the next phase of work should build toward.

## Part 1 — Core Principles

Five things get conflated in the current system that should be kept conceptually distinct, even if some end up sharing a page in the UI.

**Administration** is the umbrella: the part of the product where someone configures who can use the system and how it's structured. It's a product area, not a single concern — everything below lives inside it.

**Authentication** answers one question only: is this a valid, currently-usable login. It owns credentials, sessions, tokens, lockout, and password recovery. It should know nothing about what a user is allowed to do once they're in — that's a separate concern, and today's codebase mostly respects this split already (`core/security.py`, `auth.py`).

**Authorization (RBAC)** answers: given a valid login, what is this person allowed to do. It owns roles, permissions, and the enforcement that checks them on every request. It should never decide whether someone can log in (that's Authentication's job) and should never store organizational structure (that's Organization Management's job) — today's `rbac.py`/`rbac_service.py` mostly stays in its lane, but enforcement of it is inconsistent, which is a Part 7 gap, not a Part 1 boundary problem.

**Organization Management** answers: what does this company actually look like — its identity, its departments, its people, and (if it ever grows into one) its sites. It owns the Company profile and Departments. Today this is the weakest-defined boundary in the system: there's no Company entity at all, and department data is scattered across a free-text field on `User`, a free-text field on `Document`, and a properly-normalized but unused `Department`/`DepartmentUser` pair.

**System Configuration** answers: how does the application itself behave — session timeouts, alert thresholds, retention periods, integration toggles. It should hold nothing about the company's identity. Today it wrongly absorbs Organization Management's job (`company_name`, `facility_address`, and contact fields live in the same flat settings table as `session_timeout_minutes`), which is exactly the kind of boundary violation this blueprint fixes.

The practical rule going forward: if a piece of data would still make sense after switching to a completely different food manufacturer as the customer, it's System Configuration. If it describes *this* customer specifically, it's Organization Management.

## Part 2 — Information Architecture

```
Administration
├── Company
├── Departments
├── Users
├── Roles
├── Permissions
├── Settings
└── Audit Log
```

**Company.** Purpose: the single source of truth for who this customer is — legal/trading name, address, primary contacts, and (optionally) their ISO 22000 certification scope details, since that's meaningfully different from generic app settings and is the kind of thing that shows up on generated reports and document headers. Primary users: System Administrator, typically set once at onboarding and rarely touched after. Key actions: view/edit company profile, upload a logo (used on exported documents/reports). Relationship to other pages: read by Document Control and Dashboard when they render a company name/logo on exports; has no dependency on any other Administration page.

**Departments.** Purpose: represent the organizational units this specific company has — QA, Production, Maintenance, Warehouse, etc. — used to tag users and, eventually, documents. Primary users: System Administrator or QA Manager during setup; occasionally edited afterward as the org changes. Key actions: create/edit/archive a department, assign a department manager, view which users belong to it. Relationship to other pages: feeds the department picker used by Users, and should feed a department field on Document Control (today Document Control stores department as an unrelated free-text string — that's a gap this blueprint's data model closes, see Part 4).

**Users.** Purpose: the people who log in. Primary users: System Administrator, QA Manager (for their own reports/team). Key actions: create a user (name, email, department, role), edit, deactivate/reactivate, trigger a password reset, view a user's activity. Relationship to other pages: every user requires exactly one Role and optionally one Department, both selected from those pages' data — Users is downstream of both.

**Roles.** Purpose: define job functions once, so permissions aren't assigned person-by-person. Primary users: System Administrator only (this is the one page that should be the most locked-down, since it defines what every other role can do). Key actions: create/edit/clone/delete a role, and — inline within the same editor, not a separate step — pick which permissions that role has. Relationship to other pages: every User references exactly one Role; Roles reference many Permissions.

**Permissions.** Purpose: not a page where permissions are created ad hoc (that would re-introduce the sprawl this system already has with 21 modules × 9 actions, most of it unused) — instead, a read-only catalog/matrix view showing, for every role, what it can do across every module. Primary users: System Administrator, or anyone during an audit who needs to demonstrate access control to an assessor. Key actions: view the matrix, filter by module or role; the only edit action here should be a redirect into the relevant Role's editor rather than a duplicate editing surface. Relationship to other pages: this is a read view over Roles' data, not an independent data source — this collapses today's confusing situation where Permissions is technically its own model but practically only meaningful in the context of a Role.

**Settings.** Purpose: technical, deployment-level configuration that has nothing to do with company identity — session timeout, password policy, alert thresholds, integration toggles, retention periods. Primary users: System Administrator. Key actions: view/edit grouped settings, reset a setting to default. Relationship to other pages: deliberately has zero overlap with Company — if a field describes "this specific customer," it doesn't belong here (see Part 1).

**Audit Log.** Purpose: a searchable, read-only view of every administrative action taken — user created/edited/deactivated, role created/edited/deleted, permission changed, department changed — the exact evidence an ISO 22000 assessor asks for when they ask "who can approve documents, and who decided that." Primary users: System Administrator, QA Manager, and anyone preparing for an external audit. Key actions: filter by user, action type, date range, resource; export for an auditor. Relationship to other pages: reads from every other Administration page's actions — it's the one page that depends on all the others logging to it consistently, which today they don't (see Part 7).

No other top-level page is needed for this customer. Sites and Teams were considered and deliberately excluded — see Part 4's reasoning — because nothing about a typical single-site (or small-number-of-site) food manufacturer using Dashboard/Document Control/HACCP requires them yet, and adding them now would be exactly the generic-enterprise complexity this design is avoiding.

## Part 3 — Company Setup Experience

**1. Install system.** Schema is created empty, as today. No change in principle, but the deployment step should also seed exactly one canonical role set (see Part 7 — today's three conflicting seed scripts should become one), not leave it to whichever script an installer happens to run.

**2. Create the first administrator account.** A dedicated first-run screen — not the ordinary login page, not a "/signup" page ambiguously labeled — that only appears when zero users exist. It creates one account, hard-wired to the System Administrator role (no dependency on an `is_default` flag that could point elsewhere). This replaces today's confusing three-way split between seed-script admin, `/signup`, and `/register`.

**3. Create the company profile.** The new administrator's first action inside the product: name, address, contacts, logo. This is a deliberate, explicit step — not a settings field they might never visit — because it's used on generated reports from day one.

**4. Create departments.** Guided by a short explanation that these will be used to tag users and (eventually) documents. A sensible default set can be pre-suggested (QA, Production, Maintenance, Warehouse) that the administrator edits rather than starting from zero — but nothing is force-created; this stays optional-but-encouraged, since a very small operation might only need one or two.

**5. Review/adjust roles.** The system ships with a small default role set already matching this customer's real org structure (System Administrator, QA Manager, QA Supervisor, Production Manager, Line Operator) rather than the generic view-only sprawl in today's `setup_database_complete.py`. The administrator can rename, clone, or adjust — but doesn't have to build roles from scratch.

**6. Assign permissions.** Not a separate step in practice — it happens inside each role's editor from step 5, since permissions divorced from a role's context aren't a meaningful standalone decision.

**7. Create users.** Each user is created with a name, email, a required Role, and an optional Department, in one form — this is already how it works today and doesn't need to change.

**8. System ready.** Rather than a silent transition, a simple setup-completeness indicator (e.g., "at least one department exists, at least one non-administrator user exists") tells the administrator they're ready to move into Document Control and HACCP, instead of discovering gaps — like the empty department dropdown found during manual testing — after the fact.

## Part 4 — Data Model

**Company.** Purpose: the one row representing the customer. Relationships: none upward (it's the root); Departments and Users exist within it implicitly (single-tenant, so no explicit foreign key needed unless multi-tenancy is ever required — which it deliberately isn't designed for here). Required fields: name, address, primary contact email. Optional fields: phone, logo, ISO certification scope/notes, secondary contacts.

**Department.** Purpose: an organizational unit for grouping users (and, going forward, documents). Relationships: optionally one parent Department (at most one level deep — a second-level sub-department is the practical ceiling for this customer size); has a manager, who is a User; has many Users. Required fields: name, a short code. Optional fields: description, parent department, manager.

**User.** Purpose: a person who logs in. Relationships: exactly one Role (required); exactly one Department (optional — some roles, like a System Administrator, may not need one). Required fields: name, email, password, Role. Optional fields: Department, phone, position/job title, profile photo.

**Role.** Purpose: a named job function that determines what its Users can do. Relationships: many Permissions; many Users. Required fields: name, whether it's system-protected (i.e., cannot be deleted/renamed — needed for at least the System Administrator role). Optional fields: description.

**Permission.** Purpose: an atomic capability — a module plus an action (e.g., Documents:Approve). Relationships: many Roles. Required fields: module, action. Optional fields: description. This entity should stay a fixed, pre-defined catalog that ships with the system — it is not something an administrator creates ad hoc, which avoids the sprawl risk of the current 189-combination matrix growing without bound.

**UserPermission (override).** Purpose: a rare, explicit exception — grant one specific user one specific extra permission beyond their role. Relationships: one User, one Permission. Required fields: user, permission, who granted it. Optional fields: none — kept deliberately minimal, and deliberately grant-only (see Part 6) so it can never be used to silently take away something a role provides, which would be much harder to reason about during an audit.

**Audit Log Entry.** Purpose: an immutable record of an administrative action. Relationships: the User who performed it, and the resource affected (a User, Role, Department, or Permission assignment). Required fields: who, what action, what resource, when. Optional fields: a details payload (what changed, old vs. new value) — genuinely optional at the schema level, but should be populated consistently in practice, which is exactly what's missing today.

**Deliberately excluded:** Site/Facility and Team entities. Reasoning: nothing about this customer's actual operation (single or small-number-of-plants food manufacturer running Dashboard/Document Control/HACCP) requires representing multiple physical locations or ad hoc cross-functional teams today. If a customer ever does operate multiple plants, a `Site` entity would slot in cleanly between Company and Department without disrupting this model — but building it speculatively now would be the same mistake as `DepartmentUser`'s unused time-bounded membership sophistication in the current system.

## Part 5 — User Workflows

**Creating a Department.** An administrator opens Departments, clicks Create, enters a name and code, optionally sets a parent department and a manager, saves. The department is immediately available in the Users and Document Control department pickers — no separate sync step.

**Creating a Role.** An administrator opens Roles, clicks Create, names it, and — in the same form — checks off which permissions it has from the fixed catalog, grouped by module. Saves. The role is immediately assignable to users. Cloning an existing role (e.g., "QA Manager" → "QA Supervisor, edited down") is a one-click starting point rather than building from a blank form.

**Creating a User.** An administrator opens Users, clicks Create, enters name and email, picks a Role (required) and Department (optional), and chooses between setting a temporary password directly or sending an email invitation the person completes themselves — the latter being the default going forward, since it's what customers expect and avoids an administrator ever knowing another person's real password.

**Assigning Permissions.** Not a standalone action — it happens by editing the relevant Role (see "Creating a Role"). The one standalone case is the rare per-user override: from a specific user's detail page, an administrator can grant one extra permission beyond their role, with a required short justification note that lands in the Audit Log.

**Disabling a User.** From the Users list, a Deactivate action immediately revokes login ability (soft-deactivation, not deletion — history and past approvals/actions attributed to that user must remain intact for audit purposes). Self-deactivation stays blocked, as it correctly is today.

**Resetting a Password.** Two paths: the user themselves uses "Forgot password" from the login screen, receiving a time-limited reset link by email (this doesn't exist today and should); or an administrator triggers a reset from the Users page, which — going forward — should send that same reset link rather than the administrator typing a new password directly.

**Changing Departments.** From a user's edit form, picking a different Department from the same dropdown used at creation. This is logged in the Audit Log (department changes are already logged today — this behavior should simply extend to every other user-field change too).

**Viewing Audit Logs.** An administrator opens Audit Log, filters by user, action type, resource, or date range, and can export the filtered view — this is the page an ISO 22000 assessor would be shown directly during a review of access control practices.

## Part 6 — RBAC Design

**One role per user, not multiple.** This customer's actual organizational structure (QA Manager, QA Supervisor, Production Manager, Line Operator, System Administrator) maps cleanly onto single, well-defined job functions. Multiple roles per user adds real complexity — precedence rules when two roles disagree, harder-to-audit "why can this person do that" questions — for a benefit this customer's org chart doesn't need. If someone genuinely needs one extra capability beyond their role, that's what the per-user override exists for; it shouldn't be solved by stacking roles.

**Permissions should be inherited from the role, not computed some other way.** A user's full permission set is simply their role's permissions, plus any per-user overrides. This is exactly the model already implemented in `RBACService.get_user_permissions` today — it's correctly designed, it just isn't consistently enforced everywhere (Part 7).

**User-specific overrides should exist, but stay grant-only, not revoke-capable.** The ability to hand one person one extra permission beyond their role covers real cases (a Production Operator temporarily covering for a QA Supervisor). Allowing overrides to *revoke* a role-granted permission is a bad idea for this system specifically: it would mean two people with the same displayed role could silently have different actual access, which is exactly the kind of ambiguity an ISO auditor will flag. If someone shouldn't have a permission their role grants, the correct fix is a role change or a new role — not a hidden per-user exception.

**Permission checks should work as a single, consistently-applied gate — not two parallel implementations, and not optional per endpoint.** Every request that mutates data (create/update/delete/approve) should pass through one authorization dependency that resolves "role permissions ∪ granted overrides" fresh from the database (as today's logic already does), with no endpoint left ungated by convention or oversight. Read-only lookups can reasonably stay open to any authenticated user, but that should be a deliberate, documented exception list — not the accidental default it is today, where roughly two-thirds of endpoints have no permission gate at all.

## Part 7 — Comparison Against Current Implementation

| Feature | Status | Gap |
|---|---|---|
| Users: create/edit/deactivate | ✔ Already implemented | Works well today; keep as-is. |
| Password reset | ▲ Partially implemented | Admin can set a new password directly; no self-service "forgot password" email flow exists despite a dormant model for it. |
| User invitation (email-based) | ✖ Missing | Accounts are created with a password set directly by an admin; no invite-and-set-your-own-password flow. |
| Roles: create/edit/clone/delete | ✔ Already implemented | Functional UI already matches this blueprint's design. |
| Permissions catalog/matrix view | ✔ Already implemented | The Permission Matrix tab already does roughly what this blueprint describes; mainly needs to stay read-only/redirect-to-role-editor rather than gain its own separate editing surface. |
| Per-user permission overrides | ▲ Partially implemented | Exists, but is grant-only in practice already (good) — gap is just that it's an easy-to-miss secondary dialog rather than a clearly-justified, logged action. |
| One role per user | ✔ Already implemented | `User.role_id` is already a single required FK — matches this blueprint's recommendation exactly. |
| Departments: data model | ✔ Already implemented | Hierarchy, manager field, and indexing already exist and already match this blueprint's model. |
| Departments: admin UI | ✖ Missing | No page exists to create/edit/archive a department — the single biggest gap versus this blueprint. |
| Departments: seed data | ✖ Missing | No script populates any department, in any environment. |
| Company profile | ✖ Missing | No entity, no page — company identity is a few fields buried inside generic Settings. |
| Settings (technical config) | ✔ Already implemented | Exists and is reasonably complete; gap is only that it currently also holds Company-profile fields that shouldn't be there. |
| Audit Log data | ▲ Partially implemented | The model and a logging helper exist, but only login/logout/refresh/registration/password-change/department-change actually call it — user create/edit/delete/(de)activate and all role/permission changes are not logged. |
| Audit Log viewer (UI) | ✖ Missing | No page surfaces `AuditLog` data to an administrator at all today. |
| Consistent RBAC enforcement | ▲ Partially implemented | The resolution logic (`RBACService`) is correctly designed; enforcement is applied on roughly a third of backend endpoints, via two different, non-identical implementations. |
| Single canonical seed/setup process | ✖ Missing | Three scripts create three different role/permission sets with no reconciliation. |
| Database-level integrity (unique constraints on module+action, user+permission) | ✖ Missing | Currently enforced only in application code, not at the database level. |
| Sites / multi-facility support | ✖ Missing (by design) | Deliberately out of scope for this blueprint and for this customer's current needs — not a regression, a scoping decision. |
| Teams | ✖ Missing (by design) | Same as above — deliberately excluded rather than overlooked. |

The pattern across this comparison: the parts of Administration that are purely about people and access (Users, Roles, the permission-resolution logic) are already close to this blueprint. The parts that are about representing the organization itself (Company, Departments' UI, consistent audit trails) are the real gap, and they're the parts that matter most for a system whose entire purpose is regulatory traceability.
