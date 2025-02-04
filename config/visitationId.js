const generateVisitationId = (appointmentId) => {
    const datePart = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
    const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `VST-${appointmentId.slice(-4)}-${datePart}-${randomPart}`;
};

// Example Output: VIS-3d4e-20250201-1234


module.exports = { generateVisitationId, };