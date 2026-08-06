<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Property Owner Profile - {{ $owner->owner_id }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
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
                    <h1>Property Owner Profile</h1>
                    <p>Owner ID: {{ $owner->owner_id }}</p>
                </td>
                <td style="text-align: right;">
                    <p>Export Date: {{ date('Y-m-d H:i:s') }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">Personal Information</div>
    <table class="info-grid">
        <tr>
            <td class="label">Full Name</td>
            <td>{{ $owner->name }}</td>
            <td class="label">NIC</td>
            <td>{{ $owner->nic ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Date of Birth</td>
            <td>{{ $owner->date_of_birth ?? 'N/A' }}</td>
            <td class="label">Occupation</td>
            <td>{{ $owner->occupation ?? 'N/A' }}</td>
        </tr>
    </table>

    <div class="section-title">Contact Details</div>
    <table class="info-grid">
        <tr>
            <td class="label">Contact Number</td>
            <td>{{ $owner->contact ?? 'N/A' }}</td>
            <td class="label">Email</td>
            <td>{{ $owner->email ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Address</td>
            <td colspan="3">{{ $owner->address }}</td>
        </tr>
    </table>

    <div class="section-title">Owned Land Parcels</div>
    <table class="table">
        <thead>
            <tr>
                <th>Parcel ID</th>
                <th>District</th>
                <th>Division</th>
                <th>Village</th>
                <th>Extent</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($owner->landParcels as $parcel)
                <tr>
                    <td>{{ $parcel->parcel_id }}</td>
                    <td>{{ $parcel->district }}</td>
                    <td>{{ $parcel->divisional_secretariat ?? ($parcel->division ?? 'N/A') }}</td>
                    <td>{{ $parcel->village }}</td>
                    <td>{{ $parcel->land_size_acers ?? ($parcel->extent_acers ?? 0) }} ac, {{ $parcel->land_size_perches ?? ($parcel->extent_perches ?? 0) }} per</td>
                    <td><span class="badge status-badge">{{ ucfirst($parcel->status) }}</span></td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #718096;">No land parcels assigned to this owner.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">Compensation History</div>
    <table class="table">
        <thead>
            <tr>
                <th>Compensation ID</th>
                <th>Land Parcel</th>
                <th>Amount</th>
                <th>Approved Date</th>
                <th>Payment Date</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($owner->compensations as $compensation)
                <tr>
                    <td>{{ $compensation->compensation_id }}</td>
                    <td>{{ $compensation->landParcel?->parcel_id ?? 'N/A' }}</td>
                    <td>₨ {{ number_format($compensation->amount, 2) }}</td>
                    <td>{{ $compensation->approved_date ?? 'N/A' }}</td>
                    <td>{{ $compensation->payment_date ?? 'N/A' }}</td>
                    <td><span class="badge status-badge">{{ ucfirst($compensation->status) }}</span></td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #718096;">No compensation records found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- <div class="section-title">Uploaded Documents</div>
    <table class="table">
        <thead>
            <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Upload Date</th>
                <th>Size</th>
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
                    <td colspan="5" style="text-align: center; color: #718096;">No documents uploaded.</td>
                </tr>
            @endforelse
        </tbody>
    </table> -->

    <div class="footer">
        <p>Southern Province Land Acquisition Management System</p>
    </div>
</body>
</html>
