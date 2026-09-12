<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Case Alert - Case Denied / Returned</title>
    <style>
        /* Reset styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; color: #333333; }
        
        /* Mobile styles */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: auto !important;
            }
            .content-padding {
                padding: 20px 16px !important;
            }
            .header-padding {
                padding: 20px 16px !important;
            }
            .stack-col {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            .detail-label {
                width: 100% !important;
                padding-bottom: 2px !important;
            }
            .detail-value {
                width: 100% !important;
                padding-bottom: 12px !important;
            }
            .btn-mobile {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
                box-sizing: border-box !important;
            }
        }
    </style>
</head>
<body style="background-color: #f4f6f9; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f4f6f9; padding: 20px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td align="center" class="header-padding" style="background-color: #0f172a; padding: 24px 20px; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; color: #ffffff;">Land Acquisition Management System</h1>
                            <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Chief Ministry - Southern Province</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content-padding" style="padding: 30px 24px;">
                            <!-- Badge -->
                            <div style="margin-bottom: 16px;">
                                <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">Case Alert - {{ ucfirst($actionType) }}</span>
                            </div>

                            <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">Hello {{ $recipient->name }},</div>
                            <div style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
                                Please be informed that a land acquisition case has been {{ $actionType }} by a higher officer (<strong>{{ $deniedByRole }}</strong>).
                            </div>

                            <!-- Case Details Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 6px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 16px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #7f1d1d; width: 140px; padding: 4px 0;">Project Title:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; word-break: break-word; padding: 4px 0;"><strong>{{ $project->title }}</strong></td>
                                            </tr>
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #7f1d1d; width: 140px; padding: 4px 0;">Case Reference:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; font-family: monospace; word-break: break-all; padding: 4px 0;">PRJ-{{ str_pad($project->id, 4, '0', STR_PAD_LEFT) }}</td>
                                            </tr>
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #7f1d1d; width: 140px; padding: 4px 0;">Action Taken:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; word-break: break-word; padding: 4px 0;">{{ ucfirst($actionType) }} by {{ $deniedByRole }}</td>
                                            </tr>
                                            @if(!empty($comment))
                                            <tr>
                                                <td class="stack-col" colspan="2" valign="top" style="font-size: 14px; font-weight: 600; color: #7f1d1d; padding-top: 8px; padding-bottom: 4px;">Officer Remarks:</td>
                                            </tr>
                                            <tr>
                                                <td class="stack-col" colspan="2" valign="top" style="padding-bottom: 4px;">
                                                    <div style="background-color: #ffffff; border: 1px solid #fca5a5; border-radius: 4px; padding: 12px; font-style: italic; color: #450a0a; font-size: 13px; line-height: 1.5; word-break: break-word;">"{{ $comment }}"</div>
                                                </td>
                                            </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin: 24px 0 10px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $actionUrl }}" class="btn-mobile" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center;">View Case Details</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; font-size: 12px; color: #94a3b8;">
                            &copy; {{ date('Y') }} Chief Ministry - Southern Province. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
