<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ __('messages.land_parcels_report') }}</title>
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
        .badge-yes {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge-no {
            background-color: #f3f4f6;
            color: #4b5563;
        }
        .badge-donated {
            background-color: #def7ec;
            color: #03543f;
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
                    <h1>{{ __('messages.land_parcels_report') }}</h1>
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
            <td style="width: 15%; font-weight: bold;">{{ __('messages.total_land_parcels') }}:</td>
            <td>{{ count($parcels) }}</td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr>
                <th style="width: 8%;">{{ __('messages.land_number') }}</th>
                <th style="width: 8%;">{{ __('messages.land_name') }}</th>
                <th style="width: 18%;">{{ __('messages.location_details') }} ({{ __('messages.district') }} &gt; {{ __('messages.divisional_secretariat') }} &gt; {{ __('messages.gn_division') }} &gt; {{ __('messages.village') }})</th>
                <th style="width: 8%;">{{ __('messages.land_type') }}</th>
                <th style="width: 12%;">{{ __('messages.owners_list') }}</th>
                <th style="width: 10%;">{{ __('messages.extent') }}</th>
                <th style="width: 10%;">{{ __('messages.estimated_value') }}</th>
                <th style="width: 6%;">{{ __('messages.casehold') }}</th>
                <th style="width: 6%;">{{ __('messages.donated') }}</th>
                <th style="width: 8%;">{{ __('messages.projects') }}</th>
                <th style="width: 6%;">{{ __('messages.status') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach($parcels as $parcel)
                <tr>
                    <td style="font-weight: bold; color: #2d3748;">{{ $parcel->parcel_id }}</td>
                    <td>{{ $parcel->land_name ?? __('messages.n_a') }}</td>
                    <td>
                        {{ $parcel->district }} &gt; {{ $parcel->divisional_secretariat ?? ($parcel->division ?? __('messages.n_a')) }} &gt; {{ $parcel->grama_niladari_division ?? __('messages.n_a') }} &gt; {{ $parcel->village }}
                    </td>
                    <td>{{ $parcel->land_type ?? 'Standard' }}</td>
                    <td>
                        @if($parcel->owners && count($parcel->owners) > 0)
                            {{ implode(', ', $parcel->owners->pluck('name')->toArray()) }}
                        @else
                            {{ __('messages.n_a') }}
                        @endif
                    </td>
                    <td>
                        {{ $parcel->land_size_acers ?? ($parcel->extent_acers ?? 0) }} {{ __('messages.acres') }}, 
                        {{ $parcel->land_size_roods ?? 0 }} {{ __('messages.roods') }}, 
                        {{ $parcel->land_size_perches ?? ($parcel->extent_perches ?? 0) }} {{ __('messages.perches') }}
                    </td>
                    <td>{{ $parcel->estimated_value ? 'Rs. ' . number_format($parcel->estimated_value, 2) : __('messages.n_a') }}</td>
                    <td>
                        <span class="badge {{ $parcel->is_casehold ? 'badge-yes' : 'badge-no' }}">
                            {{ $parcel->is_casehold ? __('messages.yes') : __('messages.no') }}
                        </span>
                    </td>
                    <td>
                        <span class="badge {{ $parcel->is_donated ? 'badge-donated' : 'badge-no' }}">
                            {{ $parcel->is_donated ? __('messages.yes') : __('messages.no') }}
                        </span>
                    </td>
                    <td>{{ $parcel->project->title ?? ($parcel->project->name ?? __('messages.n_a')) }}</td>
                    <td>
                        @php
                            $statusClass = 'status-' . strtolower($parcel->status);
                        @endphp
                        <span class="badge {{ $statusClass }}">
                            {{ __('messages.' . strtolower($parcel->status ?: 'draft')) }}
                        </span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        {{ __('messages.page') }} 1 &mdash; {{ __('messages.Land_Acquisition_Management_System') }} &copy; {{ date('Y') }}
    </div>

</body>
</html>
