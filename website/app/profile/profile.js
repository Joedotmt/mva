// --- UI Elements (Profile Specific) ---
// Note: 'loadingIndicator', 'messageDialogEl', 'messageDialogTitle', 'messageDialogText'
// are assumed to be in the HTML and will be used by shared functions.

const profileContent = document.getElementById('profile-content');
const veteranNameTitle = document.getElementById('veteran-name-title');
const profileStatus = document.getElementById('profile-status');
const profileAmountOwed = document.getElementById('profile-amount-owed');
const profileNextDueDate = document.getElementById('profile-next-due-date');
const profileApplicationDate = document.getElementById('profile-application-date');
const profileRegistrationDate = document.getElementById('profile-registration-date');
const profileLastPaymentDate = document.getElementById('profile-last-payment-date');

const profileFullName = document.getElementById('profile-full_name');
const profileIdCardNumber = document.getElementById('profile-id_card_number');
const profileEmail = document.getElementById('profile-email');
const profilePhoneNumber = document.getElementById('profile-phone_number');
const profileFullAddress = document.getElementById('profile-full_address');
const profileSystemId = document.getElementById('profile-system-id');

const profileNextOfKinFullName = document.getElementById('profile-next_of_kin_full_name');
const profileNextOfKinFullPhoneNumber = document.getElementById('profile-next_of_kin_full_phone_number');
const profileNextOfKinRelationship = document.getElementById('profile-next_of_kin_relationship');
const profileAdminNote = document.getElementById('profile-admin-note');

const transactionHistoryBody = document.getElementById('transaction-history-body');
const applicationStatusMessageDiv = document.getElementById('application-status-message');
const logoutBtn = document.getElementById('logout-btn');
const themeSwitcherBtn = document.getElementById('theme-switcher');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const deleteConfirmDialog = document.getElementById('delete-confirm-dialog');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
const deleteConfirmCancelBtn = document.getElementById('delete-confirm-cancel-btn');
const deleteConfirmInput = document.getElementById('delete-confirm-input');

// --- PocketBase Client & State ---
let pb = null; // Will be initialized in DOMContentLoaded
let loggedInVeteran = null;

// Initialize PocketBase client - POCKETBASE_URL is from shared.js
pb = new PocketBase(POCKETBASE_URL);

const currentYearEl = document.getElementById('current-year');
if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

// Apply saved theme or default to light
const savedTheme = localStorage.getItem('theme');
if (themeSwitcherBtn)
{ // Ensure button exists before trying to set its content
    if (savedTheme === 'dark')
    {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        themeSwitcherBtn.innerHTML = '<i>dark_mode</i>';
    } else
    {
        document.body.classList.remove('dark'); // Ensure light is default if no saved theme or saved is light
        document.body.classList.add('light');
        themeSwitcherBtn.innerHTML = '<i>light_mode</i>';
    }
}


if (pb.authStore.isValid && pb.authStore.model && pb.authStore.model.collectionName === VETERANS_COLLECTION)
{ // VETERANS_COLLECTION from shared.js
    loadProfileData();
} else
{
    // If not a valid veteran session, clear and redirect.
    pb.authStore.clear();
    window.location.href = '/mva'; // Redirect to login/home page
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout); // handleLogout is from shared.js
if (themeSwitcherBtn) themeSwitcherBtn.addEventListener('click', toggleTheme);
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        // Reset dialog state when opening
        if (deleteConfirmInput) deleteConfirmInput.value = '';
        if (deleteConfirmBtn) deleteConfirmBtn.disabled = true;
        ui('#delete-confirm-dialog');
    });
}
if (deleteConfirmCancelBtn) deleteConfirmCancelBtn.addEventListener('click', () => ui('#delete-confirm-dialog'));
if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', handleDeleteAccount);
if (deleteConfirmInput) {
    deleteConfirmInput.addEventListener('input', () => {
        if (deleteConfirmBtn) {
            deleteConfirmBtn.disabled = deleteConfirmInput.value !== 'delete account';
        }
    });
}


// Initialize BeerCSS components like modals, if ui() is available
if (typeof ui === 'function')
{
    ui();
} else
{
    console.warn("BeerCSS ui() function not found. Some components might not initialize correctly.");
}

