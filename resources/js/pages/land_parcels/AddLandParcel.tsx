import MainLayout from '@/layouts/MainLayout';

export default function AddLandParcel() {
  return (
    <div>
      <p>Add Land Parcel</p>
    </div>
  );
}

AddLandParcel.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
