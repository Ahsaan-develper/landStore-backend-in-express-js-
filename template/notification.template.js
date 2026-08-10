// utils/notificationTemplates.js

export const NotificationTemplates = {

    // ==========================
    // LISTING
    // ==========================

    listingSubmitted({ listingCode, state, district }) {
        return {
            title: "Listing Submitted",
            message: `Your listing "${district}, ${state}" (Code: ${listingCode}) has been submitted successfully and is awaiting review.`
        };
    },

    listingStatusChanged({
        listingCode,
        state,
        district,
        oldStatus,
        newStatus
    }) {
        return {
            title: "Action Needed",
            message: `Your listing ${district}, ${state} (Code: ${listingCode}) status changed from ${oldStatus} to ${newStatus}.`
        };
    },

    listingApproved({ listingCode, state, district }) {
        return {
            title: "Listing Approved",
            message: `Congratulations! Your listing "${district}, ${state}" (Code: ${listingCode}) has been approved and is now live.`
        };
    },

    listingRejected({
        listingCode,
        state,
        district,
        reason
    }) {
        return {
            title: "Listing Rejected",
            message: `Your listing "${district}, ${state}" (Code: ${listingCode}) has been rejected. Reason: ${reason}.`
        };
    },

    listingDraftSaved({ listingCode }) {
        return {
            title: "Draft Saved",
            message: `Your listing (Code: ${listingCode}) has been saved as a draft.`
        };
    },
    listingDelete({ listingCode }) {
        return {
            title: "Delete listing",
            message: `Your listing  with code (Code: ${listingCode}) has been delete .`
        };
    },

    listingNeedsMoreInformation({
        listingCode,
        state,
        district,
        reason
    }) {
        return {
            title: "More Information Required",
            message: `Your listing "${district}, ${state}" (Code: ${listingCode}) requires additional information. ${reason}`
        };
    },

    listingImageQualityIssue({
        listingCode,
        state,
        district
    }) {
        return {
            title: "Better Photos Required",
            message: `The property photos for your listing "${district}, ${state}" (Code: ${listingCode}) are unclear or blurry. Please upload higher-quality images so the review can continue.`
        };
    },
   listingUpdated({ listingCode }) {
    return {
        title: "Listing Updated",
        message: `Your listing (Code: ${listingCode}) has been updated successfully and is awaiting review.`
    };
},

    listingDocumentMissing({
        listingCode,
        documentName
    }) {
        return {
            title: "Document Required",
            message: `Your listing (Code: ${listingCode}) is missing the required document: ${documentName}. Please upload it to continue the review process.`
        };
    },

    listingUnderReview({ listingCode }) {
        return {
            title: "Listing Under Review",
            message: `Your listing (Code: ${listingCode}) is currently being reviewed by our team.`
        };
    },



    // ==========================
    // ENQUIRY
    // ==========================

    enquiryCreated({ enquiryCode }) {
        return {
            title: "Enquiry Submitted",
            message: `Your enquiry (${enquiryCode}) has been submitted successfully.`
        };
    },

    enquiryAssigned({ enquiryCode }) {
        return {
            title: "Enquiry Assigned",
            message: `An administrator has been assigned to your enquiry (${enquiryCode}).`
        };
    },

    enquiryStatusChanged({
        enquiryCode,
        oldStatus,
        newStatus
    }) {
        return {
            title: "Enquiry Updated",
            message: `Your enquiry (${enquiryCode}) status changed from ${oldStatus} to ${newStatus}.`
        };
    },

    enquiryClosed({ enquiryCode }) {
        return {
            title: "Enquiry Closed",
            message: `Your enquiry (${enquiryCode}) has been closed.`
        };
    },



    // ==========================
    // MESSAGE
    // ==========================

    newMessage() {
        return {
            title: "New Message",
            message: "You have received a new message regarding your enquiry."
        };
    },



    // ==========================
    // SCHEDULE
    // ==========================

    scheduleCreated({
        visitDate,
        address
    }) {
        return {
            title: "Site Visit Scheduled",
            message: `A site visit has been scheduled on ${visitDate} at ${address}.`
        };
    },

    schedulestatus({
        visitDate,
        oldStatus ,
        newStatus
    }) {
        return {
            title: "Site Visit Updated",
            message: `Your scheduled visit status has been changes from ${oldStatus} to ${newStatus}.`
        };
    },




    // ==========================
    // ACCOUNT
    // ==========================

    accountVerified() {
        return {
            title: "Account Verified",
            message: "Your account has been successfully verified."
        };
    },

    accountSuspended() {
        return {
            title: "Account Suspended",
            message: "Your account has been suspended. Please contact support for more information."
        };
    }

};