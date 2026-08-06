<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Project Details - {{ $project->project_id }}</title>
    <style>
        @page {
            margin: 60px 45px 70px 45px;
        }

        body {
            font-family: 'Times New Roman', 'Noto Serif', Georgia, serif;
            color: #1a1a1a;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        .page-frame {
            border: 3px double #2d2d2d;
            padding: 14px;
        }

        .inner-frame {
            border: 1px solid #2d2d2d;
            padding: 14px 18px;
        }

        .confidential-banner {
            text-align: center;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #2d2d2d;
            text-transform: uppercase;
            border-bottom: 1px solid #2d2d2d;
            padding-bottom: 4px;
            margin-bottom: 10px;
        }

        .form-header {
            border-bottom: 2px solid #2d2d2d;
            padding-bottom: 10px;
            margin-bottom: 4px;
        }

        .emblem-box {
            width: 66px;
            height: 66px;
            border: 2px solid #2d2d2d;
            border-radius: 50%;
            text-align: center;
            vertical-align: middle;
            color: #2d2d2d;
            font-weight: bold;
            font-size: 7.5px;
            line-height: 1.2;
            padding-top: 18px;
            font-family: 'Times New Roman', serif;
        }

        .gov-title {
            margin: 0;
            color: #2d2d2d;
            font-size: 10.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .ministry-title {
            margin: 2px 0 0 0;
            color: #1a1a1a;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .form-title {
            margin: 4px 0 0 0;
            color: #1a1a1a;
            font-size: 17px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            border-top: 1px solid #cccccc;
            padding-top: 5px;
        }

        .section-title {
            background-color: #f2f2f2;
            border: 1px solid #2d2d2d;
            font-weight: bold;
            text-transform: uppercase;
            padding: 4px 8px;
            margin-top: 15px;
            margin-bottom: 10px;
            font-size: 10px;
            letter-spacing: 0.5px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .data-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
            width: 30%;
            color: #2d2d2d;
        }

        .value {
            width: 70%;
        }

        .footer {
            position: fixed;
            bottom: -40px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 6px;
        }
    </style>
</head>
<body>

<div class="page-frame">
    <div class="inner-frame">
        <div class="confidential-banner">Official Document - Land Acquisition Management System</div>
        
        <div class="form-header">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 75px; padding: 0;">
                        <div class="emblem-box">STATE<br>EMBLEM</div>
                    </td>
                    <td style="padding: 0; padding-left: 10px; vertical-align: middle;">
                        <h4 class="gov-title">Democratic Socialist Republic of Sri Lanka</h4>
                        <h2 class="ministry-title">Southern Provincial Council</h2>
                        <h1 class="form-title">Land Acquisition Project Report</h1>
                    </td>
                </tr>
            </table>
        </div>

        <div class="section-title">General Information</div>
        <table class="data-table">
            <tr>
                <td class="label">Project ID:</td>
                <td class="value"><strong>{{ $project->project_id }}</strong></td>
            </tr>
            <tr>
                <td class="label">Project Title:</td>
                <td class="value">{{ $project->title }}</td>
            </tr>
            <tr>
                <td class="label">Purpose of Acquisition:</td>
                <td class="value">{{ $project->purpose }}</td>
            </tr>
            <tr>
                <td class="label">Requesting Institution:</td>
                <td class="value">{{ $project->institution ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Institution Address:</td>
                <td class="value">{{ $project->institution_address ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Total Extent to Acquire:</td>
                <td class="value">
                    {{ $project->land_area_to_be_acquired_acers ?? 0 }} Acres, 
                    {{ $project->land_area_to_be_acquired_roods ?? 0 }} Roods, 
                    {{ $project->land_area_to_be_acquired_perches ?? 0 }} Perches
                    (Total: {{ $project->full_land_area_to_be_acquired ?? 0 }} Perches)
                </td>
            </tr>
            <tr>
                <td class="label">Temporary Relocation:</td>
                <td class="value">{{ $project->are_residents_moved_temp ? 'Required' : 'Not Required' }}</td>
            </tr>
            <tr>
                <td class="label">Status:</td>
                <td class="value">{{ ucfirst($project->case_status ?: 'Draft') }}</td>
            </tr>
            <tr>
                <td class="label">Approval Date:</td>
                <td class="value">{{ $project->approval_date ? $project->approval_date->format('Y-m-d') : 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Remarks:</td>
                <td class="value">{{ $project->remarks ?? 'N/A' }}</td>
            </tr>
        </table>

        <div class="section-title">Legal Milestone Status (Sections 20 - 26)</div>
        <table class="data-table">
            <tr>
                <td class="label">Sec 20 Observation:</td>
                <td class="value">{{ $project->section20_observation ? 'Passed' : 'Pending' }}</td>
            </tr>
            <tr>
                <td class="label">Sec 21 Secretary Report:</td>
                <td class="value">{{ $project->section21_secretary_report ? 'Completed' : 'Pending' }}</td>
            </tr>
            <tr>
                <td class="label">Sec 22 Recommendation:</td>
                <td class="value">{{ $project->section22_secretary_recommendation ?? 'Pending' }}</td>
            </tr>
            <tr>
                <td class="label">Sec 23 Valuation Recommendation:</td>
                <td class="value">{{ $project->section23_valuation_recommendation ?? 'Pending' }}</td>
            </tr>
            <tr>
                <td class="label">Sec 24 Decision Remarks:</td>
                <td class="value">{{ $project->section24_decision_remarks ? 'Approved' : 'Pending' }}</td>
            </tr>
            <tr>
                <td class="label">Sec 25 Additional Conditions:</td>
                <td class="value">{{ $project->section25_additional_conditions ?? 'Pending' }}</td>
            </tr>
            <tr>
                <td class="label">Sec 26 Final Recommendation:</td>
                <td class="value">{{ $project->section26_final_recommendation ? 'Approved' : 'Pending' }}</td>
            </tr>
        </table>
    </div>
</div>

<div class="footer">
    Southern Province Land Acquisition Management System &bull; Confidential Page 1
</div>

</body>
</html>
