// --- Configuration ---
const POCKETBASE_URL = 'https://veterans.fly.dev/'; // Ensure your PocketBase is running here
const VETERANS_COLLECTION = 'veterans'; // Auth collection for veterans
const MANAGERS_COLLECTION = 'managers'; // Auth collection for managers

// --- UI Elements ---
// These declarations are crucial for the functions below to work.
// Ensure these match your HTML element IDs exactly.
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
const googleRegisterConfirmModal = document.getElementById('google-register-confirm-modal');
const googleEmailDisplaySpan = document.getElementById('google-email-display');
const googleRoleDisplaySpan = document.getElementById('google-role-display');
const confirmGoogleRegisterBtn = document.getElementById('confirm-google-register-btn');
const cancelGoogleRegisterBtn = document.getElementById('cancel-google-register-btn');

// Veteran Details Modal Elements (required for handleSubmitVeteranDetails)
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

// --- Global Variables ---
let pb = null;
let emailForOtpProcess = null;
let otpRequestContext = { email: null, collection: null, otpId: null, role: null };
let tempVeteranDetails = {};
let isGoogleNewUserVeteranFlow = false;
let googleNewUserId = null;
let pendingGoogleAuthData = null;
let pendingGoogleAuthTarget = null;
let pendingOtpVerificationUserId = null;     // For tracking user created before OTP verification
let pendingOtpVerificationCollection = null; // Collection of the pending OTP user

// --- Utility Functions ---
// ... (all utility functions like showLoading, showMessage, generateRandomPassword, etc., remain the same) ...
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

async function cancelOtpFlow() // Made async to handle potential account deletion
{
    let messageAlreadyShown = false;
    let operationsToPerform = [];

    // Check for pending OTP user
    if (pendingOtpVerificationUserId && pendingOtpVerificationCollection)
    {
        operationsToPerform.push({ type: 'otp', userId: pendingOtpVerificationUserId, collection: pendingOtpVerificationCollection });
        pendingOtpVerificationUserId = null; // Consume immediately
        pendingOtpVerificationCollection = null; // Consume immediately
    }

    // Check for pending Google stub
    if (pendingGoogleAuthData && pendingGoogleAuthTarget)
    {
        operationsToPerform.push({ type: 'google', authData: pendingGoogleAuthData, authTarget: pendingGoogleAuthTarget });
        pendingGoogleAuthData = null; // Consume immediately
        pendingGoogleAuthTarget = null; // Consume immediately
    }

    if (operationsToPerform.length > 0)
    {
        showLoading();
        try
        {
            for (const op of operationsToPerform)
            {
                if (op.type === 'otp')
                {
                    console.log(`OTP flow cancelled. Attempting to delete newly created (unverified) user ${op.userId} from ${op.collection}.`);
                    try
                    {
                        await pb.collection(op.collection).delete(op.userId);
                        console.log(`Successfully deleted user ${op.userId} due to OTP flow cancellation.`);
                        if (!messageAlreadyShown)
                        {
                            showMessage("Registration Cancelled", "Your OTP registration was cancelled and the partially created account has been deleted.");
                            messageAlreadyShown = true;
                        }
                    } catch (deleteError)
                    {
                        console.error(`Failed to delete user ${op.userId} after OTP flow cancellation:`, deleteError);
                        if (!messageAlreadyShown)
                        {
                            showMessage("Cancellation Incomplete", `Your OTP registration was cancelled, but there was an issue cleaning up. ${getPocketBaseErrorDetails(deleteError)}`);
                            messageAlreadyShown = true;
                        }
                    }
                } else if (op.type === 'google')
                {
                    const stubUserIdToDelete = op.authData.record.id;
                    const collectionToDeleteFrom = op.authTarget.collection;
                    console.log(`Generic cancel: Google OAuth stub detected. Attempting to delete stub user ${stubUserIdToDelete} from ${collectionToDeleteFrom}.`);
                    try
                    {
                        await pb.collection(collectionToDeleteFrom).delete(stubUserIdToDelete);
                        console.log(`Successfully deleted Google OAuth stub user ${stubUserIdToDelete} during general cancellation.`);
                        pb.authStore.clear(); // Log out from the stub session

                        if (!messageAlreadyShown)
                        {
                            showMessage("Process Cancelled", "The Google Sign-In process was cancelled and the temporary account has been deleted.");
                            messageAlreadyShown = true;
                        } else
                        {
                            console.log("Additionally, a pending Google-linked account was cleaned up.");
                        }
                    } catch (deleteError)
                    {
                        console.error(`Failed to delete Google OAuth stub user ${stubUserIdToDelete} during general cancellation:`, deleteError);
                        if (!messageAlreadyShown)
                        {
                            showMessage("Cancellation Incomplete", `The process was cancelled, but there was an issue cleaning up a temporary Google-linked account. ${getPocketBaseErrorDetails(deleteError)}`);
                            messageAlreadyShown = true;
                        } else
                        {
                            console.error("Also failed to cleanup Google stub during other cancellation.");
                        }
                    }
                }
            }
        } finally
        {
            hideLoading();
        }
    }

    // Hide all modals
    hideOtpModal();
    hideVeteranDetailsModal();
    hideRegisterConfirmModal();
    hideGoogleRegisterConfirmModal();

    // Reset all general flow-specific states
    otpRequestContext = { email: null, collection: null, otpId: null, role: null };
    tempVeteranDetails = {};
    isGoogleNewUserVeteranFlow = false;
    googleNewUserId = null;

    // These should have been consumed and nulled if processed. This is a final safety net.
    pendingOtpVerificationUserId = null;
    pendingOtpVerificationCollection = null;
    pendingGoogleAuthData = null;
    pendingGoogleAuthTarget = null;
}

