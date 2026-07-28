<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Land Acquisition Application Form - {{ $parcel->parcel_id }}</title>
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

        /* ---------- Watermark-style confidentiality banner ---------- */
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

        /* ---------- Header with State Emblem ---------- */
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

        .form-subtitle {
            margin: 2px 0 0 0;
            color: #555555;
            font-size: 9px;
            font-style: italic;
        }

        .ref-box {
            border: 1px solid #2d2d2d;
            padding: 6px;
            background-color: #f5f5f5;
            font-family: 'Courier New', monospace;
            font-size: 9px;
            text-align: center;
        }

        .ref-box strong {
            display: block;
            font-family: 'Times New Roman', serif;
            font-size: 7.5px;
            letter-spacing: 0.5px;
            color: #2d2d2d;
            margin-bottom: 2px;
        }

        /* ---------- Meta strip ---------- */
        .meta-strip {
            width: 100%;
            margin-top: 8px;
            margin-bottom: 12px;
            border-collapse: collapse;
            font-size: 8.5px;
            color: #4a4a4a;
        }

        .meta-strip td {
            padding: 2px 0;
        }

        .status-pill {
            font-weight: bold;
            color: #2d2d2d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* ---------- Section headers ---------- */
        .section-title {
            color: #1a1a1a;
            font-size: 10.5px;
            font-weight: bold;
            padding: 4px 0 5px 0;
            margin: 16px 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            border-top: 1px solid #1a1a1a;
            border-bottom: 1px solid #1a1a1a;
        }

        .section-title .section-no {
            display: inline-block;
            margin-right: 4px;
        }

        /* ---------- Tables ---------- */
        .form-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .form-table th {
            background-color: #eeeeee;
            color: #2d2d2d;
            font-weight: bold;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #cccccc;
            font-size: 9px;
            width: 25%;
        }

        .form-table td {
            padding: 6px 8px;
            border: 1px solid #cccccc;
            font-size: 9px;
            color: #1a1a1a;
            width: 25%;
        }

        .owner-box {
            margin-bottom: 8px;
            border: 1px solid #cccccc;
            padding: 8px;
            background-color: #f7f7f7;
        }

        .empty-note {
            border: 1px dashed #cccccc;
            padding: 8px;
            text-align: center;
            font-size: 10px;
            color: #777777;
            background-color: #f7f7f7;
            margin-bottom: 10px;
            font-style: italic;
        }

        /* ---------- Declaration ---------- */
        .declaration {
            font-size: 9px;
            color: #333333;
            border: 1px solid #cccccc;
            background-color: #f7f7f7;
            padding: 8px 10px;
            margin: 10px 0 16px 0;
            text-align: justify;
        }

        /* ---------- Signatures ---------- */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 22px;
        }

        .signature-table td {
            width: 33.33%;
            text-align: center;
            vertical-align: top;
            padding: 0 6px;
        }

        .signature-line {
            height: 36px;
            border-bottom: 1px solid #2d2d2d;
            margin-bottom: 4px;
        }

        .signature-role {
            margin: 0;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .signature-meta {
            margin: 2px 0 0 0;
            font-size: 8px;
            color: #718096;
        }

        .seal-note {
            margin: 6px 0 0 0;
            font-size: 7.5px;
            color: #a0aec0;
            font-style: italic;
        }

        /* ---------- Footer ---------- */
        .footer {
            position: fixed;
            bottom: -55px;
            left: 0px;
            right: 0px;
            height: 40px;
            text-align: center;
            font-size: 7.5px;
            color: #8a8a8a;
            border-top: 1px solid #cccccc;
            padding-top: 6px;
        }

        .footer .footer-line-2 {
            margin-top: 2px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #2d2d2d;
        }
    </style>
</head>
<body>

    <div class="page-frame">
        <div class="inner-frame">

            <div class="confidential-banner">Official Document &mdash; For Administrative Use Only</div>

            <!-- Header -->
            <div class="form-header">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 74px; vertical-align: middle;">
                            <div class="emblem-box">
                                GOVT.<br>OF SRI<br>LANKA
                            </div>
                        </td>
                        <td style="vertical-align: top; padding-left: 15px;">
                            <p class="gov-title">Democratic Socialist Republic of Sri Lanka</p>
                            <p class="ministry-title">Chief Ministry of Southern Province</p>
                            <p class="form-title">Land Acquisition Application Form</p>
                            <p class="form-subtitle">Issued under the Land Acquisition Management System (LAMS) &mdash; Form LA-01</p>
                        </td>
                        <td style="text-align: right; vertical-align: top; width: 130px;">
                            <div class="ref-box">
                                <strong>LAND / FILE NUMBER</strong>
                                <span style="font-size: 11px; font-weight: bold; color: #2d2d2d;">{{ $parcel->parcel_id }}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <table class="meta-strip">
                <tr>
                    <td><strong>Date of Issue:</strong> {{ now()->format('Y-m-d H:i') }}</td>
                    <td style="text-align: center;"><strong>Province:</strong> Southern Province</td>
                    <td style="text-align: right;"><strong>Acquisition Status:</strong> <span class="status-pill">{{ $parcel->status }}</span></td>
                </tr>
            </table>

            <!-- Section 1: Identification -->
            <div class="section-title"><span class="section-no">1.</span>Land Identification &amp; Classification</div>
            <table class="form-table">
                <tr>
                    <th>Land Number (Parcel ID):</th>
                    <td style="font-weight: bold; color: #2d2d2d;">{{ $parcel->parcel_id }}</td>
                    <th>Land Name / Alias:</th>
                    <td>{{ $parcel->land_name ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Registered Plan Number:</th>
                    <td>{{ $parcel->plan_number ?? 'No Plan Registered' }}</td>
                    <th>Has Survey Plan:</th>
                    <td>{{ $parcel->has_plan ? 'Yes (Verified)' : 'No / Pending Survey' }}</td>
                </tr>
            </table>

            <!-- Section 2: Location -->
            <div class="section-title"><span class="section-no">2.</span>Geographical &amp; Administrative Location</div>
            <table class="form-table">
                <tr>
                    <th>Province:</th>
                    <td>{{ $parcel->province ?? 'Southern' }}</td>
                    <th>District:</th>
                    <td>{{ $parcel->district }}</td>
                </tr>
                <tr>
                    <th>DS Division:</th>
                    <td>{{ $parcel->divisional_secretariat ?? ($parcel->division ?? 'N/A') }}</td>
                    <th>Grama Niladhari Division:</th>
                    <td>{{ $parcel->grama_niladari_division ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Village:</th>
                    <td>{{ $parcel->village }}</td>
                    <th>GPS Coordinates (Lat, Lon):</th>
                    <td>
                        @if($parcel->latitude && $parcel->longitude)
                            {{ $parcel->latitude }}, {{ $parcel->longitude }}
                        @else
                            Not Registered
                        @endif
                    </td>
                </tr>
            </table>

            <!-- Section 3: Extent & Dimensions -->
            <div class="section-title"><span class="section-no">3.</span>Physical Extent &amp; Measurement</div>
            <table class="form-table">
                <tr>
                    <th>Extent in Acres:</th>
                    <td>{{ $parcel->land_size_acers ?? ($parcel->extent_acers ?? 0) }} ac</td>
                    <th>Extent in Roods:</th>
                    <td>{{ $parcel->land_size_roods ?? 0 }} r</td>
                </tr>
                <tr>
                    <th>Extent in Perches:</th>
                    <td>{{ $parcel->land_size_perches ?? ($parcel->extent_perches ?? 0) }} per</td>
                    <th>Full Size Description:</th>
                    <td>{{ $parcel->full_land_size ?? 'N/A' }}</td>
                </tr>
            </table>

            <!-- Section 4: Physical Features & Valuation -->
            <div class="section-title"><span class="section-no">4.</span>Land Use, Structures &amp; Valuation</div>
            <table class="form-table">
                <tr>
                    <th>Residential Structures:</th>
                    <td>{{ $parcel->has_residential_houses ? 'Yes (Structures Present)' : 'No Structures' }}</td>
                    <th>Resident Owner Status:</th>
                    <td>{{ $parcel->is_resident_owner ? 'Resident Owner' : 'Non-Resident Owner' }}</td>
                </tr>
                <tr>
                    <th>Agricultural Cultivation:</th>
                    <td>{{ $parcel->is_cultivated ? 'Cultivated' : 'Uncultivated / Standard' }}</td>
                    <th>Cultivated Crops:</th>
                    <td>{{ $parcel->is_cultivated ? ($parcel->cultivation ?? 'N/A') : 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Annual Agricultural Income:</th>
                    <td>{{ number_format($parcel->annual_income ?? 0, 2) }} LKR</td>
                    <th>Estimated Land Value:</th>
                    <td style="font-weight: bold; color: #2d2d2d;">{{ number_format($parcel->estimated_value ?? 0, 2) }} LKR</td>
                </tr>
                <tr>
                    <th>Land Category Type:</th>
                    <td>{{ $parcel->land_type ?? 'Standard' }}</td>
                    <th>Acquisition Stage Status:</th>
                    <td style="text-transform: uppercase; font-weight: bold; color: #2d2d2d;">{{ $parcel->status }}</td>
                </tr>
            </table>

            <!-- Section 5: Associated Project -->
            <div class="section-title"><span class="section-no">5.</span>Public Project Association</div>
            @if($parcel->project)
                <table class="form-table">
                    <tr>
                        <th style="width: 25%;">Project Title:</th>
                        <td style="width: 75%; font-weight: bold; color: #2d2d2d;">{{ $parcel->project->title }}</td>
                    </tr>
                    <tr>
                        <th>Project Reference Code:</th>
                        <td>{{ $parcel->project->project_id }}</td>
                    </tr>
                    <tr>
                        <th>Declared Acquisition Purpose:</th>
                        <td>{{ $parcel->project->purpose ?? 'N/A' }}</td>
                    </tr>
                </table>
            @else
                <div class="empty-note">
                    No public project association registered. This land parcel is listed for future acquisition or general cataloging.
                </div>
            @endif

            <!-- Section 6: Ownership -->
            <div class="section-title"><span class="section-no">6.</span>Owner(s) Declarations</div>
            @if($parcel->owners && count($parcel->owners) > 0)
                @foreach($parcel->owners as $index => $owner)
                    <div class="owner-box">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td colspan="4" style="font-size: 10px; font-weight: bold; color: #2d2d2d; padding-bottom: 4px; border-bottom: 1px solid #cccccc;">
                                    Owner #{{ $index + 1 }}: {{ $owner->name }}
                                </td>
                            </tr>
                            <tr>
                                <td style="width: 15%; color: #718096; font-size: 8px; padding-top: 4px;">NIC / Identity:</td>
                                <td style="width: 35%; font-weight: bold; font-size: 8px; padding-top: 4px;">{{ $owner->nic }}</td>
                                <td style="width: 15%; color: #718096; font-size: 8px; padding-top: 4px;">Contact:</td>
                                <td style="width: 35%; font-weight: bold; font-size: 8px; padding-top: 4px;">{{ $owner->contact }}</td>
                            </tr>
                            <tr>
                                <td style="color: #718096; font-size: 8px; vertical-align: top; padding-top: 2px;">Address:</td>
                                <td colspan="3" style="font-size: 8px; padding-top: 2px;">{{ $owner->address }}</td>
                            </tr>
                        </table>
                    </div>
                @endforeach
            @else
                <div class="empty-note">
                    No verified owners registered. Ownership details pending legal notice validation.
                </div>
            @endif

            <!-- Section 7: Administrative Review & Declarations -->
            <div class="section-title"><span class="section-no">7.</span>Administrative Review &amp; Declarations</div>
            <table class="form-table" style="margin-bottom: 6px;">
                <tr>
                    <th style="vertical-align: top; width: 25%;">Remarks / Exceptions:</th>
                    <td style="height: 40px; vertical-align: top; width: 75%;">{{ $parcel->remarks ?? 'No remarks registered.' }}</td>
                </tr>
            </table>

            <div class="declaration">
                This document is issued in accordance with the provisions of the Land Acquisition Act and constitutes an official
                record generated through the Land Acquisition Management System (LAMS) of the Chief Ministry of Southern Province.
                It is certified that the particulars recorded herein are true and correct to the best of the knowledge of the
                undersigned officers, and this form is to be retained as part of the permanent case file.
            </div>

            <!-- Signature Boxes -->
            <table class="signature-table">
                <tr>
                    <td>
                        <div class="signature-line"></div>
                        <p class="signature-role">Development Officer</p>
                        <p class="signature-meta">Date: ..... / ..... / 20.....</p>
                        <p class="seal-note">(Official Seal)</p>
                    </td>
                    <td>
                        <div class="signature-line"></div>
                        <p class="signature-role">Head of Branch (Land)</p>
                        <p class="signature-meta">Date: ..... / ..... / 20.....</p>
                        <p class="seal-note">(Official Seal)</p>
                    </td>
                    <td>
                        <div class="signature-line"></div>
                        <p class="signature-role">Administrative Officer</p>
                        <p class="signature-meta">Date: ..... / ..... / 20.....</p>
                        <p class="seal-note">(Official Seal)</p>
                    </td>
                </tr>
            </table>

        </div>
    </div>

    <div class="footer">
        <div>Form LA-01 &mdash; Chief Ministry of Southern Province, Land Acquisition Management System &copy; {{ date('Y') }}</div>
        <div class="footer-line-2">Strictly Confidential &mdash; Government of Sri Lanka</div>
    </div>

</body>
</html>