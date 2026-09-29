<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ app()->getLocale() === 'si' ? 'අත්පත් කිරීමට යෝජිත ඉඩම පිළිබඳව විස්තර ප්‍රකාශය' : 'Statement of Particulars of the Land Proposed to be Acquired' }} &mdash; {{ $parcel->parcel_id }}</title>
    <style>
        @page {
            margin: 15mm 16mm 15mm 16mm;
        }

        body {
            font-family: 'notosanssinhala', sans-serif;
            color: #111111;
            font-size: 12pt;
            line-height: 1.55;
            margin: 0;
            padding: 0;
        }

        .document-title {
            text-align: center;
            font-size: 15.5pt;
            font-weight: bold;
            margin-top: 0;
            margin-bottom: 22px;
            letter-spacing: 0.3px;
        }

        .item-row {
            margin-bottom: 9px;
            font-size: 12pt;
            line-height: 1.52;
            text-align: justify;
        }

        .item-row-p2 {
            margin-bottom: 13px;
            font-size: 12pt;
            line-height: 1.55;
            text-align: justify;
        }

        .item-num {
            font-weight: normal;
        }

        .sub-note {
            font-size: 10pt;
            color: #2b2b2b;
            margin-top: 2px;
            margin-bottom: 9px;
            line-height: 1.4;
        }

        .boundary-table {
            margin-left: 28px;
            margin-top: 3px;
            margin-bottom: 3px;
            border-collapse: collapse;
            font-size: 12pt;
        }

        .boundary-table td {
            padding: 2px 0;
            vertical-align: top;
        }

        .boundary-label {
            width: 105px;
        }
    </style>
</head>

