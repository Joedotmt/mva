// --- Configuration ---
const POCKETBASE_URL = 'http://127.0.0.1:8090'; // IMPORTANT: REPLACE IF NEEDED
const MEMBERSHIP_FEE = 10; // Annual membership fee in EUR

// --- UI Elements ---
const loadingIndicator = document.getElementById('loading-indicator');
const messageDialogEl = document.getElementById('message-dialog');
const messageDialogTitle = document.getElementById('message-dialog-title');
const messageDialogText = document.getElementById('message-dialog-text');

const adminEmailSpan = document.getElementById('admin-email');
const logoutBtn = document.getElementById('logout-btn');
const adminContentMain = document.getElementById('admin-content-main');
const adminContent = document.getElementById('admin-content');
const veteransTableBody = document.getElementById('veterans-table-body');
const statusFilterBtn = document.getElementById('status-filter-btn');
const statusFilterBtnText = document.getElementById('status-filter-btn-text');
const statusFilterMenu = document.getElementById('status-filter-menu');
const searchInput = document.getElementById('search-input');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const totalVeteransDisplayed = document.getElementById('total-veterans-displayed');

const confirmActionDialogEl = document.getElementById('confirm-action-dialog');
const confirmActionTitle = document.getElementById('confirm-action-title');
const confirmActionText = document.getElementById('confirm-action-text');
const confirmActionConfirmBtn = document.getElementById('confirm-action-confirm-btn');
let currentActionCallback = null;

// Member Details Drawer Elements
const memberDetailsDrawer = document.getElementById('member-details-drawer');
const detailsPanelPlaceholder = document.getElementById('details-panel-placeholder');
const detailsPanelContent = document.getElementById('details-panel-content');
const detailsPanelFooterActions = document.getElementById('details-panel-footer-actions');
const memberDetailsDrawerTitle = document.getElementById('member-details-drawer-title');

// View Mode Elements
const viewFullName = document.getElementById('view-full_name');
const viewIdCardNumber = document.getElementById('view-id_card_number');
const viewFullAddress = document.getElementById('view-full_address');
const viewPhoneNumber = document.getElementById('view-phone_number');
const viewEmail = document.getElementById('view-email');
const viewNextOfKinFullName = document.getElementById('view-next_of_kin_full_name');
const viewNextOfKinFullPhoneNumber = document.getElementById('view-next_of_kin_full_phone_number');
const viewNextOfKinRelationship = document.getElementById('view-next_of_kin_relationship');
const viewStatus = document.getElementById('view-status');
const viewApplicationDate = document.getElementById('view-applicationDate');
const viewRegistrationDate = document.getElementById('view-registrationDate');
const viewLastPaymentDate = document.getElementById('view-lastPaymentDate');
const viewAmountOwed = document.getElementById('view-amountOwed'); // New
const viewNextDueDate = document.getElementById('view-nextDueDate');
const viewAdminNote = document.getElementById('view-admin_note');

// Edit Mode Elements
const detailFullName = document.getElementById('detail-full_name');
const detailIdCardNumber = document.getElementById('detail-id_card_number');
const detailFullAddress = document.getElementById('detail-full_address');
const detailPhoneNumber = document.getElementById('detail-phone_number');
const detailEmail = document.getElementById('detail-email');
const detailNextOfKinFullName = document.getElementById('detail-next_of_kin_full_name');
const detailNextOfKinFullPhoneNumber = document.getElementById('detail-next_of_kin_full_phone_number');
const detailNextOfKinRelationship = document.getElementById('detail-next_of_kin_relationship');
const detailStatusEditBtn = document.getElementById('detail-status-edit-btn');
const detailStatusEditBtnText = document.getElementById('detail-status-edit-btn-text');
const detailStatusEditMenu = document.getElementById('detail-status-edit-menu');
const detailApplicationDate = document.getElementById('detail-applicationDate');
const detailRegistrationDate = document.getElementById('detail-registrationDate');
const detailLastPaymentDate = document.getElementById('detail-lastPaymentDate');
const detailAmountOwed = document.getElementById('detail-amountOwed'); // New
const detailNextDueDate = document.getElementById('detail-nextDueDate');
const detailAdminNoteEdit = document.getElementById('detail-admin_note-edit');
const deleteVeteranBtn = document.getElementById('delete-veteran-btn');

