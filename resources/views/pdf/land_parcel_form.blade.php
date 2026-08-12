<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ __('messages.land_parcel_details') }} &mdash; {{ $parcel->parcel_id }}</title>
    <style>
        @page {
            margin: 45px 36px 55px 36px;
        }

        @if(app()->getLocale()==='si') body {
            font-family: 'notosanssinhala', sans-serif;
            color: #1a1a1a;
            font-size: 8.5px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        @else body {
            font-family: 'Times New Roman', 'Noto Serif', Georgia, serif;
            color: #1a1a1a;
            font-size: 8.5px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        @endif .page-frame {
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
            @if(app()->getLocale()==='si') font-family: 'notosanssinhala', sans-serif;
            @else font-family: 'Times New Roman', serif;
            @endif
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
            @if(app()->getLocale()==='si') font-family: 'notosanssinhala', sans-serif;
            @else font-family: 'Courier New', monospace;
            @endif
            font-size: 9px;
            text-align: center;
        }

        .ref-box strong {
            display: block;
            @if(app()->getLocale()==='si') font-family: 'notosanssinhala', sans-serif;
            @else font-family: 'Times New Roman', serif;
            @endif
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

            <div class="confidential-banner">{{ __('messages.confidential_document') }}</div>

            <!-- Header -->
            <div class="form-header">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 74px; vertical-align: middle;">
                            <div class="emblem-box">
                                {!! app()->getLocale() === 'si' ? "ශ්‍රී ලංකා<br>රජය" : "GOVT.<br>OF SRI<br>LANKA" !!}
                            </div>
                        </td>
                        <td style="vertical-align: top; padding-left: 15px;">
                            <p class="gov-title">{{ __('messages.republic_sri_lanka') }}</p>
                            <p class="ministry-title">{{ __('messages.provincial_council') }}</p>
                            <p class="form-title">{{ __('messages.land_parcel_details') }}</p>
                            <p class="form-subtitle">Issued under the Land Acquisition Management System (LAMS) &mdash; Form LA-01</p>
                        </td>
                        <td style="text-align: right; vertical-align: top; width: 130px;">
                            <div class="ref-box">
                                <strong>{{ __('messages.land_number') }}</strong>
                                <span style="font-size: 11px; font-weight: bold; color: #2d2d2d;">{{ $parcel->parcel_id }}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <table class="meta-strip">
                <tr>
                    <td><strong>{{ __('messages.generated_on') }}:</strong> {{ now()->format('Y-m-d H:i') }}</td>
                    <td style="text-align: center;"><strong>{{ __('messages.provincial_council') }}:</strong> {{ __('messages.provincial_council') }}</td>
                    <td style="text-align: right;"><strong>{{ __('messages.status') }}:</strong> <span class="status-pill">{{ __('messages.' . strtolower($parcel->status ?: 'draft')) }}</span></td>
                </tr>
            </table>

            <!-- Section 1: Identification -->
            <div class="section-title"><span class="section-no">1.</span>{{ __('messages.land_information') }}</div>
            <table class="form-table">
                <tr>
                    <th>{{ __('messages.land_number') }}:</th>
                    <td style="font-weight: bold; color: #2d2d2d;">{{ $parcel->parcel_id }}</td>
                    <th>{{ __('messages.land_name') }}:</th>
                    <td>{{ $parcel->land_name ?? __('messages.n_a') }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.plan_number') }}:</th>
                    <td>{{ $parcel->plan_number ?? __('messages.n_a') }}</td>
                    <th>{{ __('messages.survey_details') }}:</th>
                    <td>{{ $parcel->has_plan ? __('messages.yes') : __('messages.no') }}</td>
                </tr>
            </table>

            <!-- Section 2: Location -->
            <div class="section-title"><span class="section-no">2.</span>{{ __('messages.location_details') }}</div>
            <table class="form-table">
                <tr>
                    <th>{{ __('messages.provincial_council') }}:</th>
                    <td>{{ __('messages.provincial_council') }}</td>
                    <th>{{ __('messages.district') }}:</th>
                    <td>{{ $parcel->district }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.divisional_secretariat') }}:</th>
                    <td>{{ $parcel->divisional_secretariat ?? ($parcel->division ?? __('messages.n_a')) }}</td>
                    <th>{{ __('messages.gn_division') }}:</th>
                    <td>{{ $parcel->grama_niladari_division ?? __('messages.n_a') }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.village') }}:</th>
                    <td>{{ $parcel->village }}</td>
                    <th>GPS Coordinates (Lat, Lon):</th>
                    <td>
                        @if($parcel->latitude && $parcel->longitude)
                        {{ $parcel->latitude }}, {{ $parcel->longitude }}
                        @else
                        {{ __('messages.n_a') }}
                        @endif
                    </td>
                </tr>
            </table>

            <!-- Section 3: Extent & Dimensions -->
            <div class="section-title"><span class="section-no">3.</span>{{ __('messages.extent') }}</div>
            <table class="form-table">
                <tr>
                    <th>{{ __('messages.acres') }}:</th>
                    <td>{{ $parcel->land_size_acers ?? ($parcel->extent_acers ?? 0) }} ac</td>
                    <th>{{ __('messages.roods') }}:</th>
                    <td>{{ $parcel->land_size_roods ?? 0 }} rd</td>
                </tr>
                <tr>
                    <th>{{ __('messages.perches') }}:</th>
                    <td>{{ $parcel->land_size_perches ?? ($parcel->extent_perches ?? 0) }} per</td>
                    <th>{{ __('messages.full_land_area') }}:</th>
                    <td>{{ $parcel->full_land_size ?? __('messages.n_a') }}</td>
                </tr>
            </table>

            <!-- Section 4: Physical Features & Valuation -->
            <div class="section-title"><span class="section-no">4.</span>{{ __('messages.valuation_details') }}</div>
            <table class="form-table">
                <tr>
                    <th>Residential Structures:</th>
                    <td>{{ $parcel->has_residential_houses ? __('messages.yes') : __('messages.no') }}</td>
                    <th>Resident Owner Status:</th>
                    <td>{{ $parcel->is_resident_owner ? __('messages.yes') : __('messages.no') }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.cultivation') }}:</th>
                    <td>{{ $parcel->is_cultivated ? __('messages.yes') : __('messages.no') }}</td>
                    <th>{{ __('messages.cultivation') }} (Crops):</th>
                    <td>{{ $parcel->is_cultivated ? ($parcel->cultivation ?? __('messages.n_a')) : __('messages.n_a') }}</td>
                </tr>
                <tr>
                    <th>Annual Agricultural Income:</th>
                    <td>{{ number_format($parcel->annual_income ?? 0, 2) }} LKR</td>
                    <th>{{ __('messages.estimated_value') }}:</th>
                    <td style="font-weight: bold; color: #2d2d2d;">{{ number_format($parcel->estimated_value ?? 0, 2) }} LKR</td>
                </tr>
                <tr>
                    <th>{{ __('messages.land_type') }}:</th>
                    <td>{{ $parcel->land_type ?? 'Standard' }}</td>
                    <th>{{ __('messages.status') }}:</th>
                    <td style="text-transform: uppercase; font-weight: bold; color: #2d2d2d;">{{ __('messages.' . strtolower($parcel->status ?: 'draft')) }}</td>
                </tr>
            </table>

            <!-- Section 5: Associated Project -->
            <div class="section-title"><span class="section-no">5.</span>{{ __('messages.associated_project') }}</div>
            @if($parcel->project)
            <table class="form-table">
                <tr>
                    <th style="width: 25%;">{{ __('messages.title') }}:</th>
                    <td style="width: 75%; font-weight: bold; color: #2d2d2d;">{{ $parcel->project->title }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.project_id') }}:</th>
                    <td>{{ $parcel->project->project_id }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.purpose') }}:</th>
                    <td>{{ $parcel->project->purpose ?? __('messages.n_a') }}</td>
                </tr>
            </table>
            @else
            <div class="empty-note">
                {{ __('messages.n_a') }}
            </div>
            @endif

            <!-- Section 6: Ownership -->
            <div class="section-title"><span class="section-no">6.</span>{{ __('messages.ownership_details') }}</div>
            @if($parcel->owners && count($parcel->owners) > 0)
            @foreach($parcel->owners as $index => $owner)
            <div class="owner-box">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td colspan="4" style="font-size: 10px; font-weight: bold; color: #2d2d2d; padding-bottom: 4px; border-bottom: 1px solid #cccccc;">
                            {{ __('messages.owner_name') }} #{{ $index + 1 }}: {{ $owner->name }}
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 15%; color: #718096; font-size: 8px; padding-top: 4px;">{{ __('messages.nic') }}:</td>
                        <td style="width: 35%; font-weight: bold; font-size: 8px; padding-top: 4px;">{{ $owner->nic }}</td>
                        <td style="width: 15%; color: #718096; font-size: 8px; padding-top: 4px;">{{ __('messages.contact_number') }}:</td>
                        <td style="width: 35%; font-weight: bold; font-size: 8px; padding-top: 4px;">{{ $owner->contact }}</td>
                    </tr>
                    <tr>
                        <td style="color: #718096; font-size: 8px; vertical-align: top; padding-top: 2px;">{{ __('messages.address') }}:</td>
                        <td colspan="3" style="font-size: 8px; padding-top: 2px;">{{ $owner->address }}</td>
                    </tr>
                </table>
            </div>
            @endforeach
            @else
            <div class="empty-note">
                {{ __('messages.n_a') }}
            </div>
            @endif

            <!-- Section 7: Administrative Review & Declarations -->
            <div class="section-title"><span class="section-no">7.</span>{{ __('messages.remarks') }} &amp; {{ __('messages.reports') }}</div>
            <table class="form-table" style="margin-bottom: 6px;">
                <tr>
                    <th style="vertical-align: top; width: 25%;">{{ __('messages.remarks') }}:</th>
                    <td style="height: 40px; vertical-align: top; width: 75%;">{{ $parcel->remarks ?? __('messages.n_a') }}</td>
                </tr>
            </table>

            <div class="declaration">
                @if(app()->getLocale() === 'si')
                මෙම ලේඛනය භූමි අත්පත් කරගැනීමේ පනතේ විධිවිධානවලට අනුකූලව නිකුත් කරනු ලබන අතර දකුණු පළාත් ප්‍රධාන අමාත්‍යාංශයේ භූමි අත්පත් කරගැනීමේ කළමනාකරණ පද්ධතිය (LAMS) මඟින් ජනනය කරන ලද නිල වාර්තාවක් වේ. මෙහි සටහන් කර ඇති තොරතුරු අත්සන් කරන ලද නිලධාරීන්ගේ දැනුම පරිදි සත්‍ය සහ නිවැරදි බව සහතික කරන අතර, මෙම පෝරමය ස්ථිර නඩු ගොනුවේ කොටසක් ලෙස තබා ගත යුතුය.
                @else
                This document is issued in accordance with the provisions of the Land Acquisition Act and constitutes an official
                record generated through the Land Acquisition Management System (LAMS) of the Chief Ministry of Southern Province.
                It is certified that the particulars recorded herein are true and correct to the best of the knowledge of the
                undersigned officers, and this form is to be retained as part of the permanent case file.
                @endif
            </div>

            <!-- Signature Boxes -->
            <table class="signature-table">
                <tr>
                    <td>
                        <div class="signature-line"></div>
                        <p class="signature-role">{{ app()->getLocale() === 'si' ? 'සංවර්ධන නිලධාරී' : 'Development Officer' }}</p>
                        <p class="signature-meta">{{ app()->getLocale() === 'si' ? 'දිනය' : 'Date' }}: ..... / ..... / 20.....</p>
                        <p class="seal-note">{{ app()->getLocale() === 'si' ? '(නිල මුද්‍රාව)' : '(Official Seal)' }}</p>
                    </td>
                    <td>
                        <div class="signature-line"></div>
                        <p class="signature-role">{{ app()->getLocale() === 'si' ? 'අංශ ප්‍රධානී (ඉඩම්)' : 'Head of Branch (Land)' }}</p>
                        <p class="signature-meta">{{ app()->getLocale() === 'si' ? 'දිනය' : 'Date' }}: ..... / ..... / 20.....</p>
                        <p class="seal-note">{{ app()->getLocale() === 'si' ? '(නිල මුද්‍රාව)' : '(Official Seal)' }}</p>
                    </td>
                    <td>
                        <div class="signature-line"></div>
                        <p class="signature-role">{{ app()->getLocale() === 'si' ? 'පාලන නිලධාරී' : 'Administrative Officer' }}</p>
                        <p class="signature-meta">{{ app()->getLocale() === 'si' ? 'දිනය' : 'Date' }}: ..... / ..... / 20.....</p>
                        <p class="seal-note">{{ app()->getLocale() === 'si' ? '(නිල මුද්‍රාව)' : '(Official Seal)' }}</p>
                    </td>
                </tr>
            </table>

        </div>
    </div>

    <div class="footer" style="font-family: {{ app()->getLocale() === 'si' ? 'notosanssinhala, sans-serif' : 'Times New Roman, serif' }};">
        <div>Form LA-01 &mdash; {{ __('messages.Land_Acquisition_Management_System') }} &copy; {{ date('Y') }}</div>
        <div class="footer-line-2">{{ app()->getLocale() === 'si' ? 'අතිශය රහස්‍යයි - ශ්‍රී ලංකා රජය' : 'Strictly Confidential - Government of Sri Lanka' }}</div>
    </div>

</body>

</html>