// TalkSASA Account Management Dashboard
let config = {
    apiKey: '',
    baseUrl: 'https://bulksms.talksasa.com/api/v3',
    authMethod: 'apiKey',
    defaultSenderId: ''
};

let currentGroupId = '';

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        navigateTo(page);
    });
});

function navigateTo(pageName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'profile': 'Profile',
        'balance': 'SMS Balance',
        'groups': 'Contact Groups',
        'contacts': 'Contacts',
        'send-sms': 'Send SMS',
        'templates': 'Templates',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || pageName;
    
    // Auto-load data for certain pages
    if (pageName === 'dashboard') {
        loadDashboard();
    } else if (pageName === 'groups') {
        loadContactGroups();
    } else if (pageName === 'templates') {
        loadTemplates();
    } else if (pageName === 'send-sms' && config.defaultSenderId) {
        // Pre-fill sender ID when navigating to SMS page
        const senderIdField = document.getElementById('smsSenderId');
        if (senderIdField && !senderIdField.value) {
            senderIdField.value = config.defaultSenderId;
        }
    }
}

// Settings Form
document.getElementById('authMethod').addEventListener('change', (e) => {
    const method = e.target.value;
    if (method === 'apiKey') {
        document.getElementById('apiKeySection').classList.remove('hidden');
        document.getElementById('oauth2Section').classList.add('hidden');
    } else {
        document.getElementById('apiKeySection').classList.add('hidden');
        document.getElementById('oauth2Section').classList.remove('hidden');
    }
});

document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    config.authMethod = document.getElementById('authMethod').value;
    config.baseUrl = document.getElementById('baseUrl').value;
    config.defaultSenderId = document.getElementById('defaultSenderId').value;
    
    if (config.authMethod === 'apiKey') {
        config.apiKey = document.getElementById('apiKey').value;
    } else {
        config.clientId = document.getElementById('clientId').value;
        config.clientSecret = document.getElementById('clientSecret').value;
    }
    
    localStorage.setItem('talksasa_config', JSON.stringify(config));
    showAlert('settingsStatus', 'Configuration saved successfully!', 'success');
    
    // Update user email display
    document.getElementById('userEmail').textContent = 'Configured';
    
    // Update SMS sender ID field if on send-sms page
    const senderIdField = document.getElementById('smsSenderId');
    if (senderIdField && config.defaultSenderId) {
        senderIdField.value = config.defaultSenderId;
    }
});

// Load configuration on startup
window.addEventListener('load', () => {
    const saved = localStorage.getItem('talksasa_config');
    if (saved) {
        config = JSON.parse(saved);
        
        document.getElementById('authMethod').value = config.authMethod || 'apiKey';
        document.getElementById('baseUrl').value = config.baseUrl || 'https://bulksms.talksasa.com/api/v3';
        
        if (config.defaultSenderId) {
            document.getElementById('defaultSenderId').value = config.defaultSenderId;
            // Pre-fill SMS sender ID field if it exists
            const senderIdField = document.getElementById('smsSenderId');
            if (senderIdField) {
                senderIdField.value = config.defaultSenderId;
            }
        }
        
        if (config.authMethod === 'apiKey' && config.apiKey) {
            document.getElementById('apiKey').value = config.apiKey;
            document.getElementById('userEmail').textContent = 'Configured';
        }
        
        // Trigger auth method change
        document.getElementById('authMethod').dispatchEvent(new Event('change'));
        
        // Load dashboard
        loadDashboard();
    }
});

// SMS Message Counter
const smsMessage = document.getElementById('smsMessage');
if (smsMessage) {
    smsMessage.addEventListener('input', (e) => {
        const text = e.target.value;
        const charCount = text.length;
        const segmentCount = Math.ceil(charCount / 160) || 1;
        
        document.getElementById('charCount').textContent = charCount;
        document.getElementById('segmentCount').textContent = segmentCount;
    });
}

// SMS Form
document.getElementById('smsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        recipient: document.getElementById('smsRecipient').value,
        sender_id: document.getElementById('smsSenderId').value,
        type: 'plain',
        message: document.getElementById('smsMessage').value,
        schedule_time: document.getElementById('smsSchedule').value || undefined,
        dlt_template_id: document.getElementById('smsDltId').value || undefined
    };
    
    const result = await makeAPICall('/sms/send', 'POST', data);
    showResult('smsResult', result);
    
    if (result && result.status === 'success') {
        document.getElementById('smsForm').reset();
        document.getElementById('charCount').textContent = '0';
        document.getElementById('segmentCount').textContent = '0';
        showNotification('SMS sent successfully!', 'success');
    }
});