const memberDetailsEditBtn = document.getElementById('member-details-edit-btn');
const memberDetailsSaveBtn = document.getElementById('member-details-save-btn');
const memberDetailsCancelEditBtn = document.getElementById('member-details-cancel-edit-btn');

let currentEditingVeteranId = null;
let isMemberDetailsEditMode = false;
let originalVeteranDataForEdit = null;
let activeTableRow = null;

let pb = null;
let allVeterans = [];
let displayedVeterans = [];
let currentStatusFilterValue = "";

function showLoading() { loadingIndicator.classList.remove('hidden'); loadingIndicator.classList.add('flex'); }
function hideLoading() { loadingIndicator.classList.add('hidden'); loadingIndicator.classList.remove('flex'); }

function showMessage(title, text)
{
    messageDialogTitle.textContent = title;
    messageDialogText.textContent = text;
    ui("#message-dialog");
}

function showConfirmActionModal(title, text, callback)
{
    confirmActionTitle.textContent = title;
    confirmActionText.textContent = text;
    currentActionCallback = callback;
    ui("#confirm-action-dialog");
}
confirmActionConfirmBtn.addEventListener('click', () =>
{
    if (typeof currentActionCallback === 'function')
    {
        currentActionCallback();
    }
    ui("#confirm-action-dialog").close();
});

async function calculateAmountOwedAndOverdueStatus(veteranId, veteranStatus, veteranCreatedDate)
{
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day for comparisons

    if (veteranStatus === 'Archive')
    {
        return { amountOwed: 0, isOverdue: false, nextDueDate: null, lastPaymentDate: null };
    }

    const lastPaymentTransaction = await getLastPaymentTransaction(veteranId);
    let lastPaymentDate = null;
    if (lastPaymentTransaction)
    {
        lastPaymentDate = new Date(lastPaymentTransaction.created);
    }

    let nextDueDate = null;
    let amountOwed = 0;
    let isOverdue = false;

    if (veteranStatus === 'Application')
    {
        amountOwed = MEMBERSHIP_FEE;
        isOverdue = true; // Applications are always considered "overdue" for initial payment
        // Next due date for an application isn't strictly defined until they become a member
    } else if (veteranStatus === 'Member')
    {
        if (lastPaymentDate)
        {
            nextDueDate = new Date(lastPaymentDate);
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            nextDueDate.setHours(0, 0, 0, 0); // Normalize for comparison

            if (today >= nextDueDate)
            {
                amountOwed = MEMBERSHIP_FEE;
                isOverdue = true;
            } else
            {
                amountOwed = 0;
                isOverdue = false;
            }
        } else
        {
            // Member with no payment transactions yet (e.g. status manually set to Member, or first payment pending)
            amountOwed = MEMBERSHIP_FEE;
            isOverdue = true;
            // nextDueDate could be considered 1 year from their 'created' date if no payment
            if (veteranCreatedDate)
            {
                nextDueDate = new Date(veteranCreatedDate);
                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                nextDueDate.setHours(0, 0, 0, 0);
                if (today >= nextDueDate)
                { // Re-check overdue if created date was long ago
                    isOverdue = true;
                } else
                {
                    // If created recently and next due is in future, not overdue yet for this specific case
                    // but still owe initial fee.
                    isOverdue = true; // Still overdue for the *initial* payment
                }
            }
        }
    }
    // Else (Archive), amountOwed is 0, isOverdue is false (handled at the top)

    return {
        amountOwed: amountOwed,
        isOverdue: isOverdue,
        nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
        lastPaymentDate: lastPaymentDate ? lastPaymentDate.toISOString() : null
    };
}


