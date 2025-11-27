// eslint-disable-next-line @typescript-eslint/no-require-imports
const SibApiV3Sdk = require('sib-api-v3-sdk');
import { config } from '../../config';
import { NotificationPayload } from '../../interfaces';
import { Notification } from '../../models';

export class BrevoService {
  private apiInstance: unknown;
  private smsApiInstance: unknown;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = config.brevo.apiKey;
    
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    this.smsApiInstance = new SibApiV3Sdk.TransactionalSMSApi();
  }

  async sendEmail(payload: NotificationPayload): Promise<{ messageId: string }> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
      name: config.brevo.senderName,
      email: config.brevo.senderEmail,
    };
    sendSmtpEmail.to = [{ email: payload.to }];
    sendSmtpEmail.subject = payload.subject || 'Notification from Rest-IA';
    sendSmtpEmail.htmlContent = payload.content;
    
    if (payload.templateId) {
      sendSmtpEmail.templateId = payload.templateId;
      if (payload.params) {
        sendSmtpEmail.params = payload.params;
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (this.apiInstance as any).sendTransacEmail(sendSmtpEmail);
      return { messageId: result.messageId || '' };
    } catch (error) {
      console.error('BREVO email send error:', error);
      throw error;
    }
  }

  async sendSMS(payload: NotificationPayload): Promise<{ messageId: string }> {
    const sendTransacSms = new SibApiV3Sdk.SendTransacSms();
    
    sendTransacSms.sender = config.brevo.senderName;
    sendTransacSms.recipient = payload.to;
    sendTransacSms.content = payload.content;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (this.smsApiInstance as any).sendTransacSms(sendTransacSms);
      return { messageId: result.messageId || '' };
    } catch (error) {
      console.error('BREVO SMS send error:', error);
      throw error;
    }
  }

  async sendNotification(
    recipientId: string,
    payload: NotificationPayload
  ): Promise<void> {
    const notification = new Notification({
      recipient: recipientId,
      type: payload.type,
      title: payload.subject || 'Notification',
      message: payload.content,
      status: 'pending',
    });

    try {
      if (payload.type === 'email') {
        await this.sendEmail(payload);
      } else if (payload.type === 'sms') {
        await this.sendSMS(payload);
      }
      
      notification.status = 'sent';
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = 'failed';
      notification.error = error instanceof Error ? error.message : 'Unknown error';
    }

    await notification.save();
  }

  // Pre-defined notification templates
  async sendOrderConfirmation(
    email: string,
    orderNumber: string,
    customerName: string,
    items: { name: string; quantity: number; price: number }[],
    total: number
  ): Promise<void> {
    const itemsList = items
      .map(item => `<li>${item.name} x${item.quantity} - $${item.price.toFixed(2)}</li>`)
      .join('');

    const content = `
      <h1>Order Confirmation</h1>
      <p>Dear ${customerName},</p>
      <p>Thank you for your order! Your order number is: <strong>${orderNumber}</strong></p>
      <h2>Order Details:</h2>
      <ul>${itemsList}</ul>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
      <p>We will notify you when your order is ready.</p>
    `;

    await this.sendEmail({
      type: 'email',
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      content,
    });
  }

  async sendOrderStatusUpdate(
    email: string,
    orderNumber: string,
    status: string,
    customerName: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed and will be prepared shortly.',
      preparing: 'Your order is being prepared.',
      ready: 'Your order is ready for pickup/delivery!',
      out_for_delivery: 'Your order is out for delivery!',
      delivered: 'Your order has been delivered. Enjoy your meal!',
      cancelled: 'Your order has been cancelled.',
    };

    const content = `
      <h1>Order Status Update</h1>
      <p>Dear ${customerName},</p>
      <p>Your order <strong>${orderNumber}</strong> has been updated.</p>
      <p><strong>New Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
      <p>${statusMessages[status] || 'Status updated.'}</p>
    `;

    await this.sendEmail({
      type: 'email',
      to: email,
      subject: `Order Update - ${orderNumber}`,
      content,
    });
  }

  async sendReservationConfirmation(
    email: string,
    customerName: string,
    restaurantName: string,
    date: string,
    time: string,
    partySize: number,
    confirmationCode: string
  ): Promise<void> {
    const content = `
      <h1>Reservation Confirmation</h1>
      <p>Dear ${customerName},</p>
      <p>Your reservation at <strong>${restaurantName}</strong> has been confirmed!</p>
      <h2>Reservation Details:</h2>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Party Size:</strong> ${partySize} guests</li>
        <li><strong>Confirmation Code:</strong> ${confirmationCode}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `;

    await this.sendEmail({
      type: 'email',
      to: email,
      subject: `Reservation Confirmed - ${restaurantName}`,
      content,
    });
  }

  async sendReservationReminder(
    email: string,
    customerName: string,
    restaurantName: string,
    date: string,
    time: string
  ): Promise<void> {
    const content = `
      <h1>Reservation Reminder</h1>
      <p>Dear ${customerName},</p>
      <p>This is a reminder about your upcoming reservation at <strong>${restaurantName}</strong>.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>We look forward to seeing you!</p>
    `;

    await this.sendEmail({
      type: 'email',
      to: email,
      subject: `Reservation Reminder - ${restaurantName}`,
      content,
    });
  }
}

export const brevoService = new BrevoService();
export default brevoService;
