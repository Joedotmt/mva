// --- UI Elements (Admin Specific) ---
// Note: 'loadingIndicator', 'messageDialogEl', 'messageDialogTitle', 'messageDialogText'
// are assumed to be in the HTML and will be used by shared functions.

const adminEmailSpan = document.getElementById('admin-email');
const adminLogoutBtn = document.getElementById('logout-btn'); // Renamed to avoid conflict if on same page as profile
const adminContentMain = document.getElementById('admin-content-main');
const adminContent = document.getElementById('admin-content');
const veteransListContainerEl = document.getElementById('veterans-list-container');
const veteransListInitialLoadingEl = document.getElementById('veterans-list-initial-loading'); // Specific to initial list load
const statusFilterBtn = document.getElementById('status-filter-btn');
const statusFilterBtnText = document.getElementById('status-filter-btn-text');
const statusFilterMenu = document.getElementById('status-filter-menu');
const searchInput = document.getElementById('search-input');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const totalVeteransDisplayed = document.getElementById('total-veterans-displayed');

// Confirmation Dialog Elements (specific to admin actions)
const confirmActionDialogEl = document.getElementById('confirm-action-dialog');
const confirmActionTitle = document.getElementById('confirm-action-title');
const confirmActionText = document.getElementById('confirm-action-text');
const confirmActionConfirmBtn = document.getElementById('confirm-action-confirm-btn');
let currentActionCallback = null; // Stores the callback for the confirm dialog

// Member Details Drawer Elements
const memberDetailsDrawer = document.getElementById('member-details-drawer');
const detailsPanelPlaceholder = document.getElementById('details-panel-placeholder');
const detailsPanelContent = document.getElementById('details-panel-content');
const detailsPanelFooterActions = document.getElementById('details-panel-footer-actions');
const memberDetailsDrawerTitle = document.getElementById('member-details-drawer-title');

// View Mode Elements (within drawer)
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
const viewAmountOwed = document.getElementById('view-amountOwed');
const viewNextDueDate = document.getElementById('view-nextDueDate');
const viewAdminNote = document.getElementById('view-admin_note');
const viewTransactionsTableBody = document.getElementById('view-transactions-table-body');

// Edit Mode Elements (within drawer)
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
const detailApplicationDate = document.getElementById('detail-applicationDate'); // Display only in edit
const detailRegistrationDate = document.getElementById('detail-registrationDate'); // Display only in edit
const detailLastPaymentDate = document.getElementById('detail-lastPaymentDate');   // Display only in edit
const detailAmountOwed = document.getElementById('detail-amountOwed');         // Display only in edit
const detailNextDueDate = document.getElementById('detail-nextDueDate');       // Display only in edit
const detailAdminNoteEdit = document.getElementById('detail-admin_note-edit');
const deleteVeteranBtn = document.getElementById('delete-veteran-btn');

const memberDetailsEditBtn = document.getElementById('member-details-edit-btn');
const memberDetailsSaveBtn = document.getElementById('member-details-save-btn');
const memberDetailsCancelEditBtn = document.getElementById('member-details-cancel-edit-btn');

// --- PocketBase Client & State ---
let pb = null; // Will be initialized in DOMContentLoaded
let allVeterans = []; // Cache of all veteran records
let displayedVeterans = []; // Veterans currently shown after filtering
let currentStatusFilterValue = ""; // Current value of the status filter
let currentEditingVeteranId = null; // ID of the veteran being viewed/edited in the drawer
let isMemberDetailsEditMode = false; // Flag for drawer's edit mode
let originalVeteranDataForEdit = null; // Stores veteran data before editing for cancellation
let activeListItem = null; // Stores the currently active list item in the veteran list

// --- Admin Specific Utility Functions ---

/**
 * Shows a confirmation dialog for critical actions.
 * Assumes elements 'confirm-action-title', 'confirm-action-text', 'confirm-action-dialog' exist,
 * and BeerCSS ui() function is globally available.
 * @param {string} title - The title for the confirmation dialog.
 * @param {string} text - The confirmation message text.
 * @param {Function} callback - The function to execute if the user confirms.
 */
function showConfirmActionModal(title, text, callback)
{
    if (confirmActionTitle) confirmActionTitle.textContent = title;
    if (confirmActionText) confirmActionText.textContent = text;
    currentActionCallback = callback; // Store the callback

    if (confirmActionDialogEl && typeof ui === 'function')
    {
        ui("#confirm-action-dialog"); // Show the dialog using BeerCSS
    } else
    {
        console.warn('Confirmation dialog elements or BeerCSS ui() not found.');
        // Fallback or error handling if BeerCSS isn't working
        if (window.confirm(`${title}\n${text}`))
        { // Basic confirm as a last resort, though not ideal
            if (typeof callback === 'function') callback();
        }
    }
}

// Event listener for the confirmation button in the modal
if (confirmActionConfirmBtn)
{
    confirmActionConfirmBtn.addEventListener('click', () =>
    {
        if (typeof currentActionCallback === 'function')
        {
            currentActionCallback();
        }
        if (confirmActionDialogEl && typeof ui === 'function')
        {
            ui("#confirm-action-dialog").close(); // Close the dialog
        }
        currentActionCallback = null; // Reset callback
    });
}


// --- Veteran Data Management Functions ---

