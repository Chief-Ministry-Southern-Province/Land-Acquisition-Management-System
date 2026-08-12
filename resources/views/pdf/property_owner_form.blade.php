<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ __('messages.property_owner_details') }} - {{ $owner->owner_id }}</title>
    <style>
        @if(app()->getLocale()==='si') body, table, th, td, div, p, span {
            font-family: 'notosanssinhala', sans-serif;
        }

        body {
            color: #333333;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }

        @else body, table, th, td, div, p, span {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        body {
            color: #333333;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }

        @endif .header {
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

        .section-title {
            color: #1a365d;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-top: 25px;
            margin-bottom: 12px;
        }

        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .info-grid td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
        }

        .info-grid td.label {
            background-color: #f7fafc;
            font-weight: bold;
            color: #4a5568;
            width: 25%;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
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

        .status-badge {
            background-color: #def7ec;
            color: #03543f;
        }

        .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #718096;
        }
    </style>
</head>

<body>
    <div class="header">
        <table>
            <tr>
                <td>
                    <h1>{{ __('messages.property_owner_details') }}</h1>
                    <p>{{ __('messages.owner_id') }}: {{ $owner->owner_id }}</p>
                </td>
                <td style="text-align: right;">
                    <p>{{ __('messages.generated_on') }}: {{ date('Y-m-d H:i:s') }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">{{ __('messages.personal_information') }}</div>
    <table class="info-grid">
        <tr>
            <td class="label">{{ __('messages.full_name') }}</td>
            <td>{{ $owner->name }}</td>
            <td class="label">{{ __('messages.nic') }}</td>
            <td>{{ $owner->nic ?? __('messages.n_a') }}</td>
        </tr>
        <tr>
            <td class="label">{{ __('messages.date_of_birth') }}</td>
            <td>{{ $owner->date_of_birth ?? __('messages.n_a') }}</td>
            <td class="label">{{ __('messages.occupation') }}</td>
            <td>{{ $owner->occupation ?? __('messages.n_a') }}</td>
        </tr>
    </table>

    <div class="section-title">{{ __('messages.contact_number') }}</div>
    <table class="info-grid">
        <tr>
            <td class="label">{{ __('messages.contact_number') }}</td>
            <td>{{ $owner->contact ?? __('messages.n_a') }}</td>
            <td class="label">{{ __('messages.email') }}</td>
            <td>{{ $owner->email ?? __('messages.n_a') }}</td>
        </tr>
        <tr>
            <td class="label">{{ __('messages.address') }}</td>
            <td colspan="3">{{ $owner->address }}</td>
        </tr>
    </table>

    <div class="section-title">{{ __('messages.land_parcels') }}</div>
    <table class="table">
        <thead>
            <tr>
                <th>{{ __('messages.land_number') }}</th>
                <th>{{ __('messages.district') }}</th>
                <th>{{ __('messages.divisional_secretariat') }}</th>
                <th>{{ __('messages.village') }}</th>
                <th>{{ __('messages.extent') }}</th>
                <th>{{ __('messages.status') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse($owner->landParcels as $parcel)
            <tr>
                <td>{{ $parcel->parcel_id }}</td>
                <td>{{ $parcel->district }}</td>
                <td>{{ $parcel->divisional_secretariat ?? ($parcel->division ?? __('messages.n_a')) }}</td>
                <td>{{ $parcel->village }}</td>
                <td>{{ $parcel->land_size_acers ?? ($parcel->extent_acers ?? 0) }} {{ __('messages.acres') }}, {{ $parcel->land_size_perches ?? ($parcel->extent_perches ?? 0) }} {{ __('messages.perches') }}</td>
                <td><span class="badge status-badge">{{ __('messages.' . strtolower($parcel->status ?: 'draft')) }}</span></td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; color: #718096;">{{ __('messages.n_a') }}</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">{{ __('messages.compensation_details') }}</div>
    <table class="table">
        <thead>
            <tr>
                <th>{{ __('messages.compensation') }} ID</th>
                <th>{{ __('messages.land_number') }}</th>
                <th>{{ __('messages.compensation_amount') }}</th>
                <th>{{ __('messages.approval_date') }}</th>
                <th>{{ __('messages.payment_date') }}</th>
                <th>{{ __('messages.status') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse($owner->compensations as $compensation)
            <tr>
                <td>{{ $compensation->compensation_id }}</td>
                <td>{{ $compensation->landParcel?->parcel_id ?? __('messages.n_a') }}</td>
                <td>₨ {{ number_format($compensation->amount, 2) }}</td>
                <td>{{ $compensation->approved_date }}</td>
                <td>{{ $compensation->payment_date }}</td>
                <td><span class="badge status-badge">{{ __('messages.' . strtolower($compensation->status ?: 'draft')) }}</span></td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; color: #718096;">{{ __('messages.n_a') }}</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">{{ __('messages.documents') }}</div>
    <table class="table">
        <thead>
            <tr>
                <th>{{ app()->getLocale() === 'si' ? 'ලේඛන නාමය' : 'Document Name' }}</th>
                <th>{{ app()->getLocale() === 'si' ? 'වර්ගය' : 'Category' }}</th>
                <th>{{ app()->getLocale() === 'si' ? 'වර්ගය (ගොනු)' : 'Type' }}</th>
                <th>{{ app()->getLocale() === 'si' ? 'උඩුගත කළ දිනය' : 'Upload Date' }}</th>
                <th>{{ app()->getLocale() === 'si' ? 'ප්‍රමාණය' : 'Size' }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse($owner->documents as $doc)
            <tr>
                <td>{{ $doc->original_filename }}</td>
                <td>{{ $doc->document_category }}</td>
                <td>{{ strtoupper(str_replace('.', '', $doc->file_type)) }}</td>
                <td>{{ $doc->upload_date }}</td>
                <td>{{ $doc->file_size }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center; color: #718096;">
                    {{ app()->getLocale() === 'si' ? 'උඩුගත කරන ලද ලේඛන නොමැත.' : 'No documents uploaded.' }}
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>{{ __('messages.Land_Acquisition_Management_System') }}</p>
    </div>
</body>

</html>