<body>

    <htmlpagefooter name="docFooter">
        <div style="text-align: right; font-size: 10pt; color: #222222; font-family: 'notosanssinhala', sans-serif;">
            {PAGENO} | P a g e
        </div>
    </htmlpagefooter>
    <sethtmlpagefooter name="docFooter" value="on" />

    @php
        $isSi = app()->getLocale() === 'si';
        $project = $parcel->project;

        // Institution & Purpose
        $institution = $project?->institution;
        $institutionAddress = $project?->institution_address;
        $purpose = $project?->purpose ?? ($project?->title ?? __('messages.n_a'));

        // Province
        $provinceVal = $parcel->province;
        if ($isSi) {
            $provinceDisplay = (empty($provinceVal) || strtolower($provinceVal) === 'southern') ? 'දකුණ' : $provinceVal;
        } else {
            $provinceDisplay = $provinceVal ?: 'Southern';
        }

        // District
        $districtDisplay = $parcel->district ?? __('messages.n_a');
        if ($isSi && !empty($parcel->district)) {
            $distMap = [
                'galle' => 'ගාල්ල',
                'matara' => 'මාතර',
                'hambantota' => 'හම්බන්තොට'
            ];
            $districtDisplay = $distMap[strtolower(trim($parcel->district))] ?? $parcel->district;
        }

        // Extent calculations
        $acresNum = (float)($parcel->land_size_acers ?? 0);
        $roodsNum = (float)($parcel->land_size_roods ?? 0);
        $perchesNum = (float)($parcel->land_size_perches ?? 0);

        $acresStr = ($acresNum == (int)$acresNum) ? (string)(int)$acresNum : (string)$acresNum;
        $roodsStr = ($roodsNum == (int)$roodsNum) ? (string)(int)$roodsNum : (string)$roodsNum;
        $perchesStr = ($perchesNum == (int)$perchesNum) ? (string)(int)$perchesNum : (string)$perchesNum;

        $totalAcres = $acresNum + ($roodsNum / 4) + ($perchesNum / 160);
        if ($totalAcres == 0 && !empty($parcel->full_land_size)) {
            $hectares = round((float)$parcel->full_land_size * 0.002529285, 4);
        } else {
            $hectares = round($totalAcres * 0.404686, 4);
        }
        $hectaresStr = number_format($hectares, 4);

        // Full land size
        if (!empty($parcel->full_land_size)) {
            $fullNum = (float)$parcel->full_land_size;
            $fullSizeStr = ($fullNum == (int)$fullNum) ? (string)(int)$fullNum : (string)$fullNum;
        } else {
            $fullSizeStr = $perchesStr ?: __('messages.n_a');
        }

        // Survey Plan / Parcel numbers
        $parcelLots = '';
        if (!empty($parcel->parcel_numbers)) {
            if (is_array($parcel->parcel_numbers)) {
                $parcelLots = implode(', ', $parcel->parcel_numbers);
            } else {
                $decoded = json_decode($parcel->parcel_numbers, true);
                $parcelLots = is_array($decoded) ? implode(', ', $decoded) : (string)$parcel->parcel_numbers;
            }
        }

        if ($parcel->has_plan && !empty($parcel->plan_number)) {
            if ($isSi) {
                $planDetails = 'පිඹුරු අංක ' . $parcel->plan_number . (!empty($parcelLots) ? ' ඉඩම් කැබලි අංක ' . $parcelLots : '');
            } else {
                $planDetails = 'Plan No. ' . $parcel->plan_number . (!empty($parcelLots) ? ' Land Parcel No. ' . $parcelLots : '');
            }
        } else {
            $planDetails = $isSi ? 'නැත' : 'None';
        }

        // Resided by & Housing details
        if ($parcel->has_residential_houses) {
            $residedBySi = $parcel->is_resident_owner ? 'ඉඩම් හිමියා' : 'කුලී නිවැසියන්';
            $residedByEn = $parcel->is_resident_owner ? 'Land owner' : 'Tenants';

            $residentList = [];
            if ($parcel->residents && count($parcel->residents) > 0) {
                foreach ($parcel->residents as $res) {
                    $residentList[] = trim($res->name . ' - ' . $res->address);
                }
            } elseif ($parcel->is_resident_owner && $parcel->owners && count($parcel->owners) > 0) {
                foreach ($parcel->owners as $owner) {
                    $residentList[] = trim($owner->name . ' - ' . $owner->address);
                }
            }
            $residentDetailsSi = count($residentList) > 0 ? implode('; ', $residentList) : 'නැත';
            $residentDetailsEn = count($residentList) > 0 ? implode('; ', $residentList) : 'None';

            $relocationPlanSi = $project?->are_residents_moved_temp ? 'විකල්ප වාසස්ථාන සැපයීමට විධිවිධාන යොදා ඇත' : 'නැත';
            $relocationPlanEn = $project?->are_residents_moved_temp ? 'Arrangements made to provide alternative housing' : 'No';
        } else {
            $residedBySi = 'නැත';
            $residedByEn = 'No';
            $residentDetailsSi = 'නැත';
            $residentDetailsEn = 'No';
            $relocationPlanSi = 'වාසස්ථාන අහිමි නොවේ';
            $relocationPlanEn = 'Residences will not be lost';
        }

        // Cultivation details
        if ($parcel->is_cultivated && !empty($parcel->cultivation)) {
            $cultivationTypeSi = $parcel->cultivation;
            $cultivationTypeEn = $parcel->cultivation;
        } else {
            $cultivationTypeSi = 'වගාවක් නැත (මුඩුබිම්)';
            $cultivationTypeEn = 'No cultivation (Bare land)';
        }

        if ($parcel->is_cultivated) {
            $statusLabelsSi = ['fertile' => 'ඉතා සරු', 'mid' => 'මධ්‍ය', 'infertile' => 'නිසරු'];
            $statusLabelsEn = ['fertile' => 'Very fertile', 'mid' => 'Medium', 'infertile' => 'Infertile'];
            $cKey = strtolower($parcel->cultivation_status ?? '');
            $cultivationConditionSi = $statusLabelsSi[$cKey] ?? ($parcel->cultivation_status ?: 'මධ්‍ය');
            $cultivationConditionEn = $statusLabelsEn[$cKey] ?? ($parcel->cultivation_status ?: 'Medium');

            if (!empty($parcel->annual_income)) {
                $cultivationConditionSi .= ' (වාර්ෂික ආදායම: රු. ' . number_format($parcel->annual_income, 2) . ')';
                $cultivationConditionEn .= ' (Annual Income: LKR ' . number_format($parcel->annual_income, 2) . ')';
            }
        } else {
            $cultivationConditionSi = 'නැත';
            $cultivationConditionEn = 'None';
        }

        // Head of Branch / Signatory details
        $hobUser = $project?->hobApprovedBy;
        $hobRoleTitle = $isSi ? 'අංශ ප්‍රධානී (ඉඩම්)' : 'Head of Branch (Land)';
        $officerName = $hobUser?->name;

        $isGenericName = function(?string $name, string $roleTitle) {
            if (empty($name)) return true;
            $nameTrimmed = strtolower(trim($name));
            $titleTrimmed = strtolower(trim($roleTitle));
            $genericNames = [
                'head of branch', 'head of branch (land)', 'hob', 'hob officer', 'අංශ ප්‍රධානී', 'අංශ ප්‍රධානී (ඉඩම්)',
                'development officer', 'do', 'do officer', 'සංවර්ධන නිලධාරී',
                'administrative officer', 'ao', 'ao officer', 'පාලන නිලධාරී',
                'assistant secretary', 'as', 'as officer', 'සහකාර ලේකම්',
                'senior assistant secretary', 'sas', 'sas officer', 'ජ්‍යෙෂ්ඨ සහකාර ලේකම්',
                'secretary', 'sec', 'sec officer', 'ලේකම්',
                'system administrator', 'admin', 'admin user', 'test user'
            ];
            return $nameTrimmed === $titleTrimmed || in_array($nameTrimmed, $genericNames, true);
        };

        // Officers in Items 22 & 23
        $sec22Si = $project?->section22_secretary_recommendation;
        $sec22En = $project?->section22_secretary_recommendation;
        if (empty($sec22Si)) {
            if ($project?->submittedBy) {
                $sub = $project->submittedBy;
                $desig = $sub->designation;
                $sec22Si = $sub->name . ($desig ? ' - ' . $desig : '');
                $sec22En = $sub->name . ($desig ? ' - ' . $desig : '');
            } else {
                $sec22Si = __('messages.n_a');
                $sec22En = __('messages.n_a');
            }
        }

        $sec23Si = $project?->section23_valuation_recommendation;
        $sec23En = $project?->section23_valuation_recommendation;
        if (empty($sec23Si)) {
            if ($hobUser && strtolower($project?->hob_status ?? '') === 'approved') {
                $sec23Si = $hobUser->name . ' - ' . $hobRoleTitle;
                $sec23En = $hobUser->name . ' - ' . $hobRoleTitle;
            } else {
                $sec23Si = __('messages.n_a');
                $sec23En = __('messages.n_a');
            }
        }

        // Date
        $dateObj = $project?->approval_date ?? ($project?->created_at ?? now());
        $formattedDate = $dateObj ? $dateObj->format('Y-m-d') : date('Y-m-d');
    @endphp

    <!-- PAGE 1 -->
    <div class="document-title">
        {{ $isSi ? 'අත්පත් කිරීමට යෝජිත ඉඩම පිළිබඳව විස්තර ප්‍රකාශය' : 'Statement of Particulars of the Land Proposed to be Acquired' }}
    </div>

    <!-- 01 -->
    <div class="item-row">
        <span class="item-num">01. </span>{{ $isSi ? 'ඉඩම අවශ්‍ය වී ඇති ආයතනයේ නම:' : 'Name of the Institution requiring the land:' }}
        {{ $institution ?? __('messages.provincial_council') }}
    </div>

    <!-- 02 -->
    <div class="item-row">
        <span class="item-num">02. </span>{{ $isSi ? 'ඉඩම අත්කර ගැනීමට අවශ්‍ය වී ඇති කාරණය:' : 'Purpose for which the land is required to be acquired:' }}
        {{ $purpose }}
    </div>

    <!-- 03 -->
    <div class="item-row">
        <span class="item-num">03. </span>{{ $isSi ? 'පළාත:' : 'Province:' }}
        {{ $provinceDisplay }}
    </div>

    <!-- 04 -->
    <div class="item-row">
        <span class="item-num">04. </span>{{ $isSi ? 'දිස්ත්‍රික්කය:' : 'District:' }}
        {{ $districtDisplay }}
    </div>

    <!-- 05 -->
    <div class="item-row">
        <span class="item-num">05. </span>{{ $isSi ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාශය:' : 'Divisional Secretariat Division:' }}
        {{ $parcel->divisional_secretariat ?? ($parcel->division ?? __('messages.n_a')) }}
    </div>

    <!-- 06 -->
    <div class="item-row">
        <span class="item-num">06. </span>{{ $isSi ? 'ග්‍රාම නිලධාරී කොට්ඨාශය:' : 'Grama Niladhari Division:' }}
        {{ $parcel->grama_niladari_division ?? __('messages.n_a') }}
    </div>

    <!-- 07 -->
    <div class="item-row">
        <span class="item-num">07. </span>{{ $isSi ? 'ඉඩම පිහිටි ගමේ නම:' : 'Name of the village where the land is situated:' }}
        {{ $parcel->village ?? __('messages.n_a') }}
    </div>

    <!-- 08 -->
    <div class="item-row">
        <span class="item-num">08. </span>{{ $isSi ? 'අත්කර ගැනීමට යෝජනා කරන ඉඩමේ නම:' : 'Name of the land proposed to be acquired:' }}
        {{ $parcel->land_name ?? __('messages.n_a') }}
    </div>

    <!-- 09 -->
    <div class="item-row">
        <span class="item-num">09. </span>{{ $isSi ? 'අත්කර ගැනීමට යෝජනා කරන බිම් ප්‍රමාණය:' : 'Extent of land proposed to be acquired:' }}
        @if($isSi)
            අක්: .....{{ $acresStr }}..... රූ: .....{{ $roodsStr }}..... පර්: {{ $perchesStr }} (හෙක්ටයාර: {{ $hectaresStr }})
        @else
            Ac: .....{{ $acresStr }}..... R: .....{{ $roodsStr }}..... P: {{ $perchesStr }} (Hectares: {{ $hectaresStr }})
        @endif
    </div>

    <!-- 10 -->
    <div class="item-row">
        <span class="item-num">10. </span>{{ $isSi ? 'අත්කර ගැනීමට යෝජනා කරන බිම් කොටස ඇතුලත් මුළු ඉඩමේ ප්‍රමාණය:' : 'Extent of the entire land including the portion proposed to be acquired:' }}
        {{ $fullSizeStr }}
    </div>

    <!-- 11 -->
    <div class="item-row">
        <span class="item-num">11. </span>{{ $isSi ? 'අත්කර ගැනීමට යෝජිත බිම් කොටස වෙනුවෙන් දැනටමත් මිණුම් පිඹුරක් ඇත්නම් එම පිඹුරේ අංකය සහ අදාල ඉඩම් කැබලිවල අංක:' : 'If there is already a survey plan for the portion of land proposed to be acquired, the plan number and the numbers of relevant land parcels:' }}
        {{ $planDetails }}
    </div>
    <div class="sub-note">
        {{ $isSi ? '(එම ඉඩමේ මිණුම් පිඹුර අමුණා ඇත./මිණුම් පිඹුරක් නැත්නම් ඉඩමට ඇති ප්‍රවේශ මාර්ග සහිතව ඉඩමේ කටු සටහන ඉදිරිපත් කළ යුතුය.)' : '(The survey plan of the land is attached. / If there is no survey plan, a sketch of the land with access roads must be submitted.)' }}
    </div>

    <!-- 12 -->
    <div class="item-row">
        <span class="item-num">12. </span>{{ $isSi ? 'මිණුම් පිඹුරක් නැත්නම් අත්කර ගැනීමට යෝජිත ඉඩම් කොටසට මායිම්:' : 'If there is no survey plan, boundaries for the portion of land proposed to be acquired:' }}
        <table class="boundary-table">
            <tr>
                <td class="boundary-label">{{ $isSi ? 'උතුරට' : 'North' }}</td>
                <td>: {{ $parcel->boundaries_north ?? __('messages.n_a') }}</td>
            </tr>
            <tr>
                <td class="boundary-label">{{ $isSi ? 'නැගෙනහිරට' : 'East' }}</td>
                <td>: {{ $parcel->boundaries_east ?? __('messages.n_a') }}</td>
            </tr>
            <tr>
                <td class="boundary-label">{{ $isSi ? 'දකුණට' : 'South' }}</td>
                <td>: {{ $parcel->boundaries_south ?? __('messages.n_a') }}</td>
            </tr>
            <tr>
                <td class="boundary-label">{{ $isSi ? 'බටහිරට' : 'West' }}</td>
                <td>: {{ $parcel->boundaries_west ?? __('messages.n_a') }}</td>
            </tr>
        </table>
    </div>

    <!-- 13 -->
    <div class="item-row">
        <span class="item-num">13. </span>{{ $isSi ? 'ඉඩමට හිමිකම් කියන්නන්ගේ නම් සහ ලිපිනයන්:' : 'Names and addresses of claimants to the land:' }}
        @if($parcel->owners && count($parcel->owners) > 0)
            @foreach($parcel->owners as $owner)
                @if($loop->first)
                    {{ $owner->name }}
                    @if($owner->address)
                        <div style="padding-left: 24px;">{{ $owner->address }}</div>
                    @endif
                @else
                    <div style="margin-top: 3px;">{{ $owner->name }}</div>
                    @if($owner->address)
                        <div style="padding-left: 24px;">{{ $owner->address }}</div>
                    @endif
                @endif
            @endforeach
        @else
            {{ __('messages.n_a') }}
        @endif
    </div>

    <!-- 14 -->
    <div class="item-row">
        <span class="item-num">14. </span>{{ $isSi ? 'අත්කර ගැනීමට යෝජිත කොටසේ පදිංචි නිවාස පිහිටා තිබේ ද? :' : 'Are there residential houses situated in the portion proposed to be acquired? :' }}
        {{ $parcel->has_residential_houses ? ($isSi ? 'ඔව්' : 'Yes') : ($isSi ? 'නැත' : 'No') }}
    </div>

    <!-- 15 -->
    <div class="item-row">
        <span class="item-num">15. </span>{{ $isSi ? 'එසේ තිබේ නම් එම නිවාසවල පදිංචිව ඇත්තේ ඉඩම් හිමියාද?/කුලී නිවැසියන් ද?,' : 'If so, are those houses resided in by the land owner? / tenants?,' }}
        {{ $isSi ? $residedBySi : $residedByEn }}
    </div>

    <!-- 16 -->
    <div class="item-row">
        <span class="item-num">16. </span>{{ $isSi ? 'නිවාස හිමියාගේ/කුලී නිවැසියන්ගේ සහ ලිපිනයන්:' : 'Names and addresses of the house owner / tenants:' }}
        {{ $isSi ? $residentDetailsSi : $residentDetailsEn }}
    </div>

    <!-- 17 -->
    <div class="item-row">
        <span class="item-num">17. </span>{{ $isSi ? 'යෝජිත ඉඩම අත්කර ගැනීමෙන් වාසස්ථාන අහිමි වන අය සඳහා විකල්ප වාසස්ථාන සැපයීමට යොදා ඇති පිළිවෙළක් තිබේද' : 'Is there an arrangement made to provide alternative housing for those losing residences due to the acquisition of the proposed land?' }}
        {{ $isSi ? $relocationPlanSi : $relocationPlanEn }}
    </div>

    <!-- 18 -->
    <div class="item-row">
        <span class="item-num">18. </span>{{ $isSi ? 'ඉඩමේ වගාව කුමක් ද?' : 'What is the cultivation on the land?' }}
        {{ $isSi ? $cultivationTypeSi : $cultivationTypeEn }}
    </div>

    <!-- 19 -->
    <div class="item-row">
        <span class="item-num">19. </span>{{ $isSi ? 'වගාවේ තත්ත්වය කුමක් ද?(ඉතා සරු/මධ්‍ය/නිසරු) යනුවෙන් සඳහන් කරන්න:' : 'What is the condition of the cultivation? State as (Very fertile / Medium / Infertile):' }}
        {{ $isSi ? $cultivationConditionSi : $cultivationConditionEn }}
    </div>
    <div class="sub-note">
        {{ $isSi ? '(හැකි සෑම විටම වගාව අනුව වාර්ෂික පලදාව සඳහන් කරන්න.)' : '(State annual yield according to cultivation whenever possible.)' }}
    </div>

    <!-- PAGE BREAK -->
    <pagebreak />

    <!-- PAGE 2 -->
    <!-- 20 -->
    <div class="item-row-p2">
        <span class="item-num">20. </span>{{ $isSi ? 'යෝජිත ඉඩම,ඉඩම් ප්‍රතිසංස්කරණ පනත යටතේ ඉඩම් හිමියන්ට පවරා කරන ලද ව්‍යවස්ථාපිත නිගමනයන්ට ඇතුලත් ඉඩමක් ද යන වග:' : 'Whether the proposed land is a land included in statutory determinations made in vesting in land owners under the Land Reform Act:' }}
        {{ !is_null($project?->section20_observation) ? ($project->section20_observation ? ($isSi ? 'ඔව්' : 'Yes') : ($isSi ? 'නැත' : 'No')) : ($isSi ? 'නැත' : 'No') }}
    </div>

    <!-- 21 -->
    <div class="item-row-p2">
        <span class="item-num">21. </span>{{ $isSi ? 'යෝජිත පොදු කටයුතු සඳහා විකල්ප වශයෙන් යොදා ගත හැකි රජයේ ඉඩම් හෝ ඉඩම් ප්‍රතිසංස්කරණ කොමිෂන් සභාව සතු ඉඩම් තිබේද?(එසේ නම් එම ඉඩමේ පිහිටීම,බිමේ තැනිතලා ස්වභාවය ආදිය සඳහන් කළ යුතු ය.)' : 'Whether there are alternative State lands or lands belonging to the Land Reform Commission that can be utilized for the proposed public purpose? (If so, location, flatness of land, etc. should be stated.):' }}
        {{ !is_null($project?->section21_secretary_report) ? ($project->section21_secretary_report ? ($isSi ? 'ඔව්' : 'Yes') : ($isSi ? 'නැත' : 'No')) : ($isSi ? 'නැත' : 'No') }}
    </div>

    <!-- 22 -->
    <div class="item-row-p2">
        <span class="item-num">22. </span>{{ $isSi ? 'යෝජිත පොදු කාර්යය සඳහා මෙම ඉඩම සුදුසු බවට තෝරා ගත් නිලධාරියාගේ නම සහ තරාතිරම :' : 'Name and designation of the officer who selected this land as suitable for the proposed public purpose:' }}
        {{ $isSi ? $sec22Si : $sec22En }}
    </div>

    <!-- 23 -->
    <div class="item-row-p2">
        <span class="item-num">23. </span>{{ $isSi ? 'මෙම ඉඩම යෝජිත පොදු කාර්යය සඳහා අත්පත් කර ගැනීම සුදුසු බව බවට නිර්දේශ කරන ලද නිලධාරියාගේ නම සහ තරාතිරම:' : 'Name and designation of the officer who recommended that this land is suitable to be acquired for the proposed public purpose:' }}
        {{ $isSi ? $sec23Si : $sec23En }}
    </div>

    <!-- 24 -->
    <div class="item-row-p2">
        <span class="item-num">24. </span>{{ $isSi ? 'මේ සඳහා සුදුසු වෙනත් රජයේ හෝ පුද්ගලික ඉඩම් මෙම ප්‍රදේශයේ තිබේදැයි සොයා බලන ලද්දේද යන වග:' : 'Whether it was inquired if there are other suitable State or private lands in this area for this purpose:' }}
        {{ !is_null($project?->section24_decision_remarks) ? ($project->section24_decision_remarks ? ($isSi ? 'ඔව්' : 'Yes') : ($isSi ? 'නැත' : 'No')) : ($isSi ? 'ඔව්' : 'Yes') }}
    </div>

    <!-- 25 -->
    <div class="item-row-p2">
        <span class="item-num">25. </span>{{ $isSi ? 'අත්පත් කර ගැනීම සඳහා වන්දි ගෙවීම් ඇතුළු අනෙකුත් වියදම් දැරීමට අවශ්‍ය මුදල් වෙන් කරනු ලැබූ මාර්ගය පැහැදිලි සඳහන් කරන්න:' : 'Clearly specify the source of funds allocated to bear the expenses including compensation payments for acquisition:' }}
        {{ $project?->section25_additional_conditions ?? ($project?->institution ? $project->institution . ($isSi ? ' ප්‍රතිපාදන මඟින්' : ' funds') : __('messages.n_a')) }}
    </div>

    <!-- 26 -->
    <div class="item-row-p2">
        <span class="item-num">26. </span>{{ $isSi ? 'පොදු කටයුත්ත සඳහා යෝජිත ඉඩම් තෝරා ගැනීම, ප්‍රදේශයේ පොදු සංවර්ධන සැලැස්මට අනුකූල බවත් අදාල පළාත් පාලන ආයතනයේ / නගර නිර්මාණ සැලසුම් දෙපාර්තමේන්තුවේ හෝ අදාල ආයතනයේ එකඟත්වය ලබා ගත්තේ ද යන වග:' : 'Whether the selection of the proposed land for the public purpose complies with the general development plan of the area and whether consent was obtained from the relevant Local Authority / Urban Development Department or relevant institution:' }}
        {{ !is_null($project?->section26_final_recommendation) ? ($project->section26_final_recommendation ? ($isSi ? 'ඔව්' : 'Yes') : ($isSi ? 'නැත' : 'No')) : ($isSi ? 'නැත' : 'No') }}
    </div>

    <!-- 27 -->
    <div class="item-row-p2">
        <span class="item-num">27. </span>{{ $isSi ? 'අත්පත් කර ගැනීමට යෝජිත ඉඩමේ දළ වටිනාකම:' : 'Estimated value of the land proposed to be acquired:' }}
        {{ number_format($parcel->estimated_value ?? 0, 2) }}
    </div>

    <!-- SIGNATURE AND INSTITUTION SECTION -->
    <div style="margin-top: 50px; width: 100%;">
        <!-- Left: Date and Institution info -->
        <div style="width: 48%; float: left; font-size: 11.5pt; line-height: 1.55;">
            <div>{{ $isSi ? 'දිනය:' : 'Date:' }} {{ $formattedDate }}</div>
            @if($institution)
                <div style="margin-top: 5px;">{{ $institution }}</div>
            @endif
            @if($institutionAddress)
                <div>{!! nl2br(e($institutionAddress)) !!}</div>
            @endif
            <div style="font-size: 10pt; color: #333333; margin-top: 3px;">
                ({{ $isSi ? 'ආයතනයේ නම සහ ලිපිනය සඳහන් කරන්න' : 'State the name and address of the institution' }})
            </div>
        </div>

        <!-- Right: Head of Institution Signature block -->
        <div style="width: 48%; float: right; text-align: center; font-size: 11.5pt; line-height: 1.5;">
            <div style="letter-spacing: 1px; color: #333333;">..................................................</div>
            <div style="margin-top: 3px;">{{ $isSi ? 'ආයතන ප්‍රධානියාගේ අත්සන' : 'Signature of the Head of Institution' }}</div>

            <div style="height: 50px; margin: 4px 0; text-align: center;">
                @if($hobUser && !empty($hobUser->signature) && strtolower($project?->hob_status ?? '') === 'approved')
                    <img src="{{ $hobUser->signature }}" style="max-height: 46px; max-width: 170px; width: auto; height: auto;" alt="Signature" />
                @endif
            </div>

            @if($officerName && !$isGenericName($officerName, $hobRoleTitle))
                <div style="font-weight: bold;">{{ $officerName }}</div>
            @endif
            <div style="font-weight: bold;">{{ $hobRoleTitle }}</div>
            @if($institution)
                <div>{{ $institution }}</div>
            @endif
            @if($institutionAddress)
                <div>{!! nl2br(e($institutionAddress)) !!}</div>
            @endif
        </div>
        <div style="clear: both;"></div>
    </div>

</body>

</html>