/**
 * Fetches all transactions for a specific veteran.
 * Uses shared constant TRANSACTIONS_COLLECTION. Assumes 'pb' is initialized.
 * @param {string} veteranId - The ID of the veteran.
 * @returns {Promise<Array>} - An array of transaction objects.
 */
async function getTransactionsForVeteran(veteranId)
{
    if (!pb)
    {
        console.error("PocketBase instance (pb) is not available for getTransactionsForVeteran.");
        return [];
    }
    try
    {
        const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({
            filter: `veteran = "${veteranId}"`,
            sort: '-created', // Show newest first
        });
        return transactions;
    } catch (error)
    {
        console.error(`Error fetching transactions for veteran ${veteranId}:`, error);
        showMessage("Transaction Error", `Could not load transactions for veteran ${veteranId}. ${error.message || ''}`); // Uses shared showMessage
        return [];
    }
}

/**
 * Populates the transactions table in the member details drawer.
 * Uses shared functions formatDate, formatCurrency.
 * @param {string} veteranId - The ID of the veteran whose transactions to display.
 */
async function populateTransactionsTable(veteranId)
{
    if (!viewTransactionsTableBody) return;
    viewTransactionsTableBody.innerHTML = `<tr><td colspan="4" class="center-align large-padding">Loading transactions...</td></tr>`;
    const transactions = await getTransactionsForVeteran(veteranId);

    if (transactions.length === 0)
    {
        viewTransactionsTableBody.innerHTML = `<tr><td colspan="4" class="center-align large-padding">No transactions found for this veteran.</td></tr>`;
        return;
    }

    viewTransactionsTableBody.innerHTML = ''; // Clear loading message
    transactions.forEach(transaction =>
    {
        const row = viewTransactionsTableBody.insertRow();
        row.insertCell().textContent = transaction.id;
        row.insertCell().textContent = formatCurrency(transaction.amount_paid); // Shared function
        row.insertCell().textContent = formatDate(transaction.created); // Shared function
        // Assuming 'updated' field exists on transaction records for modification date
        row.insertCell().textContent = transaction.updated ? formatDate(transaction.updated) : 'N/A'; // Shared function
    });
}


/**
 * Populates the member details form/view in the drawer.
 * Switches between view and edit mode.
 * Uses shared functions: calculateAmountOwedAndOverdueStatus, getFirstPaymentTransaction, formatDate, getStatusBadgeClass.
 * @param {Object} veteran - The veteran data object.
 * @param {boolean} isEdit - True if in edit mode, false for view mode.
 */
async function populateMemberDetailsForm(veteran, isEdit = false)
{
    const viewModeContent = document.getElementById('view-mode-content');
    const editModeContent = document.getElementById('edit-mode-content');

    if (viewModeContent) viewModeContent.classList.toggle('hidden', isEdit);
    if (editModeContent) editModeContent.classList.toggle('hidden', !isEdit);

    // Uses shared function
    const paymentInfo = await calculateAmountOwedAndOverdueStatus(veteran.id, veteran.status, veteran.created);
    const amountOwedText = `${formatCurrency(paymentInfo.amountOwed)}${paymentInfo.isOverdue && paymentInfo.amountOwed > 0 ? ' <span class="overdue-indicator">(Overdue)</span>' : ''}`;

    let registrationDateDisplay = 'N/A';
    // Uses shared function
    const firstPaymentTransaction = await getFirstPaymentTransaction(veteran.id);
    if (veteran.status === 'Member' || (veteran.status === 'Archive' && firstPaymentTransaction))
    {
        registrationDateDisplay = formatDate(firstPaymentTransaction ? firstPaymentTransaction.created : veteran.created);
    }


    if (isEdit)
    {
        if (detailFullName) detailFullName.value = veteran.full_name || '';
        if (detailIdCardNumber) detailIdCardNumber.value = veteran.id_card_number || '';
        if (detailFullAddress) detailFullAddress.value = veteran.full_address || '';
        if (detailPhoneNumber) detailPhoneNumber.value = veteran.phone_number || '';
        if (detailEmail) detailEmail.value = veteran.email || '';
        if (detailNextOfKinFullName) detailNextOfKinFullName.value = veteran.next_of_kin_full_name || '';
        if (detailNextOfKinFullPhoneNumber) detailNextOfKinFullPhoneNumber.value = veteran.next_of_kin_full_phone_number || '';
        if (detailNextOfKinRelationship) detailNextOfKinRelationship.value = veteran.next_of_kin_relationship || '';
        if (detailAdminNoteEdit) detailAdminNoteEdit.value = veteran.admin_note || '';

        // These are display-only in edit mode, calculated values
        if (detailApplicationDate) detailApplicationDate.value = formatDate(veteran.created);
        if (detailRegistrationDate) detailRegistrationDate.value = registrationDateDisplay;
        if (detailLastPaymentDate) detailLastPaymentDate.value = formatDate(paymentInfo.lastPaymentDate);
        if (detailAmountOwed) detailAmountOwed.value = stripHtml(amountOwedText); // Strip HTML for input field
        if (detailNextDueDate) detailNextDueDate.value = formatDate(paymentInfo.nextDueDate);


        const statusToSet = veteran.status || '';
        if (detailStatusEditBtnText && detailStatusEditMenu && detailStatusEditBtn)
        {
            const selectedLi = Array.from(detailStatusEditMenu.querySelectorAll('li')).find(li => li.dataset.value === statusToSet);
            detailStatusEditBtnText.textContent = selectedLi ? selectedLi.textContent : 'Select Status';
            detailStatusEditBtn.dataset.selectedValue = statusToSet;
        }
        if (typeof ui === 'function') ui(); // Re-initialize BeerCSS for dynamic elements if any

    } else
    { // View Mode
        if (viewFullName) viewFullName.textContent = veteran.full_name || 'N/A';
        if (viewIdCardNumber) viewIdCardNumber.textContent = veteran.id_card_number || 'N/A';
        if (viewFullAddress) viewFullAddress.textContent = veteran.full_address || 'N/A';
        if (viewPhoneNumber) viewPhoneNumber.textContent = veteran.phone_number || 'N/A';
        if (viewEmail) viewEmail.textContent = veteran.email || 'N/A';
        if (viewNextOfKinFullName) viewNextOfKinFullName.textContent = veteran.next_of_kin_full_name || 'N/A';
        if (viewNextOfKinFullPhoneNumber) viewNextOfKinFullPhoneNumber.textContent = veteran.next_of_kin_full_phone_number || 'N/A';
        if (viewNextOfKinRelationship) viewNextOfKinRelationship.textContent = veteran.next_of_kin_relationship || 'N/A';
        if (viewAdminNote) viewAdminNote.textContent = veteran.admin_note || 'No notes available.';

        if (viewApplicationDate) viewApplicationDate.textContent = formatDate(veteran.created);
        if (viewRegistrationDate) viewRegistrationDate.textContent = registrationDateDisplay;
        if (viewLastPaymentDate) viewLastPaymentDate.textContent = formatDate(paymentInfo.lastPaymentDate);
        if (viewAmountOwed) viewAmountOwed.innerHTML = amountOwedText; // Display with overdue flag (HTML)
        if (viewNextDueDate) viewNextDueDate.textContent = formatDate(paymentInfo.nextDueDate);

        if (viewStatus)
        {
            viewStatus.textContent = veteran.status || 'Unknown';
            viewStatus.className = `status-badge chip round large ${getStatusBadgeClass(veteran.status)}`; // Uses shared function
        }
        await populateTransactionsTable(veteran.id);
    }
}
/**
 * Helper function to strip HTML tags from a string.
 * @param {string} html - The HTML string.
 * @returns {string} - The string with HTML tags removed.
 */
