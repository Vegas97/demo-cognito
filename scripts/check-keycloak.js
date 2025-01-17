import axios from 'axios';

const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'demorealm';
const CLIENT_ID = 'nextjs';

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
    console.error('Error getting admin token:', error.response?.data || error.message);
    throw error;
  }
}

async function checkConfiguration() {
  try {
    const token = await getAdminToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Get client details
    const clientsResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/clients`,
      { headers }
    );

    console.log('\n=== Available Clients ===');
    clientsResponse.data.forEach(client => {
      console.log(`Client ID: ${client.clientId}`);
    });
    console.log('\n');

    const client = clientsResponse.data.find(c => c.clientId === CLIENT_ID);
    
    if (!client) {
      console.error(`Client ${CLIENT_ID} not found in realm ${REALM}`);
      return;
    }

    console.log('\n=== Client Configuration ===');
    console.log(`Client ID: ${client.clientId}`);
    console.log(`Protocol: ${client.protocol}`);
    console.log(`Public Client: ${client.publicClient}`);
    console.log(`Standard Flow Enabled: ${client.standardFlowEnabled}`);
    console.log(`Direct Access Grants: ${client.directAccessGrantsEnabled}`);

    // Get client protocol mappers
    const mappersResponse = await axios.get(
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
    const rolesResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/roles`,
      { headers }
    );
    
    console.log('\n=== Realm Roles ===');
    rolesResponse.data.forEach(role => {
      console.log(`\nRole: ${role.name}`);
      console.log(`Description: ${role.description || 'No description'}`);
    });

    // Get groups
    const groupsResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/groups`,
      { headers }
    );
    
    console.log('\n=== Groups ===');
    if (groupsResponse.data.length === 0) {
      console.log('No groups defined');
    } else {
      groupsResponse.data.forEach(group => {
        console.log(`\nGroup: ${group.name}`);
        console.log(`Path: ${group.path}`);
      });
    }

    // Check client scopes
    const scopesResponse = await axios.get(
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
    console.error('Error checking configuration:', error.response?.data || error.message);
  }
}

checkConfiguration();