// Dashboard Functions
async function loadDashboard() {
    if (!config.apiKey) return;
    
    // Load balance
    const balance = await makeAPICall('/balance', 'GET');
    if (balance && balance.data) {
        document.getElementById('dashTotalUnits').textContent = balance.data.total_units?.toLocaleString() || '--';
        document.getElementById('dashUsedUnits').textContent = balance.data.used_units?.toLocaleString() || '--';
        document.getElementById('dashRemainingUnits').textContent = balance.data.remaining_units?.toLocaleString() || '--';
    }
    
    // Load groups count
    const groups = await makeAPICall('/contacts', 'GET');
    if (groups && groups.data) {
        const groupsArray = Array.isArray(groups.data) ? groups.data : [groups.data];
        document.getElementById('dashGroupCount').textContent = groupsArray.length;
    }
}

// Profile Functions
async function loadProfile() {
    const result = await makeAPICall('/me', 'GET');
    
    if (result && result.data) {
        const profile = result.data;
        const html = `
            <div class="profile-grid">
                <div class="balance-item"><label>Name:</label><span>${profile.name || '--'}</span></div>
                <div class="balance-item"><label>Email:</label><span>${profile.email || '--'}</span></div>
                <div class="balance-item"><label>Phone:</label><span>${profile.phone || '--'}</span></div>
                <div class="balance-item"><label>Country:</label><span>${profile.country || '--'}</span></div>
                <div class="balance-item"><label>Timezone:</label><span>${profile.timezone || '--'}</span></div>
                <div class="balance-item"><label>Status:</label><span>${profile.status || '--'}</span></div>
                <div class="balance-item"><label>Role:</label><span>${profile.role || '--'}</span></div>
                <div class="balance-item"><label>Created:</label><span>${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '--'}</span></div>
            </div>
        `;
        document.getElementById('profileContent').innerHTML = html;
        
        // Update user email
        if (profile.email) {
            document.getElementById('userEmail').textContent = profile.email;
        }
    } else {
        document.getElementById('profileContent').innerHTML = '<p class="text-muted">Failed to load profile</p>';
    }
}

// Balance Functions
async function loadBalance() {
    const result = await makeAPICall('/balance', 'GET');
    
    if (result && result.data) {
        const balance = result.data;
        
        document.getElementById('balTotalUnits').textContent = balance.total_units?.toLocaleString() || '0';
        document.getElementById('balUsedUnits').textContent = balance.used_units?.toLocaleString() || '0';
        document.getElementById('balRemainingUnits').textContent = balance.remaining_units?.toLocaleString() || '0';
        document.getElementById('balUnitType').textContent = balance.unit_type || 'SMS';
        document.getElementById('balLastUpdated').textContent = balance.last_updated ? new Date(balance.last_updated).toLocaleString() : '--';
        
        // Update progress bar
        const percentage = balance.total_units > 0 
            ? ((balance.remaining_units / balance.total_units) * 100).toFixed(1)
            : 0;
        
        const progressFill = document.getElementById('balanceProgress');
        progressFill.style.width = `${percentage}%`;
        progressFill.textContent = `${percentage}% Remaining`;
        
        // Change color based on percentage
        if (percentage < 20) {
            progressFill.style.background = 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)';
        } else if (percentage < 50) {
            progressFill.style.background = 'linear-gradient(90deg, #f59e0b 0%, #4f46e5 100%)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #10b981 0%, #4f46e5 100%)';
        }
    }
}