function stripHtml(html)
{
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}


/**
 * Sets the mode (view/edit) for the member details drawer.
 * @param {boolean} isEdit - True to switch to edit mode, false for view mode.
 */
async function setMemberDetailsMode(isEdit)
{
    isMemberDetailsEditMode = isEdit;
    const veteran = allVeterans.find(m => m.id === currentEditingVeteranId);

    if (!veteran && isEdit)
    {
        showMessage("Error", "Cannot enter edit mode: veteran data not found."); // Uses shared showMessage
        return;
    }

    // If switching to view mode, use original data if available (e.g. after cancel), otherwise current veteran data
    const dataToDisplay = !isEdit && originalVeteranDataForEdit ? originalVeteranDataForEdit : veteran;

    if (dataToDisplay)
    {
        await populateMemberDetailsForm(dataToDisplay, isEdit);
    }

    if (memberDetailsEditBtn) memberDetailsEditBtn.classList.toggle('hidden', isEdit);
    if (memberDetailsSaveBtn)
    {
        memberDetailsSaveBtn.classList.toggle('hidden', !isEdit);
        memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>'; // Reset button text/icon
        memberDetailsSaveBtn.classList.remove('success'); // Remove success state
        memberDetailsSaveBtn.disabled = false; // Ensure button is enabled
    }
    if (memberDetailsCancelEditBtn) memberDetailsCancelEditBtn.classList.toggle('hidden', !isEdit);
    if (deleteVeteranBtn) deleteVeteranBtn.classList.toggle('hidden', isEdit); // Show delete only in edit mode
}

/**
 * Opens the member details panel/drawer for a given veteran.
 * @param {string} veteranId - The ID of the veteran to display.
 * @param {HTMLElement} rowElement - The list item element that was clicked.
 */
