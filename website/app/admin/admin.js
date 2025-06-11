// --- UI Elements (Admin Specific) ---
// Note: 'loadingIndicator', 'messageDialogEl', 'messageDialogTitle', 'messageDialogText'
// are assumed to be in the HTML and will be used by shared functions.

const adminEmailSpan = document.getElementById('admin-email');
const adminLogoutBtn = document.getElementById('logout-btn');
const adminContentMain = document.getElementById('admin-content-main');
const adminContent = document.getElementById('admin-content');
const veteransListContainerEl = document.getElementById('veterans-list-container');
const veteransListInitialLoadingEl = document.getElementById('veterans-list-initial-loading');
const statusFilterBtn = document.getElementById('status-filter-btn');
const statusFilterBtnText = document.getElementById('status-filter-btn-text');
const statusFilterMenu = document.getElementById('status-filter-menu');
const searchInput = document.getElementById('search-input');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const totalVeteransDisplayed = document.getElementById('total-veterans-displayed');

// Confirmation Dialog Elements
const confirmActionDialogEl = document.getElementById('confirm-action-dialog');
const confirmActionTitle = document.getElementById('confirm-action-title');
const confirmActionText = document.getElementById('confirm-action-text');
const confirmActionConfirmBtn = document.getElementById('confirm-action-confirm-btn');
let currentActionCallback = null;

// Member Details Drawer Elements
const memberDetailsDrawer = document.getElementById('member-details-drawer');
const detailsPanelContent = document.getElementById('details-panel-content'); // Main content area
const detailsPanelFooterActions = document.getElementById('details-panel-footer-actions');
const memberDetailsDrawerTitle = document.getElementById('member-details-drawer-title');
const drawerContentLoader = document.getElementById('drawer-content-loader'); // Drawer specific loader

// View Mode Element IDs (used to target the static text display areas)
// These are primarily for easily finding the elements to update their textContent or hide/show
// Actual input elements will be created dynamically.

// --- Configuration for Editable Fields ---
const editableFieldsConfig = [
    { key: 'full_name', type: 'text', label: 'Full Name', viewId: 'view-full_name' },
    { key: 'id_card_number', type: 'text', label: 'ID Card Number', viewId: 'view-id_card_number' },
    { key: 'full_address', type: 'textarea', label: 'Full Address', viewId: 'view-full_address' },
    { key: 'phone_number', type: 'tel', label: 'Phone Number', viewId: 'view-phone_number' },
    { key: 'email', type: 'email', label: 'Email', viewId: 'view-email' },
    { key: 'next_of_kin_full_name', type: 'text', label: 'NOK Name', viewId: 'view-next_of_kin_full_name' },
    { key: 'next_of_kin_full_phone_number', type: 'tel', label: 'NOK Phone', viewId: 'view-next_of_kin_full_phone_number' },
    { key: 'next_of_kin_relationship', type: 'text', label: 'NOK Relationship', viewId: 'view-next_of_kin_relationship' },
    { key: 'admin_note', type: 'textarea', label: 'Admin Notes', viewId: 'view-admin_note' },
];


// Buttons for drawer actions
const memberDetailsEditBtn = document.getElementById('member-details-edit-btn');
const memberDetailsSaveBtn = document.getElementById('member-details-save-btn');
const memberDetailsCancelEditBtn = document.getElementById('member-details-cancel-edit-btn');
const deleteVeteranBtn = document.getElementById('delete-veteran-btn'); // Moved here as it's part of the unified form now

// --- PocketBase Client & State ---
let pb = null;
let allVeterans = [];
let displayedVeterans = [];
let currentStatusFilterValue = "";
let currentEditingVeteranId = null;
let isMemberDetailsEditMode = false;
let originalVeteranDataForEdit = null;
let activeListItem = null;

// --- Admin Specific Utility Functions ---
function showConfirmActionModal(title, text, callback) {
    if (confirmActionTitle) confirmActionTitle.textContent = title;
    if (confirmActionText) confirmActionText.textContent = text;
    currentActionCallback = callback;

    if (confirmActionDialogEl && typeof ui === 'function') {
        ui("#confirm-action-dialog");
    } else {
        console.warn('Confirmation dialog elements or BeerCSS ui() not found.');
        if (window.confirm(`${title}\n${text}`)) {
            if (typeof callback === 'function') callback();
        }
    }
}

if (confirmActionConfirmBtn) {
    confirmActionConfirmBtn.addEventListener('click', () => {
        if (typeof currentActionCallback === 'function') {
            currentActionCallback();
        }
        if (confirmActionDialogEl && typeof ui === 'function') {
            ui("#confirm-action-dialog").close();
        }
        currentActionCallback = null;
    });
}

// --- Veteran Data Management Functions ---
// getTransactionsForVeteran is now replaced by the shared getAllTransactionsForVeteran
// No, populateTransactionsTable will call the shared one directly.
// We can remove the admin-specific getTransactionsForVeteran if it's no longer used elsewhere,
// or update it to be a simple wrapper if preferred, but direct usage of the shared function is cleaner.
// For this change, we'll update populateTransactionsTable to use the shared function.



