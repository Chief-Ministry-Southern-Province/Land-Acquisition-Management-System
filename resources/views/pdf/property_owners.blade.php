<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Property Owners Report</title>
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
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            text-align: center;
            font-size: 8px;
            color: #718096;
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
                    <h1>Property Owners Report</h1>
                    <p>Southern Province Land Acquisition Management System</p>
                </td>
                <td style="text-align: right;">
                    <p>Export Date: {{ date('Y-m-d H:i:s') }}</p>
                </td>
            </tr>
        </table>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Owner ID</th>
                <th>Full Name</th>
                <th>NIC</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Parcels</th>
                <th>Total Comp.</th>
            </tr>
        </thead>
        <tbody>
            @foreach($owners as $owner)
                <tr>
                    <td>{{ $owner->owner_id }}</td>
                    <td>{{ $owner->name }}</td>
                    <td>{{ $owner->nic ?? 'N/A' }}</td>
                    <td>{{ $owner->contact ?? 'N/A' }}</td>
                    <td>{{ $owner->address }}</td>
                    <td>{{ $owner->landParcels->count() }}</td>
                    <td>₨ {{ number_format($owner->compensations->sum('amount'), 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Page 1
    </div>
</body>
</html>