async function openMemberDetailsPanel(veteranId, rowElement)
{
    if (activeListItem)
    {
        activeListItem.classList.remove('active-item');
    }
    activeListItem = rowElement;
    if (activeListItem) activeListItem.classList.add('active-item');

    const veteran = allVeterans.find(m => m.id === veteranId);
    if (!veteran)
    {
        showMessage("Error", "Veteran details not found."); // Uses shared showMessage
        return;
    }
    currentEditingVeteranId = veteranId;
    originalVeteranDataForEdit = { ...veteran }; // Store a copy for potential cancel
    if (memberDetailsDrawerTitle) memberDetailsDrawerTitle.textContent = `Details for ${veteran.full_name || 'Veteran'}`;

    const drawerContentLoader = document.getElementById('drawer-content-loader');
    const placeholderPanel = document.getElementById('details-panel-placeholder');
    const contentPanel = document.getElementById('details-panel-content');
    const footerActionsPanel = document.getElementById('details-panel-footer-actions');

    // 1. Prepare for loading state: Show drawer-specific loader, hide placeholder and main content/footer
    if (placeholderPanel) placeholderPanel.classList.add('hidden');
    if (contentPanel)
    {
        contentPanel.style.opacity = '0'; // Set to transparent BEFORE removing .hidden later
        contentPanel.classList.add('hidden'); // Ensure it's display:none initially
    }
    if (footerActionsPanel) footerActionsPanel.classList.add('hidden');
    if (drawerContentLoader) drawerContentLoader.classList.remove('hidden'); // Show loader

    // 2. Open the drawer
    if (memberDetailsDrawer && typeof ui === 'function')
    {
        ui("#member-details-drawer"); // Open the drawer using BeerCSS
    } else if (memberDetailsDrawer)
    {
        memberDetailsDrawer.classList.add('active'); // Basic fallback
    }

    // 3. Asynchronously load and populate data.
    // setMemberDetailsMode internally calls populateMemberDetailsForm which is async.
    await setMemberDetailsMode(false); // Default to view mode

    // 4. Once data is ready, hide loader and show content with fade-in
    if (drawerContentLoader) drawerContentLoader.classList.add('hidden'); // Hide loader
    if (contentPanel)
    {
        contentPanel.classList.remove('hidden'); // Make it part of layout (still opacity 0)
        void contentPanel.offsetWidth; // Force reflow to ensure transition applies
        contentPanel.style.opacity = '1'; // Fade in
    }
    if (footerActionsPanel) footerActionsPanel.classList.remove('hidden'); // Show footer
}

/**
 * Logic to run when the member details panel is closed.
 */
function closeMemberDetailsPanelLogic()
{
    if (activeListItem)
    {
        activeListItem.classList.remove('active-item');
        activeListItem = null;
    }
    // setMemberDetailsMode(false); // Reset to view mode - this might re-trigger awaits, let's be careful.
    // It's better to manually reset the visual state here.

    const drawerContentLoader = document.getElementById('drawer-content-loader');
    const placeholderPanel = document.getElementById('details-panel-placeholder');
    const contentPanel = document.getElementById('details-panel-content');
    const footerActionsPanel = document.getElementById('details-panel-footer-actions');

    if (drawerContentLoader) drawerContentLoader.classList.add('hidden'); // Ensure loader is hidden
    if (placeholderPanel) placeholderPanel.classList.remove('hidden'); // Show placeholder again

    if (contentPanel)
    {
        contentPanel.style.opacity = '0'; // Prepare for next open
        contentPanel.classList.add('hidden'); // Hide it
    }
    if (footerActionsPanel) footerActionsPanel.classList.add('hidden');

    isMemberDetailsEditMode = false; // Explicitly reset edit mode flag

    // Clear transactions table when closing
    if (viewTransactionsTableBody) viewTransactionsTableBody.innerHTML = `<tr><td colspan="4" class="center-align large-padding">Select a veteran to view details.</td></tr>`;

    currentEditingVeteranId = null;
    originalVeteranDataForEdit = null;
    isMemberDetailsEditMode = false;
}

// Event listener for the drawer's close button and 'close' event
if (memberDetailsDrawer)
{
    const closeDetailsBtn = memberDetailsDrawer.querySelector('.close-details-btn');
    if (closeDetailsBtn)
    {
        closeDetailsBtn.addEventListener('click', () =>
        {
            if (typeof ui === 'function') ui("#member-details-drawer"); // Close using BeerCSS
            else memberDetailsDrawer.classList.remove('active'); // Basic fallback
        });
    }
    memberDetailsDrawer.addEventListener('close', closeMemberDetailsPanelLogic); // BeerCSS specific event
}


// Event listeners for drawer action buttons
if (memberDetailsEditBtn) memberDetailsEditBtn.addEventListener('click', () => setMemberDetailsMode(true));
if (memberDetailsCancelEditBtn)
{
    memberDetailsCancelEditBtn.addEventListener('click', async () =>
    {
        if (originalVeteranDataForEdit)
        {
            showLoading();
            await populateMemberDetailsForm(originalVeteranDataForEdit, false); // Revert to original data in view mode
            hideLoading();
        }
        setMemberDetailsMode(false); // Switch back to view mode
    });
}

