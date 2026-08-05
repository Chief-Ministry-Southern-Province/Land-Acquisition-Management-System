<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Projects Report</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 25px;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 15px;
        }
        .header table {
            width: 100%;
            border-collapse: collapse;
        }
        .header h1 {
            color: #1a365d;
            font-size: 22px;
            margin: 0 0 5px 0;
            font-weight: bold;
        }
        .header p {
            margin: 0;
            color: #4a5568;
            font-size: 12px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 20px;
            font-size: 10px;
            color: #4a5568;
        }
        .meta-table td {
            padding: 2px 0;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table th {
            background-color: #1a365d;
            color: #ffffff;
            text-align: left;
            padding: 8px 6px;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        .table td {
            padding: 8px 6px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .table tr:nth-child(even) {
            background-color: #f7fafc;
        }
        .badge {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-draft {
            background-color: #f3f4f6;
            color: #4b5563;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-rejected {
            background-color: #fde8e8;
            color: #9b1c1c;
        }
        .status-completed {
            background-color: #def7ec;
            color: #03543f;
        }
        .badge-yes {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge-no {
            background-color: #f3f4f6;
            color: #4b5563;
        }

        .footer {
            position: fixed;
            bottom: -30px;
            left: 0px;
            right: 0px;
            height: 30px;
            text-align: center;
            font-size: 9px;
            color: #a0aec0;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
    </style>
</head>
<body>

    <div class="header">
        <table>
            <tr>
                <td>
                    <h1>Projects Report</h1>
                    <p>Southern Province Land Acquisition Management System</p>
                </td>
                <td style="text-align: right; vertical-align: bottom;">
                    <p style="font-size: 10px; color: #718096;">Generated on: {{ now()->format('Y-m-d H:i:s') }}</p>
                </td>
            </tr>
        </table>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 15%; font-weight: bold;">Total Projects:</td>
            <td>{{ count($projects) }}</td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr>
                <th style="width: 10%;">Project ID</th>
                <th style="width: 18%;">Title</th>
                <th style="width: 15%;">Purpose</th>
                <th style="width: 15%;">Institution</th>
                <th style="width: 12%;">Acquired Area</th>
                <th style="width: 8%;">Relocation</th>
                <th style="width: 10%;">Approval Date</th>
                <th style="width: 12%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projects as $project)
                <tr>
                    <td><strong>{{ $project->project_id }}</strong></td>
                    <td>{{ $project->title }}</td>
                    <td>{{ $project->purpose }}</td>
                    <td>
                        {{ $project->institution ?? 'N/A' }}
                        @if($project->institution_address)
                            <div style="font-size: 9px; color: #718096; margin-top: 2px;">{{ $project->institution_address }}</div>
                        @endif
                    </td>
                    <td>
                        {{ $project->land_area_to_be_acquired_acers ?? 0 }} A, 
                        {{ $project->land_area_to_be_acquired_roods ?? 0 }} R, 
                        {{ $project->land_area_to_be_acquired_perches ?? 0 }} P
                        <div style="font-size: 9px; color: #718096; margin-top: 2px;">Total: {{ $project->full_land_area_to_be_acquired ?? 0 }} Perches</div>
                    </td>
                    <td>
                        @if($project->are_residents_moved_temp)
                            <span class="badge badge-yes">Yes</span>
                        @else
                            <span class="badge badge-no">No</span>
                        @endif
                    </td>
                    <td>{{ $project->approval_date ? $project->approval_date->format('Y-m-d') : 'N/A' }}</td>
                    <td>
                        <span class="badge status-{{ strtolower($project->case_status ?: 'draft') }}">
                            {{ $project->case_status ?: 'Draft' }}
                        </span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Page 1
    </div>

</body>
</html>
