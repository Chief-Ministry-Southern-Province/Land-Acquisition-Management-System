import { Link, router } from '@inertiajs/react';
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { createCompensation } from '@/services/compensationService';
import { getLandParcels } from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';
import { getPropertyOwners } from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

export default function CalculateCompensation() {
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [selectedParcelId, setSelectedParcelId] = useState<string>('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [compensationRef, setCompensationRef] = useState<string>(
    () => `COMP-${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const [baseValuation, setBaseValuation] = useState<number>(0);
  const [statutoryRate, setStatutoryRate] = useState<number>(15); // 15% default statutory solatium
  const [disturbanceAllowance, setDisturbanceAllowance] = useState<number>(0);
  const [solatiumOther, setSolatiumOther] = useState<number>(0);
  const [approvedDate, setApprovedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [paymentDate, setPaymentDate] = useState<string>(() =>
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState<string>('pending');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [parcelData, ownerData] = await Promise.all([
          getLandParcels(),
          getPropertyOwners(),
        ]);
        setParcels(parcelData || []);
        setOwners(ownerData || []);
      } catch (err) {
        console.error('Failed to load calculation form options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // When parcel selection changes, prefill valuation & owner if linked
  const handleParcelChange = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    const parcel = parcels.find((p) => String(p.id) === String(parcelId));

    if (parcel) {
      if (parcel.estimated_value) {
        setBaseValuation(Number(parcel.estimated_value));
      }

      // If parcel has linked owners
      if (parcel.owners && parcel.owners.length > 0) {
        setSelectedOwnerId(String(parcel.owners[0].id));
      }
    }
  };

  // Live total calculation
  const statutoryAmount = (baseValuation * statutoryRate) / 100;
  const totalCalculatedAmount =
    baseValuation + statutoryAmount + disturbanceAllowance + solatiumOther;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedParcelId) {
      setErrorMessage('Please select a land parcel.');

      return;
    }

    if (!selectedOwnerId) {
      setErrorMessage('Please select a property owner.');

      return;
    }

    if (totalCalculatedAmount <= 0) {
      setErrorMessage('Compensation total must be greater than zero.');

      return;
    }

    setSubmitting(true);

    try {
      await createCompensation({
        owner_id: selectedOwnerId,
        land_parcel_id: selectedParcelId,
        compensation_id: compensationRef,
        amount: totalCalculatedAmount,
        approved_date: approvedDate,
        payment_date: paymentDate,
        status: status,
      });

      setSuccessMessage(
        'Compensation record calculated & created successfully!',
      );
      setTimeout(() => {
        router.visit('/compensation');
      }, 1500);
    } catch (err: any) {
      console.error('Compensation creation error:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to create compensation record. Please check inputs.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedParcel = parcels.find(
    (p) => String(p.id) === String(selectedParcelId),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/compensation"
          className="hover:bg-muted border-border rounded-lg border p-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1>Compensation Calculator</h1>
          <p className="text-muted-foreground">
            Calculate statutory land acquisition compensation, statutory
            additions, and disturbance allowances
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600">
          <Info className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground ml-2">
            Loading calculation options...
          </span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Main Calculation Inputs */}
          <div className="space-y-6 lg:col-span-2">
            {/* Step 1: Target Selection */}
            <div className="bg-card border-border space-y-4 rounded-lg border p-6">
              <h3 className="border-border flex items-center gap-2 border-b pb-3 text-lg font-semibold">
                <Calculator className="text-primary h-5 w-5" />
                1. Select Parcel & Owner
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Land Parcel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedParcelId}
                    onChange={(e) => handleParcelChange(e.target.value)}
                    required
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                  >
                    <option value="">-- Select Land Parcel --</option>
                    {parcels.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.parcel_id || `PAR-${p.id}`} -{' '}
                        {p.land_name || 'Land Parcel'} ({p.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Property Owner <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    required
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                  >
                    <option value="">-- Select Owner --</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.ownerId || o.nic || `OWN-${o.id}`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedParcel && (
                <div className="bg-muted/50 text-muted-foreground mt-2 space-y-1 rounded-md p-3 text-xs">
                  <p>
                    <span className="font-semibold">Location:</span>{' '}
                    {selectedParcel.village}, {selectedParcel.district}
                  </p>
                  <p>
                    <span className="font-semibold">Extent:</span>{' '}
                    {selectedParcel.land_size_acers || 0} Acres,{' '}
                    {selectedParcel.land_size_roods || 0} Roods,{' '}
                    {selectedParcel.land_size_perches || 0} Perches
                  </p>
                  {selectedParcel.estimated_value && (
                    <p>
                      <span className="font-semibold">
                        Estimated Market Value:
                      </span>{' '}
                      ₨{' '}
                      {Number(selectedParcel.estimated_value).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Formula Breakdown */}
            <div className="bg-card border-border space-y-4 rounded-lg border p-6">
              <h3 className="border-border flex items-center gap-2 border-b pb-3 text-lg font-semibold">
                <DollarSign className="text-primary h-5 w-5" />
                2. Compensation Breakdown Parameters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Base Land Valuation Amount (₨){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={baseValuation}
                    onChange={(e) => setBaseValuation(Number(e.target.value))}
                    required
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Verified valuation by Valuation Department
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Statutory Addition (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={statutoryRate}
                        onChange={(e) =>
                          setStatutoryRate(Number(e.target.value))
                        }
                        className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                      />
                      <span className="text-sm font-semibold">%</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Amount: ₨ {statutoryAmount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Disturbance / Severance (₨)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={disturbanceAllowance}
                      onChange={(e) =>
                        setDisturbanceAllowance(Number(e.target.value))
                      }
                      className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                    />
                    <p className="text-muted-foreground mt-1 text-xs">
                      Relocation, income disturbance, structures
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ex-Gratia / Other Solatium (₨)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={solatiumOther}
                    onChange={(e) => setSolatiumOther(Number(e.target.value))}
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Special compensation under Cabinet approval or Section 17
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Record Details */}
            <div className="bg-card border-border space-y-4 rounded-lg border p-6">
              <h3 className="border-border border-b pb-3 text-lg font-semibold">
                3. Record Reference & Dates
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Compensation ID Ref <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={compensationRef}
                    onChange={(e) => setCompensationRef(e.target.value)}
                    required
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 font-mono text-sm focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm capitalize focus:ring-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Approved Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={approvedDate}
                    onChange={(e) => setApprovedDate(e.target.value)}
                    required
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Target Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="bg-background border-border focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border-primary/30 sticky top-6 space-y-6 rounded-lg border p-6 shadow-md">
              <h3 className="border-border border-b pb-3 text-lg font-semibold">
                Calculation Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Base Land Value:
                  </span>
                  <span className="font-semibold">
                    ₨ {baseValuation.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Statutory ({statutoryRate}%):
                  </span>
                  <span className="font-semibold">
                    ₨ {statutoryAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disturbance:</span>
                  <span className="font-semibold">
                    ₨ {disturbanceAllowance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Solatium / Other:
                  </span>
                  <span className="font-semibold">
                    ₨ {solatiumOther.toLocaleString()}
                  </span>
                </div>

                <div className="border-border flex items-center justify-between border-t pt-3">
                  <span className="text-base font-bold">
                    Total Compensation:
                  </span>
                  <span className="text-primary text-xl font-extrabold">
                    ₨ {totalCalculatedAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 font-semibold shadow transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Record...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Save & Register Compensation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

CalculateCompensation.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