if (memberDetailsSaveBtn)
{
    memberDetailsSaveBtn.addEventListener('click', async () =>
    {
        if (!currentEditingVeteranId || !pb) return;
        showLoading(); // Shared function
        memberDetailsSaveBtn.disabled = true;
        memberDetailsSaveBtn.innerHTML = '<span>Saving...</span><i>progress_activity</i>';


        const updatedData = {
            full_name: detailFullName ? detailFullName.value : undefined,
            id_card_number: detailIdCardNumber ? detailIdCardNumber.value : undefined,
            full_address: detailFullAddress ? detailFullAddress.value : undefined,
            phone_number: detailPhoneNumber ? detailPhoneNumber.value : undefined,
            email: detailEmail ? detailEmail.value : undefined,
            next_of_kin_full_name: detailNextOfKinFullName ? detailNextOfKinFullName.value : undefined,
            next_of_kin_full_phone_number: detailNextOfKinFullPhoneNumber ? detailNextOfKinFullPhoneNumber.value : undefined,
            next_of_kin_relationship: detailNextOfKinRelationship ? detailNextOfKinRelationship.value : undefined,
            status: detailStatusEditBtn ? detailStatusEditBtn.dataset.selectedValue : (originalVeteranDataForEdit ? originalVeteranDataForEdit.status : ''),
            admin_note: detailAdminNoteEdit ? detailAdminNoteEdit.value : undefined,
        };

        try
        {
            // Uses shared VETERANS_COLLECTION
            const updatedRecord = await pb.collection(VETERANS_COLLECTION).update(currentEditingVeteranId, updatedData);
            const veteranIndex = allVeterans.findIndex(m => m.id === currentEditingVeteranId);
            if (veteranIndex > -1)
            {
                allVeterans[veteranIndex] = { ...allVeterans[veteranIndex], ...updatedRecord };
            }
            originalVeteranDataForEdit = { ...allVeterans[veteranIndex] }; // Update original data to reflect saved changes

            await setMemberDetailsMode(false); // Switch to view mode
            await filterAndDisplayVeterans(); // Refresh the main list to reflect changes

            memberDetailsSaveBtn.innerHTML = '<span>Saved!</span><i>check</i>';
            memberDetailsSaveBtn.classList.add('success');
            setTimeout(() =>
            {
                if (memberDetailsSaveBtn.classList.contains('success'))
                { // Check if still in success state
                    memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>';
                    memberDetailsSaveBtn.classList.remove('success');
                }
            }, 2000);

        } catch (error)
        {
            console.error("Error updating veteran details:", error);
            let errMsg = "Failed to save changes. ";
            if (error.data && error.data.data)
            { // PocketBase validation errors
                Object.values(error.data.data).forEach(err => errMsg += `${err.message} `);
            } else if (error.message)
            {
                errMsg += error.message;
            }
            showMessage("Save Error", errMsg); // Shared function
            memberDetailsSaveBtn.innerHTML = '<span>Save Changes</span><i>save</i>'; // Reset on error
        } finally
        {
            hideLoading(); // Shared function
            memberDetailsSaveBtn.disabled = false;
        }
    });
}

if (deleteVeteranBtn)
{
    deleteVeteranBtn.addEventListener('click', async () =>
    {
        if (!currentEditingVeteranId || !pb) return;
        const veteranToDelete = originalVeteranDataForEdit || allVeterans.find(v => v.id === currentEditingVeteranId);
        const veteranName = veteranToDelete?.full_name || 'this veteran';

        showConfirmActionModal(
            'Delete Veteran',
            `Are you sure you want to permanently delete ${veteranName}? This will also delete all associated payment transactions. This action cannot be undone.`,
            async () =>
            {
                showLoading(); // Shared function

                // Optional: Add extra safety check, e.g., based on ID card number as in original
                if (veteranToDelete && veteranToDelete.id_card_number && veteranToDelete.id_card_number.trim() !== '')
                {
                    // Example: If you want to prevent deletion if ID card is present, uncomment below
                    // hideLoading();
                    // showMessage("Deletion Prevented", `Cannot delete ${veteranName}. Deletion is only allowed if the ID card number is empty.`);
                    // return;
                }

                try
                {
                    // Delete associated transactions first
                    // Uses shared TRANSACTIONS_COLLECTION
                    const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({ filter: `veteran = "${currentEditingVeteranId}"` });
                    for (const transaction of transactions)
                    {
                        await pb.collection(TRANSACTIONS_COLLECTION).delete(transaction.id);
                    }

                    // Delete the veteran record
                    // Uses shared VETERANS_COLLECTION
                    await pb.collection(VETERANS_COLLECTION).delete(currentEditingVeteranId);

                    if (memberDetailsDrawer && typeof ui === 'function') ui("#member-details-drawer").close(); // Close drawer
                    else if (memberDetailsDrawer) memberDetailsDrawer.classList.remove('active');

                    await fetchVeterans(); // Refresh the list
                    showMessage("Success", `${veteranName} and their transactions have been deleted.`); // Shared function
                } catch (error)
                {
                    console.error("Error deleting veteran:", error);
                    showMessage("Delete Error", `Failed to delete ${veteranName}. ${error.data?.message || error.message}`); // Shared function
                } finally
                {
                    hideLoading(); // Shared function
                }
            }
        );
    });
}


/**
 * Initializes the admin page, authenticates the user, and fetches initial data.
 * Uses shared POCKETBASE_URL, showMessage, handleLogout.
 */
async function initAdminPage()
{
    try
    {
        pb = new PocketBase(POCKETBASE_URL); // POCKETBASE_URL from shared_app.js
        if (!pb.authStore.isValid || !pb.authStore.model)
        { // Check if admin/user is logged in
            window.location.href = '/'; // Redirect to login if not authenticated
            return;
        }
        // Assuming admin users are in a different collection or have a specific role.
        // For this example, we'll just check if a user is logged in.
        // You might need more specific checks for admin roles.
        const user = pb.authStore.model;
        if (adminEmailSpan) adminEmailSpan.textContent = user.email; // Display admin's email

        if (adminContent) adminContent.classList.remove('hidden');
        await fetchVeterans(); // Load initial veteran list

    } catch (error)
    {
        console.error("Initialization error:", error);
        showMessage("Error", "Failed to initialize admin panel. Please try logging in again."); // Shared function
        if (pb) pb.authStore.clear();
        window.location.href = '/'; // Redirect on error
    }
}