async function populateMemberDetailsForm(veteran, isEdit = false)
{
    document.getElementById('view-mode-content').classList.toggle('hidden', isEdit);
    document.getElementById('edit-mode-content').classList.toggle('hidden', !isEdit);

    const paymentInfo = await calculateAmountOwedAndOverdueStatus(veteran.id, veteran.status, veteran.created);
    const amountOwedText = `€${paymentInfo.amountOwed.toFixed(2)}${paymentInfo.isOverdue ? ' (Overdue)' : ''}`;

    let registrationDateDisplay = 'N/A';
    if (veteran.status === 'Member')
    {
        const firstPaymentTransaction = await getFirstPaymentTransaction(veteran.id);
        registrationDateDisplay = formatDate(firstPaymentTransaction ? firstPaymentTransaction.created : veteran.created);
    } else
    {
        const firstPaymentTransaction = await getFirstPaymentTransaction(veteran.id); // Check if they were ever a member
        if (firstPaymentTransaction)
        {
            registrationDateDisplay = formatDate(firstPaymentTransaction.created);
        }
    }


    if (isEdit)
    {
        detailFullName.value = veteran.full_name || '';
        detailIdCardNumber.value = veteran.id_card_number || '';
        detailFullAddress.value = veteran.full_address || '';
        detailPhoneNumber.value = veteran.phone_number || '';
        detailEmail.value = veteran.email || '';
        detailNextOfKinFullName.value = veteran.next_of_kin_full_name || '';
        detailNextOfKinFullPhoneNumber.value = veteran.next_of_kin_full_phone_number || '';
        detailNextOfKinRelationship.value = veteran.next_of_kin_relationship || '';
        detailAdminNoteEdit.value = veteran.admin_note || '';

        detailApplicationDate.value = formatDate(veteran.created);
        detailRegistrationDate.value = registrationDateDisplay;
        detailLastPaymentDate.value = formatDate(paymentInfo.lastPaymentDate);
        detailAmountOwed.value = amountOwedText;
        detailNextDueDate.value = formatDate(paymentInfo.nextDueDate);

        const statusToSet = veteran.status || '';
        const selectedLi = Array.from(detailStatusEditMenu.querySelectorAll('li')).find(li => li.dataset.value === statusToSet);
        detailStatusEditBtnText.textContent = selectedLi ? selectedLi.textContent : 'Select Status';
        detailStatusEditBtn.dataset.selectedValue = statusToSet;
        ui();
    } else
    {
        viewFullName.textContent = veteran.full_name || 'N/A';
        viewIdCardNumber.textContent = veteran.id_card_number || 'N/A';
        viewFullAddress.textContent = veteran.full_address || 'N/A';
        viewPhoneNumber.textContent = veteran.phone_number || 'N/A';
        viewEmail.textContent = veteran.email || 'N/A';
        viewNextOfKinFullName.textContent = veteran.next_of_kin_full_name || 'N/A';
        viewNextOfKinFullPhoneNumber.textContent = veteran.next_of_kin_full_phone_number || 'N/A';
        viewNextOfKinRelationship.textContent = veteran.next_of_kin_relationship || 'N/A';
        viewAdminNote.textContent = veteran.admin_note || 'No notes available';

        viewApplicationDate.textContent = formatDate(veteran.created);
        viewRegistrationDate.textContent = registrationDateDisplay;
        viewLastPaymentDate.textContent = formatDate(paymentInfo.lastPaymentDate);
        viewAmountOwed.innerHTML = `${amountOwedText}`; // Display with overdue flag
        viewNextDueDate.textContent = formatDate(paymentInfo.nextDueDate);

        viewStatus.textContent = veteran.status || 'Unknown';
        viewStatus.className = `status-badge chip round large ${getStatusBadgeClass(veteran.status)}`;
    }
}

