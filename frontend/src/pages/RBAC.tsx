import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CloneIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  Create as CreateIcon,
  Update as UpdateIcon,
  DeleteOutline as DeleteOutlineIcon,
  CheckCircle as ApproveIcon,
  PersonAdd as AssignIcon,
  GetApp as ExportIcon,
  Publish as ImportIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { hasPermission, isSystemAdministrator } from '../store/slices/authSlice';
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  cloneRole,
  deleteRole,
  fetchRoleSummary,
  fetchPermissionMatrix,
  setSelectedRole,
  clearSelectedRole,
} from '../store/slices/rbacSlice';
import { rbacAPI } from '../services/rbacAPI';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rbac-tabpanel-${index}`}
      aria-labelledby={`rbac-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RBAC: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, permissions, roleSummary, permissionMatrix, loading, error, selectedRole } = useSelector(
    (state: RootState) => state.rbac
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const canWriteRoles = !!currentUser && (hasPermission(currentUser, 'roles', 'write') || isSystemAdministrator(currentUser));

  // Maps the Administration nav's ?tab= query param (see navigationConfig.ts:
  // '/rbac?tab=roles', '/rbac?tab=permissions') to this page's tab index, so
  // the "Roles" and "Permissions" nav entries land on the right tab instead
  // of always defaulting to the first one.
  const [searchParams] = useSearchParams();
  const getTabIndexFromParam = (param: string | null): number => {
    switch (param) {
      case 'permissions':
        return 2; // Permission Matrix
      case 'summary':
      case 'role_summary':
        return 1; // Role Summary
      case 'roles':
      default:
        return 0; // Roles
    }
  };

  const [tabValue, setTabValue] = useState(() => getTabIndexFromParam(searchParams.get('tab')));

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setTabValue(getTabIndexFromParam(tabParam));
    }
  }, [searchParams]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'clone'>('create');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as number[],
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchRoles(undefined));
    dispatch(fetchPermissions(undefined));
    dispatch(fetchRoleSummary());
    dispatch(fetchPermissionMatrix());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'create' | 'edit' | 'clone', role?: any) => {
    setDialogType(type);
    if (type === 'edit' && role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: (role.permissions || []).map((p: any) => p.id),
      });
      dispatch(setSelectedRole(role));
    } else if (type === 'clone' && role) {
      setFormData({
        name: `${role.name} (Copy)`,
        description: role.description || '',
        permissions: (role.permissions || []).map((p: any) => p.id),
      });
      dispatch(setSelectedRole(role));
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
      dispatch(clearSelectedRole());
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setSelectedPermissions({});
    dispatch(clearSelectedRole());
  };

  const handleSubmit = async () => {
    try {
      if (dialogType === 'create') {
        await dispatch(createRole(formData));
      } else if (dialogType === 'edit' && selectedRole) {
        await dispatch(updateRole({ roleId: selectedRole.id, roleData: formData }));
      } else if (dialogType === 'clone' && selectedRole) {
        await dispatch(cloneRole({ roleId: selectedRole.id, cloneData: formData }));
      }
      handleCloseDialog();
      dispatch(fetchRoles(undefined));
      dispatch(fetchRoleSummary());
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await dispatch(deleteRole(roleId));
        dispatch(fetchRoles(undefined));
        dispatch(fetchRoleSummary());
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => id !== permissionId),
      }));
    }
  };

  const getPermissionIcon = (action: string) => {
    switch (action) {
      case 'view': return <ViewIcon fontSize="small" />;
      case 'create': return <CreateIcon fontSize="small" />;
      case 'update': return <UpdateIcon fontSize="small" />;
      case 'delete': return <DeleteOutlineIcon fontSize="small" />;
      case 'approve': return <ApproveIcon fontSize="small" />;
      case 'assign': return <AssignIcon fontSize="small" />;
      case 'export': return <ExportIcon fontSize="small" />;
      case 'import': return <ImportIcon fontSize="small" />;
      default: return <SecurityIcon fontSize="small" />;
    }
  };

  const getPermissionColor = (action: string) => {
    switch (action) {
      case 'view': return 'default';
      case 'create': return 'primary';
      case 'update': return 'warning';
      case 'delete': return 'error';
      case 'approve': return 'success';
      case 'assign': return 'info';
      case 'export': return 'secondary';
      case 'import': return 'secondary';
      default: return 'default';
    }
  };

  // Group permissions by module
  const permissionsByModule = (permissions || []).reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Role-Based Access Control (RBAC)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="RBAC tabs">
          <Tab label="Roles" />
          <Tab label="Role Summary" />
          <Tab label="Permission Matrix" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Roles Management</Typography>
            {canWriteRoles && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('create')}
              >
                Create Role
              </Button>
            )}
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : roles && roles.length > 0 ? (
            <Grid container spacing={2}>
              {(roles as any[]).filter((r): r is NonNullable<typeof r> => r != null && r.id != null).map((role) => (
                <Grid item xs={12} md={6} lg={4} key={role.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {role.name ?? 'Unnamed role'}
                        </Typography>
                        <Box>
                          {role.is_default && (
                            <Chip label="Default" size="small" color="primary" sx={{ mr: 1 }} />
                          )}
                          {!role.is_active && (
                            <Chip label="Inactive" size="small" color="error" />
                          )}
                        </Box>
                      </Box>
                      
                      {role.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {role.description}
                        </Typography>
                      )}

                      <Typography variant="body2" color="text.secondary">
                        {(role.permissions || []).length} permissions • {role.user_count || 0} users
                      </Typography>

                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(role.permissions || []).filter(Boolean).slice(0, 3).map((permission, idx) => (
                          <Chip
                            key={permission?.id ?? `perm-${role.id}-${idx}`}
                            label={permission ? `${permission.module}:${permission.action}` : '?'}
                            size="small"
                            variant="outlined"
                            icon={getPermissionIcon(permission?.action)}
                            color={getPermissionColor(permission?.action) as any}
                          />
                        ))}
                        {(role.permissions || []).length > 3 && (
                          <Chip
                            label={`+${(role.permissions || []).length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                    
                    {canWriteRoles && (
                      <CardActions>
                        <Tooltip title="Edit Role">
                          <span style={{ display: 'inline-flex' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', role)}
                              disabled={!role.is_editable}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Clone Role">
                          <span style={{ display: 'inline-flex' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('clone', role)}
                            >
                              <CloneIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete Role">
                          <span style={{ display: 'inline-flex' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={!role.is_editable || (role.user_count || 0) > 0}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary">No roles available</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Role Summary
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : roleSummary && roleSummary.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roleSummary.map((summary) => (
                    <TableRow key={summary.role_id}>
                      <TableCell>{summary.role_name}</TableCell>
                      <TableCell>{summary.user_count}</TableCell>
                      <TableCell>{(summary.permissions || []).length}</TableCell>
                      <TableCell>
                        <Chip
                          label={summary.user_count > 0 ? 'Active' : 'No Users'}
                          color={summary.user_count > 0 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">No role summary available</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Permission Matrix
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : permissionMatrix && permissionMatrix.modules && permissionMatrix.modules.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    {permissionMatrix.modules.map((module) => (
                      <TableCell key={module} align="center">
                        {module}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(permissionMatrix.role_permissions || {}).map(([roleName, modulePermissions]) => (
                    <TableRow key={roleName}>
                      <TableCell component="th" scope="row">
                        {roleName}
                      </TableCell>
                      {permissionMatrix.modules.map((module) => (
                        <TableCell key={module} align="center">
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                            {modulePermissions[module]?.map((action) => (
                              <Chip
                                key={action}
                                label={action}
                                size="small"
                                variant="outlined"
                                icon={getPermissionIcon(action)}
                                color={getPermissionColor(action) as any}
                              />
                            )) || '-'}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">No permission matrix available</Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Create/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'create' ? 'Create New Role' : 
           dialogType === 'edit' ? 'Edit Role' : 'Clone Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" gutterBottom>
              Permissions
            </Typography>

            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {Object.keys(permissionsByModule).length > 0 ? (
                Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                  <Box key={module} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {module.toUpperCase()}
                    </Typography>
                    <Grid container spacing={1}>
                      {modulePermissions.map((permission) => (
                        <Grid item xs={12} sm={6} md={4} key={permission.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.permissions.includes(permission.id)}
                                onChange={(e) => handlePermissionToggle(permission.id, e.target.checked)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getPermissionIcon(permission.action)}
                                <Typography variant="body2">
                                  {permission.action}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No permissions available</Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogType === 'create' ? 'Create' : 
             dialogType === 'edit' ? 'Update' : 'Clone'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RBAC; 