/**
 * Fetches all veteran records from PocketBase.
 * Uses shared VETERANS_COLLECTION, showLoading, hideLoading, showMessage.
 */
async function fetchVeterans()
{
    showLoading(); // Shared function
    if (veteransListContainerEl && veteransListInitialLoadingEl && veteransListContainerEl.contains(veteransListInitialLoadingEl))
    {
        // Keep initial loading message if it's the very first load
    } else if (veteransListContainerEl && veteransListContainerEl.children.length === 0)
    {
        veteransListContainerEl.innerHTML = `<div class="center-align large-padding">Loading veterans...</div>`;
    }

    try
    {
        // Uses shared VETERANS_COLLECTION
        const records = await pb.collection(VETERANS_COLLECTION).getFullList({
            sort: '-created', // Sort by newest first
        });
        allVeterans = records;
        await filterAndDisplayVeterans(); // Display them (this will also call renderVeteransList)

        // If a veteran was being edited, refresh their data in the drawer
        if (currentEditingVeteranId && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active')))
        {
            const stillCurrentVeteran = allVeterans.find(m => m.id === currentEditingVeteranId);
            if (stillCurrentVeteran)
            {
                originalVeteranDataForEdit = { ...stillCurrentVeteran }; // Update original data
                await populateMemberDetailsForm(stillCurrentVeteran, isMemberDetailsEditMode);
            } else
            { // Veteran might have been deleted
                if (typeof ui === 'function') ui("#member-details-drawer").close();
                else if (memberDetailsDrawer) memberDetailsDrawer.classList.remove('active');
            }
        }

    } catch (error)
    {
        console.error("Error fetching veterans:", error);
        if (veteransListContainerEl) veteransListContainerEl.innerHTML = `<div class="center-align large-padding red-text">Failed to load veterans. Please try again.</div>`;
        showMessage("Fetch Error", "Could not retrieve veteran data. Please check your connection and try again."); // Shared function
    } finally
    {
        hideLoading(); // Shared function
    }
}


/**
 * Renders the list of veterans in the UI.
 * Uses shared functions: getStatusBadgeClass, formatDate, calculateAmountOwedAndOverdueStatus, formatCurrency.
 * @param {Array} veteransToRender - An array of veteran objects to display.
 */
async function renderVeteransList(veteransToRender)
{
    if (!veteransListContainerEl) return;
    veteransListContainerEl.innerHTML = ''; // Clear previous items

    if (veteransListInitialLoadingEl && veteransListContainerEl.contains(veteransListInitialLoadingEl))
    {
        veteransListInitialLoadingEl.remove(); // Remove the static initial loading message
    }

    if (veteransToRender.length === 0)
    {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'center-align large-padding';
        noResultsMessage.textContent = 'No veterans match the current filters.';
        veteransListContainerEl.appendChild(noResultsMessage);
        if (totalVeteransDisplayed) totalVeteransDisplayed.textContent = '0';
        return;
    }

    for (const veteran of veteransToRender)
    {
        const listItem = document.createElement('div');
        listItem.className = 'veteran-list-item ripple'; // ripple for BeerCSS click effect
        listItem.dataset.veteranId = veteran.id;

        if (veteran.id === currentEditingVeteranId)
        { // Highlight if it's the one open in drawer
            listItem.classList.add('active-item');
            activeListItem = listItem;
        }
        listItem.onclick = () => openMemberDetailsPanel(veteran.id, listItem);

        // Uses shared function
        const paymentInfo = await calculateAmountOwedAndOverdueStatus(veteran.id, veteran.status, veteran.created);

        const mainContent = document.createElement('div');
        mainContent.className = 'list-item-main-content';

        const leftSection = document.createElement('div');
        leftSection.className = 'list-item-left-section';

        const nameEl = document.createElement('div');
        nameEl.className = 'veteran-name';
        nameEl.textContent = veteran.full_name || 'N/A';

        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${getStatusBadgeClass(veteran.status)}`; // Uses shared function
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
        actionsNav.onclick = (e) => e.stopPropagation(); // Prevent item click when clicking buttons

        // Action buttons based on status
        if (veteran.status === 'Application')
        {
            const acceptBtn = document.createElement('button');
            acceptBtn.innerHTML = '<i>check</i> Accept';
            acceptBtn.className = 'responsive action-button success-button'; // Added success-button for styling
            acceptBtn.onclick = (e) =>
            {
                e.stopPropagation();
                confirmUpdateVeteranStatus(veteran.id, 'Member', `Accept Application?`, `Accept ${veteran.full_name || 'this veteran'}'s application and set status to Member? Initial payment will be marked as due.`);
            };
            actionsNav.appendChild(acceptBtn);

            const archiveAppBtn = document.createElement('button');
            archiveAppBtn.innerHTML = '<i>archive</i> Archive';
            archiveAppBtn.className = 'responsive action-button warning-button'; // Added warning-button
            archiveAppBtn.onclick = (e) =>
            {
                e.stopPropagation();
                confirmUpdateVeteranStatus(veteran.id, 'Archive', `Archive Application?`, `Archive ${veteran.full_name || 'this veteran'}'s application?`);
            };
            actionsNav.appendChild(archiveAppBtn);
        }

        if (veteran.status === 'Member')
        {
            const recordPaymentBtn = document.createElement('button');
            recordPaymentBtn.innerHTML = '<i>payment</i> Record Pay';
            recordPaymentBtn.className = 'responsive action-button';
            if (paymentInfo.amountOwed > 0)
            {
                recordPaymentBtn.onclick = (e) => { e.stopPropagation(); confirmRecordPayment(veteran.id, veteran.full_name); };
            } else
            {
                recordPaymentBtn.disabled = true;
                recordPaymentBtn.title = "No payment currently due."; // Tooltip for disabled button
                recordPaymentBtn.classList.add('tooltip'); // BeerCSS tooltip class
            }
            actionsNav.appendChild(recordPaymentBtn);

            const archiveMemberBtn = document.createElement('button');
            archiveMemberBtn.innerHTML = '<i>archive</i> Archive';
            archiveMemberBtn.className = 'responsive action-button warning-button';
            archiveMemberBtn.onclick = (e) =>
            {
                e.stopPropagation();
                confirmUpdateVeteranStatus(veteran.id, 'Archive', `Archive ${veteran.full_name || 'this veteran'}?`, `This should typically be done if the veteran is deceased or has explicitly cancelled their membership.`);
            };
            actionsNav.appendChild(archiveMemberBtn);
        }

        if (veteran.status === 'Archive')
        {
            const reopenBtn = document.createElement('button');
            reopenBtn.innerHTML = '<i>unarchive</i> Re-Open';
            reopenBtn.className = 'responsive action-button info-button'; // Added info-button
            reopenBtn.onclick = (e) =>
            {
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
        amountOwedEl.innerHTML = `Owed: ${formatCurrency(paymentInfo.amountOwed)}`; // Uses shared formatCurrency
        if (paymentInfo.isOverdue && paymentInfo.amountOwed > 0)
        {
            const overdueSpan = document.createElement('span');
            overdueSpan.className = 'overdue-indicator';
            overdueSpan.textContent = ' (Overdue)';
            amountOwedEl.appendChild(overdueSpan);
        }
        rightSection.appendChild(amountOwedEl);

        const nextDueDateEl = document.createElement('div');
        nextDueDateEl.className = 'veteran-next-due-date';
        nextDueDateEl.textContent = `Next Due: ${formatDate(paymentInfo.nextDueDate)}`; // Uses shared formatDate
        rightSection.appendChild(nextDueDateEl);

        mainContent.appendChild(rightSection);
        listItem.appendChild(mainContent);
        veteransListContainerEl.appendChild(listItem);
    }
    if (totalVeteransDisplayed) totalVeteransDisplayed.textContent = veteransToRender.length.toString();
    if (typeof ui === 'function') ui(); // Re-initialize BeerCSS for tooltips on new buttons
}

/**
 * Filters the `allVeterans` array based on current search and status filters, then calls `renderVeteransList`.
 */
async function filterAndDisplayVeterans()
{
    const statusValue = currentStatusFilterValue; // Already set by filter button click
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

    displayedVeterans = allVeterans.filter(veteran =>
    {
        const matchesStatus = !statusValue || veteran.status === statusValue;
        const nameMatch = veteran.full_name && veteran.full_name.toLowerCase().includes(searchTerm);
        const idCardMatch = veteran.id_card_number && veteran.id_card_number.toLowerCase().includes(searchTerm);
        const emailMatch = veteran.email && veteran.email.toLowerCase().includes(searchTerm);
        const matchesSearch = !searchTerm || nameMatch || idCardMatch || emailMatch;
        return matchesStatus && matchesSearch;
    });
    await renderVeteransList(displayedVeterans); // This is async due to payment calcs in render
}

/**
 * Confirms and then updates a veteran's status.
 * @param {string} veteranId - The ID of the veteran to update.
 * @param {string} newStatus - The new status to set.
 * @param {string} title - Confirmation dialog title.
 * @param {string} text - Confirmation dialog text.
 */
async function confirmUpdateVeteranStatus(veteranId, newStatus, title, text)
{
    showConfirmActionModal(
        title,
        text,
        async () =>
        {
            showLoading(); // Shared function
            try
            {
                // Uses shared VETERANS_COLLECTION
                const updatedRecord = await pb.collection(VETERANS_COLLECTION).update(veteranId, { status: newStatus });
                await fetchVeterans(); // Refresh list and potentially open drawer details

                // If the updated veteran is currently being viewed/edited, refresh drawer
                if (currentEditingVeteranId === veteranId && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active')))
                {
                    const updatedVeteranData = allVeterans.find(v => v.id === veteranId);
                    if (updatedVeteranData)
                    {
                        originalVeteranDataForEdit = { ...updatedVeteranData };
                        await populateMemberDetailsForm(updatedVeteranData, isMemberDetailsEditMode);
                    }
                }
                showMessage("Status Updated", `${updatedRecord.full_name || 'Veteran'}'s status changed to ${newStatus}.`); // Shared function
            } catch (error)
            {
                console.error("Error updating status:", error);
                showMessage("Update Error", `Failed to update status for veteran ID ${veteranId}. ${error.data?.message || error.message}`); // Shared function
            } finally
            {
                hideLoading(); // Shared function
            }
        }
    );
}

/**
 * Confirms and then records a payment for a veteran.
 * If the veteran was an 'Application', their status is changed to 'Member'.
 * Uses shared MEMBERSHIP_FEE, TRANSACTIONS_COLLECTION, VETERANS_COLLECTION.
 * @param {string} veteranId - The ID of the veteran.
 * @param {string} veteranName - The name of the veteran for messages.
 */
async function confirmRecordPayment(veteranId, veteranName)
{
    showConfirmActionModal(
        `Confirm Payment`,
        `Record a payment of ${formatCurrency(MEMBERSHIP_FEE)} for ${veteranName || 'this veteran'}?`, // Uses shared formatCurrency & MEMBERSHIP_FEE
        async () =>
        {
            showLoading(); // Shared function
            try
            {
                // Uses shared TRANSACTIONS_COLLECTION & MEMBERSHIP_FEE
                await pb.collection(TRANSACTIONS_COLLECTION).create({
                    veteran: veteranId,
                    amount_paid: MEMBERSHIP_FEE,
                    // transaction_date: new Date().toISOString(), // Optional: if you have such a field
                });

                const veteran = allVeterans.find(v => v.id === veteranId);
                if (veteran && veteran.status === 'Application')
                {
                    // Uses shared VETERANS_COLLECTION
                    await pb.collection(VETERANS_COLLECTION).update(veteranId, { status: 'Member' });
                }

                await fetchVeterans(); // Refresh list and drawer

                // If the updated veteran is currently being viewed/edited, refresh drawer
                if (currentEditingVeteranId === veteranId && memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active')))
                {
                    const updatedVeteranData = allVeterans.find(v => v.id === veteranId);
                    if (updatedVeteranData)
                    {
                        originalVeteranDataForEdit = { ...updatedVeteranData };
                        await populateMemberDetailsForm(updatedVeteranData, isMemberDetailsEditMode);
                    }
                }
                showMessage("Payment Recorded", `Payment of ${formatCurrency(MEMBERSHIP_FEE)} recorded for ${veteranName || 'Veteran'}.`); // Shared functions
            } catch (error)
            {
                console.error("Error recording payment:", error);
                showMessage("Payment Error", `Failed to record payment for ${veteranName || 'Veteran'}. ${error.data?.message || error.message}`); // Shared functions
            } finally
            {
                hideLoading(); // Shared function
            }
        }
    );
}


// --- Event Listeners & Initialization ---
if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout); // handleLogout is from shared_app.js

if (statusFilterMenu)
{
    statusFilterMenu.querySelectorAll('li').forEach(item =>
    {
        item.addEventListener('click', () =>
        {
            currentStatusFilterValue = item.dataset.value;
            if (statusFilterBtnText) statusFilterBtnText.textContent = item.textContent;
            if (typeof ui === 'function' && statusFilterMenu.classList.contains("active"))
            {
                ui('#status-filter-menu'); // Close menu using BeerCSS
            }
            filterAndDisplayVeterans();
        });
    });
}

if (searchInput) searchInput.addEventListener('input', filterAndDisplayVeterans);

if (resetFiltersBtn)
{
    resetFiltersBtn.addEventListener('click', () =>
    {
        currentStatusFilterValue = "";
        if (statusFilterBtnText) statusFilterBtnText.textContent = "All Statuses"; // Default text
        if (searchInput) searchInput.value = '';
        filterAndDisplayVeterans();
    });
}


document.addEventListener('DOMContentLoaded', () =>
{
    if (typeof ui === 'function') ui(); // Initialize all BeerCSS components on the page

    // Setup for status dropdown in the edit drawer
    if (detailStatusEditMenu && detailStatusEditBtnText && detailStatusEditBtn)
    {
        detailStatusEditMenu.querySelectorAll('li').forEach(item =>
        {
            item.addEventListener('click', () =>
            {
                detailStatusEditBtnText.textContent = item.textContent;
                detailStatusEditBtn.dataset.selectedValue = item.dataset.value;
                if (typeof ui === 'function' && detailStatusEditMenu.classList.contains("active"))
                {
                    ui('#detail-status-edit-menu'); // Close menu
                }
            });
        });
    }

    // Add ripple effect to all menu items for consistency (BeerCSS might do this automatically too)
    document.querySelectorAll('menu li').forEach(li =>
    {
        li.classList.add('ripple');
    });

    initAdminPage(); // Initialize the admin page logic

    // Global Escape key handler for modals/drawers
    document.addEventListener('keydown', (event) =>
    {
        if (event.key === 'Escape')
        {
            let closedSomething = false;
            if (confirmActionDialogEl && (confirmActionDialogEl.open || confirmActionDialogEl.classList.contains('active')))
            {
                if (typeof ui === 'function') ui('#confirm-action-dialog'); else confirmActionDialogEl.classList.remove('active');
                closedSomething = true;
            } else if (document.getElementById('message-dialog') && (document.getElementById('message-dialog').open || document.getElementById('message-dialog').classList.contains('active')))
            { // Check generic message dialog
                if (typeof ui === 'function') ui('#message-dialog'); else document.getElementById('message-dialog').classList.remove('active');
                closedSomething = true;
            } else if (memberDetailsDrawer && (memberDetailsDrawer.open || memberDetailsDrawer.classList.contains('active')))
            {
                if (typeof ui === 'function') ui('#member-details-drawer'); else memberDetailsDrawer.classList.remove('active');
                closedSomething = true;
            }
            if (closedSomething) event.preventDefault();
        }
    });
});
