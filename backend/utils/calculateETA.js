export const calculateETA = (appointmentNumber, currentNumber, avgConsultTime) => {
    const remaining = appointmentNumber - currentNumber;
    const etaMin = Math.max(remaining, 0) * avgConsultTime;

    return (remaining, etaMin);
}