// Contact Groups Functions
async function loadContactGroups() {
    const result = await makeAPICall('/contacts', 'GET');
    
    const tbody = document.getElementById('groupsTableBody');
    const select1 = document.getElementById('contactGroupFilter');
    const select2 = document.getElementById('newContactGroup');
    
    tbody.innerHTML = '';
    select1.innerHTML = '<option value="">Select a group...</option>';
    select2.innerHTML = '<option value="">Select a group...</option>';
    
    if (result && result.data) {
        const groups = Array.isArray(result.data) ? result.data : [result.data];
        
        if (groups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No groups found</td></tr>';
            return;
        }
        
        groups.forEach(group => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${group.name}</td>
                <td><code>${group.uid}</code></td>
                <td>${group.created_at ? new Date(group.created_at).toLocaleDateString() : '--'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewGroupContacts('${group.uid}')">View Contacts</button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteGroup('${group.uid}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
            
            // Add to selects
            const option1 = document.createElement('option');
            option1.value = group.uid;
            option1.textContent = group.name;
            select1.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = group.uid;
            option2.textContent = group.name;
            select2.appendChild(option2);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Failed to load groups</td></tr>';
    }
}

function viewGroupContacts(groupId) {
    currentGroupId = groupId;
    document.getElementById('contactGroupFilter').value = groupId;
    navigateTo('contacts');
    loadContactsForGroup();
}

async function deleteGroup(groupId) {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    const result = await makeAPICall(`/contacts/${groupId}`, 'DELETE');
    
    if (result && result.status === 'success') {
        showNotification('Group deleted successfully!', 'success');
        loadContactGroups();
    }
}

function showCreateGroupModal() {
    document.getElementById('createGroupModal').classList.add('show');
}

document.getElementById('createGroupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('newGroupName').value;
    const result = await makeAPICall('/contacts', 'POST', { name });
    
    if (result && result.status === 'success') {
        showNotification('Group created successfully!', 'success');
        closeModal('createGroupModal');
        document.getElementById('createGroupForm').reset();
        loadContactGroups();
    }
});

// Contacts Functions
async function loadContactsForGroup() {
    const groupId = document.getElementById('contactGroupFilter').value;
    
    if (!groupId) {
        document.getElementById('contactsTableBody').innerHTML = '<tr><td colspan="6" class="text-center text-muted">Select a group to view contacts</td></tr>';
        return;
    }
    
    currentGroupId = groupId;
    const result = await makeAPICall(`/contacts/${groupId}/all`, 'POST');
    
    const tbody = document.getElementById('contactsTableBody');
    tbody.innerHTML = '';
    
    if (result && result.data) {
        const contacts = Array.isArray(result.data) ? result.data : [result.data];
        
        if (contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No contacts in this group</td></tr>';
            return;
        }
        
        contacts.forEach(contact => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${contact.phone}</td>
                <td>${contact.first_name || '--'}</td>
                <td>${contact.last_name || '--'}</td>
                <td><code>${contact.uid}</code></td>
                <td>${contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '--'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="deleteContact('${groupId}', '${contact.uid}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Failed to load contacts</td></tr>';
    }
}

async function deleteContact(groupId, contactUid) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    const result = await makeAPICall(`/contacts/${groupId}/delete/${contactUid}`, 'DELETE');
    
    if (result && result.status === 'success') {
        showNotification('Contact deleted successfully!', 'success');
        loadContactsForGroup();
    }
}

function showCreateContactModal() {
    document.getElementById('createContactModal').classList.add('show');
}

document.getElementById('createContactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const groupId = document.getElementById('newContactGroup').value;
    const data = {
        phone: document.getElementById('newContactPhone').value,
        first_name: document.getElementById('newContactFirstName').value,
        last_name: document.getElementById('newContactLastName').value
    };
    
    const result = await makeAPICall(`/contacts/${groupId}/store`, 'POST', data);
    
    if (result && result.status === 'success') {
        showNotification('Contact added successfully!', 'success');
        closeModal('createContactModal');
        document.getElementById('createContactForm').reset();
        
        if (currentGroupId === groupId) {
            loadContactsForGroup();
        }
    }
});

// Templates Functions
async function loadTemplates() {
    const result = await makeAPICall('/templates', 'GET');
    
    const tbody = document.getElementById('templatesTableBody');
    tbody.innerHTML = '';
    
    if (result && result.templates) {
        const templates = result.templates;
        
        if (templates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No templates found</td></tr>';
            return;
        }
        
        templates.forEach(template => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${template.name}</td>
                <td>${template.content}</td>
                <td>${template.variables.join(', ') || '--'}</td>
                <td>${template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '--'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="deleteTemplate('${template.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Failed to load templates</td></tr>';
    }
}

async function deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    const result = await makeAPICall(`/templates/${templateId}`, 'DELETE');
    
    if (result && result.status === 'success') {
        showNotification('Template deleted successfully!', 'success');
        loadTemplates();
    }
}

function showCreateTemplateModal() {
    document.getElementById('createTemplateModal').classList.add('show');
}

document.getElementById('createTemplateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const variablesStr = document.getElementById('newTemplateVariables').value;
    const variables = variablesStr ? variablesStr.split(',').map(v => v.trim()) : [];
    
    const data = {
        name: document.getElementById('newTemplateName').value,
        content: document.getElementById('newTemplateContent').value,
        variables: variables
    };
    
    const result = await makeAPICall('/templates', 'POST', data);
    
    if (result && result.status === 'success') {
        showNotification('Template created successfully!', 'success');
        closeModal('createTemplateModal');
        document.getElementById('createTemplateForm').reset();
        loadTemplates();
    }
});

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// API Functions
async function makeAPICall(endpoint, method, data = null) {
    if (!config.apiKey && config.authMethod === 'apiKey') {
        showNotification('Please configure your API key in Settings', 'error');
        return null;
    }
    
    const url = `${config.baseUrl}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (config.authMethod === 'apiKey') {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    
    const options = {
        method,
        headers
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            showNotification(result.message || 'API request failed', 'error');
        }
        
        return result;
    } catch (error) {
        showNotification(error.message || 'Network error', 'error');
        return null;
    }
}

// Helper Functions
function showResult(elementId, data) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    element.classList.add('show');
}

function showAlert(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `alert show ${type}`;
    
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('talksasa_config');
        location.reload();
    }
}

// Initialize
console.log('TalkSASA Account Management Dashboard loaded');
