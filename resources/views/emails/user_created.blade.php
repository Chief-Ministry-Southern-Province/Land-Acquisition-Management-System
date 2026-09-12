<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Account Created - Land Acquisition Management System</title>
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
                            <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">Hello {{ $user->name }},</div>
                            <div style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
                                An account has been created for you on the Land Acquisition Management System. Below are your login credentials to access the platform:
                            </div>

                            <!-- Credentials Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 6px; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 16px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #334155; width: 140px; padding: 4px 0;">Full Name:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; word-break: break-word; padding: 4px 0;">{{ $user->name }}</td>
                                            </tr>
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #334155; width: 140px; padding: 4px 0;">Email / Username:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; font-family: monospace; word-break: break-all; padding: 4px 0;">{{ $user->email }}</td>
                                            </tr>
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #334155; width: 140px; padding: 4px 0;">Password:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; font-family: monospace; word-break: break-all; padding: 4px 0;">{{ $password }}</td>
                                            </tr>
                                            @if(!empty($user->role))
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #334155; width: 140px; padding: 4px 0;">Role:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; word-break: break-word; padding: 4px 0;">{{ $user->role->role_name }}</td>
                                            </tr>
                                            @endif
                                            @if(!empty($user->department))
                                            <tr>
                                                <td class="stack-col detail-label" valign="top" style="font-size: 14px; font-weight: 600; color: #334155; width: 140px; padding: 4px 0;">Department:</td>
                                                <td class="stack-col detail-value" valign="top" style="font-size: 14px; color: #0f172a; word-break: break-word; padding: 4px 0;">{{ $user->department->department_name }}</td>
                                            </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Notice -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #fffbe0; border: 1px solid #fef08a; border-radius: 6px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 12px 14px; font-size: 13px; color: #854d0e; line-height: 1.5;">
                                        🔒 <strong>Security Notice:</strong> Please log in and update your password immediately after your first sign-in.
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin: 24px 0 10px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $loginUrl }}" class="btn-mobile" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center;">Login to System</a>
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