async function populateTransactionsTable(veteranId) {
    const viewTransactionsTableBody = document.getElementById('view-transactions-table-body');
    if (!viewTransactionsTableBody) return;
    viewTransactionsTableBody.innerHTML = `<tr><td colspan="4" class="center-align large-padding">Loading transactions...</td></tr>`;
    const transactions = await getAllTransactionsForVeteran(veteranId); // Use shared cached function

    if (transactions.length === 0) {
        viewTransactionsTableBody.innerHTML = `<tr><td colspan="4" class="center-align large-padding">No transactions found for this veteran.</td></tr>`;
        return;
    }

    viewTransactionsTableBody.innerHTML = '';
    transactions.forEach(transaction => {
        const row = viewTransactionsTableBody.insertRow();
        row.insertCell().textContent = transaction.id;
        row.insertCell().textContent = formatCurrency(transaction.amount_paid);
        row.insertCell().textContent = formatDate(transaction.created);
        row.insertCell().textContent = transaction.updated ? formatDate(transaction.updated) : 'N/A';
    });
}

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

/**
 * Populates the member details form/view in the drawer.
 * Dynamically creates input fields for editing or displays text for viewing.
 */
async function populateMemberDetailsForm(veteran, isEdit = false) {

    const paymentInfo = await calculateAmountOwedAndOverdueStatus(veteran.id, veteran.status, veteran.created);

    const amountOwedText = `${formatCurrency(paymentInfo.amountOwed)}${paymentInfo.isOverdue && paymentInfo.amountOwed > 0 ? ' <span class="overdue-indicator">(Overdue)</span>' : ''}`;

    let registrationDateDisplay = 'N/A';
    const firstPaymentTransaction = await getFirstPaymentTransaction(veteran.id);
    if (veteran.status === 'Member' || (veteran.status === 'Archive' && firstPaymentTransaction)) {
        registrationDateDisplay = formatDate(firstPaymentTransaction ? firstPaymentTransaction.created : veteran.created);
    }

    // --- Handle Editable Fields ---
    editableFieldsConfig.forEach(field => {
        const container = document.querySelector(`[data-field-container="${field.key}"]`);
        const viewElement = document.getElementById(field.viewId);

        if (!container || !viewElement) {
            console.warn(`Elements for field ${field.key} (container or view) not found.`);
            return;
        }

        // Clear previous dynamic input wrapper if it exists
        const existingInputWrapper = container.querySelector('.field-input-wrapper');
        if (existingInputWrapper) {
            existingInputWrapper.remove();
        }
        viewElement.classList.remove('hidden'); // Ensure view element is visible by default

        if (isEdit) {
            viewElement.classList.add('hidden'); // Hide the static text view

            const inputWrapper = document.createElement('div');
            // Apply BeerCSS styling for text fields.
            // The 'no-margin' class is from BeerCSS to remove default field margins if needed.
            inputWrapper.className = `field ${field.type === 'textarea' ? 'textarea' : ''} label border field-input-wrapper no-margin`;


            let inputEl;
            if (field.type === 'textarea') {
                inputEl = document.createElement('textarea');
                inputEl.rows = field.key === 'admin_note' ? 4 : (field.key === 'full_address' ? 2 : 2);
                inputEl.style.minHeight = '40px'; // Ensure textarea has some height
            } else {
                inputEl = document.createElement('input');
                inputEl.type = field.type;
            }
            inputEl.id = `edit-${field.key}`; // Unique ID for the input
            inputEl.value = veteran[field.key] || '';
            inputEl.style.width = '100%';

            const labelEl = document.createElement('label');
            labelEl.htmlFor = inputEl.id;
            labelEl.textContent = field.label;

            inputWrapper.appendChild(inputEl);
            inputWrapper.appendChild(labelEl);
            container.appendChild(inputWrapper);
            if (typeof ui === 'function') ui(inputWrapper); // Initialize BeerCSS for the new input field

        } else { // View Mode
            // Value for admin_note needs to be set carefully due to pre-wrap
            if (field.key === 'admin_note') {
                viewElement.textContent = veteran[field.key] || 'No notes available.';
            } else if (field.key === 'full_address') {
                viewElement.textContent = veteran[field.key] || 'N/A'; // white-space: pre-wrap; is on the div
            }
            else {
                viewElement.textContent = veteran[field.key] || 'N/A';
            }
        }
    });

    // --- Handle Status Field (Special Case: Dropdown for Edit, Chip for View) ---
    const viewStatusChipContainer = document.getElementById('view-status-chip-container'); // DIV containing the chip
    const viewStatusChip = document.getElementById('view-status'); // The chip itself
    const editStatusControls = document.getElementById('edit-status-controls'); // DIV containing button and menu for status
    const detailStatusEditBtn = document.getElementById('detail-status-edit-btn');
    const detailStatusEditBtnText = document.getElementById('detail-status-edit-btn-text');
    const detailStatusEditMenu = document.getElementById('detail-status-edit-menu');

    if (isEdit) {
        if (viewStatusChipContainer) viewStatusChipContainer.classList.add('hidden');
        if (editStatusControls) editStatusControls.classList.remove('hidden');

        const statusToSet = veteran.status || '';
        if (detailStatusEditBtnText && detailStatusEditMenu && detailStatusEditBtn) {
            const selectedLi = Array.from(detailStatusEditMenu.querySelectorAll('li')).find(li => li.dataset.value === statusToSet);
            detailStatusEditBtnText.textContent = selectedLi ? selectedLi.textContent : 'Select Status';
            detailStatusEditBtn.dataset.selectedValue = statusToSet;
            // Add status badge class to the button
            detailStatusEditBtn.className = `chip rounded large ripple ${getStatusBadgeClass(statusToSet)}`;
        }
    } else { // View Mode for Status
        if (viewStatusChipContainer) viewStatusChipContainer.classList.remove('hidden');
        if (viewStatusChip) {
            viewStatusChip.textContent = veteran.status || 'Unknown';
            viewStatusChip.className = `chip rounded large ripple ${getStatusBadgeClass(veteran.status)}`;
        }
        if (editStatusControls) editStatusControls.classList.add('hidden');
    }

    // --- Read-only Fields (Always display as text) ---
    document.getElementById('view-applicationDate').textContent = formatDate(veteran.created);
    document.getElementById('view-registrationDate').textContent = registrationDateDisplay;
    document.getElementById('view-lastPaymentDate').textContent = formatDate(paymentInfo.lastPaymentDate);
    document.getElementById('view-amountOwed').innerHTML = amountOwedText; // Uses innerHTML for potential <span>
    document.getElementById('view-nextDueDate').textContent = formatDate(paymentInfo.nextDueDate);

    // Populate transactions table (always shown, content might change based on veteran)
    await populateTransactionsTable(veteran.id);

    // Toggle visibility of the "Other Actions" section (contains delete button)
    const adminActionsSection = document.getElementById('admin-actions-section');
    if (adminActionsSection) adminActionsSection.classList.toggle('hidden', !isEdit);

    if (typeof ui === 'function') ui(); // Re-initialize BeerCSS for any dynamic components
}

