<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>ඉඩම් අත්කර ගැනීමේ ඉල්ලුම් පත්‍රය (බී-3) &mdash; {{ $project->project_id }}</title>
    <style>
        @page {
            margin: 15mm 18mm 12mm 18mm;
        }

        body {
            font-family: 'notosanssinhala', sans-serif;
            color: #111111;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .header-table td {
            vertical-align: top;
            padding: 0;
        }

        .form-code-left {
            font-size: 17px;
            font-weight: bold;
        }

        .form-code-right {
            text-align: right;
            font-size: 14px;
            line-height: 1.4;
        }

        .recipient-box {
            margin-top: 10px;
            margin-bottom: 16px;
            font-size: 14px;
        }

        .document-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            line-height: 1.65;
            margin-top: 0;
            margin-bottom: 20px;
        }

        .clause-item {
            margin-bottom: 11px;
            font-size: 14px;
            line-height: 1.65;
            text-align: justify;
        }

        .clause-num {
            font-weight: bold;
            margin-right: 4px;
        }

        .sub-clause-box {
            margin-left: 30px;
            margin-top: 5px;
            margin-bottom: 5px;
            font-size: 14px;
            line-height: 1.7;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            font-size: 14px;
        }

        .signature-table td {
            vertical-align: top;
            padding: 0;
            font-size: 14px;
        }

        .date-ministry-table {
            width: 100%;
            margin-top: 20px;
            font-size: 14px;
        }

        .date-ministry-table td {
            font-size: 14px;
        }

        .footer-note {
            margin-top: 22px;
            border-top: 1px solid #777777;
            padding-top: 5px;
            font-size: 11px;
            color: #333333;
            line-height: 1.35;
        }
    </style>
</head>