async function setMemberDetailsMode(isEdit)
{
    isMemberDetailsEditMode = isEdit;
    const veteran = allVeterans.find(m => m.id === currentEditingVeteranId);
    if (!veteran && isEdit)
    {
        showMessage("Error", "Cannot enter edit mode: veteran data not found.");
        return;
    }
    const dataToDisplay = isEdit ? veteran : (originalVeteranDataForEdit || veteran);
    if (dataToDisplay)
    {
        await populateMemberDetailsForm(dataToDisplay, isEdit);
    }

    memberDetailsEditBtn.classList.toggle('hidden', isEdit);
    memberDetailsSaveBtn.classList.toggle('hidden', !isEdit);
    memberDetailsCancelEditBtn.classList.toggle('hidden', !isEdit);
    memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>';
    memberDetailsSaveBtn.classList.remove('success');
}

async function openMemberDetailsPanel(veteranId, rowElement)
{
    if (activeTableRow)
    {
        activeTableRow.classList.remove('active-row');
    }
    activeTableRow = rowElement;
    if (activeTableRow) activeTableRow.classList.add('active-row');

    const veteran = allVeterans.find(m => m.id === veteranId);
    if (!veteran)
    {
        showMessage("Error", "Veteran details not found.");
        return;
    }
    currentEditingVeteranId = veteranId;
    originalVeteranDataForEdit = { ...veteran };
    memberDetailsDrawerTitle.textContent = `Details for ${veteran.full_name || 'Veteran'}`;

    showLoading();
    await setMemberDetailsMode(false);
    hideLoading();

    detailsPanelPlaceholder.classList.add('hidden');
    detailsPanelContent.classList.remove('hidden');
    detailsPanelFooterActions.classList.remove('hidden');
    ui("#member-details-drawer");
}

function closeMemberDetailsPanelLogic()
{
    if (activeTableRow)
    {
        activeTableRow.classList.remove('active-row');
        activeTableRow = null;
    }
    setMemberDetailsMode(false);

    detailsPanelPlaceholder.classList.remove('hidden');
    detailsPanelContent.classList.add('hidden');
    detailsPanelFooterActions.classList.add('hidden');

    currentEditingVeteranId = null;
    originalVeteranDataForEdit = null;
}

const closeDetailsBtn = memberDetailsDrawer.querySelector('.close-details-btn');
closeDetailsBtn.addEventListener('click', () => { ui("#member-details-drawer").close(); });
memberDetailsDrawer.addEventListener('close', closeMemberDetailsPanelLogic);


memberDetailsEditBtn.addEventListener('click', () => setMemberDetailsMode(true));
memberDetailsCancelEditBtn.addEventListener('click', async () =>
{
    if (originalVeteranDataForEdit)
    {
        showLoading();
        await populateMemberDetailsForm(originalVeteranDataForEdit, false);
        hideLoading();
    }
    setMemberDetailsMode(false);
});