/**
 * Sets up PocketBase realtime subscriptions for veterans and transactions.
 * Updates the UI and local data based on server-side changes.
 */
function setupRealtimeSubscriptions() {
    if (!pb) {
        console.error("PocketBase instance not available for realtime subscriptions.");
        return;
    }

    // Subscribe to Veterans collection changes
    pb.collection(VETERANS_COLLECTION).subscribe('*', async function (e) {
        console.log('[Realtime] Veteran event:', e.action, e.record.id);

        // Invalidate caches related to this veteran as its core data or status changed
        if (typeof lastPaymentCache !== 'undefined') lastPaymentCache.delete(e.record.id);
        if (typeof firstPaymentCache !== 'undefined') firstPaymentCache.delete(e.record.id);
        if (typeof allTransactionsCache !== 'undefined') allTransactionsCache.delete(e.record.id);

        if (e.action === 'create') {
            // Re-fetch all veterans to include the new one and maintain sort order
            // This is simpler than trying to insert into the sorted array
            await fetchVeterans();
            showMessage("New Veteran", `A new veteran has been added: ${e.record.full_name || e.record.email}.`);
        } else if (e.action === 'update') {
            // Find and update the veteran in the local array
            const index = allVeterans.findIndex(v => v.id === e.record.id);
            if (index > -1) {
                allVeterans[index] = e.record; // Update the record with the latest data
                console.log(`[Realtime] Updated veteran ${e.record.id} in local cache.`);
            } else {
                console.warn(`[Realtime] Updated veteran ${e.record.id} not found in local allVeterans array.`);
                // If not found, maybe it was filtered out? Re-fetch just to be safe.
                await fetchVeterans(); // Re-fetch all to ensure consistency
            }

            await filterAndDisplayVeterans(); // Re-render the list with updated data

            // If the updated veteran's drawer is open, refresh its content
            if (currentEditingVeteranId === e.record.id && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active'))) {
                console.log(`[Realtime] Refreshing drawer for veteran ${e.record.id}`);
                // Re-populate the form/view. Pass the updated record directly.
                // Keep the current mode (view/edit) but refresh the data displayed.
                // Note: This will overwrite view data even if in edit mode, but won't touch input values.
                await populateMemberDetailsForm(e.record, isMemberDetailsEditMode);
            }

        } else if (e.action === 'delete') {
            // Remove the veteran from the local array
            allVeterans = allVeterans.filter(v => v.id !== e.record.id);
            console.log(`[Realtime] Removed veteran ${e.record.id} from local cache.`);
            await filterAndDisplayVeterans(); // Re-render the list

            // If the deleted veteran's drawer is open, close it
            if (currentEditingVeteranId === e.record.id && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active'))) {
                console.log(`[Realtime] Closing drawer for deleted veteran ${e.record.id}`);
                if (typeof ui === 'function') ui("#member-details-drawer").close();
                else memberDetailsDrawer.classList.remove('active');
                // closeMemberDetailsPanelLogic will handle cleanup
            }
            showMessage("Veteran Deleted", `Veteran ${e.record.full_name || e.record.email} has been deleted.`);
        }
    });

    // Subscribe to Transactions collection changes
    pb.collection(TRANSACTIONS_COLLECTION).subscribe('*', async function (e) {
        console.log('[Realtime] Transaction event:', e.action, e.record.id, 'for veteran:', e.record.veteran);
        const veteranId = e.record.veteran;

        // Invalidate caches for the affected veteran
        if (typeof lastPaymentCache !== 'undefined') lastPaymentCache.delete(veteranId);
        if (typeof firstPaymentCache !== 'undefined') firstPaymentCache.delete(veteranId);
        if (typeof allTransactionsCache !== 'undefined') allTransactionsCache.delete(veteranId);

        // Re-render the main list as payment status/amount might have changed
        await filterAndDisplayVeterans();

        // If the affected veteran's drawer is open, refresh transaction table and payment info
        if (currentEditingVeteranId === veteranId && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active'))) {
            console.log(`[Realtime] Refreshing transaction table and payment info in drawer for veteran ${veteranId}`);
            await populateTransactionsTable(veteranId);
            // Recalculate and display payment info
            // Need the veteran's status and created date for calculateAmountOwedAndOverdueStatus
            const veteran = allVeterans.find(v => v.id === veteranId);
            if (veteran) {
                // Pass the veteran object to populateMemberDetailsForm to update payment/status display
                // Keep the current edit mode
                await populateMemberDetailsForm(veteran, isMemberDetailsEditMode);
            }
        }
    });
    console.log("PocketBase realtime subscriptions setup.");
}

