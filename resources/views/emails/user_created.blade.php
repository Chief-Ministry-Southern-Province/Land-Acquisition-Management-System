<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Created - Land Acquisition Management System</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f9;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }
        .header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #94a3b8;
        }
        .body-content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 16px;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }
        .credentials-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #2563eb;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .credential-row {
            display: flex;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .credential-row:last-child {
            margin-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #334155;
            width: 140px;
        }
        .value {
            color: #0f172a;
            font-family: monospace;
            word-break: break-all;
        }
        .btn-container {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
        }
        .notice {
            font-size: 12px;
            color: #64748b;
            background: #fffbe0;
            border: 1px solid #fef08a;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 16px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Land Acquisition Management System</h1>
            <p>Chief Ministry - Southern Province</p>
        </div>
        <div class="body-content">
            <div class="greeting">Hello {{ $user->name }},</div>
            <div class="message">
                An account has been created for you on the Land Acquisition Management System. Below are your login credentials to access the platform:
            </div>
            
            <div class="credentials-box">
                <div class="credential-row">
                    <span class="label">Full Name:</span>
                    <span class="value">{{ $user->name }}</span>
                </div>
                <div class="credential-row">
                    <span class="label">Email / Username:</span>
                    <span class="value">{{ $user->email }}</span>
                </div>
                <div class="credential-row">
                    <span class="label">Password:</span>
                    <span class="value">{{ $password }}</span>
                </div>
                @if(!empty($user->role))
                <div class="credential-row">
                    <span class="label">Role:</span>
                    <span class="value">{{ $user->role->role_name }}</span>
                </div>
                @endif
                @if(!empty($user->department))
                <div class="credential-row">
                    <span class="label">Department:</span>
                    <span class="value">{{ $user->department->department_name }}</span>
                </div>
                @endif
            </div>

            <div class="notice">
                🔒 <strong>Security Notice:</strong> Please log in and update your password immediately after your first sign-in.
            </div>

            <div class="btn-container">
                <a href="{{ $loginUrl }}" class="btn" target="_blank">Login to System</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Chief Ministry - Southern Province. All rights reserved.
        </div>
    </div>
</body>
</html>