memberDetailsSaveBtn.addEventListener('click', async () =>
{
    if (!currentEditingVeteranId) return;
    showLoading();
    memberDetailsSaveBtn.disabled = true;

    const updatedData = {
        full_name: detailFullName.value,
        id_card_number: detailIdCardNumber.value,
        full_address: detailFullAddress.value,
        phone_number: detailPhoneNumber.value,
        email: detailEmail.value,
        next_of_kin_full_name: detailNextOfKinFullName.value,
        next_of_kin_full_phone_number: detailNextOfKinFullPhoneNumber.value,
        next_of_kin_relationship: detailNextOfKinRelationship.value,
        status: detailStatusEditBtn.dataset.selectedValue || (originalVeteranDataForEdit ? originalVeteranDataForEdit.status : ''),
        admin_note: detailAdminNoteEdit.value,
    };

    try
    {
        const updatedRecord = await pb.collection('veterans').update(currentEditingVeteranId, updatedData);
        const veteranIndex = allVeterans.findIndex(m => m.id === currentEditingVeteranId);
        if (veteranIndex > -1)
        {
            allVeterans[veteranIndex] = { ...allVeterans[veteranIndex], ...updatedRecord };
        }
        originalVeteranDataForEdit = { ...allVeterans[veteranIndex] };

        await setMemberDetailsMode(false);
        filterAndDisplayVeterans();

        memberDetailsSaveBtn.innerHTML = '<span>Saved!</span><i>check</i>';
        memberDetailsSaveBtn.classList.add('success');
        setTimeout(() =>
        {
            memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>';
            memberDetailsSaveBtn.classList.remove('success');
        }, 2000);

    } catch (error)
    {
        console.error("Error updating veteran details:", error);
        let errMsg = "Failed to save changes. ";
        if (error.data && error.data.data)
        {
            Object.values(error.data.data).forEach(err => errMsg += `${err.message} `);
        } else if (error.message)
        {
            errMsg += error.message;
        }
        showMessage("Save Error", errMsg);
    } finally
    {
        hideLoading();
        memberDetailsSaveBtn.disabled = false;
    }
});

deleteVeteranBtn.addEventListener('click', async () =>
{
    if (!currentEditingVeteranId) return;
    const veteranToDelete = originalVeteranDataForEdit || allVeterans.find(v => v.id === currentEditingVeteranId);
    const veteranName = veteranToDelete?.full_name || 'this veteran';

    showConfirmActionModal(
        'Delete Veteran',
        `Are you sure you want to permanently delete ${veteranName}? This action cannot be undone.`,
        async () =>
        {
            showLoading();
            try
            {
                const transactions = await pb.collection('transactions').getFullList({ filter: `veteran = "${currentEditingVeteranId}"` });
                for (const transaction of transactions)
                {
                    await pb.collection('transactions').delete(transaction.id);
                }

                await pb.collection('veterans').delete(currentEditingVeteranId);
                showMessage("Success", `${veteranName} deleted successfully.`);
                ui("#member-details-drawer").close();
                await fetchVeterans();
            } catch (error)
            {
                console.error("Error deleting veteran:", error);
                showMessage("Delete Error", `Failed to delete ${veteranName}. ${error.data?.message || error.message}`);
            } finally
            {
                hideLoading();
            }
        }
    );
});

async function initAdminPage()
{
    try
    {
        pb = new PocketBase(POCKETBASE_URL);
        if (!pb.authStore.isValid)
        {
            window.location.href = 'login.html';
            return;
        }
        const user = pb.authStore.model;
        adminEmailSpan.textContent = user.email;
        adminContent.classList.remove('hidden');
        await fetchVeterans();
    } catch (error)
    {
        console.error("Initialization error:", error);
        showMessage("Error", "Failed to initialize admin panel. Please try logging in again.");
        window.location.href = 'login.html';
    }
}

async function handleLogout()
{
    showLoading();
    try
    {
        pb.authStore.clear();
        window.location.href = 'login.html';
    } catch (error)
    {
        console.error("Logout failed:", error);
        showMessage("Logout Error", "An error occurred during logout.");
    } finally
    {
        hideLoading();
    }
}

async function fetchVeterans()
{
    showLoading();
    veteransTableBody.innerHTML = `<tr><td colspan="7" class="center-align large-padding">Loading veterans...</td></tr>`;
    try
    {
        const records = await pb.collection('veterans').getFullList({
            sort: '-created',
        });
        allVeterans = records;
        await filterAndDisplayVeterans(); // Ensure this is awaited
        if (currentEditingVeteranId && memberDetailsDrawer.open)
        {
            const stillCurrentVeteran = allVeterans.find(m => m.id === currentEditingVeteranId);
            if (stillCurrentVeteran)
            {
                originalVeteranDataForEdit = { ...stillCurrentVeteran };
                await populateMemberDetailsForm(stillCurrentVeteran, isMemberDetailsEditMode);
            } else
            {
                ui("#member-details-drawer").close();
            }
        }
    } catch (error)
    {
        console.error("Error fetching veterans:", error);
        veteransTableBody.innerHTML = `<tr><td colspan="7" class="center-align large-padding red-text">Failed to load veterans. Please try again.</td></tr>`;
        showMessage("Fetch Error", "Could not retrieve veteran data.");
    } finally
    {
        hideLoading();
    }
}

