// --- Configuration ---
const POCKETBASE_URL = 'https://veterans.fly.dev/'; // IMPORTANT: REPLACE
const VETERANS_COLLECTION = 'veterans';
const TRANSACTIONS_COLLECTION = 'transactions';
const MEMBERSHIP_FEE = 10; // EUR

// --- UI Elements ---
const loadingIndicator = document.getElementById('loading-indicator');
const messageDialogEl = document.getElementById('message-dialog');
const messageDialogTitle = document.getElementById('message-dialog-title');
const messageDialogText = document.getElementById('message-dialog-text');

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


// --- PocketBase Client & State ---
let pb = null;
let loggedInVeteran = null;

// --- Utility Functions ---
function showLoading() { loadingIndicator.classList.remove('hidden'); loadingIndicator.classList.add('flex'); }
function hideLoading() { loadingIndicator.classList.add('hidden'); loadingIndicator.classList.remove('flex'); }

function showMessage(title, text)
{
    messageDialogTitle.textContent = title;
    messageDialogText.textContent = text;
    ui('#message-dialog');
}

function formatDate(dateString)
{
    if (!dateString) return 'N/A';
    try
    {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return 'Invalid Date Format'; }
}

function formatCurrency(amount)
{
    return `€${Number(amount).toFixed(2)}`;
}

function getStatusBadgeClass(status)
{
    switch (status)
    {
        case 'Application': return 'status-application';
        case 'Member': return 'status-member';
        case 'Archive': return 'status-archive';
        default: return '';
    }
}

