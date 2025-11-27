import { Response } from 'express';
import { AuthRequest } from '../interfaces';
import { brevoService } from '../services';

export class NotificationController {
  async sendEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, subject, content, templateId, params } = req.body;

      const result = await brevoService.sendEmail({
        type: 'email',
        to,
        subject,
        content,
        templateId,
        params,
      });

      res.json({
        ok: true,
        msg: 'Email sent successfully',
        data: result,
      });
    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Failed to send email',
      });
    }
  }

  async sendSMS(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, content } = req.body;

      const result = await brevoService.sendSMS({
        type: 'sms',
        to,
        content,
      });

      res.json({
        ok: true,
        msg: 'SMS sent successfully',
        data: result,
      });
    } catch (error) {
      console.error('Send SMS error:', error);
      res.status(500).json({
        ok: false,
        msg: 'Failed to send SMS',
      });
    }
  }
}

export const notificationController = new NotificationController();
export default notificationController;