// --- Main Profile Logic ---
async function loadProfileData()
{
    loggedInVeteran = pb.authStore.model;
    showLoading();

    try
    {
        // Reset and hide application/status message div initially
        if (applicationStatusMessageDiv)
        {
            applicationStatusMessageDiv.classList.add('hidden');
            applicationStatusMessageDiv.innerHTML = '';
            applicationStatusMessageDiv.style.backgroundColor = 'var(--surface-container-low)';
            applicationStatusMessageDiv.style.color = 'var(--on-surface-variant)';
        }

        // Fetch full veteran details (authStore model might be partial)
        const veteranFullDetails = await pb.collection(VETERANS_COLLECTION).getOne(loggedInVeteran.id);
        loggedInVeteran = veteranFullDetails; // Update with full details

        const amountOwedSection = document.getElementById('amount-owed-section');
        const nextDueDateSection = document.getElementById('next-due-date-section');

        if (veteranNameTitle) veteranNameTitle.textContent = loggedInVeteran.full_name || 'Veteran';

        // Personal Info
        if (profileFullName) profileFullName.textContent = loggedInVeteran.full_name || 'N/A';
        if (profileIdCardNumber) profileIdCardNumber.textContent = loggedInVeteran.id_card_number || 'N/A';
        if (profileEmail) profileEmail.textContent = loggedInVeteran.email || 'N/A';
        if (profilePhoneNumber) profilePhoneNumber.textContent = loggedInVeteran.phone_number || 'N/A';
        if (profileFullAddress) profileFullAddress.textContent = loggedInVeteran.full_address || 'N/A';
        if (profileSystemId) profileSystemId.textContent = loggedInVeteran.id || 'N/A';

        // Next of Kin
        if (profileNextOfKinFullName) profileNextOfKinFullName.textContent = loggedInVeteran.next_of_kin_full_name || 'N/A';
        if (profileNextOfKinFullPhoneNumber) profileNextOfKinFullPhoneNumber.textContent = loggedInVeteran.next_of_kin_full_phone_number || 'N/A';
        if (profileNextOfKinRelationship) profileNextOfKinRelationship.textContent = loggedInVeteran.next_of_kin_relationship || 'N/A';

        // Admin Note
        if (profileAdminNote) profileAdminNote.textContent = loggedInVeteran.admin_note || 'No administrative notes on file.';


        // Membership Overview
        if (profileStatus)
        {
            profileStatus.textContent = loggedInVeteran.status || 'Unknown';
            profileStatus.className = `status-badge ${getStatusBadgeClass(loggedInVeteran.status)}`; // Uses shared function
        }

        if (profileApplicationDate) profileApplicationDate.textContent = formatDate(loggedInVeteran.created); // Uses shared function

        let registrationDateDisplay = 'N/A';

        if (loggedInVeteran.status === 'Application')
        {
            if (applicationStatusMessageDiv)
            {
                applicationStatusMessageDiv.innerHTML = `
                    <p style="margin-bottom: 0.5rem; color: var(--on-surface-variant);">Thank you for applying to join the Malta Veterans Association.</p>
                    <p style="margin-bottom: 0.5rem; color: var(--on-surface-variant);">We’ve received your application and it’s currently under review by our team. Please allow a few days for the approval process. You’ll receive an email notification once your application has been approved.</p>
                    <p style="color: var(--on-surface-variant);">Once accepted, a one-time registration fee of €${MEMBERSHIP_FEE} is required, followed by an annual membership fee of €${MEMBERSHIP_FEE}.</p>
                `; // Uses shared constant
                applicationStatusMessageDiv.classList.remove('hidden');
            }
            if (amountOwedSection) amountOwedSection.classList.add('hidden');
            if (nextDueDateSection) nextDueDateSection.classList.add('hidden');
            if (profileAmountOwed) profileAmountOwed.textContent = formatCurrency(MEMBERSHIP_FEE); // Uses shared constant & function
            if (profileNextDueDate) profileNextDueDate.textContent = 'N/A (Pending Approval)';
            if (profileLastPaymentDate) profileLastPaymentDate.textContent = 'No payments yet';

        } else
        { // Member or Archive (if they were a member)
            if (amountOwedSection) amountOwedSection.classList.remove('hidden');
            if (nextDueDateSection) nextDueDateSection.classList.remove('hidden');

            // Uses shared function
            const paymentInfo = await calculateAmountOwedAndOverdueStatus(loggedInVeteran.id, loggedInVeteran.status, loggedInVeteran.created);

            if (profileAmountOwed) profileAmountOwed.textContent = formatCurrency(paymentInfo.amountOwed); // Uses shared function
            if (paymentInfo.isOverdue && paymentInfo.amountOwed > 0 && profileAmountOwed)
            {
                const overdueSpan = document.createElement('span');
                overdueSpan.className = 'overdue-indicator';
                overdueSpan.textContent = '(Overdue)';
                profileAmountOwed.appendChild(overdueSpan);
            }
            if (profileNextDueDate) profileNextDueDate.textContent = formatDate(paymentInfo.nextDueDate); // Uses shared function

            if (profileLastPaymentDate)
            {
                profileLastPaymentDate.textContent = paymentInfo.lastPaymentDate ? formatDate(paymentInfo.lastPaymentDate) : 'No payments yet'; // Uses shared function
            }


            // Display overdue message for Members
            if (loggedInVeteran.status === 'Member' && paymentInfo.isOverdue && paymentInfo.amountOwed > 0 && applicationStatusMessageDiv)
            {
                const paymentLinkBase = 'https://buy.stripe.com/7sYeVf9gv5mjaXTh1N3VC01'; // Example, replace with actual or make configurable
                const prefilledEmail = encodeURIComponent(loggedInVeteran.email || '');
                const clientReferenceId = encodeURIComponent(loggedInVeteran.id);
                const paymentLink = `${paymentLinkBase}?prefilled_email=${prefilledEmail}&client_reference_id=${clientReferenceId}`;

                applicationStatusMessageDiv.innerHTML = `
                    <div class="overdue-message-container">
                        <div class="overdue-message-text">
                            <h6 style="color: var(--on-error-container); margin-bottom: 0.5rem;">Action Required: Overdue Membership Fee</h6>
                            <p style="color: var(--on-error-container); margin-bottom: 0.5rem;">Your membership fee of ${formatCurrency(paymentInfo.amountOwed)} is overdue. To remain an active member and be eligible for MVA events and benefits, please settle your payment at your earliest convenience.</p>
                            <p style="color: var(--on-error-container); font-size: 0.9rem; margin-top: 1rem;">If you have already made this payment, please allow a few hours for our records to update, but usually it updates instanly. If you believe this is an error, please contact us.</p>
                        </div>
                        <div class="overdue-message-action paybutton">
                            <a href="${paymentLink}" class="paybutton" target="_blank"><button class="primary ripple no-margin paybutton">Pay ${formatCurrency(paymentInfo.amountOwed)} Now</button></a>
                        </div>
                    </div>
                `;
                applicationStatusMessageDiv.style.backgroundColor = 'var(--error-container)';
                applicationStatusMessageDiv.classList.remove('hidden');
            }
        }

        if (loggedInVeteran.status === 'Member' || loggedInVeteran.status === 'Archive')
        {
            const firstPayment = await getFirstPaymentTransaction(loggedInVeteran.id); // Uses shared function
            registrationDateDisplay = formatDate(firstPayment ? firstPayment.created : loggedInVeteran.created); // Uses shared function
        } else
        {
            const firstPayment = await getFirstPaymentTransaction(loggedInVeteran.id); // Uses shared function
            if (firstPayment) registrationDateDisplay = formatDate(firstPayment.created); // Uses shared function
        }
        if (profileRegistrationDate) profileRegistrationDate.textContent = registrationDateDisplay;

        // Transaction History
        const transactions = await getAllTransactionsForVeteran(loggedInVeteran.id); // Use shared cached function

        if (transactionHistoryBody)
        {
            transactionHistoryBody.innerHTML = ''; // Clear loading/previous
            if (transactions.length > 0)
            {
                transactions.forEach(tx =>
                {
                    const row = transactionHistoryBody.insertRow();
                    row.insertCell().textContent = formatDate(tx.created); // Uses shared function
                    row.insertCell().textContent = formatCurrency(tx.amount_paid); // Uses shared function
                    row.insertCell().textContent = tx.id;

                    // Actions cell - kept simple for profile view, could be expanded
                    const actionsCell = row.insertCell();
                    actionsCell.textContent = 'N/A'; // Or implement view/details if needed
                });
            } else
            {
                transactionHistoryBody.innerHTML = '<tr><td colspan="4" class="center-align">No transactions found.</td></tr>';
            }
        }

        if (profileContent) profileContent.classList.remove('hidden');

    } catch (error)
    {
        console.error("Error loading profile data:", error);
        showMessage("Error", "Could not load your profile data. Please try logging in again or contact support if the issue persists."); // Uses shared function
        // Consider if pb.authStore.clear() and redirect is appropriate here, or allow retry.
        // pb.authStore.clear();
        // window.location.href = '/mva';
    } finally
    {
        hideLoading(); // Uses shared function
    }
}

/**
 * Handles the permanent deletion of the user's account.
 */
async function handleDeleteAccount() {
    if (!loggedInVeteran || !loggedInVeteran.id) {
        showMessage("Error", "Could not identify user to delete.");
        return;
    }

    ui('#delete-confirm-dialog'); // Close dialog
    showLoading();

    try {
        await pb.collection(VETERANS_COLLECTION).delete(loggedInVeteran.id);
        showMessage("Success", "Your account has been permanently deleted. You will now be logged out.", () => {
            pb.authStore.clear();
            window.location.href = '/mva';
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        showMessage("Deletion Failed", "There was an error deleting your account. Please contact support.");
    } finally {
        hideLoading();
    }
}


/**
 * Toggles the theme between light and dark mode.
 * Saves the preference to localStorage.
 * Assumes 'themeSwitcherBtn' exists.
 */
function toggleTheme()
{
    const body = document.body;
    body.classList.toggle('dark');
    body.classList.toggle('light');

    if (themeSwitcherBtn)
    {
        themeSwitcherBtn.innerHTML = body.classList.contains('dark') ? '<i>dark_mode</i>' : '<i>light_mode</i>';
    }
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
}