async function getLastPaymentTransaction(veteranId)
{
    if (!pb) return null;
    try
    {
        const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({
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
        const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({
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


async function calculateAmountOwedAndOverdueStatus(veteranId, veteranStatus, veteranCreatedDate)
{
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        isOverdue = true;
    } else if (veteranStatus === 'Member')
    {
        if (lastPaymentDate)
        {
            nextDueDate = new Date(lastPaymentDate);
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            nextDueDate.setHours(0, 0, 0, 0);

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
            amountOwed = MEMBERSHIP_FEE;
            isOverdue = true;
            if (veteranCreatedDate)
            {
                nextDueDate = new Date(veteranCreatedDate);
                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                nextDueDate.setHours(0, 0, 0, 0);
                if (today >= nextDueDate)
                {
                    isOverdue = true;
                } else
                {
                    isOverdue = true;
                }
            }
        }
    }
    return {
        amountOwed: amountOwed,
        isOverdue: isOverdue,
        nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
        lastPaymentDate: lastPaymentDate ? lastPaymentDate.toISOString() : null
    };
}

// --- Main Profile Logic ---
async function loadProfileData()
{
    if (!pb.authStore.isValid || !pb.authStore.model || pb.authStore.model.collectionName !== VETERANS_COLLECTION)
    {
        window.location.href = '/';
        return;
    }
    loggedInVeteran = pb.authStore.model;
    showLoading();

    try
    {
        // Reset and hide application/status message div initially
        applicationStatusMessageDiv.classList.add('hidden');
        applicationStatusMessageDiv.innerHTML = '';
        applicationStatusMessageDiv.style.backgroundColor = 'var(--surface-container-low)'; // Default for app message
        applicationStatusMessageDiv.style.color = 'var(--on-surface-variant)'; // Default for app message

        // Fetch full veteran details (authStore model might be partial)
        const veteranFullDetails = await pb.collection(VETERANS_COLLECTION).getOne(loggedInVeteran.id);
        loggedInVeteran = veteranFullDetails; // Update with full details

        const amountOwedSection = document.getElementById('amount-owed-section');
        const nextDueDateSection = document.getElementById('next-due-date-section');

        veteranNameTitle.textContent = loggedInVeteran.full_name || 'Veteran';

        // Personal Info
        profileFullName.textContent = loggedInVeteran.full_name || 'N/A';
        profileIdCardNumber.textContent = loggedInVeteran.id_card_number || 'N/A';
        profileEmail.textContent = loggedInVeteran.email || 'N/A';
        profilePhoneNumber.textContent = loggedInVeteran.phone_number || 'N/A';
        profileFullAddress.textContent = loggedInVeteran.full_address || 'N/A';
        profileSystemId.textContent = loggedInVeteran.id || 'N/A';

        // Next of Kin
        profileNextOfKinFullName.textContent = loggedInVeteran.next_of_kin_full_name || 'N/A';
        profileNextOfKinFullPhoneNumber.textContent = loggedInVeteran.next_of_kin_full_phone_number || 'N/A';
        profileNextOfKinRelationship.textContent = loggedInVeteran.next_of_kin_relationship || 'N/A';

        // Admin Note
        profileAdminNote.textContent = loggedInVeteran.admin_note || 'No administrative notes on file.';


        // Membership Overview
        profileStatus.textContent = loggedInVeteran.status || 'Unknown';
        profileStatus.className = `status-badge ${getStatusBadgeClass(loggedInVeteran.status)}`;

        profileApplicationDate.textContent = formatDate(loggedInVeteran.created);

        let registrationDateDisplay = 'N/A';

        if (loggedInVeteran.status === 'Application')
        {
            applicationStatusMessageDiv.innerHTML = `
                <p style="margin-bottom: 0.5rem; color: var(--on-surface-variant);">Thank you for applying to join the Malta Veterans Association.</p>
                <p style="margin-bottom: 0.5rem; color: var(--on-surface-variant);">We’ve received your application and it’s currently under review by our team. Please allow a few days for the approval process. You’ll receive an email notification once your application has been approved.</p>
                <p style="color: var(--on-surface-variant);">Once accepted, a one-time registration fee of €10 is required, followed by an annual membership fee of €10.</p>
            `;
            applicationStatusMessageDiv.classList.remove('hidden');
            amountOwedSection.classList.add('hidden');
            nextDueDateSection.classList.add('hidden');
            profileAmountOwed.textContent = formatCurrency(MEMBERSHIP_FEE); // Still show potential fee
            profileNextDueDate.textContent = 'N/A (Pending Approval)';
            profileLastPaymentDate.textContent = 'No payments yet'; // Applicants have no payment history

        } else
        {
            amountOwedSection.classList.remove('hidden');
            nextDueDateSection.classList.remove('hidden');

            const paymentInfo = await calculateAmountOwedAndOverdueStatus(loggedInVeteran.id, loggedInVeteran.status, loggedInVeteran.created);
            profileAmountOwed.textContent = formatCurrency(paymentInfo.amountOwed);
            if (paymentInfo.isOverdue && paymentInfo.amountOwed > 0)
            {
                const overdueSpan = document.createElement('span');
                overdueSpan.className = 'overdue-indicator';
                overdueSpan.textContent = '(Overdue)';
                profileAmountOwed.appendChild(overdueSpan);
            }
            profileNextDueDate.textContent = formatDate(paymentInfo.nextDueDate);

            if (paymentInfo.lastPaymentDate)
            {
                profileLastPaymentDate.textContent = formatDate(paymentInfo.lastPaymentDate);
            } else
            {
                profileLastPaymentDate.textContent = 'No payments yet';
            }

            // Display overdue message for Members
            if (loggedInVeteran.status === 'Member' && paymentInfo.isOverdue && paymentInfo.amountOwed > 0)
            {
                const paymentLinkBase = 'https://buy.stripe.com/7sYeVf9gv5mjaXTh1N3VC01';
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

        if (loggedInVeteran.status === 'Member' || loggedInVeteran.status === 'Archive') // Also show for archive if they were a member
        {
            const firstPayment = await getFirstPaymentTransaction(loggedInVeteran.id);
            registrationDateDisplay = formatDate(firstPayment ? firstPayment.created : loggedInVeteran.created);
        } else
        { // If not member, check if they ever made a payment (e.g. archived member)
            const firstPayment = await getFirstPaymentTransaction(loggedInVeteran.id);
            if (firstPayment) registrationDateDisplay = formatDate(firstPayment.created);
        }
        profileRegistrationDate.textContent = registrationDateDisplay;

        // Transaction History
        const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({
            filter: `veteran = "${loggedInVeteran.id}"`,
            sort: '-created'
        });

        transactionHistoryBody.innerHTML = ''; // Clear loading/previous
        if (transactions.length > 0)
        {
            transactions.forEach(tx =>
            {
                const row = transactionHistoryBody.insertRow();
                row.insertCell().textContent = formatDate(tx.created);
                row.insertCell().textContent = formatCurrency(tx.amount_paid);
                row.insertCell().textContent = tx.id;

                // Actions cell
                const actionsCell = row.insertCell();
                const viewButton = document.createElement('button');
                viewButton.textContent = 'View';
                viewButton.className = 'action-button';
                viewButton.onclick = () => { /* View action */ };
                actionsCell.appendChild(viewButton);

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'action-button';
                editButton.onclick = () => { /* Edit action */ };
                actionsCell.appendChild(editButton);
            });
        } else
        {
            transactionHistoryBody.innerHTML = '<tr><td colspan="4" class="center-align">No transactions found.</td></tr>';
        }

        profileContent.classList.remove('hidden');
    } catch (error)
    {
        console.error("Error loading profile data:", error);
        showMessage("Error", "Could not load your profile data. Please try logging in again.");
        // pb.authStore.clear(); 
        // window.location.href = '/';
    } finally
    {
        hideLoading();
    }
}

async function handleLogout()
{
    showLoading();
    try
    {
        pb.authStore.clear();
        window.location.href = '/';
    } catch (error)
    {
        console.error("Logout failed:", error);
        showMessage("Logout Error", "An error occurred during logout.");
    } finally
    {
        hideLoading();
    }
}

function toggleTheme()
{
    const body = document.body;
    body.classList.toggle('dark');
    body.classList.toggle('light');
    themeSwitcherBtn.innerHTML = body.classList.contains('dark') ? '<i>dark_mode</i>' : '<i>light_mode</i>';
    // Optionally, save theme preference to localStorage
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () =>
{
    pb = new PocketBase(POCKETBASE_URL);
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Apply saved theme or default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark')
    {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        themeSwitcherBtn.innerHTML = '<i>dark_mode</i>';
    } else
    {
        themeSwitcherBtn.innerHTML = '<i>light_mode</i>'; // Default
    }


    if (pb.authStore.isValid && pb.authStore.model && pb.authStore.model.collectionName === VETERANS_COLLECTION)
    {
        loadProfileData();
    } else
    {
        // If not a valid veteran session, clear and redirect.
        pb.authStore.clear();
        window.location.href = '/';
    }

    logoutBtn.addEventListener('click', handleLogout);
    themeSwitcherBtn.addEventListener('click', toggleTheme);
    ui(); // Initialize BeerCSS components like modals
});