function getStatusBadgeClass(status)
{
    switch (status)
    {
        case 'Application': return 'status-application';
        case 'Member': return 'status-member';
        case 'Archive': return 'status-archive';
        default: return 'grey';
    }
}

function formatDate(dateString)
{
    if (!dateString) return 'N/A';
    try
    {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e)
    {
        return 'Invalid Date Format';
    }
}

async function getLastPaymentTransaction(veteranId)
{
    if (!pb) return null;
    try
    {
        const transactions = await pb.collection('transactions').getFullList({
            filter: `veteran = "${veteranId}"`,
            sort: '-created',
            perPage: 1,
        });
        return transactions.length > 0 ? transactions[0] : null;
    } catch (error)
    {
        console.error(`Error fetching last payment transaction for ${veteranId}:`, error);
        return null;
    }
}

async function getFirstPaymentTransaction(veteranId)
{
    if (!pb) return null;
    try
    {
        const transactions = await pb.collection('transactions').getFullList({
            filter: `veteran = "${veteranId}"`,
            sort: 'created',
            perPage: 1,
        });
        return transactions.length > 0 ? transactions[0] : null;
    } catch (error)
    {
        console.error(`Error fetching first payment transaction for ${veteranId}:`, error);
        return null;
    }
}


async function renderVeteransTable(veteransToRender)
{
    veteransTableBody.innerHTML = '';
    if (veteransToRender.length === 0)
    {
        veteransTableBody.innerHTML = `<tr><td colspan="7" class="center-align large-padding">No veterans match the current filters.</td></tr>`;
        totalVeteransDisplayed.textContent = 0;
        return;
    }

    for (const veteran of veteransToRender)
    {
        const row = veteransTableBody.insertRow();
        row.dataset.veteranId = veteran.id;
        row.classList.add('ripple');
        if (veteran.id === currentEditingVeteranId)
        {
            row.classList.add('active-row');
            activeTableRow = row;
        }
        row.onclick = () => openMemberDetailsPanel(veteran.id, row);

        row.insertCell().textContent = veteran.full_name || 'N/A';
        row.insertCell().textContent = veteran.id_card_number || 'N/A';
        row.insertCell().textContent = veteran.email || 'N/A';

        const statusCell = row.insertCell();
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${getStatusBadgeClass(veteran.status)}`;
        statusBadge.textContent = veteran.status || 'Unknown';
        statusCell.appendChild(statusBadge);

        const paymentInfo = await calculateAmountOwedAndOverdueStatus(veteran.id, veteran.status, veteran.created);
        const amountOwedCell = row.insertCell();
        amountOwedCell.textContent = `€${paymentInfo.amountOwed.toFixed(2)}`;
        if (paymentInfo.isOverdue && paymentInfo.amountOwed > 0)
        {
            const overdueSpan = document.createElement('span');
            overdueSpan.className = 'overdue-indicator';
            overdueSpan.textContent = '(Overdue)';
            amountOwedCell.appendChild(overdueSpan);
        }

        row.insertCell().textContent = formatDate(paymentInfo.nextDueDate);


        const actionsCell = row.insertCell();
        actionsCell.onclick = (e) => e.stopPropagation();
        const navActions = document.createElement('nav');
        navActions.className = 'flex wrap gap-small';

        if (veteran.status === 'Application')
        {
            const setMemberBtn = document.createElement('button');
            setMemberBtn.innerHTML = '<i>check</i><span>Set Member</span>';
            setMemberBtn.className = 'small round primary responsive';
            setMemberBtn.onclick = (e) => { e.stopPropagation(); confirmUpdateVeteranStatus(veteran.id, 'Member', veteran.full_name, "set their status to Member and mark initial payment as due"); };
            navActions.appendChild(setMemberBtn);

            const archiveAppBtn = document.createElement('button');
            archiveAppBtn.innerHTML = '<i>archive</i><span>Archive</span>';
            archiveAppBtn.className = 'small round responsive';
            archiveAppBtn.onclick = (e) => { e.stopPropagation(); confirmUpdateVeteranStatus(veteran.id, 'Archive', veteran.full_name, "archive this application"); };
            navActions.appendChild(archiveAppBtn);
        }

        if (veteran.status === 'Member')
        {
            const recordPaymentBtn = document.createElement('button');
            recordPaymentBtn.innerHTML = '<i>payment</i><span>Record Payment</span>';
            recordPaymentBtn.className = 'small round primary responsive';
            recordPaymentBtn.onclick = (e) => { e.stopPropagation(); confirmRecordPayment(veteran.id, veteran.full_name); };
            navActions.appendChild(recordPaymentBtn);

            const archiveMemberBtn = document.createElement('button');
            archiveMemberBtn.innerHTML = '<i>archive</i><span>Archive</span>';
            archiveMemberBtn.className = 'small round responsive';
            archiveMemberBtn.onclick = (e) => { e.stopPropagation(); confirmUpdateVeteranStatus(veteran.id, 'Archive', veteran.full_name, "archive the member"); };
            navActions.appendChild(archiveMemberBtn);
        }
        if (veteran.status === 'Archive')
        {
            const reopenBtn = document.createElement('button');
            reopenBtn.innerHTML = '<i>unarchive</i><span>Re-Open</span>';
            reopenBtn.className = 'small round responsive'; // Default style
            reopenBtn.onclick = (e) => { e.stopPropagation(); confirmUpdateVeteranStatus(veteran.id, 'Application', veteran.full_name, "re-open this application (status will be Application)"); };
            navActions.appendChild(reopenBtn);
        }

        actionsCell.appendChild(navActions);
    }
    totalVeteransDisplayed.textContent = veteransToRender.length;
}

async function filterAndDisplayVeterans()
{
    const statusValue = currentStatusFilterValue;
    const searchTerm = searchInput.value.toLowerCase();

    displayedVeterans = allVeterans.filter(veteran =>
    {
        const matchesStatus = !statusValue || veteran.status === statusValue;
        const matchesSearch = !searchTerm ||
            (veteran.full_name && veteran.full_name.toLowerCase().includes(searchTerm)) ||
            (veteran.id_card_number && veteran.id_card_number.toLowerCase().includes(searchTerm)) ||
            (veteran.email && veteran.email.toLowerCase().includes(searchTerm));
        return matchesStatus && matchesSearch;
    });
    await renderVeteransTable(displayedVeterans);
}

async function confirmUpdateVeteranStatus(veteranId, newStatus, veteranName, actionText)
{
    showConfirmActionModal(
        `Confirm Status Change`,
        `Are you sure you want to ${actionText} ${veteranName || 'this veteran'}?`,
        async () =>
        {
            showLoading();
            try
            {
                await pb.collection('veterans').update(veteranId, { status: newStatus });
                // No automatic payment transaction on status change alone.
                // "Record Payment" is a separate action.
                await fetchVeterans();
                if (currentEditingVeteranId === veteranId && memberDetailsDrawer.open)
                {
                    const updatedVeteran = allVeterans.find(m => m.id === veteranId);
                    if (updatedVeteran)
                    {
                        originalVeteranDataForEdit = { ...updatedVeteran };
                        await populateMemberDetailsForm(updatedVeteran, isMemberDetailsEditMode);
                    }
                }
                showMessage("Success", `${veteranName || 'Veteran'}'s status updated to ${newStatus}.`);
            } catch (error)
            {
                console.error("Error updating status:", error);
                showMessage("Update Error", `Failed to update status for ${veteranName}. ${error.data?.message || error.message}`);
            } finally
            {
                hideLoading();
            }
        }
    );
}

