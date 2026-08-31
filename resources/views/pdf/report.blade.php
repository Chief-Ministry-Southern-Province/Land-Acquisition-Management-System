<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
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
            margin-bottom: 20px;
            border-bottom: 2px solid #2E7D32;
            padding-bottom: 15px;
        }
        .header table {
            width: 100%;
            border-collapse: collapse;
        }
        .header h1 {
            color: #2E7D32;
            font-size: 20px;
            margin: 0 0 5px 0;
            font-weight: bold;
        }
        .header p {
            margin: 0;
            color: #4a5568;
            font-size: 11px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 15px;
            font-size: 10px;
            color: #4a5568;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 2px 0;
        }
        .summary-card {
            background-color: #f4fbf4;
            border: 1px solid #c2e2c2;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
        }
        .summary-title {
            font-weight: bold;
            color: #1b5e20;
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
        }
        .summary-grid {
            width: 100%;
        }
        .summary-grid td {
            padding: 4px 8px;
            font-size: 10px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table th {
            background-color: #2E7D32;
            color: #ffffff;
            text-align: left;
            padding: 8px 6px;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid #c2e2c2;
        }
        .table td {
            padding: 8px 6px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
            font-size: 10px;
        }
        .table tr:nth-child(even) {
            background-color: #f7fafc;
        }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 9px;
            color: #718096;
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .bg-success { background-color: #def7ec; color: #03543f; }
        .bg-warning { background-color: #fef3c7; color: #92400e; }
        .bg-danger { background-color: #fde8e8; color: #9b1c1c; }
        .bg-info { background-color: #e1f5fe; color: #0288d1; }
        .bg-neutral { background-color: #f3f4f6; color: #4b5563; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td>
                    <h1>{{ $title }}</h1>
                    <p>{{ $subtitle ?? 'Land Acquisition Management System (LAMS)' }}</p>
                </td>
                <td align="right" style="vertical-align: bottom;">
                    <p>Generated: {{ date('Y-m-d H:i:s') }}</p>
                </td>
            </tr>
        </table>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 10%;"><strong>Date Range:</strong></td>
            <td style="width: 40%;">{{ $date_from ?? 'All' }} to {{ $date_to ?? 'All' }}</td>
            <td style="width: 10%;"><strong>Project:</strong></td>
            <td style="width: 40%;">{{ $project_name ?? 'All Projects' }}</td>
        </tr>
        <tr>
            <td><strong>District:</strong></td>
            <td>{{ $district ?? 'All Districts' }}</td>
            <td><strong>Status:</strong></td>
            <td>{{ $status ?? 'All Statuses' }}</td>
        </tr>
    </table>

    @if(!empty($summary))
    <div class="summary-card">
        <div class="summary-title">Report Summary</div>
        <table class="summary-grid">
            <tr>
                @php $count = 0; @endphp
                @foreach($summary as $key => $val)
                    @if($count > 0 && $count % 3 == 0)
                        </tr><tr>
                    @endif
                    <td style="width: 15%; font-weight: bold; color: #555;">{{ $key }}:</td>
                    <td style="width: 18%; font-weight: bold; font-size: 11px;">{{ $val }}</td>
                    @php $count++; @endphp
                @endforeach
                @while($count % 3 != 0)
                    <td></td><td></td>
                    @php $count++; @endphp
                @endwhile
            </tr>
        </table>
    </div>
    @endif

    <table class="table">
        <thead>
            <tr>
                @foreach($headers as $header)
                <th class="{{ str_contains(strtolower($header), 'amount') || str_contains(strtolower($header), 'value') || str_contains(strtolower($header), 'lkr') ? 'text-right' : '' }}">{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
            <tr>
                @foreach($row as $cell)
                <td class="{{ is_numeric(str_replace([',', 'LKR'], '', $cell)) && (str_contains($cell, ',') || is_numeric($cell)) ? 'text-right' : '' }}">
                    @if(str_starts_with(strval($cell), 'badge:'))
                        @php 
                            $parts = explode(':', $cell, 3);
                            $badgeType = $parts[1] ?? 'neutral';
                            $badgeText = $parts[2] ?? '';
                        @endphp
                        <span class="badge bg-{{ $badgeType }}">{{ $badgeText }}</span>
                    @else
                        {!! $cell !!}
                    @endif
                </td>
                @endforeach
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Southern Province Project Office &bull; Land Acquisition Management System (LAMS)
    </div>
</body>
</html>
