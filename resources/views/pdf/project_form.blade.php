<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ __('messages.project_details') }} - {{ $project->project_id }}</title>
    <style>
        @page {
            margin: 45px 36px 55px 36px;
        }

        @if(app()->getLocale()==='si') body {
            font-family: 'notosanssinhala', sans-serif;
            color: #1a1a1a;
            font-size: 9px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        @else body {
            font-family: 'Times New Roman', 'Noto Serif', Georgia, serif;
            color: #1a1a1a;
            font-size: 9px;
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

        .meta-strip {
            width: 100%;
            margin-top: 8px;
            margin-bottom: 12px;
            border-collapse: collapse;
            font-size: 9px;
            color: #4a4a4a;
        }

        .meta-strip td {
            padding: 2px 0;
        }

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
            font-size: 9.5px;
        }

        .form-table td {
            padding: 6px 8px;
            border: 1px solid #cccccc;
            font-size: 9.5px;
            color: #1a1a1a;
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

        .footer {
            position: fixed;
            bottom: -40px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 6px;
            @if(app()->getLocale()==='si') font-family: 'notosanssinhala', sans-serif;
            @else font-family: 'Times New Roman', 'Noto Serif', Georgia, serif;
            @endif
        }
    </style>
</head>

<body>

    <div class="page-frame">
        <div class="inner-frame">
            <div class="confidential-banner">{{ __('messages.confidential_document') }}</div>

            <div class="form-header">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 75px; padding: 0;">
                            <div class="emblem-box">{{ app()->getLocale() === 'si' ? 'රාජ්‍ය ලාංඡනය' : 'STATE EMBLEM' }}</div>
                        </td>
                        <td style="padding: 0; padding-left: 10px; vertical-align: middle;">
                            <h4 class="gov-title">{{ __('messages.republic_sri_lanka') }}</h4>
                            <h2 class="ministry-title">{{ __('messages.provincial_council') }}</h2>
                            <h1 class="form-title">{{ __('messages.land_acquisition_project_report') }}</h1>
                        </td>
                        <td style="width: 120px; padding: 0; text-align: right; vertical-align: middle;">
                            <div class="ref-box">
                                <strong>{{ __('messages.project_id') }}</strong>
                                {{ $project->project_id }}
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <table class="meta-strip">
                <tr>
                    <td><strong>{{ __('messages.generated_on') }}:</strong> {{ date('Y-m-d H:i:s') }}</td>
                    <td style="text-align: right;"><strong>{{ __('messages.status') }}:</strong> {{ __('messages.' . strtolower($project->case_status ?: 'draft')) }}</td>
                </tr>
            </table>

            <!-- Section 1: General Information -->
            <div class="section-title">{{ __('messages.general_information') }}</div>
            <table class="form-table">
                <tr>
                    <th style="width: 30%;">{{ __('messages.project_id') }}:</th>
                    <td style="width: 70%; font-weight: bold;">{{ $project->project_id }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.title') }}:</th>
                    <td>{{ $project->title }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.purpose_of_acquisition') }}:</th>
                    <td>{{ $project->purpose }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.requesting_institution') }}:</th>
                    <td>{{ $project->institution ?? __('messages.n_a') }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.institution_address') }}:</th>
                    <td>{{ $project->institution_address ?? __('messages.n_a') }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.total_extent_to_acquire') }}:</th>
                    <td>
                        {{ $project->land_area_to_be_acquired_acers ?? 0 }} {{ __('messages.acres') }},
                        {{ $project->land_area_to_be_acquired_roods ?? 0 }} {{ __('messages.roods') }},
                        {{ $project->land_area_to_be_acquired_perches ?? 0 }} {{ __('messages.perches') }}
                        ({{ __('messages.total_extent_to_acquire') }}: {{ $project->full_land_area_to_be_acquired ?? 0 }} {{ __('messages.perches') }})
                    </td>
                </tr>
                <tr>
                    <th>{{ __('messages.temporary_relocation') }}:</th>
                    <td>{{ $project->are_residents_moved_temp ? __('messages.required') : __('messages.not_required') }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.approval_date') }}:</th>
                    <td>{{ $project->approval_date ? $project->approval_date->format('Y-m-d') : __('messages.n_a') }}</td>
                </tr>
                <tr>
                    <th>{{ __('messages.remarks') }}:</th>
                    <td>{{ $project->remarks ?? __('messages.n_a') }}</td>
                </tr>
            </table>

            <!-- Section 2: Statutory Compliance -->
            <div class="section-title">{{ __('messages.legal_milestone_status') }}</div>
            <table class="form-table">
                <tr>
                    <td style="width: 80%; font-weight: bold;">{{ __('messages.section_20') }}:</td>
                    <td style="width: 20%; text-align: center; font-weight: bold;">
                        @if(is_null($project->section20_observation))
                        {{ __('messages.n_a') }}
                        @elseif($project->section20_observation)
                        {{ __('messages.yes') }}
                        @else
                        {{ __('messages.no') }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">{{ __('messages.section_21') }}:</td>
                    <td style="text-align: center; font-weight: bold;">
                        @if(is_null($project->section21_secretary_report))
                        {{ __('messages.n_a') }}
                        @elseif($project->section21_secretary_report)
                        {{ __('messages.yes') }}
                        @else
                        {{ __('messages.no') }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div style="font-weight: bold;">{{ __('messages.section_22') }}:</div>
                        <div style="margin-top: 4px; padding-left: 10px; color: #444;">{{ $project->section22_secretary_recommendation ?? __('messages.n_a') }}</div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div style="font-weight: bold;">{{ __('messages.section_23') }}:</div>
                        <div style="margin-top: 4px; padding-left: 10px; color: #444;">{{ $project->section23_valuation_recommendation ?? __('messages.n_a') }}</div>
                    </td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">{{ __('messages.section_24') }}:</td>
                    <td style="text-align: center; font-weight: bold;">
                        @if(is_null($project->section24_decision_remarks))
                        {{ __('messages.n_a') }}
                        @elseif($project->section24_decision_remarks)
                        {{ __('messages.yes') }}
                        @else
                        {{ __('messages.no') }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div style="font-weight: bold;">{{ __('messages.section_25') }}:</div>
                        <div style="margin-top: 4px; padding-left: 10px; color: #444;">{{ $project->section25_additional_conditions ?? __('messages.n_a') }}</div>
                    </td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">{{ __('messages.section_26') }}:</td>
                    <td style="text-align: center; font-weight: bold;">
                        @if(is_null($project->section26_final_recommendation))
                        {{ __('messages.n_a') }}
                        @elseif($project->section26_final_recommendation)
                        {{ __('messages.yes') }}
                        @else
                        {{ __('messages.no') }}
                        @endif
                    </td>
                </tr>
            </table>

            <!-- Section 3: Associated Land Parcels -->
            <div class="section-title">{{ app()->getLocale() === 'si' ? 'අදාළ ඉඩම් කොටස්' : 'Associated Land Parcels' }}</div>
            @if($project->landParcels && $project->landParcels->count() > 0)
            <table class="form-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">{{ app()->getLocale() === 'si' ? 'කොටස් හැඳුනුම්පත' : 'Parcel ID' }}</th>
                        <th style="width: 35%;">{{ app()->getLocale() === 'si' ? 'නම සහ පිහිටීම' : 'Name / Location' }}</th>
                        <th style="width: 25%;">{{ app()->getLocale() === 'si' ? 'ප්‍රමාණය' : 'Extent' }}</th>
                        <th style="width: 15%;">{{ app()->getLocale() === 'si' ? 'තත්ත්වය' : 'Status' }}</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($project->landParcels as $parcel)
                    <tr>
                        <td style="font-weight: bold;">{{ $parcel->parcel_id }}</td>
                        <td>
                            {{ $parcel->land_name ?? __('messages.n_a') }}<br />
                            <span style="font-size: 8px; color: #666;">{{ $parcel->village ?? '' }}, {{ $parcel->district ?? '' }}</span>
                        </td>
                        <td>{{ $parcel->land_size_acers ?? 0 }} A, {{ $parcel->land_size_perches ?? 0 }} P</td>
                        <td>{{ ucfirst($parcel->status) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @else
            <div class="empty-note">
                {{ app()->getLocale() === 'si' ? 'මෙම ව්‍යාපෘතිය යටතේ ලියාපදිංචි කර ඇති ඉඩම් කොටස් නොමැත.' : 'No land parcels registered under this project.' }}
            </div>
            @endif

            <!-- Section 4: Financial Summary -->
            <div class="section-title">{{ app()->getLocale() === 'si' ? 'මූල්‍ය සාරාංශය' : 'Financial Summary' }}</div>
            @php
            $totalEstimatedValue = $project->landParcels ? $project->landParcels->sum('estimated_value') : 0;
            $totalValuationAssessed = $project->landParcels ? $project->landParcels->flatMap->valuations->sum('total_valuation') : 0;
            $totalCompensationCalculated = $project->landParcels ? $project->landParcels->flatMap->compensations->sum('amount') : 0;
            $totalDisbursedPayments = $project->landParcels ? $project->landParcels->flatMap->compensations->flatMap->payments->sum('amount_paid') : 0;
            @endphp
            <table class="form-table">
                <tr>
                    <th style="width: 50%;">{{ app()->getLocale() === 'si' ? 'මුළු ඇස්තමේන්තුගත වටිනාකම' : 'Total Estimated Value' }}:</th>
                    <td style="width: 50%; font-weight: bold;">₨ {{ number_format($totalEstimatedValue, 2) }}</td>
                </tr>
                <tr>
                    <th>{{ app()->getLocale() === 'si' ? 'තක්සේරු කරන ලද මුළු වටිනාකම' : 'Total Valuation Assessed' }}:</th>
                    <td style="font-weight: bold; color: #065f46;">₨ {{ number_format($totalValuationAssessed, 2) }}</td>
                </tr>
                <tr>
                    <th>{{ app()->getLocale() === 'si' ? 'ගණනය කරන ලද මුළු වන්දිය' : 'Total Compensation Calculated' }}:</th>
                    <td style="font-weight: bold;">₨ {{ number_format($totalCompensationCalculated, 2) }}</td>
                </tr>
                <tr>
                    <th>{{ app()->getLocale() === 'si' ? 'මුදා හරින ලද මුළු ගෙවීම්' : 'Total Disbursed Payments' }}:</th>
                    <td style="font-weight: bold; color: #047857;">₨ {{ number_format($totalDisbursedPayments, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    
    <div class="footer" style="font-family: {{ app()->getLocale() === 'si' ? 'notosanssinhala, sans-serif' : 'Times New Roman, serif' }};">
        <div>{{ __('messages.Land_Acquisition_Management_System') }}</div>
        <div>{{ __('messages.confidential_page') }} 1</div>
    </div>

</body>

</html>