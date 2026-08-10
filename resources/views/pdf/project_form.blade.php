<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ __('messages.project_details') }} - {{ $project->project_id }}</title>
    <style>
        @page {
            margin: 60px 45px 70px 45px;
        }

        @if(app()->getLocale() === 'si')
        body {
            font-family: 'notosanssinhala', sans-serif;
            color: #1a1a1a;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        @else
        body {
            font-family: 'Times New Roman', 'Noto Serif', Georgia, serif;
            color: #1a1a1a;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        @endif

        .page-frame {
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

        .section-title {
            background-color: #f2f2f2;
            border: 1px solid #2d2d2d;
            font-weight: bold;
            text-transform: uppercase;
            padding: 4px 8px;
            margin-top: 15px;
            margin-bottom: 10px;
            font-size: 10px;
            letter-spacing: 0.5px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .data-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
            width: 30%;
            color: #2d2d2d;
        }

        .value {
            width: 70%;
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
                </tr>
            </table>
        </div>

        <div class="section-title">{{ __('messages.general_information') }}</div>
        <table class="data-table">
            <tr>
                <td class="label">{{ __('messages.project_id') }}:</td>
                <td class="value"><strong>{{ $project->project_id }}</strong></td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.title') }}:</td>
                <td class="value">{{ $project->title }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.purpose_of_acquisition') }}:</td>
                <td class="value">{{ $project->purpose }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.requesting_institution') }}:</td>
                <td class="value">{{ $project->institution ?? __('messages.n_a') }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.institution_address') }}:</td>
                <td class="value">{{ $project->institution_address ?? __('messages.n_a') }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.total_extent_to_acquire') }}:</td>
                <td class="value">
                    {{ $project->land_area_to_be_acquired_acers ?? 0 }} {{ __('messages.acres') }}, 
                    {{ $project->land_area_to_be_acquired_roods ?? 0 }} {{ __('messages.roods') }}, 
                    {{ $project->land_area_to_be_acquired_perches ?? 0 }} {{ __('messages.perches') }}
                    ({{ __('messages.total_extent_to_acquire') }}: {{ $project->full_land_area_to_be_acquired ?? 0 }} {{ __('messages.perches') }})
                </td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.temporary_relocation') }}:</td>
                <td class="value">{{ $project->are_residents_moved_temp ? __('messages.required') : __('messages.not_required') }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.status') }}:</td>
                <td class="value">{{ __('messages.' . strtolower($project->case_status ?: 'draft')) }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.approval_date') }}:</td>
                <td class="value">{{ $project->approval_date ? $project->approval_date->format('Y-m-d') : __('messages.n_a') }}</td>
            </tr>
            <tr>
                <td class="label">{{ __('messages.remarks') }}:</td>
                <td class="value">{{ $project->remarks ?? __('messages.n_a') }}</td>
            </tr>
        </table>

        <div class="section-title">{{ __('messages.legal_milestone_status') }}</div>
        <table class="data-table">
            <tr>
                <td class="label">Sec 20 Observation:</td>
                <td class="value">{{ $project->section20_observation ? __('messages.passed') : __('messages.pending') }}</td>
            </tr>
            <tr>
                <td class="label">Sec 21 Secretary Report:</td>
                <td class="value">{{ $project->section21_secretary_report ? __('messages.completed') : __('messages.pending') }}</td>
            </tr>
            <tr>
                <td class="label">Sec 22 Recommendation:</td>
                <td class="value">{{ in_array(strtolower($project->section22_secretary_recommendation), ['approved', 'pending', 'rejected']) ? __('messages.' . strtolower($project->section22_secretary_recommendation)) : ($project->section22_secretary_recommendation ?? __('messages.pending')) }}</td>
            </tr>
            <tr>
                <td class="label">Sec 23 Valuation Recommendation:</td>
                <td class="value">{{ in_array(strtolower($project->section23_valuation_recommendation), ['approved', 'pending', 'rejected']) ? __('messages.' . strtolower($project->section23_valuation_recommendation)) : ($project->section23_valuation_recommendation ?? __('messages.pending')) }}</td>
            </tr>
            <tr>
                <td class="label">Sec 24 Decision Remarks:</td>
                <td class="value">{{ $project->section24_decision_remarks ? __('messages.approved') : __('messages.pending') }}</td>
            </tr>
            <tr>
                <td class="label">Sec 25 Additional Conditions:</td>
                <td class="value">{{ in_array(strtolower($project->section25_additional_conditions), ['approved', 'pending', 'rejected']) ? __('messages.' . strtolower($project->section25_additional_conditions)) : ($project->section25_additional_conditions ?? __('messages.pending')) }}</td>
            </tr>
            <tr>
                <td class="label">Sec 26 Final Recommendation:</td>
                <td class="value">{{ $project->section26_final_recommendation ? __('messages.approved') : __('messages.pending') }}</td>
            </tr>
        </table>
    </div>
</div>

<div class="footer">
    {{ __('messages.Land_Acquisition_Management_System') }} &bull; {{ __('messages.confidential_page') }} 1
</div>

</body>
</html>
