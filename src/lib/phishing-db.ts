export type PhishingType = 'credential-harvesting' | 'malware-delivery' | 'bec' | 'smishing' | 'vishing' | 'qr-phishing' | 'spear-phishing' | 'whaling';
export type Difficulty = 'low' | 'medium' | 'high' | 'expert';

export interface RedFlag {
  id: string;
  description: string;
  location: string;
}

export interface PhishingCampaign {
  id: string;
  target: string;
  subject: string;
  content: string;
  type: PhishingType;
  difficulty: Difficulty;
  psychologicalTriggers: string[];
  redFlags: RedFlag[];
  metrics: {
    clickRate: number;
    reportRate: number;
    compromiseRate: number;
    deptBreakdown: { dept: string; rate: number }[];
  };
  phishScore: number;
}

export const generateMassivePhishingDB = (): PhishingCampaign[] => {
  const campaigns: PhishingCampaign[] = [];
  let idCounter = 1000;

  const types: PhishingType[] = ['credential-harvesting', 'malware-delivery', 'bec', 'spear-phishing', 'whaling'];
  const difficulties: Difficulty[] = ['low', 'medium', 'high', 'expert'];
  const triggers = ['Urgency', 'Authority', 'Fear', 'Curiosity', 'Greed', 'Helpfulness'];
  
  const subjects = [
    "ACTION REQUIRED: Password Expiry Notice",
    "Invoice #INV-2026-04 Attached",
    "Important Update to Employee Benefits",
    "URGENT: Wire Transfer Request",
    "Security Alert: Unusual Sign-in Activity",
    "Your Microsoft 365 Subscription is Expiring",
    "Document shared with you on OneDrive",
    "IT Helpdesk: Scheduled Maintenance",
    "Confidential: Q3 Financial Report",
    "Review Required: New HR Policy"
  ];

  const targets = ["Corporate Employees", "Finance Department", "C-Level Executives", "IT Staff", "General Public", "HR Department"];

  const generateHTML = (type: string, subject: string) => {
    const colors = ['#0078d4', '#ea4335', '#34a853', '#fbbc05', '#4285f4', '#ffb900', '#d83b01', '#107c10'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    if (type === 'credential-harvesting') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">Security Alert</h2>
          </div>
          <div style="padding: 30px; background-color: #ffffff; color: #333333;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px; line-height: 1.5;">We detected unusual sign-in activity on your account from an unrecognized device. To protect your data, your account access has been temporarily restricted.</p>
            <p style="font-size: 16px; line-height: 1.5;">Please review your recent activity and verify your identity to prevent permanent account suspension.</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="#" style="background-color: ${color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Account Now</a>
            </div>
            <p style="font-size: 13px; color: #666; margin-top: 30px;">If you do not recognize this activity, please contact IT support immediately.</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
            &copy; 2026 Corporate Security Team. All rights reserved.
          </div>
        </div>
      `;
    } else if (type === 'bec' || type === 'whaling') {
      return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000; font-size: 15px; line-height: 1.6; max-width: 600px;">
          <p>Hi,</p>
          <p>Are you available right now? I need you to process an urgent wire transfer for a new vendor acquisition. We need this completed before the end of the day to secure the contract.</p>
          <p>Please let me know when you are ready so I can send over the banking details. Do not discuss this with anyone else as it is strictly confidential until tomorrow.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>CEO / Executive Officer</strong></p>
          <p style="color: #888; font-size: 13px; margin-top: 20px;">Sent from my iPhone</p>
        </div>
      `;
    } else {
      return `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 4px;">
          <div style="padding: 20px; border-bottom: 3px solid ${color}; background: #fafafa;">
            <h2 style="color: #333; margin: 0; font-size: 20px;">${subject}</h2>
          </div>
          <div style="padding: 25px; color: #444; line-height: 1.6; font-size: 15px;">
            <p>Hello,</p>
            <p>Please find the requested document attached for your review. This requires your immediate attention and signature by end of business today.</p>
            <div style="margin: 25px 0; padding: 15px 20px; background-color: #f9f9f9; border-left: 4px solid ${color}; border-radius: 0 4px 4px 0;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <strong>Attachment:</strong> <a href="#" style="color: ${color}; text-decoration: none; font-weight: 500;">Secure_Document_Review.pdf</a> <span style="color: #888; font-size: 13px;">(1.2 MB)</span>
              </div>
            </div>
            <p>Let me know if you have any questions.</p>
            <br>
            <p style="margin-bottom: 0;">Thanks,</p>
            <p style="margin-top: 5px; font-weight: bold; color: #333;">HR / Admin Team</p>
          </div>
        </div>
      `;
    }
  };

  for (let i = 0; i < 200; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)] + ` [ID: ${Math.floor(Math.random() * 9999)}]`;
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    const numTriggers = Math.floor(Math.random() * 3) + 1;
    const selectedTriggers = [];
    for(let j=0; j<numTriggers; j++) {
      selectedTriggers.push(triggers[Math.floor(Math.random() * triggers.length)]);
    }

    const htmlContent = generateHTML(type, subject);

    campaigns.push({
      id: (idCounter++).toString(),
      target: target,
      subject: subject,
      content: htmlContent,
      type: type,
      difficulty: difficulty,
      psychologicalTriggers: [...new Set(selectedTriggers)],
      redFlags: [
        { id: 'rf1', description: 'Generic greeting (e.g., "Dear User")', location: 'Body' },
        { id: 'rf2', description: 'Urgent or threatening language', location: 'Subject/Body' },
        { id: 'rf3', description: 'Suspicious sender address (spoofed)', location: 'Header' }
      ],
      metrics: {
        clickRate: Math.floor(Math.random() * 40) + 5,
        reportRate: Math.floor(Math.random() * 60) + 10,
        compromiseRate: Math.floor(Math.random() * 20) + 1,
        deptBreakdown: [
          { dept: 'Sales', rate: Math.floor(Math.random() * 30) },
          { dept: 'Engineering', rate: Math.floor(Math.random() * 10) },
          { dept: 'HR', rate: Math.floor(Math.random() * 25) }
        ]
      },
      phishScore: Math.floor(Math.random() * 50) + 50
    });
  }

  return campaigns;
};

export const MASSIVE_PHISHING_DB = generateMassivePhishingDB();
