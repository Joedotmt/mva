// --- Configuration ---
const POCKETBASE_URL = 'http://127.0.0.1:8090'; // Ensure your PocketBase is running here
const VETERANS_COLLECTION = 'veterans'; // Auth collection for veterans
const MANAGERS_COLLECTION = 'managers'; // Auth collection for managers

// --- UI Elements ---
const loadingIndicator = document.getElementById('loading-indicator');
const messageModal = document.getElementById('message-modal');
const messageModalTitle = document.getElementById('message-modal-title');
const messageModalText = document.getElementById('message-modal-text');
const otpModal = document.getElementById('otp-modal');
const otpModalMessageElement = document.getElementById('otp-modal-message');
const otpCodeInput = document.getElementById('otp-code');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const registerConfirmModal = document.getElementById('register-confirm-modal');
const registerEmailDisplaySpan = document.getElementById('register-email-display');
const confirmRegisterBtn = document.getElementById('confirm-register-btn');

// Veteran Details Modal Elements
const veteranDetailsModal = document.getElementById('veteran-details-modal');
const veteranDetailsForm = document.getElementById('veteran-details-form');
const detailFullNameInput = document.getElementById('detail-full_name');
const detailIdCardNumberInput = document.getElementById('detail-id_card_number');
const detailFullAddressInput = document.getElementById('detail-full_address');
const detailPhoneNumberInput = document.getElementById('detail-phone_number');
const detailNextOfKinFullNameInput = document.getElementById('detail-next_of_kin_full_name');
const detailNextOfKinFullPhoneNumberInput = document.getElementById('detail-next_of_kin_full_phone_number');
const detailNextOfKinRelationshipInput = document.getElementById('detail-next_of_kin_relationship');

