const AfricasTalking = require('africastalking');

// Initialize Africa's Talking
const credentials = {
  apiKey: process.env.SMS_API_KEY,
  username: process.env.SMS_USERNAME
};

const africasTalking = AfricasTalking(credentials);
const sms = africasTalking.SMS;

// SMS logging for audit trail
const logSMS = async (phoneNumber, message, status, error = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    phoneNumber,
    message,
    status,
    error
  };
  
  // Log to console (in production, you might want to log to a file or database)
  console.log('SMS Log:', logEntry);
  
  // TODO: Implement database logging if needed
  return logEntry;
};

// Format phone number for Kenya (+254)
const formatPhoneNumber = (phone) => {
  // Remove any spaces, dashes, or parentheses
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Handle different formats
  if (cleanPhone.startsWith('0')) {
    // Convert 0712345678 to +254712345678
    cleanPhone = '+254' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('254')) {
    // Convert 254712345678 to +254712345678
    cleanPhone = '+' + cleanPhone;
  } else if (!cleanPhone.startsWith('+254')) {
    // Assume it's a local number without country code
    cleanPhone = '+254' + cleanPhone;
  }
  
  return cleanPhone;
};

// Send SMS function
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!process.env.SMS_API_KEY || !process.env.SMS_USERNAME) {
      throw new Error('SMS credentials not configured');
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const options = {
      to: [formattedPhone],
      message: message,
      from: process.env.SMS_SENDER_ID || 'SILOAM'
    };

    console.log('Sending SMS:', { to: formattedPhone, message });

    const response = await sms.send(options);
    
    if (response.SMSMessageData.Recipients.length > 0) {
      const recipient = response.SMSMessageData.Recipients[0];
      
      if (recipient.status === 'Success') {
        await logSMS(formattedPhone, message, 'sent');
        return {
          success: true,
          messageId: recipient.messageId,
          cost: recipient.cost,
          status: recipient.status
        };
      } else {
        await logSMS(formattedPhone, message, 'failed', recipient.status);
        throw new Error(`SMS failed: ${recipient.status}`);
      }
    } else {
      await logSMS(formattedPhone, message, 'failed', 'No recipients');
      throw new Error('No recipients found');
    }
  } catch (error) {
    await logSMS(phoneNumber, message, 'error', error.message);
    console.error('SMS sending error:', error);
    throw error;
  }
};

// Send appointment confirmation SMS
const sendAppointmentConfirmation = async (appointment) => {
  try {
    const patient = appointment.patientId;
    const doctor = appointment.doctorId;
    
    if (!patient || !doctor) {
      throw new Error('Patient or doctor information missing');
    }

    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-GB');
    const appointmentTime = appointment.time;

    const message = `Siloam Clinic: Your appointment with Dr ${doctor.name} on ${appointmentDate} at ${appointmentTime} has been confirmed. Thank you!`;

    const result = await sendSMS(patient.phone, message);
    
    console.log('Appointment confirmation SMS sent:', {
      appointmentId: appointment._id,
      patientPhone: patient.phone,
      result
    });

    return result;
  } catch (error) {
    console.error('Failed to send appointment confirmation SMS:', error);
    throw error;
  }
};

// Send appointment reminder SMS
const sendAppointmentReminder = async (appointment) => {
  try {
    const patient = appointment.patientId;
    const doctor = appointment.doctorId;
    
    if (!patient || !doctor) {
      throw new Error('Patient or doctor information missing');
    }

    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-GB');
    const appointmentTime = appointment.time;

    const message = `Siloam Clinic: Reminder - You have an appointment with Dr ${doctor.name} tomorrow (${appointmentDate}) at ${appointmentTime}. Please arrive 15 minutes early.`;

    const result = await sendSMS(patient.phone, message);
    
    console.log('Appointment reminder SMS sent:', {
      appointmentId: appointment._id,
      patientPhone: patient.phone,
      result
    });

    return result;
  } catch (error) {
    console.error('Failed to send appointment reminder SMS:', error);
    throw error;
  }
};

// Send appointment cancellation SMS
const sendAppointmentCancellation = async (appointment) => {
  try {
    const patient = appointment.patientId;
    const doctor = appointment.doctorId;
    
    if (!patient || !doctor) {
      throw new Error('Patient or doctor information missing');
    }

    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-GB');
    const appointmentTime = appointment.time;

    const message = `Siloam Clinic: Your appointment with Dr ${doctor.name} on ${appointmentDate} at ${appointmentTime} has been cancelled. Please contact us to reschedule.`;

    const result = await sendSMS(patient.phone, message);
    
    console.log('Appointment cancellation SMS sent:', {
      appointmentId: appointment._id,
      patientPhone: patient.phone,
      result
    });

    return result;
  } catch (error) {
    console.error('Failed to send appointment cancellation SMS:', error);
    throw error;
  }
};

// Send payment confirmation SMS
const sendPaymentConfirmation = async (billing) => {
  try {
    const patient = billing.patientId;
    
    if (!patient) {
      throw new Error('Patient information missing');
    }

    const message = `Siloam Clinic: Payment of KES ${billing.totalAmount.toLocaleString()} for invoice ${billing.invoiceNumber} has been received. Thank you!`;

    const result = await sendSMS(patient.phone, message);
    
    console.log('Payment confirmation SMS sent:', {
      billingId: billing._id,
      patientPhone: patient.phone,
      result
    });

    return result;
  } catch (error) {
    console.error('Failed to send payment confirmation SMS:', error);
    throw error;
  }
};

// Send custom SMS
const sendCustomSMS = async (phoneNumber, message) => {
  try {
    const result = await sendSMS(phoneNumber, message);
    
    console.log('Custom SMS sent:', {
      phoneNumber,
      result
    });

    return result;
  } catch (error) {
    console.error('Failed to send custom SMS:', error);
    throw error;
  }
};

// Get SMS balance (if supported by Africa's Talking)
const getSMSBalance = async () => {
  try {
    // Note: This might not be available in all Africa's Talking packages
    // Check their documentation for balance inquiry endpoints
    return {
      success: true,
      message: 'Balance inquiry not implemented'
    };
  } catch (error) {
    console.error('Failed to get SMS balance:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendPaymentConfirmation,
  sendCustomSMS,
  getSMSBalance,
  formatPhoneNumber
};