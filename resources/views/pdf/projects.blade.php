<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ __('messages.projects_report') }}</title>
    <style>
        @if(app()->getLocale() === 'si')
        body {
            font-family: 'notosanssinhala', sans-serif;
            color: #333333;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        @else
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        @endif
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
                    <h1>{{ __('messages.projects_report') }}</h1>
                    <p>{{ __('messages.Land_Acquisition_Management_System') }}</p>
                </td>
                <td style="text-align: right; vertical-align: bottom;">
                    <p style="font-size: 10px; color: #718096;">{{ __('messages.generated_on') }}: {{ now()->format('Y-m-d H:i:s') }}</p>
                </td>
            </tr>
        </table>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 15%; font-weight: bold;">{{ __('messages.total_projects') }}:</td>
            <td>{{ count($projects) }}</td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr>
                <th style="width: 10%;">{{ __('messages.project_id') }}</th>
                <th style="width: 18%;">{{ __('messages.title') }}</th>
                <th style="width: 15%;">{{ __('messages.purpose') }}</th>
                <th style="width: 15%;">{{ __('messages.institution') }}</th>
                <th style="width: 12%;">{{ __('messages.extent') }}</th>
                <th style="width: 8%;">{{ __('messages.temporary_relocation') }}</th>
                <th style="width: 10%;">{{ __('messages.approval_date') }}</th>
                <th style="width: 12%;">{{ __('messages.status') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projects as $project)
                <tr>
                    <td><strong>{{ $project->project_id }}</strong></td>
                    <td>{{ $project->title }}</td>
                    <td>{{ $project->purpose }}</td>
                    <td>
                        {{ $project->institution ?? __('messages.n_a') }}
                        @if($project->institution_address)
                            <div style="font-size: 9px; color: #718096; margin-top: 2px;">{{ $project->institution_address }}</div>
                        @endif
                    </td>
                    <td>
                        {{ $project->land_area_to_be_acquired_acers ?? 0 }} {{ __('messages.acres') }}, 
                        {{ $project->land_area_to_be_acquired_roods ?? 0 }} {{ __('messages.roods') }}, 
                        {{ $project->land_area_to_be_acquired_perches ?? 0 }} {{ __('messages.perches') }}
                        <div style="font-size: 9px; color: #718096; margin-top: 2px;">{{ __('messages.total_extent_to_acquire') }}: {{ $project->full_land_area_to_be_acquired ?? 0 }} {{ __('messages.perches') }}</div>
                    </td>
                    <td>
                        @if($project->are_residents_moved_temp)
                            <span class="badge badge-yes">{{ __('messages.yes') }}</span>
                        @else
                            <span class="badge badge-no">{{ __('messages.no') }}</span>
                        @endif
                    </td>
                    <td>{{ $project->approval_date ? $project->approval_date->format('Y-m-d') : __('messages.n_a') }}</td>
                    <td>
                        <span class="badge status-{{ strtolower($project->case_status ?: 'draft') }}">
                            {{ __('messages.' . strtolower($project->case_status ?: 'draft')) }}
                        </span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        {{ __('messages.page') }} 1
    </div>

</body>
</html>