const emailInput = document.getElementById('email-input');
const sendOtpRegisterBtn = document.getElementById('send-otp-register-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const isManagerCheckbox = document.getElementById('is-manager-checkbox');

let pb = null;
let emailForOtpProcess = null; // Stores the email being processed
let otpRequestContext = { email: null, collection: null, otpId: null, role: null }; // Context for active OTP
let tempVeteranDetails = {}; // To store details from the new veteran form

// --- Utility Functions ---
function showLoading() { loadingIndicator.classList.remove('hidden'); loadingIndicator.classList.add('flex'); }
function hideLoading() { loadingIndicator.classList.add('hidden'); loadingIndicator.classList.remove('flex'); }

function showMessage(title, text)
{
    messageModalTitle.textContent = title;
    messageModalText.textContent = text;
    messageModal.classList.remove('hidden');
}
function hideMessageModal() { messageModal.classList.add('hidden'); }

function showOtpModal(email, isNewRegistration = false)
{
    document.getElementById('otp-email-display').textContent = email;
    if (isNewRegistration)
    {
        otpModalMessageElement.innerHTML = `Your account for <span class="font-semibold text-gray-700">${email}</span> has been created! A code has been sent to your email. Please enter it below.`;
    } else
    {
        otpModalMessageElement.innerHTML = `A code has been sent to <span class="font-semibold text-gray-700">${email}</span>. Please enter it below.`;
    }
    otpCodeInput.value = '';
    otpModal.classList.remove('hidden');
    otpCodeInput.focus();
}
function hideOtpModal() { otpModal.classList.add('hidden'); }

function cancelOtpFlow()
{
    hideOtpModal();
    hideVeteranDetailsModal();
    hideRegisterConfirmModal();
    otpRequestContext = { email: null, collection: null, otpId: null, role: null };
    // emailForOtpProcess is kept if user wants to retry with same email but different role
    tempVeteranDetails = {};
    // Consider resetting emailInput.value if the flow is fully cancelled.
    // emailInput.value = '';
}

function showRegisterConfirmModal(email)
{
    emailForOtpProcess = email; // Set here, as this is the email we're confirming for
    registerEmailDisplaySpan.textContent = email;
    registerConfirmModal.classList.remove('hidden');
}
function hideRegisterConfirmModal() { registerConfirmModal.classList.add('hidden'); }

function showVeteranDetailsModal()
{
    hideRegisterConfirmModal();
    veteranDetailsForm.reset();
    veteranDetailsModal.classList.remove('hidden');
    detailFullNameInput.focus();
}
function hideVeteranDetailsModal() { veteranDetailsModal.classList.add('hidden'); }

function generateRandomPassword(length = 32)
{
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i)
    {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}

function getAuthTarget()
{
    const isManager = isManagerCheckbox.checked;
    return {
        collection: isManager ? MANAGERS_COLLECTION : VETERANS_COLLECTION,
        role: isManager ? 'admin' : 'veteran',
        isManager: isManager
    };
}

function getPocketBaseErrorDetails(error)
{
    let details = error.message || 'Unknown error';
    if (error.response && error.response.data)
    {
        const pbError = error.response.data;
        if (pbError.message) details = pbError.message;
        if (pbError.data)
        {
            let fieldErrors = [];
            for (const key in pbError.data)
            {
                fieldErrors.push(`${key}: ${pbError.data[key].message}`);
            }
            if (fieldErrors.length > 0)
            {
                details += ` (${fieldErrors.join(', ')})`;
            } else if (typeof pbError.data === 'string')
            {
                details += ` (${pbError.data})`;
            } else
            {
                details += ` (${JSON.stringify(pbError.data)})`;
            }
        }
    } else if (error.data && error.data.data)
    { // Fallback for other structures
        details = JSON.stringify(error.data.data);
    }
    return details;
}


// --- PocketBase Initialization ---
async function initPocketBase()
{
    try
    {
        pb = new PocketBase(POCKETBASE_URL);
        pb.autoCancellation(false); // Recommended for simpler flows
        document.getElementById('pb-url-display').textContent = POCKETBASE_URL;

        // Check if user is already logged in
        if (pb.authStore.isValid && pb.authStore.model)
        {
            console.log("User already logged in. Model:", pb.authStore.model);
            const collectionName = pb.authStore.model.collectionName;
            let userRoleForRedirect;
            if (collectionName === MANAGERS_COLLECTION)
            {
                userRoleForRedirect = 'admin';
            } else if (collectionName === VETERANS_COLLECTION)
            {
                userRoleForRedirect = 'veteran';
            } else
            {
                console.error("Unknown collection for already logged-in user:", collectionName);
                pb.authStore.clear(); // Log out user with unknown state
                return;
            }
            redirectToDashboard(userRoleForRedirect, collectionName);
        }
    } catch (error)
    {
        console.error("Failed to initialize PocketBase:", error);
        document.getElementById('pb-url-display').textContent = 'Connection Failed!';
        showMessage("Connection Error", `Could not connect to the backend. ${getPocketBaseErrorDetails(error)}`);
    }
}

// --- Core Authentication Logic ---
async function handleSendOtpOrRegister()
{
    const email = emailInput.value.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
    {
        showMessage("Input Error", "Please enter a valid email address.");
        return;
    }
    showLoading();
    emailForOtpProcess = email; // Store email for the current OTP/registration process
    const authTarget = getAuthTarget();
    const tempPassword = generateRandomPassword();
    let tempUserCreatedId = null;

    try
    {
        // Attempt to create a temporary user to check if the email is new for the selected collection.
        // This is a common pattern to distinguish between login and registration flows.
        console.log(`Attempting to create temporary user in '${authTarget.collection}' for: ${emailForOtpProcess}`);
        const tempUserData = {
            "email": emailForOtpProcess,
            "emailVisibility": true,
            "full_name": "test",
            "full_address": "test",
            "id_card_number": "test",
            "phone_number": "test",
            "next_of_kin_full_name": "test",
            "next_of_kin_full_phone_number": "test",
            "next_of_kin_relationship": "test",
            "status": "Application",
            "admin_note": "test",
            "password": tempPassword,
            "passwordConfirm": tempPassword
        };

        console.log(tempUserData);
        const newTempUser = await pb.collection(authTarget.collection).create(tempUserData);
        tempUserCreatedId = newTempUser.id;
        console.log(`Temporary user ${tempUserCreatedId} created in '${authTarget.collection}'. Email is NEW for this collection.`);

        // IMPORTANT: Delete the temporary user immediately.
        await pb.collection(authTarget.collection).delete(tempUserCreatedId);
        console.log(`Temporary user ${tempUserCreatedId} deleted.`);
        tempUserCreatedId = null; // Nullify to prevent accidental re-deletion in finally block

        // Email is new for this collection. Show confirmation to create an account.
        showRegisterConfirmModal(emailForOtpProcess);

    } catch (error)
    {
        // Check if the error is due to the email already existing (validation_not_unique)
        if (error.status == 400)
        {
            console.log(`User ${emailForOtpProcess} already exists in '${authTarget.collection}'. Sending OTP for login.`);
            try
            {
                // Email exists, so request OTP for login.
                const result = await pb.collection(authTarget.collection).requestOTP(emailForOtpProcess);
                if (result && result.otpId)
                {
                    otpRequestContext = {
                        email: emailForOtpProcess,
                        collection: authTarget.collection,
                        otpId: result.otpId,
                        role: authTarget.role
                    };
                    showOtpModal(emailForOtpProcess, false); // false: this is for login, not new registration message
                } else
                {
                    throw new Error("OTP request did not return an otpId.");
                }
            } catch (otpError)
            {
                console.error(`Error sending OTP for existing user ${emailForOtpProcess}:`, otpError);
                showMessage("OTP Error", `Failed to send OTP for ${authTarget.role}. ${getPocketBaseErrorDetails(otpError)}`);
            }
        } else
        {
            // Other errors during the temporary user check (e.g., connection issue, schema mismatch for temp user)
            console.error(`Error during temp user check for ${emailForOtpProcess} in ${authTarget.collection}:`, error);
            showMessage("System Error", `An unexpected error occurred while checking email with ${authTarget.collection}. ${getPocketBaseErrorDetails(error)}`);
        }
    } finally
    {
        // Safeguard: if deletion of temp user failed for some reason and tempUserCreatedId is still set
        if (tempUserCreatedId)
        {
            try
            {
                await pb.collection(authTarget.collection).delete(tempUserCreatedId);
                console.log(`Final cleanup of temp user ${tempUserCreatedId} successful.`);
            } catch (e)
            {
                console.error("Final cleanup of temp user failed", e);
            }
        }
        hideLoading();
    }
}

veteranDetailsForm.addEventListener('submit', async function (event)
{
    event.preventDefault();
    await handleSubmitVeteranDetails();
});

async function handleSubmitVeteranDetails()
{
    let isValid = true;
    const details = {
        full_name: detailFullNameInput.value.trim(),
        id_card_number: detailIdCardNumberInput.value.trim(),
        full_address: detailFullAddressInput.value.trim(),
        phone_number: detailPhoneNumberInput.value.trim(),
        next_of_kin_full_name: detailNextOfKinFullNameInput.value.trim(),
        next_of_kin_full_phone_number: detailNextOfKinFullPhoneNumberInput.value.trim(),
        next_of_kin_relationship: detailNextOfKinRelationshipInput.value.trim(),
    };

    for (const key in details)
    {
        const inputElement = document.getElementById(`detail-${key}`);
        if (!details[key])
        {
            isValid = false;
            if (inputElement) inputElement.classList.add('input-error');
        } else
        {
            if (inputElement) inputElement.classList.remove('input-error');
        }
    }

    if (!isValid)
    {
        showMessage("Validation Error", "Please fill in all required fields in your profile.");
        return;
    }

    tempVeteranDetails = details;
    hideVeteranDetailsModal();
    // emailForOtpProcess should be set from the initial email input and confirmed
    await proceedWithFinalRegistrationAndOtp();
}

async function proceedWithFinalRegistrationAndOtp()
{
    const authTarget = getAuthTarget(); // Get current auth target (veteran or manager)

    if (!emailForOtpProcess)
    {
        showMessage("Error", "Email missing for registration. Please restart the process.");
        cancelOtpFlow(); // Resets state
        hideLoading();
        return;
    }

    // If it's a veteran registration, details from the form are required.
    // Managers skip the details form, so tempVeteranDetails will (and should) be empty for them.
    if (authTarget.collection === VETERANS_COLLECTION && Object.keys(tempVeteranDetails).length === 0)
    {
        showMessage("Error", "Veteran profile details are missing. Please complete the profile form.");
        // Optionally, guide the user to restart or re-show the details modal.
        // showVeteranDetailsModal(); // This might be too direct; user might need to restart.
        hideLoading();
        return;
    }

    showLoading();

    try
    {
        const randomPassword = generateRandomPassword();
        console.log(`Attempting to create FINAL user in '${authTarget.collection}': ${emailForOtpProcess}`);
        const userData = {
            email: emailForOtpProcess,
            password: randomPassword,
            passwordConfirm: randomPassword,
            emailVisibility: true,
            verified: false // Will be set to true after successful OTP verification
        };

        if (authTarget.collection === VETERANS_COLLECTION)
        {
            userData.status = 'Application'; // Veterans start with 'Application' status
            // tempVeteranDetails should be populated from handleSubmitVeteranDetails
            Object.assign(userData, tempVeteranDetails);
        } else if (authTarget.collection === MANAGERS_COLLECTION)
        {
            // Add any default fields specific to managers if needed
            // e.g., userData.manager_level = 'standard';
            // Ensure these fields exist in your PocketBase 'managers' collection schema.
        }

        const newUser = await pb.collection(authTarget.collection).create(userData);
        console.log("FINAL User created:", newUser);

        // User account is created. Now send OTP for them to verify and log in.
        const result = await pb.collection(authTarget.collection).requestOTP(emailForOtpProcess);
        if (result && result.otpId)
        {
            otpRequestContext = {
                email: emailForOtpProcess,
                collection: authTarget.collection,
                otpId: result.otpId,
                role: authTarget.role // This 'role' is for client-side logic (e.g. redirection)
            };
            showOtpModal(emailForOtpProcess, true); // true: for new registration message
        } else
        {
            console.error("OTP request after FINAL registration did not return an otpId:", result);
            // User is created, but OTP send failed. They can try to log in again, which would trigger OTP.
            showMessage("Account Created", "Your account has been created, but sending the verification code failed. Please try logging in again, or contact support if the issue persists.");
        }
    } catch (error)
    {
        console.error("Error during FINAL registration:", error);
        showMessage("Registration Error", `Failed to register account. ${getPocketBaseErrorDetails(error)}`);
    } finally
    {
        hideLoading();
        tempVeteranDetails = {}; // Clear stored veteran details after the attempt
    }
}

async function handleVerifyOtp()
{
    const code = otpCodeInput.value.trim();
    if (!otpRequestContext.otpId || !otpRequestContext.email || !otpRequestContext.collection)
    {
        showMessage("Error", "OTP session invalid or expired. Please try the login process again.");
        cancelOtpFlow(); return;
    }
    if (!code || !/^\d{6}$/.test(code))
    {
        showMessage("Input Error", "Please enter a valid 6-digit OTP."); return;
    }

    showLoading();
    const { collection: targetCollection, otpId: currentOtpId, role: originalRole, email: currentEmail } = otpRequestContext;

    try
    {
        // Authenticate with OTP
        const authData = await pb.collection(targetCollection).authWithOTP(currentOtpId, code, {
            // If your collection requires other fields to be part of the auth record
            // during authWithOTP, you might need to expand the body here.
            // Usually, otpId and code are enough.
        });
        console.log(`Logged in successfully via OTP to ${targetCollection}:`, authData);

        // Mark user as verified if they aren't already
        if (authData.record && !authData.record.verified)
        {
            try
            {
                await pb.collection(targetCollection).update(authData.record.id, { verified: true });
                console.log("User marked as verified.");
                if (pb.authStore.model) pb.authStore.model.verified = true; // Update local authStore
            } catch (verificationError)
            {
                console.warn("Could not mark user as verified:", verificationError);
                // Continue login even if verification update fails, but log it.
            }
        }
        hideOtpModal();
        redirectToDashboard(originalRole, targetCollection); // Use role from original context for redirection
        cancelOtpFlow(); // Clear OTP context and other states
    } catch (error)
    {
        console.error("Error verifying OTP:", error);
        showMessage("Login Failed", `Invalid OTP or login error. ${getPocketBaseErrorDetails(error)}`);
        otpCodeInput.value = ''; // Clear OTP input for retry
    } finally
    {
        hideLoading();
    }
}

function redirectToDashboard(role, collectionName)
{
    if (!role)
    {
        console.error("User role undefined during redirect.");
        showMessage("Login Error", "User role not found. Cannot redirect.");
        if (pb) pb.authStore.clear();
        return;
    }
    console.log(`Redirecting: role=${role}, collection=${collectionName}`);

    // More specific checks first
    if (collectionName === MANAGERS_COLLECTION && role === 'admin')
    {
        window.location.href = 'admin.html';
    } else if (collectionName === VETERANS_COLLECTION && role === 'veteran')
    {
        window.location.href = 'profile.html';
    }
    // Fallbacks based on role only (less ideal but can work if collectionName is ambiguous)
    else if (role === 'admin')
    {
        console.warn("Redirecting to admin.html based on role only, collection was:", collectionName);
        window.location.href = 'admin.html';
    } else if (role === 'veteran')
    {
        console.warn("Redirecting to profile.html based on role only, collection was:", collectionName);
        window.location.href = 'profile.html';
    }
    else
    {
        console.error("Unknown role/collection combination for redirect:", role, collectionName);
        showMessage("Login Error", "User role not recognized for redirection.");
        if (pb) pb.authStore.clear();
    }
}

// --- Event Listeners ---
sendOtpRegisterBtn.addEventListener('click', handleSendOtpOrRegister);
verifyOtpBtn.addEventListener('click', handleVerifyOtp);

confirmRegisterBtn.addEventListener('click', () =>
{
    hideRegisterConfirmModal();
    const authTarget = getAuthTarget(); // Get target *at the moment of confirmation*

    // emailForOtpProcess is already set by showRegisterConfirmModal -> handleSendOtpOrRegister
    if (!emailForOtpProcess)
    {
        showMessage("Error", "Email was lost. Please restart the registration.");
        cancelOtpFlow();
        return;
    }

    if (authTarget.isManager)
    {
        tempVeteranDetails = {}; // Ensure no veteran details are carried over for manager
        proceedWithFinalRegistrationAndOtp(); // Managers skip the details form
    } else
    {
        showVeteranDetailsModal();  // Veterans proceed to details form
    }
});

googleLoginBtn.addEventListener('click', () =>
{
    showMessage("Google Sign-In", "Google Sign-In is a mock feature for now and not implemented.");
});

document.addEventListener('DOMContentLoaded', () =>
{
    document.getElementById('current-year').textContent = new Date().getFullYear();
    initPocketBase();
});