/**
 * Sets the mode (view/edit) for the member details drawer.
 */
async function setMemberDetailsMode(isEdit) {
    isMemberDetailsEditMode = isEdit;

    const veteran = allVeterans.find(m => m.id === currentEditingVeteranId);

    if (!veteran && isEdit) {
        showMessage("Error", "Cannot enter edit mode: veteran data not found.");
        return;
    }

    const dataToDisplay = !isEdit && originalVeteranDataForEdit ? originalVeteranDataForEdit : veteran;


    if (false)//(document.startViewTransition)
    {
        document.startViewTransition(async () => {

            if (dataToDisplay) {
                await populateMemberDetailsForm(dataToDisplay, isEdit); // This now handles the dynamic fields
            }
            if (memberDetailsEditBtn) memberDetailsEditBtn.classList.toggle('hidden', isEdit);
            if (memberDetailsSaveBtn) {
                memberDetailsSaveBtn.classList.toggle('hidden', !isEdit);
                memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>';
                memberDetailsSaveBtn.classList.remove('success');
                memberDetailsSaveBtn.disabled = false;
            }
            if (memberDetailsCancelEditBtn) memberDetailsCancelEditBtn.classList.toggle('hidden', !isEdit);
            // Delete button visibility is handled within populateMemberDetailsForm via admin-actions-section
        });
    } else {
        if (dataToDisplay) {
            await populateMemberDetailsForm(dataToDisplay, isEdit); // This now handles the dynamic fields
        }

        if (memberDetailsEditBtn) memberDetailsEditBtn.classList.toggle('hidden', isEdit);
        if (memberDetailsSaveBtn) {
            memberDetailsSaveBtn.classList.toggle('hidden', !isEdit);
            memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>';
            memberDetailsSaveBtn.classList.remove('success');
            memberDetailsSaveBtn.disabled = false;
        }
        if (memberDetailsCancelEditBtn) memberDetailsCancelEditBtn.classList.toggle('hidden', !isEdit);
        // Delete button visibility is handled within populateMemberDetailsForm via admin-actions-section
    }

}


async function openMemberDetailsPanel(veteranId, rowElement) {
    if (activeListItem) {
        activeListItem.classList.remove('active-item');
    }
    activeListItem = rowElement;
    if (activeListItem) activeListItem.classList.add('active-item');

    const veteran = allVeterans.find(m => m.id === veteranId);
    if (!veteran) {
        showMessage("Error", "Veteran details not found.");
        return;
    }
    currentEditingVeteranId = veteranId;
    originalVeteranDataForEdit = { ...veteran };
    if (memberDetailsDrawerTitle) memberDetailsDrawerTitle.textContent = `Details for ${veteran.full_name || 'Veteran'}`;

    if (detailsPanelContent) {
        detailsPanelContent.style.opacity = '0';
        detailsPanelContent.classList.add('hidden');
    }
    if (detailsPanelFooterActions) detailsPanelFooterActions.classList.add('hidden');
    if (drawerContentLoader) drawerContentLoader.classList.remove('hidden');

    if (memberDetailsDrawer && typeof ui === 'function') {
        ui("#member-details-drawer");
    } else if (memberDetailsDrawer) {
        memberDetailsDrawer.classList.add('active');
    }

    await setMemberDetailsMode(false); // Default to view mode

    if (drawerContentLoader) drawerContentLoader.classList.add('hidden');
    if (detailsPanelContent) {
        detailsPanelContent.classList.remove('hidden');
        void detailsPanelContent.offsetWidth;
        detailsPanelContent.style.opacity = '1';
    }
    if (detailsPanelFooterActions) detailsPanelFooterActions.classList.remove('hidden');
}

function closeMemberDetailsPanelLogic() {
    if (activeListItem) {
        activeListItem.classList.remove('active-item');
        activeListItem = null;
    }

    if (drawerContentLoader) drawerContentLoader.classList.add('hidden');

    if (detailsPanelContent) {
        detailsPanelContent.style.opacity = '0';
        detailsPanelContent.classList.add('hidden');

        // Clean up any dynamically added input fields from edit mode
        editableFieldsConfig.forEach(field => {
            const container = document.querySelector(`[data-field-container="${field.key}"]`);
            if (container) {
                const inputWrapper = container.querySelector('.field-input-wrapper');
                if (inputWrapper) inputWrapper.remove();
                const viewElement = document.getElementById(field.viewId);
                if (viewElement) viewElement.classList.remove('hidden'); // Ensure view element is visible
            }
        });
        // Reset status field view
        const viewStatusChipContainer = document.getElementById('view-status-chip-container');
        const editStatusControls = document.getElementById('edit-status-controls');
        if (viewStatusChipContainer) viewStatusChipContainer.classList.remove('hidden');
        if (editStatusControls) editStatusControls.classList.add('hidden');

    }
    if (detailsPanelFooterActions) detailsPanelFooterActions.classList.add('hidden');


    isMemberDetailsEditMode = false;
    const viewTransactionsTableBody = document.getElementById('view-transactions-table-body');
    if (viewTransactionsTableBody) viewTransactionsTableBody.innerHTML = `<tr><td colspan="4" class="center-align large-padding">Select a veteran to view details.</td></tr>`;

    currentEditingVeteranId = null;
    originalVeteranDataForEdit = null;
}

