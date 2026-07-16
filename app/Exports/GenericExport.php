<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class GenericExport implements FromArray, WithHeadings
{
    public function __construct(
        protected Collection $data,
        protected array $headings
    ) {}

    public function array(): array
    {
        return $this->data->toArray();
    }

    public function headings(): array
    {
        return $this->headings;
    }
}
