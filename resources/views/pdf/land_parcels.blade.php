<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Land Parcels Report</title>
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
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-available {
            background-color: #def7ec;
            color: #03543f;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-acquired {
            background-color: #e1effe;
            color: #1e40af;
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
                    <h1>Land Parcels Report</h1>
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
            <td style="width: 15%; font-weight: bold;">Total Parcels:</td>
            <td>{{ count($parcels) }}</td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr>
                <th style="width: 12%;">Parcel Number</th>
                <th style="width: 15%;">Associated Project</th>
                <th style="width: 12%;">Land Name</th>
                <th style="width: 25%;">Location (District, Division, Village)</th>
                <th style="width: 16%;">Owner(s)</th>
                <th style="width: 10%;">Extent</th>
                <th style="width: 10%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($parcels as $parcel)
                <tr>
                    <td style="font-weight: bold; color: #2d3748;">{{ $parcel->parcel_id }}</td>
                    <td>{{ $parcel->project->title ?? ($parcel->project->name ?? 'N/A') }}</td>
                    <td>{{ $parcel->land_name ?? 'N/A' }}</td>
                    <td>
                        {{ $parcel->district }} &gt; {{ $parcel->divisional_secretariat ?? ($parcel->division ?? 'N/A') }} &gt; {{ $parcel->village }}
                    </td>
                    <td>
                        @if($parcel->owners && count($parcel->owners) > 0)
                            {{ implode(', ', $parcel->owners->pluck('name')->toArray()) }}
                        @else
                            N/A
                        @endif
                    </td>
                    <td>{{ $parcel->land_size_acers ?? ($parcel->extent_acers ?? 0) }} ac, {{ $parcel->land_size_perches ?? ($parcel->extent_perches ?? 0) }} per</td>
                    <td>
                        @php
                            $statusClass = 'status-' . strtolower($parcel->status);
                        @endphp
                        <span class="badge {{ $statusClass }}">
                            {{ $parcel->status }}
                        </span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Page 1 of 1 &mdash; Southern Province Land Acquisition Management System &copy; {{ date('Y') }}
    </div>

</body>
</html>