if (memberDetailsDrawer) {
    const closeDetailsBtn = memberDetailsDrawer.querySelector('.close-details-btn');
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', () => {
            if (typeof ui === 'function') ui("#member-details-drawer");
            else memberDetailsDrawer.classList.remove('active');
        });
    }
    memberDetailsDrawer.addEventListener('close', closeMemberDetailsPanelLogic);
}

if (memberDetailsEditBtn) memberDetailsEditBtn.addEventListener('click', () => setMemberDetailsMode(true));

if (memberDetailsCancelEditBtn) memberDetailsCancelEditBtn.addEventListener('click', () => setMemberDetailsMode(false));


if (memberDetailsSaveBtn) {
    memberDetailsSaveBtn.addEventListener('click', async () => {
        if (!currentEditingVeteranId || !pb) return;
        showLoading();
        memberDetailsSaveBtn.disabled = true;
        memberDetailsSaveBtn.innerHTML = '<span>Saving...</span><i>progress_activity</i>';

        const updatedData = {};
        editableFieldsConfig.forEach(field => {
            const inputElement = document.getElementById(`edit-${field.key}`);
            if (inputElement) {
                updatedData[field.key] = inputElement.value;
            } else if (originalVeteranDataForEdit && originalVeteranDataForEdit.hasOwnProperty(field.key)) {
                // Fallback for fields that might not have been rendered as input if logic missed them
                // This shouldn't happen with current setup but is a safe fallback.
                updatedData[field.key] = originalVeteranDataForEdit[field.key];
            }
        });

        // Handle status separately from the dropdown
        const statusButton = document.getElementById('detail-status-edit-btn');
        if (statusButton && statusButton.dataset.selectedValue !== undefined) {
            updatedData.status = statusButton.dataset.selectedValue;
        } else if (originalVeteranDataForEdit) {
            updatedData.status = originalVeteranDataForEdit.status; // fallback
        }


        try {
            const updatedRecord = await pb.collection(VETERANS_COLLECTION).update(currentEditingVeteranId, updatedData);
            const veteranIndex = allVeterans.findIndex(m => m.id === currentEditingVeteranId);
            if (veteranIndex > -1) {
                allVeterans[veteranIndex] = { ...allVeterans[veteranIndex], ...updatedRecord };
            }
            originalVeteranDataForEdit = { ...allVeterans[veteranIndex] }; // Update original data

            await setMemberDetailsMode(false); // Switch to view mode, which will re-populate with new data
            await filterAndDisplayVeterans(); // Refresh the main list

            memberDetailsSaveBtn.innerHTML = '<span>Saved!</span><i>check</i>';
            memberDetailsSaveBtn.classList.add('success');
            setTimeout(() => {
                if (memberDetailsSaveBtn.classList.contains('success')) {
                    memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>';
                    memberDetailsSaveBtn.classList.remove('success');
                }
            }, 2000);

        } catch (error) {
            console.error("Error updating veteran details:", error);
            let errMsg = "Failed to save changes. ";
            if (error.data && error.data.data) {
                Object.values(error.data.data).forEach(err => errMsg += `${err.message} `);
            } else if (error.message) {
                errMsg += error.message;
            }
            showMessage("Save Error", errMsg);
            memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>';
        } finally {
            hideLoading();
            memberDetailsSaveBtn.disabled = false;
        }
    });
}

if (deleteVeteranBtn) {
    deleteVeteranBtn.addEventListener('click', async () => {
        if (!currentEditingVeteranId || !pb) return;
        const veteranToDelete = originalVeteranDataForEdit || allVeterans.find(v => v.id === currentEditingVeteranId);
        const veteranName = veteranToDelete?.full_name || 'this veteran';

        showConfirmActionModal(
            'Delete Veteran',
            `Are you sure you want to permanently delete ${veteranName}? This will also delete all associated payment transactions. This action cannot be undone.`,
            async () => {
                showLoading();
                try {
                    const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({ filter: `veteran = "${currentEditingVeteranId}"` });
                    for (const transaction of transactions) {
                        await pb.collection(TRANSACTIONS_COLLECTION).delete(transaction.id);
                    }
                    await pb.collection(VETERANS_COLLECTION).delete(currentEditingVeteranId);

                    if (memberDetailsDrawer && typeof ui === 'function') ui("#member-details-drawer").close();
                    else if (memberDetailsDrawer) memberDetailsDrawer.classList.remove('active');

                    await fetchVeterans();
                    showMessage("Success", `${veteranName} and their transactions have been deleted.`);
                } catch (error) {
                    console.error("Error deleting veteran:", error);
                    showMessage("Delete Error", `Failed to delete ${veteranName}. ${error.data?.message || error.message}`);
                } finally {
                    hideLoading();
                }
            }
        );
    });
}