<body>

    @php
        $projectTitleOrPurpose = $project->purpose ?: ($project->title ?: '');

        // Land names
        $parcels = $project->landParcels ?? collect([]);
        $landNamesList = $parcels->pluck('land_name')->filter()->unique();
        $landName = $landNamesList->isNotEmpty()
            ? $landNamesList->implode(', ')
            : ($parcels->pluck('parcel_id')->filter()->isNotEmpty() ? $parcels->pluck('parcel_id')->implode(', ') : '');

        // Institution / Department
        $institutionName = $project->institution
            ?: ($project->department?->department_name ?: '');

        // Budget / Provision Note
        $budgetProvisionNote = $project->remarks
            ?: ($project->institution ? $project->institution . ' ප්‍රතිපාදන මත' : '');

        // Total estimated cost
        $totalEstimatedCost = $parcels->sum(function($p) {
            return (float) ($p->estimated_value ?? 0);
        });
        if ($totalEstimatedCost <= 0) {
            $totalEstimatedCost = $parcels->sum(function($p) {
                return (float) ($p->valuations?->sum('total_valuation') ?? 0);
            });
        }

        // Advance amount (25% statutory advance)
        $advanceAmount = $totalEstimatedCost > 0 ? ($totalEstimatedCost * 0.25) : 0;

        // Divisional Secretariat
        $divisionalSecretariat = $parcels->pluck('divisional_secretariat')->filter()->first()
            ?? ($parcels->pluck('division')->filter()->first() ?? '');

        // Officer details (DO / Submitter)
        $submitter = $project->submittedBy;
        $officerName = $submitter?->name ?? '';
        $roleName = $submitter?->role?->role_name ?? '';
        $officerDesignation = $submitter?->role?->description ?? ($roleName === 'DO' ? 'සංවර්ධන නිලධාරී' : ($roleName ?: ''));
        $officerAddress = $project->institution_address ?: '';
    @endphp

    <table class="header-table">
        <tr>
            <td class="form-code-left">
                බී-3
            </td>
            <td class="form-code-right">
                යොමු අංක:- {{ $project->project_id }}
            </td>
        </tr>
    </table>

    <div class="recipient-box">
        ඉඩම් හා ඉඩම් සංවර්ධන අමාත්‍යාංශයේ ලේකම් වෙත,
    </div>

    <div class="document-title">
        ඉඩම් අත්කර ගැනීමේ පනතේ (460 වැනි පරිච්ඡේදය)යටතේ<br>
        දකුණු පළාත් සභාවේ කටයුත්තක් සඳහා <u>{!! !empty($projectTitleOrPurpose) ? e($projectTitleOrPurpose) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u> සඳහා<br>
        <u>{!! !empty($landName) ? e($landName) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u> ඉඩම අත්කර ගැනීමේ ඉල්ලුම් පත්‍රය*
    </div>

    <div class="clause-item">
        <span class="clause-num">01.</span>
        මෙයට අමුණා ඇති විස්තර ප්‍රකාශයේ සඳහන් ඉඩම/ඉඩම් දකුණු පළාත් සභාවේ <u>{!! !empty($institutionName) ? e($institutionName) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u> සඳහා (පළාත් සභා අමාත්‍යාංශයේ/දෙපාර්තමේන්තුවේ/ප්‍රාදේශීය සභාවේ නම සඳහන් කරන්න) අත්පත් කර ගැනීමට අවශ්‍ය වී ඇත.
    </div>

    <div class="clause-item">
        <span class="clause-num">02.</span>
        මෙම ඉඩම පළාත් සභාවේ කටයුතු සඳහා ප්‍රයෝජනයට ගැනීමට අත්පත් කර ගැනීම සඳහා මු.රෙ.53 යටතේ මහා භාණ්ඩාගාරයේ අයවැය අධ්‍යක්ෂගේ අනුමැතිය දී ඇති ලිපිය මෙයට යා කර එවමි.(අදාල වේ නම් පමණි) <u>{!! !empty($budgetProvisionNote) ? e($budgetProvisionNote) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u>
    </div>

    <div class="clause-item">
        <span class="clause-num">03.</span>
        මෙම අත්පත් කර ගැනීම සඳහා ඇස්තමේන්තු කරන ලද මුළු පිරිවැය රු. <strong>{{ $totalEstimatedCost > 0 ? number_format($totalEstimatedCost, 2) : '....................................' }}</strong> ක් වේ. එම මුදල, වන්දි තීරණය කිරීමේදී වැඩිවිය හැකි මුදල, පොලී ගෙවීමට සිදුවේ නම් එම මුදල දකුණු පළාත් සභාවේ / ප්‍රාදේශීය සභාවේ අරමුදල් වලින් වැය කිරීමට දකුණු පළාත් සභාවේ ප්‍රධාන ලේකම් /ප්‍රාදේශීය සභාවේ සභාපති විසින් එකඟත්වය පලකර ඇත. අත්තිකාරමක් වශයෙන් රු. <strong>{{ $advanceAmount > 0 ? number_format($advanceAmount, 2) : '....................................' }}</strong> ක් <u>{!! !empty($divisionalSecretariat) ? e($divisionalSecretariat) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u> ප්‍රාදේශීය ලේකම් වෙත තැන්පත් කර ඇත. කූ.අංක ........................
    </div>

    <div class="clause-item">
        <span class="clause-num">04.</span>
        ඉඩම් අත්කර ගැනීමේ පනත යටතේ අත්කර ගැනීම් සඳහා වන අනෙකුත් වියදම් (පුවත්පත් දැන්වීම්,මිනුම් ගාස්තු ආදිය) <u>{!! !empty($institutionName) ? e($institutionName) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u> න් අය කර ගත යුතුය.(ආයතනය සඳහන් කරන්න)
    </div>

    <div class="clause-item">
        <span class="clause-num">05.</span>
        මෙය පරිත්‍යාගයක්.පරිත්‍යාග කරන පුද්ගලයා විසින් නොතාරිස්වරයකු ලවා සහතික කර ඇති තෑගි ඔප්පුවේ පිටපත් මෙයට අමුණා ඇත. ඉඩම් අත්කර ගැනීමේ පනත යටතේ කටයුතු කිරීමට අවශ්‍ය වී ඇත්තේ පරිත්‍යාගය නියමානුකූල කිරීම සඳහාය.
    </div>

    <div class="clause-item">
        <span class="clause-num">06.</span>
        අත්කර ගැනීමට යෝජිත ඉඩමේ /ඉඩම්වල පිඹුරු සකස් කිරීම සඳහා අනෙකුත් පරීක්ෂණ කටයුතු වලදී ඉඩමේ මායිම් පෙන්වා දීම පහත සඳහන් නිලධාරියා විසින් කරනු ලැබේ.
        <div class="sub-clause-box">
            (අ) නිලධාරියාගේ නම :- <u>{!! !empty($officerName) ? e($officerName) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u><br>
            (ආ) තනතුර :- <u>{!! !empty($officerDesignation) ? e($officerDesignation) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u><br>
            (ඇ) ලිපිනය :- <u>{!! !empty($officerAddress) ? e($officerAddress) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' !!}</u>
        </div>
    </div>

    <div class="clause-item">
        <span class="clause-num">07.</span>
        පළාත් සභාව විසින් අත්පත් කර ගැනීමට යෝජිත ඉඩම්වල,යොදාගනු ලබන විෂයය සම්බන්ධ ජාතික ප්‍රතිපත්තිය තීරණය කරනු ලබන්නේ මාගේ අමාත්‍යාංශයෙන් බවද සහතික කරමි.
    </div>

    <table class="signature-table">
        <tr>
            <td style="width: 50%;"></td>
            <td style="width: 50%; text-align: center;">
                ....................................................................<br>
                <strong>ලේකම්</strong>
            </td>
        </tr>
    </table>

    <table class="date-ministry-table">
        <tr>
            <td style="width: 40%; vertical-align: bottom;">
                දිනය: {{ !empty($project->approval_date) ? $project->approval_date->format('Y/m/d') : '...........................................' }}
            </td>
            <td style="width: 60%; text-align: right; vertical-align: bottom;">
                .................................................................... අමාත්‍යාංශය
            </td>
        </tr>
    </table>

    <div class="footer-note">
        * පළාත් සභාවක පොදු කටයුත්තක් සඳහා ඉඩම් අත්කර ගැනීමේ අවශ්‍යතාවයකදී භාවිතා කිරීම සඳහා (උපදෙස් සඳහා පසුපිට බලන්න)
    </div>

</body>

</html>
