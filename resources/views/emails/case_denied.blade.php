<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Case Alert - Case Denied / Returned</title>
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
        }
        .header p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #94a3b8;
        }
        .body-content {
            padding: 30px;
        }
        .badge-denied {
            display: inline-block;
            background-color: #fee2e2;
            color: #991b1b;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 9999px;
            margin-bottom: 16px;
            text-transform: uppercase;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 12px;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }
        .details-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-left: 4px solid #ef4444;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #7f1d1d;
            width: 140px;
        }
        .value {
            color: #0f172a;
        }
        .comment-box {
            background-color: #ffffff;
            border: 1px solid #fca5a5;
            border-radius: 4px;
            padding: 12px;
            margin-top: 8px;
            font-style: italic;
            color: #450a0a;
        }
        .btn-container {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            background-color: #dc2626;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
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
            <span class="badge-denied">Case Alert - {{ ucfirst($actionType) }}</span>
            <div class="greeting">Hello {{ $recipient->name }},</div>
            <div class="message">
                Please be informed that a land acquisition case has been {{ $actionType }} by a higher officer (<strong>{{ $deniedByRole }}</strong>).
            </div>

            <div class="details-box">
                <div class="detail-row">
                    <span class="label">Project Title:</span>
                    <span class="value"><strong>{{ $project->title }}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="label">Case Reference:</span>
                    <span class="value">PRJ-{{ str_pad($project->id, 4, '0', STR_PAD_LEFT) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Action Taken:</span>
                    <span class="value">{{ ucfirst($actionType) }} by {{ $deniedByRole }}</span>
                </div>
                @if(!empty($comment))
                <div class="detail-row" style="flex-direction: column;">
                    <span class="label">Officer Remarks:</span>
                    <div class="comment-box">"{{ $comment }}"</div>
                </div>
                @endif
            </div>

            <div class="btn-container">
                <a href="{{ $actionUrl }}" class="btn" target="_blank">View Case Details</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Chief Ministry - Southern Province. All rights reserved.
        </div>
    </div>
</body>
</html>