async function initAdminPage() {
    try {
        pb = new PocketBase(POCKETBASE_URL);
        if (!pb.authStore.isValid || !pb.authStore.model) {
            window.location.href = '/mva';
            return;
        }
        const user = pb.authStore.model;
        if (adminEmailSpan) adminEmailSpan.textContent = user.email;

        if (adminContent) adminContent.classList.remove('hidden');
        await fetchVeterans();

        // Setup Realtime Subscriptions
        setupRealtimeSubscriptions();

    } catch (error) {
        console.error("Initialization error:", error);
        showMessage("Error", "Failed to initialize admin panel. Please try logging in again.");
        if (pb) pb.authStore.clear();
        window.location.href = '/mva';
    }
}

async function fetchVeterans(filter = "") {
    console.log("FETCHING VETERANS");
    showLoading();
    if (veteransListContainerEl && veteransListInitialLoadingEl && veteransListContainerEl.contains(veteransListInitialLoadingEl)) {
        // Keep initial message
    } else if (veteransListContainerEl && veteransListContainerEl.children.length === 0) {
        veteransListContainerEl.innerHTML = `<div class="center-align large-padding">Loading veterans...</div>`;
    }

    try {
        const options = { sort: '-created' };
        if (filter) options.filter = filter;
        const records = await pb.collection(VETERANS_COLLECTION).getFullList(options);
        allVeterans = records;
        displayedVeterans = records;
        await renderVeteransList(displayedVeterans);

        if (currentEditingVeteranId && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active'))) {
            const stillCurrentVeteran = allVeterans.find(m => m.id === currentEditingVeteranId);
            if (stillCurrentVeteran) {
                originalVeteranDataForEdit = { ...stillCurrentVeteran };
                await populateMemberDetailsForm(stillCurrentVeteran, isMemberDetailsEditMode); // Refresh drawer content
            } else {
                if (typeof ui === 'function') ui("#member-details-drawer").close();
                else if (memberDetailsDrawer) memberDetailsDrawer.classList.remove('active');
            }
        }

    } catch (error) {
        console.error("Error fetching veterans:", error);
        if (veteransListContainerEl) veteransListContainerEl.innerHTML = `<div class="center-align large-padding red-text">Failed to load veterans. Please try again.</div>`;
        showMessage("Fetch Error", "Could not retrieve veteran data. Please check your connection and try again.");
    } finally {
        hideLoading();
    }
}


