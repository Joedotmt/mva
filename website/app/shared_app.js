// --- Shared Configuration ---
const POCKETBASE_URL = 'https://veterans.fly.dev/'; // Ensure this is the correct URL
const VETERANS_COLLECTION = 'veterans';
const TRANSACTIONS_COLLECTION = 'transactions';
const MEMBERSHIP_FEE = 10; // EUR

// --- Shared UI Utility Functions ---

/**
 * Shows the loading indicator.
 * Assumes an element with ID 'loading-indicator' exists.
 */
function showLoading()
{
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator)
    {
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.classList.add('flex');
    } else
    {
        console.warn('Loading indicator element not found.');
    }
}

/**
 * Hides the loading indicator.
 * Assumes an element with ID 'loading-indicator' exists.
 */
function hideLoading()
{
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator)
    {
        loadingIndicator.classList.add('hidden');
        loadingIndicator.classList.remove('flex');
    } else
    {
        console.warn('Loading indicator element not found.');
    }
}

/**
 * Shows a message dialog.
 * Assumes elements with IDs 'message-dialog-title', 'message-dialog-text', and 'message-dialog' exist,
 * and that the BeerCSS ui() function is globally available.
 * @param {string} title - The title of the message.
 * @param {string} text - The text content of the message.
 */
function showMessage(title, text)
{
    const messageDialogTitle = document.getElementById('message-dialog-title');
    const messageDialogText = document.getElementById('message-dialog-text');
    const messageDialogEl = document.getElementById('message-dialog');

    if (messageDialogTitle) messageDialogTitle.textContent = title;
    if (messageDialogText) messageDialogText.textContent = text;

    if (messageDialogEl && typeof ui === 'function')
    {
        ui('#message-dialog'); // Show the dialog using BeerCSS
    } else if (messageDialogEl)
    {
        console.warn("BeerCSS ui() function not found or message dialog element issue. Cannot show modal programmatically.");
        // As a last resort, if you absolutely need to show something and alert is forbidden:
        if (messageDialogText) messageDialogText.textContent = `${title}: ${text}`;
        if (messageDialogEl) messageDialogEl.classList.add('active'); // Attempt to show manually if BeerCSS `ui` is missing
    } else
    {
        console.warn('Message dialog elements not found.');
    }
}

// --- Shared Data Formatting and Calculation Functions ---

/**
 * Formats a date string into 'DD Mon YYYY' format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date or 'N/A' or an error message.
 */
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
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date Format';
    }
}

/**
 * Formats a number as currency (EUR).
 * @param {number} amount - The amount to format.
 * @returns {string} - The formatted currency string.
 */
function formatCurrency(amount)
{
    return `€${Number(amount).toFixed(2)}`;
}

/**
 * Gets the CSS class for a status badge based on the veteran's status.
 * @param {string} status - The status of the veteran.
 * @returns {string} - The CSS class for the badge.
 */
function getStatusBadgeClass(status)
{
    switch (status)
    {
        case 'Application': return 'status-application';
        case 'Member': return 'status-member';
        case 'Archive': return 'status-archive';
        default: return 'grey'; // Default class if status is unknown
    }
}

/**
 * Fetches the last payment transaction for a given veteran.
 * Assumes 'pb' (PocketBase instance) is globally available and initialized.
 * @param {string} veteranId - The ID of the veteran.
 * @returns {Promise<Object|null>} - The last transaction object or null.
 */
async function getLastPaymentTransaction(veteranId)
{
    if (!pb)
    {
        console.error("PocketBase instance (pb) is not available for getLastPaymentTransaction.");
        return null;
    }
    try
    {
        const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({
            filter: `veteran = "${veteranId}"`,
            sort: '-created',
            perPage: 1, // Limit to 1 record
        });
        return transactions.length > 0 ? transactions[0] : null;
    } catch (error)
    {
        console.error(`Error fetching last payment transaction for veteran ${veteranId}:`, error);
        // showMessage("Error", `Could not fetch last payment for veteran ${veteranId}.`); // Optional: inform user
        return null;
    }
}

/**
 * Fetches the first payment transaction for a given veteran.
 * Assumes 'pb' (PocketBase instance) is globally available and initialized.
 * @param {string} veteranId - The ID of the veteran.
 * @returns {Promise<Object|null>} - The first transaction object or null.
 */
