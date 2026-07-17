<?php

namespace App\Services;

use App\Exports\GenericExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;

class ExportService
{
    public function export(
        Collection $data,
        array $headings,
        string $filename,
        string $format,
        ?string $pdfView = null,
        array $pdfData = []
    ) {
        return match ($format) {
            'csv' => $this->toCsv($data, $headings, $filename),
            'excel' => $this->toExcel($data, $headings, $filename),
            'pdf' => $this->toPdf($pdfView, $pdfData, $filename),
            default => abort(400, 'Unsupported export format'),
        };
    }

    protected function toCsv(Collection $data, array $headings, string $filename)
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename.csv\"",
        ];

        $callback = function () use ($data, $headings) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headings);

            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    protected function toExcel(Collection $data, array $headings, string $filename)
    {
        return Excel::download(new GenericExport($data, $headings), "$filename.xlsx");
    }

    protected function toPdf(?string $view, array $data, string $filename)
    {
        if (! $view) {
            abort(500, 'PDF view not specified');
        }

        $pdf = Pdf::loadView($view, $data)->setPaper('a4', 'portrait');

        return $pdf->download("$filename.pdf");
    }
}