async function renderVeteransList(veteransToRender) {
    if (!veteransListContainerEl) return;
    veteransListContainerEl.innerHTML = '';

    if (veteransListInitialLoadingEl && veteransListContainerEl.contains(veteransListInitialLoadingEl)) {
        veteransListInitialLoadingEl.remove();
    }

    if (veteransToRender.length === 0) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'center-align large-padding';
        noResultsMessage.textContent = 'No veterans match the current filters.';
        veteransListContainerEl.appendChild(noResultsMessage);
        if (totalVeteransDisplayed) totalVeteransDisplayed.textContent = '0';
        return;
    }

    for (const veteran of veteransToRender) {
        const listItem = document.createElement('div');
        listItem.className = 'veteran-list-item ripple';
        listItem.dataset.veteranId = veteran.id;

        if (veteran.id === currentEditingVeteranId) {
            listItem.classList.add('active-item');
            activeListItem = listItem;
        }
        listItem.onclick = () => openMemberDetailsPanel(veteran.id, listItem);

        const paymentInfo = await calculateAmountOwedAndOverdueStatus(veteran.id, veteran.status, veteran.created);

        const mainContent = document.createElement('div');
        mainContent.className = 'list-item-main-content';

        const leftSection = document.createElement('div');
        leftSection.className = 'list-item-left-section';

        const nameEl = document.createElement('div');
        nameEl.className = 'veteran-name';
        nameEl.textContent = veteran.full_name || 'N/A';

        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${getStatusBadgeClass(veteran.status)}`;
        statusBadge.textContent = veteran.status || 'Unknown';
        nameEl.appendChild(statusBadge);
        leftSection.appendChild(nameEl);

        const idCardEl = document.createElement('div');
        idCardEl.className = 'veteran-id-card';
        idCardEl.textContent = `ID: ${veteran.id_card_number || 'N/A'}`;
        leftSection.appendChild(idCardEl);
        mainContent.appendChild(leftSection);

        const actionsNav = document.createElement('nav');
        actionsNav.className = 'list-item-actions';
        actionsNav.onclick = (e) => e.stopPropagation();

        if (veteran.status === 'Application') {
            const acceptBtn = document.createElement('button');
            acceptBtn.innerHTML = '<i>check</i> Accept';
            acceptBtn.className = 'responsive action-button success-button';
            acceptBtn.onclick = (e) => {
                e.stopPropagation();
                confirmUpdateVeteranStatus(veteran.id, 'Member', `Accept Application?`, `Accept ${veteran.full_name || 'this veteran'}'s application and set status to Member? Initial payment will be marked as due.`);
            };
            actionsNav.appendChild(acceptBtn);

            const archiveAppBtn = document.createElement('button');
            archiveAppBtn.innerHTML = '<i>archive</i> Archive';
            archiveAppBtn.className = 'responsive action-button warning-button';
            archiveAppBtn.onclick = (e) => {
                e.stopPropagation();
                confirmUpdateVeteranStatus(veteran.id, 'Archive', `Archive Application?`, `Archive ${veteran.full_name || 'this veteran'}'s application?`);
            };
            actionsNav.appendChild(archiveAppBtn);
        }

        if (veteran.status === 'Member') {
            const recordPaymentBtn = document.createElement('button');
            recordPaymentBtn.innerHTML = '<i>payment</i> Record Pay';
            recordPaymentBtn.className = 'responsive action-button';
            if (paymentInfo.amountOwed > 0) {
                recordPaymentBtn.onclick = (e) => { e.stopPropagation(); confirmRecordPayment(veteran.id, veteran.full_name); };
            } else {
                recordPaymentBtn.disabled = true;
                recordPaymentBtn.title = "No payment currently due.";
                recordPaymentBtn.classList.add('tooltip');
            }
            actionsNav.appendChild(recordPaymentBtn);

            const archiveMemberBtn = document.createElement('button');
            archiveMemberBtn.innerHTML = '<i>archive</i> Archive';
            archiveMemberBtn.className = 'responsive action-button warning-button';
            archiveMemberBtn.onclick = (e) => {
                e.stopPropagation();
                confirmUpdateVeteranStatus(veteran.id, 'Archive', `Archive ${veteran.full_name || 'this veteran'}?`, `This should typically be done if the veteran is deceased or has explicitly cancelled their membership.`);
            };
            actionsNav.appendChild(archiveMemberBtn);
        }

        if (veteran.status === 'Archive') {
            const reopenBtn = document.createElement('button');
            reopenBtn.innerHTML = '<i>unarchive</i> Re-Open';
            reopenBtn.className = 'responsive action-button info-button';
            reopenBtn.onclick = (e) => {
                e.stopPropagation();
                confirmUpdateVeteranStatus(veteran.id, 'Application', `Re-Open Application?`, `Change ${veteran.full_name || 'this veteran'}'s status back to 'Application'?`);
            };
            actionsNav.appendChild(reopenBtn);
        }
        mainContent.appendChild(actionsNav);

        const rightSection = document.createElement('div');
        rightSection.className = 'list-item-right-section';

        const amountOwedEl = document.createElement('div');
        amountOwedEl.className = 'veteran-amount-owed';
        amountOwedEl.innerHTML = `Owed: ${formatCurrency(paymentInfo.amountOwed)}`;
        if (paymentInfo.isOverdue && paymentInfo.amountOwed > 0) {
            const overdueSpan = document.createElement('span');
            overdueSpan.className = 'overdue-indicator';
            overdueSpan.textContent = ' (Overdue)';
            amountOwedEl.appendChild(overdueSpan);
        }
        rightSection.appendChild(amountOwedEl);

        const nextDueDateEl = document.createElement('div');
        nextDueDateEl.className = 'veteran-next-due-date';
        nextDueDateEl.textContent = `Next Due: ${formatDate(paymentInfo.nextDueDate)}`;
        rightSection.appendChild(nextDueDateEl);

        mainContent.appendChild(rightSection);
        listItem.appendChild(mainContent);
        veteransListContainerEl.appendChild(listItem);
    }
    if (totalVeteransDisplayed) totalVeteransDisplayed.textContent = veteransToRender.length.toString();
    if (typeof ui === 'function') ui();
}
async function confirmRecordPayment(veteranId, veteranName) {
    showConfirmActionModal
        (
            `Confirm Payment`,
            `Record a payment of ${formatCurrency(MEMBERSHIP_FEE)} for ${veteranName || 'this veteran'}?`,
            async () => {
                showLoading();
                try {
                    await pb.collection(TRANSACTIONS_COLLECTION).create({
                        veteran: veteranId,
                        amount_paid: MEMBERSHIP_FEE,
                    });
                    // Invalidate cache for this veteran's last payment
                    // and all transactions, and first payment
                    if (typeof lastPaymentCache !== 'undefined') lastPaymentCache.delete(veteranId);
                    if (typeof firstPaymentCache !== 'undefined') firstPaymentCache.delete(veteranId);
                    if (typeof allTransactionsCache !== 'undefined') allTransactionsCache.delete(veteranId);



                    const veteran = allVeterans.find(v => v.id === veteranId);
                    if (veteran && veteran.status === 'Application') {
                        await pb.collection(VETERANS_COLLECTION).update(veteranId, { status: 'Member' });
                    }

                    await fetchVeterans(); // Refresh list and drawer data

                    if (currentEditingVeteranId === veteranId && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active'))) {
                        const updatedVeteranData = allVeterans.find(v => v.id === veteranId);
                        if (updatedVeteranData) {
                            originalVeteranDataForEdit = { ...updatedVeteranData };
                            await populateMemberDetailsForm(updatedVeteranData, isMemberDetailsEditMode);
                        }
                    }
                    showMessage("Payment Recorded", `Payment of ${formatCurrency(MEMBERSHIP_FEE)} recorded for ${veteranName || 'Veteran'}.`);
                }
                catch (error) {
                    console.error("Error recording payment:", error);
                    showMessage("Payment Error", `Failed to record payment for ${veteranName || 'Veteran'}. ${error.data?.message || error.message}`);
                }
                finally {
                    hideLoading();
                }
            }
        );
}
async function filterAndDisplayVeterans() {
    const statusValue = currentStatusFilterValue;
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let filter = "";

    if (statusValue === "zero-owed-members") {
        // This filter cannot be done purely in PocketBase if amountOwed is calculated on the fly.
        // So, fallback to JS for this special case.
        const filtered = [];
        for (const veteran of allVeterans) {
            if (veteran.status === "Member") {
                const paymentInfo = await calculateAmountOwedAndOverdueStatus(veteran.id, veteran.status, veteran.created);
                if (paymentInfo.amountOwed === 0) {
                    filtered.push(veteran);
                }
            }
        }
        displayedVeterans = filtered.filter(veteran => {
            const nameMatch = veteran.full_name && veteran.full_name.toLowerCase().includes(searchTerm);
            const idCardMatch = veteran.id_card_number && veteran.id_card_number.toLowerCase().includes(searchTerm);
            const emailMatch = veteran.email && veteran.email.toLowerCase().includes(searchTerm);
            return !searchTerm || nameMatch || idCardMatch || emailMatch;
        });
        await renderVeteransList(displayedVeterans);
        return;
    }

    // Build PocketBase filter string
    const filters = [];
    if (statusValue) {
        filters.push(`status = "${statusValue}"`);
    }
    if (searchTerm) {
        // PocketBase doesn't support OR in a single filter string, so we use parentheses and OR
        filters.push(`(full_name ~ "${searchTerm}" || id_card_number ~ "${searchTerm}" || email ~ "${searchTerm}")`);
    }
    filter = filters.join(' && ');

    await fetchVeterans(filter);
}