async function getFirstPaymentTransaction(veteranId)
{
    if (!pb)
    {
        console.error("PocketBase instance (pb) is not available for getFirstPaymentTransaction.");
        return null;
    }
    try
    {
        const transactions = await pb.collection(TRANSACTIONS_COLLECTION).getFullList({
            filter: `veteran = "${veteranId}"`,
            sort: 'created', // Sort by oldest first
            perPage: 1,    // Limit to 1 record
        });
        return transactions.length > 0 ? transactions[0] : null;
    } catch (error)
    {
        console.error(`Error fetching first payment transaction for veteran ${veteranId}:`, error);
        // showMessage("Error", `Could not fetch first payment for veteran ${veteranId}.`); // Optional: inform user
        return null;
    }
}

/**
 * Calculates the amount owed by a veteran and their overdue status.
 * Assumes 'pb' (PocketBase instance) is globally available and initialized.
 * Uses MEMBERSHIP_FEE, getLastPaymentTransaction constants/functions from this shared file.
 * @param {string} veteranId - The ID of the veteran.
 * @param {string} veteranStatus - The current status of the veteran (e.g., 'Application', 'Member', 'Archive').
 * @param {string} veteranCreatedDate - The creation date string of the veteran record.
 * @returns {Promise<Object>} - An object containing amountOwed, isOverdue, nextDueDate, and lastPaymentDate.
 */
async function calculateAmountOwedAndOverdueStatus(veteranId, veteranStatus, veteranCreatedDate)
{
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day for accurate comparisons

    if (veteranStatus === 'Archive')
    {
        return { amountOwed: 0, isOverdue: false, nextDueDate: null, lastPaymentDate: null };
    }

    const lastPayment = await getLastPaymentTransaction(veteranId); // Uses global pb
    let lastPaymentDate = null;
    if (lastPayment && lastPayment.created)
    {
        lastPaymentDate = new Date(lastPayment.created);
    }

    let nextDueDate = null;
    let amountOwed = 0;
    let isOverdue = false;

    if (veteranStatus === 'Application')
    {
        amountOwed = MEMBERSHIP_FEE;
        isOverdue = true; // Applications are considered "overdue" for the initial membership fee
    } else if (veteranStatus === 'Member')
    {
        if (lastPaymentDate)
        {
            nextDueDate = new Date(lastPaymentDate);
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            nextDueDate.setHours(0, 0, 0, 0); // Normalize

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
            // Member with no payment transactions yet (e.g., status manually set or first payment pending)
            amountOwed = MEMBERSHIP_FEE;
            isOverdue = true;
            if (veteranCreatedDate)
            {
                // Calculate a theoretical first due date based on creation if no payments exist
                let theoreticalFirstDueDate = new Date(veteranCreatedDate);
                theoreticalFirstDueDate.setFullYear(theoreticalFirstDueDate.getFullYear() + 1);
                theoreticalFirstDueDate.setHours(0, 0, 0, 0);
                nextDueDate = theoreticalFirstDueDate; // This would be their next due date
                // but they are already overdue for the *initial* fee.
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

// --- Shared Auth Functions ---

/**
 * Handles the logout process.
 * Assumes 'pb' (PocketBase instance) is globally available and initialized.
 * Uses showLoading, hideLoading, showMessage from this shared file.
 */
async function handleLogout()
{
    if (!pb)
    {
        console.error("PocketBase instance (pb) is not available for handleLogout.");
        showMessage("Logout Error", "System error during logout. PocketBase not initialized.");
        return;
    }
    showLoading();
    try
    {
        pb.authStore.clear();
        window.location.href = '/'; // Redirect to homepage or login page
    } catch (error)
    {
        console.error("Logout failed:", error);
        showMessage("Logout Error", "An error occurred during logout. Please try again.");
    } finally
    {
        hideLoading();
    }
}

// --- PocketBase Instance ---
// IMPORTANT: The 'pb' variable itself (PocketBase instance) should be declared and initialized
// in your main application scripts (e.g., profile_app.js, admin_app.js) like:
// let pb = null;
// document.addEventListener('DOMContentLoaded', () => {
//   pb = new PocketBase(POCKETBASE_URL); // POCKETBASE_URL from this shared file
//   // ... rest of your app initialization
// });
// The shared functions above will then use this globally available 'pb' instance.