async function confirmRecordPayment(veteranId, veteranName)
{
    showConfirmActionModal(
        `Confirm Payment`,
        `Record a payment of €${MEMBERSHIP_FEE.toFixed(2)} for ${veteranName || 'this veteran'}?`,
        async () =>
        {
            showLoading();
            try
            {
                await pb.collection('transactions').create({
                    veteran: veteranId,
                    amount_paid: MEMBERSHIP_FEE,
                });

                const veteran = allVeterans.find(v => v.id === veteranId);
                if (veteran && veteran.status === 'Application')
                { // If they were an application, make them a member
                    await pb.collection('veterans').update(veteranId, { status: 'Member' });
                }

                await fetchVeterans();

                if (currentEditingVeteranId === veteranId && memberDetailsDrawer.open)
                {
                    const updatedVeteran = allVeterans.find(m => m.id === veteranId);
                    if (updatedVeteran)
                    {
                        originalVeteranDataForEdit = { ...updatedVeteran };
                        await populateMemberDetailsForm(updatedVeteran, isMemberDetailsEditMode);
                    }
                }
                showMessage("Success", `Payment of €${MEMBERSHIP_FEE.toFixed(2)} recorded for ${veteranName || 'Veteran'}.`);
            } catch (error)
            {
                console.error("Error recording payment:", error);
                showMessage("Payment Error", `Failed to record payment for ${veteranName}. ${error.data?.message || error.message}`);
            } finally
            {
                hideLoading();
            }
        }
    );
}