async function confirmUpdateVeteranStatus(veteranId, newStatus, title, text) {
    showConfirmActionModal(
        title,
        text,
        async () => {
            showLoading();
            try {
                const updatedRecord = await pb.collection(VETERANS_COLLECTION).update(veteranId, { status: newStatus });
                await fetchVeterans(); // This will refresh the list and potentially the open drawer

                // Explicitly refresh drawer if it's the one being updated, even if fetchVeterans does it.
                if (currentEditingVeteranId === veteranId && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active'))) {
                    const updatedVeteranData = allVeterans.find(v => v.id === veteranId);
                    if (updatedVeteranData) {
                        originalVeteranDataForEdit = { ...updatedVeteranData }; // update for cancel
                        await populateMemberDetailsForm(updatedVeteranData, isMemberDetailsEditMode);
                    }
                }
                showMessage("Status Updated", `${updatedRecord.full_name || 'Veteran'}'s status changed to ${newStatus}.`);
            } catch (error) {
                console.error("Error updating status:", error);
                showMessage("Update Error", `Failed to update status for veteran ID ${veteranId}. ${error.data?.message || error.message}`);
            } finally {
                hideLoading();
            }
        }
    );
}

// --- Event Listeners & Initialization ---
if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);

if (statusFilterMenu) {
    statusFilterMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            currentStatusFilterValue = item.dataset.value;
            if (statusFilterBtnText) statusFilterBtnText.textContent = item.textContent;
            if (typeof ui === 'function' && statusFilterMenu.classList.contains("active")) {
                ui('#status-filter-menu');
            }
            filterAndDisplayVeterans();
        });
    });
}

if (searchInput) searchInput.addEventListener('input', filterAndDisplayVeterans);

if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        currentStatusFilterValue = "";
        if (statusFilterBtnText) statusFilterBtnText.textContent = "All"; // Reset to "All"
        if (searchInput) searchInput.value = '';
        filterAndDisplayVeterans();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof ui === 'function') ui();

    // Setup for status dropdown in the edit drawer (detail-status-edit-menu)
    const detailStatusEditMenu = document.getElementById('detail-status-edit-menu');
    const detailStatusEditBtn = document.getElementById('detail-status-edit-btn');
    const detailStatusEditBtnText = document.getElementById('detail-status-edit-btn-text');

    if (detailStatusEditMenu && detailStatusEditBtnText && detailStatusEditBtn) {
        detailStatusEditMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                detailStatusEditBtnText.textContent = item.textContent;
                const newStatus = item.dataset.value;
                detailStatusEditBtn.dataset.selectedValue = newStatus;
                detailStatusEditBtn.className = `chip rounded large ripple ${getStatusBadgeClass(newStatus)}`;
                if (typeof ui === 'function') {
                    ui('#detail-status-edit-menu');
                    // Re-initialize BeerCSS for the button to maintain styling
                    ui(detailStatusEditBtn);
                }
            });
        });
    }

    document.querySelectorAll('menu li').forEach(li => {
        li.classList.add('ripple');
    });

    initAdminPage();

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            let closedSomething = false;
            const activeModal = document.querySelector('dialog.modal.active, dialog.modal[open]');
            const activeDrawer = document.querySelector('dialog.right.active, dialog.right[open]'); // BeerCSS uses 'open' attribute too

            if (activeModal && typeof ui === 'function' && activeModal.id !== 'loading-indicator') { // Don't close loading indicator with Esc
                if (activeModal.id === 'confirm-action-dialog' || activeModal.id === 'message-dialog') {
                    ui(`#${activeModal.id}`);
                    closedSomething = true;
                }
            } else if (activeDrawer && typeof ui === 'function' && activeDrawer.id === 'member-details-drawer') {
                ui('#member-details-drawer');
                closedSomething = true;
            }
            if (closedSomething) event.preventDefault();
        }
    });
    document.getElementById("pb_admin_button").href = POCKETBASE_URL;
});