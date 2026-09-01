<?php

namespace App\Http\Controllers;

use App\Models\Compensation;
use App\Models\LandParcel;
use App\Models\Payment;
use App\Models\Projects;
use App\Models\PropertyOwner;
use App\Services\ExportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get report data based on parameters.
     */
    public function getReportData(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $type = $request->query('type', 'project-progress');
        $data = $this->generateReportData($request, $type);

        return response()->json($data, 200);
    }

    /**
     * Export report data.
     */
    public function exportReport(Request $request, ExportService $exportService)
    {
        $type = $request->query('type', 'project-progress');
        $format = $request->query('format', 'pdf');

        $report = $this->generateReportData($request, $type);
        $filename = str_replace(' ', '_', strtolower($report['title'])).'_'.date('Ymd');

        if ($format === 'pdf') {
            return $exportService->export(
                data: collect([]), // PDF rendering uses view directly
                headings: [],
                filename: $filename,
                format: $format,
                pdfView: 'pdf.report',
                pdfData: $report
            );
        }

        // For Excel / CSV, flatten rows and write
        $collection = collect($report['raw_rows'] ?? []);

        return $exportService->export(
            data: $collection,
            headings: $report['headers'],
            filename: $filename,
            format: $format === 'excel' ? 'excel' : 'csv'
        );
    }

    /**
     * Generate report data structure.
     */
    protected function generateReportData(Request $request, string $type): array
    {
        $projectId = $request->query('project_id');
        $district = $request->query('district');
        $status = $request->query('status');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        // Resolve Project Name for PDF Header
        $projectName = 'All Projects';
        if ($projectId && $projectId !== 'All Projects') {
            $proj = Projects::find($projectId);
            if ($proj) {
                $projectName = $proj->project_id.' - '.$proj->title;
            }
        }

        $report = [
            'title' => 'Report',
            'subtitle' => 'Land Acquisition Management System',
            'date_from' => $dateFrom ?: 'All Dates',
            'date_to' => $dateTo ?: 'All Dates',
            'project_name' => $projectName,
            'district' => $district ?: 'All Districts',
            'status' => $status ?: 'All Statuses',
            'summary' => [],
            'headers' => [],
            'rows' => [],
            'raw_rows' => [], // Flat structure for excel export
            'chart_data' => [],
        ];

        switch ($type) {
            case 'project-progress':
                $report['title'] = 'Project Progress Report';
                $query = Projects::withCount('landParcels');

                if ($projectId && $projectId !== 'All Projects') {
                    $query->where('id', $projectId);
                }
                if ($dateFrom) {
                    $query->where('created_at', '>=', $dateFrom);
                }
                if ($dateTo) {
                    $query->where('created_at', '<=', $dateTo);
                }

                $projects = $query->get();

                // Compute overall stats
                $totalProjects = count($projects);
                $totalParcels = 0;
                $acquiredParcels = 0;

                $report['headers'] = ['Project ID', 'Title', 'Institution', 'Target Area (Acres)', 'Total Parcels', 'Status', 'Workflow Progress'];

                foreach ($projects as $project) {
                    $parcels = LandParcel::where('project_id', $project->id)->get();
                    $pCount = count($parcels);
                    $aCount = $parcels->where('status', 'acquired')->count();

                    $totalParcels += $pCount;
                    $acquiredParcels += $aCount;

                    $pct = $pCount > 0 ? round(($aCount / $pCount) * 100) : 0;
                    $statusText = $project->sec_status === 'approved' ? 'badge:success:Approved' : ($project->hob_status === 'pending' ? 'badge:warning:Pending' : 'badge:info:Active');

                    $report['rows'][] = [
                        $project->project_id,
                        $project->title,
                        $project->institution,
                        number_format($project->full_land_area_to_be_acquired, 2),
                        $pCount,
                        $statusText,
                        $pct.'% ('.$aCount.'/'.$pCount.' Acquired)',
                    ];

                    $report['raw_rows'][] = [
                        'Project ID' => $project->project_id,
                        'Title' => $project->title,
                        'Institution' => $project->institution,
                        'Target Area (Acres)' => $project->full_land_area_to_be_acquired,
                        'Total Parcels' => $pCount,
                        'Status' => $project->sec_status === 'approved' ? 'Approved' : 'Active',
                        'Workflow Progress' => $pct.'%',
                    ];

                    $report['chart_data'][] = [
                        'name' => $project->project_id,
                        'Total' => $pCount,
                        'Acquired' => $aCount,
                    ];
                }

                $report['summary'] = [
                    'Total Projects' => $totalProjects,
                    'Total Land Parcels' => $totalParcels,
                    'Acquired Parcels' => $acquiredParcels,
                    'Overall Progress' => $totalParcels > 0 ? round(($acquiredParcels / $totalParcels) * 100).'%' : '0%',
                ];
                break;

            case 'compensation':
                $report['title'] = 'Compensation Report';
                $query = Compensation::with(['landParcel.project', 'owner']);

                if ($projectId && $projectId !== 'All Projects') {
                    $query->whereHas('landParcel', function ($q) use ($projectId) {
                        $q->where('project_id', $projectId);
                    });
                }
                if ($district && $district !== 'All Districts') {
                    $query->whereHas('landParcel', function ($q) use ($district) {
                        $q->where('district', $district);
                    });
                }
                if ($status && $status !== 'All Statuses') {
                    $query->where('status', strtolower($status));
                }
                if ($dateFrom) {
                    $query->where('approved_date', '>=', $dateFrom);
                }
                if ($dateTo) {
                    $query->where('approved_date', '<=', $dateTo);
                }

                $compensations = $query->get();
                $totalAmount = $compensations->sum('amount');
                $paidAmount = $compensations->where('status', 'paid')->sum('amount');

                $report['headers'] = ['Compensation ID', 'Owner Name', 'NIC', 'Parcel Code', 'Project', 'Approved Date', 'Amount (LKR)', 'Status'];

                foreach ($compensations as $comp) {
                    $parcelCode = $comp->landParcel ? $comp->landParcel->parcel_id : '-';
                    $projTitle = ($comp->landParcel && $comp->landParcel->project) ? $comp->landParcel->project->title : '-';
                    $statusText = $comp->status === 'paid' ? 'badge:success:Paid' : 'badge:warning:Pending';

                    $report['rows'][] = [
                        $comp->compensation_id,
                        $comp->owner ? $comp->owner->name : 'N/A',
                        $comp->owner ? $comp->owner->nic : 'N/A',
                        $parcelCode,
                        $projTitle,
                        $comp->approved_date ?: '-',
                        number_format($comp->amount, 2),
                        $statusText,
                    ];

                    $report['raw_rows'][] = [
                        'Compensation ID' => $comp->compensation_id,
                        'Owner Name' => $comp->owner ? $comp->owner->name : 'N/A',
                        'NIC' => $comp->owner ? $comp->owner->nic : 'N/A',
                        'Parcel Code' => $parcelCode,
                        'Project' => $projTitle,
                        'Approved Date' => $comp->approved_date ?: '-',
                        'Amount (LKR)' => $comp->amount,
                        'Status' => ucfirst($comp->status),
                    ];
                }

                $report['chart_data'] = [
                    ['name' => 'Paid', 'value' => (float) $paidAmount],
                    ['name' => 'Pending', 'value' => (float) ($totalAmount - $paidAmount)],
                ];

                $report['summary'] = [
                    'Total Approved Awards' => count($compensations),
                    'Total Compensation Value' => 'LKR '.number_format($totalAmount, 2),
                    'Total Paid' => 'LKR '.number_format($paidAmount, 2),
                    'Disbursed Ratio' => $totalAmount > 0 ? round(($paidAmount / $totalAmount) * 100).'%' : '0%',
                ];
                break;

            case 'owner':
                $report['title'] = 'Affected Owners Report';
                $query = PropertyOwner::with(['landParcels.project', 'compensations']);

                if ($projectId && $projectId !== 'All Projects') {
                    $query->whereHas('landParcels', function ($q) use ($projectId) {
                        $q->where('project_id', $projectId);
                    });
                }
                if ($district && $district !== 'All Districts') {
                    $query->whereHas('landParcels', function ($q) use ($district) {
                        $q->where('district', $district);
                    });
                }

                $owners = $query->get();
                $totalAwards = 0;

                $report['headers'] = ['Owner ID', 'Name', 'NIC', 'Address', 'Contact', 'Parcels Owned', 'Total Award (LKR)'];

                foreach ($owners as $owner) {
                    $parcels = $owner->landParcels;
                    $parcelNames = $parcels->map(fn ($p) => $p->parcel_id)->implode(', ');
                    $sumComp = $owner->compensations->sum('amount');
                    $totalAwards += $sumComp;

                    $report['rows'][] = [
                        $owner->owner_id,
                        $owner->name,
                        $owner->nic,
                        $owner->address,
                        $owner->contact,
                        $parcelNames ?: '-',
                        number_format($sumComp, 2),
                    ];

                    $report['raw_rows'][] = [
                        'Owner ID' => $owner->owner_id,
                        'Name' => $owner->name,
                        'NIC' => $owner->nic,
                        'Address' => $owner->address,
                        'Contact' => $owner->contact,
                        'Parcels Owned' => $parcelNames ?: '-',
                        'Total Award (LKR)' => $sumComp,
                    ];

                    if ($sumComp > 0) {
                        $report['chart_data'][] = [
                            'name' => $owner->name,
                            'value' => (float) $sumComp,
                        ];
                    }
                }

                $report['summary'] = [
                    'Total Affected Owners' => count($owners),
                    'Total Compensations Payout' => 'LKR '.number_format($totalAwards, 2),
                ];
                break;

            case 'parcel':
                $report['title'] = 'Land Parcel Status Report';
                $query = LandParcel::with('project');

                if ($projectId && $projectId !== 'All Projects') {
                    $query->where('project_id', $projectId);
                }
                if ($district && $district !== 'All Districts') {
                    $query->where('district', $district);
                }
                if ($status && $status !== 'All Statuses') {
                    $query->where('status', strtolower($status));
                }
                if ($dateFrom) {
                    $query->where('created_at', '>=', $dateFrom);
                }
                if ($dateTo) {
                    $query->where('created_at', '<=', $dateTo);
                }

                $parcels = $query->get();
                $totalVal = $parcels->sum('estimated_value');

                $report['headers'] = ['Parcel ID', 'Land Name', 'Village', 'District', 'Extent (Acres)', 'Est. Value (LKR)', 'Land Type', 'Status'];

                foreach ($parcels as $parcel) {
                    $statusText = $parcel->status === 'acquired' ? 'badge:success:Acquired' : ($parcel->status === 'pending' ? 'badge:warning:Pending' : 'badge:info:Available');

                    $report['rows'][] = [
                        $parcel->parcel_id,
                        $parcel->land_name || 'Unnamed',
                        $parcel->village,
                        $parcel->district,
                        $parcel->land_size_acers ?: '0',
                        number_format($parcel->estimated_value, 2),
                        $parcel->land_type ?: 'Standard',
                        $statusText,
                    ];

                    $report['raw_rows'][] = [
                        'Parcel ID' => $parcel->parcel_id,
                        'Land Name' => $parcel->land_name || 'Unnamed',
                        'Village' => $parcel->village,
                        'District' => $parcel->district,
                        'Extent (Acres)' => $parcel->land_size_acers ?: 0,
                        'Est. Value (LKR)' => $parcel->estimated_value,
                        'Land Type' => $parcel->land_type ?: 'Standard',
                        'Status' => ucfirst($parcel->status),
                    ];
                }

                $report['chart_data'] = [
                    ['name' => 'Acquired', 'value' => $parcels->where('status', 'acquired')->count()],
                    ['name' => 'Pending', 'value' => $parcels->where('status', 'pending')->count()],
                    ['name' => 'Available', 'value' => $parcels->where('status', 'available')->count()],
                ];

                $report['summary'] = [
                    'Total Land Parcels' => count($parcels),
                    'Acquired Parcels' => $parcels->where('status', 'acquired')->count(),
                    'Pending Parcels' => $parcels->where('status', 'pending')->count(),
                    'Total Estimated Value' => 'LKR '.number_format($totalVal, 2),
                ];
                break;

            case 'financial':
                $report['title'] = 'Financial Report';

                // Summarize based on payments
                $payQuery = Payment::with('compensation.landParcel');
                if ($projectId && $projectId !== 'All Projects') {
                    $payQuery->whereHas('compensation.landParcel', function ($q) use ($projectId) {
                        $q->where('project_id', $projectId);
                    });
                }
                if ($dateFrom) {
                    $payQuery->where('payment_date', '>=', $dateFrom);
                }
                if ($dateTo) {
                    $payQuery->where('payment_date', '<=', $dateTo);
                }

                $payments = $payQuery->get();
                $totalPaid = $payments->sum('amount_paid');

                $report['headers'] = ['Payment Reference', 'Bank Name', 'Account Number', 'Payment Method', 'Payment Date', 'Amount Paid (LKR)', 'Status'];

                foreach ($payments as $pay) {
                    $statusText = $pay->status === 'completed' ? 'badge:success:Completed' : 'badge:warning:Pending';

                    $report['rows'][] = [
                        $pay->payment_reference,
                        $pay->bank_name ?: '-',
                        $pay->account_number ?: '-',
                        ucfirst($pay->payment_method),
                        $pay->payment_date ? $pay->payment_date->format('Y-m-d') : '-',
                        number_format($pay->amount_paid, 2),
                        $statusText,
                    ];

                    $report['raw_rows'][] = [
                        'Payment Reference' => $pay->payment_reference,
                        'Bank Name' => $pay->bank_name ?: '-',
                        'Account Number' => $pay->account_number ?: '-',
                        'Payment Method' => ucfirst($pay->payment_method),
                        'Payment Date' => $pay->payment_date ? $pay->payment_date->format('Y-m-d') : '-',
                        'Amount Paid (LKR)' => $pay->amount_paid,
                        'Status' => ucfirst($pay->status),
                    ];
                }

                // Get Compensation data for totals
                $compQuery = Compensation::query();
                if ($projectId && $projectId !== 'All Projects') {
                    $compQuery->whereHas('landParcel', function ($q) use ($projectId) {
                        $q->where('project_id', $projectId);
                    });
                }
                $compTotal = $compQuery->sum('amount');

                // Compute bank distribution for charts
                $bankData = [];
                foreach ($payments as $p) {
                    $bank = $p->bank_name ?: 'Other';
                    if (! isset($bankData[$bank])) {
                        $bankData[$bank] = 0;
                    }
                    $bankData[$bank] += (float) $p->amount_paid;
                }
                foreach ($bankData as $bank => $total) {
                    $report['chart_data'][] = [
                        'name' => $bank,
                        'value' => $total,
                    ];
                }

                $report['summary'] = [
                    'Total Payments Executed' => count($payments),
                    'Total Compensation Value' => 'LKR '.number_format($compTotal, 2),
                    'Total Paid Value' => 'LKR '.number_format($totalPaid, 2),
                    'Budget Spent Ratio' => $compTotal > 0 ? round(($totalPaid / $compTotal) * 100).'%' : '0%',
                ];
                break;

            case 'legal':
                $report['title'] = 'Legal Case Report';

                // Fetch parcels where is_casehold is true
                $query = LandParcel::where('is_casehold', true)->with('project');

                if ($projectId && $projectId !== 'All Projects') {
                    $query->where('project_id', $projectId);
                }
                if ($district && $district !== 'All Districts') {
                    $query->where('district', $district);
                }
                if ($status && $status !== 'All Statuses') {
                    $query->where('case_status', strtolower($status));
                }

                $parcels = $query->get();

                $report['headers'] = ['Case Number', 'Parcel ID', 'Land Name', 'District', 'Case Start Date', 'Case End Date', 'Case Status', 'Remarks'];

                foreach ($parcels as $parcel) {
                    $statusText = $parcel->case_status === 'resolved' ? 'badge:success:Resolved' : 'badge:danger:Active';

                    $report['rows'][] = [
                        $parcel->case_number ?: '-',
                        $parcel->parcel_id,
                        $parcel->land_name || 'Unnamed',
                        $parcel->district,
                        $parcel->case_start_date ? $parcel->case_start_date->format('Y-m-d') : '-',
                        $parcel->case_end_date ? $parcel->case_end_date->format('Y-m-d') : '-',
                        $statusText,
                        $parcel->remarks ?: '-',
                    ];

                    $report['raw_rows'][] = [
                        'Case Number' => $parcel->case_number ?: '-',
                        'Parcel ID' => $parcel->parcel_id,
                        'Land Name' => $parcel->land_name || 'Unnamed',
                        'District' => $parcel->district,
                        'Case Start Date' => $parcel->case_start_date ? $parcel->case_start_date->format('Y-m-d') : '-',
                        'Case End Date' => $parcel->case_end_date ? $parcel->case_end_date->format('Y-m-d') : '-',
                        'Case Status' => ucfirst($parcel->case_status ?: 'Active'),
                        'Remarks' => $parcel->remarks ?: '-',
                    ];
                }

                $report['chart_data'] = [
                    ['name' => 'Active', 'value' => $parcels->where('case_status', 'active')->count() + $parcels->where('case_status', null)->count()],
                    ['name' => 'Resolved', 'value' => $parcels->where('case_status', 'resolved')->count()],
                ];

                $report['summary'] = [
                    'Total Legal Disputes' => count($parcels),
                    'Active Disputes' => $parcels->where('case_status', 'active')->count() + $parcels->where('case_status', null)->count(),
                    'Resolved Disputes' => $parcels->where('case_status', 'resolved')->count(),
                ];
                break;
        }

        return $report;
    }
}