logoutBtn.addEventListener('click', handleLogout);
statusFilterMenu.querySelectorAll('li').forEach(item =>
{
    item.addEventListener('click', () =>
    {
        currentStatusFilterValue = item.dataset.value;
        statusFilterBtnText.textContent = item.textContent;
        ui('#status-filter-menu');
        if (document.getElementById("status-filter-menu").classList.contains("active"))
        {
            document.getElementById("status-filter-menu").classList.remove("active");
        }
        filterAndDisplayVeterans();
    });
});
searchInput.addEventListener('input', filterAndDisplayVeterans);
resetFiltersBtn.addEventListener('click', () =>
{
    currentStatusFilterValue = "";
    statusFilterBtnText.textContent = "All";
    searchInput.value = '';
    filterAndDisplayVeterans();
});

document.addEventListener('DOMContentLoaded', () =>
{
    ui();
    detailStatusEditMenu.querySelectorAll('li').forEach(item =>
    {
        item.addEventListener('click', () =>
        {
            detailStatusEditBtnText.textContent = item.textContent;
            detailStatusEditBtn.dataset.selectedValue = item.dataset.value;
            ui('#detail-status-edit-menu');
            if (document.getElementById("detail-status-edit-menu").classList.contains("active"))
            {
                document.getElementById("detail-status-edit-menu").classList.remove("active");
            }
        });
    });
    document.querySelectorAll('menu li').forEach(li =>
    {
        li.classList.add('ripple');
    });
    initAdminPage();
    document.addEventListener('keydown', (event) =>
    {
        if (event.key === 'Escape')
        {
            if (confirmActionDialogEl.open)
            {
                ui('#confirm-action-dialog');
                event.preventDefault();
            } else if (messageDialogEl.open)
            {
                ui('#message-dialog');
                event.preventDefault();
            } else if (memberDetailsDrawer.open)
            {
                ui('#member-details-drawer');
                event.preventDefault();
            }
        }
    });
});