function showGoogleRegisterConfirmModal(email, roleText, authData, authTarget)
{
    pendingGoogleAuthData = authData;
    pendingGoogleAuthTarget = authTarget;
    googleEmailDisplaySpan.textContent = email;
    googleRoleDisplaySpan.textContent = roleText;
    googleRegisterConfirmModal.classList.remove('hidden');
    hideLoading();
}
function hideGoogleRegisterConfirmModal()
{
    googleRegisterConfirmModal.classList.add('hidden');
}

function showRegisterConfirmModal(email)
{
    emailForOtpProcess = email;
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
    {
        details = JSON.stringify(error.data.data);
    }
    return details;
}

// --- PocketBase Initialization ---
// ... (initPocketBase remains the same) ...
async function initPocketBase()
{
    try
    {
        pb = new PocketBase(POCKETBASE_URL);
        pb.autoCancellation(false);
        document.getElementById('pb-url-display').textContent = POCKETBASE_URL;

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
                pb.authStore.clear();
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
// ... (handleSendOtpOrRegister, handleSubmitVeteranDetails, proceedWithFinalRegistrationAndOtp, handleVerifyOtp, redirectToDashboard remain the same) ...
async function handleSendOtpOrRegister()
{
    const email = emailInput.value.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
    {
        showMessage("Input Error", "Please enter a valid email address.");
        return;
    }
    showLoading();
    emailForOtpProcess = email;
    const authTarget = getAuthTarget();
    const tempPassword = generateRandomPassword();
    let tempUserCreatedId = null;

    try
    {
        console.log(`Attempting to create temporary user in '${authTarget.collection}' for: ${emailForOtpProcess}`);
        const tempUserData = {
            "email": emailForOtpProcess,
            "emailVisibility": true,
            "full_name": "test", // Required by schema, but temporary
            // ... other required fields with dummy data for temporary check
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
        const newTempUser = await pb.collection(authTarget.collection).create(tempUserData);
        tempUserCreatedId = newTempUser.id;
        console.log(`Temporary user ${tempUserCreatedId} created in '${authTarget.collection}'. Email is NEW for this collection.`);
        await pb.collection(authTarget.collection).delete(tempUserCreatedId);
        console.log(`Temporary user ${tempUserCreatedId} deleted.`);
        tempUserCreatedId = null;
        showRegisterConfirmModal(emailForOtpProcess);
    } catch (error)
    {
        if (error.status == 400) 
        {
            console.log(`User ${emailForOtpProcess} already exists in '${authTarget.collection}'. Sending OTP for login.`);
            try
            {
                const result = await pb.collection(authTarget.collection).requestOTP(emailForOtpProcess);
                if (result && result.otpId)
                {
                    otpRequestContext = {
                        email: emailForOtpProcess,
                        collection: authTarget.collection,
                        otpId: result.otpId,
                        role: authTarget.role
                    };
                    showOtpModal(emailForOtpProcess, false);
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
            console.error(`Error during temp user check for ${emailForOtpProcess} in ${authTarget.collection}:`, error);
            showMessage("System Error", `An unexpected error occurred while checking email with ${authTarget.collection}. ${getPocketBaseErrorDetails(error)}`);
        }
    } finally
    {
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
    showLoading();
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
        hideLoading(); // Hide loading if validation fails early
        return;
    }

    tempVeteranDetails = details;
    hideVeteranDetailsModal();

    if (isGoogleNewUserVeteranFlow)
    {
        if (!googleNewUserId)
        {
            console.error("Google flow error: googleNewUserId is not set for veteran details submission.");
            showMessage("Error", "A problem occurred with Google Sign-In. Your details could not be saved. Please try again.");
            hideLoading(); // Ensure loading is hidden
            cancelOtpFlow();
            return;
        }
        try
        {
            console.log(`Updating (post-Google new flow) veteran record ${googleNewUserId} with details from form.`);
            // IMPORTANT: The user is LIKELY NOT AUTHENTICATED at this point if googleNewUserId
            // refers to a record created after deleting the OAuth stub.
            // This update will likely fail unless PocketBase rules allow unauthenticated updates
            // or an admin token is used.
            // WITH THE NEW FLOW: The user IS authenticated as the Google-created stub, so this update will target the correct record.
            console.log(`Updating Google new user veteran record ${googleNewUserId} with details:`, tempVeteranDetails);
            const updatePayload = { ...tempVeteranDetails };
            // Ensure status is 'Application' if not already set by form/defaults
            if (!updatePayload.status)
            {
                updatePayload.status = 'Application';
            }

            const updatedRecord = await pb.collection(VETERANS_COLLECTION).update(googleNewUserId, updatePayload);
            console.log("Veteran details updated successfully for the Google new user account:", updatedRecord);

            // Manually update authStore if possible, though the session might be tricky.
            // This assumes the 'updatedRecord' is what the authStore should reflect.
            // However, pb.authStore.model might be null if pb.authStore.clear() was called and no new login happened.
            if (pb.authStore.isValid && pb.authStore.model && pb.authStore.model.id === googleNewUserId)
            {
                Object.assign(pb.authStore.model, updatedRecord);
            }

            // Clear pending Google auth data before calling cancelOtpFlow on success for this flow,
            // so it doesn't try to delete the now-completed and updated Google user record.
            // cancelOtpFlow will still reset other relevant flags like isGoogleNewUserVeteranFlow.
            pendingGoogleAuthData = null;
            pendingGoogleAuthTarget = null;

            hideLoading(); // Hide loading before message/redirect
            showMessage("Profile Updated", "Your profile details have been saved. You are now logged in.");
            redirectToDashboard('veteran', VETERANS_COLLECTION);
            await cancelOtpFlow(); // Clean up Google flow state after success
        } catch (error)
        {
            console.error("Error updating veteran details after Google Sign-In flow:", error);
            hideLoading();
            showMessage("Update Error", `Failed to save your profile details. ${getPocketBaseErrorDetails(error)} You may need to log in and complete your profile later.`);
            cancelOtpFlow(); // Clean up Google flow state on error
        } finally
        {
            // hideLoading() is handled in try/catch.
            // cancelOtpFlow() handles resetting Google flow flags.
        }
    } else
    {
        await proceedWithFinalRegistrationAndOtp();
    }
}

async function proceedWithFinalRegistrationAndOtp()
{
    const authTarget = getAuthTarget();

    if (!emailForOtpProcess)
    {
        showMessage("Error", "Email missing for registration. Please restart the process.");
        await cancelOtpFlow(); // Await if it's async
        hideLoading();
        return;
    }

    if (authTarget.collection === VETERANS_COLLECTION && Object.keys(tempVeteranDetails).length === 0)
    {
        showMessage("Error", "Veteran profile details are missing. Please complete the profile form.");
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
            verified: false
        };

        if (authTarget.collection === VETERANS_COLLECTION)
        {
            userData.status = 'Application';
            Object.assign(userData, tempVeteranDetails);
        } else if (authTarget.collection === MANAGERS_COLLECTION)
        {
            // Add default manager fields if needed and they exist in your schema
            // For example: userData.full_name = emailForOtpProcess.split('@')[0]; // if schema requires name for manager
        }

        const newUser = await pb.collection(authTarget.collection).create(userData);
        console.log("FINAL User created:", newUser);

        pendingOtpVerificationUserId = newUser.id; // Track user created before OTP
        pendingOtpVerificationCollection = authTarget.collection; // Track their collection

        const result = await pb.collection(authTarget.collection).requestOTP(emailForOtpProcess);
        if (result && result.otpId)
        {
            otpRequestContext = {
                email: emailForOtpProcess,
                collection: authTarget.collection,
                otpId: result.otpId,
                role: authTarget.role
            };
            showOtpModal(emailForOtpProcess, true);
        } else
        {
            console.error("OTP request after FINAL registration did not return an otpId:", result);
            showMessage("Account Created", "Your account has been created, but sending the verification code failed. Please try logging in again, or contact support if the issue persists.");
        }
    } catch (error)
    {
        console.error("Error during FINAL registration:", error);
        // If user creation failed, pendingOtpVerificationUserId would not have been set.
        // If user creation succeeded but OTP request failed, pendingOtpVerificationUserId IS set.
        // If the user then cancels (e.g. closes OTP modal), cancelOtpFlow will attempt deletion.
        // This is the desired behavior.
        showMessage("Registration Error", `Failed to register account. ${getPocketBaseErrorDetails(error)}`);
    } finally
    {
        hideLoading();
        tempVeteranDetails = {};
    }
}

async function handleVerifyOtp() // Made async
{
    const code = otpCodeInput.value.trim();
    if (!otpRequestContext.otpId || !otpRequestContext.email || !otpRequestContext.collection)
    {
        showMessage("Error", "OTP session invalid or expired. Please try the login process again.");
        await cancelOtpFlow(); return;
    }
    if (!code || !/^\d{6}$/.test(code))
    {
        showMessage("Input Error", "Please enter a valid 6-digit OTP."); return;
    }

    showLoading();
    const { collection: targetCollection, otpId: currentOtpId, role: originalRole, email: currentEmail } = otpRequestContext;

    try
    {
        const authData = await pb.collection(targetCollection).authWithOTP(currentOtpId, code, {});
        console.log(`Logged in successfully via OTP to ${targetCollection}:`, authData);

        // User successfully verified, so clear pending OTP verification ID to prevent deletion
        pendingOtpVerificationUserId = null;
        pendingOtpVerificationCollection = null;

        if (authData.record && !authData.record.verified)
        {
            try
            {
                await pb.collection(targetCollection).update(authData.record.id, { verified: true });
                console.log("User marked as verified.");
                if (pb.authStore.model) pb.authStore.model.verified = true;
            } catch (verificationError)
            {
                console.warn("Could not mark user as verified:", verificationError);
            }
        }
        hideOtpModal();
        redirectToDashboard(originalRole, targetCollection);
        await cancelOtpFlow(); // Call the async version
    } catch (error)
    {
        console.error("Error verifying OTP:", error);
        showMessage("Login Failed", `Invalid OTP or login error. ${getPocketBaseErrorDetails(error)}`);
        otpCodeInput.value = '';
        // If OTP verification fails, pendingOtpVerificationUserId (if set from a new registration)
        // will remain. If the user then closes the modal (triggering cancelOtpFlow),
        // the unverified account will be deleted. This is correct.
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
    // Ensure authStore is valid before redirecting to protected pages
    if (!pb || !pb.authStore.isValid || !pb.authStore.model)
    {
        console.warn("Redirecting to dashboard, but user is not formally logged in or authStore is invalid. This might lead to issues on the target page.");
        // Optionally, show a message or redirect to login page if auth is strictly required.
        // For now, we proceed with the redirect as per original logic.
    }
    console.log(`Redirecting: role=${role}, collection=${collectionName}`);

    if (collectionName === MANAGERS_COLLECTION && role === 'admin')
    {
        window.location.href = 'admin.html';
    } else if (collectionName === VETERANS_COLLECTION && role === 'veteran')
    {
        window.location.href = 'profile.html';
    }
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
    const authTarget = getAuthTarget();

    if (!emailForOtpProcess)
    {
        showMessage("Error", "Email was lost. Please restart the registration.");
        // cancelOtpFlow() will be called if this function returns and user closes a modal
        // or it can be called explicitly if needed, but usually UI flow handles it.
        return;
    }

    if (authTarget.isManager) // Managers skip the details form
    {
        tempVeteranDetails = {}; // Ensure no veteran details for manager
        proceedWithFinalRegistrationAndOtp();
    } else
    {
        showVeteranDetailsModal();
    }
});

googleLoginBtn.addEventListener('click', async () =>
{
    showLoading();
    const authTarget = getAuthTarget();
    isGoogleNewUserVeteranFlow = false;
    googleNewUserId = null;
    let authDataForProcessing = null;

    try
    {
        authDataForProcessing = await pb.collection(authTarget.collection).authWithOAuth2({ provider: 'google' });
        console.log('Google Auth Successful. AuthData:', authDataForProcessing);
        emailForOtpProcess = authDataForProcessing.record.email;

        if (authDataForProcessing.meta?.isNew)
        {
            console.log('New user detected via Google Sign-In. PocketBase created stub ID:', authDataForProcessing.record.id);
            // Store original auth data which includes the stub and OAuth meta
            pendingGoogleAuthData = authDataForProcessing;
            pendingGoogleAuthTarget = authTarget;
            showGoogleRegisterConfirmModal(authDataForProcessing.record.email, authTarget.role, authDataForProcessing, authTarget);
            // Flow continues via the google-register-confirm-modal buttons
            // hideLoading() is called within showGoogleRegisterConfirmModal
            return;
        } else
        {
            console.log('Existing user logged in via Google.');
            if (authDataForProcessing.record && !authDataForProcessing.record.verified)
            {
                try
                {
                    await pb.collection(authTarget.collection).update(authDataForProcessing.record.id, { verified: true });
                    console.log("Existing user marked as verified.");
                    if (pb.authStore.model) pb.authStore.model.verified = true;
                } catch (verificationError)
                {
                    console.warn("Could not mark existing user as verified:", verificationError);
                }
            }
            hideLoading();
            redirectToDashboard(authTarget.role, authTarget.collection);
        }
    } catch (error)
    {
        console.error("Google Sign-In Error:", error);
        if (error.isAbort || (error.originalError && error.originalError.isAbort) || (error.message && error.message.toLowerCase().includes("user cancelled the oauth2 authentication")))
        {
            showMessage("Google Sign-In", "Google Sign-In was cancelled by the user.");
        } else
        {
            showMessage("Google Sign-In Error", `Failed to sign in with Google. ${getPocketBaseErrorDetails(error)} Please ensure pop-ups are allowed and try again.`);
        }
        hideLoading();
    }
});

// MODIFIED confirmGoogleRegisterBtn listener
confirmGoogleRegisterBtn.addEventListener('click', async () =>
{
    if (!pendingGoogleAuthData || !pendingGoogleAuthTarget)
    {
        console.error("confirmGoogleRegisterBtn: Missing pendingGoogleAuthData or pendingGoogleAuthTarget.");
        showMessage("Error", "Session data lost. Please try Google Sign-In again.");
        hideGoogleRegisterConfirmModal(); // Hide modal even on error
        await cancelOtpFlow(); // Reset states
        return;
    }
    showLoading();

    const originalAuthData = pendingGoogleAuthData; // Data from authWithOAuth2 (includes original stub ID and email)
    const authTarget = pendingGoogleAuthTarget;
    const originalStubId = originalAuthData.record.id; // ID of the stub PocketBase created
    const userEmail = originalAuthData.record.email; // Email from the Google-created stub
    const googleProvidedName = originalAuthData.record.name || userEmail.split('@')[0]; // Use name from Google or derive from email

    hideGoogleRegisterConfirmModal();

    try
    {
        // 1. Delete the stub user PocketBase created via OAuth2.
        // OLD LOGIC: Delete and recreate.
        // NEW LOGIC: Use the existing stub. The user is already authenticated as this stub.
        console.log(`Continuing with Google new user flow. User ID: ${originalStubId}, Email: ${userEmail}`);

        // Ensure the user is marked as verified (PocketBase usually does this for OAuth new users)
        if (originalAuthData.record && !originalAuthData.record.verified)
        {
            try
            {
                await pb.collection(authTarget.collection).update(originalStubId, { verified: true });
                console.log(`Google user ${originalStubId} marked as verified.`);
                if (pb.authStore.model && pb.authStore.model.id === originalStubId)
                {
                    pb.authStore.model.verified = true;
                }
            } catch (verificationError)
            {
                console.warn(`Could not mark Google user ${originalStubId} as verified:`, verificationError);
            }
        }

        if (authTarget.collection === VETERANS_COLLECTION)
        {
            isGoogleNewUserVeteranFlow = true;
            googleNewUserId = originalStubId; // This is the ID of the Google-created stub we are keeping.

            if (detailFullNameInput)
            { // Pre-fill name if element exists
                detailFullNameInput.value = googleProvidedName;
            }

            // Optionally, perform an initial update on the stub if fields like 'status' need to be set.
            const initialVeteranData = {};
            let initialUpdateNeeded = false;
            if (originalAuthData.record.status !== 'Application')
            {
                initialVeteranData.status = 'Application';
                initialUpdateNeeded = true;
            }
            // Pre-fill full_name from Google if schema expects it and it's not there
            if (googleProvidedName && (!originalAuthData.record.full_name || originalAuthData.record.full_name !== googleProvidedName))
            {
                initialVeteranData.full_name = googleProvidedName;
                initialUpdateNeeded = true;
            }

            if (initialUpdateNeeded)
            {
                try
                {
                    console.log(`Applying initial update to Google veteran stub ${googleNewUserId}:`, initialVeteranData);
                    const updatedStub = await pb.collection(VETERANS_COLLECTION).update(googleNewUserId, initialVeteranData);
                    if (pb.authStore.model && pb.authStore.model.id === googleNewUserId)
                    {
                        Object.assign(pb.authStore.model, updatedStub); // Keep authStore synced
                    }
                } catch (initialUpdateError)
                {
                    console.error("Error during initial update of veteran stub:", initialUpdateError);
                }
            }

            hideLoading(); // Hide loading before showing next modal/message
            showMessage("Account Linked", `Your Google account for ${userEmail} is linked. Please complete your profile details.`);
            showVeteranDetailsModal(); // Proceed to collect more details for the veteran
        } else if (authTarget.collection === MANAGERS_COLLECTION)
        {
            // For managers, the Google-provided info might be enough. Account is created and linked.
            // Ensure full_name is set from Google if schema requires it.
            if (googleProvidedName && (!originalAuthData.record.full_name || originalAuthData.record.full_name !== googleProvidedName))
            {
                try
                {
                    await pb.collection(authTarget.collection).update(originalStubId, { full_name: googleProvidedName });
                    if (pb.authStore.model && pb.authStore.model.id === originalStubId) pb.authStore.model.full_name = googleProvidedName;
                } catch (nameUpdateError)
                {
                    console.warn("Could not update manager's full_name from Google:", nameUpdateError);
                }
            }
            hideLoading();
            showMessage("Manager Account Linked", `Manager account for ${userEmail} has been successfully linked with Google.`);
            redirectToDashboard(authTarget.role, authTarget.collection);
            await cancelOtpFlow(); // Clean up states as flow is complete
        }
    } catch (error)
    {
        console.error("Error processing Google registration confirmation (delete-and-create flow):", error);
        showMessage("Error", `Could not complete Google registration. ${getPocketBaseErrorDetails(error)} The original Google sign-in may need to be attempted again.`);
        pb.authStore.clear();
        await cancelOtpFlow();
    } finally
    {
        // For veteran flow, pending data is cleared after veteran details modal.
        // For manager flow or error, cancelOtpFlow (which clears them) is called.
        // To be safe, ensure they are cleared if not already handled by a specific path.
        if (authTarget.collection !== VETERANS_COLLECTION || (authTarget.collection === VETERANS_COLLECTION && !isGoogleNewUserVeteranFlow))
        {
            pendingGoogleAuthData = null; pendingGoogleAuthTarget = null;
        }
    }
});


// MODIFIED cancelGoogleRegisterBtn listener
cancelGoogleRegisterBtn.addEventListener('click', async () =>
{
    if (!pendingGoogleAuthData || !pendingGoogleAuthTarget)
    {
        hideGoogleRegisterConfirmModal();
        await cancelOtpFlow(); // Use await for async version
        return;
    }
    showLoading();

    const stubAuthData = pendingGoogleAuthData;
    const stubAuthTarget = pendingGoogleAuthTarget;

    hideGoogleRegisterConfirmModal();

    try
    {
        const stubUserIdToDelete = stubAuthData.record.id;
        console.log(`User cancelled Google registration. Deleting stub user ${stubUserIdToDelete} from ${stubAuthTarget.collection}.`);
        await pb.collection(stubAuthTarget.collection).delete(stubUserIdToDelete);
        console.log(`Stub user ${stubUserIdToDelete} deleted successfully.`);
        showMessage("Registration Cancelled", "Your account creation with Google has been cancelled and the temporary account has been deleted.");
        // Crucially, clear these so cancelOtpFlow (called in finally) doesn't re-process a Google delete.
        // cancelOtpFlow will still handle general state reset and modal hiding.
        pendingGoogleAuthData = null;
        pendingGoogleAuthTarget = null;
    } catch (deleteError)
    {
        console.error(`Failed to delete stub user ${stubAuthData.record.id}:`, deleteError);
        showMessage("Cancellation Error", `Could not fully cancel the registration. ${getPocketBaseErrorDetails(deleteError)}`);
    } finally
    {
        pb.authStore.clear(); // Log out from any session associated with the (now hopefully deleted) stub.
        await cancelOtpFlow(); // Reset all flow-specific states
        hideLoading();
    }
});


document.addEventListener('DOMContentLoaded', () =>
{
    document.getElementById('current-year').textContent = new Date().getFullYear();
    initPocketBase();
});