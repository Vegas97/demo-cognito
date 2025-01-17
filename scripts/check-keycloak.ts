import axios, { AxiosError } from 'axios';

interface KeycloakClient {
  id: string;
  clientId: string;
  protocol: string;
  publicClient: boolean;
  standardFlowEnabled: boolean;
  directAccessGrantsEnabled: boolean;
}

interface ProtocolMapper {
  name: string;
  protocol: string;
  protocolMapper: string;
}

interface Role {
  name: string;
  description?: string;
}

interface Group {
  name: string;
  path: string;
}

interface ClientScope {
  name: string;
}

const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'master';
const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID;

async function getAdminToken() {
  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        username: 'admin',
        password: 'admin',
        grant_type: 'password',
        client_id: 'admin-cli'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error getting admin token:', error.response?.data || error.message);
    } else {
      console.error('Error getting admin token:', error);
    }
    throw error;
  }
}

async function checkConfiguration() {
  try {
    const token = await getAdminToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Get client details
    const clientsResponse = await axios.get<KeycloakClient[]>(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/clients`,
      { headers }
    );
    const client = clientsResponse.data.find(c => c.clientId === CLIENT_ID);
    
    if (!client) {
      console.error(`Client ${CLIENT_ID} not found`);
      return;
    }

    console.log('\n=== Client Configuration ===');
    console.log(`Client ID: ${client.clientId}`);
    console.log(`Protocol: ${client.protocol}`);
    console.log(`Public Client: ${client.publicClient}`);
    console.log(`Standard Flow Enabled: ${client.standardFlowEnabled}`);
    console.log(`Direct Access Grants: ${client.directAccessGrantsEnabled}`);

    // Get client protocol mappers
    const mappersResponse = await axios.get<ProtocolMapper[]>(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${client.id}/protocol-mappers/models`,
      { headers }
    );
    
    console.log('\n=== Protocol Mappers ===');
    mappersResponse.data.forEach(mapper => {
      console.log(`\nMapper: ${mapper.name}`);
      console.log(`Protocol: ${mapper.protocol}`);
      console.log(`Mapper Type: ${mapper.protocolMapper}`);
    });

    // Get realm roles
    const rolesResponse = await axios.get<Role[]>(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
      { headers }
    );
    
    console.log('\n=== Realm Roles ===');
    rolesResponse.data.forEach(role => {
      console.log(`\nRole: ${role.name}`);
      console.log(`Description: ${role.description || 'No description'}`);
    });

    // Get groups
    const groupsResponse = await axios.get<Group[]>(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups`,
      { headers }
    );
    
    console.log('\n=== Groups ===');
    groupsResponse.data.forEach(group => {
      console.log(`\nGroup: ${group.name}`);
      console.log(`Path: ${group.path}`);
    });

    // Check client scopes
    const scopesResponse = await axios.get<ClientScope[]>(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${client.id}/default-client-scopes`,
      { headers }
    );
    
    console.log('\n=== Client Scopes ===');
    scopesResponse.data.forEach(scope => {
      console.log(`\nScope: ${scope.name}`);
    });

    console.log('\n=== Configuration Recommendations ===');
    
    // Check for roles mapper
    const hasRolesMapper = mappersResponse.data.some(m => 
      m.name.toLowerCase().includes('role') || m.protocolMapper.toLowerCase().includes('role')
    );
    if (!hasRolesMapper) {
      console.log('❌ Missing roles mapper. Consider adding "realm roles" and "client roles" mappers');
    } else {
      console.log('✅ Roles mapper configured');
    }

    // Check for groups mapper
    const hasGroupsMapper = mappersResponse.data.some(m => 
      m.name.toLowerCase().includes('group') || m.protocolMapper.toLowerCase().includes('group')
    );
    if (!hasGroupsMapper) {
      console.log('❌ Missing groups mapper. Consider adding "groups" mapper');
    } else {
      console.log('✅ Groups mapper configured');
    }

    // Check for roles scope
    const hasRolesScope = scopesResponse.data.some(s => 
      s.name.toLowerCase().includes('role')
    );
    if (!hasRolesScope) {
      console.log('❌ Missing roles scope. Consider adding "roles" scope');
    } else {
      console.log('✅ Roles scope configured');
    }

  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error checking configuration:', error.response?.data || error.message);
    } else {
      console.error('Error checking configuration:', error);
    }
  }
}

checkConfiguration();
