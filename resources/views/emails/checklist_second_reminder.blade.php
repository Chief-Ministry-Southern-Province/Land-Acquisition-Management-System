<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Urgent Reminder - Acquisition Progress Update Overdue</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; color: #333333; }
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; margin: auto !important; }
            .content-padding { padding: 20px 16px !important; }
            .header-padding { padding: 20px 16px !important; }
            .detail-label { width: 100% !important; padding-bottom: 2px !important; }
            .detail-value { width: 100% !important; padding-bottom: 12px !important; }
            .btn-mobile { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
        }
    </style>
</head>
<body style="background-color: #f4f6f9; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f4f6f9; padding: 20px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td align="center" class="header-padding" style="background-color: #7c2d12; padding: 24px 20px; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; color: #ffffff;">Land Acquisition Management System</h1>
                            <p style="margin: 6px 0 0 0; font-size: 13px; color: #fed7aa;">Chief Ministry - Southern Province</p>
                        </td>
                    </tr>
                    
                    <!-- Alert Banner -->
                    <tr>
                        <td style="background-color: #ffedd5; border-bottom: 1px solid #fdba74; padding: 14px 24px; text-align: center;">
                            <p style="margin: 0; font-size: 15px; font-weight: 700; color: #9a3412;">
                                ⚠️ URGENT (2nd Notice): Progress Update Overdue
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="content-padding" style="padding: 32px 28px;">
                            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #1e293b;">
                                Dear <strong>{{ $recipient->name ?? 'Development Officer' }}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                                A reminder was sent to you <strong>1 week ago</strong> regarding the quarterly milestone ({{ $monthsElapsed }} Months) for the acquisition project detailed below. However, no progress update has been recorded in the system.
                            </p>

                            <!-- Project Info Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                                <tr>
                                    <td class="detail-label" style="font-size: 13px; color: #64748b; font-weight: 600; width: 35%; padding-bottom: 8px;">Project Title:</td>
                                    <td class="detail-value" style="font-size: 14px; color: #0f172a; font-weight: 600; padding-bottom: 8px;">{{ $project->title }}</td>
                                </tr>
                                <tr>
                                    <td class="detail-label" style="font-size: 13px; color: #64748b; font-weight: 600; width: 35%; padding-bottom: 8px;">Project Code / ID:</td>
                                    <td class="detail-value" style="font-size: 14px; color: #0f172a; padding-bottom: 8px;">{{ $project->project_id }}</td>
                                </tr>
                                <tr>
                                    <td class="detail-label" style="font-size: 13px; color: #64748b; font-weight: 600; width: 35%; padding-bottom: 8px;">Institution / Ministry:</td>
                                    <td class="detail-value" style="font-size: 14px; color: #0f172a; padding-bottom: 8px;">{{ $project->institution ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td class="detail-label" style="font-size: 13px; color: #64748b; font-weight: 600; width: 35%; padding-bottom: 0;">Creation Date:</td>
                                    <td class="detail-value" style="font-size: 14px; color: #0f172a; padding-bottom: 0;">{{ $project->created_at ? $project->created_at->format('Y-m-d') : 'N/A' }}</td>
                                </tr>
                            </table>

                            <!-- Urgent Warning Box -->
                            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 14px 18px; margin-bottom: 24px; border-radius: 0 6px 6px 0;">
                                <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #9f1239;">Action Required within 7 Days:</p>
                                <p style="margin: 0; font-size: 13px; color: #881337; line-height: 1.5;">
                                    Please open <strong>Mark Progress</strong> and update this project by completing a stage/item, adding remarks, or attaching documentation.
                                    <br><br>
                                    <strong>IMPORTANT:</strong> If progress is not updated within 7 days of this notice, this matter will be <strong>automatically escalated to the Senior Assistant Secretary (SAS)</strong>.
                                </p>
                            </div>

                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $actionUrl }}" class="btn-mobile" style="display: inline-block; background-color: #c2410c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(194, 65, 12, 0.25);">
                                            Update Mark Progress Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                                This automated alert was sent by the Land Acquisition Management System.<br>
                                Chief Ministry of the Southern Province, Sri Lanka.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
